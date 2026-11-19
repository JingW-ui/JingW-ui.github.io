import { clamp, lerp } from './math.js';
import { AudioController } from '../audio/audio-controller.js';

export class AudioClock extends EventTarget {
  constructor(manifest, features) {
    super();
    this.manifest = manifest;
    this.features = features;
    this.anvilHits = features.anvil_hits || [];
    this.duration = features.duration || manifest.duration || 174.64;

    this._time = 0;
    this._playing = false;
    this._loading = false;
    this._syncWallMs = performance.now();
    this._syncAudioTime = 0;
    this._hasWorkletTick = false;

    this.controller = new AudioController(manifest, (data) => this._onWorkletUpdate(data));
    this.controller.onLoading = (loading) => {
      this._loading = loading;
      this.dispatchEvent(new Event('statechange'));
    };
  }

  preload() {
    return this.controller.preload();
  }

  _onWorkletUpdate(data) {
    if (typeof data?.time !== 'number') return;
    const now = performance.now();
    const wTime = clamp(data.time, 0, this.duration);

    if (this._playing) {
      const pred = this._syncAudioTime + (now - this._syncWallMs) / 1000;
      if (!this._hasWorkletTick || Math.abs(pred - wTime) > 0.045) {
        this._syncAudioTime = wTime;
        this._syncWallMs = now;
      } else {
        // Gentle phase-lock correction keeps 60fps animation smooth while locked to audio frames
        this._syncAudioTime = pred + (wTime - pred) * 0.25;
        this._syncWallMs = now;
      }
      this._hasWorkletTick = true;
      this._time = clamp(this._syncAudioTime, 0, this.duration);

      if (data.running === false) {
        this._playing = false;
        this._time = wTime >= this.duration - 0.15 ? this.duration : wTime;
        this.dispatchEvent(new Event(wTime >= this.duration - 0.15 ? 'ended' : 'statechange'));
      }
    } else {
      this._time = wTime;
    }
  }

  get time() {
    if (!this._playing) return this._time;
    const elapsed = Math.max(0, (performance.now() - this._syncWallMs) / 1000);
    return clamp(this._syncAudioTime + elapsed, 0, this.duration);
  }

  get playing() {
    return this._playing;
  }

  get loading() {
    return this._loading;
  }

  get muted() {
    return this.controller.muted;
  }

  set muted(v) {
    this.controller.setMuted(v);
    this.dispatchEvent(new Event('statechange'));
  }

  async toggle() {
    if (this._playing) {
      this._time = this.time;
      this._playing = false;
      this._hasWorkletTick = false;
      this.controller.pause();
      this.dispatchEvent(new Event('statechange'));
      return;
    }
    if (this._time >= this.duration - 0.05) {
      this.seek(0);
    }
    this.controller.time = this._time;
    this._syncAudioTime = this._time;
    this._syncWallMs = performance.now();
    this._hasWorkletTick = false;
    await this.controller.play();
    this._syncAudioTime = this._time;
    this._syncWallMs = performance.now();
    this._playing = true;
    this.dispatchEvent(new Event('statechange'));
  }

  seek(t) {
    const next = clamp(t, 0, this.duration);
    this._time = next;
    this._syncAudioTime = next;
    this._syncWallMs = performance.now();
    this._hasWorkletTick = false;
    this.controller.seek(next);
    this.dispatchEvent(new Event('seeked'));
  }

  sample(t) {
    const q = clamp(t * this.features.fps, 0, this.features.envelope.length - 1);
    const i = Math.floor(q);
    const energy = lerp(
      this.features.envelope[i],
      this.features.envelope[Math.min(i + 1, this.features.envelope.length - 1)],
      q - i
    );
    let minBeatDelta = 10;
    const beats = this.features.beats;
    for (let k = 0; k < beats.length; k++) {
      const d = Math.abs(t - beats[k]);
      if (d < minBeatDelta) minBeatDelta = d;
    }
    let anvil = 0;
    for (let k = 0; k < this.anvilHits.length; k++) {
      const dt = t - this.anvilHits[k];
      if (dt >= -0.01 && dt < 0.32) {
        const imp = Math.exp(-Math.max(0, dt) * 15) * (0.68 + 0.32 * energy);
        if (imp > anvil) anvil = imp;
      }
    }
    return { energy, beat: Math.exp(-minBeatDelta * 12), anvil };
  }
}
