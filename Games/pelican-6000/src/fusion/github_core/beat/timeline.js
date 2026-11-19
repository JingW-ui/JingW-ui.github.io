// src/beat/timeline.js
// Canonical 20-era world geometry & pure-function state on canonicalT in [0, 137.0],
// paired with real-song time-warp synchronization in `time_warp.js`.

export const BPM = 120;
export const BEAT_SEC = 60 / BPM; // 0.5s canonical beat
export const BAR_BEATS = 4;
export const BAR_SEC = BEAT_SEC * BAR_BEATS; // 2.0s canonical bar

export const INTRO_BARS = 2.5;
export const INTRO_SEC = INTRO_BARS * BAR_SEC; // 5.0s canonical intro

export const SCENE_BARS = 3;
export const SCENE_SEC = SCENE_BARS * BAR_SEC; // 6.0s canonical per era
export const NUM_SCENES = 20;
export const SCENES_TOTAL_SEC = NUM_SCENES * SCENE_SEC; // 120.0s (5.0 -> 125.0)

export const OUTRO_BARS = 6;
export const OUTRO_SEC = OUTRO_BARS * BAR_SEC; // 12.0s (125.0 -> 137.0)

export const TOTAL_DURATION = INTRO_SEC + SCENES_TOTAL_SEC + OUTRO_SEC; // 137.0s canonical

export const PANEL_SIZE = 1000;
export const ROAD_EDGE_Y = 680;

