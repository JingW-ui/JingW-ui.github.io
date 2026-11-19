// src/kit/anvil_fx.js
// Song-reactive blacksmith anvil & bicycle bell world-space micro-accents:
// Emits era-harmonized metallic bell rings around the handlebar or anvil sparks beneath the rear tire
// right when blacksmith hammer transients (`anvilShock`) or bell callouts (`叮叮当`) fire!

import { ROAD_EDGE_Y } from '../beat/timeline.js';
import { computePelicanRig } from '../rig/pelican.js';

export function renderSongAnvilAndBellFX(p, pelWorld, beatState, sync, activePhrase) {
  if (!pelWorld?.visibleInScroll) return;
  const anvilShock = sync?.anvilShock ?? 0;
  const isBellPhrase = activePhrase?.tier === 'bell';
  const isAnvilPhrase = activePhrase?.tier === 'anvil';
  const beatPulse = sync?.beatPulse ?? 0;

  const ringStrength = isBellPhrase ? Math.max(anvilShock, beatPulse * 0.85) : anvilShock * 0.65;
  if (ringStrength < 0.08 && !isAnvilPhrase) return;

  const scene = beatState?.scene;
  // Respect minimalist / sacred ink aesthetics with muted ink/cinnabar, neon in digital eras
  const isInk = Boolean(scene?.isInk);
  const isDigital = (scene?.num ?? 0) >= 15;

  const rig = computePelicanRig({
    x: pelWorld.worldX,
    y: ROAD_EDGE_Y,
    pedalAngle: pelWorld.pedalAngle,
    wheelAngle: pelWorld.worldX / 46,
    scale: scene?.id === 's05_song' ? 0.24 : 1.0,
    speedScale: pelWorld.speedScale,
    time: beatState.t,
  });

  p.push();
  p.noFill();

  // 1. Crisp acoustic bell ripple at bicycle handlebar (`叮叮当` / `连车铃都在叫` / strong anvil strikes)
  if (ringStrength > 0.12) {
    const progress = 1 - ringStrength;
    const bx = rig.handleGrip.x + 12;
    const by = rig.handleGrip.y - 8;
    const r1 = 12 + progress * 44;
    const alpha = Math.round(ringStrength * (isInk ? 155 : 210));

    if (isInk) {
      p.stroke(178, 48, 34, alpha);
    } else if (isDigital) {
      p.stroke(57, 255, 190, alpha);
    } else {
      p.stroke(245, 198, 84, alpha);
    }
    p.strokeWeight(isInk ? 1.8 : 2.2);
    p.arc(bx, by, r1 * 2, r1 * 2, -Math.PI * 0.78, -Math.PI * 0.12);
    if (ringStrength > 0.28) {
      p.strokeWeight(1.3);
      p.arc(bx, by, (r1 + 11) * 2, (r1 + 11) * 2, -Math.PI * 0.72, -Math.PI * 0.18);
    }
  }

  // 2. Blacksmith anvil sparks under rear tire on `anvil` tier or sharp hammer hits
  if (anvilShock > 0.22 || (isAnvilPhrase && beatPulse > 0.35)) {
    const sparkPower = Math.max(anvilShock, isAnvilPhrase ? beatPulse * 0.75 : 0);
    const sx = rig.rearWheel.x - 10;
    const sy = ROAD_EDGE_Y - 2;
    const sparkAlpha = Math.round(sparkPower * 220);

    if (isInk) {
      p.stroke(182, 46, 32, sparkAlpha);
    } else if (isDigital) {
      p.stroke(255, 220, 72, sparkAlpha);
    } else {
      p.stroke(255, 176, 56, sparkAlpha);
    }
    p.strokeWeight(2.0);
    for (let k = 0; k < 4; k++) {
      const ang = Math.PI + 0.28 + k * 0.26;
      const d0 = 8 + (1 - sparkPower) * 18;
      const d1 = d0 + 9 + sparkPower * 8;
      p.line(
        sx + Math.cos(ang) * d0,
        sy + Math.sin(ang) * d0,
        sx + Math.cos(ang) * d1,
        sy + Math.sin(ang) * d1
      );
    }
  }

  p.pop();
}
