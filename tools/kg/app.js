/* ============================================================
 * 神经影像工具知识图谱 · 可视化交互
 * 数据：kg_data.json (nodes / links / triples / metadata)
 * 渲染：ECharts 力导向图
 * ============================================================ */

// ---- 实体类型元数据（颜色 + 中文标签 + 顺序）----
const TYPE_META = {
  disease: { label: "疾病", color: "#ef4444" },
  tool:    { label: "工具", color: "#37d8c5" },
  roi:     { label: "脑区", color: "#a78bfa" },
  task:    { label: "任务", color: "#60a5fa" },
  metric:  { label: "指标", color: "#fbbf24" },
  output:  { label: "输出", color: "#22d3ee" },
  input:   { label: "输入", color: "#94a3b8" },
  category:{ label: "类别", color: "#34d399" },
  modality:{ label: "模态", color: "#f472b6" },
};
const TYPE_ORDER = Object.keys(TYPE_META);

// ---- 状态 ----
let RAW = null;            // 原始数据
let chart = null;
let degree = new Map();    // node id -> 度数
let activeTypes = new Set(TYPE_ORDER);  // 当前显示的类型
let showAllLabels = false;
let focusMode = false;
let egoCenter = null;      // 聚焦模式下的中心节点 id
let searchTerm = "";
let currentSelected = null;

// ---- DOM ----
const $ = (s) => document.querySelector(s);
const graphEl = $("#graph");
const loadingEl = $("#loading");

// ---- 工具函数 ----
const cssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const isDark = () => document.documentElement.getAttribute("data-theme") !== "light";

function computeDegrees() {
  degree = new Map();
  for (const n of RAW.nodes) degree.set(n.id, 0);
  for (const l of RAW.links) {
    degree.set(l.source, (degree.get(l.source) || 0) + 1);
    degree.set(l.target, (degree.get(l.target) || 0) + 1);
  }
}

// ---- 统计卡片 ----
function renderStats() {
  const m = RAW.metadata;
  const items = [
    { v: m.node_count, k: "实体节点", c: TYPE_META.tool.color },
    { v: m.link_count, k: "三元组关系", c: TYPE_META.disease.color },
    { v: m.entity_types.disease || 0, k: "疾病", c: TYPE_META.disease.color },
    { v: m.entity_types.tool || 0, k: "分析工具", c: TYPE_META.tool.color },
    { v: m.entity_types.roi || 0, k: "脑区", c: TYPE_META.roi.color },
    { v: Object.keys(m.relation_types).length, k: "关系类型", c: TYPE_META.metric.color },
  ];
  $("#stats").innerHTML = items.map(it =>
    `<div class="stat" style="--c:${it.c}"><div class="v">${it.v}</div><div class="k">${it.k}</div></div>`
  ).join("");
}

// ---- 类型筛选 ----
function renderTypeGrid() {
  const grid = $("#typeGrid");
  grid.innerHTML = TYPE_ORDER.map(t => {
    const meta = TYPE_META[t];
    const n = RAW.metadata.entity_types[t] || 0;
    const on = activeTypes.has(t);
    return `<div class="type-toggle ${on ? "on" : "off"}" data-type="${t}" style="--tc:${meta.color}">
      <span class="dot" style="background:${meta.color}"></span>${meta.label}<span class="n">${n}</span>
    </div>`;
  }).join("");
  grid.querySelectorAll(".type-toggle").forEach(el => {
    el.addEventListener("click", () => {
      const t = el.dataset.type;
      if (activeTypes.has(t)) activeTypes.delete(t); else activeTypes.add(t);
      if (activeTypes.size === 0) activeTypes.add(t); // 至少保留一个
      egoCenter = null;
      renderTypeGrid();
      renderGraph();
    });
  });
}

