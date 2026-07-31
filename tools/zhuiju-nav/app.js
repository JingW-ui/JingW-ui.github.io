/* =====================================================
   免费追剧资源导航 app.js
   数据流：内置快照 data.js（同步首屏）→ jsDelivr/raw 拉最新 → 失败回退快照
   纯静态、零依赖，仅依赖 Font Awesome（CSS 图标）
   ===================================================== */
(function () {
  'use strict';

  /* ---------- 常量 ---------- */
  var CDN_SOURCES = [
    'https://cdn.jsdelivr.net/gh/laoma2053/awesome-zhuiju-free@main/resources/resources.json',
    'https://raw.githubusercontent.com/laoma2053/awesome-zhuiju-free/main/resources/resources.json'
  ];

  var CATEGORY_LABELS = {
    online_video: '在线影视',
    tvbox_config: 'TVBox接口',
    open_source: '开源项目',
    magnet_search: '磁力BT',
    cloud_search: '网盘搜索',
    video_app: '影视APP',
    subtitles: '字幕',
    player: '播放器',
    subscription: '订阅/直播源',
    membership: '会员',
    other: '其他'
  };

  var CATEGORY_ORDER = [
    'online_video', 'video_app', 'cloud_search', 'magnet_search',
    'subtitles', 'player', 'subscription', 'tvbox_config', 'open_source'
  ];

  var SCORE_LABELS = { more: '资源', speed: '速度', clean: '干净', stable: '稳定', ease: '易用' };
  var RISK_LABELS = { copyright: '版权', safety: '安全', privacy: '隐私', payment: '支付' };
  var RISK_TEXT = { low: '低', medium: '中', high: '高', unknown: '未知' };
  var FREE_TEXT = { free: '免费', mostly_free: '基本免费', partly_free: '部分免费', paid: '付费', unknown: '' };

  /* ---------- 状态 ---------- */
  var state = {
    data: [],
    meta: null,
    category: 'all',
    search: '',
    sort: 'default'
  };

  /* ---------- DOM ---------- */
  var gridEl = document.getElementById('grid');
  var tabsEl = document.getElementById('tabs');
  var searchEl = document.getElementById('searchInput');
  var sortEl = document.getElementById('sortSelect');
  var emptyEl = document.getElementById('empty');
  var emptyTextEl = document.getElementById('emptyText');
  var resultInfoEl = document.getElementById('resultInfo');
  var statusTextEl = document.getElementById('statusText');
  var statusPillEl = document.getElementById('statusPill');

  /* ---------- 工具函数 ---------- */
  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function debounce(fn, ms) {
    var t;
    return function () {
      var args = arguments, self = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(self, args); }, ms);
    };
  }

  function isValidPayload(d) {
    return !!(d && Array.isArray(d.resources) && d.resources.length > 0);
  }

  function fetchJSONWithTimeout(url, ms) {
    ms = ms || 6000;
    var ctrl = new AbortController();
    var timer = setTimeout(function () { ctrl.abort(); }, ms);
    return fetch(url, { signal: ctrl.signal, cache: 'no-cache' }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    }).finally(function () {
      clearTimeout(timer);
    });
  }

  function scoreAvg(scores) {
    if (!scores) return null;
    var dims = ['more', 'speed', 'clean', 'stable', 'ease'];
    var sum = 0, n = 0;
    for (var i = 0; i < dims.length; i++) {
      var v = Number(scores[dims[i]]);
      if (isFinite(v)) { sum += v; n++; }
    }
    return n ? Math.round((sum / n) * 10) / 10 : null;
  }

  function normalizeResource(r, idx) {
    return {
      id: r.id || ('r' + idx),
      name: r.name || '未命名',
      url: r.url || '',
      link_url: r.link_url || '',
      category: CATEGORY_LABELS[r.category] ? r.category : 'other',
      summary: r.summary || '',
      summary_short: r.summary_short || '',
      tags: Array.isArray(r.tags) ? r.tags : [],
      platforms: Array.isArray(r.platforms) ? r.platforms : [],
      access: r.access || {},
      scores: r.scores || {},
      risks: r.risks || {},
      verification: r.verification || {},
      source: r.source || {},
      github: r.github || null,
      order: idx
    };
  }

  /* ---------- 数据加载 ---------- */
  function setData(payload) {
    if (!isValidPayload(payload)) {
      state.data = [];
      state.meta = null;
      renderAll();
      setStatus('error');
      return;
    }
    state.meta = {
      updated_at: payload.updated_at || '',
      version: payload.version,
      source: 'cdn'
    };
    state.data = payload.resources.map(normalizeResource);
    renderAll();
  }

  function setStatus(kind, extra) {
    var map = {
      loading:  ['加载中…', ''],
      checking: ['正在检测最新数据…', ''],
      fresh:    ['已更新至 ' + (extra || '—'), ''],
      same:     ['数据已是最新 · ' + (extra || ''), ''],
      stale:    ['离线快照 · ' + (extra || ''), 'stale'],
      error:    ['数据加载失败', 'stale']
    };
    var m = map[kind] || map.loading;
    statusTextEl.textContent = m[0];
    statusPillEl.classList.toggle('is-stale', m[1] === 'stale');
  }

  function loadData() {
    var snapshot = window.ZHUJU_DATA || null;

    if (isValidPayload(snapshot)) {
      setData(snapshot);
      state.meta.source = 'snapshot';
    } else {
      setData(snapshot); // 置空
      setStatus('checking');
    }

    var chain = CDN_SOURCES.reduce(function (p, url) {
      return p.catch(function () { return fetchJSONWithTimeout(url); });
    }, Promise.reject());

    chain.then(function (fresh) {
      if (!fresh || !fresh.updated_at) return;
      var snapDate = snapshot && snapshot.updated_at;
      if (fresh.updated_at !== snapDate) {
        state.meta.source = 'cdn';
        setData(fresh);
        setStatus('fresh', fresh.updated_at);
      } else {
        setStatus('same', fresh.updated_at);
      }
    }).catch(function () {
      if (isValidPayload(snapshot)) setStatus('stale', snapshot.updated_at);
      else setStatus('error');
    });
  }

  /* ---------- 渲染：筛选 + 排序 ---------- */
  function matchSearch(r, q) {
    if (!q) return true;
    var hay = [r.name, r.summary_short, r.summary, CATEGORY_LABELS[r.category]]
      .concat(r.tags, r.platforms)
      .join(' ').toLowerCase();
    return hay.indexOf(q) !== -1;
  }

  function filterAndSort() {
    var q = state.search.trim().toLowerCase();
    var list = state.data.filter(function (r) {
      if (state.category !== 'all' && r.category !== state.category) return false;
      return matchSearch(r, q);
    });

    if (state.sort === 'rating') {
      list.sort(function (a, b) {
        var av = scoreAvg(a.scores) || 0;
        var bv = scoreAvg(b.scores) || 0;
        return bv - av;
      });
    } else if (state.sort === 'latest') {
      list.sort(function (a, b) {
        return String(b.source.added_at || '').localeCompare(String(a.source.added_at || ''));
      });
    } else {
      list.sort(function (a, b) { return a.order - b.order; });
    }
    return list;
  }

  /* ---------- 渲染：评分点阵 ---------- */
  function dotRow(score) {
    var s = Math.max(0, Math.min(5, Number(score) || 0));
    var full = Math.floor(s);
    var half = 0;
    var frac = s - full;
    if (frac >= 0.75) { full += 1; }
    else if (frac >= 0.25) { half = 1; }
    full = Math.min(full, 5);
    var html = '';
    for (var i = 0; i < full; i++) html += '<span class="dot on"></span>';
    if (half && full < 5) html += '<span class="dot half"></span>';
    for (var j = full + half; j < 5; j++) html += '<span class="dot"></span>';
    return html;
  }

  function renderScores(scores) {
    var rows = '';
    var dims = ['more', 'speed', 'clean', 'stable', 'ease'];
    for (var i = 0; i < dims.length; i++) {
      var d = dims[i];
      var v = Number(scores[d]);
      rows += '<div class="score-row">' +
        '<span class="s-label">' + SCORE_LABELS[d] + '</span>' +
        '<span class="dots">' + dotRow(isFinite(v) ? v : 0) + '</span>' +
        '</div>';
    }
    return '<div class="card-scores">' + rows + '</div>';
  }

  /* ---------- 渲染：风险胶囊 ---------- */
  function renderRisks(risks) {
    var html = '';
    var keys = ['copyright', 'safety', 'privacy', 'payment'];
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      var lvl = risks[k] || 'unknown';
      if (!RISK_TEXT[lvl]) lvl = 'unknown';
      html += '<span class="risk risk-' + lvl + '" title="' +
        RISK_LABELS[k] + '风险：' + RISK_TEXT[lvl] + '">' +
        RISK_LABELS[k] + ' ' + RISK_TEXT[lvl] + '</span>';
    }
    return '<div class="card-risks">' + html + '</div>';
  }

  /* ---------- 渲染：卡片 ---------- */
  function formatStars(stars) {
    if (stars == null) return null;
    return stars >= 1000 ? (stars / 1000).toFixed(1) + 'k' : String(stars);
  }

  function cardHTML(r, idx) {
    var openUrl = r.link_url || r.url;
    var avg = scoreAvg(r.scores);
    var circleClass = '';
    if (avg != null) {
      if (avg >= 4) circleClass = '';
      else if (avg >= 3) circleClass = ' is-gold';
      else circleClass = ' is-red';
    }

    var statusBadge = '';
    if (r.verification.status === 'recommended') {
      statusBadge = '<span class="badge badge-ok"><i class="fa-solid fa-star" style="font-size:9px"></i> 推荐</span>';
    } else if (r.verification.status === 'caution') {
      statusBadge = '<span class="badge badge-warn"><i class="fa-solid fa-triangle-exclamation" style="font-size:9px"></i> 谨慎</span>';
    }

    // 访问信息 chips
    var accessChips = '';
    if (r.access.requires_login) accessChips += '<span class="tag">需登录</span>';
    if (r.access.free_level && FREE_TEXT[r.access.free_level]) {
      accessChips += '<span class="tag">' + FREE_TEXT[r.access.free_level] + '</span>';
    }

    // tags（截断）
    var tags = (r.github && r.github.stars != null)
      ? ['★ ' + formatStars(r.github.stars)].concat(r.tags)
      : r.tags.slice();
    var shown = tags.slice(0, 6);
    var tagHTML = shown.map(function (t) {
      return '<span class="tag">' + escapeHtml(t) + '</span>';
    }).join('');
    if (tags.length > shown.length) {
      tagHTML += '<span class="tag">+' + (tags.length - shown.length) + '</span>';
    }
    if (accessChips) tagHTML += accessChips;

    var delay = Math.min(idx, 24) * 22;

    var configBtn = '';
    if (r.category === 'tvbox_config' && r.url) {
      configBtn = '<button class="btn btn-config" data-action="copy" data-url="' + escapeHtml(r.url) +
        '" data-label="复制接口" title="复制 TVBox/影视仓配置地址"><i class="fa-solid fa-clipboard"></i> 复制接口</button>';
    }

    return '<div class="card" style="animation-delay:' + delay + 'ms">' +
      '<div class="card-header">' +
        '<div>' +
          '<h3 class="card-name">' + escapeHtml(r.name) + '</h3>' +
          '<div class="card-badges">' +
            '<span class="badge badge-cat">' + escapeHtml(CATEGORY_LABELS[r.category] || r.category) + '</span>' +
            statusBadge +
          '</div>' +
        '</div>' +
        '<div class="score-circle' + circleClass + '" title="综合评分（多/快/净/稳/易 均分）">' +
          (avg != null ? avg.toFixed(1) : '–') +
        '</div>' +
      '</div>' +
      '<p class="card-desc">' + escapeHtml(r.summary_short || r.summary) + '</p>' +
      '<div class="card-tags">' + tagHTML + '</div>' +
      renderScores(r.scores) +
      renderRisks(r.risks) +
      '<div class="card-actions">' +
        '<a class="btn btn-open" href="' + escapeHtml(openUrl) + '" target="_blank" rel="noopener noreferrer" title="' + escapeHtml(openUrl) + '">' +
          '<i class="fa-solid fa-arrow-up-right-from-square"></i> 打开</a>' +
        '<button class="btn btn-ghost" data-action="copy" data-url="' + escapeHtml(openUrl) +
          '" data-label="复制链接" title="' + escapeHtml(openUrl) + '"><i class="fa-solid fa-link"></i> 复制链接</button>' +
        configBtn +
      '</div>' +
    '</div>';
  }

  /* ---------- 渲染：汇总 ---------- */
  function renderTabs() {
    var counts = {};
    state.data.forEach(function (r) {
      counts[r.category] = (counts[r.category] || 0) + 1;
    });

    var html = '<div class="tab' + (state.category === 'all' ? ' active' : '') +
      '" data-cat="all" role="tab" aria-selected="' + (state.category === 'all') + '">全部<span class="count">' +
      state.data.length + '</span></div>';

    CATEGORY_ORDER.forEach(function (cat) {
      if (!counts[cat]) return;
      html += '<div class="tab' + (state.category === cat ? ' active' : '') + '" data-cat="' + cat +
        '" role="tab" aria-selected="' + (state.category === cat) + '">' +
        CATEGORY_LABELS[cat] + '<span class="count">' + counts[cat] + '</span></div>';
    });

    // 不在预置顺序里的分类追加到末尾
    Object.keys(counts).forEach(function (cat) {
      if (CATEGORY_ORDER.indexOf(cat) === -1) {
        html += '<div class="tab' + (state.category === cat ? ' active' : '') + '" data-cat="' + cat +
          '" role="tab">' + CATEGORY_LABELS[cat] || cat + '<span class="count">' + counts[cat] + '</span></div>';
      }
    });

    tabsEl.innerHTML = html;
  }

  function renderGrid() {
    var list = filterAndSort();
    var html = list.map(cardHTML).join('');
    gridEl.innerHTML = html;

    emptyEl.hidden = list.length > 0;
    if (list.length === 0) {
      emptyTextEl.textContent = state.search.trim() ? '没有找到与「' + state.search.trim() + '」匹配的资源' : '该分类暂无资源';
    }
    resultInfoEl.textContent = '共 ' + list.length + ' 条资源';
  }

  function renderStats() {
    var total = document.getElementById('statTotal');
    var cats = document.getElementById('statCats');
    var updated = document.getElementById('statUpdated');
    if (total) total.textContent = state.data.length;
    if (cats) cats.textContent = Object.keys(state.data.reduce(function (o, r) { o[r.category] = 1; return o; }, {})).length;
    if (updated) updated.textContent = state.meta ? state.meta.updated_at : '—';
    var meta = document.getElementById('footerMeta');
    if (meta) {
      meta.textContent = state.meta
        ? '内置快照更新于 ' + state.meta.updated_at + ' · 运行时将从 jsDelivr 拉取最新数据'
        : '';
    }
  }

  function renderAll() {
    renderTabs();
    renderGrid();
    renderStats();
  }

  /* ---------- 复制 ---------- */
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      try {
        document.execCommand('copy') ? resolve() : reject(new Error('copy failed'));
      } catch (e) {
        reject(e);
      } finally {
        ta.remove();
      }
    });
  }

  function handleCopyClick(e) {
    var btn = e.target.closest('button[data-action="copy"]');
    if (!btn) return;
    var url = btn.getAttribute('data-url');
    var label = btn.getAttribute('data-label') || '复制链接';
    if (!url) return;
    copyText(url).then(function () {
      btn.classList.add('copied');
      btn.innerHTML = '<i class="fa-solid fa-check"></i> 已复制';
      setTimeout(function () {
        btn.classList.remove('copied');
        btn.innerHTML = '<i class="fa-solid ' + (label === '复制接口' ? 'fa-clipboard' : 'fa-link') + '"></i> ' + label;
      }, 1800);
    }).catch(function () {
      btn.classList.add('copied');
      btn.innerHTML = '<i class="fa-solid fa-xmark"></i> 失败';
      setTimeout(function () {
        btn.classList.remove('copied');
        btn.innerHTML = '<i class="fa-solid ' + (label === '复制接口' ? 'fa-clipboard' : 'fa-link') + '"></i> ' + label;
      }, 1800);
    });
  }

  /* ---------- 事件 ---------- */
  function bindEvents() {
    tabsEl.addEventListener('click', function (e) {
      var tab = e.target.closest('.tab');
      if (!tab) return;
      state.category = tab.getAttribute('data-cat') || 'all';
      renderTabs();
      renderGrid();
    });

    searchEl.addEventListener('input', debounce(function () {
      state.search = searchEl.value;
      renderGrid();
    }, 200));

    sortEl.addEventListener('change', function () {
      state.sort = sortEl.value;
      renderGrid();
    });

    gridEl.addEventListener('click', handleCopyClick);

    document.getElementById('emptyReset').addEventListener('click', function () {
      state.search = '';
      state.category = 'all';
      searchEl.value = '';
      sortEl.value = 'default';
      state.sort = 'default';
      renderAll();
      searchEl.focus();
    });
  }

  /* ---------- 启动 ---------- */
  function init() {
    bindEvents();
    setStatus('loading');
    loadData();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
