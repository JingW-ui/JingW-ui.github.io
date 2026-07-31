/* ============================================================
   健身动作数据库 - 应用逻辑
   纯画廊浏览:搜索 + 部位/器械/肌群筛选 + 分页
   卡片为静态展示,不可点击
   ============================================================ */

import { MEDIA_BASE, MEDIA_HOSTS, BODY_PARTS, EQUIPMENT, MUSCLES, t } from './config.js';

const $ = id => document.getElementById(id);

const PAGE_SIZE = 150;

const state = {
  search: '',
  part: null,
  equip: null,
  muscle: null,
  page: 1,
  all: window.EXERCISES || [],
};

/* ---------------- 筛选 ---------------- */

function filtered() {
  const q = state.search.trim().toLowerCase();
  return state.all.filter(ex => {
    if (q && !ex.name.toLowerCase().includes(q) && !String(ex.id).includes(q)) return false;
    if (state.part && ex.body_part !== state.part) return false;
    if (state.equip && ex.equipment !== state.equip) return false;
    if (state.muscle) {
      const hit = ex.target === state.muscle || ex.muscle_group === state.muscle ||
        (ex.secondary_muscles || []).includes(state.muscle);
      if (!hit) return false;
    }
    return true;
  });
}

/* ---------------- 渲染筛选器 ---------------- */

function renderPartChips() {
  const box = $('partChips');
  box.innerHTML = '';
  const all = document.createElement('button');
  all.className = 'chip' + (!state.part ? ' active' : '');
  all.textContent = '全部';
  all.dataset.part = '';
  box.appendChild(all);
  for (const [key, label] of Object.entries(BODY_PARTS)) {
    const chip = document.createElement('button');
    chip.className = 'chip' + (state.part === key ? ' active' : '');
    chip.textContent = label;
    chip.dataset.part = key;
    box.appendChild(chip);
  }
  box.addEventListener('click', e => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    state.part = chip.dataset.part || null;
    resetPage();
    renderPartChips();
    render();
  });
}

function renderSelects() {
  const eq = $('equipSel');
  eq.innerHTML = '<option value="">全部器械</option>' +
    Object.keys(EQUIPMENT).sort().map(k => `<option value="${k}">${t(EQUIPMENT, k)}</option>`).join('');
  eq.value = state.equip || '';

  const mu = $('muscleSel');
  mu.innerHTML = '<option value="">全部肌群</option>' +
    Object.keys(MUSCLES).sort().map(k => `<option value="${k}">${t(MUSCLES, k)} (${k})</option>`).join('');
  mu.value = state.muscle || '';

  eq.addEventListener('change', () => { state.equip = eq.value || null; resetPage(); render(); });
  mu.addEventListener('change', () => { state.muscle = mu.value || null; resetPage(); render(); });
}

function resetPage() { state.page = 1; }

/* ---------------- 渲染画廊 ---------------- */

function render() {
  const list = filtered();
  $('count').textContent = list.length;
  $('emptyHint').hidden = list.length > 0;

  const grid = $('grid');
  const total = list.length;
  const visible = list.slice(0, state.page * PAGE_SIZE);

  grid.innerHTML = '';
  visible.forEach((ex, i) => grid.appendChild(cardEl(ex, i)));

  const moreBtn = $('moreBtn');
  if (total > visible.length) {
    if (!moreBtn) {
      const btn = document.createElement('button');
      btn.id = 'moreBtn';
      btn.className = 'btn-more';
      btn.textContent = `加载更多(${total - visible.length})`;
      btn.addEventListener('click', () => { state.page++; renderMore(); });
      grid.after(btn);
    } else {
      moreBtn.textContent = `加载更多(${total - visible.length})`;
    }
  } else if (moreBtn) {
    moreBtn.remove();
  }
}

function renderMore() {
  const list = filtered();
  const grid = $('grid');
  const start = (state.page - 1) * PAGE_SIZE;
  const next = list.slice(start, start + PAGE_SIZE);
  next.forEach(ex => grid.appendChild(cardEl(ex)));
  const moreBtn = $('moreBtn');
  if (state.page * PAGE_SIZE >= list.length) moreBtn.remove();
  else moreBtn.textContent = `加载更多(${list.length - state.page * PAGE_SIZE})`;
}

