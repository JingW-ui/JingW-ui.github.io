/* ==================== 状态单例与存储管理 ==================== */
import { createDefaultConfig, createDefaultState } from './config.js';

/* 模块级单例：所有模块 import 同一引用，行为等价于原全局变量。
   重置时用 Object.assign 原地覆盖，保持引用稳定。 */
export const config = createDefaultConfig();
export const state = createDefaultState();

export function saveToStorage() {
  try {
    localStorage.setItem('salary', config.salary);
    localStorage.setItem('workMode', config.workMode);
    localStorage.setItem('workDaysMonth', config.workDaysMonth);
    localStorage.setItem('workHourDay', config.workHourDay);
    localStorage.setItem('noonRestHour', config.noonRestHour);
    localStorage.setItem('startTime', config.startTime);
    localStorage.setItem('endTime', config.endTime);
    localStorage.setItem('startDate', config.startDate);
    localStorage.setItem('todayTotal', state.todayTotal);
    localStorage.setItem('monthTotal', state.monthTotal);
    localStorage.setItem('todayZeroed', state.todayZeroed ? '1' : '0');
    localStorage.setItem('monthResetDate', state.monthResetDate);
    localStorage.setItem('isTimerRun', state.isTimerRun);
    localStorage.setItem('floatWindowOpen', state.floatWindowOpen);
    localStorage.setItem('floatOpacity', state.floatOpacity);
    localStorage.setItem('theme', state.theme);
    localStorage.setItem('configured', state.configured ? '1' : '0');
  } catch(e) { /* 静默失败 */ }
}

export function loadFromStorage() {
  try {
    const g = k => localStorage.getItem(k);
    if (g('salary') !== null) config.salary = parseFloat(g('salary')) || 0;
    if (g('workMode')) config.workMode = g('workMode');
    if (g('workDaysMonth') !== null) config.workDaysMonth = parseFloat(g('workDaysMonth')) || 22;
    if (g('workHourDay') !== null) config.workHourDay = parseFloat(g('workHourDay')) || 8;
    if (g('noonRestHour') !== null) config.noonRestHour = parseFloat(g('noonRestHour')) || 0;
    if (g('startTime')) config.startTime = g('startTime');
    if (g('endTime')) config.endTime = g('endTime');
    if (g('startDate') !== null) config.startDate = g('startDate');
    if (g('todayTotal') !== null) state.todayTotal = parseFloat(g('todayTotal')) || 0;
    if (g('monthTotal') !== null) state.monthTotal = parseFloat(g('monthTotal')) || 0;
    if (g('todayZeroed') === '1') state.todayZeroed = true;
    if (g('monthResetDate') !== null) state.monthResetDate = g('monthResetDate');
    if (g('isTimerRun') === 'true') state.isTimerRun = true;
    if (g('floatWindowOpen') === 'true') state.floatWindowOpen = true;
    if (g('floatOpacity') !== null) state.floatOpacity = parseInt(g('floatOpacity')) || 70;
    if (g('theme')) state.theme = g('theme');
    if (g('configured') === '1') state.configured = true;
  } catch(e) { /* 静默失败 */ }
}

export function clearStorage() {
  try { localStorage.clear(); } catch(e) {}
}

/* 原地重置 config 与 state，保留当前 theme */
export function resetAll() {
  const keepTheme = state.theme;
  Object.assign(config, createDefaultConfig());
  Object.assign(state, createDefaultState(keepTheme));
}
