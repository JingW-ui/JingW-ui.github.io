// src/core/renderer.js
// Unified Fused 2880x2160 (4K UHD 2160P 4:3) Film Renderer for 《鹈鹕骑行·六千年》:
// - Fuses the 20-era p5.js + p5.brush WebGL multi-bristle museum scroll, 3D mitred period frames,
//   cross-frame material handoff micro-physics, Accordion Multi-Redraw Intro, and 7x3 + Empty-Seat Outro
// - Mounts 4K Infinite-Vector `<svg>` Blacksmith Stage (`LiveForgeSvgStage`) pixel-locked to `(645.84, 370.80)`
// - Renders Intro Obsidian Title Wall, Era Accordion, Outro Exhibition Wall, Museum Plaques & Kinetic Lyrics
//   at native 3x (`2880x2160` 4K UHD) vector precision with zero top review HUD clutter

import {
  TOTAL_DURATION,
  INTRO_SEC,
  SCENES_TOTAL_SEC,
  PANEL_SIZE,
  ROAD_EDGE_Y,
  SCENES,
  clamp,
  lerp,
  smootherstep,
  getBeatState,
  getPelicanWorldState,
} from '../fusion/github_core/beat/timeline.js';
import {
  VIEW_W,
  VIEW_H,
  getCameraState,
  getVisiblePanelIndices,
} from '../fusion/github_core/beat/camera.js';
import { createTimeWarpEngine } from '../fusion/github_core/beat/time_warp.js';
import { createKit } from '../fusion/github_core/kit/kit.js';
import { drawPanelFrame } from '../fusion/github_core/kit/frame.js';
import { renderThresholdMicroPhysics } from '../fusion/github_core/kit/transitions.js';
import { renderSongAnvilAndBellFX } from '../fusion/github_core/kit/anvil_fx.js';
import { computePelicanRig, drawRig2D } from '../fusion/github_core/rig/pelican.js';
import { renderScenePanel } from '../fusion/github_core/scenes/index.js';
import { renderSaharaPelicanOnly } from '../fusion/github_core/scenes/s01_sahara.js';
import { renderOutro } from '../fusion/github_core/scenes/outro.js';
import { getCodexSceneId } from '../fusion/era_enhancements.js';
import { renderMuseumGalleryOptics2D } from '../fusion/gallery_lighting.js';
import { buildForgeTimeline } from '../fusion/forge_kinematics.js';
import { LiveForgeSvgStage } from '../openings/live_svg_stage.js';
import { ensureIntroEraBackdrops } from '../openings/era_slats.js';
import {
  preloadIntroDecorAssets,
  renderAccordionIntroOverlay,
} from '../openings/accordion_intro.js';
import { LyricPainter } from '../components/lyrics.js';
import { CodeSizeHud } from '../components/code_size_hud.js';

const _urlScale =
  typeof window !== 'undefined'
    ? Number(new URLSearchParams(window.location.search).get('scale'))
    : 0;
export const RENDER_SCALE = _urlScale === 3 ? 3 : 2;
export const FILM_W = VIEW_W * RENDER_SCALE; // 2880 (?scale=3) or 1920 (default)
export const FILM_H = VIEW_H * RENDER_SCALE; // 2160 (?scale=3) or 1440 (default)