function cardEl(ex, idx = 0) {
  const div = document.createElement('div');
  div.className = 'card';
  div.dataset.id = ex.id;
  div.innerHTML = `
    <div class="card-img"></div>
    <div class="card-body">
      <h3 class="card-name" title="${ex.name}">${ex.name}</h3>
      <div class="card-tags">
        <span class="tag part">${t(BODY_PARTS, ex.body_part)}</span>
        <span class="tag equip">${t(EQUIPMENT, ex.equipment)}</span>
        <span class="tag muscle">${t(MUSCLES, ex.target)}</span>
      </div>
    </div>`;
  // 缩略图:懒加载 + CDN fallback
  const img = document.createElement('img');
  img.loading = 'lazy';
  img.alt = ex.name;
  img.dataset.path = ex.image;
  img.addEventListener('error', onCardImgError);
  div.querySelector('.card-img').appendChild(img);
  // 入树后再设置 src,保证 loading=lazy 生效
  requestAnimationFrame(() => { if (!img.src) img.src = MEDIA_BASE + ex.image; });
  // 悬停或点击 → 右下角异步加载动图预览
  div.addEventListener('mouseenter', () => previewExercise(ex));
  div.addEventListener('click', () => previewExercise(ex));
  // 入场动画
  requestAnimationFrame(() => setTimeout(() => div.classList.add('show'), Math.min(idx, 40) * 18));
  return div;
}

function onCardImgError(e) {
  const img = e.target;
  const n = +(img.dataset.tries || 0);
  if (n < MEDIA_HOSTS.length - 1) {
    img.dataset.tries = String(n + 1);
    img.src = MEDIA_HOSTS[n + 1] + img.dataset.path;
  } else {
    // 全部节点失败:隐藏图片,保留灰底与文字
    img.style.visibility = 'hidden';
  }
}

/* ---------------- 右下角动图预览卡 ----------------
   悬停动作卡片时,异步加载该动作的 GIF 在右下角展示。
   已加载过的动作缓存,避免重复请求;快速切换时丢弃过期结果。 */

const previewCache = new Map(); // id -> 'loading' | 'ok' | 'fail'
let previewReqId = null;

function loadWithFallback(imgEl, path, onOk, onFail) {
  const tryHost = i => {
    if (i >= MEDIA_HOSTS.length) {
      imgEl.onload = null; imgEl.onerror = null;
      if (onFail) onFail();
      return;
    }
    imgEl.onload = () => { imgEl.onerror = null; if (onOk) onOk(); };
    imgEl.onerror = () => tryHost(i + 1);
    imgEl.src = MEDIA_HOSTS[i] + path;
  };
  tryHost(0);
}

function previewExercise(ex) {
  previewReqId = ex.id;
  const card = $('previewCard');
  $('previewName').textContent = ex.name;
  card.hidden = false;

  const gif = $('previewGif'), loading = $('previewLoading');
  const st = previewCache.get(ex.id);

  if (st === 'ok') {
    gif.hidden = false;
    loading.hidden = true;
    return;
  }
  if (st === 'loading') return; // 请求进行中,等待完成

  previewCache.set(ex.id, 'loading');
  gif.hidden = true;
  loading.hidden = false;
  loading.textContent = '加载动图…';
  loadWithFallback(gif, ex.gif,
    () => { previewCache.set(ex.id, 'ok'); if (previewReqId !== ex.id) return; loading.hidden = true; gif.hidden = false; },
    () => { previewCache.set(ex.id, 'fail'); if (previewReqId !== ex.id) return; loading.hidden = false; loading.textContent = '动图加载失败'; gif.hidden = true; }
  );
}

function closePreview() {
  previewReqId = null;
  $('previewCard').hidden = true;
  $('previewGif').removeAttribute('src');
}

/* ---------------- 初始化 ---------------- */

function bindUI() {
  $('searchInput').addEventListener('input', e => {
    state.search = e.target.value;
    resetPage();
    render();
  });

  $('resetBtn').addEventListener('click', () => {
    state.search = '';
    state.part = null;
    state.equip = null;
    state.muscle = null;
    $('searchInput').value = '';
    renderPartChips();
    $('equipSel').value = '';
    $('muscleSel').value = '';
    resetPage();
    render();
  });

  // 关闭预览
  $('previewClose').addEventListener('click', closePreview);
}

function init() {
  if (!state.all.length) {
    $('grid').innerHTML = '<div class="result-hint">数据加载失败</div>';
    return;
  }
  renderPartChips();
  renderSelects();
  bindUI();
  render();
}

init();
