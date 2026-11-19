// src/components/lyrics.js
// Orchestrator for 4K Spatial Kinetic Typography (`文字镜头引擎` — Era-Adaptive Ink & Gold Edition).

import { clamp, smooth } from '../core/math.js';
import { renderSpatialLyricShot } from './kinetic_lyrics/layouts.js';

function buildHeroMask(text, heroList) {
  const chars = [...text];
  const mask = new Array(chars.length).fill(false);
  for (const kw of heroList || []) {
    let idx = text.indexOf(kw);
    while (idx !== -1) {
      for (let k = 0; k < kw.length; k += 1) {
        if (idx + k < mask.length) mask[idx + k] = true;
      }
      idx = text.indexOf(kw, idx + 1);
    }
  }
  return mask;
}

function compileScheduledLines(lines, choreographyDoc) {
  const shotsByIdx = new Map();
  for (const s of choreographyDoc?.shots || []) {
    shotsByIdx.set(s.lineIndex, s);
  }

  return lines.map((line, lineIndex) => {
    const shot = shotsByIdx.get(lineIndex) || {
      lineIndex,
      layout: lineIndex % 2 === 0 ? 'left_editorial' : 'upper_staggered',
      x: lineIndex % 2 === 0 ? 204 : 480,
      y: 146,
      font: 'sans',
      size: 54,
      accent: '#e87a3d',
      hero: [],
    };

    let rawParts = line.text.trim().split(/\s+/).filter(Boolean);
    if (rawParts.length === 1 && shot.splitAt && [...rawParts[0]].length > shot.splitAt) {
      const gAll = [...rawParts[0]];
      rawParts = [gAll.slice(0, shot.splitAt).join(''), gAll.slice(shot.splitAt).join('')];
    }
    const rawChars = line.chars || [];
    let cursor = 0;

    const clauses = rawParts.map((partText) => {
      const glyphs = [...partText];
      const mask = buildHeroMask(partText, shot.hero);
      const items = glyphs.map((ch, i) => {
        const timing = rawChars[cursor + i] || {
          start:
            line.start +
            ((line.end - line.start) * (cursor + i)) / Math.max(1, rawChars.length || glyphs.length),
          end:
            line.start +
            ((line.end - line.start) * (cursor + i + 1)) /
              Math.max(1, rawChars.length || glyphs.length),
        };
        return { ch, timing, isHero: mask[i] };
      });
      cursor += glyphs.length;
      return { text: partText, items };
    });

    return {
      ...line,
      lineIndex,
      shot,
      clauses,
    };
  });
}

export class LyricPainter {
  constructor(data, choreographyDoc = null) {
    this.lines = data.lines;
    this.scheduled = compileScheduledLines(data.lines, choreographyDoc);
  }

  lineAt(t) {
    return this.scheduled.find((l) => t >= l.start - 0.16 && t <= l.end + 0.28) || null;
  }

  phraseAt(t) {
    for (let i = 0; i < this.scheduled.length; i += 1) {
      const cur = this.scheduled[i];
      const next = this.scheduled[i + 1];
      const hold = next ? Math.min(0.42, Math.max(0.06, next.start - cur.end - 0.03)) : 0.65;
      if (t >= cur.start - 0.10 && t <= cur.end + hold) {
        return { phrase: cur, hold };
      }
    }
    return null;
  }

  draw(ctx, t, fallbackAccent, beat = 0, sceneId = '', anvil = 0, _W = 960, _H = 720, pelPos = null) {
    const hit = this.phraseAt(t);
    if (!hit) return;
    const { phrase, hold } = hit;

    const enterAlpha = clamp((t - (phrase.start - 0.10)) / 0.12, 0, 1);
    const exitAlpha = 1 - smooth((t - (phrase.end + hold * 0.35)) / Math.max(0.08, hold * 0.65));
    const alpha = enterAlpha * exitAlpha;
    if (alpha <= 0.01) return;

    const totalSpan = Math.max(0.2, phrase.end - phrase.start);
    const progress = clamp((t - phrase.start) / totalSpan, 0, 1.25);

    renderSpatialLyricShot(ctx, {
      t,
      line: phrase,
      shot: {
        ...phrase.shot,
        accent: phrase.shot.accent || fallbackAccent || '#e87a3d',
      },
      sceneId,
      alpha,
      progress,
      beat,
      anvil,
      pelPos,
    });
  }
}
