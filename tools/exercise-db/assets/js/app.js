/* ============================================================
   健身动作数据库 - 应用逻辑
   纯画廊浏览:搜索 + 部位/器械/肌群筛选 + 分页
   卡片为静态展示,不可点击
   ============================================================ */

import { MEDIA_BASE, MEDIA_HOSTS, BODY_PARTS, EQUIPMENT, MUSCLES } from './config.js';

const $ = id => document.getElementById(id);

const PAGE_SIZE = 150;

const LANG_KEY = 'exercise_db_lang';

const state = {
  search: '',
  part: null,
  equip: null,
  muscle: null,
  page: 1,
  all: window.EXERCISES || [],
  lang: 'zh', // 默认中文;localStorage 记忆
};
try { state.lang = localStorage.getItem(LANG_KEY) === 'en' ? 'en' : 'zh'; } catch (e) { /* ignore */ }

/* 名称与标签的多语言取值:中文优先用 name_zh / 词表,英文用原文 */
const nm = ex => state.lang === 'zh' ? (ex.name_zh || ex.name) : ex.name;
const lb = (map, key) => state.lang === 'zh' ? (map[key] || key) : key;

/* ---------------- 筛选 ---------------- */

function filtered() {
  const q = state.search.trim().toLowerCase();
  return state.all.filter(ex => {
    if (q && !ex.name.toLowerCase().includes(q) &&
        !(ex.name_zh || '').toLowerCase().includes(q) &&
        !String(ex.id).includes(q)) return false;
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
  for (const [key] of Object.entries(BODY_PARTS)) {
    const chip = document.createElement('button');
    chip.className = 'chip' + (state.part === key ? ' active' : '');
    chip.textContent = lb(BODY_PARTS, key);
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
  const zh = state.lang === 'zh';
  const eq = $('equipSel');
  eq.innerHTML = '<option value="">' + (zh ? '全部器械' : 'All equipment') + '</option>' +
    Object.keys(EQUIPMENT).sort().map(k => `<option value="${k}">${lb(EQUIPMENT, k)}</option>`).join('');
  eq.value = state.equip || '';

  const mu = $('muscleSel');
  mu.innerHTML = '<option value="">' + (zh ? '全部肌群' : 'All muscles') + '</option>' +
    Object.keys(MUSCLES).sort().map(k => `<option value="${k}">${zh ? `${lb(MUSCLES, k)} (${k})` : k}</option>`).join('');
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
      <h3 class="card-name" title="${nm(ex)}">${nm(ex)}</h3>
      <div class="card-tags">
        <span class="tag part">${lb(BODY_PARTS, ex.body_part)}</span>
        <span class="tag equip">${lb(EQUIPMENT, ex.equipment)}</span>
        <span class="tag muscle">${lb(MUSCLES, ex.target)}</span>
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

/* ---------------- 周训计划 ---------------- */

const DAY_NAMES = {
  zh: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
  en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
};

/* 训练目标 → 数据中的身体部位 */
const TARGETS = {
  chest:     { label: '胸部', en: 'Chest', parts: ['chest'] },
  back:      { label: '背部', en: 'Back', parts: ['back'] },
  shoulders: { label: '肩部', en: 'Shoulders', parts: ['shoulders'] },
  arms:      { label: '手臂', en: 'Arms', parts: ['upper arms', 'lower arms'] },
  legs:      { label: '腿部', en: 'Legs', parts: ['upper legs', 'lower legs'] },
  waist:     { label: '腰腹', en: 'Core', parts: ['waist'] },
  cardio:    { label: '有氧', en: 'Cardio', parts: ['cardio'] },
  rest:      { label: '休息', en: 'Rest', parts: [] },
};
const targetLabel = key => state.lang === 'zh' ? (TARGETS[key] ? TARGETS[key].label : key) : (TARGETS[key] ? TARGETS[key].en : key);

/* 周计划模板 */
const TEMPLATES = {
  ppl:        { label: '推拉腿', days: ['chest', 'back', 'legs', 'chest', 'back', 'legs', 'rest'] },
  upperlower: { label: '上下肢', days: ['chest', 'legs', 'back', 'legs', 'shoulders', 'arms', 'rest'] },
  fullbody:   { label: '全身', days: ['chest', 'back', 'legs', 'waist', 'chest', 'back', 'rest'] },
  custom:     { label: '自定义', days: ['rest', 'rest', 'rest', 'rest', 'rest', 'rest', 'rest'] },
};

const PLAN_KEY = 'exercise_db_plan';

const plan = { template: 'ppl', count: 5, days: [] };

/* 组数 × 每组次数建议(按身体部位 + 器械的规则区间,支持中英) */
function suggestSets(ex) {
  const zh = state.lang === 'zh';
  if (ex.body_part === 'cardio') return zh ? '3 组 × 30-60 秒' : '3 sets × 30-60 sec';
  const base = {
    chest: [4, '8-12'], back: [4, '8-12'], shoulders: [3, '10-15'],
    'upper arms': [3, '10-15'], 'lower arms': [3, '12-15'],
    'upper legs': [4, '8-12'], 'lower legs': [4, '12-20'],
    waist: [3, '15-20'], neck: [3, '12-15'],
  };
  const [sets, def] = base[ex.body_part] || [3, '10-15'];
  let reps = def;
  // 大重量复合(杠铃类)→ 偏低次数练力量/肌肥大
  if (['barbell', 'olympic barbell', 'trap bar', 'smith machine'].includes(ex.equipment)) reps = '6-10';
  // 徒手/自重 → 偏高次数
  if (ex.equipment === 'body weight') reps = ex.body_part === 'waist' ? '15-25' : '12-20';
  // 弹力带/平衡类 → 高次数
  if (['band', 'resistance band', 'stability ball', 'bosu ball'].includes(ex.equipment)) reps = '12-20';
  return zh ? `${sets} 组 × ${reps} 次` : `${sets} sets × ${reps} reps`;
}

function poolForTarget(target) {
  const parts = TARGETS[target] ? TARGETS[target].parts : [];
  return state.all.filter(ex => parts.includes(ex.body_part));
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* 生成某目标的一天动作:优先未在其它天用过的动作,数量不足则从全池补 */
function generateExercises(target, count, usedIds) {
  if (target === 'rest') return [];
  const pool = poolForTarget(target);
  if (!pool.length) return [];
  const fresh = pool.filter(ex => !usedIds.has(ex.id));
  const src = fresh.length >= count ? fresh : pool;
  return shuffle(src).slice(0, count).map(ex => ex.id);
}

function buildPlan(template, count) {
  const tpl = TEMPLATES[template] || TEMPLATES.ppl;
  const used = new Set();
  return tpl.days.map(target => {
    const exIds = generateExercises(target, count, used);
    exIds.forEach(id => used.add(id));
    return { target, exIds };
  });
}

function usedIdsExcept(i) {
  const s = new Set();
  plan.days.forEach((d, k) => { if (k !== i) d.exIds.forEach(id => s.add(id)); });
  return s;
}

/* localStorage 持久化 */
function loadPlan() {
  try {
    const raw = localStorage.getItem(PLAN_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      if (p && Array.isArray(p.days) && p.days.length === 7) { Object.assign(plan, p); return; }
    }
  } catch (e) { /* ignore */ }
  plan.template = TEMPLATES[plan.template] ? plan.template : 'ppl';
  plan.days = buildPlan(plan.template, plan.count);
}

let savedTimer = null;
function savePlan() {
  try {
    localStorage.setItem(PLAN_KEY, JSON.stringify(plan));
    const el = $('planSaved');
    el.hidden = false;
    clearTimeout(savedTimer);
    savedTimer = setTimeout(() => { el.hidden = true; }, 1500);
  } catch (e) { /* ignore */ }
}

function renderPlan() {
  const grid = $('planGrid');
  grid.innerHTML = '';
  plan.days.forEach((day, i) => {
    const rest = day.target === 'rest';
    const card = document.createElement('div');
    card.className = 'plan-day' + (rest ? ' rest' : '');
    card.dataset.day = i;

    const head = document.createElement('div');
    head.className = 'plan-day-head';
    const name = document.createElement('span');
    name.className = 'plan-day-name';
    name.textContent = DAY_NAMES[state.lang][i];
    const sel = document.createElement('select');
    sel.className = 'filter-select plan-day-target';
    sel.innerHTML = Object.entries(TARGETS).map(([k, v]) => `<option value="${k}">${targetLabel(k)}</option>`).join('');
    sel.value = day.target;
    sel.addEventListener('change', () => {
      day.target = sel.value;
      day.exIds = generateExercises(day.target, plan.count, usedIdsExcept(i));
      savePlan();
      renderPlan();
    });
    const resh = document.createElement('button');
    resh.className = 'plan-day-reshuffle';
    resh.textContent = '↻';
    resh.title = '换一批';
    resh.addEventListener('click', () => {
      day.exIds = generateExercises(day.target, plan.count, usedIdsExcept(i));
      savePlan();
      renderPlan();
    });
    head.append(name, sel, resh);
    card.appendChild(head);

    const list = document.createElement('ul');
    list.className = 'plan-day-list';
    if (rest) {
      const li = document.createElement('li');
      li.className = 'plan-day-empty';
      li.textContent = state.lang === 'zh' ? '🛌 休息日' : '🛌 Rest Day';
      list.appendChild(li);
    } else if (day.exIds.length) {
      day.exIds.forEach((id, k) => {
        const ex = state.all.find(x => x.id === id);
        if (!ex) return;
        const li = document.createElement('li');
        li.innerHTML = `<span class="idx">${k + 1}</span><span class="en">${nm(ex)}</span><span class="sets">${suggestSets(ex)}</span>`;
        li.addEventListener('click', () => openLightbox(ex));
        list.appendChild(li);
      });
    } else {
      const li = document.createElement('li');
      li.className = 'plan-day-empty';
      li.textContent = '暂无动作,点↻生成';
      list.appendChild(li);
    }
    card.appendChild(list);
    grid.appendChild(card);
  });
}

function renderPlanControls() {
  const t = $('planTemplate');
  t.innerHTML = Object.entries(TEMPLATES).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join('');
  t.value = plan.template;
  const c = $('planCount');
  c.innerHTML = [4, 5, 6, 7, 8].map(n => `<option value="${n}">${n}</option>`).join('');
  c.value = plan.count;
}

function bindPlanUI() {
  $('planTemplate').addEventListener('change', () => {
    plan.template = $('planTemplate').value;
    plan.days = buildPlan(plan.template, plan.count);
    savePlan();
    renderPlan();
  });
  $('planCount').addEventListener('change', () => {
    plan.count = +$('planCount').value;
    plan.days = buildPlan(plan.template, plan.count);
    savePlan();
    renderPlan();
  });
  $('planGenerate').addEventListener('click', () => {
    plan.days = buildPlan(plan.template, plan.count);
    savePlan();
    renderPlan();
  });
  $('planClear').addEventListener('click', () => {
    plan.days = Array.from({ length: 7 }, () => ({ target: 'rest', exIds: [] }));
    savePlan();
    renderPlan();
  });
}

/* 语言切换:重绘所有按语言变化的界面 */
function applyLang() {
  const btn = $('langToggle');
  if (btn) btn.textContent = state.lang === 'zh' ? '中文' : 'EN';
  renderPartChips();
  renderSelects();
  render();
  renderPlan();
}

/* 视图切换:动作库 / 周训计划 / 月训打卡 */
function bindViewTabs() {
  $('viewTabs').addEventListener('click', e => {
    const btn = e.target.closest('.view-tab');
    if (!btn) return;
    document.querySelectorAll('.view-tab').forEach(b => b.classList.toggle('active', b === btn));
    $('galleryView').hidden = btn.dataset.view !== 'gallery';
    $('planView').hidden = btn.dataset.view !== 'plan';
    $('checkinView').hidden = btn.dataset.view !== 'checkin';
    if (btn.dataset.view === 'plan') renderPlan();
    if (btn.dataset.view === 'checkin') renderCheckin();
  });
}

/* ---------------- 月训打卡 ----------------
   前台 + 近 30s 内有操作 → 每秒计为今日活跃;达到阈值自动打卡(每天一次)。
   挂机(超 30s 无操作)或切后台不计;数据存 localStorage。 */

const CHECKIN_KEY = 'exercise_db_checkin';
const IDLE_MS = 30000;

const checkin = {
  threshold: 1200, // 秒(默认 20 分钟)
  days: {},         // 'YYYY-MM-DD' -> { sec, checked, ts }
  today: '',
  secToday: 0,
  lastActivity: 0,
  tickCount: 0,
};

function fmtDate(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function checkinTodayKey() { return fmtDate(new Date()); }

function loadCheckin() {
  try {
    const raw = localStorage.getItem(CHECKIN_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      if (p && p.days) Object.assign(checkin, p);
    }
  } catch (e) { /* ignore */ }
  checkin.today = checkinTodayKey();
  if (!checkin.days[checkin.today]) checkin.days[checkin.today] = { sec: 0, checked: false, ts: 0 };
  checkin.secToday = checkin.days[checkin.today].sec;
  checkin.lastActivity = Date.now();
}

function saveCheckin() {
  try { localStorage.setItem(CHECKIN_KEY, JSON.stringify({ threshold: checkin.threshold, days: checkin.days })); } catch (e) { /* ignore */ }
}

function markActivity() { checkin.lastActivity = Date.now(); }

/* 每秒 tick:前台且有操作 → 累计活跃秒;达标 → 打卡;定期落盘 */
function checkinTick() {
  const now = Date.now();
  const key = checkinTodayKey();
  if (key !== checkin.today) {
    checkin.today = key;
    if (!checkin.days[key]) checkin.days[key] = { sec: 0, checked: false, ts: 0 };
    checkin.secToday = checkin.days[key].sec;
  }
  const rec = checkin.days[key];
  if (document.visibilityState === 'visible' && now - checkin.lastActivity < IDLE_MS) {
    rec.sec++;
    checkin.secToday = rec.sec;
    if (!rec.checked && rec.sec >= checkin.threshold) {
      rec.checked = true;
      rec.ts = now;
      saveCheckin();
    }
  }
  checkin.tickCount++;
  if (checkin.tickCount % 10 === 0) saveCheckin();
  // 打卡视图可见时实时刷新
  if (!$('checkinView').hidden) renderCheckin();
}

function startActivityTracking() {
  const throttledMove = (() => {
    let last = 0;
    return () => { const n = Date.now(); if (n - last >= 500) { last = n; checkin.lastActivity = n; } };
  })();
  ['pointermove', 'mousedown', 'touchstart', 'keydown', 'scroll'].forEach(ev =>
    window.addEventListener(ev, ev === 'pointermove' ? throttledMove : markActivity, { passive: true })
  );
  window.addEventListener('pagehide', saveCheckin);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') saveCheckin(); });
  checkin.lastActivity = Date.now();
  setInterval(checkinTick, 1000);
}

/* 连续打卡天数:从今天(若已打卡)或昨天起向前数 */
function calcStreak() {
  const d = new Date();
  if (!checkin.days[fmtDate(d)] || !checkin.days[fmtDate(d)].checked) d.setDate(d.getDate() - 1);
  let streak = 0;
  for (let i = 0; i < 400; i++) {
    const rec = checkin.days[fmtDate(d)];
    if (rec && rec.checked) { streak++; d.setDate(d.getDate() - 1); } else break;
  }
  return streak;
}

function countCheckedMonth(year, month) {
  let n = 0;
  const daysIn = new Date(year, month + 1, 0).getDate();
  for (let day = 1; day <= daysIn; day++) {
    const rec = checkin.days[fmtDate(new Date(year, month, day))];
    if (rec && rec.checked) n++;
  }
  return n;
}

function renderCheckin() {
  const now = new Date();
  const year = now.getFullYear(), month = now.getMonth();
  const today = checkinTodayKey();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const rec = checkin.days[today];
  const mins = Math.floor(rec.sec / 60);
  const pct = Math.min(100, Math.round(rec.sec / checkin.threshold * 100));

  $('checkinStats').innerHTML = `
    <div class="checkin-stat"><b>${countCheckedMonth(year, month)}</b><span>本月打卡天数</span></div>
    <div class="checkin-stat"><b>${calcStreak()}</b><span>连续打卡</span></div>
    <div class="checkin-stat"><b>${mins}</b><span>今日活跃(分)</span></div>
    <div class="checkin-progress">
      <div class="cp-bar"><div class="cp-fill" style="width:${pct}%"></div></div>
      <span class="cp-label">${mins} / ${Math.round(checkin.threshold / 60)} 分钟${rec.checked ? ' · 已打卡 ✓' : ''}</span>
    </div>`;

  $('checkinMonth').textContent = `${year} 年 ${month + 1} 月`;

  const grid = $('checkinGrid');
  grid.innerHTML = '';
  const startDow = (new Date(year, month, 1).getDay() + 6) % 7; // 周一=0
  for (let i = 0; i < startDow; i++) {
    const b = document.createElement('div');
    b.className = 'checkin-cell blank';
    grid.appendChild(b);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const key = fmtDate(new Date(year, month, day));
    const r = checkin.days[key];
    const cell = document.createElement('div');
    cell.className = 'checkin-cell';
    if (key === today) cell.classList.add('today');
    if (day > now.getDate()) cell.classList.add('future');
    if (r && r.checked) cell.classList.add('checked');
    else if (r && r.sec > 0 && day <= now.getDate()) cell.classList.add('partial');
    let inner = `<span class="cc-day">${day}</span>`;
    if (r && r.checked) inner += `<span class="cc-ok">✓</span>`;
    else if (r && r.sec > 0) inner += `<span class="cc-min">${Math.floor(r.sec / 60)}m</span>`;
    cell.innerHTML = inner;
    grid.appendChild(cell);
  }
}

function bindCheckinUI() {
  $('checkinThreshold').addEventListener('change', () => {
    checkin.threshold = +$('checkinThreshold').value;
    // 只影响今日起:重新评估今天
    const rec = checkin.days[checkin.today];
    if (rec && !rec.checked && rec.sec >= checkin.threshold) { rec.checked = true; rec.ts = Date.now(); }
    saveCheckin();
    renderCheckin();
  });
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

  // 中英文切换
  $('langToggle').addEventListener('click', () => {
    state.lang = state.lang === 'zh' ? 'en' : 'zh';
    try { localStorage.setItem(LANG_KEY, state.lang); } catch (e) { /* ignore */ }
    applyLang();
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

  // 周训计划
  loadPlan();
  renderPlanControls();
  bindPlanUI();
  bindViewTabs();
  renderPlan();

  // 月训打卡
  loadCheckin();
  bindCheckinUI();
  $('checkinThreshold').value = String(checkin.threshold);
  startActivityTracking();
  renderCheckin();

  // 语言按钮初始态
  applyLang();
}

init();
