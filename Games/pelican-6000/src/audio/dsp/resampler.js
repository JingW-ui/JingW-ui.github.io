const PHASES = 128;
const TAPS = 16;
const table = new Float64Array((PHASES + 1) * TAPS);
function sinc(x) { return Math.abs(x) < 1e-10 ? 1 : Math.sin(Math.PI * x) / (Math.PI * x); }
for (let phase = 0; phase <= PHASES; phase++) {
  let sum = 0;
  for (let tap = 0; tap < TAPS; tap++) {
    const x = tap - 7 - phase / PHASES;
    const value = Math.abs(x) >= 8 ? 0 : sinc(x) * sinc(x / 8);
    table[phase * TAPS + tap] = value;
    sum += value;
  }
  for (let tap = 0; tap < TAPS; tap++) table[phase * TAPS + tap] /= sum;
}

export function interpolate(stream, sourcePosition) {
  const base = Math.floor(sourcePosition);
  const phase = Math.round((sourcePosition - base) * PHASES);
  const offset = phase * TAPS;
  let value = 0;
  for (let tap = 0; tap < TAPS; tap++) value += stream.read(base + tap - 7) * table[offset + tap];
  return value;
}
