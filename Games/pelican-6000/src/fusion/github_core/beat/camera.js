// src/beat/camera.js
// Native 4:3 (960x720) C2-continuous museum scroll camera for 《鹈鹕骑行·六千年》.
// Framing geometry in 960x720:
//   - BASE_PANEL_SCALE = 0.52 -> 520x520px active era frame in x=[220..740], y=[71..591]
//   - Left neighbor era frame visible in x=[0..220] (220px wide!)
//   - Right neighbor era frame visible in x=[740..960] (220px wide!)
//   - Top Demo HUD zone clean in y=[0..66] (zero overlap with painting!)
//   - Lower gallery wainscoting & Kinetic Punchline stage in y=[592..720] (zero overlap with pelican!)

import {
  INTRO_SEC,
  SCENE_SEC,
  NUM_SCENES,
  PANEL_SIZE,
  clamp,
  lerp,
  smootherstep,
  getPelicanWorldState,
} from './timeline.js';

export const VIEW_W = 960;
export const VIEW_H = 720;
export const BASE_PANEL_SCALE = 0.632;
export const DEFAULT_CAM_Y = 524;

export function getFrameCrossingPulse(canonicalT) {
  let pulse = 0;
  for (let k = 1; k < NUM_SCENES; k++) {
    const tc = INTRO_SEC + k * SCENE_SEC;
    const dt = canonicalT - tc;
    if (dt > -0.24 && dt < 0.36) {
      const w = (dt + 0.24) / 0.6;
      const s = Math.sin(Math.PI * w);
      const s2 = s * s;
      pulse = Math.max(pulse, 0.0055 * s2 * s2);
    }
  }
  return pulse;
}

export function getCameraState(canonicalT, anvilShock = 0) {
  const pel = getPelicanWorldState(canonicalT);

  // Subtle vertical damped anvil thud (<= 1.6px world units, crisp metallic tactile rhythm)
  const anvilMicroDip = anvilShock > 0.02 ? Math.sin(anvilShock * Math.PI * 2.2) * anvilShock * 1.5 : 0;

  if (canonicalT < INTRO_SEC) {
    const tcStart = 3.8;
    const dur = INTRO_SEC - tcStart;
    const s = clamp((canonicalT - tcStart) / dur, 0, 1);
    const s2 = s * s;
    const mCam = (PANEL_SIZE / SCENE_SEC) * dur;
    const camX = mCam * (-0.5 + s2 * s - 0.5 * s2 * s2);
    return {
      camX,
      camY: DEFAULT_CAM_Y + anvilMicroDip,
      scale: BASE_PANEL_SCALE,
      surroundDim: 0,
      curtainProgress: 0,
      framePulse: 0,
      introBlend: smootherstep(3.95, 4.96, canonicalT),
    };
  }

  const st = canonicalT - INTRO_SEC;
  let pulse = getFrameCrossingPulse(canonicalT);

  const framingEnv = smootherstep(5.0, 6.2, canonicalT) * (1 - smootherstep(122.0, 123.6, canonicalT));
  const framingOffset = 34 * Math.sin((2 * Math.PI * st) / SCENE_SEC) * framingEnv;
  let camX = pel.worldX + framingOffset;
  let camY = DEFAULT_CAM_Y + anvilMicroDip;
  let zoomMult = 1.0;
  let surroundDim = 0.0;

  // #05 Northern Song Monumental Landscape (canonicalT in [29.0, 35.0]):
  // Push in 2.75x onto the mountain foot trail to reveal the tiny unchanging pelican!
  const songLocalT = canonicalT - (INTRO_SEC + 4 * SCENE_SEC);
  if (songLocalT > 0.82 && songLocalT < 5.22) {
    const zoomEnv = smootherstep(0.82, 2.32, songLocalT) * (1 - smootherstep(3.88, 5.22, songLocalT));
    zoomMult = lerp(1.0, 2.75, zoomEnv);
    camX = lerp(camX, pel.worldX, zoomEnv * 0.94);
    camY = lerp(DEFAULT_CAM_Y, 748, zoomEnv * 0.88);
    pulse *= 1 - zoomEnv;
  }

  // #18 -> #19 -> #20 Cinema Velvet Curtains (4:3 -> 9:16 vertical short-video feed -> 4:3)
  const vertEnv = smootherstep(112.55, 113.35, canonicalT) * (1 - smootherstep(118.65, 119.45, canonicalT));
  if (vertEnv > 0) {
    const panel19Center = 18 * PANEL_SIZE + 500;
    camX = lerp(camX, panel19Center, vertEnv * 0.88);
    zoomMult *= lerp(1.0, 1.04, vertEnv);
    surroundDim = Math.max(surroundDim, 0.96 * vertEnv);
    pulse *= 1 - vertEnv;
  }

  // #20 -> Outro Sub-Pixel Match-Cut Landing onto Panel #20 center (19500, DEFAULT_CAM_Y)
  const outroSettle = smootherstep(122.2, 124.8, canonicalT);
  if (outroSettle > 0) {
    const panel20Center = 19 * PANEL_SIZE + 500;
    camX = lerp(camX, panel20Center, outroSettle);
    camY = lerp(camY, DEFAULT_CAM_Y, outroSettle);
    pulse *= 1 - outroSettle;
  }

  const scale = BASE_PANEL_SCALE * zoomMult * (1 + pulse);

  return {
    camX,
    camY,
    scale,
    surroundDim,
    curtainProgress: vertEnv,
    framePulse: pulse,
    introBlend: 1,
  };
}

export function getVisiblePanelIndices(cam) {
  const halfW = (VIEW_W * 0.5) / cam.scale + 200;
  const minWorldX = cam.camX - halfW;
  const maxWorldX = cam.camX + halfW;
  const i0 = clamp(Math.floor(minWorldX / PANEL_SIZE), 0, NUM_SCENES - 1);
  const i1 = clamp(Math.floor(maxWorldX / PANEL_SIZE), 0, NUM_SCENES - 1);
  const list = [];
  for (let i = i0; i <= i1; i++) list.push(i);
  return list;
}
