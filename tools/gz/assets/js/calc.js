/* ==================== 工作日 / 有效工作秒数 / 薪资 / 状态计算 ==================== */
import { config, state } from './store.js';
import { timeToMinutes, parseDateStr } from './utils.js';

/* ==================== 工作日判断 ==================== */
export function isWorkDay(date) {
  const d = date.getDay();
  if (config.workMode === '996') return d !== 0;
  if (config.workMode === '955' || config.workMode === '1055') return d >= 1 && d <= 5;
  // custom 和大小周统一按周一到周五
  return d >= 1 && d <= 5;
}

/* 一个完整工作日的有效工作秒数（已扣除午休） */
export function fullWorkdaySeconds() {
  return Math.max(0, (config.workHourDay - config.noonRestHour)) * 3600;
}

/* 计算从「开始工作日」到昨天为止、属于当前月份的已工作秒数。
   用户可能在配置之前就已经上班很久了，这里把那些历史工作日补算进本月累计。 */
export function pastWorkSecondsThisMonth(now) {
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  let start = parseDateStr(config.startDate);
  // 若用户手动重置过本月，则从重置日起算
  const resetStart = parseDateStr(state.monthResetDate);
  if (resetStart && resetStart.getFullYear() === now.getFullYear() && resetStart.getMonth() === now.getMonth() && (!start || resetStart > start)) {
    start = resetStart;
  }
  if (!start) start = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // 无开始日则无历史
  if (start < monthStart) start = monthStart;

  const today00 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let total = 0;
  const d = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  let guard = 0;
  while (d < today00 && guard < 400) {
    if (isWorkDay(d)) total += fullWorkdaySeconds();
    d.setDate(d.getDate() + 1);
    guard++;
  }
  return total;
}

/* ==================== 有效工作秒数计算 ==================== */
/* 返回「真实秒数」（含毫秒精度），便于页面以毫秒级刷新累计收入。
   注意：早期版本错误地返回了「分钟数」，导致累计被缩小 60 倍，此处修正。 */
export function getEffectiveSeconds(date) {
  if (!isWorkDay(date)) return 0;

  // 当前时刻换算为秒（含毫秒），保证毫秒级刷新时数值连续递增
  const nowSec = date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds() + date.getMilliseconds() / 1000;
  const startSec = timeToMinutes(config.startTime) * 60;
  const endSec = timeToMinutes(config.endTime) * 60;
  const noonSec = config.noonRestHour * 3600;

  if (nowSec <= startSec) return 0;

  const noonStart = startSec + Math.floor((endSec - startSec - noonSec) / 2);
  const noonEnd = noonStart + noonSec;

  // 检查午休是否有效（午休必须在上班时间内）
  if (noonSec <= 0 || noonStart >= endSec || noonEnd > endSec) {
    // 无有效午休
    return Math.min(nowSec, endSec) - startSec;
  }

  // 有午休，分段计算
  const beforeNoon = Math.max(0, Math.min(nowSec, noonStart) - startSec);
  const afterNoon = Math.max(0, Math.min(nowSec, endSec) - noonEnd);
  return beforeNoon + afterNoon;
}

/* ==================== 薪资计算 ==================== */
export function calcRates() {
  const monthlyHours = Math.max(1, config.workDaysMonth * config.workHourDay - config.workDaysMonth * config.noonRestHour);
  const hourly = config.salary / monthlyHours;
  const perSec = hourly / 3600;
  const daily = hourly * config.workHourDay;
  return { hourly, perSec, daily };
}

/* ==================== 状态判断 ==================== */
export function getWorkStatus(date) {
  if (!state.configured) return 'idle';
  if (!state.isTimerRun) return 'paused';
  if (!isWorkDay(date)) return 'resting';

  const nowMin = date.getHours() * 60 + date.getMinutes() + date.getSeconds() / 60;
  const startMin = timeToMinutes(config.startTime);
  const endMin = timeToMinutes(config.endTime);
  const noonMin = config.noonRestHour * 60;

  if (nowMin < startMin || nowMin > endMin) return 'resting';

  // 检查是否在午休
  if (noonMin > 0) {
    const noonStart = startMin + Math.floor((endMin - startMin - noonMin) / 2);
    const noonEnd = noonStart + noonMin;
    if (noonStart < endMin && noonEnd <= endMin && nowMin >= noonStart && nowMin < noonEnd) {
      return 'resting';
    }
  }

  return 'working';
}