// ---- 过滤可见节点/边 ----
function getVisible() {
  let nodes = RAW.nodes.filter(n => activeTypes.has(n.type));
  const visibleIds = new Set(nodes.map(n => n.id));

  // 聚焦模式：只保留中心节点 + 1 跳邻居
  if (focusMode && egoCenter) {
    const neighbors = new Set([egoCenter]);
    for (const l of RAW.links) {
      if (l.source === egoCenter) neighbors.add(l.target);
      if (l.target === egoCenter) neighbors.add(l.source);
    }
    nodes = nodes.filter(n => neighbors.has(n.id));
  }

  // 搜索：高亮匹配（不过滤，仅标记）
  const matchIds = new Set();
  if (searchTerm) {
    const q = searchTerm.toLowerCase();
    for (const n of nodes) {
      if (n.label.toLowerCase().includes(q) || n.type.includes(q)) matchIds.add(n.id);
    }
  }

  const ids = new Set(nodes.map(n => n.id));
  const links = RAW.links.filter(l => ids.has(l.source) && ids.has(l.target) && visibleIds.has(l.source) && visibleIds.has(l.target));
  return { nodes, links, matchIds };
}

// ---- 构造 ECharts option ----
function buildOption() {
  const { nodes, links, matchIds } = getVisible();
  const dark = isDark();

  const categories = TYPE_ORDER.map(t => ({ name: TYPE_META[t].label }));
  const typeIdx = Object.fromEntries(TYPE_ORDER.map((t, i) => [t, i]));

  const hasSearch = matchIds.size > 0;

  const echNodes = nodes.map(n => {
    const d = degree.get(n.id) || 1;
    const size = Math.max(14, Math.min(46, 12 + d * 2.2));
    const isMatch = hasSearch && matchIds.has(n.id);
    const isDim = hasSearch && !isMatch;
    const showLabel = showAllLabels || n.type === "disease" || n.type === "tool" || (n.type === "category" && false);
    return {
      id: n.id,
      name: n.label,
      value: d,
      category: typeIdx[n.type],
      symbolSize: size,
      itemType: n.type,
      rawType: n.type,
      nodeLabel: n.label,
      label: {
        show: showLabel && !isDim,
        position: "right",
        color: dark ? "#e6f1ef" : "#1f2937",
        fontSize: n.type === "disease" ? 12 : 11,
        fontWeight: 700,
        formatter: n.label,
      },
      itemStyle: {
        color: TYPE_META[n.type].color,
        opacity: isDim ? 0.18 : 1,
        borderColor: isMatch ? "#fff" : "transparent",
        borderWidth: isMatch ? 2.5 : 0,
        shadowBlur: isMatch ? 18 : 0,
        shadowColor: TYPE_META[n.type].color,
      },
    };
  });

  const echLinks = links.map(l => {
    const isMatch = hasSearch && (matchIds.has(l.source) || matchIds.has(l.target));
    const isDim = hasSearch && !isMatch;
    return {
      source: l.source,
      target: l.target,
      relation: l.relation,
      lineStyle: {
        color: dark ? "rgba(159,180,175,0.22)" : "rgba(90,110,120,0.22)",
        width: isMatch ? 1.6 : 0.8,
        opacity: isDim ? 0.06 : (isMatch ? 0.85 : 0.5),
        curveness: 0.14,
      },
    };
  });

  return {
    backgroundColor: "transparent",
    tooltip: {
      backgroundColor: dark ? "rgba(14,28,26,0.95)" : "rgba(255,255,255,0.96)",
      borderColor: dark ? "rgba(255,255,255,0.14)" : "rgba(15,30,50,0.14)",
      borderWidth: 1,
      textStyle: { color: dark ? "#e6f1ef" : "#1f2937", fontSize: 12, fontWeight: 600 },
      padding: [8, 12],
      formatter: (p) => {
        if (p.dataType === "node") {
          const n = p.data;
          const d = degree.get(n.id) || 0;
          const meta = TYPE_META[n.rawType];
          return `<b style="font-size:13px">${n.nodeLabel}</b>
            <br><span style="color:${meta.color}">●</span> ${meta.label} · 连接 ${d}`;
        }
        if (p.dataType === "edge") {
          return `<span style="color:var(--accent-dark)">${p.data.relation}</span>`;
        }
        return "";
      },
    },
    legend: { show: false },
    series: [{
      type: "graph",
      layout: "force",
      roam: true,
      draggable: true,
      categories,
      data: echNodes,
      links: echLinks,
      force: {
        repulsion: [180, 320],
        edgeLength: [38, 120],
        gravity: 0.08,
        friction: 0.6,
        layoutAnimation: true,
      },
      scaleLimit: { min: 0.4, max: 3.5 },
      label: { show: true },
      lineStyle: { color: "source" },
      emphasis: {
        focus: "adjacency",
        lineStyle: { width: 2.4, opacity: 1, color: cssVar("--accent") },
        label: { show: true, fontSize: 13, fontWeight: 800 },
        itemStyle: { shadowBlur: 20 },
      },
      select: { disabled: true },
      edgeSymbol: ["none", "none"],
    }],
  };
}

