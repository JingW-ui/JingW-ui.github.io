function base64ToArrayBuffer(b64) {
  const binStr = atob(b64);
  const bytes = new Uint8Array(binStr.length);
  for (let i = 0; i < binStr.length; i++) {
    bytes[i] = binStr.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function loadParameters(manifest, onProgress) {
  const worker = new Worker(new URL('./parameter-worker.js', import.meta.url));
  const pending = new Map();
  const streams = manifest.tracks.flatMap((track) => track.streams);
  let completed = 0;
  worker.onmessage = ({ data }) => {
    const request = pending.get(data.id);
    if (!request) return;
    pending.delete(data.id);
    if (data.error) request.reject(new Error(data.error));
    else {
      request.resolve(data.buffer);
      onProgress?.(++completed, streams.length);
    }
  };
  worker.onerror = (event) => {
    for (const request of pending.values()) {
      request.reject(new Error(event.message || 'Worker decode failed'));
    }
    pending.clear();
  };
  try {
    const pairs = await Promise.all(
      streams.map(async (stream, id) => {
        const jsName = stream.file.replace(/\.lzpar$/, '.js');
        const mod = await import(`../../data/audio/${jsName}`);
        const buffer = base64ToArrayBuffer(mod.default);
        const result = new Promise((resolve, reject) => {
          pending.set(id, { resolve, reject });
        });
        worker.postMessage({ id, buffer }, [buffer]);
        return [stream.file, await result];
      })
    );
    return Object.fromEntries(pairs);
  } finally {
    worker.terminate();
  }
}