export const SCENES = [
  {
    index: 0,
    num: 1,
    imgCode: 'IMG-01',
    id: 's01_sahara',
    zh: '撒哈拉岩画',
    en: 'Saharan Rock Painting · Tassili',
    era: '约前 4000',
    gag: '牧人与长角牛群驻足围观骑车路过的赭石鹈鹕',
    palette: ['#c89b6e', '#8c3b1f', '#522518', '#e3c598', '#2a1810'],
    frameColor: '#6d3920',
    frameAccent: '#d4a373',
  },
  {
    index: 1,
    num: 2,
    imgCode: 'IMG-02',
    id: 's02_egypt',
    zh: '埃及壁画',
    en: 'Ancient Egyptian Tomb Fresco',
    era: '约前 1300',
    gag: '王名框拼写“鹈鹕测试”，打格底稿前放慢定格标准侧身壁画姿势',
    palette: ['#e8d5a7', '#c14928', '#1d6b73', '#d4a024', '#1c1815'],
    frameColor: '#b58428',
    frameAccent: '#1d6b73',
    motionProfile: 'freeze_bar2',
  },
  {
    index: 2,
    num: 3,
    imgCode: 'IMG-03',
    id: 's03_han',
    zh: '汉画像石拓片',
    en: 'Eastern Han Stone Relief Rubbing',
    era: '约 100',
    gag: '黑底白线车马出行浩荡队列里一本正经混进一辆鹈鹕自行车',
    palette: ['#1a1917', '#ebe6dc', '#383530', '#b3392b', '#cfc8b8'],
    frameColor: '#292724',
    frameAccent: '#b3392b',
    isInk: true,
    inkMode: 'rubbing',
  },
  {
    index: 3,
    num: 4,
    imgCode: 'IMG-04',
    id: 's04_tang',
    zh: '唐代白描',
    en: 'Tang Dynasty Baimiao · Wu Style',
    era: '约 750',
    gag: '纯墨线“吴带当风”，鹈鹕飞羽与披帛随疾骑迎风翻卷',
    palette: ['#efe6d2', '#1f1c18', '#595247', '#9e8f79', '#a62c22'],
    frameColor: '#5c432d',
    frameAccent: '#c9b38c',
    isInk: true,
    inkMode: 'baimiao',
  },
  {
    index: 4,
    num: 5,
    imgCode: 'IMG-05',
    id: 's05_song',
    zh: '宋代山水',
    en: 'Northern Song Monumental Landscape',
    era: '约 1000',
    gag: '致敬《溪山行旅图》巨峰耸立，镜头推近山脚才找到米粒大的骑行鹈鹕',
    palette: ['#e4d7be', '#1c1b18', '#4d4a41', '#7d7768', '#968c76'],
    frameColor: '#463b2e',
    frameAccent: '#b3a386',
    isInk: true,
    inkMode: 'shanshui',
    cameraMode: 'song_zoom',
  },
  {
    index: 5,
    num: 6,
    imgCode: 'IMG-06',
    id: 's06_qingming',
    zh: '清明上河图',
    en: 'Along the River · Bianjing Scroll',
    era: '约 1100',
    gag: '水墨淡彩骑上木构虹桥，桥上商贾挑夫纷纷扭头围观',
    palette: ['#dfcda9', '#2b251e', '#6f7d65', '#9e6b43', '#8c999e'],
    frameColor: '#694b30',
    frameAccent: '#c4ab82',
    isInk: true,
    inkMode: 'jiehua',
    archBridge: true,
  },
  {
    index: 6,
    num: 7,
    imgCode: 'IMG-07',
    id: 's07_maya',
    zh: '玛雅抄本',
    en: 'Maya Bark-Paper Codex',
    era: '约 1200',
    gag: '树皮折页书画格内，侧栏以玛雅点横数字实时记录踏板圈数',
    palette: ['#ebd9b4', '#b83324', '#267365', '#191614', '#d99b26'],
    frameColor: '#8c2b1e',
    frameAccent: '#267365',
  },
  {
    index: 7,
    num: 8,
    imgCode: 'IMG-08',
    id: 's08_mughal',
    zh: '莫卧儿细密画',
    en: 'Mughal Imperial Miniature',
    era: '约 1600',
    gag: '泥金花卉边框宫廷花园，多视角宾客在亭台上下同时探头围观',
    palette: ['#1d4354', '#d9a13b', '#c93b2b', '#2e734f', '#f4e6c8'],
    frameColor: '#b88228',
    frameAccent: '#1d4354',
  },
  {
    index: 8,
    num: 9,
    imgCode: 'IMG-09',
    id: 's09_bada',
    zh: '八大山人写意',
    en: 'Bada Shanren Freehand Ink',
    era: '约 1690',
    gag: '大片孤高留白、寥寥数笔泼墨，车上鹈鹕向观众翻出标志性大白眼',
    palette: ['#f3eee2', '#171614', '#636059', '#b5b0a4', '#a82b21'],
    frameColor: '#3a3732',
    frameAccent: '#d8d1c3',
    isInk: true,
    inkMode: 'xieyi',
  },
  {
    index: 9,
    num: 10,
    imgCode: 'IMG-10',
    id: 's10_wayang',
    zh: '爪哇皮影戏',
    en: 'Javanese Wayang Kulit',
    era: '约 1800',
    gag: '油灯幕布后镂空金彩皮影与牛角操纵杆可见，车轮一顿一顿转动',
    palette: ['#fff1c9', '#2b1608', '#c48327', '#8c2318', '#e6a832'],
    frameColor: '#592c12',
    frameAccent: '#e09f3e',
    quantizeHz: 10,
  },
  {
    index: 10,
    num: 11,
    imgCode: 'IMG-11',
    id: 's11_ukiyoe',
    zh: '江户浮世绘',
    en: 'Ukiyo-e · Tōkaidō Woodblock',
    era: '1830s',
    gag: '广重东海道木版摺色与渐变天际下，鹈鹕顶风迎松骑行驿道',
    palette: ['#f0e4ca', '#1d3b5c', '#3b6e8c', '#c75233', '#496646'],
    frameColor: '#233d59',
    frameAccent: '#d9c5a0',
  },
  {
    index: 11,
    num: 12,
    imgCode: 'IMG-12',
    id: 's12_starry',
    zh: '梵高《星月夜》',
    en: 'Post-Impressionist Impasto Night',
    era: '1889',
    gag: '厚涂短笔触漩涡星云与车轮同频旋转，柏树随踏板节拍摇曳',
    palette: ['#13294b', '#1f4e8c', '#f2c138', '#e8e1ab', '#121a16'],
    frameColor: '#26426e',
    frameAccent: '#f2c138',
  },
  {
    index: 12,
    num: 13,
    imgCode: 'IMG-13',
    id: 's13_scream',
    zh: '蒙克《呐喊》',
    en: 'Expressionist Fjord Bridge',
    era: '1893',
    gag: '鹈鹕疾驰掠过血色峡湾木桥，桥上捂耳呐喊者变成被惊呆的路人',
    palette: ['#d94e28', '#f29544', '#263859', '#3d2c28', '#e6c79c'],
    frameColor: '#59291e',
    frameAccent: '#f29544',
  },
  {
    index: 13,
    num: 14,
    imgCode: 'IMG-14',
    id: 's14_nosferatu',
    zh: '《诺斯费拉图》',
    en: 'Silent Expressionist Shadow',
    era: '1922',
    gag: '胶片暗角楼梯高墙上，只见瘦长诡谲的鹈鹕骑车黑影缓缓向上爬升',
    palette: ['#d8ccb0', '#121110', '#4f483b', '#877c66', '#26231f'],
    frameColor: '#1f1d1a',
    frameAccent: '#9c9078',
    specialExit: 'electrify_to_crt',
  },
  {
    index: 14,
    num: 15,
    imgCode: 'IMG-15',
    id: 's15_oscilloscope',
    zh: '示波器矢量图',
    en: 'CRT Phosphor Oscilloscope',
    era: '1950s',
    gag: '一只手拧错旋钮，荧光绿鹈鹕瞬间扭成李萨如图形，下一拍弹回原形',
    palette: ['#07120a', '#39ff7a', '#14522b', '#b8ffd0', '#242926'],
    frameColor: '#2a302d',
    frameAccent: '#39ff7a',
    specialEntry: 'electrify_from_shadow',
  },
  {
    index: 15,
    num: 16,
    imgCode: 'IMG-16',
    id: 's16_8bit',
    zh: '8-bit 像素游戏',
    en: '8-Bit Side-Scrolling Platformer',
    era: '1980s',
    gag: '有限调色板像素横版关卡，鹈鹕跃过深坑吃到金币并在强拍弹出 1UP',
    palette: ['#5c94fc', '#c84c0c', '#00a800', '#fcfcfc', '#f8b800'],
    frameColor: '#202438',
    frameAccent: '#f8b800',
    quantizeHz: 12,
  },
  {
    index: 16,
    num: 17,
    imgCode: 'IMG-17',
    id: 's17_chat',
    zh: '早期聊天窗口',
    en: '2000s Desktop IM & GIF',
    era: '2000s',
    gag: '虚构聊天窗收到 256 色抖动噪点动图，强拍触发“窗口抖动”与“对方正在输入…”',
    palette: ['#3a6ea5', '#ece9d8', '#0054e3', '#ffffff', '#1f1f1f'],
    frameColor: '#0054e3',
    frameAccent: '#ece9d8',
    quantizeHz: 10,
  },
  {
    index: 17,
    num: 18,
    imgCode: 'IMG-18',
    id: 's18_vaporwave',
    zh: '蒸汽波',
    en: 'Vaporwave Sunset Grid',
    era: '2010s',
    gag: '粉紫青落日透视网格与低多边形棕榈间，古典大理石胸像静静旁观',
    palette: ['#240b36', '#ff4ecd', '#00f0ff', '#9d4edd', '#ffe6f7'],
    frameColor: '#7b2cbf',
    frameAccent: '#00f0ff',
  },
  {
    index: 18,
    num: 19,
    imgCode: 'IMG-19',
    id: 's19_shortvideo',
    zh: '竖屏短视频',
    en: '9:16 Vertical Short-Video Feed',
    era: '2020s',
    gag: '骤然收窄为 9:16 竖屏黑边虚构界面，红心弹幕上飘，进度条走满恰好过框',
    palette: ['#0f0f14', '#ff2a5f', '#25f4ee', '#ffffff', '#22222c'],
    frameColor: '#1b1b24',
    frameAccent: '#ff2a5f',
    cameraMode: 'vertical_9_16',
  },
  {
    index: 19,
    num: 20,
    imgCode: 'IMG-20',
    id: 's20_code',
    zh: '代码美学',
    en: 'Generative SVG Code Art',
    era: '2020s',
    gag: '深色编辑器逐行涌现贝塞尔与 SVG 代码，一笔笔勾勒出全片最精致的鹈鹕答卷',
    palette: ['#0d1117', '#58a6ff', '#f78166', '#7ee787', '#e6edf3'],
    frameColor: '#1f2937',
    frameAccent: '#58a6ff',
  },
].map((s, idx) => ({
  ...s,
  t0: INTRO_SEC + idx * SCENE_SEC,
  t1: INTRO_SEC + (idx + 1) * SCENE_SEC,
  worldX0: idx * PANEL_SIZE,
  worldX1: (idx + 1) * PANEL_SIZE,
}));

