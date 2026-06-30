/* ==================== 工作制模板与默认配置 ==================== */

export const WORK_TEMPLATES = {
  '955':   { workDaysMonth: 22, workHourDay: 8,  startTime: '09:00', endTime: '17:00', noonRestHour: 0 },
  '996':   { workDaysMonth: 26, workHourDay: 12, startTime: '09:00', endTime: '21:00', noonRestHour: 1 },
  '1055':  { workDaysMonth: 22, workHourDay: 7,  startTime: '10:00', endTime: '17:00', noonRestHour: 0 },
  'custom':{ workDaysMonth: 22, workHourDay: 8,  startTime: '09:00', endTime: '18:00', noonRestHour: 1 }
};

/* 默认 config（重置时用，返回新对象避免共享引用） */
export function createDefaultConfig() {
  return {
    salary: 0,
    workMode: '955',
    workDaysMonth: 22,
    workHourDay: 8,
    noonRestHour: 0,
    startTime: '09:00',
    endTime: '17:00',
    startDate: ''     // 开始工作日（ISO yyyy-mm-dd），用于补算配置前已上班的天数
  };
}

/* 默认 state（重置时用；theme 由调用方传入以保留当前主题） */
export function createDefaultState(theme = 'light') {
  return {
    isTimerRun: false,
    todayTotal: 0,   // 今日已累计的秒数
    monthTotal: 0,   // 本月已累计的秒数（历史兼容，渲染时改由补算推导）
    todayZeroed: false,   // 是否手动重置了今日
    monthResetDate: '',   // 手动重置本月的日期（ISO yyyy-mm-dd），补算从此日起
    floatWindowOpen: false,
    floatOpacity: 70,
    theme,
    settingsOpen: true,
    configured: false
  };
}