// ---- 渲染图谱 ----
function renderGraph() {
  const { nodes, links } = getVisible();
  $("#fNodes").textContent = nodes.length;
  $("#fLinks").textContent = links.length;
  chart.setOption(buildOption(), { notMerge: true });
  loadingEl.style.display = "none";
}

// ---- 节点详情面板 ----
function showDetail(nodeId) {
  const node = RAW.nodes.find(n => n.id === nodeId);
  if (!node) return;
  currentSelected = nodeId;
  const meta = TYPE_META[node.type];
  $("#detailSub").textContent = meta.label;

  // 找该节点参与的三元组
  const asHead = RAW.links.filter(l => l.source === nodeId);
  const asTail = RAW.links.filter(l => l.target === nodeId);
  const id2label = Object.fromEntries(RAW.nodes.map(n => [n.id, n.label]));
  const id2type = Object.fromEntries(RAW.nodes.map(n => [n.id, n.type]));

  // 属性
  const p = node.properties || {};
  const propRows = [];
  if (p.function) propRows.push(`<div class="row"><b>功能</b><span>${p.function}</span></div>`);
  if (p.evidence) propRows.push(`<div class="row"><b>证据</b><span>${p.evidence}</span></div>`);
  if (p.typical_findings) propRows.push(`<div class="row"><b>典型发现</b><span>${p.typical_findings}</span></div>`);
  if (p.confidence != null) propRows.push(`<div class="row"><b>置信度</b><span>${p.confidence}</span></div>`);
  if (p.processing_time) propRows.push(`<div class="row"><b>耗时</b><span>${p.processing_time}</span></div>`);
  if (p.software_version) propRows.push(`<div class="row"><b>版本</b><span>${p.software_version}</span></div>`);
  if (p.key) propRows.push(`<div class="row"><b>标识</b><span style="font-family:monospace;font-size:11px">${p.key}</span></div>`);
  if (p.early_detection) propRows.push(`<div class="row"><b>早期检测</b><span>是</span></div>`);

  const tripleHtml = (l, isHead) => {
    const otherId = isHead ? l.target : l.source;
    const otherLabel = id2label[otherId] || otherId;
    const otherType = id2type[otherId] || "";
    const otherColor = TYPE_META[otherType]?.color || "#999";
    return `<div class="triple" data-id="${otherId}">
      ${isHead ? "" : `<span class="dir">←</span>`}
      <span class="r">${l.relation}</span>
      <span class="dir">${isHead ? "→" : ""}</span>
      <span class="t2" style="color:${otherColor}">●</span>
      <span class="t2">${otherLabel}</span>
    </div>`;
  };

  const headHtml = asHead.map(l => tripleHtml(l, true)).join("");
  const tailHtml = asTail.map(l => tripleHtml(l, false)).join("");

  $("#detail").innerHTML = `
    <div class="detail-body">
      <div class="d-title">
        <span class="dot" style="background:${meta.color}"></span>
        <h3>${node.label}</h3>
        <span class="d-type" style="--tc:${meta.color};background:${meta.color}">${meta.label}</span>
      </div>
      ${propRows.length ? `<div class="d-props" style="margin-top:8px">${propRows.join("")}</div>` : ""}
      ${asHead.length ? `<div class="d-label">作为主体 (${asHead.length})</div>${headHtml}` : ""}
      ${asTail.length ? `<div class="d-label">作为客体 (${asTail.length})</div>${tailHtml}` : ""}
      ${(!asHead.length && !asTail.length) ? `<div class="d-label">无关系</div>` : ""}
    </div>`;

  // 点击三元组跳转到关联节点
  $("#detail").querySelectorAll(".triple").forEach(el => {
    el.addEventListener("click", () => {
      const id = el.dataset.id;
      showDetail(id);
      focusNode(id);
    });
  });
}

