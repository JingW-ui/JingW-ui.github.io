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
  // 悬停 → 右下角小预览;点击 → 居中放大显示
  div.addEventListener('mouseenter', () => previewExercise(ex));
  div.addEventListener('click', () => openLightbox(ex));
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

/* ---------------- GIF 共享加载系统 ----------------
   右下角预览卡与居中灯箱复用同一份加载状态:请求去重、结果广播。
   gifState: id -> { status:'loading'|'ok'|'fail', url, waiters:[cb] } */

const gifState = new Map();
let previewReqId = null;
let lightboxReqId = null;

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

/* 确保 ex 的 GIF 已解析:ok→cb(url,'ok') / fail→cb(null,'fail') / loading→挂起等待 */
function ensureGif(ex, cb) {
  const st = gifState.get(ex.id);
  if (st && st.status === 'ok') { cb(st.url, 'ok'); return; }
  if (st && st.status === 'fail') { cb(null, 'fail'); return; }
  if (st && st.status === 'loading') { st.waiters.push(cb); return; }
  const entry = { status: 'loading', url: null, waiters: [cb] };
  gifState.set(ex.id, entry);
  const img = new Image();
  loadWithFallback(img, ex.gif,
    () => { entry.status = 'ok'; entry.url = img.src; entry.waiters.forEach(w => w(entry.url, 'ok')); entry.waiters = []; },
    () => { entry.status = 'fail'; entry.waiters.forEach(w => w(null, 'fail')); entry.waiters = []; }
  );
}

/* 把 ex 的 GIF 挂到指定 img + 加载层;isCurrent 用于丢弃过期回调 */
function bindGif(ex, gifEl, loadingEl, isCurrent) {
  const showLoading = () => { gifEl.hidden = true; loadingEl.hidden = false; loadingEl.textContent = '加载动图…'; };
  const showOk = url => { gifEl.src = url; gifEl.hidden = false; loadingEl.hidden = true; };
  const showFail = () => { gifEl.hidden = true; loadingEl.hidden = false; loadingEl.textContent = '动图加载失败'; };
  ensureGif(ex, (url, status) => {
    if (isCurrent && !isCurrent()) return;
    if (status === 'ok' && url) showOk(url);
    else if (status === 'fail') showFail();
  });
  // 首次/进行中:立即显示加载态
  const st = gifState.get(ex.id);
  if (!st || st.status === 'loading') showLoading();
}

/* ---------------- 右下角预览卡(悬停) ---------------- */

function previewExercise(ex) {
  previewReqId = ex.id;
  $('previewName').textContent = ex.name;
  $('previewCard').hidden = false;
  bindGif(ex, $('previewGif'), $('previewLoading'), () => previewReqId === ex.id);
}

function closePreview() {
  previewReqId = null;
  $('previewCard').hidden = true;
  $('previewGif').removeAttribute('src');
}

/* ---------------- 居中放大灯箱(点击) ---------------- */

function openLightbox(ex) {
  lightboxReqId = ex.id;
  closePreview(); // 收起右下角小预览
  $('lightboxName').textContent = ex.name;
  $('lightbox').hidden = false;
  document.body.style.overflow = 'hidden';
  bindGif(ex, $('lightboxGif'), $('lightboxLoading'), () => lightboxReqId === ex.id);
}

function closeLightbox() {
  lightboxReqId = null;
  $('lightbox').hidden = true;
  document.body.style.overflow = '';
  const g = $('lightboxGif');
  g.onload = null; g.onerror = null;
  g.removeAttribute('src');
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

  // 关闭灯箱:× / 遮罩 / Esc
  $('lightboxClose').addEventListener('click', closeLightbox);
  $('lightboxScrim').addEventListener('click', closeLightbox);
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (!$('lightbox').hidden) closeLightbox();
    else if (!$('previewCard').hidden) closePreview();
  });
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
