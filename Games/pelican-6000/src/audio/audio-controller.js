import { loadParameters } from './parameters.js';

export class AudioController {
  constructor(manifest, onUpdate) {
    this.manifest = manifest;
    this.onUpdate = onUpdate;
    this.time = 0;
    this.running = false;
    this.volume = 0.85;
    this.muted = false;
    this.payloadsPromise = null;
    this.payloads = null;
    this.context = null;
    this.master = null;
    this.node = null;
    this.ready = null;
  }

  preload() {
    if (!this.payloadsPromise) {
      this.payloadsPromise = loadParameters(this.manifest, (n, total) => {
        this.onProgress?.(n, total);
      }).then((payloads) => {
        this.payloads = payloads;
        return payloads;
      }).catch((err) => {
        this.payloadsPromise = null;
        throw err;
      });
    }
    return this.payloadsPromise;
  }

  async ensureContext() {
    if (!this.context) {
      this.context = new AudioContext({ sampleRate: 48000, latencyHint: 'playback' });
      this.master = this.context.createGain();
      this.master.gain.value = this.muted ? 0 : this.volume;
      this.master.connect(this.context.destination);
      this.ready = this.context.audioWorklet.addModule(new URL('./dsp/worklet.js', import.meta.url));
    }
    await this.context.resume();
    await this.ready;
  }

  async ensureSynth() {
    if (this.node) return;
    this.onLoading?.(true);
    try {
      const payloads = this.payloads || (await this.preload());
      this.node = new AudioWorkletNode(this.context, 'four-track-spectral-synth', {
        numberOfInputs: 0,
        numberOfOutputs: 1,
        outputChannelCount: [2],
        processorOptions: { manifest: this.manifest, payloads },
      });
      this.node.onprocessorerror = () => {
        this.onError?.(new Error('音频合成工作线程发生错误，请刷新页面重试。'));
      };
      this.node.port.onmessage = ({ data }) => {
        this.time = data.time;
        this.running = data.running;
        this.onUpdate?.(data);
      };
      this.node.connect(this.master);
      this.node.port.postMessage({ type: 'seek', time: this.time });
    } finally {
      this.onLoading?.(false);
    }
  }

  async play() {
    await this.ensureContext();
    if (this.time >= this.manifest.duration - 0.05) {
      this.seek(0);
    }
    await this.ensureSynth();
    this.node.port.postMessage({ type: 'seek', time: this.time });
    this.node.port.postMessage({ type: 'play' });
    this.running = true;
    this.onUpdate?.({ time: this.time, running: true });
  }

  pause() {
    this.node?.port.postMessage({ type: 'pause' });
    this.running = false;
    this.onUpdate?.({ time: this.time, running: false });
  }

  seek(time) {
    this.time = Math.max(0, Math.min(this.manifest.duration, time));
    this.node?.port.postMessage({ type: 'seek', time: this.time });
    this.onUpdate?.({ time: this.time, running: this.running });
  }

  setMuted(muted) {
    this.muted = Boolean(muted);
    if (this.master && this.context) {
      this.master.gain.setTargetAtTime(this.muted ? 0 : this.volume, this.context.currentTime, 0.015);
    }
  }
}
