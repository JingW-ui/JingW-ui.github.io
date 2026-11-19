export function bindPlayer({ renderer, clock, features }) {
  const shell = document.querySelector('#cinema-shell');
  const screenWrap = document.querySelector('.screen-wrap');

  let frame = 0;
  let lastRenderedT = -1;
  let idleTimer = 0;

  const draw = (force = false) => {
    const nowT = clock.time;
    if (!force && clock.playing && Math.abs(nowT - lastRenderedT) < 0.0005) return;
    lastRenderedT = nowT;
    renderer.renderAt(nowT);
  };

  const tick = () => {
    draw(false);
    if (clock.playing) {
      frame = requestAnimationFrame(tick);
    }
  };

  const bumpActivity = () => {
    if (!shell) return;
    shell.classList.remove('is-idle');
    clearTimeout(idleTimer);
    if (clock.playing) {
      idleTimer = window.setTimeout(() => {
        if (clock.playing) shell.classList.add('is-idle');
      }, 2000);
    }
  };

  const togglePlay = async () => {
    try {
      await clock.toggle();
      cancelAnimationFrame(frame);
      draw(true);
      if (clock.playing) {
        frame = requestAnimationFrame(tick);
        bumpActivity();
      } else {
        clearTimeout(idleTimer);
        shell?.classList.remove('is-idle');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const getFullscreenElement = () =>
    document.fullscreenElement || document.webkitFullscreenElement || null;

  const toggleFullscreen = async () => {
    try {
      if (getFullscreenElement()) {
        if (document.exitFullscreen) await document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      } else if (shell) {
        if (shell.requestFullscreen) await shell.requestFullscreen();
        else if (shell.webkitRequestFullscreen) shell.webkitRequestFullscreen();
      }
    } catch (err) {
      console.warn(err);
    }
  };

  let clickTimer = 0;
  screenWrap?.addEventListener('click', () => {
    clearTimeout(clickTimer);
    clickTimer = window.setTimeout(() => {
      togglePlay();
    }, 180);
  });

  screenWrap?.addEventListener('dblclick', (e) => {
    e.preventDefault();
    clearTimeout(clickTimer);
    toggleFullscreen();
  });

  shell?.addEventListener('mousemove', bumpActivity, { passive: true });

  clock.addEventListener('ended', () => {
    cancelAnimationFrame(frame);
    clearTimeout(idleTimer);
    shell?.classList.remove('is-idle');
    draw(true);
  });
  clock.addEventListener('seeked', () => draw(true));

  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      togglePlay();
    } else if (e.code === 'KeyF') {
      e.preventDefault();
      toggleFullscreen();
    } else if (e.code === 'KeyM') {
      clock.muted = !clock.muted;
    } else if (e.code === 'KeyR') {
      clock.seek(0);
      draw(true);
    } else if (e.code === 'ArrowRight') {
      clock.seek(clock.time + 5);
      draw(true);
    } else if (e.code === 'ArrowLeft') {
      clock.seek(clock.time - 5);
      draw(true);
    }
  });

  draw(true);
  return {
    draw: () => draw(true),
    seekToScene: (i) => {
      clock.seek(features.transitions[i] + 0.1);
      draw(true);
    },
  };
}
