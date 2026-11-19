// src/openings/live_svg_stage.js
// True 4K/Retina Infinite-Vector Live `<svg>` Stage for the 3-Strip Slanted Gold-Printmaking Twin Blacksmiths (`0.00s .. 4.35s`).
// Mounts `createGoldPrintmakingForgeSvg` directly inside `.screen-wrap` over the right forge stage (`x = 344..960, y = 0..720`),
// keeping `pointer-events: none` and syncing the `/` diagonal shutter curtain wipe into the Pelican Era Accordion!

import { SVG_NS } from './gold_svg/defs.js';
import { createGoldPrintmakingForgeSvg } from './gold_svg/scene.js';

export class LiveForgeSvgStage {
  constructor() {
    this.host = null;
    this.svgEl = null;
    this.scene = null;
    this.ready = false;
  }

  async init(screenWrapEl) {
    if (!screenWrapEl) return;
    if (this.host) this.host.remove();

    const host = document.createElement('div');
    host.className = 'live-forge-svg-stage';
    host.style.cssText = [
      'position:absolute',
      `left:${((344 / 960) * 100).toFixed(4)}%`,
      'top:0',
      `width:${((616 / 960) * 100).toFixed(4)}%`,
      'height:100%',
      'pointer-events:none',
      'overflow:hidden',
      'z-index:2',
      'display:none',
      'opacity:1',
    ].join(';');

    const svgEl = document.createElementNS(SVG_NS, 'svg');
    svgEl.style.cssText = 'display:block;width:100%;height:100%;';
    host.appendChild(svgEl);
    screenWrapEl.appendChild(host);

    this.host = host;
    this.svgEl = svgEl;
    this.scene = createGoldPrintmakingForgeSvg(svgEl, 616, 720);
    this.ready = true;
  }

  update(realT, localPolys, alpha, wipeU = 0) {
    if (!this.ready || !this.host || !this.scene) return;
    if (!localPolys || alpha <= 0.004 || wipeU >= 0.998) {
      if (this.host.style.display !== 'none') {
        this.host.style.display = 'none';
      }
      return;
    }
    if (this.host.style.display !== 'block') {
      this.host.style.display = 'block';
    }
    this.host.style.opacity = alpha.toFixed(3);
    this.scene.renderAt(realT, localPolys, wipeU);
  }
}
