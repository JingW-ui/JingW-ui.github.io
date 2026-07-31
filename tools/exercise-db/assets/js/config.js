/* ============================================================
   健身动作数据库 - 配置与中文词表
   数据来源:hasaneyldrm/exercises-dataset (MIT)
   媒体:© Gym Visual,通过 jsdelivr CDN 引用,不内嵌
   ============================================================ */

/* 媒体 CDN 基址(数据里的 image/gif 为相对路径) */
export const MEDIA_BASE = 'https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main/';

/* 身体部位 → 中文 */
export const BODY_PARTS = {
  back: '背部',
  cardio: '有氧',
  chest: '胸部',
  'lower arms': '前臂',
  'lower legs': '小腿',
  neck: '颈部',
  shoulders: '肩部',
  'upper arms': '上臂',
  'upper legs': '大腿',
  waist: '腰腹',
};

/* 器械 → 中文 */
export const EQUIPMENT = {
  assisted: '辅助器械',
  band: '弹力带',
  barbell: '杠铃',
  'body weight': '徒手',
  'bosu ball': '波速球',
  cable: '钢线机',
  dumbbell: '哑铃',
  'elliptical machine': '椭圆机',
  'ez barbell': 'EZ 杠铃',
  hammer: '锤类',
  kettlebell: '壶铃',
  'leverage machine': '杠杆器械',
  'medicine ball': '药球',
  'olympic barbell': '奥林匹克杠铃',
  'resistance band': '阻力带',
  roller: '泡沫轴',
  rope: '绳类',
  'skierg machine': '滑雪测功仪',
  'sled machine': '雪橇机',
  'smith machine': '史密斯机',
  'stability ball': '健身球',
  'stationary bike': '固定单车',
  'stepmill machine': '爬梯机',
  tire: '轮胎',
  'trap bar': '六角杠铃',
  'upper body ergometer': '上肢测功仪',
  weighted: '负重',
  'wheel roller': '健腹轮',
};

/* 肌群 → 中文 */
export const MUSCLES = {
  abdominals: '腹肌',
  abs: '腹肌',
  abductors: '外展肌',
  adductors: '内收肌',
  'ankle stabilizers': '踝部稳定肌',
  ankles: '脚踝',
  back: '背部',
  biceps: '肱二头肌',
  brachialis: '肱肌',
  calves: '腓肠肌',
  'cardiovascular system': '心血管系统',
  chest: '胸部',
  core: '核心肌群',
  deltoids: '三角肌',
  delts: '三角肌',
  feet: '足部',
  forearms: '前臂肌',
  glutes: '臀肌',
  'grip muscles': '握力肌群',
  groin: '髋内收肌',
  hamstrings: '腘绳肌',
  hands: '手部',
  'hip flexors': '髋屈肌',
  'inner thighs': '大腿内侧',
  'latissimus dorsi': '背阔肌',
  lats: '背阔肌',
  'levator scapulae': '肩胛提肌',
  'lower abs': '下腹',
  'lower back': '下背',
  obliques: '腹斜肌',
  pectorals: '胸肌',
  quadriceps: '股四头肌',
  quads: '股四头肌',
  'rear deltoids': '后三角肌',
  rhomboids: '菱形肌',
  'rotator cuff': '肩袖肌群',
  'serratus anterior': '前锯肌',
  shins: '胫前肌',
  shoulders: '肩部',
  soleus: '比目鱼肌',
  spine: '脊柱',
  sternocleidomastoid: '胸锁乳突肌',
  trapezius: '斜方肌',
  traps: '斜方肌',
  triceps: '肱三头肌',
  'upper back': '上背',
  'upper chest': '上胸',
  'wrist extensors': '腕伸肌',
  'wrist flexors': '腕屈肌',
  wrists: '手腕',
};

/* 翻译工具:命中返回中文,未命中返回原文 */
export const t = (map, key) => (map[key] || key);