function getPostCodeExtension(kit) {
  return kit.bake2D(
    'post_s20_oled_extension_v1',
    (_g, ctx, _rng, w, h) => {
      const bg = ctx.createRadialGradient(280, 468, 40, 480, 500, 760);
      bg.addColorStop(0, '#12223a');
      bg.addColorStop(0.55, '#091120');
      bg.addColorStop(1, '#050810');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, w, ROAD_EDGE_Y);
      ctx.clip();

      ctx.strokeStyle = 'rgba(88, 166, 255, 0.032)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      for (let v = 20; v < w; v += 20) {
        if (v % 100 === 0) continue;
        ctx.moveTo(v, 0);
        ctx.lineTo(v, ROAD_EDGE_Y);
        if (v < ROAD_EDGE_Y) {
          ctx.moveTo(0, v);
          ctx.lineTo(w, v);
        }
      }
      ctx.stroke();

      ctx.strokeStyle = 'rgba(125, 211, 252, 0.085)';
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      for (let v = 100; v < w; v += 100) {
        ctx.moveTo(v, 0);
        ctx.lineTo(v, ROAD_EDGE_Y);
        if (v < ROAD_EDGE_Y) {
          ctx.moveTo(0, v);
          ctx.lineTo(w, v);
        }
      }
      ctx.stroke();

      ctx.strokeStyle = 'rgba(126, 231, 135, 0.22)';
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      for (let gx = 100; gx <= 900; gx += 100) {
        for (let gy = 100; gy <= 600; gy += 100) {
          ctx.moveTo(gx - 3, gy);
          ctx.lineTo(gx + 3, gy);
          ctx.moveTo(gx, gy - 3);
          ctx.lineTo(gx, gy + 3);
        }
      }
      ctx.stroke();

      // Mirrored harmonic orbit rings (zero backwards text!)
      const cx = 310;
      const cy = 468;
      ctx.strokeStyle = 'rgba(88, 166, 255, 0.12)';
      ctx.setLineDash([5, 6]);
      ctx.lineWidth = 0.95;
      ctx.beginPath();
      ctx.arc(cx, cy, 256, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(192, 132, 252, 0.12)';
      ctx.beginPath();
      ctx.arc(cx, cy, 256 / 1.6180339, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // Perspective obsidian floor grid below `y = 680` matching `s20_code`
      ctx.strokeStyle = 'rgba(88, 166, 255, 0.055)';
      ctx.lineWidth = 0.85;
      for (let i = -8; i <= 8; i += 1) {
        ctx.beginPath();
        ctx.moveTo(500 + i * 65, ROAD_EDGE_Y);
        ctx.lineTo(500 + i * 158, h);
        ctx.stroke();
      }
      for (const fyLine of [720, 772, 838, 916]) {
        ctx.beginPath();
        ctx.moveTo(0, fyLine);
        ctx.lineTo(w, fyLine);
        ctx.stroke();
      }

      ctx.strokeStyle = 'rgba(125, 211, 252, 0.36)';
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 20) {
        ctx.moveTo(x, ROAD_EDGE_Y);
        ctx.lineTo(x, ROAD_EDGE_Y + (x % 100 === 0 ? 9 : 4.5));
      }
      ctx.stroke();

      ctx.save();
      ctx.strokeStyle = '#60a5fa';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 14;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(0, ROAD_EDGE_Y);
      ctx.lineTo(w, ROAD_EDGE_Y);
      ctx.stroke();
      ctx.restore();
    },
    PANEL_SIZE,
    PANEL_SIZE
  );
}

