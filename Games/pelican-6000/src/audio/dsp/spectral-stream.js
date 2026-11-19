import { fftPlan } from './fft.js';
import { interpolate } from './resampler.js';

function float16(bits) {
  const sign = bits & 0x8000 ? -1 : 1;
  const exponent = (bits >> 10) & 31, fraction = bits & 1023;
  if (!exponent) return sign * fraction * 2 ** -24;
  if (exponent === 31) return fraction ? NaN : sign * Infinity;
  return sign * (1 + fraction / 1024) * 2 ** (exponent - 15);
}

export class SpectralStream {
  constructor(buffer, outputRate) {
    this.data = new DataView(buffer);
    const magic = String.fromCharCode(...new Uint8Array(buffer, 0, 4));
    if (magic !== 'MDQ2') throw new Error('Invalid spectral parameter format');
    this.rate = this.data.getUint32(4, true);
    this.n = this.data.getUint16(8, true);
    this.bandSize = this.data.getUint16(10, true);
    this.frameCount = this.data.getUint32(12, true);
    this.sampleCount = this.data.getUint32(16, true);
    this.qmax = this.data.getUint8(20);
    this.power = this.data.getUint8(21) / 100;
    this.groups = this.n / this.bandSize;
    this.stride = this.groups * 2 + this.n;
    if (buffer.byteLength !== 24 + this.frameCount * this.stride) throw new Error('Truncated spectral parameters');
    this.ratio = this.rate / outputRate;
    this.plan = fftPlan(this.n * 8);
    this.real = new Float64Array(this.n * 8);
    this.imag = new Float64Array(this.n * 8);
    this.window = Float64Array.from({ length: this.n * 2 }, (_, i) => Math.sin(Math.PI * (i + 0.5) / (this.n * 2)));
    this.dequantize = Float64Array.from({ length: this.qmax + 1 }, (_, q) => (q / this.qmax) ** (1 / this.power));
    this.transforms = 0;
    this.reset();
  }

  reset() { this.frameCache = new Map(); this.blockCache = new Map(); }

  inverseFrame(index) {
    if (this.frameCache.has(index)) return this.frameCache.get(index);
    const output = new Float32Array(this.n * 2);
    if (index < 0 || index >= this.frameCount) return output;
    this.real.fill(0); this.imag.fill(0);
    const offset = 24 + index * this.stride;
    for (let group = 0; group < this.groups; group++) {
      const scale = float16(this.data.getUint16(offset + group * 2, true));
      if (!scale) continue;
      for (let j = 0; j < this.bandSize; j++) {
        const k = group * this.bandSize + j;
        const q = this.data.getInt8(offset + this.groups * 2 + k);
        const value = Math.sign(q) * this.dequantize[Math.abs(q)] * scale;
        const bin = 2 * k + 1;
        this.real[bin] = value;
        this.real[this.real.length - bin] = value;
      }
    }
    this.plan.transform(this.real, this.imag);
    for (let i = 0; i < output.length; i++) output[i] = this.real[this.n + 1 + 2 * i] * 8 * this.window[i];
    this.frameCache.set(index, output);
    if (this.frameCache.size > 4) this.frameCache.delete(this.frameCache.keys().next().value);
    this.transforms++;
    return output;
  }

  block(index) {
    if (this.blockCache.has(index)) return this.blockCache.get(index);
    const a = this.inverseFrame(index), b = this.inverseFrame(index + 1);
    const output = new Float32Array(this.n);
    for (let i = 0; i < this.n; i++) output[i] = a[i + this.n] + b[i];
    this.blockCache.set(index, output);
    if (this.blockCache.size > 4) this.blockCache.delete(this.blockCache.keys().next().value);
    return output;
  }

  read(index) {
    if (index < 0 || index >= this.sampleCount) return 0;
    const block = Math.floor(index / this.n);
    return this.block(block)[index - block * this.n];
  }

  valueAt(outputFrame) { return interpolate(this, outputFrame * this.ratio); }
}
