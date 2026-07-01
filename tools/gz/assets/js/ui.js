/* ==================== UI 渲染 / 表单 / 设置折叠 / Toast ==================== */
import { config, state, saveToStorage } from './store.js';
import { calcRates, getWorkStatus, getEffectiveSeconds, pastWorkSecondsThisMonth, pastWorkSecondsSinceStart, isWorkDay } from './calc.js';
import { fmt, formatSeconds, formatCountdown, timeToMinutes, toISODate } from './utils.js';
import { openDrawer, syncFloatSwitch } from './drawer.js';

/* ==================== 日期检查：跨日/跨月重置 ==================== */
let lastDateStr = '';
function checkDateReset() {
  const now = new Date();
  const ds = toISODate(now);
  if (lastDateStr && lastDateStr !== ds) {
    const lastParts = lastDateStr.split('-');
    const nowParts = ds.split('-');
    // 月份变了，清空本月重置标记，进入新月重新补算
    if (lastParts[1] !== nowParts[1] || lastParts[0] !== nowParts[0]) {
      state.monthTotal = 0;
      state.monthResetDate = '';
    }
    // 日期变了，重置日累计并清除「重置今日」标记
    state.todayTotal = 0;
    state.todayZeroed = false;
    saveToStorage();
  }
  lastDateStr = ds;
}

export function setLastDateStr(ds) { lastDateStr = ds; }

/* ==================== Toast ==================== */
export function showToast(msg) {
  const c = document.getElementById('toastContainer');
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  c.appendChild(t);
  setTimeout(() => t.remove(), 2200);
}

/* ==================== 表单填充 ==================== */
export function populateForm() {
  document.getElementById('salaryInput').value = config.salary || '';
  document.getElementById('workDaysInput').value = config.workDaysMonth || '';
  document.getElementById('workHoursInput').value = config.workHourDay || '';
  document.getElementById('startTimeInput').value = config.startTime;
  document.getElementById('endTimeInput').value = config.endTime;
  document.getElementById('noonRestInput').value = config.noonRestHour || 0;
  // 开始工作日：未设置时默认为本月 1 号，便于立即补算本月已上班天数
  const sd = document.getElementById('startDateInput');
  if (config.startDate) {
    sd.value = config.startDate;
  } else {
    const d = new Date();
    sd.value = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-01';
  }

  // 高亮模板按钮
  document.querySelectorAll('.tpl-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.mode === config.workMode);
  });
}

/* ==================== 状态徽标 ==================== */
export function updateStatusBadge(status) {
  const badge = document.getElementById('statusBadge');
  const text = document.getElementById('statusText');
  badge.className = 'status-badge';
  switch(status) {
    case 'working':
      badge.classList.add('working');
      text.textContent = '工作中';
      break;
    case 'resting':
      badge.classList.add('resting');
      text.textContent = '休息中';
      break;
    case 'paused':
      badge.classList.add('paused');
      text.textContent = '已暂停';
      break;
    default:
      badge.classList.add('resting');
      text.textContent = '等待配置';
  }
}