export class FilmRenderer {
  constructor(
    canvas,
    film,
    features,
    lyrics,
    palettes,
    scenes,
    assets,
    clock,
    forgeStrikesDoc = null,
    lyricChoreographyDoc = null,
    accordionDoc = null,
    codePayloadStoryDoc = null
  ) {
    this.canvas = canvas;
    if (this.canvas.width !== FILM_W) this.canvas.width = FILM_W;
    if (this.canvas.height !== FILM_H) this.canvas.height = FILM_H;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.film = film;
    this.features = features;
    this.palettes = palettes;
    this.scenes = scenes;
    this.assets = assets;
    this.clock = clock;
    this.forgeTimeline = forgeStrikesDoc ? buildForgeTimeline(forgeStrikesDoc) : null;
    this.forgeSvgBank = null;
    this.liveSvgStage = new LiveForgeSvgStage();
    this.codeSizeHud = new CodeSizeHud(codePayloadStoryDoc, RENDER_SCALE);
    this.accordionDoc = accordionDoc;
    this.drawerState = {
      forgePinnedIndex: null,
      forgeHoverIndex: null,
      forgeFocusAnimated: 0,
      forgeOverrideWeight: 0,
      forgeSoloWeight: 0,
      activeAutoForgeIndex: 0,
      eraHoverIndex: null,
      eraFocusAnimated: 0,
      eraHoverWeight: 0,
      lastForgeSlats: null,
      renderForgeSlats: null,
      forgeDomAlpha: 0,
      liveSvgMounted: false,
      lastEraSlats: null,
    };
    this.lyrics = new LyricPainter(lyrics, lyricChoreographyDoc);
    this.errors = [];

    // Native 4K (`2880x2160`, 3x logical `960x720`) 2D vector overlay for Intro, Era Accordion & Outro Wall
    const hiResCanvas = document.createElement('canvas');
    hiResCanvas.width = FILM_W;
    hiResCanvas.height = FILM_H;
    const hiResCtx = hiResCanvas.getContext('2d');
    this.hiResOverlay = {
      canvas: hiResCanvas,
      drawingContext: hiResCtx,
      clear() {
        hiResCtx.setTransform(1, 0, 0, 1, 0, 0);
        hiResCtx.clearRect(0, 0, FILM_W, FILM_H);
        hiResCtx.setTransform(RENDER_SCALE, 0, 0, RENDER_SCALE, 0, 0);
      },
    };

    // Reusable 1000x1000 scratch canvas for seamless horizontal rock-strata mirroring on scroll edges
    this.edgeMirrorScratch = document.createElement('canvas');
    this.edgeMirrorScratch.width = PANEL_SIZE;
    this.edgeMirrorScratch.height = PANEL_SIZE;

    // Build exact 1:1 monotone Hermite time-warp knots from `features.transitions`
    const transitions = features.transitions || [];
    const knots = [
      { realT: 0, canonicalT: 0 },
      ...transitions.map((rt, idx) => ({
        realT: rt,
        canonicalT: INTRO_SEC + idx * 6.0,
      })),
      { realT: film.duration, canonicalT: TOTAL_DURATION },
    ];

    this.timeWarp = createTimeWarpEngine({
      duration: film.duration,
      envelopeFps: 30,
      beats: features.beats || [],
      anvilHits: features.anvil_hits || [],
      envelope: features.envelope || [],
      knots,
    });

    this.p = null;
    this.brush = null;
    this.kit = null;
    this.ready = false;

    // Clear Outro thumbnail cache whenever custom assets change so Outro wall reflects uploads too
    const origSetBg = assets.setBackground?.bind(assets);
    if (origSetBg) {
      assets.setBackground = (id, img) => {
        origSetBg(id, img);
        this.kit?.outroTileCache?.clear();
        this.kit?.introEraBgCache?.clear();
      };
    }
    const origSetChar = assets.setCharacter?.bind(assets);
    if (origSetChar) {
      assets.setCharacter = (img) => {
        origSetChar(img);
        this.kit?.outroTileCache?.clear();
      };
    }
    const origReset = assets.reset?.bind(assets);
    if (origReset) {
      assets.reset = () => {
        origReset();
        this.kit?.outroTileCache?.clear();
        this.kit?.introEraBgCache?.clear();
      };
    }
  }

