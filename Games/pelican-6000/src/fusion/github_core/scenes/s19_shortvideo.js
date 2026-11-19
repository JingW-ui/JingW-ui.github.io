// src/scenes/s19_shortvideo.js
// #19 竖屏短视频 (2020s · 9:16 Action-Cam Chase + Street Impasto Pop) — r3 Masterpiece
// - 3-tier 1D horizontal shutter-blurred baked footage (sky/bay 2px, seawall/bougainvillea 10px,
//   EPDM granular red cycling lane 22px) + pinnate coconut palms & foreground bokeh frond wipe.
// - 24mm smartphone CMOS optical vignette, asymmetric rainbow lens ghosting & sensor grain.
// - `bakeBrush` -> `bake2D` acrylic dry-brush impasto pelican + Kamm-tail aero carbon bike with
//   HDR sunlit white-gold rim & warm crimson-magenta bounce light from the red track.
// - Bar-2 camera yellow `[ + ]` autofocus lock-on -> finger touch ripples + giant bursting hearts!
// - Comments relocated to bottom-left live feed (y=700..796) + light top danmaku (y=114..168),
//   leaving y=185..665 sunlit sky & palms 100% unobstructed. Native Top-19 hot-search pill.

import {
  PANEL_SIZE,
  ROAD_EDGE_Y,
  BEAT_SEC,
  clamp,
  lerp,
  smoothstep,
} from '../beat/timeline.js';
import { computePelicanRig } from '../rig/pelican.js';

const VX = 219;
const VW = 562;
const VR = VX + VW; // 781
const TILE_W = VW * 2; // 1124 seamless horizontal wrap

const LIVE_COMMENTS = [
  { user: '阿海骑行日记', color: '#25f4ee', text: '摄影师骑电瓶车拧到底追的吧？？' },
  { user: '节拍器成精', color: '#ffd166', text: '这踏频焊死120BPM了属于是！' },
  { user: '墨池观鸟人', color: '#ff7eb3', text: '八大山人连夜爬起来点了个赞' },
  { user: '破风冲刺手', color: '#ff2a5f', text: '60mm碳刀配大喉囊绝了哈哈哈' },
  { user: '滨海晨跑王', color: '#4ade80', text: '前方高能！马上冲破右手机框！' },
];

const TOP_DANMAKU = [
  { text: '前方野生破风手出没！！', y: 122, speed: 145, offset: 40, col: '#ffffff' },
  { text: '120BPM卡点神曲焊死车门', y: 148, speed: 178, offset: 360, col: '#fef08a' },
  { text: '建议直接保送环法冲刺绿衫', y: 170, speed: 132, offset: 690, col: '#67e8f9' },
];

function evalHermiteSegment(x, x0, x1, y0, y1, m0, m1) {
  const h = x1 - x0;
  const t = clamp((x - x0) / h, 0, 1);
  const t2 = t * t;
  const t3 = t2 * t;
  return (
    (2 * t3 - 3 * t2 + 1) * y0 +
    (t3 - 2 * t2 + t) * h * m0 +
    (-2 * t3 + 3 * t2) * y1 +
    (t3 - t2) * h * m1
  );
}

function mapGimbalX(px, isOutroThumbnail) {
  if (isOutroThumbnail) return 500;
  if (px <= 134 || px >= 866) return px;
  if (px < 172) return evalHermiteSegment(px, 134, 172, 134, 276, 1.0, 1.05);
  if (px < 500) return evalHermiteSegment(px, 172, 500, 276, 496, 1.05, 0.62);
  if (px < 828) return evalHermiteSegment(px, 500, 828, 496, 706, 0.62, 1.05);
  return evalHermiteSegment(px, 828, 866, 706, 866, 1.05, 1.0);
}

