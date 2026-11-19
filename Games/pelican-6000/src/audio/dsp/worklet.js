import { MultitrackEngine } from './engine.js';

class FourTrackProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    this.engine = new MultitrackEngine(options.processorOptions.manifest, sampleRate, options.processorOptions.payloads);
    this.blocks = 0;
    this.port.onmessage = ({ data }) => {
      if (data.type === 'play') this.engine.running = true;
      if (data.type === 'pause') this.engine.running = false;
      if (data.type === 'seek') this.engine.seek(data.time);
      if (data.type === 'gain') this.engine.setGain(data.track, data.value);
      if (data.type === 'dispose') this.disposed = true;
    };
  }

  process(inputs, outputs) {
    if (this.disposed) return false;
    this.engine.process(outputs[0][0], outputs[0][1]);
    if (++this.blocks % 24 === 0) this.port.postMessage({ time: this.engine.frame / sampleRate,
      running: this.engine.running, computed: this.engine.totalComputed, meters: this.engine.lastMeters });
    return true;
  }
}

registerProcessor('four-track-spectral-synth', FourTrackProcessor);
