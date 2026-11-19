// src/fusion/era_enhancements.js
// Deterministic Fine-Art Lighting, Micro-Detail & Atmospheric Fusion Layer
// Applied inside each 1000x1000 era panel (`slot.g2d`) BEFORE museum framing,
// plus archival da Vinci upgrades for Intro and press-flash optics for Outro.

import { makePRNG, hashSeed } from './github_core/kit/kit.js';

const TAU = Math.PI * 2;
const lerp = (a, b, u) => a + (b - a) * u;

const CODEX_ID_BY_GITHUB_ID = {
  s01_sahara: 'sahara',
  s02_egypt: 'egypt',
  s03_han: 'han',
  s04_tang: 'tang',
  s05_song: 'song',
  s06_qingming: 'qingming',
  s07_maya: 'maya',
  s08_mughal: 'mughal',
  s09_bada: 'bada',
  s10_wayang: 'wayang',
  s11_ukiyoe: 'ukiyoe',
  s12_starry: 'starry',
  s13_scream: 'scream',
  s14_nosferatu: 'nosferatu',
  s15_oscilloscope: 'scope',
  s16_8bit: 'pixel',
  s17_chat: 'chat',
  s18_vaporwave: 'vapor',
  s19_shortvideo: 'shorts',
  s20_code: 'code',
};

export function getCodexSceneId(githubSceneId) {
  return CODEX_ID_BY_GITHUB_ID[githubSceneId] || githubSceneId;
}

