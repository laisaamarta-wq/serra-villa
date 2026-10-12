import { MEDIA, WALK, MAKING } from './content.js';
import { reducedMotion, onceVisible } from './motion.js';

const isPhone = () => window.matchMedia('(max-width: 640px)').matches;
const pad = (n) => String(n).padStart(2, '0');

/* ---------------- Opening film ----------------
   The walk-through plays once, muted, as soon as the page opens. Over its last seconds the
   camera eases to a stop and the film holds on the villa; "Watch again" restarts it.
   Every play request carries a run number, so a restart cancels any request still pending
   and two playback attempts can never compete. */
export function initFilm() {
  const film = document.querySelector('.film');
  const walk = film.querySelector('.film__walk');
  const toggle = film.querySelector('.film__toggle');
  const label = toggle.querySelector('.sr-only');
  const replay = film.querySelector('.film__replay');
  const num = film.querySelector('.film__num');
  const room = film.querySelector('.film__room');
  const chapterEl = film.querySelector('.film__chapter');
  const bar = film.querySelector('.film__progress');
  const src = isPhone() ? MEDIA.walk.mobile : MEDIA.walk.desktop;

  walk.poster = MEDIA.master; // the first frame of the film
  walk.src = src;

  let userPaused = reducedMotion();
  let covered = false;
  let ended = false;
  let chapter = -1;
  let run = 0; // increments on every restart; stale play/seek callbacks compare against it

  const setState = (playing) => {
    film.classList.toggle('is-playing', playing);
    toggle.setAttribute('aria-pressed', String(!playing));
    label.textContent = playing ? 'Pause the film' : 'Play the film';
  };
  const play = () => {
    if (covered || ended) return;
    const token = run;
    const p = walk.play();
    if (p && p.then) p.then(() => { if (token === run) setState(true); }).catch(() => { if (token === run) setState(!walk.paused); });
    else setState(!walk.paused);
  };

  const setChapter = (i) => {
    if (i === chapter) return;
    chapter = i;
    chapterEl.classList.remove('is-swap'); void chapterEl.offsetWidth; chapterEl.classList.add('is-swap');
    num.textContent = pad(i + 1); room.textContent = WALK[i].name;
  };

  // the last 2.2 s: the camera decelerates instead of stopping dead
  const EASE = 2.2;
  let easing = false;
  const ease = () => {
    const d = walk.duration || 30; const left = d - walk.currentTime;
    if (walk.paused || ended || left > EASE) { easing = false; if (left > EASE) walk.playbackRate = 1; return; }
    const k = Math.max(0, left / EASE); // 1 → 0
    walk.playbackRate = Math.max(0.38, 0.38 + 0.62 * k * k);
    requestAnimationFrame(ease);
  };

  walk.addEventListener('timeupdate', () => {
    const t = walk.currentTime; const d = walk.duration || 30;
    bar.style.setProperty('--p', (t / d).toFixed(4));
    let a = 0; WALK.forEach((c, i) => { if (t >= c.t - 0.05) a = i; });
    setChapter(a);
    if (!easing && !reducedMotion() && d - t <= EASE && !walk.paused) { easing = true; requestAnimationFrame(ease); }
  });
  walk.addEventListener('ended', () => {
    ended = true;
    film.classList.add('is-ended');
    bar.style.setProperty('--p', '1');
    walk.playbackRate = 1;
    setState(false);
  });
  walk.addEventListener('error', () => film.classList.add('is-fallback'));

  // return to the opening frame and play from there
  const restart = () => {
    const token = ++run;
    userPaused = false; ended = false; easing = false;
    film.classList.remove('is-ended', 'is-fallback');
    walk.pause();
    walk.playbackRate = 1;
    bar.style.setProperty('--p', '0');
    chapter = -1; setChapter(0);
    const start = () => {
      if (token !== run) return;
      if (walk.currentTime < 0.05) { play(); return; }
      let done = false;
      const go = () => { if (done) return; done = true; walk.removeEventListener('seeked', go); if (token === run) play(); };
      walk.addEventListener('seeked', go);
      setTimeout(go, 1500); // some browsers skip 'seeked' for a seek to the current position
      walk.currentTime = 0;
    };
    if (walk.error) { walk.src = src; walk.load(); }
    if (walk.readyState >= 1) start(); else walk.addEventListener('loadedmetadata', start, { once: true });
  };

  if (!userPaused) play(); else setState(false);

  toggle.addEventListener('click', () => {
    if (ended) { restart(); return; }
    if (walk.paused) { userPaused = false; play(); } else { userPaused = true; walk.pause(); setState(false); }
  });
  replay.addEventListener('click', restart);

  const content = film.querySelector('.film__content');
  const update = () => {
    const y = window.scrollY; const vh = window.innerHeight;
    // the pinned film is covered by the page: stop decoding until it shows again
    const nowCovered = y > film.offsetHeight * 1.02;
    if (nowCovered !== covered) {
      covered = nowCovered;
      if (covered) walk.pause(); else if (!userPaused) play();
    }
    if (y > vh * 1.2) return;
    const k = Math.min(1, y / vh);
    film.style.setProperty('--cover', k.toFixed(3));
    if (!reducedMotion()) content.style.transform = `translate3d(0, ${(-k * 60).toFixed(1)}px, 0)`;
  };
  return { update, restart };
}

