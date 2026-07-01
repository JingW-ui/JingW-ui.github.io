/* ==================== 顶部控制抽屉：滑出/收起、点击外部关闭、悬浮窗开关 ==================== */
import { state, saveToStorage } from './store.js';
import { openFloatWindow, closeFloatWindow } from './float-window.js';

const drawerEl = () => document.getElementById('controlDrawer');
const scrimEl = () => document.getElementById('drawerScrim');
const toggleEl = () => document.getElementById('drawerToggle');

export function isDrawerOpen() {
  return drawerEl().classList.contains('open');
}

export function openDrawer() {
  const d = drawerEl(), s = scrimEl(), t = toggleEl();
  d.classList.add('open');
  d.setAttribute('aria-hidden', 'false');
  s.classList.add('show');
  t.setAttribute('aria-expanded', 'true');
}

export function closeDrawer() {
  const d = drawerEl(), s = scrimEl(), t = toggleEl();
  d.classList.remove('open');
  d.setAttribute('aria-hidden', 'true');
  s.classList.remove('show');
  t.setAttribute('aria-expanded', 'false');
}

export function toggleDrawer(forceOpen) {
  const shouldOpen = forceOpen !== undefined ? forceOpen : !isDrawerOpen();
  shouldOpen ? openDrawer() : closeDrawer();
}

/* 悬浮窗开关：点击切换；显隐状态由 renderData 每帧同步，确保 fwClose 等入口也能正确反映 */
function initFloatSwitch() {
  const sw = document.getElementById('floatSwitch');
  sw.setAttribute('aria-checked', state.floatWindowOpen ? 'true' : 'false');
  sw.addEventListener('click', () => {
    if (state.floatWindowOpen) closeFloatWindow();
    else openFloatWindow();
  });
}

export function syncFloatSwitch() {
  const sw = document.getElementById('floatSwitch');
  if (sw) sw.setAttribute('aria-checked', state.floatWindowOpen ? 'true' : 'false');
}

export function initDrawer() {
  const t = toggleEl();
  t.setAttribute('aria-expanded', isDrawerOpen() ? 'true' : 'false');

  // 点击齿轮切换抽屉
  t.addEventListener('click', e => {
    e.stopPropagation();
    toggleDrawer();
  });

  // 点击遮罩关闭
  scrimEl().addEventListener('click', closeDrawer);

  // 点击抽屉内部不关闭；点击抽屉外的页面区域关闭
  document.addEventListener('click', e => {
    if (!isDrawerOpen()) return;
    const d = drawerEl();
    if (d.contains(e.target) || t.contains(e.target)) return;
    closeDrawer();
  });

  // 按 Esc 关闭
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isDrawerOpen()) closeDrawer();
  });

  initFloatSwitch();
}
