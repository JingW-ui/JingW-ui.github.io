// src/scenes/outro.js
// Outro: Press Conference & 7x3 Exhibition Wall (125.0s - 137.0s, 6 bars = 12.0s @ 120 BPM)
// - Pulls back from 0px-locked Tile #20 to 7x3 museum gallery wall (~89.1% of 1920 width)
// - Museum wall: fine-linen dark gallery texture, architectural dado rail & wainscoting,
//   warm 2900K overhead picture-light wash cones + brass hoods, and 38x7px brass micro-plaques (Tiles 1..20)
// - Slot #21: empty mahogany & diamond-tufted oxblood armchair, crystal water carafe & tumbler,
//   7 distinct unbranded broadcast microphones, 3D folded gold-foil tent card "鹈鹕（本人）",
//   directional multi-angle xenon press flashes, foreground press-pit reporter silhouettes,
//   and 136.0s rear-corridor streak + slipstream curtain/card flutter + golden acoustic bell ripples!

import { VIEW_W, VIEW_H, BASE_PANEL_SCALE, DEFAULT_CAM_Y } from '../beat/camera.js';
import { SCENES, clamp, lerp, smoothstep, smootherstep } from '../beat/timeline.js';
import { computePelicanRig, drawRig2D } from '../rig/pelican.js';

const VIRTUAL_WALL_VIEW_W = 1920;
const VIRTUAL_WALL_VIEW_H = 1080;
const COLS = 7;
const ROWS = 3;
const TILE_SIZE = 222;
const TILE_GAP = 26;
const GRID_W = COLS * TILE_SIZE + (COLS - 1) * TILE_GAP; // 1710px in virtual wall space
const GRID_H = ROWS * TILE_SIZE + (ROWS - 1) * TILE_GAP; // 718px in virtual wall space
const GRID_X0 = Math.round((VIRTUAL_WALL_VIEW_W - GRID_W) / 2); // 105
const GRID_Y0 = 96;

const WALL_OX = -80;
const WALL_OY = -60;
const WALL_W = 2120;
const WALL_H = 1200;

/**
 * Ensures all 20 frozen era thumbnails (512x512) are baked once into `kit.outroTileCache`.
 */
function ensureOutroTiles(kit, renderSceneFn) {
  if (kit.outroTileCache.size === SCENES.length) return;
  const tempSlot = kit.getSlot(3);
  for (const scene of SCENES) {
    if (kit.outroTileCache.has(scene.id)) continue;
    const freezeLocalT = 3.0; // Mid-Bar-2 signature pose!
    const freezeGlobalT = scene.t0 + freezeLocalT;
    renderSceneFn(kit, tempSlot, scene, {
      t: freezeGlobalT,
      localT: freezeLocalT,
      pelicanLocalX: 500,
      pedalAngle: 0.75 + scene.index * 0.4,
      speedScale: 0.25,
      isOutroThumbnail: true,
    });

    const thumb = kit.p.createGraphics(512, 512);
    thumb.pixelDensity(1);
    if (tempSlot.usedFb && tempSlot.fb) {
      thumb.image(tempSlot.fb, 0, 0, 512, 512);
    }
    thumb.drawingContext.drawImage(tempSlot.g2d.canvas, 0, 0, 512, 512);
    kit.outroTileCache.set(scene.id, thumb);
  }
}

/**
 * Bakes the static 2120x1200 museum exhibition hall wall once via `kit.bake2D` (<0.3ms blit):
 * fine Belgian linen weave, ceiling cornice shadow, architectural dado rail & recessed wainscoting.
 */
function getBakedMuseumWall(kit) {
  return kit.bake2D(
    'outro_museum_wall_r3',
    (_g, ctx, rng, bw, bh) => {
      const cx = -WALL_OX + VIRTUAL_WALL_VIEW_W * 0.5;
      const cy = -WALL_OY + VIRTUAL_WALL_VIEW_H * 0.43;
      const wallGrad = ctx.createRadialGradient(cx, cy, 140, cx, -WALL_OY + VIRTUAL_WALL_VIEW_H * 0.5, 1260);
      wallGrad.addColorStop(0.0, '#27231e');
      wallGrad.addColorStop(0.58, '#1d1a16');
      wallGrad.addColorStop(1.0, '#110f0d');
      ctx.fillStyle = wallGrad;
      ctx.fillRect(0, 0, bw, bh);

      // Fine-linen museum wall weave (non-periodic 1..2px micro-threads so 3.35x close-up has zero grid plaid!)
      ctx.lineWidth = 0.8;
      for (let y = 0; y < bh; y += 2) {
        const a = 0.007 + rng() * 0.011;
        ctx.strokeStyle = rng() > 0.5 ? `rgba(255, 244, 224, ${a.toFixed(3)})` : `rgba(0, 0, 0, ${(a * 1.9).toFixed(3)})`;
        ctx.beginPath();
        ctx.moveTo(0, y + 0.5);
        ctx.lineTo(bw, y + 0.5);
        ctx.stroke();
      }
      for (let x = 0; x < bw; x += 2) {
        const a = 0.005 + rng() * 0.009;
        ctx.strokeStyle = rng() > 0.5 ? `rgba(248, 236, 214, ${a.toFixed(3)})` : `rgba(0, 0, 0, ${(a * 1.6).toFixed(3)})`;
        ctx.beginPath();
        ctx.moveTo(x + 0.5, 0);
        ctx.lineTo(x + 0.5, bh);
        ctx.stroke();
      }

      // Organic raw-linen slub fibers across wall surface
      for (let i = 0; i < 3800; i++) {
        const fx = rng() * bw;
        const fy = rng() * (bh - 240);
        const len = 4 + rng() * 16;
        const horiz = rng() > 0.35;
        ctx.strokeStyle =
          rng() > 0.46
            ? `rgba(255, 244, 222, ${(0.02 + rng() * 0.032).toFixed(3)})`
            : `rgba(8, 7, 6, ${(0.05 + rng() * 0.07).toFixed(3)})`;
        ctx.lineWidth = 0.65 + rng() * 0.55;
        ctx.beginPath();
        ctx.moveTo(fx, fy);
        ctx.lineTo(horiz ? fx + len : fx + (rng() - 0.5) * 1.5, horiz ? fy + (rng() - 0.5) * 1.2 : fy + len);
        ctx.stroke();
      }

      // Upper gallery ceiling cove cornice & recessed lighting track rail
      const ox = -WALL_OX;
      const oy = -WALL_OY;
      const topShadow = ctx.createLinearGradient(0, oy - 20, 0, oy + 52);
      topShadow.addColorStop(0, 'rgba(4, 3, 3, 0.72)');
      topShadow.addColorStop(1, 'rgba(4, 3, 3, 0)');
      ctx.fillStyle = topShadow;
      ctx.fillRect(0, 0, bw, oy + 52);

      // Architectural Dado Rail (y = 852..866 in wall coords) & Wainscoting Panels below grid
      const dadoY = oy + 852;
      const dadoGrad = ctx.createLinearGradient(0, dadoY, 0, dadoY + 15);
      dadoGrad.addColorStop(0.0, '#4a4035');
      dadoGrad.addColorStop(0.22, '#383028');
      dadoGrad.addColorStop(0.65, '#241f1a');
      dadoGrad.addColorStop(1.0, '#120f0d');
      ctx.fillStyle = dadoGrad;
      ctx.fillRect(0, dadoY, bw, 15);

      ctx.strokeStyle = 'rgba(228, 198, 148, 0.22)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, dadoY + 1);
      ctx.lineTo(bw, dadoY + 1);
      ctx.stroke();

      // Lower wainscoting dark oiled-wood band + 7 column-aligned recessed coffers
      const wainGrad = ctx.createLinearGradient(0, dadoY + 15, 0, oy + 1044);
      wainGrad.addColorStop(0, '#181512');
      wainGrad.addColorStop(1, '#100e0c');
      ctx.fillStyle = wainGrad;
      ctx.fillRect(0, dadoY + 15, bw, oy + 1044 - (dadoY + 15));

      for (let c = 0; c < COLS; c++) {
        const px = ox + GRID_X0 + c * (TILE_SIZE + TILE_GAP) + 6;
        const pw = TILE_SIZE - 12;
        const py = dadoY + 26;
        const ph = 136;
        ctx.fillStyle = 'rgba(10, 9, 8, 0.42)';
        ctx.fillRect(px, py, pw, ph);
        ctx.strokeStyle = 'rgba(9, 8, 7, 0.85)';
        ctx.lineWidth = 1.4;
        ctx.strokeRect(px, py, pw, ph);
        ctx.strokeStyle = 'rgba(196, 168, 122, 0.09)';
        ctx.lineWidth = 0.9;
        ctx.strokeRect(px + 2, py + 2, pw - 4, ph - 4);
      }

      // Museum skirting baseboard & gallery floor shadow line (y = 1042..1140)
      const baseTop = oy + 1040;
      const skirtGrad = ctx.createLinearGradient(0, baseTop, 0, baseTop + 34);
      skirtGrad.addColorStop(0, '#2c251f');
      skirtGrad.addColorStop(0.2, '#1c1814');
      skirtGrad.addColorStop(1, '#0a0908');
      ctx.fillStyle = skirtGrad;
      ctx.fillRect(0, baseTop, bw, bh - baseTop);
      ctx.strokeStyle = 'rgba(214, 184, 132, 0.14)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, baseTop + 0.5);
      ctx.lineTo(bw, baseTop + 0.5);
      ctx.stroke();
    },
    WALL_W,
    WALL_H
  );
}

/**
 * Bakes a single reusable soft 2900K museum picture-light wash cone sprite (`洗墙射灯暖光晕`).
 */
function getBakedPictureLightCone(kit) {
  return kit.bake2D(
    'outro_pic_cone_r3',
    (_g, ctx, _rng, cw, ch) => {
      ctx.clearRect(0, 0, cw, ch);
      const midX = cw * 0.5;

      // Parabolic feathered wall-washer light cone from brass lamp at y=16 widening downward
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(midX - 28, 14);
      ctx.lineTo(midX + 28, 14);
      ctx.quadraticCurveTo(cw * 0.95, ch * 0.45, cw * 0.98, ch);
      ctx.lineTo(cw * 0.02, ch);
      ctx.quadraticCurveTo(cw * 0.05, ch * 0.45, midX - 28, 14);
      ctx.closePath();
      ctx.clip();

      const coneG = ctx.createRadialGradient(midX, 26, 8, midX, ch * 0.42, cw * 0.52);
      coneG.addColorStop(0.0, 'rgba(255, 229, 176, 0.24)');
      coneG.addColorStop(0.32, 'rgba(255, 214, 148, 0.11)');
      coneG.addColorStop(0.68, 'rgba(235, 192, 125, 0.038)');
      coneG.addColorStop(1.0, 'rgba(235, 192, 125, 0)');
      ctx.fillStyle = coneG;
      ctx.fillRect(0, 0, cw, ch);
      ctx.restore();

      // Warm halogen core bloom right beneath picture-light hood
      const hotG = ctx.createRadialGradient(midX, 20, 2, midX, 28, 62);
      hotG.addColorStop(0.0, 'rgba(255, 240, 198, 0.30)');
      hotG.addColorStop(0.5, 'rgba(255, 216, 148, 0.09)');
      hotG.addColorStop(1.0, 'rgba(255, 216, 148, 0)');
      ctx.fillStyle = hotG;
      ctx.fillRect(midX - 70, 0, 140, 96);
    },
    340,
    330
  );
}

/**
 * Draws a sleek brushed-brass museum picture-light hood (`44x3.4px`) mounted above tile `(tx, ty)`.
 */
function getBakedPictureLamp(kit) {
  return kit.bake2D(
    'outro_lamp_hood_r3',
    (_g, ctx) => {
      ctx.clearRect(0, 0, 300, 54);
      ctx.save();
      ctx.scale(6, 6); // 50x9 logical space
      const cx = 25;
      const ly = 0.6;
      const lw = 46;
      const lh = 3.5;

      ctx.strokeStyle = '#6c5530';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(cx - 11, ly + lh);
      ctx.lineTo(cx - 11, 7.2);
      ctx.moveTo(cx + 11, ly + lh);
      ctx.lineTo(cx + 11, 7.2);
      ctx.stroke();

      const lg = ctx.createLinearGradient(cx - lw * 0.5, ly, cx + lw * 0.5, ly + lh);
      lg.addColorStop(0.0, '#4f3c20');
      lg.addColorStop(0.28, '#b89450');
      lg.addColorStop(0.52, '#e6c884');
      lg.addColorStop(0.76, '#9c7b3e');
      lg.addColorStop(1.0, '#3e2f18');
      ctx.fillStyle = lg;
      ctx.beginPath();
      ctx.roundRect(cx - lw * 0.5, ly, lw, lh, 1.6);
      ctx.fill();

      ctx.strokeStyle = 'rgba(255, 236, 188, 0.72)';
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(cx - lw * 0.44, ly + lh + 0.4);
      ctx.lineTo(cx + lw * 0.44, ly + lh + 0.4);
      ctx.stroke();
      ctx.restore();
    },
    300,
    54
  );
}

