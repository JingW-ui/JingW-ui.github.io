/* ===== 第四轮学科评估 · 可视化面板 主逻辑 ===== */
(function () {
  "use strict";

  var DATA = window.ACADEMIC_RANK_DATA || { keys: [], rows: [] };
  var keys = DATA.keys;
  var idx = {
    code: keys.indexOf("学科代码"),
    name: keys.indexOf("学科名称"),
    cat: keys.indexOf("学科门类"),
    scode: keys.indexOf("学校代码"),
    sname: keys.indexOf("学校名称"),
    grade: keys.indexOf("评估等级"),
    prov: keys.indexOf("省份"),
    city: keys.indexOf("城市"),
  };

  var GRADES = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-"];
  var GRADE_RANK = {};
  GRADES.forEach(function (g, i) { GRADE_RANK[g] = i; });
  var GRADE_COLOR = {
    "A+": "#ef4444", "A": "#f97316", "A-": "#f59e0b",
    "B+": "#eab308", "B": "#84cc16", "B-": "#22c55e",
    "C+": "#14b8a6", "C": "#06b6d4", "C-": "#3b82f6"
  };

  // records as objects
  var records = DATA.rows.map(function (r) {
    return {
      code: r[idx.code], name: r[idx.name], cat: r[idx.cat],
      scode: r[idx.scode], sname: r[idx.sname], grade: r[idx.grade],
      prov: r[idx.prov], city: r[idx.city],
    };
  });

  // unique option lists
  function uniq(arr) {
    var seen = {}, out = [];
    arr.forEach(function (x) { if (x && !seen[x]) { seen[x] = 1; out.push(x); } });
    return out;
  }
  var categories = uniq(records.map(function (r) { return r.cat; })).sort();
  var provinces = uniq(records.map(function (r) { return r.prov; })).sort(function (a, b) {
    return a.localeCompare(b, "zh");
  });
  var allSchools = uniq(records.map(function (r) { return r.sname; })).sort();

  // state
  var state = {
    category: "", province: "", grades: {}, search: "",
    sortKey: "grade", sortDir: 1, page: 1, pageSize: 25,
  };
  GRADES.forEach(function (g) { state.grades[g] = true; });

  // ---- filtering ----
  function filtered() {
    var q = state.search.trim().toLowerCase();
    return records.filter(function (r) {
      if (state.category && r.cat !== state.category) return false;
      if (state.province && r.prov !== state.province) return false;
      if (!state.grades[r.grade]) return false;
      if (q) {
        var hay = (r.sname + " " + r.name + " " + r.city + " " + r.prov + " " + r.cat).toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
  }

  function gradeColor(g) { return GRADE_COLOR[g] || "#888"; }

  // ---- DOM helpers ----
  function $(id) { return document.getElementById(id); }
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  // ---- init selects / chips ----
  function initControls() {
    var fc = $("fCategory"), fp = $("fProvince");
    categories.forEach(function (c) {
      var o = document.createElement("option"); o.value = c; o.textContent = c; fc.appendChild(o);
    });
    provinces.forEach(function (p) {
      var o = document.createElement("option"); o.value = p; o.textContent = p; fp.appendChild(o);
    });
    fc.addEventListener("change", function () { state.category = fc.value; state.page = 1; refresh(); });
    fp.addEventListener("change", function () { state.province = fp.value; state.page = 1; refresh(); });

    var gc = $("gradeChips");
    GRADES.forEach(function (g) {
      var c = el("span", "chip", g);
      c.style.background = gradeColor(g);
      c.style.color = "#06121f";
      c.dataset.grade = g;
      c.addEventListener("click", function () {
        state.grades[g] = !state.grades[g];
        c.classList.toggle("active", state.grades[g]);
        c.style.opacity = state.grades[g] ? "1" : ".32";
        state.page = 1; refresh();
      });
      gc.appendChild(c);
    });

    $("resetBtn").addEventListener("click", function () {
      state.category = ""; state.province = ""; state.search = "";
      GRADES.forEach(function (g) { state.grades[g] = true; });
      fc.value = ""; fp.value = ""; $("globalSearch").value = "";
      Array.prototype.forEach.call(gc.children, function (c) {
        c.classList.add("active"); c.style.opacity = "1";
      });
      state.page = 1; refresh();
    });

    var gs = $("globalSearch");
    var ts;
    gs.addEventListener("input", function () {
      clearTimeout(ts);
      ts = setTimeout(function () { state.search = gs.value; state.page = 1; refresh(); }, 180);
    });

    $("themeToggle").addEventListener("click", toggleTheme);
    $("exportBtn").addEventListener("click", exportCSV);
    $("modalClose").addEventListener("click", closeModal);
    $("modalMask").addEventListener("click", function (e) {
      if (e.target === $("modalMask")) closeModal();
    });
  }

  function toggleTheme() {
    var cur = document.documentElement.getAttribute("data-theme");
    var next = cur === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("ar_theme", next); } catch (e) {}
    applyThemeToCharts();
    renderCharts();
  }

  // ---- theme helpers ----
  var isLight = false;
  function applyThemeToCharts() {
    isLight = document.documentElement.getAttribute("data-theme") === "light";
  }
  function txtColor() { return isLight ? "#4b5d72" : "#9fb0c0"; }
  function axisColor() { return isLight ? "rgba(15,30,50,0.10)" : "rgba(255,255,255,0.08)"; }
  function cardBg() { return isLight ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.04)"; }

  // ---- KPI ----
  function countBy(arr, fn) {
    var m = {};
    arr.forEach(function (r) { var k = fn(r); m[k] = (m[k] || 0) + 1; });
    return m;
  }
  function renderKpis(data) {
    var schools = {}, discs = {}, provs = {}, aplus = 0;
    data.forEach(function (r) {
      schools[r.sname] = 1; discs[r.name] = 1; provs[r.prov] = 1;
      if (r.grade === "A+") aplus++;
    });
    var items = [
      { lbl: "评估记录", val: data.length, sub: "当前筛选范围内", ico: "▦" },
      { lbl: "涉及高校", val: Object.keys(schools).length, sub: "所", ico: "☰" },
      { lbl: "A+ 学科", val: aplus, sub: "顶尖档", ico: "★" },
      { lbl: "涉及学科", val: Object.keys(discs).length, sub: "个", ico: "◇" },
      { lbl: "覆盖省份", val: Object.keys(provs).length, sub: "个", ico: "◉" },
      { lbl: "A 类占比", val: data.length ? Math.round(data.filter(function (r) { return r.grade[0] === "A"; }).length / data.length * 100) + "%" : "0%", sub: "A+/A/A-", ico: "▲" },
    ];
    var box = $("kpis"); box.innerHTML = "";
    items.forEach(function (it) {
      var d = el("div", "kpi");
      d.innerHTML = '<div class="lbl">' + it.lbl + '</div>' +
        '<div class="val">' + it.val + '</div>' +
        '<div class="sub">' + it.sub + '</div>' +
        '<div class="ico">' + it.ico + '</div>';
      box.appendChild(d);
    });
  }

  // ---- charts ----
  var charts = {};
  function chart(id) {
    if (!charts[id]) charts[id] = echarts.init($(id));
    return charts[id];
  }
  function tooltip() {
    return {
      backgroundColor: isLight ? "rgba(255,255,255,0.96)" : "rgba(12,20,30,0.96)",
      borderColor: axisColor(), borderWidth: 1,
      textStyle: { color: isLight ? "#0f1c2e" : "#eaf0f6", fontSize: 12 },
      extraCssText: "border-radius:10px;backdrop-filter:blur(8px);"
    };
  }

  function renderGradeChart(data) {
    var counts = GRADES.map(function (g) {
      return data.filter(function (r) { return r.grade === g; }).length;
    });
    chart("chartGrade").setOption({
      tooltip: Object.assign(tooltip(), { trigger: "item", formatter: "{b}: {c} ({d}%)" }),
      legend: { show: false },
      series: [{
        type: "pie", radius: ["42%", "70%"], center: ["50%", "52%"],
        roseType: "radius", itemStyle: { borderRadius: 6, borderColor: cardBg(), borderWidth: 2 },
        label: { color: txtColor(), fontSize: 11, formatter: "{b}\n{c}" },
        labelLine: { lineStyle: { color: axisColor() } },
        data: GRADES.map(function (g, i) {
          return { name: g, value: counts[i], itemStyle: { color: gradeColor(g) } };
        })
      }]
    }, true);
  }

  function renderCategoryChart(data) {
    var m = countBy(data, function (r) { return r.cat; });
    var arr = Object.keys(m).map(function (k) { return { name: k, value: m[k] }; })
      .sort(function (a, b) { return b.value - a.value; });
    chart("chartCategory").setOption({
      tooltip: Object.assign(tooltip(), { trigger: "axis", axisPointer: { type: "shadow" } }),
      grid: { left: 8, right: 16, top: 16, bottom: 8, containLabel: true },
      xAxis: { type: "value", axisLine: { show: false }, splitLine: { lineStyle: { color: axisColor() } }, axisLabel: { color: txtColor(), fontSize: 11 } },
      yAxis: { type: "category", data: arr.map(function (a) { return a.name; }), inverse: true, axisLine: { lineStyle: { color: axisColor() } }, axisLabel: { color: txtColor(), fontSize: 11.5 }, axisTick: { show: false } },
      series: [{
        type: "bar", data: arr.map(function (a) { return a.value; }),
        barWidth: 14, itemStyle: { borderRadius: [0, 7, 7, 0], color: { type: "linear", x: 0, y: 0, x2: 1, y2: 0, colorStops: [{ offset: 0, color: "#2dd4bf" }, { offset: 1, color: "#818cf8" }] } },
        label: { show: true, position: "right", color: txtColor(), fontSize: 11 }
      }]
    }, true);
  }

  function renderTopSchools(data) {
    var m = {};
    data.forEach(function (r) {
      if (r.grade[0] === "A") m[r.sname] = (m[r.sname] || 0) + 1;
    });
    var arr = Object.keys(m).map(function (k) { return { name: k, value: m[k] }; })
      .sort(function (a, b) { return b.value - a.value; }).slice(0, 20);
    chart("chartTopSchools").setOption({
      tooltip: Object.assign(tooltip(), { trigger: "axis", axisPointer: { type: "shadow" }, formatter: function (p) { return p[0].name + "：A 类学科 <b>" + p[0].value + "</b> 个"; } }),
      grid: { left: 8, right: 44, top: 10, bottom: 8, containLabel: true },
      xAxis: { type: "value", axisLine: { show: false }, splitLine: { lineStyle: { color: axisColor() } }, axisLabel: { color: txtColor(), fontSize: 11 } },
      yAxis: { type: "category", data: arr.map(function (a) { return a.name; }).reverse(), axisLine: { lineStyle: { color: axisColor() } }, axisLabel: { color: txtColor(), fontSize: 11.5 }, axisTick: { show: false } },
      series: [{
        type: "bar", data: arr.map(function (a) { return a.value; }).reverse(),
        barWidth: 13, itemStyle: { borderRadius: [0, 7, 7, 0], color: { type: "linear", x: 0, y: 0, x2: 1, y2: 0, colorStops: [{ offset: 0, color: "#818cf8" }, { offset: 1, color: "#2dd4bf" }] } },
        label: { show: true, position: "right", color: txtColor(), fontSize: 11 }
      }]
    }, true);
    charts["chartTopSchools"].off("click");
    charts["chartTopSchools"].on("click", function (p) {
      if (p.componentType === "series") openSchool(p.name);
    });
  }

  function renderProvinceChart(data) {
    var m = countBy(data, function (r) { return r.prov; });
    var arr = Object.keys(m).map(function (k) { return { name: k, value: m[k] }; })
      .sort(function (a, b) { return b.value - a.value; }).slice(0, 18);
    chart("chartProvince").setOption({
      tooltip: Object.assign(tooltip(), { trigger: "axis", axisPointer: { type: "shadow" } }),
      grid: { left: 8, right: 16, top: 10, bottom: 40, containLabel: true },
      xAxis: { type: "category", data: arr.map(function (a) { return a.name; }), axisLine: { lineStyle: { color: axisColor() } }, axisLabel: { color: txtColor(), fontSize: 10.5, rotate: 40 }, axisTick: { show: false } },
      yAxis: { type: "value", axisLine: { show: false }, splitLine: { lineStyle: { color: axisColor() } }, axisLabel: { color: txtColor(), fontSize: 11 } },
      series: [{
        type: "bar", data: arr.map(function (a) { return { value: a.value, name: a.name }; }),
        barWidth: 16, itemStyle: { borderRadius: [7, 7, 0, 0], color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: "#f59e0b" }, { offset: 1, color: "#2dd4bf" }] } }
      }]
    }, true);
    charts["chartProvince"].off("click");
    charts["chartProvince"].on("click", function (p) {
      if (p.componentType === "series") {
        state.province = p.name; $("fProvince").value = p.name; state.page = 1; refresh();
      }
    });
  }

  function renderHeatChart(data) {
    var cats = categories.slice().sort();
    var matrix = [];
    var max = 0;
    GRADES.forEach(function (g, gi) {
      cats.forEach(function (c, ci) {
        var cnt = data.filter(function (r) { return r.grade === g && r.cat === c; }).length;
        if (cnt > max) max = cnt;
        matrix.push([ci, gi, cnt]);
      });
    });
    chart("chartHeat").setOption({
      tooltip: Object.assign(tooltip(), { position: "top", formatter: function (p) { return cats[p.value[0]] + " · " + GRADES[p.value[1]] + "<br/>" + p.value[2] + " 条"; } }),
      grid: { left: 8, right: 12, top: 16, bottom: 70, containLabel: true },
      xAxis: { type: "category", data: cats, splitArea: { show: true }, axisLabel: { color: txtColor(), fontSize: 10, rotate: 40 }, axisLine: { lineStyle: { color: axisColor() } } },
      yAxis: { type: "category", data: GRADES, splitArea: { show: true }, axisLabel: { color: txtColor(), fontSize: 11 }, axisLine: { lineStyle: { color: axisColor() } } },
      visualMap: { min: 0, max: max || 1, calculable: true, orient: "horizontal", left: "center", bottom: 4, textStyle: { color: txtColor(), fontSize: 10 }, inRange: { color: ["rgba(45,212,191,0.12)", "#2dd4bf", "#f59e0b", "#ef4444"] } },
      series: [{ type: "heatmap", data: matrix, label: { show: false }, emphasis: { itemStyle: { shadowBlur: 10, shadowColor: "rgba(0,0,0,0.4)" } } }]
    }, true);
  }

  function renderCharts() {
    var data = filtered();
    applyThemeToCharts();
    renderGradeChart(data);
    renderCategoryChart(data);
    renderTopSchools(data);
    renderProvinceChart(data);
    renderHeatChart(data);
  }

  // ---- table ----
  var COLS = [
    { key: "sname", label: "高校", cls: "nm" },
    { key: "name", label: "学科", cls: "nm" },
    { key: "cat", label: "门类" },
    { key: "grade", label: "等级", badge: true },
    { key: "prov", label: "省份" },
    { key: "city", label: "城市" },
  ];
  function renderTable(data) {
    var thead = $("thead"); thead.innerHTML = "";
    COLS.forEach(function (c) {
      var th = el("th", (state.sortKey === c.key ? "sorted" : ""), c.label + '<span class="arr">' + (state.sortKey === c.key ? (state.sortDir > 0 ? "▲" : "▼") : "⇅") + "</span>");
      th.addEventListener("click", function () {
        if (state.sortKey === c.key) state.sortDir = -state.sortDir;
        else { state.sortKey = c.key; state.sortDir = (c.key === "grade") ? 1 : 1; }
        renderTable(currentData);
      });
      thead.appendChild(th);
    });

    var sorted = data.slice();
    sorted.sort(function (a, b) {
      var av = a[state.sortKey], bv = b[state.sortKey];
      if (state.sortKey === "grade") return (GRADE_RANK[av] - GRADE_RANK[bv]) * state.sortDir;
      return String(av).localeCompare(String(bv), "zh") * state.sortDir;
    });
    currentData = sorted;

    var total = sorted.length;
    var pages = Math.max(1, Math.ceil(total / state.pageSize));
    if (state.page > pages) state.page = pages;
    var start = (state.page - 1) * state.pageSize;
    var pageRows = sorted.slice(start, start + state.pageSize);

    var tb = $("tbody"); tb.innerHTML = "";
    if (!pageRows.length) {
      var tr = el("tr"); tr.appendChild(el("td", null, ""));
      tr.firstChild.colSpan = COLS.length;
      tr.firstChild.appendChild(el("div", "empty", "没有符合条件的记录"));
      tb.appendChild(tr);
    } else {
      pageRows.forEach(function (r) {
        var tr = el("tr");
        COLS.forEach(function (c) {
          var td = el("td");
          if (c.badge) {
            td.innerHTML = '<span class="grade-badge g-' + r.grade.replace("+", "\\+") + '" style="background:' + gradeColor(r.grade) + '22;color:' + gradeColor(r.grade) + '">' + r.grade + "</span>";
          } else {
            td.innerHTML = '<span class="' + (c.cls || "") + '">' + (r[c.key] || "") + "</span>";
          }
          tr.appendChild(td);
        });
        tr.addEventListener("click", function () { openSchool(r.sname); });
        tb.appendChild(tr);
      });
    }

    $("tblInfo").textContent = "共 " + total + " 条 · 第 " + state.page + " / " + pages + " 页";
    renderPager(pages);
  }

  var currentData = [];
  function renderPager(pages) {
    var p = $("pager"); p.innerHTML = "";
    var info = el("span", "pginfo", "每页 " + state.pageSize + " 条");
    p.appendChild(info);
    function btn(label, page, dis, act) {
      var b = el("button", "pgbtn" + (act ? " active" : ""), label);
      b.disabled = !!dis;
      b.addEventListener("click", function () { state.page = page; renderTable(currentData); });
      p.appendChild(b);
    }
    btn("‹", state.page - 1, state.page <= 1);
    var win = 2, from = Math.max(1, state.page - win), to = Math.min(pages, state.page + win);
    if (from > 1) { btn("1", 1); if (from > 2) p.appendChild(el("span", null, "…")); }
    for (var i = from; i <= to; i++) btn(String(i), i, false, i === state.page);
    if (to < pages) { if (to < pages - 1) p.appendChild(el("span", null, "…")); btn(String(pages), pages); }
    btn("›", state.page + 1, state.page >= pages);
  }

  // ---- modal drill-down ----
  function openSchool(sname) {
    var recs = records.filter(function (r) { return r.sname === sname; })
      .sort(function (a, b) { return GRADE_RANK[a.grade] - GRADE_RANK[b.grade]; });
    if (!recs.length) return;
    var s = recs[0];
    var aplus = recs.filter(function (r) { return r.grade === "A+"; }).length;
    var a = recs.filter(function (r) { return r.grade === "A"; }).length;
    var am = recs.filter(function (r) { return r.grade === "A-"; }).length;
    $("modalTitle").textContent = sname;
    $("modalSub").textContent = s.prov + " · " + s.city + " · 共 " + recs.length + " 个参评学科";
    var body = $("modalBody");
    body.innerHTML = "";
    var stats = el("div", "stat-row");
    var ms = [
      { n: recs.length, l: "参评学科" },
      { n: aplus, l: "A+ 顶尖" },
      { n: a + am, l: "A / A-" },
      { n: recs.length - aplus - a - am, l: "B 档及以下" },
    ];
    ms.forEach(function (x) {
      var d = el("div", "stat-mini");
      d.innerHTML = '<div class="n">' + x.n + '</div><div class="l">' + x.l + "</div>";
      stats.appendChild(d);
    });
    body.appendChild(stats);
    var list = el("div", "mini-list");
    recs.forEach(function (r) {
      var row = el("div", "mini-row");
      row.innerHTML = '<span class="g"><span class="grade-badge g-' + r.grade.replace("+", "\\+") + '" style="background:' + gradeColor(r.grade) + '22;color:' + gradeColor(r.grade) + '">' + r.grade + "</span></span>" +
        '<span class="nm">' + r.name + '</span><span class="meta">' + r.cat + " · " + r.code + "</span>";
      row.addEventListener("click", function () { openDiscipline(r.name); });
      list.appendChild(row);
    });
    body.appendChild(list);
    $("modalMask").classList.add("show");
  }

  function openDiscipline(dname) {
    var recs = records.filter(function (r) { return r.name === dname; })
      .sort(function (a, b) { return GRADE_RANK[a.grade] - GRADE_RANK[b.grade]; });
    if (!recs.length) return;
    var s = recs[0];
    $("modalTitle").textContent = dname;
    $("modalSub").textContent = s.cat + " · 学科代码 " + s.code + " · " + recs.length + " 所高校参评";
    var body = $("modalBody"); body.innerHTML = "";
    var aplus = recs.filter(function (r) { return r.grade === "A+"; }).length;
    var stats = el("div", "stat-row");
    [{ n: recs.length, l: "参评高校" }, { n: aplus, l: "A+ 数量" },
     { n: recs.filter(function (r) { return r.grade[0] === "A"; }).length, l: "A 类总数" },
     { n: recs.filter(function (r) { return r.grade[0] === "B"; }).length, l: "B 类总数" }]
      .forEach(function (x) {
        var d = el("div", "stat-mini"); d.innerHTML = '<div class="n">' + x.n + '</div><div class="l">' + x.l + "</div>";
        stats.appendChild(d);
      });
    body.appendChild(stats);
    var list = el("div", "mini-list");
    recs.forEach(function (r) {
      var row = el("div", "mini-row");
      row.innerHTML = '<span class="g"><span class="grade-badge g-' + r.grade.replace("+", "\\+") + '" style="background:' + gradeColor(r.grade) + '22;color:' + gradeColor(r.grade) + '">' + r.grade + "</span></span>" +
        '<span class="nm">' + r.sname + '</span><span class="meta">' + r.prov + " · " + r.city + "</span>";
      row.addEventListener("click", function () { openSchool(r.sname); });
      list.appendChild(row);
    });
    body.appendChild(list);
    $("modalMask").classList.add("show");
  }

  function closeModal() { $("modalMask").classList.remove("show"); }

  // ---- export ----
  function exportCSV() {
    var data = filtered();
    var header = ["学科代码", "学科名称", "学科门类", "学校代码", "学校名称", "评估等级", "省份", "城市"];
    var lines = [header.join(",")];
    data.forEach(function (r) {
      lines.push([r.code, r.name, r.cat, r.scode, r.sname, r.grade, r.prov, r.city].map(function (v) {
        v = String(v == null ? "" : v);
        return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
      }).join(","));
    });
    var blob = new Blob(["﻿" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url; a.download = "学科评估_筛选结果.csv"; a.click();
    setTimeout(function () { URL.revokeObjectURL(url); }, 0);
  }

  // ---- master refresh ----
  function refresh() {
    var data = filtered();
    renderKpis(data);
    renderCharts();
    renderTable(data);
  }

  // ---- resize ----
  window.addEventListener("resize", function () {
    Object.keys(charts).forEach(function (k) { charts[k].resize(); });
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeModal(); });

  // ---- boot ----
  applyThemeToCharts();
  try {
    var saved = localStorage.getItem("ar_theme");
    if (saved) { document.documentElement.setAttribute("data-theme", saved); applyThemeToCharts(); }
  } catch (e) {}
  initControls();
  refresh();
})();


