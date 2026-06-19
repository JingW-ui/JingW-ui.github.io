/* ===== 虎扑评分面板 · 主逻辑 ===== */
(function () {
  "use strict";

  var IMG = window.HUPU_IMAGE_MAP || {};
  var PERFECT = window.HUPU_PERFECT || [];
  var HIGH = window.HUPU_HIGH || [];
  var LOW = window.HUPU_LOW || [];
  var ALL = PERFECT.concat(HIGH).concat(LOW);

  var $ = function (id) { return document.getElementById(id); };
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function fmtWan(v) { return v >= 10000 ? (v / 10000).toFixed(1) + "万" : String(v); }
  function scoreColor(s) {
    if (s >= 10) return "#fbbf24";
    if (s >= 9) return "#22c55e";
    if (s >= 7) return "#3b82f6";
    if (s >= 5) return "#a855f7";
    return "#ef4444";
  }
  var FALLBACK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Crect fill='%23334155' width='60' height='60' rx='30'/%3E%3Ctext fill='%2394a3b8' x='30' y='36' text-anchor='middle' font-size='24'%3E👤%3C/text%3E%3C/svg%3E";

  // ---- state ----
  var state = {
    tab: "overview",
    search: "",
    sort: { perfect: "score", high: "score", low: "score" },
  };

  // ---- theme ----
  var dark = false;
  function applyTheme() {
    dark = document.documentElement.getAttribute("data-theme") === "dark";
    $("themeIcon").innerHTML = dark
      ? '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'
      : '<path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"/>';
    Object.keys(charts).forEach(function (k) { if (charts[k]) renderChart(k); });
  }
  function txt() { return dark ? "#9fb0c0" : "#475569"; }
  function axis() { return dark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.10)"; }
  function cardBg() { return dark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.9)"; }
  function tt() {
    return {
      backgroundColor: dark ? "rgba(12,20,32,0.96)" : "rgba(255,255,255,0.96)",
      borderColor: axis(), borderWidth: 1,
      textStyle: { color: dark ? "#eaf0f6" : "#0f172a", fontSize: 12 },
      extraCssText: "border-radius:10px;backdrop-filter:blur(8px);"
    };
  }

  // ---- KPI + hero meta ----
  function renderKpis() {
    var perfect = ALL.filter(function (d) { return d.score >= 10; }).length;
    var high = ALL.filter(function (d) { return d.score >= 9 && d.score < 10; }).length;
    var low = ALL.filter(function (d) { return d.score < 5; }).length;
    var totalVotes = ALL.reduce(function (s, d) { return s + d.votes; }, 0);
    var avg = (ALL.reduce(function (s, d) { return s + d.score; }, 0) / ALL.length);
    var cats = {}; ALL.forEach(function (d) { cats[d.category] = 1; });
    var items = [
      { lbl: "满分人物", val: perfect, sub: "评分 10.0", pct: perfect / ALL.length * 100, c: "#fbbf24" },
      { lbl: "高分人物", val: high, sub: "评分 9.0+", pct: high / ALL.length * 100, c: "#22c55e" },
      { lbl: "低分人物", val: low, sub: "评分 <5.0", pct: low / ALL.length * 100, c: "#ef4444" },
      { lbl: "累计参与", val: fmtWan(totalVotes), sub: "人次评分", pct: 100, c: "#3b82f6" },
    ];
    var box = $("kpis"); box.innerHTML = "";
    items.forEach(function (it) {
      var d = el("div", "kpi");
      d.innerHTML = '<div class="lbl">' + it.lbl + '</div><div class="val">' + it.val + '</div><div class="sub">' + it.sub + '</div><div class="bar" style="width:' + Math.max(4, it.pct) + "%;background:" + it.c + '"></div>';
      box.appendChild(d);
    });

    var hm = $("heroMeta"); hm.innerHTML = "";
    [
      { v: ALL.length, l: "收录条目" },
      { v: Object.keys(cats).length, l: "覆盖分类" },
      { v: avg.toFixed(2), l: "平均评分", accent: true },
    ].forEach(function (m) {
      var d = el("div", "hm");
      d.innerHTML = '<div class="v' + (m.accent ? " accent" : "") + '">' + m.v + '</div><div class="l">' + m.l + "</div>";
      hm.appendChild(d);
    });
  }

  // ---- person cards ----
  function filterSort(list, by, q) {
    var arr = list.filter(function (d) {
      if (!q) return true;
      var hay = (d.name + " " + d.category + " " + d.tagline).toLowerCase();
      return hay.indexOf(q) !== -1;
    });
    arr.sort(function (a, b) {
      if (by === "votes") return b.votes - a.votes;
      if (by === "name") return a.name.localeCompare(b.name, "zh");
      return b.score - a.score;
    });
    return arr;
  }
  function badgeClass(s) {
    if (s >= 9.8) return "score-perfect";
    if (s >= 7) return "score-high";
    return "score-low";
  }
  function renderGrid(list, containerId, by) {
    var data = filterSort(list, by, state.search);
    var box = $(containerId); box.innerHTML = "";
    if (!data.length) { box.appendChild(el("div", "empty", "没有匹配的人物")); return; }
    data.forEach(function (item, idx) {
      var rarity = item.score >= 9.8 ? "r-perfect" : item.score >= 7 ? "r-high" : "r-low";
      var c = el("div", "person-card fade " + rarity);
      c.style.animationDelay = (idx * 0.04) + "s";
      var imgUrl = IMG[item.name] || "";
      c.innerHTML =
        '<div class="pc-no">No.<b>' + String(idx + 1).padStart(3, "0") + "</b></div>" +
        '<div class="pc-frame">' +
          '<img class="avatar avatar-loading" src="' + imgUrl + '" alt="' + item.name + '" loading="lazy">' +
          '<span class="cat-tag">' + item.category + "</span>" +
          '<div class="score-badge ' + badgeClass(item.score) + '">' + item.score + "</div>" +
        "</div>" +
        '<div class="pc-body">' +
          '<div class="pc-name">' + item.name + '</div><div class="pc-tag">' + item.tagline + "</div>" +
          (item.highlight ? '<div class="pc-highlight">' + item.highlight + "</div>" : "") +
          '<div class="pc-meta">' +
            '<div class="m"><span class="ml">参与</span><span class="mv">' + fmtWan(item.votes) + "</span></div>" +
            '<div class="m"><span class="ml">分类</span><span class="mv">' + item.category + "</span></div>" +
          "</div>" +
        "</div>";
      var img = c.querySelector(".avatar");
      img.addEventListener("load", function () { img.classList.remove("avatar-loading"); });
      img.addEventListener("error", function () { img.classList.remove("avatar-loading"); img.src = FALLBACK; });
      box.appendChild(c);
    });
  }

  function renderLists() {
    renderGrid(PERFECT, "grid-perfect", state.sort.perfect);
    renderGrid(HIGH, "grid-high", state.sort.high);
    renderGrid(LOW, "grid-low", state.sort.low);
    $("info-perfect").textContent = "满分榜 · " + filterSort(PERFECT, state.sort.perfect, state.search).length + " 个";
    $("info-high").textContent = "高分榜 · " + filterSort(HIGH, state.sort.high, state.search).length + " 个";
    $("info-low").textContent = "低分榜 · " + filterSort(LOW, state.sort.low, state.search).length + " 个";
  }

  // ---- charts (lazy + theme-aware) ----
  var charts = {};
  var inited = {};
  function getChart(id) {
    if (!charts[id]) charts[id] = echarts.init($(id));
    return charts[id];
  }

  function renderChart(id) {
    if (id === "c-scatter") renderScatter();
    else if (id === "c-pie") renderPie();
    else if (id === "c-top10") renderTop10();
    else if (id === "c-pop") renderPop();
    else if (id === "c-perfectcat") renderCatPie(PERFECT, "c-perfectcat", ["#fbbf24", "#f97316", "#22c55e", "#3b82f6", "#a855f7", "#ef4444", "#eab308", "#06b6d4"]);
    else if (id === "c-lowcat") renderCatPie(LOW, "c-lowcat", ["#ef4444", "#dc2626", "#b91c1c", "#991b1b", "#f97316", "#fbbf24", "#a855f7"]);
    else if (id === "c-hist") renderHist();
    else if (id === "c-heat") renderHeat();
  }

  function renderScatter() {
    var c = getChart("c-scatter");
    var data = ALL.map(function (d) { return [d.score, d.votes, d.name, d.category, IMG[d.name] || ""]; });
    c.setOption({
      tooltip: Object.assign(tt(), {
        formatter: function (p) {
          var img = p.data[4] ? '<img src="' + p.data[4] + '" style="width:38px;height:38px;border-radius:50%;object-fit:cover;margin-right:8px;vertical-align:middle">' : "";
          return '<div style="padding:6px;display:flex;align-items:center;gap:8px">' + img + '<div><div style="font-size:15px;font-weight:700;margin-bottom:3px">' + p.data[2] + '</div><div style="color:' + txt() + '">评分: <b style="color:' + scoreColor(p.data[0]) + '">' + p.data[0] + '</b></div><div style="color:' + txt() + '">参与: <b>' + fmtWan(p.data[1]) + '</b></div><div style="color:' + txt() + '">分类: ' + p.data[3] + "</div></div></div>";
        }
      }),
      grid: { left: 60, right: 30, top: 30, bottom: 50 },
      xAxis: { type: "value", name: "评分", nameTextStyle: { color: txt() }, min: 0, max: 11, splitLine: { lineStyle: { color: axis(), type: "dashed" } }, axisLabel: { color: txt() }, axisLine: { lineStyle: { color: axis() } } },
      yAxis: { type: "value", name: "参与人数", nameTextStyle: { color: txt() }, splitLine: { lineStyle: { color: axis(), type: "dashed" } }, axisLabel: { color: txt(), formatter: function (v) { return v >= 10000 ? (v / 10000).toFixed(0) + "万" : v; } }, axisLine: { lineStyle: { color: axis() } } },
      series: [{
        type: "scatter", symbolSize: function (d) { return Math.sqrt(d[1]) / 15 + 8; }, data: data,
        itemStyle: { color: function (p) { return scoreColor(p.data[0]); }, shadowBlur: 8, shadowColor: "rgba(0,0,0,0.3)" },
        label: { show: true, formatter: function (p) { return p.data[0] >= 9.9 || p.data[1] > 50000 ? p.data[2] : ""; }, position: "top", color: txt(), fontSize: 11 }
      }]
    }, true);
  }

  function renderPie() {
    var c = getChart("c-pie");
    var m = {}; ALL.forEach(function (d) { m[d.category] = (m[d.category] || 0) + 1; });
    var data = Object.keys(m).map(function (k) { return { name: k, value: m[k] }; }).sort(function (a, b) { return b.value - a.value; });
    c.setOption({
      tooltip: Object.assign(tt(), { trigger: "item", formatter: "{b}: {c}个 ({d}%)" }),
      legend: { orient: "vertical", right: 6, top: "center", textStyle: { color: txt(), fontSize: 11 }, itemWidth: 12, itemHeight: 12 },
      series: [{
        type: "pie", radius: ["42%", "70%"], center: ["36%", "50%"], avoidLabelOverlap: true,
        itemStyle: { borderRadius: 8, borderColor: cardBg(), borderWidth: 2 }, label: { show: false },
        emphasis: { label: { show: true, fontSize: 14, fontWeight: "bold", color: txt() } },
        data: data, color: ["#f97316", "#3b82f6", "#22c55e", "#a855f7", "#ef4444", "#eab308", "#06b6d4", "#f472b6", "#8b5cf6", "#14b8a6"]
      }]
    }, true);
  }

  function renderTop10() {
    var c = getChart("c-top10");
    var top = ALL.slice().sort(function (a, b) { return b.score - a.score; }).slice(0, 10);
    c.setOption({
      tooltip: Object.assign(tt(), { trigger: "axis", axisPointer: { type: "shadow" } }),
      grid: { left: 8, right: 40, bottom: 8, top: 8, containLabel: true },
      xAxis: { type: "value", max: 11, splitLine: { lineStyle: { color: axis(), type: "dashed" } }, axisLabel: { color: txt() } },
      yAxis: { type: "category", data: top.map(function (d) { return d.name; }).reverse(), axisLabel: { color: txt(), fontSize: 12 }, axisLine: { show: false }, axisTick: { show: false } },
      series: [{
        type: "bar", barWidth: "60%",
        data: top.map(function (d) { return { value: d.score, itemStyle: { color: scoreColor(d.score), borderRadius: [0, 8, 8, 0] } }; }).reverse(),
        label: { show: true, position: "right", color: txt(), fontWeight: "bold" }
      }]
    }, true);
  }

  function renderPop() {
    var c = getChart("c-pop");
    var pop = ALL.slice().sort(function (a, b) { return b.votes - a.votes; }).slice(0, 15);
    c.setOption({
      tooltip: Object.assign(tt(), { trigger: "axis", axisPointer: { type: "shadow" }, formatter: function (p) { var d = pop[p[0].dataIndex]; return '<div style="padding:6px"><div style="font-size:15px;margin-bottom:3px">' + d.name + '</div><div style="color:' + txt() + '">评分: ' + d.score + '</div><div style="color:#f97316">参与: ' + fmtWan(d.votes) + "</div></div>"; } }),
      grid: { left: 8, right: 16, bottom: 70, top: 16, containLabel: true },
      xAxis: { type: "category", data: pop.map(function (d) { return d.name; }), axisLabel: { color: txt(), fontSize: 10, rotate: 35 }, axisLine: { lineStyle: { color: axis() } } },
      yAxis: { type: "value", splitLine: { lineStyle: { color: axis(), type: "dashed" } }, axisLabel: { color: txt(), formatter: function (v) { return (v / 10000).toFixed(0) + "万"; } } },
      series: [{
        type: "bar", barWidth: "52%",
        data: pop.map(function (d) { return { value: d.votes, itemStyle: { color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: "#f97316" }, { offset: 1, color: "#ea580c" }] }, borderRadius: [8, 8, 0, 0] } }; })
      }]
    }, true);
  }

  function renderCatPie(list, id, colors) {
    var c = getChart(id);
    var m = {}; list.forEach(function (d) { m[d.category] = (m[d.category] || 0) + 1; });
    c.setOption({
      tooltip: Object.assign(tt(), { trigger: "item", formatter: "{b}: {c}个 ({d}%)" }),
      series: [{
        type: "pie", radius: ["35%", "66%"], center: ["50%", "52%"], roseType: "radius",
        itemStyle: { borderRadius: 6, borderColor: cardBg(), borderWidth: 2 },
        label: { color: txt(), fontSize: 11 },
        data: Object.keys(m).map(function (k) { return { name: k, value: m[k] }; }), color: colors
      }]
    }, true);
  }

  function renderHist() {
    var c = getChart("c-hist");
    var bins = { "0-2": 0, "2-4": 0, "4-6": 0, "6-7": 0, "7-8": 0, "8-9": 0, "9-9.5": 0, "9.5-10": 0, "10": 0 };
    ALL.forEach(function (d) {
      var s = d.score;
      if (s === 10) bins["10"]++; else if (s >= 9.5) bins["9.5-10"]++; else if (s >= 9) bins["9-9.5"]++;
      else if (s >= 8) bins["8-9"]++; else if (s >= 7) bins["7-8"]++; else if (s >= 6) bins["6-7"]++;
      else if (s >= 4) bins["4-6"]++; else if (s >= 2) bins["2-4"]++; else bins["0-2"]++;
    });
    c.setOption({
      tooltip: Object.assign(tt(), { trigger: "axis", axisPointer: { type: "shadow" } }),
      grid: { left: 8, right: 20, bottom: 8, top: 24, containLabel: true },
      xAxis: { type: "category", data: Object.keys(bins), axisLabel: { color: txt() }, axisLine: { lineStyle: { color: axis() } } },
      yAxis: { type: "value", splitLine: { lineStyle: { color: axis(), type: "dashed" } }, axisLabel: { color: txt() } },
      series: [{
        type: "bar", barWidth: "60%",
        data: Object.keys(bins).map(function (k) { return { value: bins[k], itemStyle: { color: k === "10" ? "#fbbf24" : (k === "9.5-10" || k === "9-9.5") ? "#22c55e" : k === "8-9" ? "#3b82f6" : (k === "2-4" || k === "0-2") ? "#ef4444" : "#a855f7", borderRadius: [6, 6, 0, 0] } }; }),
        label: { show: true, position: "top", color: txt(), fontWeight: "bold" }
      }]
    }, true);
  }

  function renderHeat() {
    var c = getChart("c-heat");
    var sum = {}, cnt = {};
    ALL.forEach(function (d) { sum[d.category] = (sum[d.category] || 0) + d.score; cnt[d.category] = (cnt[d.category] || 0) + 1; });
    var arr = Object.keys(sum).map(function (k) { return { cat: k, avg: sum[k] / cnt[k], count: cnt[k] }; }).sort(function (a, b) { return b.avg - a.avg; });
    c.setOption({
      tooltip: Object.assign(tt(), { formatter: function (p) { var d = arr[p.dataIndex]; return '<div style="padding:6px"><div style="font-size:15px;margin-bottom:3px">' + d.cat + '</div><div style="color:#f97316">平均评分: <b>' + d.avg.toFixed(2) + '</b></div><div style="color:' + txt() + '">条目数: ' + d.count + "</div></div>"; } }),
      grid: { left: 90, right: 50, top: 10, bottom: 10 },
      xAxis: { type: "value", min: 0, max: 11, splitLine: { lineStyle: { color: axis(), type: "dashed" } }, axisLabel: { color: txt() } },
      yAxis: { type: "category", data: arr.map(function (d) { return d.cat; }), axisLabel: { color: txt(), fontSize: 12 }, axisLine: { show: false }, axisTick: { show: false } },
      visualMap: { show: false, min: 1, max: 10, inRange: { color: ["#ef4444", "#f59e0b", "#22c55e"] } },
      series: [{
        type: "bar", barWidth: "55%",
        data: arr.map(function (d) { return { value: +d.avg.toFixed(2), itemStyle: { borderRadius: [0, 8, 8, 0] } }; }),
        label: { show: true, position: "right", color: txt(), fontWeight: "bold" }
      }]
    }, true);
  }

  // ---- tabs ----
  var TAB_CHARTS = {
    overview: ["c-scatter", "c-pie", "c-top10", "c-pop"],
    charts: ["c-perfectcat", "c-lowcat", "c-hist", "c-heat"],
  };
  function switchTab(tab) {
    state.tab = tab;
    document.querySelectorAll(".tab-btn").forEach(function (b) { b.classList.toggle("active", b.dataset.tab === tab); });
    document.querySelectorAll(".tab-pane").forEach(function (p) { p.hidden = p.id !== "tab-" + tab; });
    var list = TAB_CHARTS[tab] || [];
    setTimeout(function () {
      list.forEach(function (id) { if (!inited[id]) { renderChart(id); inited[id] = true; } else charts[id] && charts[id].resize(); });
    }, 30);
    try { localStorage.setItem("hupu_tab", tab); } catch (e) {}
  }

  // ---- events ----
  function init() {
    document.querySelectorAll(".tab-btn").forEach(function (b) {
      b.addEventListener("click", function () { switchTab(b.dataset.tab); });
    });
    document.querySelectorAll(".seg").forEach(function (seg) {
      var key = seg.dataset.sort;
      seg.querySelectorAll("button").forEach(function (btn) {
        btn.addEventListener("click", function () {
          state.sort[key] = btn.dataset.by;
          seg.querySelectorAll("button").forEach(function (x) { x.classList.toggle("active", x === btn); });
          renderLists();
        });
      });
    });
    var search = $("search"), ts;
    search.addEventListener("input", function () {
      clearTimeout(ts); ts = setTimeout(function () { state.search = search.value.trim().toLowerCase(); renderLists(); }, 160);
    });
    $("themeToggle").addEventListener("click", function () {
      var next = dark ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try { localStorage.setItem("hupu_theme", next); } catch (e) {}
      applyTheme();
    });
    window.addEventListener("resize", function () { Object.keys(charts).forEach(function (k) { charts[k] && charts[k].resize(); }); });
  }

  // ---- boot ----
  try {
    var t = localStorage.getItem("hupu_theme");
    if (t) document.documentElement.setAttribute("data-theme", t);
  } catch (e) {}
  applyTheme();
  renderKpis();
  renderLists();
  init();
  var savedTab = "overview";
  try { savedTab = localStorage.getItem("hupu_tab") || "overview"; } catch (e) {}
  switchTab(savedTab);
})();
