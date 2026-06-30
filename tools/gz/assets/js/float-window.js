/* ==================== 悬浮窗逻辑：开/关/最小化、拖拽、缩放、透明度 ==================== */
import { state, saveToStorage } from './store.js';

export function openFloatWindow() {
  const fw = document.getElementById('floatWindow');
  fw.style.display = '';
  fw.style.opacity = state.floatOpacity / 100;
  document.getElementById('fwOpacity').value = state.floatOpacity;
  // 定位到右下角
  fw.style.right = '24px';
  fw.style.bottom = '24px';
  fw.style.left = 'auto';
  fw.style.top = 'auto';
  state.floatWindowOpen = true;
  saveToStorage();
}

export function closeFloatWindow() {
  document.getElementById('floatWindow').style.display = 'none';
  state.floatWindowOpen = false;
  saveToStorage();
}

export function minimizeFloatWindow() {
  const body = document.getElementById('fwBody');
  body.classList.toggle('hidden');
}

/* 初始化透明度滑条（事件绑定） */
function initOpacity() {
  document.getElementById('fwOpacity').addEventListener('input', e => {
    state.floatOpacity = parseInt(e.target.value);
    document.getElementById('floatWindow').style.opacity = state.floatOpacity / 100;
    saveToStorage();
  });
}

// 拖拽
function initDrag() {
  const fw = document.getElementById('floatWindow');
  const header = document.getElementById('fwHeader');
  let dragging = false, startX, startY, origX, origY;

  header.addEventListener('mousedown', e => {
    if (e.target.classList.contains('fw-dot')) return;
    dragging = true;
    const rect = fw.getBoundingClientRect();
    startX = e.clientX;
    startY = e.clientY;
    origX = rect.left;
    origY = rect.top;
    // 切换为 left/top 定位
    fw.style.left = origX + 'px';
    fw.style.top = origY + 'px';
    fw.style.right = 'auto';
    fw.style.bottom = 'auto';
    e.preventDefault();
  });

  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    let nx = origX + dx;
    let ny = origY + dy;
    // 限制在窗口内
    nx = Math.max(0, Math.min(window.innerWidth - 100, nx));
    ny = Math.max(0, Math.min(window.innerHeight - 40, ny));
    fw.style.left = nx + 'px';
    fw.style.top = ny + 'px';
  });

  document.addEventListener('mouseup', () => { dragging = false; });
}

// 缩放
function initResize() {
  const fw = document.getElementById('floatWindow');
  const handle = document.getElementById('fwResize');
  let resizing = false, startW, startH, startX, startY;

  handle.addEventListener('mousedown', e => {
    resizing = true;
    startW = fw.offsetWidth;
    startH = fw.offsetHeight;
    startX = e.clientX;
    startY = e.clientY;
    e.preventDefault();
    e.stopPropagation();
  });

  document.addEventListener('mousemove', e => {
    if (!resizing) return;
    const nw = Math.max(200, startW + (e.clientX - startX));
    const nh = Math.max(100, startH + (e.clientY - startY));
    fw.style.width = nw + 'px';
    fw.style.minHeight = nh + 'px';
  });

  document.addEventListener('mouseup', () => { resizing = false; });
}

/* 一次性初始化拖拽 / 缩放 / 透明度交互 */
export function initFloatWindowInteractions() {
  initDrag();
  initResize();
  initOpacity();
}
