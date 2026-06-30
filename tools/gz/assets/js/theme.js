/* ==================== 主题切换 ==================== */
import { state, saveToStorage } from './store.js';

export function applyTheme() {
  document.documentElement.setAttribute('data-theme', state.theme);
  const btn = document.getElementById('themeToggle');
  btn.textContent = state.theme === 'dark' ? '🌙' : '☀';
}

export function toggleTheme() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  applyTheme();
  saveToStorage();
}