  async init() {
    if (this.ready) return;
    const P5 = window.p5;
    const brush = window.brush;
    if (!P5 || !brush) {
      throw new Error('p5 / p5.brush vendor scripts not loaded');
    }
    this.brush = brush;

    let host = document.getElementById('p5-webgl-stage');
    if (!host) {
      host = document.createElement('div');
      host.id = 'p5-webgl-stage';
      host.style.cssText = 'position:fixed;left:-9999px;top:0;width:960px;height:720px;pointer-events:none;opacity:0;overflow:hidden;';
      document.body.appendChild(host);
    }

    await new Promise((resolve, reject) => {
      try {
        const sketch = (p) => {
          this.p = p;
          if (brush?.instance) {
            brush.instance(p);
          }

          p.setup = () => {
            p.pixelDensity(1);
            const cnv = p.createCanvas(VIEW_W, VIEW_H, p.WEBGL);
            cnv.parent(host);
            p.noLoop();

            this.kit = createKit(p, brush);
            this.ready = true;
            resolve();
          };

          p.draw = () => {};
        };
        // eslint-disable-next-line no-new
        new P5(sketch);
      } catch (err) {
        reject(err);
      }
    });

    await Promise.all([
      this.liveSvgStage.init(this.canvas.parentElement),
      this.codeSizeHud.init(this.canvas.parentElement),
      preloadIntroDecorAssets(),
    ]);
    this.drawerState.liveSvgMounted = Boolean(this.liveSvgStage.ready);

    // Pre-bake the 12 Era Accordion backdrops once at startup so the `3.55s` Blacksmith -> Pelican
    // diagonal shutter transition runs at a locked 60fps with 0.0ms mid-playback stall!
    if (this.accordionDoc?.eraDrawers) {
      const initSync = this.timeWarp.sampleAudioSync(0);
      const renderSceneInit = (kit, slot, scene, params) =>
        renderScenePanel(kit, slot, scene, { ...params, assets: this.assets, sync: initSync });
      this._executeWebGLPass(() => {
        ensureIntroEraBackdrops(this.kit, renderSceneInit, this.accordionDoc.eraDrawers);
      });
    }

    // Warm up initial frame at t = 0
    this.renderAt(0);
  }

  sceneIndex(t) {
    const tr = this.features.transitions;
    if (t >= tr[20]) return 20;
    for (let i = 19; i >= 0; i--) {
      if (t >= tr[i]) return i;
    }
    return 0;
  }

  _executeWebGLPass(fn) {
    const p = this.p;
    const hooks = p?.constructor?.lifecycleHooks;
    p.resetMatrix();
    if (hooks?.predraw) {
      for (const h of hooks.predraw) h.call(p);
    }
    fn();
    if (hooks?.postdraw) {
      for (const h of hooks.postdraw) h.call(p);
    }
    p._renderer?.finishDraw?.();
  }