/* ---------------- The ridge: aerial film in the location chapter ----------------
   The camera flies in toward the villa once, easing to a stop, and holds there. No loop and no
   pull-back. Loads near the section and plays while in view; the button replays it. */
export function initAerial() {
  const root = document.querySelector('.location__hero');
  const video = root.querySelector('.location__video');
  const toggle = root.querySelector('.location__toggle');
  const label = toggle.querySelector('.sr-only');
  const phone = isPhone();
  video.poster = phone ? MEDIA.hero.posterMobile : MEDIA.hero.poster;
  let loaded = false; let inView = false; let userPaused = reducedMotion(); let ended = false;
  const setState = (playing) => {
    toggle.setAttribute('aria-pressed', String(!playing));
    toggle.classList.toggle('is-ended', ended && !playing);
    label.textContent = playing ? 'Pause the aerial film' : ended ? 'Watch the aerial film again' : 'Play the aerial film';
  };
  const ensure = () => { if (!loaded) { loaded = true; video.src = phone ? MEDIA.hero.mobile : MEDIA.hero.desktop; } };
  const play = () => { ensure(); const p = video.play(); if (p && p.then) p.then(() => setState(true)).catch(() => setState(false)); };
  setState(false);
  onceVisible(root, () => root.classList.add('is-in'), '0px 0px -15% 0px');
  new IntersectionObserver(([e]) => { if (e.isIntersecting) ensure(); }, { rootMargin: '500px 0px' }).observe(root);
  new IntersectionObserver(([e]) => {
    inView = e.intersectionRatio >= 0.35;
    if (inView && !userPaused && !ended) play();
    else if (!inView && !video.paused) { video.pause(); setState(false); }
  }, { threshold: [0, 0.35, 0.6] }).observe(root);
  // the film settles on the villa and stays on that frame
  video.addEventListener('ended', () => { ended = true; setState(false); });
  toggle.addEventListener('click', () => {
    if (ended) { ended = false; userPaused = false; video.currentTime = 0; play(); return; }
    if (video.paused) { userPaused = false; play(); } else { userPaused = true; video.pause(); setState(false); }
  });
  video.addEventListener('error', () => root.classList.add('is-fallback'));
}

/* ---------------- The making of the villa ----------------
   Starts by itself when the section is in view and pauses when it leaves.
   Choosing a stage, pausing or jumping to the end hands control to the visitor. */