// Fast deterministic 2D value-noise + FBM for volumetric clouds, sea facets & EPDM granules
function hash2(ix, iy) {
  let h = (Math.imul(ix, 374761393) + Math.imul(iy, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function noise2(x, y) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const a = hash2(ix, iy);
  const b = hash2(ix + 1, iy);
  const c = hash2(ix, iy + 1);
  const d = hash2(ix + 1, iy + 1);
  return lerp(lerp(a, b, ux), lerp(c, d, ux), uy);
}

function fbm2(x, y, octaves = 4) {
  let v = 0;
  let amp = 0.5;
  let freq = 1;
  for (let i = 0; i < octaves; i++) {
    v += amp * noise2(x * freq, y * freq);
    freq *= 2.03;
    amp *= 0.5;
  }
  return v;
}

// Fast O(W*H) sliding-window 1D horizontal shutter motion-blur convolution (periodic X wrap)
function applyHorizShutterBlur(ctx, w, h, radius, wrap = true) {
  if (radius < 1) return;
  const r = Math.round(radius);
  const img = ctx.getImageData(0, 0, w, h);
  const src = img.data;
  const dst = new Uint8ClampedArray(src.length);
  const diam = 2 * r + 1;

  for (let y = 0; y < h; y++) {
    const rowOff = y * w * 4;
    let sr = 0, sg = 0, sb = 0, sa = 0;
    for (let k = -r; k <= r; k++) {
      const xk = wrap ? ((k % w) + w) % w : clamp(k, 0, w - 1);
      const idx = rowOff + xk * 4;
      sr += src[idx];
      sg += src[idx + 1];
      sb += src[idx + 2];
      sa += src[idx + 3];
    }
    for (let x = 0; x < w; x++) {
      const outIdx = rowOff + x * 4;
      dst[outIdx] = (sr / diam) | 0;
      dst[outIdx + 1] = (sg / diam) | 0;
      dst[outIdx + 2] = (sb / diam) | 0;
      dst[outIdx + 3] = (sa / diam) | 0;

      const xRem = wrap ? (((x - r) % w) + w) % w : clamp(x - r, 0, w - 1);
      const xAdd = wrap ? (((x + r + 1) % w) + w) % w : clamp(x + r + 1, 0, w - 1);
      const iRem = rowOff + xRem * 4;
      const iAdd = rowOff + xAdd * 4;
      sr += src[iAdd] - src[iRem];
      sg += src[iAdd + 1] - src[iRem + 1];
      sb += src[iAdd + 2] - src[iRem + 2];
      sa += src[iAdd + 3] - src[iRem + 3];
    }
  }
  img.data.set(dst);
  ctx.putImageData(img, 0, 0);
}

/**
 * 1. Bakes static 1000x1000 cinema pillarboxes + 9:16 FBM volumetric tropical sky, hazy coastal
 *    mountains, sparkling caustic ocean bay (2px pan blur), and bottom scrim base.
 */
function getCoastalSkyBayLayer(kit) {
  return kit.bake2D('s19_sky_bay_r3', (_g, ctx) => {
    ctx.fillStyle = '#050508';
    ctx.fillRect(0, 0, PANEL_SIZE, PANEL_SIZE);

    // Offscreen 562x640 sky+bay buffer for pixel-level volumetric clouds & 2px pan blur
    const skyH = 640;
    const sub = kit.bake2D('s19_sky_sub_r3', (_sg, sctx) => {
      const img = sctx.createImageData(VW, skyH);
      const data = img.data;
      const sunX = VW - 108;
      const sunY = 166;

      for (let y = 0; y < skyH; y++) {
        for (let x = 0; x < VW; x++) {
          const idx = (y * VW + x) * 4;
          const dx = x - sunX;
          const dy = y - sunY;
          const sunDist = Math.hypot(dx, dy);

          if (y < 468) {
            // Tropical HDR azure sky + sunlit golden atmospheric scattering
            const v = y / 468;
            let r = lerp(4, 198, Math.pow(v, 1.35));
            let g = lerp(118, 240, Math.pow(v, 1.08));
            let b = lerp(198, 252, Math.pow(v, 0.72));

            // Volumetric FBM cumulus banks concentrated at y=220..455 (ZERO circle arcs!)
            const cloudBand = smoothstep(145, 290, y) * smoothstep(470, 395, y);
            const cn = fbm2(x * 0.011 + 3.1, y * 0.018 + 1.7, 5);
            const detail = fbm2(x * 0.032 + 9.4, y * 0.042, 3);
            const density = clamp((cn * 0.78 + detail * 0.32 - 0.44) * 3.1 * cloudBand, 0, 1);

            if (density > 0.01) {
              // Top-right sun-facing crest vs cool lavender-azure cloud belly
              const nTop = fbm2((x + 5) * 0.011 + 3.1, (y - 7) * 0.018 + 1.7, 4);
              const lit = clamp(0.55 + (cn - nTop) * 3.2 + Math.exp(-sunDist / 240) * 0.35, 0, 1);
              const cr = lerp(168, 255, lit);
              const cg = lerp(202, 252, lit);
              const cb = lerp(236, 242, lit);
              r = lerp(r, cr, density * 0.92);
              g = lerp(g, cg, density * 0.92);
              b = lerp(b, cb, density * 0.92);
            }

            // Distant misty coastal mountain & peninsula silhouette (y=415..468)
            const ridgeY =
              442 -
              26 * noise2(x * 0.0075 + 2.2, 4.1) -
              11 * noise2(x * 0.024, 8.3) +
              14 * Math.sin(x * 0.011);
            if (y >= ridgeY) {
              const mist = clamp((y - ridgeY) / 28, 0, 1);
              r = lerp(r, lerp(142, 118, mist), 0.72);
              g = lerp(g, lerp(204, 186, mist), 0.72);
              b = lerp(b, lerp(235, 218, mist), 0.72);
            }

            // Intense HDR solar bloom core
            const glow = Math.exp(-sunDist / 92) * 0.78 + Math.exp(-sunDist / 250) * 0.32;
            r = clamp(r + glow * 255, 0, 255);
            g = clamp(g + glow * 244, 0, 255);
            b = clamp(b + glow * 195, 0, 255);

            data[idx] = r | 0;
            data[idx + 1] = g | 0;
            data[idx + 2] = b | 0;
            data[idx + 3] = 255;
          } else {
            // Sparkling turquoise-emerald coastal ocean bay (y=468..640) with wave caustics
            const sv = (y - 468) / (skyH - 468);
            const waveScale = lerp(0.18, 0.055, sv);
            const wn = fbm2(x * waveScale * 0.35 + 4.5, y * waveScale * 1.9, 4);
            let r = lerp(3, 18, sv) + wn * 26;
            let g = lerp(132, 186, sv) + wn * 38;
            let b = lerp(196, 174, sv) + wn * 28;

            // Shimmering sun-path specular glints below sunX
            const sunCol = Math.exp(-Math.abs(x - sunX + sv * 34) / (46 + sv * 85));
            const sparkle = smoothstep(0.60, 0.78, noise2(x * 0.09, y * 0.42));
            const spec = sunCol * sparkle * (0.95 - sv * 0.3);
            r = clamp(r + spec * 250, 0, 255);
            g = clamp(g + spec * 246, 0, 255);
            b = clamp(b + spec * 210, 0, 255);

            data[idx] = r | 0;
            data[idx + 1] = g | 0;
            data[idx + 2] = b | 0;
            data[idx + 3] = 255;
          }
        }
      }
      sctx.putImageData(img, 0, 0);

      // Subtle atmospheric sea-bridge towers veiled in horizon haze before 2px pan blur
      sctx.strokeStyle = 'rgba(240, 249, 255, 0.52)';
      sctx.lineWidth = 1.8;
      sctx.beginPath();
      sctx.moveTo(155, 466);
      sctx.lineTo(398, 466);
      for (const px of [218, 326]) {
        sctx.moveTo(px, 467);
        sctx.lineTo(px, 420);
        for (let s = -3; s <= 3; s++) {
          if (!s) continue;
          sctx.moveTo(px, 424);
          sctx.lineTo(px + s * 13, 466);
        }
      }
      sctx.stroke();

      applyHorizShutterBlur(sctx, VW, skyH, 2, false);
    }, VW, skyH);

    ctx.drawImage(sub.canvas, VX, 0);

    // Dark asphalt/scrim apron below y=740 inside 9:16 frame
    const botGrad = ctx.createLinearGradient(0, 738, 0, PANEL_SIZE);
    botGrad.addColorStop(0.0, '#141926');
    botGrad.addColorStop(0.35, '#0b0e17');
    botGrad.addColorStop(1.0, '#05060b');
    ctx.fillStyle = botGrad;
    ctx.fillRect(VX, 738, VW, PANEL_SIZE - 738);

    // Cross-frame y = 680 neon guide rails across left & right #050508 pillarboxes
    const drawEdgeGuide = (xStart, xEnd, fadeLeftToRight) => {
      const gg = ctx.createLinearGradient(xStart, 0, xEnd, 0);
      if (fadeLeftToRight) {
        gg.addColorStop(0.0, 'rgba(37, 244, 238, 0.38)');
        gg.addColorStop(0.65, 'rgba(255, 42, 95, 0.18)');
        gg.addColorStop(1.0, 'rgba(255, 42, 95, 0.46)');
      } else {
        gg.addColorStop(0.0, 'rgba(255, 42, 95, 0.46)');
        gg.addColorStop(0.35, 'rgba(255, 42, 95, 0.18)');
        gg.addColorStop(1.0, 'rgba(37, 244, 238, 0.38)');
      }
      ctx.save();
      ctx.strokeStyle = gg;
      ctx.shadowColor = '#ff2a5f';
      ctx.shadowBlur = 10;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(xStart, ROAD_EDGE_Y);
      ctx.lineTo(xEnd, ROAD_EDGE_Y);
      ctx.stroke();
      ctx.restore();
    };
    drawEdgeGuide(0, VX, true);
    drawEdgeGuide(VR, PANEL_SIZE, false);
  });
}

/**
 * 2. Bakes Midground Seawall + Organic Bougainvillea + Coastal Guardrail (10px 1D shutter blur!).
 */
function getMidgroundStrip(kit) {
  const H = 112; // spans y = 542..654
  return kit.bake2D('s19_mid_strip_r3', (_g, ctx, rng) => {
    // Weathered concrete seawall coping (y=52..82 -> world 594..624) + lawn verge (80..104)
    for (let y = 50; y < H; y++) {
      for (let x = 0; x < TILE_W; x += 2) {
        const n = fbm2(x * 0.05, y * 0.12, 3);
        if (y < 80) {
          const v = (224 + n * 28 - (y - 50) * 0.8) | 0;
          ctx.fillStyle = `rgb(${v},${v + 3},${v + 7})`;
        } else {
          const g = (118 + n * 75 - (y - 80) * 1.6) | 0;
          ctx.fillStyle = `rgb(${(22 + n * 24) | 0},${g},${(42 + n * 24) | 0})`;
        }
        ctx.fillRect(x, y, 2, 1);
      }
    }

    // Coastal promenade guardrail with sunlit metallic highlights
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(0, 28, TILE_W, 5);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(0, 40, TILE_W, 3);
    for (let x = 18; x < TILE_W; x += 64) {
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(x, 22, 6, 32);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(x + 6, 22, 3, 32);
    }

    // Lush organic bougainvillea hedges (foliage brush clusters + crimson/magenta bracts)
    for (let cx = 65; cx < TILE_W; cx += 187) {
      for (let d = 0; d < 55; d++) {
        const ox = (rng() - 0.5) * 96;
        const oy = -rng() * 34 * (1 - Math.pow(ox / 54, 2));
        ctx.fillStyle = rng() > 0.35 ? '#15803d' : '#166534';
        ctx.fillRect(cx + ox, 78 + oy, 8 + rng() * 9, 6 + rng() * 6);
      }
      for (let b = 0; b < 38; b++) {
        const ox = (rng() - 0.5) * 86;
        const oy = -4 - rng() * 28 * Math.max(0.15, 1 - Math.pow(ox / 48, 2));
        ctx.fillStyle = rng() > 0.4 ? '#f43f5e' : rng() > 0.5 ? '#fb7185' : '#e11d48';
        ctx.fillRect(cx + ox, 76 + oy, 5 + rng() * 5, 4 + rng() * 4);
      }
    }

    // 10px 1D horizontal shutter motion blur -> real 1/60s scooter chase-cam parallax!
    applyHorizShutterBlur(ctx, TILE_W, H, 9, true);
  }, TILE_W, H);
}

/**
 * 3. Bakes Foreground EPDM Granular Red Athletic Cycling Lane (22px 1D shutter blur!).
 */
function getForegroundRoadStrip(kit) {
  const H = 104; // spans y = 642..746 (canonical wheel contact at y = 680 -> local y = 38)
  return kit.bake2D('s19_road_strip_r3', (_g, ctx, rng) => {
    const img = ctx.createImageData(TILE_W, H);
    const data = img.data;
    for (let y = 0; y < H; y++) {
      const v = y / H;
      // Dual dark rubber tire wear tracks near local y = 38 (world y = 680)
      const tireWear =
        Math.exp(-Math.pow((y - 38) / 9, 2)) * 0.24 +
        Math.exp(-Math.pow((y - 54) / 11, 2)) * 0.14;
      for (let x = 0; x < TILE_W; x++) {
        const idx = (y * TILE_W + x) * 4;
        const grain = hash2(x, y * 3 + 17);
        const macro = noise2((x / TILE_W) * 24, y * 0.14);
        // Dappled diagonal palm-frond sunlight shadows across the red lane
        const palmShade = smoothstep(0.54, 0.68, Math.sin(((x + y * 1.4) / TILE_W) * Math.PI * 8) * 0.5 + 0.5) * 0.22;
        const shade = (1 - tireWear - palmShade) * (0.82 + 0.26 * grain + 0.12 * macro);

        let r = lerp(228, 138, v) * shade;
        let g = lerp(34, 18, v) * shade + (grain > 0.88 ? 22 : 0);
        let b = lerp(74, 48, v) * shade + (grain > 0.88 ? 18 : 0);

        // Crisp white athletic lane border stripes & dashed centerline before shutter blur
        const isTopLine = y >= 5 && y <= 8;
        const isBotLine = y >= 90 && y <= 94;
        const isCenterDash = y >= 47 && y <= 51 && (x % 112) < 52;
        if (isTopLine || isBotLine || isCenterDash) {
          const wear = 0.84 + 0.16 * grain;
          r = 248 * wear;
          g = 246 * wear;
          b = 248 * wear;
        }

        data[idx] = clamp(r, 0, 255) | 0;
        data[idx + 1] = clamp(g, 0, 255) | 0;
        data[idx + 2] = clamp(b, 0, 255) | 0;
        data[idx + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);

    // Specular gravel micro-sparks before horizontal motion-blur streak
    for (let i = 0; i < 420; i++) {
      ctx.fillStyle = rng() > 0.4 ? 'rgba(255,235,238,0.45)' : 'rgba(15,18,30,0.45)';
      ctx.fillRect(rng() * TILE_W, 8 + rng() * 82, 3, 2);
    }

    // 20px 1D horizontal shutter motion blur -> high-speed road aggregate streaks!
    applyHorizShutterBlur(ctx, TILE_W, H, 19, true);
  }, TILE_W, H);
}

/**
 * 4. Bakes Realistic Pinnate Coconut Palm Sprite + Foreground Out-of-Focus Bokeh Leaf Wipe.
 */
function getPalmSprites(kit) {
  const palm = kit.bake2D('s19_palm_pinnate_r3', (_g, ctx, rng) => {
    const W = 280;
    const H = 320;
    const bx = 132;
    const by = 308;
    const cx = 158;
    const cy = 92;

    // Fibrous ringed coconut trunk with sunlit right edge
    for (let i = 0; i <= 44; i++) {
      const u = i / 44;
      const px = lerp(bx, cx, u) - Math.sin(Math.PI * u) * 16;
      const py = lerp(by, cy, u);
      const w = lerp(9.5, 5.2, u);
      ctx.fillStyle = i % 2 === 0 ? '#4a3528' : '#634735';
      ctx.fillRect(px - w, py - 4, w * 2, 6);
      ctx.fillStyle = '#ca8a04';
      ctx.fillRect(px + w * 0.25, py - 4, w * 0.68, 5);
    }

    // Coconut cluster under crown
    for (const [ox, oy, col] of [[-7, 8, '#713f12'], [4, 10, '#854d0e'], [-1, 4, '#a16207']]) {
      ctx.fillStyle = col;
      ctx.fillRect(cx + ox - 5, cy + oy - 5, 10, 9);
    }

    // 8 arching fronds, each composed of 26 individual pinnate leaflets + sunlit lime rim!
    const frondSpecs = [
      [-2.75, 108], [-2.22, 118], [-1.68, 96], [-1.05, 104],
      [-0.42, 116], [0.14, 112], [0.58, 94], [2.62, 98],
    ];
    for (let f = 0; f < frondSpecs.length; f++) {
      const [ang, len] = frondSpecs[f];
      const ex = cx + Math.cos(ang) * len;
      const ey = cy + Math.sin(ang) * len + 30;
      const mx = (cx + ex) * 0.5;
      const my = (cy + ey) * 0.5 - 24;

      ctx.strokeStyle = '#65a30d';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.quadraticCurveTo(mx, my, ex, ey);
      ctx.stroke();

      for (let l = 2; l <= 24; l++) {
        const u = l / 25;
        const mt = 1 - u;
        const rx = mt * mt * cx + 2 * mt * u * mx + u * u * ex;
        const ry = mt * mt * cy + 2 * mt * u * my + u * u * ey;
        const leafLen = Math.sin(Math.PI * u) * (22 + (f % 2) * 5);
        for (const side of [-1, 1]) {
          const la = ang + side * (0.68 + u * 0.38) + 0.25;
          ctx.strokeStyle = side > 0 || ang > -1.2 ? '#84cc16' : '#15803d';
          ctx.lineWidth = 1.7;
          ctx.beginPath();
          ctx.moveTo(rx, ry);
          ctx.lineTo(rx + Math.cos(la) * leafLen, ry + Math.sin(la) * leafLen + u * 8);
          ctx.stroke();
        }
      }
      if (rng() > 0.3) {
        ctx.strokeStyle = 'rgba(254, 240, 138, 0.55)';
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.quadraticCurveTo(mx, my - 1, ex, ey);
        ctx.stroke();
      }
    }
    applyHorizShutterBlur(ctx, W, H, 3, false);
  }, 280, 320);

  const fgWipe = kit.bake2D('s19_fg_bokeh_frond_r3', (_g, ctx) => {
    const W = 240;
    const H = 260;
    for (let i = 0; i < 14; i++) {
      const a = 0.25 + i * 0.09;
      ctx.strokeStyle = i % 3 === 0 ? 'rgba(190, 242, 100, 0.55)' : 'rgba(21, 128, 61, 0.62)';
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.moveTo(10, 20 + i * 12);
      ctx.lineTo(10 + Math.cos(a) * 210, 20 + i * 12 + Math.sin(a) * 90);
      ctx.stroke();
    }
    applyHorizShutterBlur(ctx, W, H, 16, false);
  }, 240, 260);

  return { palm, fgWipe };
}

/**
 * 5. Bakes 24mm Smartphone CMOS Optical Overlay: corner vignette, asymmetric spherical
 *    lens flare rainbow ghosting arcs (NO polygons!), & subtle sensor grain.
 */
function getSmartphoneOpticsOverlay(kit) {
  return kit.bake2D('s19_cmos_optics_r3', (_g, ctx, rng) => {
    // 24mm wide-angle natural corner vignette
    const vig = ctx.createRadialGradient(VW * 0.52, 460, 180, VW * 0.5, 500, 560);
    vig.addColorStop(0.0, 'rgba(0,0,0,0)');
    vig.addColorStop(0.72, 'rgba(4,8,18,0.06)');
    vig.addColorStop(1.0, 'rgba(2,4,12,0.34)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, VW, PANEL_SIZE);

    // Authentic smartphone sapphire-lens asymmetric ghosting arcs & warm anamorphic streak
    const sx = VW - 108;
    const sy = 166;
    const streak = ctx.createLinearGradient(sx - 260, sy + 24, sx + 110, sy - 10);
    streak.addColorStop(0, 'rgba(56, 189, 248, 0)');
    streak.addColorStop(0.48, 'rgba(254, 249, 195, 0.24)');
    streak.addColorStop(0.76, 'rgba(255, 255, 255, 0.42)');
    streak.addColorStop(1, 'rgba(254, 240, 138, 0)');
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(-0.09);
    ctx.fillStyle = streak;
    ctx.fillRect(-260, -4, 370, 8);
    ctx.restore();

    // Diagonal optical axis internal lens ghost crescents (soft rainbow dispersion)
    const ghosts = [
      { t: 0.42, r: 34, c: 'rgba(253, 224, 71, 0.14)', arc: [-0.9, 1.1] },
      { t: 0.68, r: 52, c: 'rgba(56, 189, 248, 0.11)', arc: [1.6, 3.8] },
      { t: 0.95, r: 26, c: 'rgba(244, 114, 182, 0.15)', arc: [-0.4, 2.2] },
    ];
    for (const gh of ghosts) {
      const gx = lerp(sx, VW * 0.24, gh.t);
      const gy = lerp(sy, 540, gh.t);
      ctx.strokeStyle = gh.c;
      ctx.lineWidth = 5.5;
      ctx.beginPath();
      ctx.arc(gx, gy, gh.r, gh.arc[0], gh.arc[1]);
      ctx.stroke();
    }

    // Fine 2% mobile CMOS high-shutter luminance & chroma grain
    for (let i = 0; i < 2400; i++) {
      const px = rng() * VW;
      const py = rng() * PANEL_SIZE;
      ctx.fillStyle =
        rng() > 0.5 ? 'rgba(255,255,255,0.032)' : 'rgba(15,23,42,0.038)';
      ctx.fillRect(px, py, 1.5, 1.5);
    }
  }, VW, PANEL_SIZE);
}

/**
 * 6. Bakes Street-Art Acrylic Impasto & Dry-Brush Swatch via `kit.bakeBrush` -> `fb.get().canvas`
 *    into `kit.bake2D` (keeping `slot.usedFb = false` and 100% compatible with `outro.js`!).
 */
function getImpastoBrushPattern(kit, ctxMain) {
  const tex = kit.bake2D('s19_impasto_swatch_r3', (_g, ctx, rng) => {
    // Rich gouache/acrylic base grain
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 256, 256);

    if (kit.brush && typeof kit.bakeBrush === 'function') {
      try {
        const fb = kit.bakeBrush('s19_impasto_fb_r3', (p, brush, brng) => {
          p.clear();
          brush.noFill();
          brush.noHatch();
          brush.noField();
          const cols = ['#e0f2fe', '#bae6fd', '#fda4af', '#fef08a', '#ffffff', '#cbd5e1'];
          for (let i = 0; i < 68; i++) {
            brush.set(i % 2 === 0 ? 'charcoal' : 'marker', cols[i % cols.length], 2.2 + brng() * 2.8);
            const x0 = brng() * 256;
            const y0 = brng() * 256;
            const ang = -0.25 + (brng() - 0.5) * 0.45;
            const len = 36 + brng() * 65;
            brush.line(x0, y0, x0 + Math.cos(ang) * len, y0 + Math.sin(ang) * len);
          }
        });
        const snap = fb && typeof fb.get === 'function' ? fb.get() : null;
        if (snap && snap.canvas) {
          ctx.globalAlpha = 0.52;
          ctx.drawImage(snap.canvas, 0, 0, 256, 256, 0, 0, 256, 256);
          ctx.globalAlpha = 1;
        }
      } catch (_e) {
        // Fallback if WebGL brush unavailable in Node smoke check
      }
    }

    // Crisp dry-brush acrylic bristle ridges & knife impasto flecks
    for (let i = 0; i < 220; i++) {
      const x = rng() * 256;
      const y = rng() * 256;
      const w = 16 + rng() * 38;
      ctx.fillStyle =
        i % 4 === 0
          ? 'rgba(186, 230, 253, 0.28)'
          : i % 4 === 1
            ? 'rgba(255, 255, 255, 0.55)'
            : i % 4 === 2
              ? 'rgba(251, 113, 133, 0.16)'
              : 'rgba(15, 23, 42, 0.08)';
      ctx.fillRect(x, y, w, 1.8 + rng() * 2.4);
    }
  }, 256, 256);

  return ctxMain.createPattern ? ctxMain.createPattern(tex.canvas, 'repeat') : '#f8fafc';
}

/**
 * Draws scrolling 1D-shutter-blurred coastal parallax inside `[VX..VR]` with handheld gimbal breathing!
 */
function drawCoastalActionCamFeed(kit, ctx, localT, scrollT, rig, isOutroThumbnail) {
  const skyBay = getCoastalSkyBayLayer(kit);
  ctx.drawImage(skyBay.canvas, 0, 0);

  const midStrip = getMidgroundStrip(kit);
  const roadStrip = getForegroundRoadStrip(kit);
  const { palm, fgWipe } = getPalmSprites(kit);
  const optics = getSmartphoneOpticsOverlay(kit);

  ctx.save();
  ctx.beginPath();
  ctx.rect(VX, 0, VW, PANEL_SIZE);
  ctx.clip();

  // Handheld scooter 2-axis wrist sway + beat-synced mobile zoom breathing (tapers near bezel edges!)
  let camDX = 0;
  let camDY = 0;
  let camZoom = 1.0;
  if (!isOutroThumbnail) {
    const px = rig ? rig.root.x : 500;
    const insideEnv = smoothstep(VX + 18, VX + 75, px) * smoothstep(VR - 18, VR - 75, px);
    const beatU = (localT / BEAT_SEC) % 1;
    const beatKick = Math.exp(-beatU * 5.5) * (localT >= 2.0 ? 0.024 : 0.012);
    camZoom = 1.0 + beatKick * insideEnv;
    camDX = (Math.sin(localT * 4.3) * 2.1 + Math.sin(localT * 17.5) * 0.55) * insideEnv;
    camDY = (Math.cos(localT * 3.7) * 1.6 + Math.sin(localT * 23.0) * 0.65) * insideEnv;
  }

  ctx.translate(VX + VW * 0.5 + camDX, 540 + camDY);
  ctx.scale(camZoom, camZoom);
  ctx.translate(-(VX + VW * 0.5), -540);

  // Dynamic ocean shimmer glints
  for (let i = 0; i < 20; i++) {
    const row = i % 4;
    const wy = 482 + row * 22;
    const wx = VX + ((((i * 97 + 40) - scrollT * (65 + row * 24)) % VW + VW) % VW);
    const a = 0.28 + 0.55 * Math.abs(Math.sin(scrollT * 7.2 + i * 1.9));
    ctx.fillStyle = `rgba(255, 253, 224, ${a.toFixed(2)})`;
    ctx.fillRect(wx - 12, wy, 18 + (i % 3) * 8, 2.2);
  }

  // Pinnate coconut palms scrolling past seawall
  const palmSpan = 248;
  const palmOff = ((scrollT * 310) % palmSpan + palmSpan) % palmSpan;
  for (let k = -1; k <= 3; k++) {
    const px = VX + k * palmSpan - palmOff - 55;
    const py = 312 + ((k + 4) % 2) * 18;
    ctx.drawImage(palm.canvas, px, py);
  }

  // Scrolling 10px-blurred midground seawall + bougainvillea + balustrade (`y = 542..654`)
  const midOff = ((scrollT * 430) % TILE_W + TILE_W) % TILE_W;
  ctx.drawImage(midStrip.canvas, VX - midOff, 542);
  ctx.drawImage(midStrip.canvas, VX - midOff + TILE_W, 542);

  // Scrolling 22px-blurred foreground EPDM granular red cycling track (`y = 642..746`, road at 680!)
  const roadOff = ((scrollT * 690) % TILE_W + TILE_W) % TILE_W;
  ctx.drawImage(roadStrip.canvas, VX - roadOff, 642);
  ctx.drawImage(roadStrip.canvas, VX - roadOff + TILE_W, 642);

  ctx.restore();

  // Occasional out-of-focus foreground tropical palm frond whipping past top-left lens (`Foreground Wipe`)
  if (!isOutroThumbnail) {
    const wipeCyc = (((scrollT * 0.52 + 0.15) % 1) + 1) % 1;
    if (wipeCyc < 0.22) {
      const wu = wipeCyc / 0.22;
      ctx.save();
      ctx.beginPath();
      ctx.rect(VX, 0, VW, PANEL_SIZE);
      ctx.clip();
      ctx.globalAlpha = Math.sin(Math.PI * wu) * 0.62;
      ctx.drawImage(fgWipe.canvas, lerp(VR + 20, VX - 260, wu), 95);
      ctx.restore();
    }
  }

  // 24mm CMOS optical vignette, asymmetric rainbow ghosting & grain
  ctx.drawImage(optics.canvas, VX, 0);
}

/**
 * Draws the Street-Impasto Pop Pelican + Kamm-Tail Carbon Aero Road Bike:
 * - Variable-width Bezier anatomical S-neck (ZERO lineWidth=24 round tube!)
 * - `bakeBrush` impasto texture fill + HDR sunlit white-gold rim + warm crimson-magenta red-lane bounce!
 */
function drawStreetImpastoPelican(kit, ctx, rig, localT, mode = 'full', pillarAlpha = 1.0) {
  const s = rig.root.scale;
  const isPillar = mode === 'pillarbox';
  const rimTint = rig.root.x < 500 ? '#25f4ee' : '#ff2a5f';
  const darkSil = '#0e1220';
  const impastoPat = !isPillar ? getImpastoBrushPattern(kit, ctx) : null;

  ctx.save();
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.globalAlpha = pillarAlpha;

  if (!isPillar) {
    // Articulated midday sunlit indigo-violet cast shadow projected onto red EPDM track!
    ctx.save();
    ctx.fillStyle = 'rgba(18, 10, 36, 0.42)';
    for (const w of [rig.rearWheel, rig.frontWheel]) {
      ctx.beginPath();
      ctx.ellipse(w.x + 10 * s, rig.root.y + 5 * s, w.r * 0.96, 7.5 * s, 0.04, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.beginPath();
    ctx.ellipse(rig.root.x + 12 * s, rig.root.y + 8 * s, 92 * s, 10.5 * s, 0.03, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Subtle high-contrast sunlit chromatic-aberration rim pop (1.4px cyan/rose split)
    ctx.save();
    ctx.strokeStyle = 'rgba(37, 244, 238, 0.55)';
    ctx.lineWidth = 2.2 * s;
    ctx.beginPath();
    ctx.moveTo(rig.tailTip.x - 18 * s, rig.tailTip.y - 2 * s);
    ctx.lineTo(rig.tailTip.x - 78 * s, rig.tailTip.y);
    ctx.moveTo(rig.head.x - 22 * s, rig.head.y - 8 * s);
    ctx.lineTo(rig.head.x - 74 * s, rig.head.y - 6 * s);
    ctx.stroke();
    ctx.restore();
  } else {
    ctx.shadowColor = rimTint;
    ctx.shadowBlur = 12;
  }

  // 1. 60mm Deep-Section 3K-Carbon Aero Wheels with Motion-Blurred Spoke Fan Wedges!
  const drawCarbonWheel = (w) => {
    const r = w.r;
    const innerR = r - 14.2 * s;

    if (!isPillar) {
      // High-speed 1/60s shutter motion-blurred spoke fan wedges
      ctx.save();
      ctx.translate(w.x, w.y);
      ctx.rotate(w.angle);
      for (let f = 0; f < 4; f++) {
        const fa = (f * Math.PI) / 2;
        ctx.fillStyle = f % 2 === 0 ? 'rgba(226, 232, 240, 0.24)' : 'rgba(56, 189, 248, 0.16)';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, innerR, fa, fa + 0.42);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    ctx.strokeStyle = isPillar ? 'rgba(148,163,184,0.28)' : 'rgba(241, 245, 249, 0.65)';
    ctx.lineWidth = 1.25 * s;
    for (let i = 0; i < 12; i++) {
      const a = w.angle + (i * Math.PI * 2) / 12;
      ctx.beginPath();
      ctx.moveTo(w.x, w.y);
      ctx.lineTo(w.x + Math.cos(a) * innerR, w.y + Math.sin(a) * innerR);
      ctx.stroke();
    }

    // 60mm sculpted matte carbon rim + red-track warm bounce on bottom arc
    ctx.strokeStyle = isPillar ? darkSil : '#14161f';
    ctx.lineWidth = 13.0 * s;
    ctx.beginPath();
    ctx.arc(w.x, w.y, r - 7.0 * s, 0, Math.PI * 2);
    ctx.stroke();

    ctx.lineWidth = 4.6 * s;
    ctx.strokeStyle = '#ff2a5f';
    ctx.beginPath();
    ctx.arc(w.x, w.y, r - 7.0 * s, w.angle, w.angle + 0.88);
    ctx.stroke();
    ctx.strokeStyle = '#25f4ee';
    ctx.beginPath();
    ctx.arc(w.x, w.y, r - 7.0 * s, w.angle + Math.PI, w.angle + Math.PI + 0.88);
    ctx.stroke();

    // Tire tread + sunlit top specular highlight
    ctx.strokeStyle = isPillar ? rimTint : '#09090d';
    ctx.lineWidth = (isPillar ? 2.2 : 4.0) * s;
    ctx.beginPath();
    ctx.arc(w.x, w.y, r, 0, Math.PI * 2);
    ctx.stroke();

    if (!isPillar) {
      // Disc rotor & sunlit carbon rim edge
      ctx.strokeStyle = 'rgba(203, 213, 225, 0.72)';
      ctx.lineWidth = 1.6 * s;
      ctx.beginPath();
      ctx.arc(w.x, w.y, 12.5 * s, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255, 254, 240, 0.82)';
      ctx.lineWidth = 1.6 * s;
      ctx.beginPath();
      ctx.arc(w.x, w.y, r - 1.2 * s, -Math.PI * 0.82, -Math.PI * 0.18);
      ctx.stroke();
    }

    ctx.fillStyle = isPillar ? rimTint : '#fbbf24';
    ctx.beginPath();
    ctx.arc(w.x, w.y, 4.6 * s, 0, Math.PI * 2);
    ctx.fill();
  };

  // Sculpted tapered athletic leg with warm red-track bounce light
  const drawImpastoLeg = (hipPt, kneePt, footPt, pedalPt, isFar) => {
    const drawLimbSeg = (pA, pB, wA, wB, col, rimCol) => {
      const dx = pB.x - pA.x;
      const dy = pB.y - pA.y;
      const len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len;
      const ny = dx / len;
      ctx.fillStyle = isPillar ? darkSil : col;
      ctx.strokeStyle = isPillar ? rimTint : '#0f172a';
      ctx.lineWidth = 2.0 * s;
      ctx.beginPath();
      ctx.moveTo(pA.x + nx * wA, pA.y + ny * wA);
      ctx.lineTo(pB.x + nx * wB, pB.y + ny * wB);
      ctx.lineTo(pB.x - nx * wB, pB.y - ny * wB);
      ctx.lineTo(pA.x - nx * wA, pA.y - ny * wA);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      if (!isPillar && rimCol) {
        ctx.strokeStyle = rimCol;
        ctx.lineWidth = 1.6 * s;
        ctx.beginPath();
        ctx.moveTo(pA.x + nx * (wA - 1), pA.y + ny * (wA - 1));
        ctx.lineTo(pB.x + nx * (wB - 1), pB.y + ny * (wB - 1));
        ctx.stroke();
      }
    };

    ctx.strokeStyle = isPillar ? darkSil : '#1e293b';
    ctx.lineWidth = 4.4 * s;
    ctx.beginPath();
    ctx.moveTo(rig.bb.x, rig.bb.y);
    ctx.lineTo(pedalPt.x, pedalPt.y);
    ctx.stroke();

    const baseCol = isFar ? '#c2410c' : '#ff6b2b';
    drawLimbSeg(hipPt, kneePt, 4.8 * s, 3.6 * s, baseCol, isFar ? null : '#fef08a');
    drawLimbSeg(kneePt, footPt, 3.5 * s, 2.6 * s, isFar ? '#e11d48' : '#fb7185', isFar ? null : '#fda4af');

    ctx.fillStyle = isPillar ? darkSil : isFar ? '#be123c' : '#ff4d6d';
    ctx.strokeStyle = isPillar ? rimTint : '#0f172a';
    ctx.lineWidth = 2.0 * s;
    ctx.beginPath();
    ctx.moveTo(footPt.x - 5 * s, footPt.y);
    ctx.lineTo(footPt.x + 17 * s, footPt.y + 1.5 * s);
    ctx.lineTo(footPt.x + 12 * s, footPt.y + 8 * s);
    ctx.lineTo(footPt.x - 6 * s, footPt.y + 6 * s);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = '#25f4ee';
    ctx.lineWidth = 3.4 * s;
    ctx.beginPath();
    ctx.moveTo(pedalPt.x - 8.5 * s, pedalPt.y + 3 * s);
    ctx.lineTo(pedalPt.x + 8.5 * s, pedalPt.y + 3 * s);
    ctx.stroke();
  };

  drawImpastoLeg(rig.leftHip, rig.leftKnee, rig.leftFoot, rig.leftPedal, true);
  drawCarbonWheel(rig.rearWheel);
  drawCarbonWheel(rig.frontWheel);

  // 2. True Kamm-Tail Hydroformed Carbon Aero Monocoque Frame (sculpted airfoil tubes + dropped stays!)
  const drawAeroFoil = (pA, pB, wA, wB, fillStyle) => {
    const dx = pB.x - pA.x;
    const dy = pB.y - pA.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    ctx.fillStyle = isPillar ? darkSil : fillStyle;
    ctx.strokeStyle = isPillar ? rimTint : '#0f172a';
    ctx.lineWidth = (isPillar ? 2.0 : 2.4) * s;
    ctx.beginPath();
    ctx.moveTo(pA.x + nx * wA, pA.y + ny * wA);
    ctx.lineTo(pB.x + nx * wB, pB.y + ny * wB);
    ctx.lineTo(pB.x - nx * wB, pB.y - ny * wB);
    ctx.lineTo(pA.x - nx * wA, pA.y - ny * wA);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  };

  const frameGrad = ctx.createLinearGradient(rig.rearWheel.x, rig.seatCluster.y, rig.frontWheel.x, rig.bb.y);
  frameGrad.addColorStop(0.0, '#ff2a5f');
  frameGrad.addColorStop(0.46, '#ffffff');
  frameGrad.addColorStop(0.82, '#38bdf8');
  frameGrad.addColorStop(1.0, '#0284c7');

  const droppedStayJoin = {
    x: lerp(rig.seatCluster.x, rig.bb.x, 0.28),
    y: lerp(rig.seatCluster.y, rig.bb.y, 0.28),
  };
  drawAeroFoil(rig.rearWheel, droppedStayJoin, 2.2 * s, 3.4 * s, '#ff2a5f');
  drawAeroFoil(rig.rearWheel, rig.bb, 2.6 * s, 5.2 * s, '#1e293b');
  drawAeroFoil(rig.bb, rig.seatCluster, 5.8 * s, 4.4 * s, frameGrad);
  drawAeroFoil(rig.bb, rig.headBot, 6.8 * s, 5.4 * s, frameGrad);
  drawAeroFoil(rig.seatCluster, rig.headTop, 4.2 * s, 5.2 * s, frameGrad);
  drawAeroFoil(rig.headTop, rig.headBot, 5.8 * s, 5.8 * s, '#06b6d4');
  drawAeroFoil(rig.headBot, rig.frontWheel, 5.2 * s, 2.5 * s, '#25f4ee');

  if (!isPillar) {
    // HDR midday sun specular highlight along top tube & downtube + red bounce on BB
    ctx.strokeStyle = '#fffbeb';
    ctx.lineWidth = 2.2 * s;
    ctx.beginPath();
    ctx.moveTo(rig.seatCluster.x + 4 * s, rig.seatCluster.y - 3 * s);
    ctx.lineTo(rig.headTop.x - 4 * s, rig.headTop.y - 3 * s);
    ctx.moveTo(rig.headBot.x - 4 * s, rig.headBot.y + 2 * s);
    ctx.lineTo(rig.bb.x + 8 * s, rig.bb.y - 5 * s);
    ctx.stroke();

    ctx.strokeStyle = '#fb7185';
    ctx.lineWidth = 2.0 * s;
    ctx.beginPath();
    ctx.moveTo(rig.rearWheel.x + 6 * s, rig.rearWheel.y + 2 * s);
    ctx.lineTo(rig.bb.x, rig.bb.y + 5 * s);
    ctx.stroke();
  }

  // Aero crankset + one-piece integrated carbon cockpit & saddle
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = '#25f4ee';
  ctx.lineWidth = 2.2 * s;
  ctx.beginPath();
  ctx.arc(rig.bb.x, rig.bb.y, 13.5 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = isPillar ? rimTint : '#0f172a';
  ctx.lineWidth = (isPillar ? 3.5 : 5.2) * s;
  ctx.beginPath();
  ctx.moveTo(rig.seatCluster.x, rig.seatCluster.y);
  ctx.lineTo(rig.saddle.x, rig.saddle.y);
  ctx.moveTo(rig.headTop.x, rig.headTop.y);
  ctx.lineTo(rig.stemTop.x + 6 * s, rig.stemTop.y + 4 * s);
  ctx.lineTo(rig.handleGrip.x, rig.handleGrip.y + 2 * s);
  ctx.bezierCurveTo(
    rig.stemTop.x + 22 * s, rig.stemTop.y + 2 * s,
    rig.stemTop.x + 24 * s, rig.stemTop.y + 24 * s,
    rig.stemTop.x + 4 * s, rig.stemTop.y + 24 * s
  );
  ctx.stroke();

  ctx.strokeStyle = isPillar ? '#ff2a5f' : '#111827';
  ctx.lineWidth = 6.2 * s;
  ctx.beginPath();
  ctx.moveTo(rig.saddle.x - 15 * s, rig.saddle.y);
  ctx.lineTo(rig.saddle.x + 13 * s, rig.saddle.y + 1 * s);
  ctx.stroke();

  // 3. Impasto Sculpted Pelican Torso + Red-Track Warm Magenta Belly Bounce Light!
  ctx.beginPath();
  ctx.moveTo(rig.tailTip.x - 10 * s, rig.tailTip.y - 3 * s);
  ctx.lineTo(rig.tailTip.x + 8 * s, rig.tailTip.y - 13 * s);
  ctx.bezierCurveTo(
    rig.bodyCenter.x - 36 * s, rig.bodyCenter.y - 34 * s,
    rig.bodyCenter.x + 6 * s, rig.bodyCenter.y - 30 * s,
    rig.chest.x + 11 * s, rig.chest.y - 6 * s
  );
  ctx.bezierCurveTo(
    rig.bodyCenter.x + 38 * s, rig.bodyCenter.y + 24 * s,
    rig.bodyCenter.x + 8 * s, rig.bodyCenter.y + 32 * s,
    rig.hip.x - 12 * s, rig.hip.y + 15 * s
  );
  ctx.quadraticCurveTo(rig.bodyCenter.x - 46 * s, rig.bodyCenter.y + 15 * s, rig.tailTip.x - 10 * s, rig.tailTip.y - 3 * s);
  ctx.closePath();

  ctx.fillStyle = isPillar ? darkSil : impastoPat;
  ctx.fill();

  if (!isPillar) {
    ctx.save();
    ctx.clip();
    // Sunlit top pearl vs warm crimson-magenta greenway bounce light on lower belly!
    const bounceG = ctx.createLinearGradient(0, rig.bodyCenter.y - 34 * s, 0, rig.bodyCenter.y + 32 * s);
    bounceG.addColorStop(0.0, 'rgba(255, 253, 240, 0.72)');
    bounceG.addColorStop(0.56, 'rgba(224, 242, 254, 0.25)');
    bounceG.addColorStop(0.84, 'rgba(251, 113, 133, 0.48)');
    bounceG.addColorStop(1.0, 'rgba(225, 29, 72, 0.62)');
    ctx.fillStyle = bounceG;
    ctx.fillRect(rig.tailTip.x - 20 * s, rig.bodyCenter.y - 40 * s, 140 * s, 85 * s);

    // Pro Aero Cycling Jersey + #19 Race Dossard Bib
    ctx.fillStyle = '#ff2a5f';
    ctx.beginPath();
    ctx.moveTo(rig.bodyCenter.x - 18 * s, rig.bodyCenter.y - 34 * s);
    ctx.lineTo(rig.chest.x + 5 * s, rig.chest.y - 10 * s);
    ctx.lineTo(rig.bodyCenter.x + 9 * s, rig.bodyCenter.y + 30 * s);
    ctx.lineTo(rig.bodyCenter.x - 24 * s, rig.bodyCenter.y + 24 * s);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#25f4ee';
    ctx.fillRect(rig.bodyCenter.x - 23 * s, rig.bodyCenter.y - 34 * s, 5.5 * s, 64 * s);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(rig.bodyCenter.x - 36 * s, rig.bodyCenter.y - 15 * s, 18 * s, 13 * s);
    ctx.fillStyle = '#0f172a';
    ctx.font = `800 ${Math.max(8, Math.round(9.5 * s))}px "PelicanMono", sans-serif`;
    ctx.fillText('19', rig.bodyCenter.x - 34 * s, rig.bodyCenter.y - 5 * s);
    ctx.restore();
  }
  ctx.strokeStyle = isPillar ? rimTint : '#0f172a';
  ctx.lineWidth = (isPillar ? 2.4 : 2.8) * s;
  ctx.stroke();

  // 4. Variable-Width Anatomical Bezier S-Neck + Sculpted Skull (ZERO round tube / arc ball!)
  const nP0 = { x: rig.chest.x - 2 * s, y: rig.chest.y + 5 * s };
  const nP1 = rig.neckC1;
  const nP2 = rig.neckC2;
  const nP3 = { x: rig.head.x - 1 * s, y: rig.head.y + 2 * s };
  const nL = [];
  const nR = [];
  for (let i = 0; i <= 14; i++) {
    const u = i / 14;
    const mt = 1 - u;
    const x = mt * mt * mt * nP0.x + 3 * mt * mt * u * nP1.x + 3 * mt * u * u * nP2.x + u * u * u * nP3.x;
    const y = mt * mt * mt * nP0.y + 3 * mt * mt * u * nP1.y + 3 * mt * u * u * nP2.y + u * u * u * nP3.y;
    const dx = 3 * mt * mt * (nP1.x - nP0.x) + 6 * mt * u * (nP2.x - nP1.x) + 3 * u * u * (nP3.x - nP2.x);
    const dy = 3 * mt * mt * (nP1.y - nP0.y) + 6 * mt * u * (nP2.y - nP1.y) + 3 * u * u * (nP3.y - nP2.y);
    const l = Math.hypot(dx, dy) || 1;
    const hw = (lerp(13.2, 8.2, u) + Math.sin(u * Math.PI) * 1.4) * s;
    nL.push({ x: x + (-dy / l) * hw, y: y + (dx / l) * hw });
    nR.push({ x: x - (-dy / l) * hw, y: y - (dx / l) * hw });
  }

  ctx.beginPath();
  ctx.moveTo(nL[0].x, nL[0].y);
  for (let i = 1; i <= 14; i++) ctx.lineTo(nL[i].x, nL[i].y);
  for (let i = 14; i >= 0; i--) ctx.lineTo(nR[i].x, nR[i].y);
  ctx.closePath();
  ctx.fillStyle = isPillar ? darkSil : impastoPat;
  ctx.fill();
  if (!isPillar) {
    ctx.strokeStyle = '#fda4af';
    ctx.lineWidth = 3.2 * s;
    ctx.beginPath();
    for (let i = 0; i <= 10; i++) {
      if (i === 0) ctx.moveTo(nL[i].x + 1.5 * s, nL[i].y);
      else ctx.lineTo(nL[i].x + 1.5 * s, nL[i].y);
    }
    ctx.stroke();
    ctx.strokeStyle = '#fffef0';
    ctx.lineWidth = 2.8 * s;
    ctx.beginPath();
    for (let i = 2; i <= 14; i++) {
      if (i === 2) ctx.moveTo(nR[i].x - 1.5 * s, nR[i].y);
      else ctx.lineTo(nR[i].x - 1.5 * s, nR[i].y);
    }
    ctx.stroke();
  }
  ctx.strokeStyle = isPillar ? rimTint : '#0f172a';
  ctx.lineWidth = (isPillar ? 2.2 : 2.7) * s;
  ctx.stroke();

  // Sculpted Bezier Pelican Head + Wind-Whipped Crest Plumes (NO plain arc circle!)
  const hx = rig.head.x;
  const hy = rig.head.y;
  const hr = rig.head.r;
  ctx.beginPath();
  ctx.moveTo(hx - hr * 0.95, hy + hr * 0.45);
  ctx.lineTo(rig.crest2.x - 10 * s, rig.crest2.y + 1 * s);
  ctx.lineTo(hx - hr * 0.92, hy - hr * 0.25);
  ctx.lineTo(rig.crest1.x - 9 * s, rig.crest1.y - 4 * s);
  ctx.bezierCurveTo(hx - hr * 0.3, hy - hr * 1.25, hx + hr * 0.85, hy - hr * 1.05, hx + hr * 1.08, hy - hr * 0.22);
  ctx.bezierCurveTo(hx + hr * 1.05, hy + hr * 0.78, hx - hr * 0.2, hy + hr * 1.08, hx - hr * 0.95, hy + hr * 0.45);
  ctx.closePath();
  ctx.fillStyle = isPillar ? darkSil : '#ffffff';
  ctx.fill();
  ctx.stroke();

  //Impasto Gular Pouch + Hooked Beak with HDR top gold edge & red-lane warm underglow
  const pouchGrad = ctx.createLinearGradient(rig.beakUpperBase.x, rig.beakUpperBase.y, rig.pouchBelly.x, rig.pouchBelly.y);
  pouchGrad.addColorStop(0.0, '#fb923c');
  pouchGrad.addColorStop(0.55, '#ff2a5f');
  pouchGrad.addColorStop(1.0, '#fb7185');
  ctx.fillStyle = isPillar ? '#1f1224' : pouchGrad;
  ctx.beginPath();
  ctx.moveTo(rig.beakLowerBase.x, rig.beakLowerBase.y);
  ctx.quadraticCurveTo(rig.pouchBelly.x, rig.pouchBelly.y + 4 * s, rig.beakTip.x - 3 * s, rig.beakTip.y);
  ctx.lineTo(rig.beakUpperBase.x, rig.beakUpperBase.y + 5 * s);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  const beakGrad = ctx.createLinearGradient(rig.beakUpperBase.x, rig.beakUpperBase.y - 3 * s, rig.beakTip.x, rig.beakTip.y);
  beakGrad.addColorStop(0.0, '#fef9c3');
  beakGrad.addColorStop(0.5, '#fb923c');
  beakGrad.addColorStop(1.0, '#ef4444');
  ctx.fillStyle = isPillar ? darkSil : beakGrad;
  ctx.beginPath();
  ctx.moveTo(rig.beakUpperBase.x, rig.beakUpperBase.y - 1 * s);
  ctx.lineTo(rig.beakTip.x, rig.beakTip.y - 3.5 * s);
  ctx.quadraticCurveTo(rig.beakTip.x + 6 * s, rig.beakTip.y + 4.5 * s, rig.beakTip.x - 2 * s, rig.beakTip.y + 6 * s);
  ctx.lineTo(rig.beakLowerBase.x, rig.beakLowerBase.y + 1 * s);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Wrap-around iridescent cycling shield goggles with blazing HDR sun glare!
  const gx = hx + 3 * s;
  const gy = hy - 3 * s;
  ctx.strokeStyle = '#18181b';
  ctx.lineWidth = 3.8 * s;
  ctx.beginPath();
  ctx.moveTo(hx - 14 * s, gy + 1 * s);
  ctx.lineTo(gx - 4 * s, gy);
  ctx.stroke();

  const lensG = ctx.createLinearGradient(gx - 8 * s, gy - 7 * s, gx + 16 * s, gy + 6 * s);
  lensG.addColorStop(0.0, '#25f4ee');
  lensG.addColorStop(0.52, '#ff2a5f');
  lensG.addColorStop(1.0, '#fef08a');
  ctx.fillStyle = lensG;
  ctx.strokeStyle = isPillar ? '#25f4ee' : '#0f172a';
  ctx.lineWidth = 2.2 * s;
  ctx.beginPath();
  ctx.moveTo(gx - 6 * s, gy - 6.5 * s);
  ctx.lineTo(gx + 15.5 * s, gy - 5.5 * s);
  ctx.quadraticCurveTo(gx + 18 * s, gy + 1 * s, gx + 12 * s, gy + 5.5 * s);
  ctx.lineTo(gx + 3 * s, gy + 3 * s);
  ctx.lineTo(gx - 5 * s, gy + 5 * s);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  if (!isPillar) {
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.2 * s;
    ctx.beginPath();
    ctx.moveTo(gx + 1 * s, gy - 4.8 * s);
    ctx.lineTo(gx + 8.5 * s, gy + 3 * s);
    ctx.stroke();
  }

  drawImpastoLeg(rig.rightHip, rig.rightKnee, rig.rightFoot, rig.rightPedal, false);

  // Impasto Multi-Plume Wing with HDR sunlit top edge + dark primary feather tips
  ctx.beginPath();
  ctx.moveTo(rig.wingShoulder.x - 5 * s, rig.wingShoulder.y);
  ctx.quadraticCurveTo(rig.wingElbow.x - 16 * s, rig.wingElbow.y + 21 * s, rig.wingTip.x + 7 * s, rig.wingTip.y + 3 * s);
  ctx.quadraticCurveTo(rig.wingElbow.x + 14 * s, rig.wingElbow.y - 10 * s, rig.wingShoulder.x + 13 * s, rig.wingShoulder.y + 1 * s);
  ctx.closePath();
  ctx.fillStyle = isPillar ? darkSil : impastoPat;
  ctx.fill();

  if (!isPillar) {
    ctx.save();
    ctx.clip();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(rig.wingTip.x - 18 * s, rig.wingTip.y + 8 * s);
    ctx.lineTo(rig.wingTip.x + 8 * s, rig.wingTip.y + 3 * s);
    ctx.lineTo(rig.wingTip.x - 3 * s, rig.wingTip.y - 6 * s);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#fffef0';
    ctx.lineWidth = 3.2 * s;
    ctx.beginPath();
    ctx.moveTo(rig.wingShoulder.x - 4 * s, rig.wingShoulder.y - 1 * s);
    ctx.quadraticCurveTo(rig.wingElbow.x + 12 * s, rig.wingElbow.y - 8 * s, rig.wingTip.x + 4 * s, rig.wingTip.y + 1 * s);
    ctx.stroke();
    ctx.restore();
  }
  ctx.strokeStyle = isPillar ? rimTint : '#0f172a';
  ctx.lineWidth = (isPillar ? 2.2 : 2.6) * s;
  ctx.stroke();

  ctx.restore();
}

/**
 * Draws RGB Chromatic-Aberration Bezel Tear & Neon Portal Slash at `x = 219` and `x = 781`!
 */
function drawChromaticBezelBreak(ctx, rig, localT) {
  if (!rig) return;
  for (const [edgeX, dirSign, mainCol, subCol] of [
    [VX, 1, '#25f4ee', '#ff2a5f'],
    [VR, 1, '#ff2a5f', '#25f4ee'],
  ]) {
    const dist = Math.abs(rig.root.x - edgeX);
    if (dist > 152) continue;
    const strength = Math.pow(1 - dist / 152, 1.45);
    const cy = 576;

    ctx.save();
    // Horizontal RGB glitch tear bars splitting cyan (-6px) and crimson (+6px) across the bezel!
    for (let g = 0; g < 9; g++) {
      const gy = cy - 135 + g * 31 + Math.sin(localT * 35 + g * 2.1) * 5;
      const gw = (18 + (g % 3) * 16) * strength;
      ctx.globalAlpha = strength * 0.78;
      ctx.fillStyle = '#25f4ee';
      ctx.fillRect(edgeX - gw - 5, gy, gw * 1.4, 3.2);
      ctx.fillStyle = '#ff2a5f';
      ctx.fillRect(edgeX - gw * 0.4 + 5, gy + 2, gw * 1.4, 3.2);
    }

    const seamGlow = ctx.createLinearGradient(edgeX, cy - 175, edgeX, cy + 140);
    seamGlow.addColorStop(0.0, 'rgba(37, 244, 238, 0)');
    seamGlow.addColorStop(0.35, mainCol);
    seamGlow.addColorStop(0.7, subCol);
    seamGlow.addColorStop(1.0, 'rgba(255, 42, 95, 0)');

    ctx.globalAlpha = strength * 0.95;
    ctx.strokeStyle = seamGlow;
    ctx.shadowColor = mainCol;
    ctx.shadowBlur = 20;
    ctx.lineWidth = 4.2 * strength + 1.5;
    ctx.beginPath();
    ctx.moveTo(edgeX, cy - 170);
    ctx.lineTo(edgeX, cy + 135);
    ctx.stroke();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(edgeX, cy - 110);
    ctx.lineTo(edgeX, cy + 105);
    ctx.stroke();
    ctx.restore();
  }
}

function pathHeart(ctx, cx, cy, r) {
  ctx.beginPath();
  ctx.moveTo(cx, cy + r * 0.88);
  ctx.bezierCurveTo(cx - r * 1.28, cy + r * 0.12, cx - r * 1.18, cy - r * 0.92, cx - r * 0.48, cy - r * 0.92);
  ctx.bezierCurveTo(cx - r * 0.12, cy - r * 0.92, cx, cy - r * 0.56, cx, cy - r * 0.42);
  ctx.bezierCurveTo(cx, cy - r * 0.56, cx + r * 0.12, cy - r * 0.92, cx + r * 0.48, cy - r * 0.92);
  ctx.bezierCurveTo(cx + r * 1.18, cy - r * 0.92, cx + r * 1.28, cy + r * 0.12, cx, cy + r * 0.88);
  ctx.closePath();
}

/**
 * Draws Native Fictional Short-Video UI + Camera Yellow Autofocus `[ + ]` Lock-On +
 * Relocated Live Comment Stream (`y=700..796`) & Top Floating Danmaku (`y=114..172`).
 */
function drawShortVideoUI(ctx, rig, localT, isOutroThumbnail) {
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
  ctx.lineWidth = 2.2;
  ctx.strokeRect(VX + 1, 1, VW - 2, PANEL_SIZE - 2);

  ctx.beginPath();
  ctx.rect(VX, 0, VW, PANEL_SIZE);
  ctx.clip();

  // Top & Bottom readability scrims
  const topScrim = ctx.createLinearGradient(0, 0, 0, 148);
  topScrim.addColorStop(0.0, 'rgba(5, 8, 16, 0.72)');
  topScrim.addColorStop(1.0, 'rgba(5, 8, 16, 0)');
  ctx.fillStyle = topScrim;
  ctx.fillRect(VX, 0, VW, 148);

  const botScrim = ctx.createLinearGradient(0, 692, 0, PANEL_SIZE);
  botScrim.addColorStop(0.0, 'rgba(5, 8, 16, 0.18)');
  botScrim.addColorStop(0.32, 'rgba(5, 8, 16, 0.76)');
  botScrim.addColorStop(1.0, 'rgba(4, 6, 12, 0.96)');
  ctx.fillStyle = botScrim;
  ctx.fillRect(VX, 692, VW, PANEL_SIZE - 692);

  // 1. Top Status Bar & Feed Tabs: 「关注 | 同城 | 推荐」
  ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
  ctx.font = '700 13.5px "PelicanMono", sans-serif';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillText('12:00  5G', VX + 18, 19);

  for (let b = 0; b < 4; b++) {
    ctx.fillRect(VR - 76 + b * 5, 23 - (b + 1) * 2.4, 3.2, (b + 1) * 2.4);
  }
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.88)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(VR - 48, 13, 25, 11.5);
  ctx.fillStyle = '#4ade80';
  ctx.fillRect(VR - 46, 15, 20, 7.5);

  const midX = VX + VW / 2;
  ctx.textAlign = 'center';
  ctx.font = '600 19px "PelicanSans", sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
  ctx.fillText('关注', midX - 80, 45);
  ctx.fillText('同城', midX, 45);
  ctx.font = '700 21px "PelicanSans", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('推荐', midX + 80, 45);
  ctx.beginPath();
  ctx.roundRect(midX + 63, 58, 34, 3.4, 2);
  ctx.fill();

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(VR - 32, 45, 8, 0, Math.PI * 2);
  ctx.moveTo(VR - 26, 51);
  ctx.lineTo(VR - 20, 57);
  ctx.stroke();

  // 2. Native Short-Video Hot-Search Topic Pill (replaces clumsy drawEraTitleCard box!)
  if (!isOutroThumbnail) {
    const pillX = VX + 16;
    const pillY = 68;
    const pillW = 392;
    const pillH = 28;
    ctx.fillStyle = 'rgba(10, 14, 26, 0.62)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, pillH, 14);
    ctx.fill();
    ctx.stroke();

    // Custom vector flame icon (zero system emoji dependency!)
    const fx = pillX + 17;
    const fy = pillY + 14;
    ctx.fillStyle = '#ff2a5f';
    ctx.beginPath();
    ctx.moveTo(fx, fy - 8);
    ctx.quadraticCurveTo(fx + 8, fy - 2, fx + 5, fy + 6);
    ctx.quadraticCurveTo(fx, fy + 9, fx - 5, fy + 6);
    ctx.quadraticCurveTo(fx - 8, fy - 1, fx - 2, fy - 4);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(fx, fy + 3, 2.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffd166';
    ctx.font = '700 13.5px "PelicanSans", sans-serif';
    ctx.fillText('热搜 TOP 19', pillX + 30, pillY + 14.5);
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillText('|', pillX + 114, pillY + 14.5);
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 14px "PelicanSans", sans-serif';
    ctx.fillText('竖屏短视频 · 2020s · 9:16 Feed >', pillX + 126, pillY + 14.5);

    // Light stroke-outlined horizontal floating danmaku in upper sky (y=114..174)
    ctx.font = '700 15px "PelicanSans", sans-serif';
    for (const dm of TOP_DANMAKU) {
      const span = VW + 340;
      const dx = VR + 40 - (((localT * dm.speed + dm.offset) % span));
      ctx.save();
      ctx.globalAlpha = 0.86;
      ctx.strokeStyle = 'rgba(8, 12, 24, 0.82)';
      ctx.lineWidth = 3.2;
      ctx.strokeText(dm.text, dx, dm.y);
      ctx.fillStyle = dm.col;
      ctx.fillText(dm.text, dx, dm.y);
      ctx.restore();
    }
  }

  // 3. Bar-2 Smartphone Yellow Camera Autofocus `[ + ]` Lock-On (`localT = 1.42..2.25s`)!
  if (!isOutroThumbnail && rig && localT >= 1.42 && localT <= 2.32 && rig.head.x > VX + 40 && rig.head.x < VR - 40) {
    const dt = localT - 1.42;
    // Hunt -> snap lock at dt = 0.36s (`localT = 1.78s`), pulse gold, fade cleanly into heart burst!
    const huntScale = dt < 0.22 ? lerp(1.42, 0.94, dt / 0.22) : dt < 0.36 ? lerp(0.94, 1.0, (dt - 0.22) / 0.14) : 1.0;
    const locked = dt >= 0.34;
    const fadeOut = smoothstep(2.32, 2.02, localT);
    const afX = clamp(rig.head.x + 12, VX + 64, VR - 92);
    const afY = rig.head.y - 2;
    const boxR = 38 * huntScale;

    ctx.save();
    ctx.globalAlpha = fadeOut * (locked ? 0.98 : 0.82);
    ctx.strokeStyle = locked ? '#facc15' : 'rgba(254, 240, 138, 0.92)';
    ctx.lineWidth = locked ? 2.4 : 1.8;
    if (locked) {
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 10;
    }

    // 4 smartphone camera corner brackets + center focus ticks
    const cLen = 11;
    ctx.beginPath();
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        ctx.moveTo(afX + sx * boxR, afY + sy * (boxR - cLen));
        ctx.lineTo(afX + sx * boxR, afY + sy * boxR);
        ctx.lineTo(afX + sx * (boxR - cLen), afY + sy * boxR);
      }
      ctx.moveTo(afX + sx * boxR, afY);
      ctx.lineTo(afX + sx * (boxR - 5), afY);
      ctx.moveTo(afX, afY + sx * boxR);
      ctx.lineTo(afX, afY + sx * (boxR - 5));
    }
    ctx.stroke();

    // Right-side smartphone sun exposure slider (`☀` + vertical line)
    const expX = afX + boxR + 15;
    ctx.shadowBlur = 0;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(expX, afY - 28);
    ctx.lineTo(expX, afY - 8);
    ctx.moveTo(expX, afY + 8);
    ctx.lineTo(expX, afY + 28);
    ctx.arc(expX, afY, 4.2, 0, Math.PI * 2);
    ctx.stroke();
    for (let r = 0; r < 8; r++) {
      const ra = (r * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(expX + Math.cos(ra) * 6, afY + Math.sin(ra) * 6);
      ctx.lineTo(expX + Math.cos(ra) * 8.5, afY + Math.sin(ra) * 8.5);
      ctx.stroke();
    }

    if (locked) {
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.roundRect(afX - 31, afY - boxR - 20, 62, 15, 4);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.font = '700 9.5px "PelicanMono", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('AE/AF 锁定', afX, afY - boxR - 12);
    }
    ctx.restore();
  }

  // 4. Bar-2 Double-Tap Finger Ripples + Giant Tilted Translucent Bursting Hearts (`1.95..4.25s`)!
  if (!isOutroThumbnail && localT >= 1.95 && localT <= 4.25) {
    const doubleTapBursts = [
      { t0: 1.98, x: 525, y: 345, rot: -0.24, r: 46, c1: '#ff2a5f', c2: '#ff8fab' },
      { t0: 2.34, x: 598, y: 282, rot: 0.22, r: 40, c1: '#25f4ee', c2: '#ff2a5f' },
      { t0: 2.62, x: 488, y: 298, rot: -0.18, r: 52, c1: '#ff1e56', c2: '#ffd166' },
      { t0: 2.96, x: 572, y: 338, rot: 0.25, r: 46, c1: '#ff2a5f', c2: '#25f4ee' },
      { t0: 3.35, x: 515, y: 268, rot: -0.20, r: 42, c1: '#ff4d6d', c2: '#f472b6' },
    ];
    for (const b of doubleTapBursts) {
      const dt = localT - b.t0;
      if (dt < 0 || dt > 0.88) continue;
      const u = dt / 0.88;
      const popScale = u < 0.22 ? lerp(0.32, 1.18, u / 0.22) : lerp(1.18, 1.38, (u - 0.22) / 0.78);
      const alpha = (1 - Math.pow(u, 1.65)) * 0.90;

      ctx.save();
      // Capacitive finger touch double-ring at tap origin
      if (u < 0.45) {
        const tu = u / 0.45;
        ctx.strokeStyle = `rgba(255, 255, 255, ${((1 - tu) * 0.75).toFixed(2)})`;
        ctx.lineWidth = 2.4 * (1 - tu);
        ctx.beginPath();
        ctx.arc(b.x, b.y + 12, 14 + tu * 44, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.translate(b.x, b.y - u * 46);
      ctx.rotate(b.rot);
      ctx.scale(popScale, popScale);
      ctx.globalAlpha = alpha;
      ctx.shadowColor = b.c1;
      ctx.shadowBlur = 18;
      const bigHG = ctx.createLinearGradient(-b.r, -b.r, b.r, b.r);
      bigHG.addColorStop(0, b.c1);
      bigHG.addColorStop(1, b.c2);
      ctx.fillStyle = bigHG;
      pathHeart(ctx, 0, 0, b.r);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.80)';
      ctx.lineWidth = 2.0;
      ctx.stroke();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.48)';
      ctx.beginPath();
      ctx.ellipse(-b.r * 0.36, -b.r * 0.36, b.r * 0.20, b.r * 0.11, -0.55, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // 5. Compact Right Interaction Column (`y = 202..440` + `y = 782..878`, ZERO overlap with Pelican!)
  const railX = VR - 40;
  const avY = 202;
  ctx.fillStyle = '#25f4ee';
  ctx.beginPath();
  ctx.arc(railX, avY, 21.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(railX, avY, 19, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(railX - 2.5, avY + 2.5, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fb923c';
  ctx.beginPath();
  ctx.moveTo(railX + 3, avY - 1);
  ctx.lineTo(railX + 15.5, avY + 2.5);
  ctx.lineTo(railX + 3, avY + 7);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.arc(railX, avY, 20.5, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = '#ff2a5f';
  ctx.beginPath();
  ctx.arc(railX, avY + 20.5, 8.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(railX - 4, avY + 20.5);
  ctx.lineTo(railX + 4, avY + 20.5);
  ctx.moveTo(railX, avY + 16.5);
  ctx.lineTo(railX, avY + 24.5);
  ctx.stroke();

  const heartY = 274;
  const beatPhase = (localT / BEAT_SEC) % 1;
  const isViralBurst = localT >= 2.0;
  const heartScale = 1.0 + Math.exp(-beatPhase * 6.5) * 0.16 + (isViralBurst ? Math.exp(-Math.max(0, localT - 2.0) * 3.2) * 0.42 : 0);

  if (isViralBurst) {
    const bt = localT - 2.0;
    const pColors = ['#ff2a5f', '#25f4ee', '#ff7eb3', '#ffd166', '#f43f5e'];
    for (let p = 0; p < 30; p++) {
      const waveOffset = (p % 6) * 0.22;
      if (bt < waveOffset) continue;
      const pu = ((bt - waveOffset) * 0.72 + p * 0.13) % 1;
      const hx = railX - 6 + Math.sin(pu * 6.5 + p * 1.7) * (16 + (p % 4) * 8) - pu * 24;
      const hy = heartY + 6 - pu * 188;
      ctx.save();
      ctx.globalAlpha = clamp(Math.sin(Math.PI * pu) * 1.2, 0, 0.92);
      ctx.fillStyle = pColors[p % pColors.length];
      pathHeart(ctx, hx, hy, (5.0 + (p % 3) * 2.6) * (1 - pu * 0.25));
      ctx.fill();
      ctx.restore();
    }
  }

  ctx.save();
  ctx.translate(railX, heartY);
  ctx.scale(heartScale, heartScale);
  ctx.fillStyle = '#ff2a5f';
  pathHeart(ctx, 0, 0, 17.5);
  ctx.fill();
  ctx.restore();

  const likeLabel = localT < 1.5 ? '9.8w' : localT < 2.0 ? '9.9w' : '10.0w+';
  ctx.textAlign = 'center';
  if (localT >= 2.0) {
    ctx.fillStyle = 'rgba(255, 42, 95, 0.92)';
    ctx.beginPath();
    ctx.roundRect(railX - 31, heartY + 20, 62, 19, 9.5);
    ctx.fill();
  }
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 13px "PelicanMono", sans-serif';
  ctx.fillText(likeLabel, railX, heartY + 29.5);

  const comY = 348;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.beginPath();
  ctx.arc(railX, comY, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#0f172a';
  for (let d = -1; d <= 1; d++) {
    ctx.beginPath();
    ctx.arc(railX + d * 5, comY, 2.0, 0, Math.PI * 2);
    ctx.fill();
  }
  const commentNum = localT < 2.0 ? '8,421' : `8,${421 + Math.min(578, Math.floor((localT - 2.0) * 145))}`;
  ctx.fillStyle = '#ffffff';
  ctx.fillText(commentNum, railX, comY + 26);

  const starY = 414;
  ctx.fillStyle = localT >= 2.5 ? '#ffd166' : 'rgba(255, 255, 255, 0.95)';
  ctx.beginPath();
  for (let k = 0; k < 10; k++) {
    const r = k % 2 === 0 ? 16 : 7.2;
    const a = -Math.PI / 2 + (k * Math.PI) / 5;
    if (k === 0) ctx.moveTo(railX + Math.cos(a) * r, starY + Math.sin(a) * r);
    else ctx.lineTo(railX + Math.cos(a) * r, starY + Math.sin(a) * r);
  }
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.fillText('3.6w', railX, starY + 25);

  // Share arrow (`y = 782`) + Spinning Vinyl (`y = 878`)
  const shY = 782;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
  ctx.beginPath();
  ctx.moveTo(railX + 15, shY - 2);
  ctx.lineTo(railX + 2, shY - 12);
  ctx.lineTo(railX + 2, shY - 5);
  ctx.quadraticCurveTo(railX - 13, shY - 4, railX - 15, shY + 10);
  ctx.quadraticCurveTo(railX - 8, shY + 2, railX + 2, shY + 3);
  ctx.lineTo(railX + 2, shY + 9);
  ctx.closePath();
  ctx.fill();
  ctx.fillText('6.1w', railX, shY + 24);

  const vinY = 878;
  ctx.save();
  ctx.translate(railX, vinY);
  ctx.rotate(localT * 3.4);
  ctx.fillStyle = '#11131a';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#ff2a5f';
  ctx.beginPath();
  ctx.arc(0, 0, 9.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#050508';
  ctx.beginPath();
  ctx.arc(0, 0, 2.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 6. Relocated Bottom-Left Translucent Live Comment Stream (`y = 696..804` — #85 Director Spec!)
  const capX = VX + 18;
  if (!isOutroThumbnail) {
    const laneH = 30;
    const cyc = LIVE_COMMENTS.length * laneH;
    ctx.save();
    ctx.beginPath();
    ctx.rect(capX, 696, 395, 108);
    ctx.clip();
    for (let i = 0; i < LIVE_COMMENTS.length; i++) {
      const item = LIVE_COMMENTS[i];
      const ry = 798 - (((localT * 38 + i * laneH) % cyc));
      const a = smoothstep(696, 720, ry) * smoothstep(806, 784, ry);
      if (a <= 0.03) continue;

      ctx.save();
      ctx.globalAlpha = a * 0.94;
      ctx.font = '600 13px "PelicanSans", sans-serif';
      const uW = ctx.measureText(item.user + '：').width;
      const tW = ctx.measureText(item.text).width;
      ctx.fillStyle = 'rgba(10, 14, 24, 0.56)';
      ctx.beginPath();
      ctx.roundRect(capX, ry - 12, Math.min(388, uW + tW + 22), 25, 12.5);
      ctx.fill();

      ctx.textAlign = 'left';
      ctx.fillStyle = item.color;
      ctx.fillText(item.user + '：', capX + 11, ry + 1);
      ctx.fillStyle = '#f8fafc';
      ctx.fillText(item.text, capX + 11 + uW, ry + 1);
      ctx.restore();
    }
    ctx.restore();
  }

  // 7. Bottom-Left Author Handle, Native #19 Hashtags & Viral Caption (`y = 816..960`)
  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.14)';
  ctx.beginPath();
  ctx.roundRect(capX, 814, 222, 23, 6);
  ctx.fill();
  ctx.fillStyle = '#25f4ee';
  ctx.beginPath();
  ctx.arc(capX + 12, 825.5, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e2e8f0';
  ctx.font = '600 12.5px "PelicanSans", sans-serif';
  ctx.fillText('滨海绿道测速段 · 120BPM跟拍', capX + 22, 826);

  ctx.fillStyle = '#ffffff';
  ctx.font = '700 20px "PelicanSans", sans-serif';
  ctx.fillText('@硬核野生鹈鹕', capX, 858);
  const vxBadge = capX + ctx.measureText('@硬核野生鹈鹕').width + 14;
  ctx.fillStyle = '#25f4ee';
  ctx.beginPath();
  ctx.arc(vxBadge, 857, 8.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(vxBadge - 3.5, 857);
  ctx.lineTo(vxBadge - 1, 860);
  ctx.lineTo(vxBadge + 4, 853.5);
  ctx.stroke();

  ctx.fillStyle = '#25f4ee';
  ctx.font = '700 15px "PelicanSans", sans-serif';
  ctx.fillText('#19竖屏短视频  #2020s  #人类迷惑行为大赏  #日行千里', capX, 890);

  ctx.fillStyle = 'rgba(248, 250, 252, 0.95)';
  ctx.font = '500 15px "PelicanSans", sans-serif';
  ctx.fillText('谁懂啊家人们早上出门看见一只鹈鹕在飙车', capX, 920);

  ctx.fillStyle = 'rgba(203, 213, 225, 0.76)';
  ctx.font = '500 13px "PelicanSans", sans-serif';
  ctx.fillText('原声 — 硬核野生鹈鹕 · 滨海破风实录 120BPM', capX, 952);

  // 8. Bottom Playback Progress Bar (`localT / 6.0` -> 100% completion flare at frame exit!)
  const prog = clamp(localT / 6.0, 0, 1);
  const barX = VX + 2;
  const barW = VW - 4;
  const barY = PANEL_SIZE - 10;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.24)';
  ctx.fillRect(barX, barY, barW, 5);

  const progGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
  progGrad.addColorStop(0.0, '#25f4ee');
  progGrad.addColorStop(0.65, '#ff2a5f');
  progGrad.addColorStop(1.0, '#ffd166');
  ctx.fillStyle = progGrad;
  ctx.fillRect(barX, barY, barW * prog, 5);

  const headX = barX + barW * prog;
  const finishFlare = smoothstep(0.94, 1.0, prog);
  ctx.save();
  ctx.shadowColor = finishFlare > 0 ? '#ffd166' : '#ffffff';
  ctx.shadowBlur = 10 + finishFlare * 14;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(headX, barY + 2.5, 5.5 + finishFlare * 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.restore();
}

export function render(kit, slot, scene, params) {
  const {
    t,
    localT = 0,
    pelicanLocalX = 500,
    pedalAngle = 0,
    speedScale = 1,
    isOutroThumbnail = false,
  } = params;
  const rawLocalT = isOutroThumbnail
    ? localT
    : (params.rawLocalT ?? (t !== undefined ? t - scene.t0 : localT));

  const g = slot.g2d;
  const ctx = g.drawingContext;
  ctx.save();
  ctx.clearRect(0, 0, PANEL_SIZE, PANEL_SIZE);

  const drawX = mapGimbalX(pelicanLocalX, isOutroThumbnail);
  const visiblePelican = pelicanLocalX > -240 && pelicanLocalX < PANEL_SIZE + 240;
  const rig = visiblePelican
    ? computePelicanRig({
        x: drawX,
        y: ROAD_EDGE_Y,
        pedalAngle,
        wheelAngle: (pelicanLocalX / 46) * 1.15,
        scale: 1.0,
        slope: 0,
        speedScale,
        time: isOutroThumbnail ? localT : (t ?? localT),
      })
    : null;

  // 1. 1D-Shutter-Blurred Action-Cam Coastal Feed + 24mm CMOS Optics
  drawCoastalActionCamFeed(kit, ctx, localT, rawLocalT, rig, isOutroThumbnail);

  // 2. Dual-Zone Spatial Masking Pelican + Aero Bike
  if (rig) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(VX, 0, VW, PANEL_SIZE);
    ctx.clip();
    drawStreetImpastoPelican(kit, ctx, rig, localT, 'full', 1.0);
    ctx.restore();

    if (drawX - 145 < VX || drawX + 145 > VR) {
      const edgeFrameRecover = Math.max(
        1 - smoothstep(118, 178, drawX),
        smoothstep(822, 882, drawX)
      );
      const pillarAlpha = lerp(0.28, 0.92, edgeFrameRecover);
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, VX, PANEL_SIZE);
      ctx.rect(VR, 0, PANEL_SIZE - VR, PANEL_SIZE);
      ctx.clip();
      drawStreetImpastoPelican(kit, ctx, rig, localT, 'pillarbox', pillarAlpha);
      ctx.restore();
    }
  }

  // 3. Native Short-Video UI, Camera Yellow Autofocus `[ + ]` & Relocated Comments
  drawShortVideoUI(ctx, rig, localT, isOutroThumbnail);

  // 4. RGB Chromatic Bezel Tear right on x=219 and x=781
  if (rig && !isOutroThumbnail) {
    drawChromaticBezelBreak(ctx, rig, localT);
  }

  // 5. Preserve Outro Exhibition Wall Thumbnail Label (NO top-left EraTitleCard in main scroll!)
  if (isOutroThumbnail) {
    ctx.fillStyle = 'rgba(10, 10, 16, 0.82)';
    ctx.fillRect(0, PANEL_SIZE - 96, PANEL_SIZE, 96);
    ctx.fillStyle = '#f8fafc';
    ctx.font = '700 48px "PelicanSerif", serif';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.fillText(`${String(scene.num).padStart(2, '0')} ${scene.zh}`, 36, PANEL_SIZE - 48);
  }

  ctx.restore();
}
