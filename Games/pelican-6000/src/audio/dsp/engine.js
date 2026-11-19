import { SpectralStream } from './spectral-stream.js';

export class MultitrackEngine {
  constructor(manifest, sampleRate, payloads) {
    this.manifest = manifest;
    this.sampleRate = sampleRate;
    this.end = Math.ceil(manifest.duration * sampleRate);
    this.tracks = manifest.tracks.map(track => ({ id: track.id, gain: 1, target: 1,
      streams: track.streams.map(stream => ({ channel: stream.channel, synth: new SpectralStream(payloads[stream.file], sampleRate) })) }));
    this.frame = 0;
    this.totalComputed = 0;
    this.running = false;
    this.lastMeters = {};
  }

  setGain(id, value) {
    const track = this.tracks.find(item => item.id === id);
    if (track) track.target = Math.max(0, Math.min(1.5, value));
  }

  seek(seconds) {
    this.frame = Math.min(this.end, Math.max(0, Math.floor(seconds * this.sampleRate)));
    if (seconds >= this.manifest.duration) this.frame = this.end;
    for (const track of this.tracks) for (const stream of track.streams) stream.synth.reset();
  }

  process(left, right) {
    left.fill(0); right.fill(0);
    if (!this.running) return;
    const meters = {};
    for (const track of this.tracks) meters[track.id] = 0;
    let actual = 0;
    for (let i = 0; i < left.length; i++) {
      if (this.frame >= this.end) { this.running = false; break; }
      let l = 0, r = 0;
      for (const track of this.tracks) {
        track.gain += (track.target - track.gain) * 0.003;
        let a = 0, b = 0;
        for (const stream of track.streams) {
          const value = stream.synth.valueAt(this.frame) * track.gain;
          a += value;
          b += stream.channel === 'side' ? -value : value;
        }
        meters[track.id] += (a * a + b * b) * 0.5;
        l += a; r += b;
      }
      // Leave normal levels linear. Only catch exceptional overshoots from lossy reconstruction.
      const ceiling = value => Math.abs(value) <= 0.96 ? value : Math.sign(value) * (0.96 + 0.03 * Math.tanh((Math.abs(value) - 0.96) / 0.03));
      left[i] = ceiling(l);
      right[i] = ceiling(r);
      this.frame++;
      actual++;
    }
    this.totalComputed += actual;
    for (const id in meters) this.lastMeters[id] = Math.sqrt(meters[id] / Math.max(1, actual));
  }
}