/* ==================== 主渲染 ==================== */
export function renderData() {
  const now = new Date();
  checkDateReset();

  if (!state.configured) {
    document.getElementById('noConfigHint').style.display = '';
    document.getElementById('dataDisplay').style.display = 'none';
    updateStatusBadge('idle');
    document.getElementById('toggleTimerBtn').textContent = '开始计时';
    syncFloatSwitch();
    return;
  }

  document.getElementById('noConfigHint').style.display = 'none';
  document.getElementById('dataDisplay').style.display = '';

  const rates = calcRates();
  const status = getWorkStatus(now);
  updateStatusBadge(status);

  // 有效工作秒数
  const effectiveSec = getEffectiveSeconds(now);
  // 当日应累计：运行中按实时有效秒；暂停时取上次记录；手动重置今日则为 0
  const todaySec = state.todayZeroed ? 0 : (state.isTimerRun ? effectiveSec : state.todayTotal);
  // 当月应累计 = 本月此前（含开始工作日之前的补算）已完成的工作日秒数 + 当日
  const monthSec = pastWorkSecondsThisMonth(now) + todaySec;
  // 入职至今总累计 = 自开始工作日到昨天的完整工作日秒数 + 当日（不受「重置本月」影响）
  const totalSec = pastWorkSecondsSinceStart(now) + todaySec;

  // 渲染主页面
  // 累计收入使用 4 位小数，使毫秒级刷新时末位持续跳动；时薪/日薪保持 2 位
  document.getElementById('secIncome').textContent = fmt(rates.perSec, 4);
  document.getElementById('todayIncome').textContent = fmt(todaySec * rates.perSec, 4) + ' 元';
  document.getElementById('todaySeconds').textContent = formatSeconds(todaySec);
  document.getElementById('monthIncome').textContent = fmt(monthSec * rates.perSec, 4) + ' 元';
  document.getElementById('monthSeconds').textContent = formatSeconds(monthSec);
  document.getElementById('totalIncome').textContent = fmt(totalSec * rates.perSec, 4) + ' 元';
  document.getElementById('totalSub').textContent = config.startDate ? ('自 ' + config.startDate + ' 起') : '从今日起';
  document.getElementById('hourlyRate').textContent = fmt(rates.hourly);
  document.getElementById('dailyRate').textContent = fmt(rates.daily);

  // 下班倒计时（含毫秒，毫秒级刷新时秒位平滑递减）
  const endMin = timeToMinutes(config.endTime);
  const startMin = timeToMinutes(config.startTime);
  const nowMin = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60 + now.getMilliseconds() / 60000;
  const remainSec = Math.max(0, (endMin - nowMin) * 60);
  if (status === 'working') {
    document.getElementById('countdown').textContent = formatCountdown(remainSec);
  } else if (nowMin >= endMin) {
    document.getElementById('countdown').textContent = '已下班';
  } else {
    document.getElementById('countdown').textContent = '--:--:--';
  }

  // 下班进度条：已工作比例决定宽度，走满即代表下班；越接近下班色相越偏绿（红 0 → 绿 140）
  const fill = document.getElementById('countdownFill');
  const noonMin = config.noonRestHour * 60;
  const totalWorkSec = Math.max(1, (endMin - startMin - noonMin) * 60);
  if (isWorkDay(now)) {
    const remainPct = Math.max(0, Math.min(1, remainSec / totalWorkSec));
    const progress = 1 - remainPct;          // 进度：从空走到满，走完即下班
    const hue = Math.round(140 * progress);  // 越接近下班越偏绿
    fill.style.width = (progress * 100) + '%';
    fill.style.background = 'hsl(' + hue + ', 72%, 46%)';
    fill.style.opacity = '1';
  } else {
    fill.style.width = '0';
    fill.style.opacity = '0';
  }

  // 按钮文字
  document.getElementById('toggleTimerBtn').textContent = state.isTimerRun ? '暂停计时' : '开始计时';

  // 同步悬浮窗开关状态（覆盖 fwClose 等入口）
  syncFloatSwitch();

  // 悬浮窗同步
  if (state.floatWindowOpen) {
    document.getElementById('fwSec').textContent = fmt(rates.perSec, 4);
    document.getElementById('fwToday').textContent = fmt(todaySec * rates.perSec, 4);
    document.getElementById('fwMonth').textContent = fmt(monthSec * rates.perSec, 4);
    document.getElementById('fwTotal').textContent = fmt(totalSec * rates.perSec, 4);
  }
}

/* ==================== 设置区折叠 ==================== */
export function toggleSettings(forceOpen) {
  const panel = document.getElementById('settingsPanel');
  const arrow = document.getElementById('settingsArrow');
  const isOpen = !panel.classList.contains('collapsed');
  const shouldOpen = forceOpen !== undefined ? forceOpen : !isOpen;

  if (shouldOpen) {
    panel.classList.remove('collapsed');
    panel.style.maxHeight = panel.scrollHeight + 'px';
    arrow.classList.remove('up');
    state.settingsOpen = true;
    // 展开配置时一并拉出顶部抽屉，便于首次配置
    openDrawer();
  } else {
    panel.classList.add('collapsed');
    arrow.classList.add('up');
    state.settingsOpen = false;
  }
}
