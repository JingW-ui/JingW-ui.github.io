const plans = new Map();

class InverseFFT {
  constructor(size) {
    this.size = size;
    this.reverse = new Uint32Array(size);
    const bits = Math.log2(size);
    for (let i = 0; i < size; i++) {
      let value = i, reversed = 0;
      for (let b = 0; b < bits; b++) { reversed = (reversed << 1) | (value & 1); value >>>= 1; }
      this.reverse[i] = reversed;
    }
    this.cos = new Float64Array(size / 2);
    this.sin = new Float64Array(size / 2);
    for (let i = 0; i < size / 2; i++) {
      this.cos[i] = Math.cos(2 * Math.PI * i / size);
      this.sin[i] = Math.sin(2 * Math.PI * i / size);
    }
  }

  transform(real, imag) {
    const n = this.size;
    for (let i = 0; i < n; i++) {
      const j = this.reverse[i];
      if (j > i) {
        let v = real[i]; real[i] = real[j]; real[j] = v;
        v = imag[i]; imag[i] = imag[j]; imag[j] = v;
      }
    }
    for (let width = 2; width <= n; width *= 2) {
      const half = width / 2, stride = n / width;
      for (let base = 0; base < n; base += width) {
        for (let j = 0; j < half; j++) {
          const p = base + j, q = p + half, twiddle = j * stride;
          const c = this.cos[twiddle], s = this.sin[twiddle];
          const r = real[q] * c - imag[q] * s;
          const im = real[q] * s + imag[q] * c;
          real[q] = real[p] - r; imag[q] = imag[p] - im;
          real[p] += r; imag[p] += im;
        }
      }
    }
    for (let i = 0; i < n; i++) { real[i] /= n; imag[i] /= n; }
  }
}

export function fftPlan(size) {
  if (!plans.has(size)) plans.set(size, new InverseFFT(size));
  return plans.get(size);
}
