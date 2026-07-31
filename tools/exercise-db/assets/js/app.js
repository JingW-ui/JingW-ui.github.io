/* ============================================================
   健身动作数据库 - 应用逻辑
   ============================================================ */

import { MEDIA_BASE, BODY_PARTS, EQUIPMENT, MUSCLES, t } from './config.js';

const $ = id => document.getElementById(id);

const PAGE_SIZE = 150;

const state = {
  search: '',
  part: null,
  equip: null,
  muscle: null,
  lang: 'zh',
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

  // 重建 grid(分页显示)
  grid.innerHTML = '';
  visible.forEach((ex, i) => grid.appendChild(cardEl(ex, i)));

  // 加载更多按钮
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

/* 分页追加(无整页重排,避免闪烁) */
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
    <div class="card-img">
      <img loading="lazy" src="${MEDIA_BASE}${ex.image}" alt="${ex.name}">
    </div>
    <div class="card-body">
      <h3 class="card-name" title="${ex.name}">${ex.name}</h3>
      <div class="card-tags">
        <span class="tag part">${t(BODY_PARTS, ex.body_part)}</span>
        <span class="tag equip">${t(EQUIPMENT, ex.equipment)}</span>
        <span class="tag muscle">${t(MUSCLES, ex.target)}</span>
      </div>
    </div>`;
  // 入场动画
  requestAnimationFrame(() => setTimeout(() => div.classList.add('show'), Math.min(idx, 40) * 18));
  return div;
}

/* ---------------- 详情弹窗 ---------------- */

function openModal(id) {
  const ex = state.all.find(x => x.id === id);
  if (!ex) return;
  state.lang = 'zh';

  const img = $('mImg'), gif = $('mGif');
  img.src = MEDIA_BASE + ex.image;
  gif.src = MEDIA_BASE + ex.gif;
  gif.hidden = true;
  $('gifToggle').textContent = '▶ 播放动画';

  $('mName').textContent = ex.name;
  $('mBadges').innerHTML = `
    <span class="tag part">${t(BODY_PARTS, ex.body_part)}</span>
    <span class="tag equip">${t(EQUIPMENT, ex.equipment)}</span>
    <span class="tag muscle">${t(MUSCLES, ex.target)}</span>`;

  const muscles = [`主要肌群: ${muscleLabel(ex.muscle_group)}`];
  if (ex.secondary_muscles && ex.secondary_muscles.length) {
    muscles.push(`次要肌群: ${ex.secondary_muscles.map(muscleLabel).join('、')}`);
  }
  $('mMuscles').textContent = muscles.join(' · ');
  $('mAttr').textContent = ex.attr || '';

  renderSteps(ex);
  $('modal').hidden = false;
  document.body.style.overflow = 'hidden';
}

function muscleLabel(m) { return `${t(MUSCLES, m)} (${m})`; }

function renderSteps(ex) {
  const steps = (ex.steps && ex.steps[state.lang]) || [];
  const fallback = steps.length ? null : ((ex.steps && ex.steps.zh) || ex.steps.en || []);
  const list = steps.length ? steps : (fallback || []);
  const ol = $('mSteps');
  ol.innerHTML = list.length
    ? list.map(s => `<li>${s}</li>`).join('')
    : '<li>该语言暂无分步教程</li>';
  $('mLangBtn').textContent = state.lang === 'zh' ? 'EN 英文' : '中文';
}

function closeModal() {
  $('modal').hidden = true;
  document.body.style.overflow = '';
  $('mImg').removeAttribute('src');
  $('mGif').removeAttribute('src');
}

/* ---------------- 随机 ---------------- */

function randomExercise() {
  const ex = state.all[Math.floor(Math.random() * state.all.length)];
  openModal(ex.id);
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
    state.lang = 'zh';
    $('searchInput').value = '';
    renderPartChips();
    $('equipSel').value = '';
    $('muscleSel').value = '';
    resetPage();
    render();
  });

  $('randomBtn').addEventListener('click', randomExercise);

  // 卡片点击(委托,记录当前 id 供中英切换使用)
  $('grid').addEventListener('click', e => {
    const card = e.target.closest('.card');
    if (card) {
      state._currentId = card.dataset.id;
      openModal(card.dataset.id);
    }
  });

  // 弹窗关闭
  $('modalClose').addEventListener('click', closeModal);
  $('modalScrim').addEventListener('click', closeModal);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  // 动画播放切换 + hover 自动预览
  const media = document.querySelector('.media');
  const gifToggle = $('gifToggle');
  const swapToGif = () => {
    if ($('mImg').src) { $('mImg').hidden = true; $('mGif').hidden = false; gifToggle.textContent = '■ 停止'; }
  };
  const swapToImg = () => {
    if ($('mImg').src) { $('mImg').hidden = false; $('mGif').hidden = true; gifToggle.textContent = '▶ 播放动画'; }
  };
  gifToggle.addEventListener('click', () => ($('mGif').hidden ? swapToGif() : swapToImg()));
  media.addEventListener('mouseenter', swapToGif);
  media.addEventListener('mouseleave', swapToImg);

  // 中英切换
  $('mLangBtn').addEventListener('click', () => {
    state.lang = state.lang === 'zh' ? 'en' : 'zh';
    const ex = state.all.find(x => x.id === state._currentId);
    if (ex) renderSteps(ex);
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