export function clamp(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v;
}

export function smoothstep(e0, e1, x) {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
}

export function smootherstep(e0, e1, x) {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * t * (t * (t * 6 - 15) + 10);
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function quantizeTime(t, hz = 10) {
  if (!hz || hz <= 0) return t;
  return Math.floor(t * hz + 1e-6) / hz;
}

export function getBeatState(rawCanonicalT) {
  const t = clamp(rawCanonicalT, 0, TOTAL_DURATION);
  const globalBeat = t / BEAT_SEC;
  const beatIndex = Math.floor(globalBeat + 1e-7);
  const beatFrac = globalBeat - beatIndex;
  const pedalAngle = globalBeat * Math.PI;

  let section = 'scenes';
  let sceneIndex = -1;
  let scene = null;
  let localT = 0;
  let barInScene = 0;
  let beatInScene = 0;

  if (t < INTRO_SEC) {
    section = 'intro';
    localT = t;
  } else if (t < INTRO_SEC + SCENES_TOTAL_SEC) {
    section = 'scenes';
    const st = t - INTRO_SEC;
    sceneIndex = clamp(Math.floor(st / SCENE_SEC), 0, NUM_SCENES - 1);
    scene = SCENES[sceneIndex];
    localT = st - sceneIndex * SCENE_SEC;
    beatInScene = localT / BEAT_SEC;
    barInScene = clamp(Math.floor(localT / BAR_SEC), 0, 2);
  } else {
    section = 'outro';
    localT = t - (INTRO_SEC + SCENES_TOTAL_SEC);
  }

  return {
    t,
    globalBeat,
    beatIndex,
    beatFrac,
    isStrongBeat: beatIndex % 2 === 0,
    isBarDownbeat: section === 'scenes' ? Math.floor(beatInScene + 1e-6) % 4 === 0 : beatIndex % 4 === 0,
    pedalAngle,
    section,
    sceneIndex,
    scene,
    localT,
    barInScene,
    beatInScene,
  };
}

export function getSceneProgress(scene, localT) {
  const s = clamp(localT / SCENE_SEC, 0, 1);
  if (!scene || scene.motionProfile !== 'freeze_bar2') {
    return { u: s, speedScale: 1.0, pedalPhaseOffset: 0 };
  }
  const plateauCenter = 0.5;
  const plateauStrength = 0.78;
  const env = Math.exp(-Math.pow((s - plateauCenter) / 0.14, 2));
  const detour = -0.095 * Math.sin(2 * Math.PI * s) * smoothstep(0.05, 0.22, s) * smoothstep(0.95, 0.78, s);
  const u = clamp(s + detour, 0, 1);
  const speedScale = clamp(1 - plateauStrength * env, 0.12, 1.45);
  const pedalPhaseOffset =
    -1.65 *
    Math.sin(Math.PI * clamp((localT - 1.5) / 3.0, 0, 1)) *
    smoothstep(1.5, 2.1, localT) *
    smoothstep(4.5, 3.9, localT);
  return { u, speedScale, pedalPhaseOffset };
}

export function getPelicanWorldState(canonicalT) {
  if (canonicalT < INTRO_SEC) {
    const tStart = 3.2;
    const dur = INTRO_SEC - tStart;
    const s = clamp((canonicalT - tStart) / dur, 0, 1);
    const s2 = s * s;
    const s3 = s2 * s;
    const s4 = s2 * s2;
    const speedScale = s2 * (3 - 2 * s);
    const mX = (PANEL_SIZE / SCENE_SEC) * dur;
    const worldX = mX * (-0.5 + s3 - 0.5 * s4);
    const endTheta = (INTRO_SEC / BEAT_SEC) * Math.PI;
    const mTheta = (Math.PI / BEAT_SEC) * dur;
    const pedalAngle = endTheta + mTheta * (-0.5 + s3 - 0.5 * s4);
    return { visibleInScroll: canonicalT >= tStart, worldX, speedScale, pedalAngle };
  }

  if (canonicalT < INTRO_SEC + SCENES_TOTAL_SEC) {
    const st = canonicalT - INTRO_SEC;
    const idx = clamp(Math.floor(st / SCENE_SEC), 0, NUM_SCENES - 1);
    const localT = st - idx * SCENE_SEC;
    const scene = SCENES[idx];
    const { u, speedScale, pedalPhaseOffset } = getSceneProgress(scene, localT);
    return {
      visibleInScroll: true,
      worldX: idx * PANEL_SIZE + u * PANEL_SIZE,
      speedScale,
      pedalAngle: (canonicalT / BEAT_SEC) * Math.PI + pedalPhaseOffset,
    };
  }

  const outroElapsed = canonicalT - (INTRO_SEC + SCENES_TOTAL_SEC);
  return {
    visibleInScroll: outroElapsed < 1.0,
    worldX: NUM_SCENES * PANEL_SIZE + (outroElapsed / SCENE_SEC) * PANEL_SIZE,
    speedScale: 1.0,
    pedalAngle: (canonicalT / BEAT_SEC) * Math.PI,
  };
}
