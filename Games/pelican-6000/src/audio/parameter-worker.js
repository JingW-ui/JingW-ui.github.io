importScripts('../../assets/vendor/lzma-d-min.js');
const codec = import('./dsp/storage.js');

self.onmessage = async ({ data }) => {
  try {
    const { unpackSpectrum } = await codec;
    const decoded = self.LZMA.decompress(new Uint8Array(data.buffer));
    if (typeof decoded === 'string') throw new Error('Unexpected text in binary parameters');
    const buffer = unpackSpectrum(Uint8Array.from(decoded));
    self.postMessage({ id: data.id, buffer }, [buffer]);
  } catch (error) {
    self.postMessage({ id: data.id, error: error.message || String(error) });
  }
};