  renderAt(rawT) {
    const t = clamp(Number(rawT) || 0, 0, this.film.duration);
    const idx = this.sceneIndex(t);
    if (!this.ready || !this.p) {
      return { index: idx };
    }

    try {
      const sync = this.timeWarp.sampleAudioSync(t);
      const canonicalT = clamp(sync.canonicalT, 0, TOTAL_DURATION);
      const beatState = getBeatState(canonicalT);

      const frameSeed = ((Math.round(t * 1000) + 1) * 2654435761) >>> 0;
      this.p.randomSeed(frameSeed);
      this.p.noiseSeed(frameSeed);

      const phraseHit = this.lyrics.phraseAt(t);
      const activePhrase = phraseHit?.phrase || null;
      const outroStart = INTRO_SEC + SCENES_TOTAL_SEC; // 125.0s canonical

      let cam = null;
      let pelWorld = null;
      let renderedPanels = [];

      const renderSceneWithAssets = (kit, slot, scene, params) =>
        renderScenePanel(kit, slot, scene, {
          ...params,
          assets: this.assets,
          sync,
        });

      let drewIntro2D = false;
      let drewIntroDirect = false;
      let outroBlend2D = 0;

      // Fast-path for the 100% opaque Opening (`0.00s .. 9.95s`, before Scene 01 handoff at `10.02s`):
      // Skip hidden WebGL passes & offscreen canvas double-blits completely — draw directly onto `#film`!
      if (canonicalT < INTRO_SEC && t < 9.95) {
        if (this.accordionDoc?.eraDrawers && !this.kit.introEraBgCache?.size) {
          this._executeWebGLPass(() => {
            ensureIntroEraBackdrops(this.kit, renderSceneWithAssets, this.accordionDoc.eraDrawers);
          });
        }
        const ctx = this.ctx;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.fillStyle = '#120f0c';
        ctx.fillRect(0, 0, FILM_W, FILM_H);
        ctx.save();
        ctx.scale(RENDER_SCALE, RENDER_SCALE);
        drewIntro2D = renderAccordionIntroOverlay(
          this.kit,
          { drawingContext: ctx },
          t,
          sync,
          this.forgeTimeline,
          this.forgeSvgBank,
          this.accordionDoc,
          this.drawerState
        );
        ctx.restore();
        drewIntroDirect = true;
      } else {
        this._executeWebGLPass(() => {
          const p = this.p;

          if (canonicalT > outroStart + 0.16) {
            this.hiResOverlay.clear();
            renderOutro(this.kit, this.hiResOverlay, canonicalT, renderSceneWithAssets);
            outroBlend2D = 1.0;
            p.background(17, 15, 13);
          } else {
            cam = getCameraState(canonicalT, sync.anvilShock);
            pelWorld = getPelicanWorldState(canonicalT);
            const handoffEndT = this.accordionDoc?.handoffEndRealT ?? 11.447;
            const hideWorldPelican = canonicalT < INTRO_SEC && t < handoffEndT - 0.26;
            const visibleIndices = getVisiblePanelIndices(cam);

            renderedPanels = visibleIndices.map((panelIdx, slotIdx) => {
              const scene = SCENES[panelIdx];
              const slot = this.kit.getSlot(slotIdx);
              slot.usedFb = false;
              slot.g2d.clear();

              const rawLocalT = canonicalT - scene.t0;
              const panelLocalT = clamp(rawLocalT, 0, 6.0);
              const pelicanLocalX = pelWorld.worldX - scene.worldX0;

              renderSceneWithAssets(this.kit, slot, scene, {
                t: canonicalT,
                localT: panelLocalT,
                rawLocalT,
                pelicanLocalX,
                pedalAngle: pelWorld.pedalAngle,
                speedScale: pelWorld.speedScale,
                isOutroThumbnail: false,
                hidePelican: hideWorldPelican,
                includeLeftOutcrop: false,
              });

              return { scene, slot, mirrorFb: false };
            });

            // Seamless Sahara Tassili rock-wall prologue panel filling `[-PANEL_SIZE, 0]` (100% continuous 2000px cave wall)
            if (cam.camX < 1200) {
              const preSlot = this.kit.getSlot(3);
              preSlot.usedFb = false;
              preSlot.g2d.clear();

              const s0RawLocalT = canonicalT - SCENES[0].t0;
              const s0ClampedLocalT = clamp(s0RawLocalT, 0, 6.0);
              renderSceneWithAssets(this.kit, preSlot, SCENES[0], {
                t: canonicalT,
                localT: s0ClampedLocalT,
                rawLocalT: s0RawLocalT,
                pelicanLocalX: -9999,
                pedalAngle: 0,
                speedScale: 1,
                isOutroThumbnail: false,
                hidePelican: true,
                includeLeftOutcrop: false,
              });

              const mCtx = this.edgeMirrorScratch.getContext('2d');
              mCtx.clearRect(0, 0, PANEL_SIZE, PANEL_SIZE);
              mCtx.drawImage(preSlot.g2d.canvas, 0, 0);

              const preCtx = preSlot.g2d.drawingContext;
              preCtx.save();
              preCtx.clearRect(0, 0, PANEL_SIZE, PANEL_SIZE);
              preCtx.translate(PANEL_SIZE, 0);
              preCtx.scale(-1, 1);
              preCtx.drawImage(this.edgeMirrorScratch, 0, 0);
              preCtx.restore();

              if (!hideWorldPelican && pelWorld.visibleInScroll && pelWorld.worldX < 240) {
                preCtx.save();
                if (this.assets?.character) {
                  const img = this.assets.character;
                  const fit = Math.min(240 / img.width, 240 / img.height);
                  const cw = img.width * fit;
                  const ch = img.height * fit;
                  preCtx.drawImage(
                    img,
                    pelWorld.worldX + PANEL_SIZE - cw * 0.5,
                    ROAD_EDGE_Y - ch + 6,
                    cw,
                    ch
                  );
                } else {
                  renderSaharaPelicanOnly(
                    preCtx,
                    this.kit,
                    pelWorld.worldX + PANEL_SIZE,
                    pelWorld.pedalAngle,
                    pelWorld.speedScale,
                    s0ClampedLocalT
                  );
                }
                preCtx.restore();
              }

              const preScene = {
                ...SCENES[0],
                id: 's01_sahara_pre',
                worldX0: -PANEL_SIZE,
                num: 0,
                index: -1,
              };
              renderedPanels.unshift({ scene: preScene, slot: preSlot, mirrorFb: true });
            } else if (cam.camX > 18800) {
            // Seamless Nano-OLED coordinate workbench epilogue panel filling `[20000, 21000]` (zero right blank wall!)
            const postSlot = this.kit.getSlot(3);
            postSlot.usedFb = false;
            postSlot.g2d.clear();
            const postCtx = postSlot.g2d.drawingContext;
            const customS20Bg = this.assets?.backgrounds?.get(getCodexSceneId(SCENES[19].id));

            if (customS20Bg) {
              const s19RawLocalT = canonicalT - SCENES[19].t0;
              renderSceneWithAssets(this.kit, postSlot, SCENES[19], {
                t: canonicalT,
                localT: clamp(s19RawLocalT, 0, 6.0),
                rawLocalT: s19RawLocalT,
                pelicanLocalX: -9999,
                pedalAngle: 0,
                speedScale: 1,
                isOutroThumbnail: false,
              });
              const mCtx = this.edgeMirrorScratch.getContext('2d');
              mCtx.clearRect(0, 0, PANEL_SIZE, PANEL_SIZE);
              mCtx.drawImage(postSlot.g2d.canvas, 0, 0);
              postCtx.save();
              postCtx.clearRect(0, 0, PANEL_SIZE, PANEL_SIZE);
              postCtx.translate(PANEL_SIZE, 0);
              postCtx.scale(-1, 1);
              postCtx.drawImage(this.edgeMirrorScratch, 0, 0);
              postCtx.restore();
            } else {
              const postExt = getPostCodeExtension(this.kit);
              postCtx.drawImage(postExt.canvas || postExt, 0, 0);
            }

            const postLocalPelX = pelWorld.worldX - 20 * PANEL_SIZE;
            if (pelWorld.visibleInScroll && postLocalPelX > -220 && postLocalPelX < PANEL_SIZE + 220) {
              postCtx.save();
              if (this.assets?.character) {
                const img = this.assets.character;
                const fit = Math.min(240 / img.width, 240 / img.height);
                const cw = img.width * fit;
                const ch = img.height * fit;
                postCtx.drawImage(
                  img,
                  postLocalPelX - cw * 0.5,
                  ROAD_EDGE_Y - ch + 6,
                  cw,
                  ch
                );
              } else {
                const postRig = computePelicanRig({
                  x: postLocalPelX,
                  y: ROAD_EDGE_Y,
                  pedalAngle: pelWorld.pedalAngle,
                  wheelAngle: pelWorld.worldX / 46,
                  scale: 1.0,
                  speedScale: pelWorld.speedScale,
                  time: canonicalT,
                });
                drawRig2D(postCtx, postRig, {
                  featherFill: '#e8f4ff',
                  featherShade: '#93c5fd',
                  beakFill: '#fbbf24',
                  pouchFill: '#fb7185',
                  frameStroke: '#38bdf8',
                  inkOutline: '#0f172a',
                });
              }
              postCtx.restore();
            }

            const postScene = {
              ...SCENES[19],
              worldX0: 20 * PANEL_SIZE,
              num: 0,
              index: -2,
            };
            renderedPanels.push({ scene: postScene, slot: postSlot, mirrorFb: Boolean(customS20Bg) });
          }

          // Gallery wall base in WebGL world space
          p.background(24, 21, 18);
          p.push();
          p.scale(cam.scale);
          p.translate(-cam.camX, -cam.camY);

          p.noStroke();
          p.fill(38, 33, 28);
          p.rect(-1500, -260, 22800, 1318);
          p.fill(20, 17, 14);
          p.rect(-1500, 1058, 22800, 420);

          // Composite visible 1000x1000 panels (including seamless `[-1000, 0]` & `[20000, 21000]` edge extensions)
          p.imageMode(p.CORNER);
          p.noTint();
          for (const { scene, slot, mirrorFb } of renderedPanels) {
            if (slot.usedFb) {
              if (mirrorFb) {
                p.push();
                p.translate(scene.worldX0 + PANEL_SIZE, 0);
                p.scale(-1, 1);
                p.image(slot.fb, 0, 0, PANEL_SIZE, PANEL_SIZE);
                p.pop();
              } else {
                p.image(slot.fb, scene.worldX0, 0, PANEL_SIZE, PANEL_SIZE);
              }
            }
            p.image(slot.g2d, scene.worldX0, 0, PANEL_SIZE, PANEL_SIZE);
          }

          // 3D Period-authentic museum mountings & borders
          for (const { scene } of renderedPanels) {
            const isActive = beatState.sceneIndex === scene.index;
            if (scene.id === 's19_shortvideo' && cam.surroundDim > 0.6) continue;
            drawPanelFrame(p, scene, isActive, cam.framePulse, this.kit);
          }

          // Cinema velvet curtains for #19 ShortVideo (`4:3 -> 9:16 -> 4:3`)
          if (cam.surroundDim > 0.005) {
            const panel19X0 = SCENES[18].worldX0;
            const halfViewWorldW = (VIEW_W * 0.56) / cam.scale;
            const curtainSlide = smootherstep(0.0, 0.72, cam.curtainProgress ?? 1);
            const leftEdgeX = lerp(cam.camX - halfViewWorldW, panel19X0, curtainSlide);
            const rightEdgeX = lerp(cam.camX + halfViewWorldW, panel19X0 + PANEL_SIZE, curtainSlide);
            const curtainAlpha = Math.round(cam.surroundDim * 252);

            p.noStroke();
            p.fill(5, 5, 8, curtainAlpha);
            p.rect(leftEdgeX - 3000, -500, 3000, 2200);
            p.rect(rightEdgeX, -500, 3000, 2200);
            p.rect(leftEdgeX, -500, rightEdgeX - leftEdgeX, 500);
            p.rect(leftEdgeX, PANEL_SIZE, rightEdgeX - leftEdgeX, 700);
          }

          // Cross-frame material micro-physics & anvil/bell spark ripples
          renderThresholdMicroPhysics(p, this.kit, canonicalT, cam, pelWorld);
          renderSongAnvilAndBellFX(p, pelWorld, beatState, sync, activePhrase);
          p.pop();

          // Accordion-Drawer Multi-Redraw Opening (`canonicalT < 5.0s`, `realT < 11.45s`)
          if (canonicalT < INTRO_SEC) {
            if (this.accordionDoc?.eraDrawers) {
              ensureIntroEraBackdrops(this.kit, renderSceneWithAssets, this.accordionDoc.eraDrawers);
            }
            const handoffEndT = this.accordionDoc?.handoffEndRealT ?? 11.447;
            const handoffTarget = cam && pelWorld ? {
              x: VIEW_W * 0.5 + (pelWorld.worldX - cam.camX) * cam.scale,
              y: VIEW_H * 0.5 + (ROAD_EDGE_Y - cam.camY) * cam.scale,
              scale: cam.scale,
              pedalAngle: pelWorld.pedalAngle,
              speedScale: pelWorld.speedScale,
              pelicanOverlayAlpha: 1 - smootherstep(handoffEndT - 0.26, handoffEndT - 0.04, t),
            } : null;
            this.hiResOverlay.clear();
            drewIntro2D = renderAccordionIntroOverlay(
              this.kit,
              this.hiResOverlay,
              t,
              sync,
              this.forgeTimeline,
              this.forgeSvgBank,
              this.accordionDoc,
              this.drawerState,
              handoffTarget
            );
          } else if (canonicalT >= outroStart - 0.14) {
            // #20 -> Outro Cross-Dissolve (`124.86s -> 125.14s`)
            const blend = smootherstep(outroStart - 0.14, outroStart + 0.14, canonicalT);
            if (blend > 0.002) {
              this.hiResOverlay.clear();
              renderOutro(this.kit, this.hiResOverlay, canonicalT, renderSceneWithAssets);
              outroBlend2D = blend;
            }
          }
          }
        });
      }

      // Sync Live 4K Infinite-Vector `<svg>` Gold-Printmaking Blacksmith Stage (`0.00s .. 4.45s`)
      const activeForgePolys =
        drewIntro2D && canonicalT < INTRO_SEC && t < 4.45 ? this.drawerState.renderForgeSlats : null;
      const forgeDomAlpha = activeForgePolys ? (this.drawerState.forgeDomAlpha || 0) : 0;
      const forgeWipeU = activeForgePolys ? (this.drawerState.forgeWipeU || 0) : 1;
      this.liveSvgStage.update(t, activeForgePolys, forgeDomAlpha, forgeWipeU);

      const ctx = this.ctx;
      if (!drewIntroDirect) {
        // 1. GPU hardware bilinear blit from WebGL canvas onto `#film` (`imageSmoothingQuality='medium'` avoids CPU Lanczos stall!)
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'medium';
        ctx.drawImage(this.p.canvas, 0, 0, FILM_W, FILM_H);

        // 1.5. Composite Intro Handoff (`9.95s..11.45s`) / Outro Exhibition Wall overlay
        if (drewIntro2D) {
          ctx.drawImage(this.hiResOverlay.canvas, 0, 0, FILM_W, FILM_H);
        } else if (outroBlend2D > 0.002) {
          ctx.save();
          ctx.globalAlpha = outroBlend2D;
          ctx.fillStyle = '#110f0d';
          ctx.fillRect(0, 0, FILM_W, FILM_H);
          ctx.drawImage(this.hiResOverlay.canvas, 0, 0, FILM_W, FILM_H);
          ctx.restore();
        }
      }

      // 2. Native 4K Museum Picture-Lamp Volumetric Spotlights, Chiaroscuro, Glass Sheen & Curator Plaques
      if (cam && renderedPanels.length > 0 && canonicalT >= 4.72 && canonicalT <= outroStart + 0.14) {
        const opticsAlpha =
          smootherstep(4.72, 5.15, canonicalT) *
          (1 - smootherstep(outroStart - 0.14, outroStart + 0.14, canonicalT));
        if (opticsAlpha > 0.01) {
          ctx.save();
          ctx.scale(RENDER_SCALE, RENDER_SCALE);
          ctx.globalAlpha = opticsAlpha;
          renderMuseumGalleryOptics2D(ctx, cam, renderedPanels, beatState.sceneIndex, sync, t);
          ctx.restore();
        }
      }

      // 3. Native 4K Spatial Kinetic Typography & Graphic-Prop Engine (`LyricPainter`)
      const activeGithubScene = SCENES[clamp(beatState.sceneIndex, 0, 19)];
      const codexSceneId = canonicalT < 4.5
        ? 'intro'
        : canonicalT >= outroStart
          ? 'outro'
          : getCodexSceneId(activeGithubScene.id);
      const pal = this.palettes[codexSceneId] || { accent: '#f4c76b' };
      const pelicanScreenPos =
        cam && pelWorld
          ? {
              x: VIEW_W * 0.5 + (pelWorld.worldX - cam.camX) * cam.scale,
              y: VIEW_H * 0.5 + (ROAD_EDGE_Y - cam.camY) * cam.scale,
            }
          : null;
      ctx.save();
      ctx.scale(RENDER_SCALE, RENDER_SCALE);
      this.lyrics.draw(
        ctx,
        t,
        pal.accent,
        sync.beatPulse,
        codexSceneId,
        sync.anvilShock,
        VIEW_W,
        VIEW_H,
        pelicanScreenPos
      );
      ctx.restore();

      // 4. Continuous Pure-Code Download Track (`0.00s..168.88s`) + Post-Pelican File-Size Climax (`168.88s..174.64s`)
      this.codeSizeHud.draw(t, sync);
    } catch (err) {
      this.errors.push({ scene: 'fusion_renderer', time: t, message: String(err?.stack || err) });
    }

    return { index: idx };
  }
}
