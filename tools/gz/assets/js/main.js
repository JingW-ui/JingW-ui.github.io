/* ==================== 事件绑定 / 初始化 / 生命周期 ==================== */
import { config, state, saveToStorage, loadFromStorage, clearStorage, resetAll } from './store.js';
import { WORK_TEMPLATES } from './config.js';
import { toISODate } from './utils.js';
import { getEffectiveSeconds } from './calc.js';
import { populateForm, renderData, toggleSettings, showToast, setLastDateStr } from './ui.js';
import { applyTheme, toggleTheme } from './theme.js';
import { openFloatWindow, closeFloatWindow, minimizeFloatWindow, initFloatWindowInteractions } from './float-window.js';

/* ==================== 事件绑定 ==================== */
function initEvents() {
  // 主题
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);

  // 设置区折叠
  document.getElementById('settingsToggle').addEventListener('click', () => toggleSettings());
  document.getElementById('goConfigBtn').addEventListener('click', () => toggleSettings(true));

  // 模板按钮
  document.querySelectorAll('.tpl-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.mode;
      config.workMode = mode;
      const tpl = WORK_TEMPLATES[mode];
      config.workDaysMonth = tpl.workDaysMonth;
      config.workHourDay = tpl.workHourDay;
      config.startTime = tpl.startTime;
      config.endTime = tpl.endTime;
      config.noonRestHour = tpl.noonRestHour;
      populateForm();
    });
  });

  // 保存配置
  document.getElementById('saveBtn').addEventListener('click', () => {
    const salary = parseFloat(document.getElementById('salaryInput').value);
    if (!salary || salary <= 0) {
      showToast('请输入有效的月薪');
      return;
    }
    config.salary = salary;
    config.workDaysMonth = parseFloat(document.getElementById('workDaysInput').value) || 22;
    config.workHourDay = parseFloat(document.getElementById('workHoursInput').value) || 8;
    config.startTime = document.getElementById('startTimeInput').value || '09:00';
    config.endTime = document.getElementById('endTimeInput').value || '17:00';
    config.noonRestHour = parseFloat(document.getElementById('noonRestInput').value) || 0;
    config.startDate = document.getElementById('startDateInput').value || '';

    state.configured = true;
    // 保存时重置累计；本月此前的工作日由「开始工作日」自动补算
    state.todayTotal = 0;
    state.monthTotal = 0;
    state.todayZeroed = false;
    state.monthResetDate = '';
    saveToStorage();
    toggleSettings(false);
    showToast('配置已保存');
    renderData();
  });

  // 重置全部
  document.getElementById('resetAllBtn').addEventListener('click', () => {
    clearStorage();
    resetAll();
    closeFloatWindow();
    populateForm();
    toggleSettings(true);
    showToast('已重置全部配置');
    renderData();
  });

  // 开始/暂停
  document.getElementById('toggleTimerBtn').addEventListener('click', () => {
    if (!state.configured) {
      showToast('请先保存配置');
      return;
    }
    // 暂停时保存当前累计
    if (state.isTimerRun) {
      const now = new Date();
      const effectiveSec = getEffectiveSeconds(now);
      state.todayTotal = effectiveSec;
    } else {
      // 开始计时时清除「重置今日」标记，重新计入当日
      state.todayZeroed = false;
    }
    state.isTimerRun = !state.isTimerRun;
    saveToStorage();
    renderData();
  });

  // 重置今日
  document.getElementById('resetTodayBtn').addEventListener('click', () => {
    state.todayTotal = 0;
    state.todayZeroed = true;
    saveToStorage();
    showToast('今日累计已重置');
    renderData();
  });

  // 重置本月
  document.getElementById('resetMonthBtn').addEventListener('click', () => {
    state.todayTotal = 0;
    state.monthTotal = 0;
    state.todayZeroed = true;
    state.monthResetDate = toISODate(new Date()); // 从今日起重新累计
    saveToStorage();
    showToast('本月累计已重置');
    renderData();
  });

  // 悬浮窗
  document.getElementById('openFloatBtn').addEventListener('click', openFloatWindow);
  document.getElementById('fwClose').addEventListener('click', closeFloatWindow);
  document.getElementById('fwMinimize').addEventListener('click', minimizeFloatWindow);

  initFloatWindowInteractions();
}

/* ==================== 初始化 ==================== */
function init() {
  loadFromStorage();
  applyTheme();
  populateForm();

  // 首次打开自动展开配置
  if (!state.configured) {
    toggleSettings(true);
  } else {
    toggleSettings(false);
  }

  // 恢复悬浮窗
  if (state.floatWindowOpen) {
    openFloatWindow();
  }

  // 初始化日期字符串
  const now = new Date();
  setLastDateStr(toISODate(now));

  // 初始化月累计基线
  // 如果是运行状态且已跨日，需要在启动时计算正确的月累计基线
  // monthTotal 存储的是"到上次暂停/保存时的月累计秒数"
  // 今天之前的天数贡献已经包含在 monthTotal 中

  initEvents();
  renderData();

  // 毫秒级刷新：使用 requestAnimationFrame（约 60fps），累计收入末位持续跳动
  let lastSave = 0;
  function loop() {
    renderData();
    // 运行中每 30 秒自动保存一次，防止意外关闭丢失（不要每帧保存）
    if (state.isTimerRun) {
      const t = Date.now();
      if (t - lastSave > 30000) {
        saveToStorage();
        lastSave = t;
      }
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

// 页面关闭前保存
window.addEventListener('beforeunload', () => {
  if (state.isTimerRun && state.configured) {
    const now = new Date();
    state.todayTotal = getEffectiveSeconds(now);
    saveToStorage();
  }
});

// 页面可见性变化时保存
document.addEventListener('visibilitychange', () => {
  if (document.hidden && state.isTimerRun && state.configured) {
    const now = new Date();
    state.todayTotal = getEffectiveSeconds(now);
    saveToStorage();
  }
});

init();