function drawVolumetricCone(ctx, ox, oy, baseAngle, spread, length, rays, colorRgb, maxAlpha, t) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < rays; i++) {
    const u = rays === 1 ? 0.5 : i / (rays - 1);
    const a = baseAngle + (u - 0.5) * spread + Math.sin(t * 0.65 + i * 1.9) * 0.012;
    const w0 = 14 + (i % 3) * 8;
    const w1 = 68 + (i % 4) * 26;
    const c = Math.cos(a);
    const s = Math.sin(a);
    const nx = -s;
    const ny = c;

    const grad = ctx.createLinearGradient(ox, oy, ox + c * length, oy + s * length);
    const aPeak = maxAlpha * (0.68 + 0.32 * Math.sin(t * 1.15 + i * 2.3));
    grad.addColorStop(0, `rgba(${colorRgb}, ${(aPeak * 1.15).toFixed(3)})`);
    grad.addColorStop(0.45, `rgba(${colorRgb}, ${(aPeak * 0.55).toFixed(3)})`);
    grad.addColorStop(1, `rgba(${colorRgb}, 0)`);

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(ox - nx * w0, oy - ny * w0);
    ctx.lineTo(ox + nx * w0, oy + ny * w0);
    ctx.lineTo(ox + c * length + nx * w1, oy + s * length + ny * w1);
    ctx.lineTo(ox + c * length - nx * w1, oy + s * length - ny * w1);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawFourPointGlint(ctx, x, y, r, color = '#fff6d6', alpha = 0.85) {
  if (alpha <= 0.02 || r <= 0.4) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = Math.min(1, alpha);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, -r);
  ctx.quadraticCurveTo(r * 0.14, -r * 0.14, r, 0);
  ctx.quadraticCurveTo(r * 0.14, r * 0.14, 0, r);
  ctx.quadraticCurveTo(-r * 0.14, r * 0.14, -r, 0);
  ctx.quadraticCurveTo(-r * 0.14, -r * 0.14, 0, -r);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function getSaharaPetroglyphOverlay(kit) {
  return kit.bake2D('fusion_sahara_lower_petroglyphs_v1', (_g, ctx, rng) => {
    ctx.clearRect(0, 0, 1000, 1000);
    // Stratified sandstone crevices & flint-pecked Neolithic petroglyphs on lower cliff (y = 730..975)
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Subtle horizontal rock strata ledges
    for (let i = 0; i < 9; i++) {
      const y0 = 724 + i * 28 + rng() * 10;
      ctx.strokeStyle = i % 2 === 0 ? 'rgba(32, 16, 8, 0.34)' : 'rgba(228, 178, 118, 0.11)';
      ctx.lineWidth = 1.4 + rng() * 1.6;
      ctx.beginPath();
      ctx.moveTo(0, y0);
      for (let x = 40; x <= 1000; x += 40) {
        ctx.lineTo(x, y0 + Math.sin(x * 0.015 + i * 1.7) * 5 + (rng() - 0.5) * 3);
      }
      ctx.stroke();
    }

    // Incised solar spirals & archaic hunter-antelope petroglyphs
    const spirals = [
      [148, 818, 28],
      [836, 808, 31],
      [284, 888, 21],
      [716, 896, 23],
    ];
    for (const [sx, sy, maxR] of spirals) {
      for (let pass = 0; pass < 2; pass++) {
        ctx.strokeStyle = pass === 0 ? 'rgba(42, 20, 10, 0.55)' : 'rgba(236, 194, 134, 0.34)';
        ctx.lineWidth = pass === 0 ? 3.2 : 1.5;
        ctx.beginPath();
        for (let a = 0; a < TAU * 2.75; a += 0.2) {
          const r = (a / (TAU * 2.75)) * maxR;
          const px = sx + Math.cos(a) * r + (pass ? -0.8 : 0.8);
          const py = sy + Math.sin(a) * r + (pass ? -0.8 : 0.8);
          if (a === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
    }

    // Pecked running gazelles & desert hunters flanking the central hearth
    const gazelles = [
      [215, 838, 1],
      [345, 845, 0.88],
      [645, 842, -0.92],
      [775, 872, -0.85],
    ];
    for (const [gx, gy, dir] of gazelles) {
      ctx.save();
      ctx.translate(gx, gy);
      ctx.scale(dir, Math.abs(dir));
      ctx.strokeStyle = 'rgba(234, 190, 128, 0.36)';
      ctx.lineWidth = 2.1;
      ctx.beginPath();
      // Body & leaping legs
      ctx.moveTo(-20, 0);
      ctx.quadraticCurveTo(0, -8, 18, -2);
      ctx.moveTo(-14, 0);
      ctx.lineTo(-26, 16);
      ctx.moveTo(12, -2);
      ctx.lineTo(26, 13);
      // Neck & swept horns
      ctx.moveTo(16, -3);
      ctx.lineTo(24, -18);
      ctx.quadraticCurveTo(10, -32, -2, -26);
      ctx.moveTo(22, -16);
      ctx.quadraticCurveTo(12, -27, 3, -22);
      ctx.stroke();
      ctx.restore();
    }
  });
}

/**
 * Applies rich, deterministic era-specific atmosphere, lighting, and fine-art micro-details
 * directly onto `slot.g2d.drawingContext` (1000x1000).
 */
export function enhanceEraPanel(kit, slot, scene, params, sync) {
  if (!slot?.g2d) return;
  const ctx = slot.g2d.drawingContext;
  const t = params?.t ?? 0;
  const localT = params?.localT ?? 3.0;
  const rx = params?.pelicanLocalX ?? 500;
  const beatPulse = sync?.beatPulse ?? 0;
  const anvil = sync?.anvilShock ?? 0;
  const rng = makePRNG(hashSeed(`era_enhance_${scene.id}`));

  ctx.save();

  switch (scene.id) {
    case 's01_sahara': {
      // 1. Baked Neolithic petroglyph carvings & sandstone ledges on lower wall
      const petro = getSaharaPetroglyphOverlay(kit);
      ctx.drawImage(petro.canvas, 0, 0);

      // 2. Flickering prehistoric cave bonfire at (492, 932) + dancing warm radial firelight
      const flicker = 0.86 + 0.14 * Math.sin(t * 13.5) * Math.cos(t * 7.9) + anvil * 0.18;
      const hx = 492;
      const hy = 936;

      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const fireGlow = ctx.createRadialGradient(hx, hy - 26, 14, hx, hy - 90, 460);
      fireGlow.addColorStop(0, `rgba(255, 176, 74, ${(0.42 * flicker).toFixed(3)})`);
      fireGlow.addColorStop(0.38, `rgba(226, 98, 32, ${(0.20 * flicker).toFixed(3)})`);
      fireGlow.addColorStop(0.75, `rgba(164, 54, 16, ${(0.07 * flicker).toFixed(3)})`);
      fireGlow.addColorStop(1, 'rgba(120, 34, 8, 0)');
      ctx.fillStyle = fireGlow;
      ctx.fillRect(0, 420, 1000, 580);
      ctx.restore();

      // Charred hearth stones & glowing embers
      for (let s = -3; s <= 3; s++) {
        ctx.fillStyle = s % 2 === 0 ? '#2b160c' : '#3d2012';
        ctx.beginPath();
        ctx.ellipse(hx + s * 15, hy + Math.abs(s) * 1.5, 11, 6.5, s * 0.12, 0, TAU);
        ctx.fill();
      }
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      for (let f = 0; f < 6; f++) {
        const off = (f - 2.5) * 11;
        const sway = Math.sin(t * 10.5 + f * 1.7) * 9;
        const fh = (42 + (f % 3) * 16) * flicker;
        const fg = ctx.createLinearGradient(hx + off, hy, hx + off + sway, hy - fh);
        fg.addColorStop(0, 'rgba(255, 232, 148, 0.88)');
        fg.addColorStop(0.5, 'rgba(245, 122, 34, 0.72)');
        fg.addColorStop(1, 'rgba(180, 38, 12, 0)');
        ctx.fillStyle = fg;
        ctx.beginPath();
        ctx.moveTo(hx + off - 12, hy - 2);
        ctx.quadraticCurveTo(hx + off + sway * 0.4, hy - fh * 0.55, hx + off + sway, hy - fh);
        ctx.quadraticCurveTo(hx + off + 12, hy - fh * 0.45, hx + off + 11, hy - 2);
        ctx.closePath();
        ctx.fill();
      }
      // Rising cave ember sparks
      for (let e = 0; e < 22; e++) {
        const ph = (t * (0.42 + rng() * 0.35) + rng()) % 1;
        const ex = hx + (rng() - 0.5) * 180 + Math.sin(ph * 8 + e) * 24;
        const ey = hy - 18 - ph * 340;
        const ea = (1 - ph) * 0.78;
        ctx.fillStyle = e % 3 === 0 ? `rgba(255, 232, 152, ${ea.toFixed(3)})` : `rgba(255, 134, 44, ${ea.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(ex, ey, 1.4 + (1 - ph) * 1.8, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
      break;
    }

    case 's02_egypt': {
      // Slanted Karnak clerestory golden sunbeams + 24k gold-leaf glints + floating temple dust
      drawVolumetricCone(ctx, 130, -30, 0.96, 0.34, 920, 5, '255, 224, 142', 0.085, t);
      for (let i = 0; i < 16; i++) {
        const gx = 90 + rng() * 820;
        const gy = 80 + rng() * 580;
        const pulse = Math.max(0, Math.sin(t * 3.4 + i * 2.1));
        drawFourPointGlint(ctx, gx, gy, 5 + pulse * 6, '#fff3be', pulse * 0.55);
      }
      break;
    }

    case 's03_han': {
      // Subtle Xuan-paper embossed relief raking light + flint chisel sparks on anvil beat!
      const rake = ctx.createLinearGradient(0, 0, 1000, 320);
      rake.addColorStop(0, 'rgba(255, 248, 232, 0.06)');
      rake.addColorStop(0.5, 'rgba(255, 248, 232, 0)');
      rake.addColorStop(1, 'rgba(0, 0, 0, 0.14)');
      ctx.fillStyle = rake;
      ctx.fillRect(0, 0, 1000, 1000);

      if (anvil > 0.06 && rx > -80 && rx < 1080) {
        const cx = Math.max(80, Math.min(920, rx - 34));
        const cy = 668;
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        for (let s = 0; s < 10; s++) {
          const ang = -Math.PI * (0.15 + 0.7 * ((s * 0.618) % 1));
          const dist = (1 - anvil) * 58 + s * 3.5;
          const sx = cx + Math.cos(ang) * dist;
          const sy = cy + Math.sin(ang) * dist + (1 - anvil) * 18;
          ctx.strokeStyle = s % 2 === 0 ? `rgba(255, 226, 148, ${(anvil * 0.85).toFixed(3)})` : `rgba(236, 230, 216, ${(anvil * 0.75).toFixed(3)})`;
          ctx.lineWidth = 1.7;
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(sx - Math.cos(ang) * 7, sy - Math.sin(ang) * 7);
          ctx.stroke();
        }
        ctx.restore();
      }
      break;
    }

    case 's04_tang': {
      // Imperial palace warm silk backlight + tumbling crimson/blush peony petals in slipstream
      drawVolumetricCone(ctx, 820, -20, 2.15, 0.36, 820, 4, '255, 228, 176', 0.065, t);
      for (let i = 0; i < 18; i++) {
        const u = (localT * (0.14 + (i % 4) * 0.03) + i * 0.17) % 1;
        const px = 980 - u * 960 + Math.sin(t * 2.2 + i) * 18;
        const py = 180 + ((i * 137) % 480) + Math.cos(t * 1.8 + i * 1.3) * 22;
        const rot = t * 1.9 + i * 1.1;
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(rot);
        ctx.fillStyle = i % 3 === 0 ? 'rgba(188, 56, 62, 0.58)' : 'rgba(228, 136, 138, 0.52)';
        ctx.beginPath();
        ctx.ellipse(0, 0, 5.2, 2.8, 0, 0, TAU);
        ctx.fill();
        ctx.restore();
      }
      break;
    }

    case 's05_song': {
      // Drifting translucent Northern Song mountain mist ribbons + soaring ink cranes near summit
      ctx.save();
      for (let m = 0; m < 3; m++) {
        const my = 350 + m * 125;
        const mx = ((m * 310 + localT * (22 + m * 8)) % 1200) - 200;
        const mg = ctx.createRadialGradient(mx + 220, my, 12, mx + 220, my, 240);
        mg.addColorStop(0, 'rgba(238, 230, 212, 0.18)');
        mg.addColorStop(1, 'rgba(238, 230, 212, 0)');
        ctx.fillStyle = mg;
        ctx.fillRect(mx - 40, my - 65, 520, 130);
      }
      // Two tiny ink cranes soaring near the high peak
      for (let c = 0; c < 2; c++) {
        const cx = 290 + c * 46 + localT * 12;
        const cy = 176 - c * 22 + Math.sin(t * 2.6 + c) * 5;
        const flap = Math.sin(t * 5.2 + c * 1.4) * 5.5;
        ctx.strokeStyle = 'rgba(38, 34, 28, 0.68)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx - 9, cy - flap);
        ctx.quadraticCurveTo(cx - 3, cy - 2, cx, cy);
        ctx.quadraticCurveTo(cx + 3, cy - 2, cx + 9, cy - flap);
        ctx.stroke();
      }
      ctx.restore();
      break;
    }

    case 's06_qingming': {
      // Spring Bianjing sunbeams + warm tavern lantern reflections rippling in Bian River
      drawVolumetricCone(ctx, 880, -30, 2.22, 0.34, 860, 4, '255, 232, 174', 0.075, t);
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const lanternSpots = [
        [240, 790],
        [360, 835],
        [650, 810],
        [760, 845],
      ];
      for (let i = 0; i < lanternSpots.length; i++) {
        const [lx, ly] = lanternSpots[i];
        for (let r = 0; r < 4; r++) {
          const dx = Math.sin(t * 3.2 + i * 2 + r) * 10;
          ctx.strokeStyle = `rgba(255, 186, 98, ${(0.20 - r * 0.04).toFixed(3)})`;
          ctx.lineWidth = 2.0;
          ctx.beginPath();
          ctx.moveTo(lx - 14 + dx, ly + r * 9);
          ctx.lineTo(lx + 14 + dx, ly + r * 9);
          ctx.stroke();
        }
      }
      ctx.restore();
      break;
    }

    case 's07_maya': {
      // Tropical canopy sun-rays + curling translucent Maya-blue copal incense smoke
      drawVolumetricCone(ctx, 180, -20, 1.05, 0.30, 840, 4, '255, 230, 152', 0.07, t);
      for (let b = 0; b < 2; b++) {
        const bx = b === 0 ? 185 : 815;
        ctx.strokeStyle = 'rgba(72, 168, 164, 0.22)';
        ctx.lineWidth = 4.5;
        ctx.beginPath();
        ctx.moveTo(bx, 668);
        for (let s = 1; s <= 12; s++) {
          const py = 668 - s * 18;
          const px = bx + Math.sin(t * 2.1 + s * 0.55 + b * 2) * (4 + s * 1.4);
          ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
      break;
    }

    case 's08_mughal': {
      // 24k Zar-afshan gold-leaf star-glints + sparkling silver fountain droplets
      for (let i = 0; i < 22; i++) {
        const gx = 55 + rng() * 890;
        const gy = 55 + rng() * 880;
        const tw = Math.pow(Math.max(0, Math.sin(t * 3.8 + i * 1.73)), 2);
        drawFourPointGlint(ctx, gx, gy, 4.5 + tw * 6.5, '#ffe999', tw * 0.68);
      }
      break;
    }

    case 's09_bada': {
      // Whisper-pale ink water ripples below y=680 + restrained museum Xuan vignette
      const rPulse = (localT * 0.55) % 1;
      ctx.strokeStyle = `rgba(45, 42, 36, ${((1 - rPulse) * 0.16).toFixed(3)})`;
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.ellipse(380, 845, 18 + rPulse * 54, 4 + rPulse * 11, 0, 0, TAU);
      ctx.stroke();
      break;
    }

    case 's10_wayang': {
      // Blencong oil-lamp volumetric rays + warm floating tropical firefly sparks
      drawVolumetricCone(ctx, 500, 148, Math.PI * 0.5, 0.95, 760, 7, '255, 206, 108', 0.085, t);
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      for (let i = 0; i < 16; i++) {
        const ph = (t * (0.28 + rng() * 0.25) + rng()) % 1;
        const fx = 90 + rng() * 820 + Math.sin(t * 1.9 + i) * 20;
        const fy = 740 - ph * 340;
        ctx.fillStyle = `rgba(255, 204, 96, ${((1 - ph) * 0.62).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(fx, fy, 1.8 + (1 - ph) * 1.6, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
      break;
    }

    case 's11_ukiyoe': {
      // Windblown Hokusai gofun white sea-foam droplets + sakura petals & Hiroshige rain streaks
      ctx.strokeStyle = 'rgba(232, 226, 210, 0.20)';
      ctx.lineWidth = 1.0;
      for (let r = 0; r < 26; r++) {
        const u = (localT * 1.35 + rng()) % 1;
        const rx0 = ((rng() * 1100 - u * 180) + 1100) % 1040 - 20;
        const ry0 = u * 960;
        ctx.beginPath();
        ctx.moveTo(rx0, ry0);
        ctx.lineTo(rx0 - 11, ry0 + 46);
        ctx.stroke();
      }
      for (let p = 0; p < 14; p++) {
        const u = (localT * (0.22 + (p % 3) * 0.05) + p * 0.13) % 1;
        const px = 980 - u * 980;
        const py = 260 + ((p * 97) % 380) + Math.sin(t * 3.1 + p) * 16;
        ctx.fillStyle = 'rgba(246, 205, 210, 0.68)';
        ctx.beginPath();
        ctx.ellipse(px, py, 4.2, 2.2, t * 2 + p, 0, TAU);
        ctx.fill();
      }
      break;
    }

    case 's12_starry': {
      // Swirling golden/cerulean starlight slipstream motes + Provençal village warm window glow
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      for (let i = 0; i < 20; i++) {
        const u = (localT * 0.32 + i * 0.05) % 1;
        const sx = lerp(620, Math.max(80, Math.min(920, rx)), u) + Math.sin(u * 9 + t * 2 + i) * 38;
        const sy = lerp(220, 610, u) + Math.cos(u * 7 + i) * 18;
        ctx.fillStyle = i % 2 === 0 ? `rgba(255, 224, 118, ${((1 - u * 0.5) * 0.42).toFixed(3)})` : `rgba(128, 198, 255, ${((1 - u * 0.5) * 0.36).toFixed(3)})`;
        ctx.beginPath();
        ctx.ellipse(sx, sy, 6.5, 2.4, u * 2.4, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
      break;
    }

    case 's13_scream': {
      // Acoustic shockwave distortion arcs on beat + molten bridge handrail rim-light
      if (beatPulse > 0.08 || anvil > 0.05) {
        const amp = Math.max(beatPulse * 0.35, anvil * 0.55);
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.strokeStyle = `rgba(255, 164, 72, ${(amp * 0.38).toFixed(3)})`;
        ctx.lineWidth = 2.4;
        for (let k = 0; k < 3; k++) {
          const rad = 70 + k * 58 + (1 - beatPulse) * 44;
          ctx.beginPath();
          ctx.arc(720, 520, rad, Math.PI * 1.05, Math.PI * 1.92);
          ctx.stroke();
        }
        ctx.restore();
      }
      break;
    }

    case 's14_nosferatu': {
      // Volumetric silver-nitrate moonbeam god-rays from Gothic window + fine celluloid scratches
      drawVolumetricCone(ctx, 185, 240, 0.62, 0.28, 760, 4, '218, 226, 238', 0.09, t);
      const qFrame = Math.floor(t * 18);
      const fRng = makePRNG(hashSeed(`nos_grain_${qFrame}`));
      ctx.strokeStyle = 'rgba(235, 232, 220, 0.13)';
      ctx.lineWidth = 0.9;
      for (let s = 0; s < 2; s++) {
        const sx = 80 + fRng() * 840;
        ctx.beginPath();
        ctx.moveTo(sx, 0);
        ctx.lineTo(sx + (fRng() - 0.5) * 4, 1000);
        ctx.stroke();
      }
      break;
    }

    case 's15_oscilloscope': {
      // P1 emerald phosphor bloom on anvil strike + convex CRT glass studio reflection arc
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      if (anvil > 0.04) {
        const bloom = ctx.createRadialGradient(500, 470, 30, 500, 470, 380);
        bloom.addColorStop(0, `rgba(92, 255, 158, ${(anvil * 0.24).toFixed(3)})`);
        bloom.addColorStop(1, 'rgba(32, 180, 90, 0)');
        ctx.fillStyle = bloom;
        ctx.fillRect(100, 80, 800, 780);
      }
      ctx.strokeStyle = 'rgba(220, 255, 238, 0.13)';
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(500, 470, 348, -2.45, -1.78);
      ctx.stroke();
      ctx.restore();
      break;
    }

    case 's16_8bit': {
      // Subtle arcade CRT scanlines & warm coin-sparkle halation near jump apex
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      for (let y = 0; y < 1000; y += 6) {
        ctx.fillRect(0, y, 1000, 2);
      }
      if (rx > 380 && rx < 660) {
        const u = 1 - Math.abs(rx - 520) / 140;
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        const cg = ctx.createRadialGradient(520, 420, 8, 520, 420, 145);
        cg.addColorStop(0, `rgba(255, 230, 96, ${(u * 0.28).toFixed(3)})`);
        cg.addColorStop(1, 'rgba(255, 180, 32, 0)');
        ctx.fillStyle = cg;
        ctx.fillRect(360, 260, 320, 320);
        ctx.restore();
      }
      break;
    }

    case 's17_chat': {
      // Subtle diagonal Y2K CRT/LCD monitor glass sheen
      const sheen = ctx.createLinearGradient(0, 0, 1000, 1000);
      sheen.addColorStop(0, 'rgba(255, 255, 255, 0.07)');
      sheen.addColorStop(0.32, 'rgba(255, 255, 255, 0)');
      sheen.addColorStop(1, 'rgba(0, 18, 28, 0.08)');
      ctx.fillStyle = sheen;
      ctx.fillRect(0, 0, 1000, 1000);
      break;
    }

    case 's18_vaporwave': {
      // Outrun sunset chromatic halation rays + VHS subtle shimmer
      drawVolumetricCone(ctx, 500, 320, -Math.PI * 0.5, 1.2, 420, 5, '255, 96, 208', 0.075, t);
      break;
    }

    case 's19_shortvideo': {
      // Diagonal OLED glass specular highlight across smartphone screen
      const oled = ctx.createLinearGradient(180, 40, 820, 760);
      oled.addColorStop(0, 'rgba(255, 255, 255, 0.075)');
      oled.addColorStop(0.24, 'rgba(255, 255, 255, 0.015)');
      oled.addColorStop(0.28, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = oled;
      ctx.fillRect(180, 30, 640, 940);
      break;
    }

    case 's20_code': {
      // Horizontal sapphire-gold anamorphic optical flare along y=680 + rising golden caustics
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const fx = Math.max(120, Math.min(880, rx));
      const flare = ctx.createLinearGradient(0, 680, 1000, 680);
      flare.addColorStop(0, 'rgba(56, 189, 248, 0)');
      flare.addColorStop(Math.max(0.05, (fx - 260) / 1000), 'rgba(56, 189, 248, 0.16)');
      flare.addColorStop(fx / 1000, 'rgba(255, 232, 162, 0.42)');
      flare.addColorStop(Math.min(0.95, (fx + 260) / 1000), 'rgba(56, 189, 248, 0.16)');
      flare.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = flare;
      ctx.fillRect(0, 675, 1000, 10);

      for (let i = 0; i < 18; i++) {
        const ph = (t * (0.30 + (i % 4) * 0.08) + i * 0.13) % 1;
        const px = fx + Math.sin(i * 2.4 + t) * 140;
        const py = 678 - ph * 290;
        ctx.fillStyle = i % 2 === 0 ? `rgba(255, 218, 126, ${((1 - ph) * 0.55).toFixed(3)})` : `rgba(96, 214, 255, ${((1 - ph) * 0.48).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(px, py, 1.5 + (1 - ph) * 1.6, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
      break;
    }

    default:
      break;
  }

  ctx.restore();
}
