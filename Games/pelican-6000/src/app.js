import { AssetStore } from './state/assets.js';
import { AudioClock } from './core/audio.js';
import { FilmRenderer } from './core/renderer.js';
import { bindPlayer } from './components/player.js';

async function main() {
  const read = (p) =>
    fetch('./data/' + p).then((r) => {
      if (!r.ok) throw new Error(p);
      return r.json();
    });

  const [
    film,
    features,
    lyrics,
    palettes,
    forgeStrikes,
    lyricChoreo,
    accordionDoc,
    codePayloadStory,
    audioManifest,
  ] = await Promise.all([
    'film.json',
    'audio_features.json',
    'lyrics.json',
    'palettes.json',
    'forge_strikes.json',
    'lyric_choreography.json',
    'opening_accordion.json',
    'code_payload_story.json',
    'audio/manifest.json',
  ].map(read));

  const assets = new AssetStore();
  const clock = new AudioClock(audioManifest, features);
  // Pre-decode compact JS audio parameters in background Worker
  clock.preload().catch((err) => {
    console.warn('Audio preload deferred until play:', err);
  });

  const renderer = new FilmRenderer(
    document.querySelector('#film'),
    film,
    features,
    lyrics,
    palettes,
    [],
    assets,
    clock,
    forgeStrikes,
    lyricChoreo,
    accordionDoc,
    codePayloadStory
  );

  await renderer.init();
  const player = bindPlayer({ renderer, clock, film, features });

  window.renderAt = (t) => renderer.renderAt(t);
  window.__film = { renderer, clock, film, features, lyrics, assets, player };
  window.__renderReady = true;
}

main().catch((e) => {
  console.error(e);
  window.__loadError = String(e);
});
