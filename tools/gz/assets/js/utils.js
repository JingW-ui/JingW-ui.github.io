/* ==================== 工具函数（纯函数，无副作用） ==================== */

export function fmt(n, d = 2) { return n.toFixed(d); }

export function formatCountdown(seconds) {
  if (seconds <= 0) return '00:00:00.0';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const tenths = Math.floor((seconds * 10) % 10);
  return String(h).padStart(2,'0') + ':' + String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0') + '.' + tenths;
}

export function formatSeconds(totalSec) {
  if (totalSec < 60) return '已工作 ' + Math.floor(totalSec) + ' 秒';
  if (totalSec < 3600) return '已工作 ' + Math.floor(totalSec / 60) + ' 分 ' + Math.floor(totalSec % 60) + ' 秒';
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  return '已工作 ' + h + ' 时 ' + m + ' 分';
}

export function timeToMinutes(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

/* 将 yyyy-mm-dd 解析为本地日期 00:00 */
export function parseDateStr(s) {
  if (!s) return null;
  const p = s.split('-').map(Number);
  if (p.length !== 3 || p.some(n => isNaN(n))) return null;
  return new Date(p[0], p[1] - 1, p[2]);
}

export function toISODate(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
