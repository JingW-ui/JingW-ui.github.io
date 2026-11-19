// src/beat/time_warp.js
// Fritsch-Carlson C1-smooth monotone cubic Hermite time-warp engine:
// Maps real song time `realT in [0, 174.64s]` <-> canonical film time `canonicalT in [0, 137.0s]`
// while extracting sample-accurate real musical beats, envelope energy, and blacksmith anvil impacts!

import { clamp } from './timeline.js';

function buildMonotoneHermiteSlopes(xs, ys) {
  const n = xs.length;
  const dys = new Array(n - 1);
  const dxs = new Array(n - 1);
  const ms = new Array(n - 1);

  for (let i = 0; i < n - 1; i++) {
    dxs[i] = xs[i + 1] - xs[i];
    dys[i] = ys[i + 1] - ys[i];
    ms[i] = dys[i] / Math.max(1e-6, dxs[i]);
  }

  const c1s = new Array(n);
  c1s[0] = ms[0];
  c1s[n - 1] = ms[n - 2];

  for (let i = 1; i < n - 1; i++) {
    if (ms[i - 1] * ms[i] <= 0) {
      c1s[i] = 0;
    } else {
      const dxPrev = dxs[i - 1];
      const dxNext = dxs[i];
      const common = dxPrev + dxNext;
      c1s[i] = (3 * common) / ((common + dxNext) / ms[i - 1] + (common + dxPrev) / ms[i]);
    }
  }

  // Fritsch-Carlson monotonicity clamp (alpha^2 + beta^2 <= 9)
  for (let i = 0; i < n - 1; i++) {
    if (Math.abs(ms[i]) < 1e-8) {
      c1s[i] = 0;
      c1s[i + 1] = 0;
    } else {
      const a = c1s[i] / ms[i];
      const b = c1s[i + 1] / ms[i];
      const sq = a * a + b * b;
      if (sq > 9) {
        const tau = 3 / Math.sqrt(sq);
        c1s[i] = tau * a * ms[i];
        c1s[i + 1] = tau * b * ms[i];
      }
    }
  }
  return c1s;
}

function evalHermite(xs, ys, slopes, xRaw) {
  const n = xs.length;
  const x = clamp(xRaw, xs[0], xs[n - 1]);
  if (x <= xs[0]) return ys[0];
  if (x >= xs[n - 1]) return ys[n - 1];

  let lo = 0;
  let hi = n - 2;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (x < xs[mid]) hi = mid - 1;
    else if (x >= xs[mid + 1]) lo = mid + 1;
    else {
      lo = mid;
      break;
    }
  }
  const i = clamp(lo, 0, n - 2);
  const h = xs[i + 1] - xs[i];
  const u = (x - xs[i]) / h;
  const u2 = u * u;
  const u3 = u2 * u;

  const h00 = 2 * u3 - 3 * u2 + 1;
  const h10 = u3 - 2 * u2 + u;
  const h01 = -2 * u3 + 3 * u2;
  const h11 = u3 - u2;

  return h00 * ys[i] + h10 * h * slopes[i] + h01 * ys[i + 1] + h11 * h * slopes[i + 1];
}

function binarySearchLastLE(arr, val) {
  let lo = 0;
  let hi = arr.length - 1;
  let ans = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (arr[mid] <= val) {
      ans = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return ans;
}

export function createTimeWarpEngine(songTimeline) {
  const knots = songTimeline.knots;
  const realXs = knots.map((k) => k.realT);
  const canYs = knots.map((k) => k.canonicalT);

  const forwardSlopes = buildMonotoneHermiteSlopes(realXs, canYs);
  const inverseSlopes = buildMonotoneHermiteSlopes(canYs, realXs);

  const beats = songTimeline.beats || [];
  const anvilHits = songTimeline.anvilHits || [];
  const envelope = songTimeline.envelope || [];
  const envFps = songTimeline.envelopeFps || 30;
  const realDuration = songTimeline.duration || 174.64;

  function realToCanonical(realT) {
    return evalHermite(realXs, canYs, forwardSlopes, realT);
  }

  function canonicalToReal(canonicalT) {
    return evalHermite(canYs, realXs, inverseSlopes, canonicalT);
  }

  function sampleAudioSync(rawRealT) {
    const realT = clamp(rawRealT, 0, realDuration);
    const canonicalT = realToCanonical(realT);

    // 1. Sample envelope energy
    const envPos = realT * envFps;
    const e0 = clamp(Math.floor(envPos), 0, Math.max(0, envelope.length - 1));
    const e1 = Math.min(e0 + 1, Math.max(0, envelope.length - 1));
    const ef = envPos - Math.floor(envPos);
    const energy = envelope.length ? envelope[e0] * (1 - ef) + envelope[e1] * ef : 0.4;

    // 2. Real beat index, beatPhase, and beatPulse
    let beatIndex = 0;
    let beatPhase = 0;
    let beatPulse = 0;
    if (beats.length > 1) {
      const bi = binarySearchLastLE(beats, realT);
      if (bi < 0) {
        beatIndex = 0;
        beatPhase = clamp(realT / Math.max(0.2, beats[0]), 0, 1);
      } else if (bi >= beats.length - 1) {
        beatIndex = bi;
        const dt = realT - beats[bi];
        beatPhase = clamp(dt / 0.72, 0, 1);
        beatPulse = Math.exp(-dt * 6.5);
      } else {
        beatIndex = bi;
        const dt = realT - beats[bi];
        const span = Math.max(0.25, beats[bi + 1] - beats[bi]);
        beatPhase = clamp(dt / span, 0, 1);
        beatPulse = Math.exp(-dt * 6.8);
      }
    }

    // 3. Blacksmith anvil crisp metallic strike impulse (`anvilShock` in [0..1])
    let anvilShock = 0;
    let lastAnvilTime = -10;
    if (anvilHits.length) {
      const ai = binarySearchLastLE(anvilHits, realT);
      if (ai >= 0) {
        lastAnvilTime = anvilHits[ai];
        const dt = realT - lastAnvilTime;
        if (dt >= 0 && dt < 0.34) {
          anvilShock = Math.exp(-dt * 14.5) * (0.65 + 0.35 * energy);
        }
      }
    }

    return {
      realT,
      realDuration,
      canonicalT,
      energy,
      beatIndex,
      beatPhase,
      beatPulse,
      anvilShock,
      lastAnvilTime,
      knots,
    };
  }

  return {
    realDuration,
    knots,
    realToCanonical,
    canonicalToReal,
    sampleAudioSync,
  };
}