export function initMaking() {
  const root = document.querySelector('.making');
  const video = root.querySelector('.making__video');
  const screen = root.querySelector('.making__screen');
  const now = root.querySelector('.making__now');
  const num = root.querySelector('.making__num');
  const name = root.querySelector('.making__name');
  const text = root.querySelector('.making__text');
  const playBtn = root.querySelector('[data-act="play"]');
  const timeline = root.querySelector('.making__timeline');
  const list = root.querySelector('.making__stages');
  video.poster = MEDIA.s0;

  list.innerHTML = MAKING.map((s, i) => `<li><button type="button" data-i="${i}"><span class="n">${pad(i + 1)}</span><span class="t">${s.name}</span><i></i></button></li>`).join('');
  const stageBtns = [...list.querySelectorAll('button')];
  const end = MAKING[MAKING.length - 1].t;
  timeline.innerHTML = '<i></i>' + MAKING.map((s) => `<b style="left:${(s.t / end * 100).toFixed(2)}%"></b>`).join('');

  let loaded = false;
  const ensure = () => { if (!loaded) { loaded = true; video.src = isPhone() ? MEDIA.making.mobile : MEDIA.making.desktop; } };

  let stage = -1; let stopAt = null;
  let manual = reducedMotion(); // reduced motion: never start on its own
  let inView = false;
  const tOf = (k) => Math.min(MAKING[k].t, (video.duration || end + 0.1) - 0.06);
  const lastT = () => tOf(MAKING.length - 1);
  const stageAt = (t) => { for (let k = 0; k < MAKING.length; k++) if (t < tOf(k) - 0.02) return k; return MAKING.length - 1; };

  const render = (k) => {
    if (k === stage) return;
    stage = k;
    now.classList.remove('is-swap'); void now.offsetWidth; now.classList.add('is-swap');
    num.textContent = `${pad(k + 1)} / ${pad(MAKING.length)}`;
    name.textContent = MAKING[k].name;
    text.textContent = MAKING[k].text;
    stageBtns.forEach((b, i) => b.setAttribute('aria-current', i === k ? 'step' : 'false'));
  };

  const whenReady = (fn) => { ensure(); if (video.readyState >= 1) fn(); else video.addEventListener('loadedmetadata', fn, { once: true }); };
  const autoPlay = () => whenReady(() => {
    if (manual || !inView) return;
    stopAt = null;
    if (video.currentTime >= lastT() - 0.05) return; // finished: hold on the villa
    video.play().catch(() => {});
  });
  const goTo = (k) => {
    manual = true;
    render(k);
    whenReady(() => {
      if (k === 0) { video.pause(); stopAt = null; video.currentTime = 0; return; }
      video.currentTime = tOf(k - 1); stopAt = tOf(k); // show this stage being built
      if (reducedMotion()) { video.currentTime = tOf(k); stopAt = null; return; }
      video.play().catch(() => { video.currentTime = tOf(k); stopAt = null; });
    });
  };

  playBtn.addEventListener('click', () => {
    if (!video.paused) { manual = true; video.pause(); return; }
    manual = false;
    whenReady(() => { stopAt = null; if (video.currentTime >= lastT() - 0.05) video.currentTime = 0; video.play().catch(() => {}); });
  });
  root.querySelector('[data-act="replay"]').addEventListener('click', () => { manual = false; whenReady(() => { stopAt = null; video.currentTime = 0; render(0); video.play().catch(() => {}); }); });
  root.querySelector('[data-act="finish"]').addEventListener('click', () => { manual = true; whenReady(() => { video.pause(); stopAt = null; video.currentTime = lastT(); render(MAKING.length - 1); }); });
  stageBtns.forEach((b) => b.addEventListener('click', () => goTo(+b.dataset.i)));
  list.addEventListener('keydown', (e) => {
    const i = stageBtns.indexOf(document.activeElement); if (i < 0) return;
    const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]; if (!d) return;
    e.preventDefault(); stageBtns[(i + d + stageBtns.length) % stageBtns.length].focus();
  });

  video.addEventListener('play', () => { root.classList.add('is-playing'); playBtn.setAttribute('aria-label', 'Pause'); });
  video.addEventListener('pause', () => { root.classList.remove('is-playing'); playBtn.setAttribute('aria-label', 'Play'); });
  video.addEventListener('error', () => root.classList.add('is-fallback'));

  // play when at least half of the film is visible, pause when most of it has left
  new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.intersectionRatio >= 0.5) { inView = true; autoPlay(); }
      else if (e.intersectionRatio < 0.2) { inView = false; if (!video.paused) video.pause(); }
    });
  }, { threshold: [0, 0.2, 0.5, 0.8] }).observe(screen);
  new IntersectionObserver(([e]) => { if (e.isIntersecting) ensure(); }, { rootMargin: '600px 0px' }).observe(screen);

  const tick = () => {
    if (loaded && video.readyState >= 1) {
      const t = video.currentTime;
      if (stopAt !== null && t >= stopAt - 0.03) { video.pause(); video.currentTime = stopAt; stopAt = null; }
      timeline.style.setProperty('--p', Math.min(1, t / lastT()).toFixed(4));
      if (!video.paused) render(stageAt(t));
      stageBtns.forEach((b, i) => {
        const a = i === 0 ? 0 : tOf(i - 1); const z = tOf(i);
        b.style.setProperty('--fill', i === 0 ? '1' : Math.min(1, Math.max(0, (t - a) / (z - a))).toFixed(3));
      });
      root.classList.toggle('is-end', video.paused && t >= lastT() - 0.05);
    }
    requestAnimationFrame(tick);
  };
  render(0);
  requestAnimationFrame(tick);
}