// ---- 聚焦节点（视图居中 + 高亮）----
function focusNode(nodeId) {
  if (!chart) return;
  // 触发 emphasis
  chart.dispatchAction({ type: "highlight", seriesIndex: 0, name: RAW.nodes.find(n => n.id === nodeId)?.label });
  setTimeout(() => chart.dispatchAction({ type: "downplay", seriesIndex: 0 }), 1600);
}

// ---- 事件绑定 ----
function bindEvents() {
  // 图谱点击
  chart.on("click", (params) => {
    if (params.dataType === "node") {
      const node = RAW.nodes.find(n => n.label === params.data.name);
      if (node) {
        showDetail(node.id);
        if (focusMode) { egoCenter = node.id; renderGraph(); }
      }
    }
  });

  // 主题
  $("#themeBtn").addEventListener("click", toggleTheme);
  // 重置
  $("#resetBtn").addEventListener("click", () => {
    activeTypes = new Set(TYPE_ORDER);
    egoCenter = null; searchTerm = ""; $("#search").value = ""; $("#searchCnt").textContent = "";
    renderTypeGrid(); renderGraph();
  });
  // 标签
  $("#labelBtn").addEventListener("click", () => {
    showAllLabels = !showAllLabels;
    $("#labelBtn").textContent = showAllLabels ? "仅关键标签" : "显示全部标签";
    renderGraph();
  });
  // 聚焦模式
  $("#focusBtn").addEventListener("click", () => {
    focusMode = !focusMode;
    $("#focusBtn").textContent = focusMode ? "退出聚焦" : "聚焦模式";
    $("#focusBtn").style.color = focusMode ? cssVar("--accent") : "";
    if (!focusMode) egoCenter = null;
    renderGraph();
  });
  // 重新布局
  $("#relayoutBtn").addEventListener("click", () => {
    const opt = chart.getOption();
    opt.series[0].force = { ...opt.series[0].force };
    chart.setOption({ series: [{ force: { repulsion: [180, 320], edgeLength: [38, 120], gravity: 0.08, friction: 0.6, layoutAnimation: true } }] }, { notMerge: false });
    chart.setOption({ series: [{ data: chart.getOption().series[0].data }] });
  });

  // 搜索
  let searchTimer;
  $("#search").addEventListener("input", (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      searchTerm = e.target.value.trim();
      $("#searchCnt").textContent = searchTerm ? `${getVisible().matchIds.size} 命中` : "";
      renderGraph();
    }, 180);
  });

  // 窗口缩放
  window.addEventListener("resize", () => chart && chart.resize());
}

// ---- 主题 ----
function setThemeIcon() {
  const dark = isDark();
  $("#themeIcon").innerHTML = dark
    ? '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>'
    : '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
}
function toggleTheme() {
  const cur = document.documentElement.getAttribute("data-theme");
  document.documentElement.setAttribute("data-theme", cur === "light" ? "dark" : "light");
  setThemeIcon();
  renderGraph(); // 重渲染以更新文字颜色
}

// ---- 初始化 ----
async function init() {
  setThemeIcon();
  chart = echarts.init(graphEl, null, { renderer: "canvas" });
  try {
    const res = await fetch("kg_data.json", { cache: "no-cache" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    RAW = await res.json();
  } catch (err) {
    loadingEl.innerHTML = `<div style="color:var(--accent);font-weight:800">加载失败</div>
      <div style="font-size:11px;max-width:280px;text-align:center">无法读取 kg_data.json。<br>请通过本地 HTTP 服务打开（如 <code>python -m http.server</code>），<br>直接双击文件会因 CORS 受限。</div>`;
    return;
  }
  computeDegrees();
  renderStats();
  renderTypeGrid();
  bindEvents();
  renderGraph();
  // 默认选中一个疾病展示
  const ad = RAW.nodes.find(n => n.label === "阿尔茨海默病");
  if (ad) showDetail(ad.id);
}

init();