function drawPictureLampFixture(kit, ctx, tx, ty) {
  const lampG = getBakedPictureLamp(kit);
  ctx.drawImage(lampG.canvas, tx + TILE_SIZE * 0.5 - 25, ty - 9.4, 50, 9);
}

function getBakedMicroPlaque(kit, scene) {
  return kit.bake2D(
    `outro_micro_plaque_r4_${scene.id}`,
    (_g, ctx) => {
      ctx.clearRect(0, 0, 288, 60);
      ctx.save();
      ctx.scale(6, 6); // 48x10 logical space (46x8.2 plaque + 1.1px shadow)
      const pw = 46;
      const ph = 8.2;
      const px = 0.5;
      const py = 0.5;

      ctx.fillStyle = 'rgba(5, 4, 3, 0.66)';
      ctx.fillRect(px + 0.9, py + 1.1, pw, ph);

      const bg = ctx.createLinearGradient(px, py, px + pw, py + ph);
      bg.addColorStop(0.0, '#46351c');
      bg.addColorStop(0.32, '#9b7b40');
      bg.addColorStop(0.50, '#edd18e');
      bg.addColorStop(0.70, '#8d6d36');
      bg.addColorStop(1.0, '#3b2c17');
      ctx.fillStyle = bg;
      ctx.fillRect(px, py, pw, ph);

      ctx.strokeStyle = 'rgba(255, 236, 186, 0.45)';
      ctx.lineWidth = 0.45;
      ctx.strokeRect(px + 0.25, py + 0.25, pw - 0.5, ph - 0.5);
      ctx.strokeStyle = 'rgba(42, 30, 14, 0.55)';
      ctx.lineWidth = 0.35;
      ctx.strokeRect(px + 1.1, py + 1.0, pw - 2.2, ph - 2.0);

      ctx.fillStyle = '#f5dfb0';
      for (const [rx, ry] of [
        [px + 1.8, py + 1.6],
        [px + pw - 1.8, py + 1.6],
        [px + 1.8, py + ph - 1.6],
        [px + pw - 1.8, py + ph - 1.6],
      ]) {
        ctx.beginPath();
        ctx.arc(rx, ry, 0.42, 0, Math.PI * 2);
        ctx.fill();
      }

      const label = `${String(scene.num).padStart(2, '0')} · ${scene.zh}`;
      ctx.fillStyle = '#201508';
      ctx.font = '800 3.55px "PelicanSerif", serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, px + pw * 0.5, py + ph * 0.53);
      ctx.restore();
    },
    288,
    60
  );
}

function drawMuseumMicroPlaque(kit, ctx, tx, ty, scene, outroT) {
  const plG = getBakedMicroPlaque(kit, scene);
  const px = tx + (TILE_SIZE - 46) * 0.5;
  const py = ty + TILE_SIZE + 5.6;
  ctx.drawImage(plG.canvas, px - 0.5, py - 0.5, 48, 10);

  // Subtle travelling brass specular glint bar
  const glintA = Math.max(0, Math.sin(outroT * 0.85 + scene.index * 0.42)) * 0.14;
  if (glintA > 0.01) {
    ctx.fillStyle = `rgba(255, 245, 205, ${glintA.toFixed(3)})`;
    ctx.fillRect(px + 2, py + 0.6, 42, 2.2);
  }
}

/**
 * Draws a 3D mitred gilt-bronze & ebonized walnut museum frame around `[tx, ty, size, size]`.
 */
function drawSlot21MitredGiltFrame(ctx, tx, ty, size, flashStrength = 0) {
  const o = 3.2; // outer overhang matching lineWidth=5..6 footprint
  const i = 2.6; // inner sight lip
  const ox0 = tx - o;
  const oy0 = ty - o;
  const ox1 = tx + size + o;
  const oy1 = ty + size + o;
  const ix0 = tx + i;
  const iy0 = ty + i;
  const ix1 = tx + size - i;
  const iy1 = ty + size - i;

  const drawSide = (pts, g0, g1, c0, cMid, c1) => {
    const g = ctx.createLinearGradient(g0[0], g0[1], g1[0], g1[1]);
    g.addColorStop(0.0, c0);
    g.addColorStop(0.48, cMid);
    g.addColorStop(1.0, c1);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    ctx.lineTo(pts[1][0], pts[1][1]);
    ctx.lineTo(pts[2][0], pts[2][1]);
    ctx.lineTo(pts[3][0], pts[3][1]);
    ctx.closePath();
    ctx.fill();
  };

  // Top (lit by overhead picture lamp), Bottom (in shadow + subtle flash bounce), Left, Right
  drawSide([[ox0, oy0], [ox1, oy0], [ix1, iy0], [ix0, iy0]], [0, oy0], [0, iy0], '#7a5f30', '#dfc07c', '#9a783d');
  const botMid = flashStrength > 0.05 ? '#caa862' : '#7d6030';
  drawSide([[ix0, iy1], [ix1, iy1], [ox1, oy1], [ox0, oy1]], [0, iy1], [0, oy1], '#9a7940', botMid, '#3f2e15');
  drawSide([[ox0, oy0], [ix0, iy0], [ix0, iy1], [ox0, oy1]], [ox0, 0], [ix0, 0], '#5e4722', '#be9d58', '#7c6030');
  drawSide([[ix1, iy0], [ox1, oy0], [ox1, oy1], [ix1, iy1]], [ix1, 0], [ox1, 0], '#856734', '#c9a862', '#4c391a');

  // 45-degree corner mitre join seams
  ctx.strokeStyle = 'rgba(28, 19, 8, 0.55)';
  ctx.lineWidth = 0.55;
  for (const [x1, y1, x2, y2] of [
    [ox0, oy0, ix0, iy0],
    [ox1, oy0, ix1, iy0],
    [ox1, oy1, ix1, iy1],
    [ox0, oy1, ix0, iy1],
  ]) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  // Inner champagne-gold sight fillet & dark rabbet shadow
  ctx.strokeStyle = '#f5e6c4';
  ctx.lineWidth = 0.75;
  ctx.strokeRect(ix0, iy0, ix1 - ix0, iy1 - iy0);
  ctx.strokeStyle = 'rgba(10, 8, 6, 0.72)';
  ctx.lineWidth = 0.6;
  ctx.strokeRect(ox0, oy0, ox1 - ox0, oy1 - oy0);
}

// =============================================================================
// Slot #21 Press Conference Sub-Renderers (authored in crisp 1000x1000 vector space)
// =============================================================================

function computeCurtainFlutter(xNorm, outroT) {
  // Traveling aerodynamic wake wave sweeping left -> right as pelican rockets past (8.72..9.60s)
  const waveStart = 8.72 + xNorm * 0.28;
  const age = outroT - waveStart;
  if (age <= 0 || age > 0.78) return 0;
  const env = Math.sin(Math.min(1, age / 0.14) * (Math.PI * 0.5)) * Math.exp(-age * 4.6);
  return env * (16.5 * Math.cos(age * 21.0) + 7.5);
}

function drawRearCorridor(ctx, flashInfo) {
  // Base midnight-slate stage shell
  ctx.fillStyle = '#0c121d';
  ctx.fillRect(0, 0, 1000, 1000);

  // Warm tungsten rear museum corridor band (y = 314..628, open vista x = 110..890)
  const corrG = ctx.createLinearGradient(0, 314, 0, 628);
  corrG.addColorStop(0.0, '#2a231c');
  corrG.addColorStop(0.28, '#382f24');
  corrG.addColorStop(0.72, '#28211a');
  corrG.addColorStop(1.0, '#181410');
  ctx.fillStyle = corrG;
  ctx.fillRect(90, 314, 820, 314);

  // Overhead warm tungsten corridor cove wash
  const coveG = ctx.createRadialGradient(500, 318, 30, 500, 390, 440);
  coveG.addColorStop(0.0, 'rgba(255, 222, 164, 0.25)');
  coveG.addColorStop(0.55, 'rgba(232, 188, 124, 0.10)');
  coveG.addColorStop(1.0, 'rgba(232, 188, 124, 0)');
  ctx.fillStyle = coveG;
  ctx.fillRect(90, 314, 820, 290);

  // Architectural Frosted-Glass Transom Windows (5 panes across x = 128..872, y = 326..396)
  const tx0 = 128;
  const panes = 5;
  const paneW = (872 - tx0) / panes;
  ctx.fillStyle = '#1b1612';
  ctx.fillRect(tx0 - 6, 322, 872 - tx0 + 12, 78);

  for (let i = 0; i < panes; i++) {
    const px = tx0 + i * paneW + 5;
    const pw = paneW - 10;
    const py = 327;
    const ph = 67;

    const glassG = ctx.createLinearGradient(px, py, px + pw * 0.6, py + ph);
    glassG.addColorStop(0.0, 'rgba(246, 224, 182, 0.28)');
    glassG.addColorStop(0.48, 'rgba(218, 192, 148, 0.17)');
    glassG.addColorStop(1.0, 'rgba(148, 126, 96, 0.11)');
    ctx.fillStyle = glassG;
    ctx.fillRect(px, py, pw, ph);

    // Diagonal frosted-glass specular sheen
    ctx.fillStyle = 'rgba(255, 245, 220, 0.08)';
    ctx.beginPath();
    ctx.moveTo(px + pw * 0.18, py);
    ctx.lineTo(px + pw * 0.42, py);
    ctx.lineTo(px + pw * 0.22, py + ph);
    ctx.lineTo(px + pw * 0.02, py + ph);
    ctx.closePath();
    ctx.fill();

    // Etched inner geometric muntin border
    ctx.strokeStyle = 'rgba(240, 218, 178, 0.22)';
    ctx.lineWidth = 1.1;
    ctx.strokeRect(px + 5, py + 5, pw - 10, ph - 10);
    ctx.strokeStyle = '#241d17';
    ctx.lineWidth = 2.0;
    ctx.strokeRect(px, py, pw, ph);
  }

  // Corridor architectural chair-rail molding (y = 486..497) & recessed plaster panels
  const railG = ctx.createLinearGradient(0, 486, 0, 497);
  railG.addColorStop(0, '#4f4132');
  railG.addColorStop(0.45, '#332920');
  railG.addColorStop(1, '#1a1510');
  ctx.fillStyle = railG;
  ctx.fillRect(90, 486, 820, 11);

  for (let i = 0; i < 6; i++) {
    const wx = 132 + i * 124;
    ctx.strokeStyle = 'rgba(18, 14, 10, 0.45)';
    ctx.lineWidth = 1.4;
    ctx.strokeRect(wx, 506, 108, 48);
    ctx.strokeStyle = 'rgba(235, 206, 162, 0.07)';
    ctx.lineWidth = 1.0;
    ctx.strokeRect(wx + 1.5, 507.5, 105, 45);
  }

  // Corridor baseboard (y = 562..574) & honed travertine/parquet floor (y = 574..632)
  ctx.fillStyle = '#1b1611';
  ctx.fillRect(90, 562, 820, 12);
  const floorG = ctx.createLinearGradient(0, 574, 0, 632);
  floorG.addColorStop(0, '#231d17');
  floorG.addColorStop(0.4, '#1b1612');
  floorG.addColorStop(1, '#100d0b');
  ctx.fillStyle = floorG;
  ctx.fillRect(90, 574, 820, 58);

  ctx.strokeStyle = 'rgba(255, 232, 190, 0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(90, 574.5);
  ctx.lineTo(910, 574.5);
  ctx.stroke();

  // Projected wall/corridor shadow of the empty armchair (shifts opposite directional xenon flash!)
  const shShiftX = flashInfo.strength > 0.01 ? (500 - flashInfo.originX) * 0.085 : 0;
  const shShiftY = flashInfo.strength > 0.01 ? -14 * flashInfo.strength : 4;
  const shAlpha = 0.32 + flashInfo.strength * 0.30;
  ctx.save();
  ctx.fillStyle = `rgba(6, 7, 10, ${shAlpha.toFixed(3)})`;
  ctx.beginPath();
  ctx.roundRect(366 + shShiftX, 316 + shShiftY, 268, 310, 28);
  ctx.fill();
  ctx.restore();
}

