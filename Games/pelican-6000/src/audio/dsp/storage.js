export function unpackSpectrum(raw) {
  const view = new DataView(raw.buffer, raw.byteOffset, raw.byteLength);
  if (String.fromCharCode(...raw.subarray(0, 4)) !== 'MDP3') throw new Error('Invalid packed parameters');
  const n = view.getUint16(8, true), band = view.getUint16(10, true), frames = view.getUint32(12, true);
  const nonzero = view.getUint32(24, true), scaleBytes = n / band * 2;
  const stride = n + scaleBytes;
  const maskStart = 28, maskBytes = Math.ceil(frames * n / 8);
  const signStart = maskStart + maskBytes, signBytes = Math.ceil(nonzero / 8);
  const magnitudeStart = signStart + signBytes, scaleStart = magnitudeStart + nonzero;
  if (raw.byteLength !== scaleStart + frames * scaleBytes) throw new Error('Truncated packed parameters');
  const output = new Uint8Array(24 + frames * stride);
  output.set(raw.subarray(0, 24)); output.set([77, 68, 81, 50], 0);
  let nonzeroIndex = 0;
  for (let frame = 0; frame < frames; frame++) {
    const destination = 24 + frame * stride;
    output.set(raw.subarray(scaleStart + frame * scaleBytes, scaleStart + (frame + 1) * scaleBytes), destination);
    for (let k = 0; k < n; k++) {
      const index = frame * n + k;
      if ((raw[maskStart + (index >> 3)] & (128 >> (index & 7))) === 0) continue;
      const magnitude = raw[magnitudeStart + nonzeroIndex];
      const negative = raw[signStart + (nonzeroIndex >> 3)] & (128 >> (nonzeroIndex & 7));
      output[destination + scaleBytes + k] = negative ? 256 - magnitude : magnitude;
      nonzeroIndex++;
    }
  }
  if (nonzeroIndex !== nonzero) throw new Error('Invalid coefficient count');
  return output.buffer;
}