function drawStreakingPelicanAndBell(ctx, outroT) {
  // 1. Fluttering press-release sheets kicked up in the rear corridor wake (8.78..9.66s)
  if (outroT >= 8.78 && outroT <= 9.66) {
    const sheets = [
      { t0: 8.78, x0: 235, y0: 545, vx: 165, vy: -95, rot0: -0.25, spin: 5.4, w: 28, h: 20 },
      { t0: 8.83, x0: 345, y0: 525, vx: 195, vy: -118, rot0: 0.35, spin: -6.2, w: 31, h: 22 },
      { t0: 8.89, x0: 635, y0: 538, vx: 185, vy: -105, rot0: -0.4, spin: 6.8, w: 30, h: 21 },
      { t0: 8.93, x0: 705, y0: 512, vx: 155, vy: -84, rot0: 0.2, spin: -5.1, w: 26, h: 18 },
      { t0: 8.96, x0: 765, y0: 548, vx: 145, vy: -76, rot0: -0.15, spin: 4.5, w: 27, h: 19 },
    ];
    for (const s of sheets) {
      const dt = outroT - s.t0;
      if (dt < 0 || dt > 0.72) continue;
      const fade = Math.sin(Math.min(1, dt / 0.08) * (Math.PI * 0.5)) * (1 - smoothstep(0.46, 0.72, dt));
      const sx = s.x0 + s.vx * dt * (1 - 0.38 * dt);
      const sy = s.y0 + s.vy * dt + 165 * dt * dt + Math.sin(dt * 19 + s.x0) * 6;
      const tilt = Math.cos(dt * 14 + s.rot0 * 5);
      ctx.save();
      ctx.globalAlpha = fade * 0.88;
      ctx.translate(sx, sy);
      ctx.rotate(s.rot0 + s.spin * dt);
      ctx.scale(1, Math.max(0.28, Math.abs(tilt)));
      ctx.fillStyle = tilt >= 0 ? '#f7f1e3' : '#dfd6c3';
      ctx.strokeStyle = 'rgba(90, 76, 58, 0.55)';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(-s.w * 0.5, -s.h * 0.5);
      ctx.quadraticCurveTo(0, -s.h * 0.68, s.w * 0.5, -s.h * 0.45);
      ctx.lineTo(s.w * 0.46, s.h * 0.5);
      ctx.quadraticCurveTo(0, s.h * 0.34, -s.w * 0.5, s.h * 0.48);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Tiny grey text-line rules on the flying press sheet
      ctx.strokeStyle = 'rgba(65, 58, 48, 0.35)';
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(-s.w * 0.32, -s.h * 0.16);
      ctx.lineTo(s.w * 0.28, -s.h * 0.14);
      ctx.moveTo(-s.w * 0.32, s.h * 0.08);
      ctx.lineTo(s.w * 0.18, s.h * 0.10);
      ctx.stroke();
      ctx.restore();
    }
  }

  // 2. Streaking Pelican on Bicycle (8.68..9.22s; realT ≈ 167.42..168.60s right before Center File-Size Reveal!)
  if (outroT >= 8.68 && outroT <= 9.22) {
    const u = (outroT - 8.68) / 0.50;
    const streakX = lerp(-120, 1380, u);
    const groundY = 602;
    const rigScale = 1.06;

    // Tapered aerodynamic slipstream wind ribbons stretching across BOTH left & right corridor
    const ribbons = [
      { dy: -206, len: 650, w: 3.2, a: 0.68 },
      { dy: -152, len: 710, w: 2.6, a: 0.58 },
      { dy: -102, len: 590, w: 2.2, a: 0.48 },
      { dy: -48, len: 670, w: 2.8, a: 0.54 },
    ];
    for (const rb of ribbons) {
      const xHead = streakX - 18;
      const xTail = streakX - rb.len;
      const rg = ctx.createLinearGradient(xTail, 0, xHead, 0);
      rg.addColorStop(0.0, 'rgba(255, 246, 222, 0)');
      rg.addColorStop(0.42, `rgba(255, 242, 208, ${(rb.a * 0.62).toFixed(3)})`);
      rg.addColorStop(1.0, `rgba(255, 250, 236, ${rb.a.toFixed(3)})`);
      ctx.strokeStyle = rg;
      ctx.lineWidth = rb.w;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(xTail, groundY + rb.dy + 3);
      ctx.quadraticCurveTo((xTail + xHead) * 0.5, groundY + rb.dy - 3, xHead, groundY + rb.dy);
      ctx.stroke();
    }

    // 3 translucent motion-blur ghost echoes trailing behind the fast-pedaling pelican
    const ghosts = [
      { dx: -176, dPed: -0.95, alpha: 0.11 },
      { dx: -112, dPed: -0.60, alpha: 0.19 },
      { dx: -54, dPed: -0.28, alpha: 0.30 },
    ];
    const basePedal = (outroT / 0.5) * Math.PI * 1.85;
    const baseWheel = streakX / 44;

    for (const gh of ghosts) {
      ctx.save();
      ctx.globalAlpha = gh.alpha;
      const gRig = computePelicanRig({
        x: streakX + gh.dx,
        y: groundY,
        pedalAngle: basePedal + gh.dPed,
        wheelAngle: baseWheel + gh.dx / 44,
        scale: rigScale,
        slope: -0.025,
        speedScale: 1.25,
        time: outroT,
      });
      drawRig2D(ctx, gRig, {
        featherFill: '#fff7e4',
        featherShade: '#e8dcc4',
        beakFill: '#f4ae42',
        pouchFill: '#e47a34',
        frameStroke: '#d14332',
        metalStroke: '#9da5b0',
        tireStroke: '#2b2927',
        inkOutline: 'rgba(40, 34, 28, 0.55)',
        lineScale: 0.85,
      });
      ctx.restore();
    }

    // Subtle corridor floor contact reflection/shadow beneath wheels
    ctx.fillStyle = 'rgba(8, 7, 6, 0.45)';
    ctx.beginPath();
    ctx.ellipse(streakX, groundY + 4, 152, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Crisp primary streaking Pelican + Road Bicycle (looking straight ahead +X, never turning back!)
    const mainRig = computePelicanRig({
      x: streakX,
      y: groundY,
      pedalAngle: basePedal,
      wheelAngle: baseWheel,
      scale: rigScale,
      slope: -0.025,
      speedScale: 1.25,
      time: outroT,
    });
    drawRig2D(ctx, mainRig, {
      featherFill: '#fbf7ee',
      featherShade: '#dfd5c0',
      wingTipDark: '#262320',
      beakFill: '#f2a530',
      pouchFill: '#e06b26',
      legFill: '#dc6e28',
      frameStroke: '#c93829',
      metalStroke: '#aeb6c2',
      tireStroke: '#1e1c1a',
      inkOutline: '#1a1714',
      lineScale: 0.95,
    });

    // Brass handlebar bell dome + spinning 4-point chrome spoke star-glints on both wheels!
    ctx.fillStyle = '#f3cf7a';
    ctx.strokeStyle = '#5c4214';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.arc(mainRig.stemTop.x + 4, mainRig.stemTop.y - 5, 5.2, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    const drawWheelGlint = (wh, phaseOff) => {
      const ga = baseWheel * 1.4 + phaseOff;
      const gx = wh.x + Math.cos(ga) * (wh.r * 0.62);
      const gy = wh.y + Math.sin(ga) * (wh.r * 0.62);
      ctx.save();
      ctx.translate(gx, gy);
      ctx.rotate(outroT * 9);
      ctx.fillStyle = 'rgba(255, 252, 238, 0.92)';
      ctx.beginPath();
      for (let k = 0; k < 8; k++) {
        const r = k % 2 === 0 ? 11.5 : 2.3;
        const a = (k * Math.PI) / 4;
        if (k === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
        else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };
    drawWheelGlint(mainRig.rearWheel, 0.4);
    drawWheelGlint(mainRig.frontWheel, 2.1);
  }
}

function drawAcousticBellRipples(ctx, outroT) {
  // Luminous Golden Concentric Acoustic Bell Ripples right as Pelican rockets past (8.90..9.86s)!
  if (outroT < 8.90 || outroT > 9.86) return;
  const bellAge = outroT - 8.90;
  const bellAlpha = Math.pow(Math.max(0, 1 - bellAge / 0.96), 1.2);
  const bx = 740;
  const by = 452;

  ctx.save();
  // Soft golden acoustic aura bloom
  const bloomR = 48 + bellAge * 165;
  const bgGlow = ctx.createRadialGradient(bx, by, 4, bx, by, bloomR);
  bgGlow.addColorStop(0.0, `rgba(255, 236, 162, ${(bellAlpha * 0.36).toFixed(3)})`);
  bgGlow.addColorStop(0.55, `rgba(255, 210, 108, ${(bellAlpha * 0.14).toFixed(3)})`);
  bgGlow.addColorStop(1.0, 'rgba(255, 210, 108, 0)');
  ctx.fillStyle = bgGlow;
  ctx.beginPath();
  ctx.arc(bx, by, bloomR, 0, Math.PI * 2);
  ctx.fill();

  // 3 instant + 1 trailing concentric harmonic sound-wave rings (visible right at 136.02s & 136.35s!)
  for (let r = 0; r < 4; r++) {
    const ringDelay = r < 3 ? 0 : 0.08;
    const rAge = bellAge - ringDelay;
    if (rAge < 0) continue;
    const rad = 16 + r * 16 + rAge * 138;
    const rAlpha = bellAlpha * (1 - r * 0.19);
    if (rAlpha <= 0.01) continue;

    ctx.strokeStyle =
      r === 0
        ? `rgba(255, 246, 202, ${(rAlpha * 0.96).toFixed(3)})`
        : `rgba(255, 216, 118, ${(rAlpha * 0.86).toFixed(3)})`;
    ctx.lineWidth = Math.max(1.2, (3.3 - r * 0.6) * (0.68 + 0.32 * bellAlpha));
    ctx.lineCap = 'round';

    const rot = r * 0.9 + bellAge * (r % 2 === 0 ? 1.15 : -0.95);
    ctx.beginPath();
    ctx.arc(bx, by, rad, rot + 0.10, rot + Math.PI * 1.38);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(bx, by, rad, rot + Math.PI * 1.50, rot + Math.PI * 1.96);
    ctx.stroke();
  }

  // Initial brass strike star-ping right at 136.00..136.24s
  if (bellAge < 0.24) {
    const pingA = 1 - bellAge / 0.24;
    ctx.fillStyle = `rgba(255, 250, 224, ${(pingA * 0.96).toFixed(3)})`;
    ctx.beginPath();
    for (let k = 0; k < 8; k++) {
      const rr = k % 2 === 0 ? 24 * pingA + 7 : 3.8 * pingA;
      const a = (k * Math.PI) / 4;
      if (k === 0) ctx.moveTo(bx + Math.cos(a) * rr, by + Math.sin(a) * rr);
      else ctx.lineTo(bx + Math.cos(a) * rr, by + Math.sin(a) * rr);
    }
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawVelvetPleatStrip(ctx, x0, pw, y0, y1, swayBot, idx) {
  const xm = x0 + pw * 0.5;
  const g = ctx.createLinearGradient(x0, 0, x0 + pw, 0);
  g.addColorStop(0.0, '#060b14');
  g.addColorStop(0.22, '#101d32');
  g.addColorStop(0.50, idx % 2 === 0 ? '#243a5c' : '#1d304e');
  g.addColorStop(0.68, '#2f4b73');
  g.addColorStop(0.88, '#0f1a2d');
  g.addColorStop(1.0, '#050911');

  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x0 + pw + 0.8, y0);
  ctx.quadraticCurveTo(x0 + pw + swayBot * 0.45, (y0 + y1) * 0.55, x0 + pw + swayBot + 0.8, y1);
  ctx.quadraticCurveTo(xm + swayBot, y1 + 5, x0 + swayBot, y1);
  ctx.quadraticCurveTo(x0 + swayBot * 0.45, (y0 + y1) * 0.55, x0, y0);
  ctx.closePath();
  ctx.fill();

  // Woven velvet nap highlight thread along pleat ridge
  ctx.strokeStyle = 'rgba(136, 174, 224, 0.12)';
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(x0 + pw * 0.62, y0);
  ctx.quadraticCurveTo(x0 + pw * 0.62 + swayBot * 0.45, (y0 + y1) * 0.55, x0 + pw * 0.62 + swayBot, y1 - 2);
  ctx.stroke();
}

function drawMidnightVelvetCurtains(ctx, outroT) {
  // 1. Left & Right full-height midnight-navy velvet stage wing curtains (x = 0..124, x = 876..1000)
  const wingPleats = 4;
  const wingW = 124 / wingPleats;
  for (let i = 0; i < wingPleats; i++) {
    const lx = i * wingW;
    const lSway = computeCurtainFlutter((lx + wingW) / 1000, outroT) * (0.45 + 0.2 * i);
    drawVelvetPleatStrip(ctx, lx, wingW, 0, 634, lSway, i);

    const rx = 876 + i * wingW;
    const rSway = computeCurtainFlutter(rx / 1000, outroT) * (1.05 - 0.18 * i);
    drawVelvetPleatStrip(ctx, rx, wingW, 0, 634, rSway, i + 1);
  }

  // Subtle woven horizontal damask nap lines on wing curtains
  ctx.strokeStyle = 'rgba(205, 225, 255, 0.028)';
  ctx.lineWidth = 1;
  for (let y = 18; y < 626; y += 9) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(124, y);
    ctx.moveTo(876, y);
    ctx.lineTo(1000, y);
    ctx.stroke();
  }

  // Gold cord tie-back / inner trim along wing curtain edges
  const drawWingEdgeTrim = (edgeX, sway) => {
    ctx.strokeStyle = '#b9934c';
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(edgeX, 314);
    ctx.quadraticCurveTo(edgeX + sway * 0.45, 474, edgeX + sway, 632);
    ctx.stroke();
  };
  drawWingEdgeTrim(124, computeCurtainFlutter(0.12, outroT) * 1.05);
  drawWingEdgeTrim(876, computeCurtainFlutter(0.88, outroT) * 1.05);

  // 2. Upper Pleated Midnight-Navy Velvet Valance (y = 0..318 across x = 0..1000)
  const valPleats = 20;
  const vpW = 1000 / valPleats;
  // Drop shadow cast by upper velvet valance onto rear corridor wall
  const valSh = ctx.createLinearGradient(0, 312, 0, 336);
  valSh.addColorStop(0, 'rgba(4, 6, 11, 0.78)');
  valSh.addColorStop(1, 'rgba(4, 6, 11, 0)');
  ctx.fillStyle = valSh;
  ctx.fillRect(0, 312, 1000, 24);

  for (let i = 0; i < valPleats; i++) {
    const vx = i * vpW;
    const sway = computeCurtainFlutter((vx + vpW * 0.5) / 1000, outroT) * 0.42;
    drawVelvetPleatStrip(ctx, vx, vpW, 0, 315, sway, i);
  }

  // Woven horizontal velvet micro-grain across upper valance
  ctx.strokeStyle = 'rgba(210, 228, 255, 0.025)';
  ctx.lineWidth = 1;
  for (let y = 12; y < 310; y += 8) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1000, y);
    ctx.stroke();
  }

  // Braided antique-gold bullion ribbon & fringe along lower valance hem (y = 312..323)
  ctx.strokeStyle = '#cda65a';
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  for (let i = 0; i <= 40; i++) {
    const ux = (i / 40) * 1000;
    const sway = computeCurtainFlutter(i / 40, outroT) * 0.42;
    const uy = 314 + Math.sin(i * Math.PI * 0.5) * 1.8;
    if (i === 0) ctx.moveTo(ux + sway, uy);
    else ctx.lineTo(ux + sway, uy);
  }
  ctx.stroke();

  ctx.strokeStyle = 'rgba(218, 178, 98, 0.62)';
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  for (let x = 6; x < 996; x += 8) {
    const sway = computeCurtainFlutter(x / 1000, outroT) * 0.48;
    ctx.moveTo(x + sway * 0.7, 315);
    ctx.lineTo(x + sway, 322);
  }
  ctx.stroke();
}

function drawEmptyExecutiveArmchair(ctx, flashInfo) {
  const cx = 500;
  const fStr = flashInfo.strength;
  const fDir = (flashInfo.originX - cx) / 420; // -1 (left flash) .. +1 (right flash)

  // 1. Curved Mahogany Padded Armrests (drawn slightly behind/flanking main seat & table)
  const drawArmrest = (side) => {
    // side = -1 (left) or +1 (right)
    const xInner = cx + side * 120;
    const xOuter = cx + side * 154;

    // Front vertical curved mahogany support post
    ctx.strokeStyle = '#2d150e';
    ctx.lineWidth = 13;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(xOuter - side * 4, 526);
    ctx.quadraticCurveTo(xOuter + side * 5, 578, xOuter - side * 8, 632);
    ctx.stroke();

    ctx.strokeStyle = side * fDir > 0 && fStr > 0.04 ? `rgba(235, 220, 208, ${0.22 + fStr * 0.45})` : '#693725';
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(xOuter - side * 2, 528);
    ctx.quadraticCurveTo(xOuter + side * 6, 578, xOuter - side * 6, 630);
    ctx.stroke();

    // Sculpted mahogany arm rail + oxblood leather arm pad
    ctx.fillStyle = '#3d1d14';
    ctx.strokeStyle = '#6c3825';
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(xInner, 504);
    ctx.quadraticCurveTo((xInner + xOuter) * 0.5, 500, xOuter + side * 3, 522);
    ctx.lineTo(xOuter - side * 3, 535);
    ctx.quadraticCurveTo((xInner + xOuter) * 0.5, 518, xInner, 522);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Padded oxblood leather top cap
    ctx.fillStyle = '#4e201b';
    ctx.beginPath();
    ctx.moveTo(xInner + side * 2, 503);
    ctx.quadraticCurveTo((xInner + xOuter) * 0.5, 495, xOuter, 517);
    ctx.lineTo(xOuter - side * 4, 523);
    ctx.quadraticCurveTo((xInner + xOuter) * 0.5, 505, xInner + side * 2, 510);
    ctx.closePath();
    ctx.fill();
  };
  drawArmrest(-1);
  drawArmrest(1);

  // 2. Sculpted Dark Mahogany Outer Backrest Frame (cx=500, w=252 -> x=374..626, y=304..628)
  const fx0 = 374;
  const fx1 = 626;
  const fy0 = 306;
  const fy1 = 628;

  const woodG = ctx.createLinearGradient(fx0, fy0, fx1, fy1);
  woodG.addColorStop(0.0, '#2c150e');
  woodG.addColorStop(0.24, '#562b1d');
  woodG.addColorStop(0.50, '#683624');
  woodG.addColorStop(0.78, '#462217');
  woodG.addColorStop(1.0, '#24100b');

  ctx.fillStyle = woodG;
  ctx.beginPath();
  ctx.moveTo(fx0 + 18, fy0 + 14);
  // Graceful arched Chippendale/executive crest rail
  ctx.bezierCurveTo(fx0 + 70, fy0 - 8, fx1 - 70, fy0 - 8, fx1 - 18, fy0 + 14);
  ctx.quadraticCurveTo(fx1 + 4, fy0 + 18, fx1, fy0 + 38);
  ctx.lineTo(fx1 - 4, fy1);
  ctx.lineTo(fx0 + 4, fy1);
  ctx.lineTo(fx0, fy0 + 38);
  ctx.quadraticCurveTo(fx0 - 4, fy0 + 18, fx0 + 18, fy0 + 14);
  ctx.closePath();
  ctx.fill();

  // Warm wood-bevel specular highlight + directional xenon camera flash rim!
  ctx.strokeStyle = '#7e442f';
  ctx.lineWidth = 2.4;
  ctx.stroke();

  if (fStr > 0.02) {
    ctx.save();
    ctx.strokeStyle = `rgba(242, 248, 255, ${(0.28 + fStr * 0.66).toFixed(3)})`;
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    if (fDir <= 0.15) {
      ctx.moveTo(fx0 + 2, fy1 - 20);
      ctx.lineTo(fx0, fy0 + 38);
      ctx.quadraticCurveTo(fx0 - 3, fy0 + 18, fx0 + 18, fy0 + 14);
    }
    ctx.moveTo(fx0 + 18, fy0 + 14);
    ctx.bezierCurveTo(fx0 + 70, fy0 - 8, fx1 - 70, fy0 - 8, fx1 - 18, fy0 + 14);
    if (fDir >= -0.15) {
      ctx.quadraticCurveTo(fx1 + 3, fy0 + 18, fx1, fy0 + 38);
      ctx.lineTo(fx1 - 2, fy1 - 20);
    }
    ctx.stroke();
    ctx.restore();
  }

  // Carved mahogany crest-medallion bevel line at top center
  ctx.strokeStyle = 'rgba(235, 184, 138, 0.25)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(cx - 64, fy0 + 13);
  ctx.quadraticCurveTo(cx, fy0 + 3, cx + 64, fy0 + 13);
  ctx.stroke();

  // 3. Deep Diamond-Tufted Oxblood Leather Backrest Cushion (VISIBLY EMPTY!)
  const lx0 = 394;
  const lx1 = 606;
  const ly0 = 328;
  const ly1 = 580;

  const leathG = ctx.createRadialGradient(
    cx + fDir * 28,
    438,
    18,
    cx,
    458,
    158
  );
  leathG.addColorStop(0.0, fStr > 0.05 ? '#6e2e27' : '#52211b');
  leathG.addColorStop(0.55, '#381511');
  leathG.addColorStop(1.0, '#1d0a08');

  ctx.save();
  ctx.fillStyle = leathG;
  ctx.beginPath();
  ctx.moveTo(lx0 + 12, ly0 + 10);
  ctx.bezierCurveTo(lx0 + 55, ly0 - 4, lx1 - 55, ly0 - 4, lx1 - 12, ly0 + 10);
  ctx.quadraticCurveTo(lx1, ly0 + 14, lx1, ly0 + 28);
  ctx.lineTo(lx1 - 3, ly1);
  ctx.lineTo(lx0 + 3, ly1);
  ctx.lineTo(lx0, ly0 + 28);
  ctx.quadraticCurveTo(lx0, ly0 + 14, lx0 + 12, ly0 + 10);
  ctx.closePath();
  ctx.fill();
  ctx.clip();

  // Chesterfield diamond-tufting diagonal creases + upper leather puff highlights + sunken buttons
  const colsT = [432, 477, 523, 568];
  const rowsT = [368, 418, 468, 518, 564];
  const dxD = 22.5;
  const dyD = 25;

  for (let r = 0; r < rowsT.length; r++) {
    const ry = rowsT[r];
    const rowOff = (r % 2) * dxD;
    for (let c = -1; c < colsT.length; c++) {
      const bx = colsT[0] + c * (dxD * 2) + rowOff;
      if (bx < lx0 - 18 || bx > lx1 + 18) continue;

      // Soft upper leather pillow highlight inside diamond cell
      ctx.strokeStyle = `rgba(168, 86, 72, ${(0.18 + fStr * 0.16).toFixed(3)})`;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(bx - dxD + 3, ry + 1.5);
      ctx.lineTo(bx, ry - dyD + 3.5);
      ctx.lineTo(bx + dxD - 3, ry + 1.5);
      ctx.stroke();

      // Deep sunken leather crease diagonals
      ctx.strokeStyle = 'rgba(14, 4, 3, 0.72)';
      ctx.lineWidth = 1.7;
      ctx.beginPath();
      ctx.moveTo(bx - dxD, ry);
      ctx.lineTo(bx, ry - dyD);
      ctx.lineTo(bx + dxD, ry);
      ctx.lineTo(bx, ry + dyD);
      ctx.closePath();
      ctx.stroke();

      // Sunken leather-covered tuft button at vertex
      if (bx > lx0 + 10 && bx < lx1 - 10 && ry > ly0 + 14 && ry < ly1 - 10) {
        ctx.fillStyle = '#120504';
        ctx.beginPath();
        ctx.arc(bx, ry, 4.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#5c2620';
        ctx.beginPath();
        ctx.arc(bx - 0.8, ry - 0.9, 2.3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  ctx.restore();

  // Inner rabbet shadow around leather panel
  ctx.strokeStyle = 'rgba(12, 4, 3, 0.85)';
  ctx.lineWidth = 2.2;
  ctx.strokeRect(lx0 + 2, ly0 + 12, lx1 - lx0 - 4, ly1 - ly0 - 12);

  // 4. Burnished Brass Nailhead Studs along leather-mahogany perimeter trim!
  const drawBrassStud = (sx, sy) => {
    ctx.fillStyle = 'rgba(10, 4, 3, 0.75)';
    ctx.beginPath();
    ctx.arc(sx + 0.7, sy + 0.9, 2.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = fStr > 0.05 ? '#fff0c2' : '#d8b062';
    ctx.beginPath();
    ctx.arc(sx, sy, 2.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#7a5922';
    ctx.beginPath();
    ctx.arc(sx + 0.6, sy + 0.6, 1.0, 0, Math.PI * 2);
    ctx.fill();
  };
  for (let y = ly0 + 26; y <= ly1 - 8; y += 16) {
    drawBrassStud(lx0 + 4.5, y);
    drawBrassStud(lx1 - 4.5, y);
  }
  for (let i = 0; i <= 11; i++) {
    const u = i / 11;
    const sx = lerp(lx0 + 12, lx1 - 12, u);
    const sy = ly0 + 11 - Math.sin(u * Math.PI) * 8.5;
    drawBrassStud(sx, sy);
  }

  // 5. Visibly Empty Ergonomic Oxblood Seat Cushion with subtle unoccupied center hollow (y = 574..630)
  const seatG = ctx.createLinearGradient(0, 574, 0, 630);
  seatG.addColorStop(0.0, fStr > 0.05 ? '#662b24' : '#4b1e19');
  seatG.addColorStop(0.38, '#351410');
  seatG.addColorStop(1.0, '#190807');
  ctx.fillStyle = seatG;
  ctx.beginPath();
  ctx.moveTo(384, 582);
  ctx.bezierCurveTo(435, 573, 468, 579, 500, 579);
  ctx.bezierCurveTo(532, 579, 565, 573, 616, 582);
  ctx.lineTo(622, 630);
  ctx.lineTo(378, 630);
  ctx.closePath();
  ctx.fill();

  // Rolled leather front welt piping catching corridor/flash specular sheen
  ctx.strokeStyle = fStr > 0.05 ? `rgba(255, 224, 214, ${0.35 + fStr * 0.45})` : 'rgba(156, 78, 66, 0.42)';
  ctx.lineWidth = 2.1;
  ctx.beginPath();
  ctx.moveTo(386, 583);
  ctx.bezierCurveTo(435, 575, 468, 580, 500, 580);
  ctx.bezierCurveTo(532, 580, 565, 575, 614, 583);
  ctx.stroke();
}

function drawConferenceTableAndRefreshments(ctx, outroT, flashInfo) {
  const fStr = flashInfo.strength;

  // 1. Pleated Royal-Slate Damask Tablecloth (y = 666..1000, x = 36..964)
  const clothX0 = 36;
  const clothW = 928;
  const clothY0 = 666;
  const numBoxPleats = 12;
  const bpW = clothW / numBoxPleats;

  for (let i = 0; i < numBoxPleats; i++) {
    const px = clothX0 + i * bpW;
    const pg = ctx.createLinearGradient(px, clothY0, px + bpW, 1000);
    pg.addColorStop(0.0, i % 2 === 0 ? '#192d44' : '#15263a');
    pg.addColorStop(0.55, '#101d2d');
    pg.addColorStop(1.0, '#08101a');
    ctx.fillStyle = pg;
    ctx.fillRect(px, clothY0, bpW + 0.8, 1000 - clothY0);

    // Subtle vertical box-pleat crease & highlight
    ctx.strokeStyle = 'rgba(4, 8, 14, 0.52)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(px, clothY0);
    ctx.lineTo(px, 1000);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(135, 175, 220, 0.07)';
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.moveTo(px + 2.2, clothY0);
    ctx.lineTo(px + 2.2, 1000);
    ctx.stroke();
  }

  // Woven antique-gold & slate damask trim band across upper tablecloth (y = 680..694)
  ctx.fillStyle = 'rgba(198, 160, 88, 0.16)';
  ctx.fillRect(clothX0, 680, clothW, 14);
  ctx.strokeStyle = 'rgba(218, 180, 106, 0.45)';
  ctx.lineWidth = 1.0;
  ctx.beginPath();
  ctx.moveTo(clothX0, 680.5);
  ctx.lineTo(clothX0 + clothW, 680.5);
  ctx.moveTo(clothX0, 693.5);
  ctx.lineTo(clothX0 + clothW, 693.5);
  // Geometric diamond-fret damask motif
  for (let dx = clothX0 + 14; dx < clothX0 + clothW - 10; dx += 22) {
    ctx.moveTo(dx - 6, 687);
    ctx.lineTo(dx, 682.5);
    ctx.lineTo(dx + 6, 687);
    ctx.lineTo(dx, 691.5);
    ctx.closePath();
  }
  ctx.stroke();

  // Overhang drop shadow cast by walnut bullnose onto tablecloth
  const overSh = ctx.createLinearGradient(0, 666, 0, 686);
  overSh.addColorStop(0, 'rgba(3, 5, 9, 0.82)');
  overSh.addColorStop(1, 'rgba(3, 5, 9, 0)');
  ctx.fillStyle = overSh;
  ctx.fillRect(clothX0, 666, clothW, 20);

  // 2. Rich American Walnut Bullnose Tabletop (x = 20..980, top plane y = 624..647, front bullnose y = 647..667)
  const topPlaneG = ctx.createLinearGradient(0, 624, 0, 648);
  topPlaneG.addColorStop(0.0, '#3a2214');
  topPlaneG.addColorStop(0.65, '#54331e');
  topPlaneG.addColorStop(1.0, '#684127');
  ctx.fillStyle = topPlaneG;
  ctx.beginPath();
  ctx.moveTo(38, 624);
  ctx.lineTo(962, 624);
  ctx.lineTo(980, 648);
  ctx.lineTo(20, 648);
  ctx.closePath();
  ctx.fill();

  // Subtle horizontal walnut wood-grain cathedrals on polished tabletop
  ctx.strokeStyle = 'rgba(26, 14, 7, 0.28)';
  ctx.lineWidth = 1.0;
  for (let g = 0; g < 7; g++) {
    const gy = 627 + g * 2.9;
    ctx.beginPath();
    ctx.moveTo(45 + g * 12, gy);
    ctx.bezierCurveTo(320, gy + (g % 2 === 0 ? 1.4 : -1.2), 680, gy - 1.3, 955 - g * 10, gy);
    ctx.stroke();
  }

  // Rounded 3D bullnose front edge molding (y = 647..667)
  const noseG = ctx.createLinearGradient(0, 647, 0, 667);
  noseG.addColorStop(0.0, fStr > 0.04 ? '#a8744c' : '#855534');
  noseG.addColorStop(0.28, '#5f3a22');
  noseG.addColorStop(0.72, '#3c2313');
  noseG.addColorStop(1.0, '#211209');
  ctx.fillStyle = noseG;
  ctx.beginPath();
  ctx.roundRect(18, 647, 964, 20, 5);
  ctx.fill();

  // Crisp specular horizon line along the walnut bullnose ridge
  ctx.strokeStyle = fStr > 0.03 ? `rgba(255, 240, 222, ${(0.32 + fStr * 0.55).toFixed(3)})` : 'rgba(218, 166, 122, 0.34)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(24, 648.2);
  ctx.lineTo(976, 648.2);
  ctx.stroke();

  // 3. Untouched Crystal Water Carafe & Glass Tumbler on Coaster (x = 768..868, deadpan guest refreshments!)
  const trayCx = 814;
  const trayCy = 638;
  const waterTremor =
    outroT >= 8.86 && outroT <= 9.48
      ? Math.sin((outroT - 8.86) * 34) * Math.exp(-(outroT - 8.86) * 4.5) * 1.1
      : 0;

  // Soft reflection on polished walnut surface
  ctx.fillStyle = 'rgba(210, 234, 255, 0.08)';
  ctx.beginPath();
  ctx.ellipse(trayCx, trayCy + 6, 52, 5.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Brushed-brass & dark-leather coaster tray
  ctx.fillStyle = '#181412';
  ctx.strokeStyle = '#b6914c';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.ellipse(trayCx, trayCy, 52, 7.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // (a) Small Hourglass Crystal Glass Carafe (cx = 838, y = 546..636)
  const cxC = 838;
  ctx.save();
  // Still water volume inside lower bulb of carafe
  const wGradC = ctx.createLinearGradient(cxC - 18, 588, cxC + 18, 634);
  wGradC.addColorStop(0, 'rgba(186, 226, 252, 0.30)');
  wGradC.addColorStop(0.5, 'rgba(130, 188, 230, 0.18)');
  wGradC.addColorStop(1, 'rgba(215, 240, 255, 0.36)');
  ctx.fillStyle = wGradC;
  ctx.beginPath();
  ctx.moveTo(cxC - 13, 590 + waterTremor * 0.5);
  ctx.quadraticCurveTo(cxC - 20, 616, cxC - 15, 633);
  ctx.quadraticCurveTo(cxC, 637, cxC + 15, 633);
  ctx.quadraticCurveTo(cxC + 20, 616, cxC + 13, 590 - waterTremor * 0.5);
  ctx.closePath();
  ctx.fill();

  // Elliptical untouched water meniscus in carafe
  ctx.strokeStyle = 'rgba(232, 248, 255, 0.72)';
  ctx.fillStyle = 'rgba(205, 236, 255, 0.24)';
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.ellipse(cxC, 590, 13, 3.2, waterTremor * 0.03, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Crystal carafe outer silhouette, waist & flared pouring lip
  ctx.fillStyle = 'rgba(230, 244, 255, 0.08)';
  ctx.strokeStyle = `rgba(226, 242, 255, ${(0.58 + fStr * 0.36).toFixed(3)})`;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cxC - 12, 548);
  ctx.quadraticCurveTo(cxC - 8, 568, cxC - 13, 590);
  ctx.quadraticCurveTo(cxC - 21, 616, cxC - 16, 634);
  ctx.quadraticCurveTo(cxC, 639, cxC + 16, 634);
  ctx.quadraticCurveTo(cxC + 21, 616, cxC + 13, 590);
  ctx.quadraticCurveTo(cxC + 8, 568, cxC + 13, 546);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Carafe top glass rim & vertical specular caustic highlight
  ctx.beginPath();
  ctx.ellipse(cxC + 0.5, 547, 12.5, 2.8, -0.06, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = `rgba(255, 255, 255, ${(0.68 + fStr * 0.32).toFixed(3)})`;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(cxC - 8.5, 554);
  ctx.quadraticCurveTo(cxC - 6, 572, cxC - 14.5, 618);
  ctx.stroke();
  ctx.restore();

  // (b) Untouched Faceted Crystal Water Tumbler (cx = 786, y = 586..638)
  const gxT = 786;
  ctx.save();
  // Heavy crystal sham base refraction
  ctx.fillStyle = 'rgba(225, 244, 255, 0.34)';
  ctx.beginPath();
  ctx.roundRect(gxT - 12.5, 629, 25, 8.5, 2);
  ctx.fill();

  // Untouched water body inside tumbler
  ctx.fillStyle = 'rgba(182, 224, 252, 0.26)';
  ctx.beginPath();
  ctx.moveTo(gxT - 13.2, 603 - waterTremor * 0.5);
  ctx.lineTo(gxT - 12.2, 630);
  ctx.lineTo(gxT + 12.2, 630);
  ctx.lineTo(gxT + 13.2, 603 + waterTremor * 0.5);
  ctx.closePath();
  ctx.fill();

  // Water meniscus ellipse
  ctx.strokeStyle = 'rgba(236, 249, 255, 0.76)';
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.ellipse(gxT, 603, 13.2, 2.8, -waterTremor * 0.03, 0, Math.PI * 2);
  ctx.stroke();

  // Tumbler outer crystal walls & top rim
  ctx.strokeStyle = `rgba(228, 244, 255, ${(0.62 + fStr * 0.34).toFixed(3)})`;
  ctx.lineWidth = 1.45;
  ctx.beginPath();
  ctx.moveTo(gxT - 14.5, 587);
  ctx.lineTo(gxT - 12.5, 636);
  ctx.quadraticCurveTo(gxT, 639.5, gxT + 12.5, 636);
  ctx.lineTo(gxT + 14.5, 587);
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(gxT, 587, 14.5, 3.0, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Crisp vertical glass specular streak
  ctx.strokeStyle = `rgba(255, 255, 255, ${(0.72 + fStr * 0.28).toFixed(3)})`;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(gxT - 9.8, 592);
  ctx.lineTo(gxT - 8.6, 632);
  ctx.stroke();
  ctx.restore();
}

function drawPorousFoamCapsule(ctx, rx, ry, cLit, cMid, cDark, fStr) {
  const fg = ctx.createRadialGradient(-rx * 0.32, -ry * 0.32, rx * 0.12, 0, 0, Math.max(rx, ry) * 1.08);
  fg.addColorStop(0.0, cLit);
  fg.addColorStop(0.55, cMid);
  fg.addColorStop(1.0, cDark);
  ctx.fillStyle = fg;
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();

  // Subtle open-cell acoustic foam pore stippling (strictly zero letters/logos!)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.24)';
  const pores = [
    [-0.35, -0.42], [0.18, -0.52], [-0.52, -0.05], [0.02, -0.14], [0.42, -0.18],
    [-0.28, 0.26], [0.24, 0.22], [-0.05, 0.52], [0.46, 0.30], [-0.46, 0.34],
  ];
  for (const [px, py] of pores) {
    ctx.beginPath();
    ctx.arc(px * rx, py * ry, 1.05, 0, Math.PI * 2);
    ctx.fill();
  }

  // Rim highlight from overhead/camera flash
  ctx.strokeStyle = fStr > 0.03 ? `rgba(245, 250, 255, ${(0.25 + fStr * 0.48).toFixed(3)})` : 'rgba(255, 255, 255, 0.14)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.ellipse(0, 0, rx - 0.6, ry - 0.6, 0, -Math.PI * 0.88, -Math.PI * 0.12);
  ctx.stroke();
}

function drawBroadcastMicrophones(ctx, flashInfo) {
  const fStr = flashInfo.strength;

  const mics = [
    { baseX: 176, baseY: 639, tipX: 244, tipY: 530, tilt: 0.46, kind: 'ochre_boom' },
    { baseX: 266, baseY: 636, tipX: 322, tipY: 500, tilt: 0.36, kind: 'chrome_dynamic' },
    { baseX: 356, baseY: 638, tipX: 396, tipY: 486, tilt: 0.24, kind: 'crimson_foam' },
    { baseX: 452, baseY: 635, tipX: 468, tipY: 494, tilt: 0.10, kind: 'shotgun_shock' },
    { baseX: 548, baseY: 635, tipX: 530, tipY: 482, tilt: -0.11, kind: 'brass_vintage' },
    { baseX: 638, baseY: 638, tipX: 600, tipY: 498, tilt: -0.25, kind: 'cobalt_coiled' },
    { baseX: 720, baseY: 640, tipX: 668, tipY: 528, tilt: -0.40, kind: 'charcoal_ball' },
  ];

  // Trailing matte-black XLR audio cables routed across back edge of walnut table
  ctx.strokeStyle = '#15181d';
  ctx.lineWidth = 2.6;
  ctx.lineCap = 'round';
  for (const m of mics) {
    ctx.beginPath();
    ctx.moveTo(m.baseX, m.baseY - 1);
    ctx.quadraticCurveTo(m.baseX + (m.baseX < 500 ? -18 : 18), 627, m.baseX + (m.baseX < 500 ? -32 : 32), 624.5);
    ctx.stroke();
  }

  for (const m of mics) {
    // Subtle reflection of stand base on polished walnut tabletop
    ctx.fillStyle = 'rgba(12, 8, 5, 0.38)';
    ctx.beginPath();
    ctx.ellipse(m.baseX, m.baseY + 4.5, 23, 5.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Weighted cast-iron / anodized broadcast stand base
    const baseG = ctx.createLinearGradient(m.baseX - 24, m.baseY - 4, m.baseX + 24, m.baseY + 4);
    baseG.addColorStop(0.0, '#121418');
    baseG.addColorStop(0.38, m.kind === 'brass_vintage' ? '#8c6d34' : '#383e47');
    baseG.addColorStop(0.68, '#1d2026');
    baseG.addColorStop(1.0, '#0d0f12');
    ctx.fillStyle = baseG;
    ctx.beginPath();
    ctx.ellipse(m.baseX, m.baseY, 23, 6.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(215, 226, 240, 0.22)';
    ctx.lineWidth = 0.9;
    ctx.stroke();

    // Stem / Boom / Gooseneck hardware
    if (m.kind === 'ochre_boom') {
      // Short vertical riser + knurled brass clutch + angled boom tube
      const jointX = m.baseX + 6;
      const jointY = m.baseY - 54;
      ctx.strokeStyle = '#6c7582';
      ctx.lineWidth = 4.6;
      ctx.beginPath();
      ctx.moveTo(m.baseX, m.baseY - 2);
      ctx.lineTo(jointX, jointY);
      ctx.lineTo(m.tipX, m.tipY);
      ctx.stroke();

      ctx.fillStyle = '#cfa44e';
      ctx.strokeStyle = '#3b2b10';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(jointX, jointY, 5.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else {
      const ctrlX = lerp(m.baseX, m.tipX, 0.18);
      const ctrlY = m.tipY + 46;
      // Shadow pass
      ctx.strokeStyle = '#242830';
      ctx.lineWidth = 5.4;
      ctx.beginPath();
      ctx.moveTo(m.baseX, m.baseY - 2);
      ctx.quadraticCurveTo(ctrlX, ctrlY, m.tipX, m.tipY);
      ctx.stroke();
      // Metallic gooseneck sheen
      ctx.strokeStyle = m.kind === 'brass_vintage' ? '#caa55c' : '#9aa4b2';
      ctx.lineWidth = 2.1;
      ctx.beginPath();
      ctx.moveTo(m.baseX - 0.8, m.baseY - 2);
      ctx.quadraticCurveTo(ctrlX - 0.8, ctrlY, m.tipX - 0.8, m.tipY);
      ctx.stroke();

      // Coiled XLR cable spiraling around stem on #6 (`cobalt_coiled`)
      if (m.kind === 'cobalt_coiled') {
        ctx.strokeStyle = '#111317';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        for (let s = 0; s <= 28; s++) {
          const u = s / 28;
          const mu = 1 - u;
          const bx = mu * mu * m.baseX + 2 * mu * u * ctrlX + u * u * m.tipX;
          const by = mu * mu * (m.baseY - 4) + 2 * mu * u * ctrlY + u * u * (m.tipY + 18);
          const ox = Math.sin(u * Math.PI * 7) * 5.5;
          if (s === 0) ctx.moveTo(bx + ox, by);
          else ctx.lineTo(bx + ox, by);
        }
        ctx.stroke();
      }
    }

    // Capsule & XLR Collar in local rotated mic head coordinates
    ctx.save();
    ctx.translate(m.tipX, m.tipY);
    ctx.rotate(m.tilt);

    // Machined XLR collar sleeve below capsule
    ctx.fillStyle = '#5c6470';
    ctx.strokeStyle = '#1d2026';
    ctx.lineWidth = 1.1;
    ctx.fillRect(-4.5, 12, 9, 13);
    ctx.strokeRect(-4.5, 12, 9, 13);

    if (m.kind === 'ochre_boom') {
      drawPorousFoamCapsule(ctx, 16.5, 23, '#f0bf59', '#c78e28', '#6e4b0e', fStr);
    } else if (m.kind === 'chrome_dynamic') {
      // Tapered dark-slate dynamic mic handle + woven chrome wire-mesh sphere
      ctx.fillStyle = '#2d333d';
      ctx.beginPath();
      ctx.moveTo(-8.5, 2);
      ctx.lineTo(8.5, 2);
      ctx.lineTo(5.2, 18);
      ctx.lineTo(-5.2, 18);
      ctx.closePath();
      ctx.fill();

      const cg = ctx.createRadialGradient(-5, -9, 2, 0, -5, 16);
      cg.addColorStop(0.0, '#ffffff');
      cg.addColorStop(0.45, '#aeb8c4');
      cg.addColorStop(1.0, '#3a414a');
      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.arc(0, -6, 14.5, 0, Math.PI * 2);
      ctx.fill();

      // Wire-mesh crosshatch lines + chrome equator collar
      ctx.strokeStyle = 'rgba(28, 34, 42, 0.45)';
      ctx.lineWidth = 0.9;
      for (let k = -9; k <= 9; k += 4.5) {
        ctx.beginPath();
        ctx.moveTo(k, -18);
        ctx.lineTo(k, 6);
        ctx.moveTo(-12, -6 + k * 0.8);
        ctx.lineTo(12, -6 + k * 0.8);
        ctx.stroke();
      }
      ctx.fillStyle = '#dfe6f0';
      ctx.fillRect(-14.8, -7.4, 29.6, 3.0);
    } else if (m.kind === 'crimson_foam') {
      drawPorousFoamCapsule(ctx, 15.5, 22.5, '#cf404c', '#8f2029', '#450c11', fStr);
    } else if (m.kind === 'shotgun_shock') {
      // Dual-ring spider shock-mount + slotted satin-titanium shotgun condenser tube
      ctx.strokeStyle = '#181a1f';
      ctx.lineWidth = 2.2;
      ctx.strokeRect(-11, -8, 22, 22);
      ctx.strokeStyle = '#9aa4b2';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(-11, -8);
      ctx.lineTo(-5.5, -3);
      ctx.moveTo(11, -8);
      ctx.lineTo(5.5, -3);
      ctx.moveTo(-11, 14);
      ctx.lineTo(-5.5, 9);
      ctx.moveTo(11, 14);
      ctx.lineTo(5.5, 9);
      ctx.stroke();

      const sg = ctx.createLinearGradient(-6, 0, 6, 0);
      sg.addColorStop(0, '#414852');
      sg.addColorStop(0.45, '#cfd8e3');
      sg.addColorStop(1, '#2b3038');
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.roundRect(-5.8, -28, 11.6, 46, 4);
      ctx.fill();
      // Interference acoustic side-slots
      ctx.strokeStyle = '#1b1f24';
      ctx.lineWidth = 1.2;
      for (let sy = -21; sy <= 4; sy += 4.5) {
        ctx.beginPath();
        ctx.moveTo(-3.2, sy);
        ctx.lineTo(3.2, sy);
        ctx.stroke();
      }
    } else if (m.kind === 'brass_vintage') {
      // Vintage brushed-brass pill-shaped louvered ribbon reporter mic
      const bg = ctx.createLinearGradient(-13, -18, 13, 12);
      bg.addColorStop(0.0, '#fff0be');
      bg.addColorStop(0.45, '#cfa44c');
      bg.addColorStop(1.0, '#594014');
      ctx.fillStyle = bg;
      ctx.strokeStyle = '#3d2b0c';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.roundRect(-12.5, -21, 25, 34, 11);
      ctx.fill();
      ctx.stroke();

      // Horizontal acoustic louver slots + vertical center rib
      ctx.strokeStyle = '#2b1e08';
      ctx.lineWidth = 1.3;
      for (let ly = -14; ly <= 6; ly += 4.2) {
        ctx.beginPath();
        ctx.moveTo(-8.5, ly);
        ctx.lineTo(8.5, ly);
        ctx.stroke();
      }
      ctx.strokeStyle = '#f7df9c';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(0, -20);
      ctx.lineTo(0, 12);
      ctx.stroke();
    } else if (m.kind === 'cobalt_coiled') {
      drawPorousFoamCapsule(ctx, 16, 22, '#4d7cb3', '#29496e', '#132438', fStr);
    } else {
      drawPorousFoamCapsule(ctx, 16.5, 19.5, '#505763', '#2a2e36', '#121418', fStr);
    }

    ctx.restore();
  }
}

function drawTentCardNameplate(ctx, outroT, flashInfo) {
  const cx = 500;
  const fStr = flashInfo.strength;

  // Slipstream paper-card micro-tremble as pelican blasts past in rear corridor (8.86..9.52s)
  let dxTremble = 0;
  let rotTremble = 0;
  if (outroT >= 8.86 && outroT <= 9.52) {
    const dt = outroT - 8.86;
    const env = Math.sin(Math.min(1, dt / 0.08) * (Math.PI * 0.5)) * Math.exp(-dt * 5.2);
    dxTremble = env * Math.cos(dt * 38) * 3.2 + env * 1.8;
    rotTremble = env * Math.sin(dt * 42) * 0.012;
  }

  const cardW = 436;
  const cardH = 126;
  const cardX = cx - cardW * 0.5;
  const cardY = 640;

  ctx.save();
  ctx.translate(cx + dxTremble, cardY + cardH * 0.5);
  ctx.rotate(rotTremble);
  ctx.translate(-cx, -(cardY + cardH * 0.5));

  // Soft reflection on polished walnut bullnose top + overhang shadow onto tablecloth
  ctx.fillStyle = 'rgba(248, 240, 224, 0.10)';
  ctx.fillRect(cardX + 6, cardY - 8, cardW - 12, 9);

  ctx.fillStyle = 'rgba(4, 6, 11, 0.56)';
  ctx.beginPath();
  ctx.moveTo(cardX + 8, cardY + 12);
  ctx.lineTo(cardX + cardW + 18, cardY + 10);
  ctx.lineTo(cardX + cardW + 8, cardY + cardH + 11);
  ctx.lineTo(cardX + 4, cardY + cardH + 11);
  ctx.closePath();
  ctx.fill();

  // 3D A-Frame Rear Tent Gusset & Dark Interior Shadow (proves folded standing tent card!)
  ctx.fillStyle = '#bfb49e';
  ctx.beginPath();
  ctx.moveTo(cardX + cardW - 4, cardY);
  ctx.lineTo(cardX + cardW + 15, cardY + cardH - 18);
  ctx.lineTo(cardX + cardW, cardY + cardH);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#1b1610';
  ctx.beginPath();
  ctx.moveTo(cardX + cardW - 3, cardY + 12);
  ctx.lineTo(cardX + cardW + 11, cardY + cardH - 17);
  ctx.lineTo(cardX + cardW, cardY + cardH - 2);
  ctx.closePath();
  ctx.fill();

  // Front face trapezoid (subtle 3D perspective: top fold ridge slightly narrower than bottom edge)
  const topInset = 4;
  const cardGrad = ctx.createLinearGradient(0, cardY, 0, cardY + cardH);
  cardGrad.addColorStop(0.0, fStr > 0.04 ? '#ffffff' : '#fdfaf2');
  cardGrad.addColorStop(0.55, '#f6efe1');
  cardGrad.addColorStop(1.0, '#eae0cc');
  ctx.fillStyle = cardGrad;
  ctx.beginPath();
  ctx.moveTo(cardX + topInset, cardY);
  ctx.lineTo(cardX + cardW - topInset, cardY);
  ctx.lineTo(cardX + cardW, cardY + cardH);
  ctx.lineTo(cardX, cardY + cardH);
  ctx.closePath();
  ctx.fill();

  // Crisp top fold-crease highlight
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(cardX + topInset, cardY + 0.8);
  ctx.lineTo(cardX + cardW - topInset, cardY + 0.8);
  ctx.stroke();

  // Subtle cotton cardstock fiber lines
  ctx.strokeStyle = 'rgba(155, 138, 108, 0.09)';
  ctx.lineWidth = 0.9;
  for (let fy = cardY + 10; fy < cardY + cardH - 6; fy += 8) {
    ctx.beginPath();
    ctx.moveTo(cardX + 10, fy);
    ctx.lineTo(cardX + cardW - 10, fy);
    ctx.stroke();
  }

  // Double Gold-Foil Embossed Border + Corner Ornaments
  const foilG = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + cardH);
  foilG.addColorStop(0.0, '#9e7a36');
  foilG.addColorStop(0.32, '#e4c47a');
  foilG.addColorStop(0.52, fStr > 0.04 ? '#fff6d6' : '#f4dc9c');
  foilG.addColorStop(0.75, '#b89146');
  foilG.addColorStop(1.0, '#8c6a2b');

  ctx.strokeStyle = foilG;
  ctx.lineWidth = 3.0;
  ctx.strokeRect(cardX + 11, cardY + 10, cardW - 22, cardH - 20);

  ctx.lineWidth = 1.2;
  ctx.strokeRect(cardX + 17.5, cardY + 16.5, cardW - 35, cardH - 33);

  // Four classical gold-foil corner flourishes
  const corners = [
    [cardX + 17.5, cardY + 16.5, 1, 1],
    [cardX + cardW - 17.5, cardY + 16.5, -1, 1],
    [cardX + 17.5, cardY + cardH - 16.5, 1, -1],
    [cardX + cardW - 17.5, cardY + cardH - 16.5, -1, -1],
  ];
  for (const [ox, oy, sx, sy] of corners) {
    ctx.strokeRect(ox, oy, sx * 7, sy * 7);
  }

  // Razor-sharp letterpress `鹈鹕「本人」` typography in PelicanSerif (strictly zero `()` per AGENTS.md Rule 5)
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '700 54px "PelicanSerif", serif';
  ctx.fillStyle = 'rgba(255, 252, 244, 0.85)';
  ctx.fillText('鹈鹕「本人」', cx + 0.8, cardY + cardH * 0.54 + 1.1);
  ctx.fillStyle = '#181410';
  ctx.fillText('鹈鹕「本人」', cx, cardY + cardH * 0.54);

  ctx.restore();
}

function drawXenonFlashAndPressPit(ctx, outroT, flashInfo) {
  const fStr = flashInfo.strength;
  const pitRise = lerp(0.35, 1.0, smootherstep(3.6, 7.4, outroT));
  const ySlide = (1 - pitRise) * 52;

  // 1. Directional Multi-Angle Xenon Press-Strobe Beam & 6-Ray Flashbulb Star
  if (fStr > 0.01) {
    const ox = flashInfo.originX;
    const oy = 905 + ySlide;

    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const beamG = ctx.createRadialGradient(ox, oy, 10, ox * 0.58 + 500 * 0.42, 505, 790);
    beamG.addColorStop(0.0, `rgba(255, 255, 255, ${(fStr * 0.78).toFixed(3)})`);
    beamG.addColorStop(0.24, `rgba(220, 238, 255, ${(fStr * 0.36).toFixed(3)})`);
    beamG.addColorStop(0.64, `rgba(195, 224, 255, ${(fStr * 0.12).toFixed(3)})`);
    beamG.addColorStop(1.0, 'rgba(195, 224, 255, 0)');
    ctx.fillStyle = beamG;
    ctx.fillRect(0, 0, 1000, 1000);

    // Crisp xenon speedlight star-flare at the firing camera's strobe head
    if (fStr > 0.22) {
      const sA = Math.min(1, (fStr - 0.22) / 0.78);
      ctx.strokeStyle = `rgba(255, 255, 255, ${(sA * 0.85).toFixed(3)})`;
      ctx.lineWidth = 2.2;
      for (let k = 0; k < 6; k++) {
        const a = (k * Math.PI) / 3 + 0.22;
        const rLen = (k % 2 === 0 ? 64 : 38) * sA;
        ctx.beginPath();
        ctx.moveTo(ox - Math.cos(a) * rLen, oy - Math.sin(a) * rLen);
        ctx.lineTo(ox + Math.cos(a) * rLen, oy + Math.sin(a) * rLen);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  // 2. Foreground Press-Pit Reporter, DSLR Lens & ENG Camera Silhouettes (y = 852..1000)
  ctx.save();
  ctx.translate(0, ySlide);

  const rimStroke =
    fStr > 0.04
      ? `rgba(218, 236, 255, ${(0.34 + fStr * 0.48).toFixed(3)})`
      : 'rgba(132, 168, 214, 0.28)';

  const drawRimSilhouette = (pathFn) => {
    // Soft bokeh halo
    ctx.save();
    ctx.translate(0, -3.5);
    ctx.fillStyle = 'rgba(3, 5, 10, 0.46)';
    pathFn();
    ctx.fill();
    ctx.restore();

    // Solid dark press-pit silhouette + subtle auditorium/stage rim-light contour
    ctx.fillStyle = '#04070d';
    ctx.strokeStyle = rimStroke;
    ctx.lineWidth = 1.6;
    pathFn();
    ctx.fill();
    ctx.stroke();
  };

  // (a) Left Photojournalist (head + shoulders + raised telephoto DSLR lens barrel)
  drawRimSilhouette(() => {
    ctx.beginPath();
    ctx.moveTo(-12, 1012);
    ctx.quadraticCurveTo(6, 938, 54, 926);
    // Head crown
    ctx.bezierCurveTo(46, 874, 114, 868, 116, 918);
    ctx.quadraticCurveTo(166, 928, 194, 1012);
    ctx.closePath();
  });
  ctx.save();
  ctx.translate(132, 908);
  ctx.rotate(-0.28);
  ctx.fillStyle = '#060a12';
  ctx.strokeStyle = rimStroke;
  ctx.lineWidth = 1.6;
  // Camera body + cylindrical telephoto barrel + petal hood
  ctx.beginPath();
  ctx.roundRect(-26, -8, 52, 30, 5);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.roundRect(-17, -44, 34, 38, 4);
  ctx.fill();
  ctx.stroke();
  // Coated telephoto glass front element reflection
  const lensG = ctx.createLinearGradient(-14, -44, 14, -34);
  lensG.addColorStop(0, 'rgba(64, 185, 225, 0.42)');
  lensG.addColorStop(0.5, 'rgba(180, 232, 255, 0.55)');
  lensG.addColorStop(1, 'rgba(42, 115, 185, 0.28)');
  ctx.fillStyle = lensG;
  ctx.beginPath();
  ctx.ellipse(0, -42, 14.5, 4.8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // (b) Left-Center Reporter (shoulder + raised spiral reporter notepad & poised pen)
  drawRimSilhouette(() => {
    ctx.beginPath();
    ctx.moveTo(212, 1012);
    ctx.quadraticCurveTo(238, 948, 282, 944);
    ctx.bezierCurveTo(276, 898, 336, 898, 334, 944);
    ctx.quadraticCurveTo(368, 952, 388, 1012);
    ctx.closePath();
  });
  ctx.save();
  ctx.translate(362, 932);
  ctx.rotate(0.16);
  ctx.fillStyle = '#080d17';
  ctx.strokeStyle = 'rgba(218, 210, 192, 0.34)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.roundRect(-16, -24, 32, 42, 2);
  ctx.fill();
  ctx.stroke();
  // Poised reporter pen silhouette
  ctx.strokeStyle = rimStroke;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(6, -6);
  ctx.lineTo(26, -22);
  ctx.stroke();
  ctx.restore();

  // (c) Right-Center Strobe Photographer (shoulders + DSLR + hot-shoe xenon speedlight head at x=776!)
  drawRimSilhouette(() => {
    ctx.beginPath();
    ctx.moveTo(664, 1012);
    ctx.quadraticCurveTo(698, 942, 742, 934);
    ctx.bezierCurveTo(738, 884, 804, 884, 802, 932);
    ctx.quadraticCurveTo(846, 940, 874, 1012);
    ctx.closePath();
  });
  ctx.save();
  ctx.translate(774, 906);
  ctx.rotate(0.14);
  ctx.fillStyle = '#070b14';
  ctx.strokeStyle = fStr > 0.05 && flashInfo.originX > 650 ? 'rgba(248, 252, 255, 0.82)' : rimStroke;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.roundRect(-20, -28, 40, 22, 3);
  ctx.fill();
  ctx.stroke();
  // Frosted xenon diffuser face on speedlight
  ctx.fillStyle = fStr > 0.05 && flashInfo.originX > 650 ? 'rgba(240, 248, 255, 0.85)' : 'rgba(185, 214, 245, 0.24)';
  ctx.fillRect(-15, -25, 30, 9);
  ctx.fillStyle = '#070b14';
  ctx.fillRect(-10, -6, 20, 18);
  ctx.restore();

  // (d) Far-Right Broadcast ENG Shoulder Camera + Matte-Box Hood
  drawRimSilhouette(() => {
    ctx.beginPath();
    ctx.moveTo(876, 1012);
    ctx.quadraticCurveTo(902, 924, 952, 914);
    ctx.lineTo(1012, 908);
    ctx.lineTo(1012, 1012);
    ctx.closePath();
  });
  ctx.save();
  ctx.translate(918, 904);
  ctx.rotate(-0.14);
  ctx.fillStyle = '#060a12';
  ctx.strokeStyle = rimStroke;
  ctx.lineWidth = 1.6;
  // Trapezoidal cinema matte-box hood
  ctx.beginPath();
  ctx.moveTo(-26, -18);
  ctx.lineTo(12, -11);
  ctx.lineTo(12, 13);
  ctx.lineTo(-26, 20);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // Red broadcast tally indicator LED
  ctx.fillStyle = 'rgba(235, 64, 52, 0.78)';
  ctx.beginPath();
  ctx.arc(6, -15, 2.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.restore();
}

/**
 * Draws Slot #21 (Press Conference Empty Seat) inside `[0..w] x [0..h]` at crisp vector resolution!
 */
function drawPressConferenceSlot(ctx, w, h, outroT, flashInfo) {
  ctx.save();
  ctx.scale(w / 1000, h / 1000);

  drawRearCorridor(ctx, flashInfo);
  drawStreakingPelicanAndBell(ctx, outroT);
  drawMidnightVelvetCurtains(ctx, outroT);
  drawAcousticBellRipples(ctx, outroT);
  drawEmptyExecutiveArmchair(ctx, flashInfo);
  drawConferenceTableAndRefreshments(ctx, outroT, flashInfo);
  drawBroadcastMicrophones(ctx, flashInfo);
  drawTentCardNameplate(ctx, outroT, flashInfo);
  drawXenonFlashAndPressPit(ctx, outroT, flashInfo);

  ctx.restore();
}

/**
 * Renders the 12-second Outro (global t in [125.0, 137.0], outroT in [0, 12.0])
 * onto the 1920x1080 overlay 2D canvas.
 */
export function renderOutro(kit, overlayG, t, renderSceneFn) {
  const rawOutroT = t - 125.0;
  const outroT = clamp(rawOutroT, 0, 12.0);
  ensureOutroTiles(kit, renderSceneFn);

  const ctx = overlayG.drawingContext;
  ctx.save();
  ctx.clearRect(0, 0, VIEW_W, VIEW_H);

  // Camera choreography across the 12s (6-bar) Outro (pixel-locked at pullBackU = 0!):
  const tile20Col = 19 % COLS; // col 5
  const tile20Row = Math.floor(19 / COLS); // row 2
  const tile20Cx = GRID_X0 + tile20Col * (TILE_SIZE + TILE_GAP) + TILE_SIZE / 2;
  const tile20Cy = GRID_Y0 + tile20Row * (TILE_SIZE + TILE_GAP) + TILE_SIZE / 2;

  const tile21Col = 6;
  const tile21Row = 2;
  const tile21Cx = GRID_X0 + tile21Col * (TILE_SIZE + TILE_GAP) + TILE_SIZE / 2;
  const tile21Cy = GRID_Y0 + tile21Row * (TILE_SIZE + TILE_GAP) + TILE_SIZE / 2;

  const startZoom = (BASE_PANEL_SCALE * 1000) / TILE_SIZE; // Exact 520x520px match in 960x720!
  const galleryZoom = 0.495; // 1710 * 0.495 = 846px wide inside 960px 4:3 frame
  const pullBackU = smootherstep(0.08, 1.85, outroT);
  const curGapX = lerp(0, TILE_GAP, pullBackU);
  const pushInU = smootherstep(3.8, 6.6, outroT);

  const startScreenY = VIEW_H * 0.5 + (500 - DEFAULT_CAM_Y) * BASE_PANEL_SCALE; // 331.4px exact match!
  const screenPivotY = lerp(startScreenY, 322, pullBackU);

  let focusX = lerp(tile20Cx, VIRTUAL_WALL_VIEW_W / 2, pullBackU);
  let focusY = lerp(tile20Cy, GRID_Y0 + GRID_H / 2, pullBackU);
  let zoom = lerp(startZoom, galleryZoom, pullBackU);

  if (pushInU > 0) {
    focusX = lerp(focusX, tile21Cx, pushInU);
    focusY = lerp(focusY, tile21Cy + 18, pushInU);
    zoom = lerp(zoom, 2.12, pushInU);
  }

  // Directional camera flash envelope on strong beats during push-in
  const flashSpecs = [
    { ft: 4.1, ox: 165, oy: 1035 },
    { ft: 4.9, ox: 776, oy: 1025 },
    { ft: 5.7, ox: 118, oy: 1030 },
    { ft: 6.4, ox: 368, oy: 1040 },
    { ft: 7.1, ox: 868, oy: 1025 },
  ];
  let flashInfo = { strength: 0, originX: 500, originY: 1030 };
  for (const sp of flashSpecs) {
    const dt = outroT - sp.ft;
    if (dt >= -0.02 && dt < 0.36) {
      const s = Math.exp(-Math.max(0, dt) * 14);
      if (s > flashInfo.strength) {
        flashInfo = { strength: s, originX: sp.ox, originY: sp.oy };
      }
    }
  }

  const scrollWainscotY = VIEW_H * 0.5 + (1028 - DEFAULT_CAM_Y) * BASE_PANEL_SCALE;
  ctx.fillStyle = pullBackU < 0.999 ? '#1c1916' : '#110f0d';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  if (pullBackU < 0.98) {
    ctx.save();
    ctx.globalAlpha = 1 - pullBackU;
    ctx.strokeStyle = '#423a30';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(0, scrollWainscotY);
    ctx.lineTo(VIEW_W, scrollWainscotY);
    ctx.stroke();
    ctx.restore();
  }

  const wallG = getBakedMuseumWall(kit);
  const coneG = getBakedPictureLightCone(kit);

  // Transform into zoomed exhibition wall space
  ctx.save();
  ctx.translate(VIEW_W / 2, screenPivotY);
  ctx.scale(zoom, zoom);
  ctx.translate(-focusX, -focusY);

  // 1. Baked Fine-Linen Museum Wall + Architectural Dado Rail & Wainscoting (<0.3ms single drawImage!)
  if (pullBackU > 0.002) {
    ctx.save();
    ctx.globalAlpha = pullBackU;
    ctx.drawImage(wallG.canvas, WALL_OX, WALL_OY, WALL_W, WALL_H);

    // Crisp vector dado-rail specular bevel hairline so it stays razor-sharp even at 3.35x close-up!
    ctx.strokeStyle = 'rgba(232, 202, 152, 0.24)';
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.moveTo(WALL_OX, 853.0);
    ctx.lineTo(WALL_OX + WALL_W, 853.0);
    ctx.stroke();
    ctx.restore();
  }

  // Exact wall-space camera frustum bounds (with generous margin for cones & plaques)
  const halfViewW = VIEW_W / (2 * zoom);
  const halfViewH = VIEW_H / (2 * zoom);
  const viewMinX = focusX - halfViewW - 95;
  const viewMaxX = focusX + halfViewW + 95;
  const viewMinY = focusY - halfViewH - 85;
  const viewMaxY = focusY + halfViewH + 85;

  // 2. Soft Warm 2900K Overhead Picture-Light Wash Cones behind visible tiles
  const museumLightAlpha = smootherstep(0.18, 0.96, pullBackU);
  if (museumLightAlpha > 0.003) {
    ctx.save();
    ctx.globalAlpha = museumLightAlpha;
    for (let idx = 0; idx < 21; idx++) {
      const col = idx % COLS;
      const row = Math.floor(idx / COLS);
      const tx = tile20Cx + (col - tile20Col) * (TILE_SIZE + curGapX) - TILE_SIZE / 2;
      const ty = tile20Cy + (row - tile20Row) * (TILE_SIZE + TILE_GAP) - TILE_SIZE / 2;
      if (tx + TILE_SIZE < viewMinX || tx > viewMaxX || ty + TILE_SIZE < viewMinY || ty > viewMaxY) continue;
      ctx.drawImage(coneG.canvas, tx + TILE_SIZE * 0.5 - 170, ty - 26, 340, 330);
    }
    ctx.restore();
  }

  // 3. Draw Slots 1..20 (frozen era panels) + Slot 21 (Press Conference Empty Seat)
  const tempLiveSlot = kit.getSlot(3);
  for (let idx = 0; idx < 21; idx++) {
    const col = idx % COLS;
    const row = Math.floor(idx / COLS);
    const tx = tile20Cx + (col - tile20Col) * (TILE_SIZE + curGapX) - TILE_SIZE / 2;
    const ty = tile20Cy + (row - tile20Row) * (TILE_SIZE + TILE_GAP) - TILE_SIZE / 2;
    if (tx + TILE_SIZE < viewMinX || tx > viewMaxX || ty + TILE_SIZE < viewMinY || ty > viewMaxY) continue;

    if (idx === 20) {
      const slot21Alpha = smootherstep(0.10, 0.68, outroT);
      if (slot21Alpha <= 0.002) continue;
      ctx.save();
      ctx.globalAlpha = slot21Alpha;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.54)';
      ctx.fillRect(tx + 4.5, ty + 6.5, TILE_SIZE + 2, TILE_SIZE + 2);

      ctx.save();
      ctx.translate(tx, ty);
      ctx.beginPath();
      ctx.rect(0, 0, TILE_SIZE, TILE_SIZE);
      ctx.clip();
      drawPressConferenceSlot(ctx, TILE_SIZE, TILE_SIZE, outroT, flashInfo);
      ctx.restore();

      drawSlot21MitredGiltFrame(ctx, tx, ty, TILE_SIZE, flashInfo.strength);
      if (museumLightAlpha > 0.01) {
        ctx.save();
        ctx.globalAlpha = slot21Alpha * museumLightAlpha;
        drawPictureLampFixture(kit, ctx, tx, ty);
        ctx.restore();
      }
      ctx.restore();
      continue;
    }

    // Drop shadow (attenuated at pullBackU=0 so flush seam #19/#20 has zero shadow overlap)
    if (pullBackU > 0.002) {
      ctx.fillStyle = `rgba(0, 0, 0, ${(0.52 * pullBackU).toFixed(3)})`;
      ctx.fillRect(tx + 5 * pullBackU, ty + 7 * pullBackU, TILE_SIZE, TILE_SIZE);
    }

    const scene = SCENES[idx];
    const thumb = kit.outroTileCache.get(scene.id);

    // Live continuation on Tile #20 (and flush neighbor #19) during initial pullback
    if (idx === 19 && outroT < 1.38) {
      const thumbMix = smootherstep(0.76, 1.35, outroT);
      if (thumbMix < 0.998) {
        tempLiveSlot.usedFb = false;
        tempLiveSlot.g2d.clear();
        const livePelX = 1000 + (rawOutroT / 6.0) * 1000;
        renderSceneFn(kit, tempLiveSlot, scene, {
          t,
          localT: clamp(6.0 + rawOutroT, 0, 6.0),
          rawLocalT: 6.0 + rawOutroT,
          pelicanLocalX: livePelX,
          pedalAngle: (t / 0.5) * Math.PI,
          speedScale: 1.0,
          isOutroThumbnail: false,
        });
        ctx.drawImage(tempLiveSlot.g2d.canvas, tx, ty, TILE_SIZE, TILE_SIZE);
      }
      if (thumb && thumbMix > 0.002) {
        ctx.save();
        ctx.globalAlpha = thumbMix;
        ctx.drawImage(thumb.canvas, tx, ty, TILE_SIZE, TILE_SIZE);
        ctx.restore();
      }
    } else if (idx === 18 && outroT < 1.28) {
      const thumbMix = smootherstep(0.65, 1.25, outroT);
      if (thumbMix < 0.998) {
        tempLiveSlot.usedFb = false;
        tempLiveSlot.g2d.clear();
        renderSceneFn(kit, tempLiveSlot, scene, {
          t,
          localT: 6.0,
          rawLocalT: 12.0 + rawOutroT,
          pelicanLocalX: 2000 + (rawOutroT / 6.0) * 1000,
          pedalAngle: (t / 0.5) * Math.PI,
          speedScale: 1.0,
          isOutroThumbnail: false,
        });
        ctx.drawImage(tempLiveSlot.g2d.canvas, tx, ty, TILE_SIZE, TILE_SIZE);
      }
      if (thumb && thumbMix > 0.002) {
        ctx.save();
        ctx.globalAlpha = thumbMix;
        ctx.drawImage(thumb.canvas, tx, ty, TILE_SIZE, TILE_SIZE);
        ctx.restore();
      }
    } else if (thumb) {
      ctx.drawImage(thumb.canvas, tx, ty, TILE_SIZE, TILE_SIZE);
    }

    // Gallery frame around tile (Tile #20 matches its dark anodized glass hairline at zoom=4.28 before pullback!)
    if (idx === 19) {
      ctx.strokeStyle = '#161b22';
      ctx.lineWidth = lerp(0.85, 4.4, pullBackU);
      ctx.strokeRect(tx, ty, TILE_SIZE, TILE_SIZE);
      ctx.strokeStyle = `rgba(88, 166, 255, ${lerp(0.55, 0.88, pullBackU).toFixed(3)})`;
      ctx.lineWidth = lerp(0.35, 1.3, pullBackU);
      const inset = lerp(0.7, 2.8, pullBackU);
      ctx.strokeRect(tx + inset, ty + inset, TILE_SIZE - inset * 2, TILE_SIZE - inset * 2);
    } else if (idx === 18 && pullBackU < 0.999) {
      ctx.strokeStyle = pullBackU < 0.01 ? '#1b1b24' : scene.frameColor || '#1b1b24';
      ctx.lineWidth = lerp(1.1, 5.0, pullBackU);
      ctx.strokeRect(tx, ty, TILE_SIZE, TILE_SIZE);
      ctx.save();
      ctx.globalAlpha = pullBackU;
      ctx.strokeStyle = scene.frameAccent || '#ff2a5f';
      ctx.lineWidth = 1.4;
      ctx.strokeRect(tx + 3, ty + 3, TILE_SIZE - 6, TILE_SIZE - 6);
      ctx.restore();
    } else {
      ctx.strokeStyle = scene.frameColor || '#5c4632';
      ctx.lineWidth = 5;
      ctx.strokeRect(tx, ty, TILE_SIZE, TILE_SIZE);
      ctx.strokeStyle = scene.frameAccent || '#d4a373';
      ctx.lineWidth = 1.4;
      ctx.strokeRect(tx + 3, ty + 3, TILE_SIZE - 6, TILE_SIZE - 6);
    }

    // Overhead picture-light hood + 38x7px brushed-brass micro-plaque beneath Tiles 1..20!
    if (museumLightAlpha > 0.01) {
      ctx.save();
      ctx.globalAlpha = museumLightAlpha;
      drawPictureLampFixture(kit, ctx, tx, ty);
      drawMuseumMicroPlaque(kit, ctx, tx, ty, scene, outroT);
      ctx.restore();
    }
  }
  ctx.restore();

  // Documentary Epilogue Subtitles (shown AFTER sung outro lines conclude around outroT=6.05s,
  // and fading cleanly at outroT=9.34s right as the Post-Pelican File-Size Monument expands!)
  const sub1Alpha = smoothstep(6.10, 6.46, outroT) * (1 - smoothstep(7.35, 7.64, outroT));
  if (sub1Alpha > 0.005) {
    drawCenteredSubtitle(ctx, '「截至目前，人类共提交了 20 份答卷。」', sub1Alpha);
  }

  const sub2Alpha = smoothstep(7.68, 8.04, outroT) * (1 - smoothstep(9.08, 9.34, outroT));
  if (sub2Alpha > 0.005) {
    drawCenteredSubtitle(ctx, '「鹈鹕本人对此尚未发表评论。」', sub2Alpha);
  }

  ctx.restore();
}

function drawCenteredSubtitle(ctx, text, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = '800 30px "PelicanSerif", "CarbonSerif", serif';
  const tw = ctx.measureText(text).width;
  const padX = 28;
  const boxH = 58;
  const bx = (VIEW_W - tw) / 2 - padX;
  const by = VIEW_H - 86;
  const bw = tw + padX * 2;

  ctx.fillStyle = 'rgba(10, 9, 8, 0.90)';
  ctx.strokeStyle = 'rgba(226, 192, 128, 0.68)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, boxH, 9);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#fff9ec';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, VIEW_W / 2, by + boxH / 2 + 1);
  ctx.restore();
}
