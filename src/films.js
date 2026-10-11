import { MEDIA, WALK, MAKING } from './content.js';
import { reducedMotion, onceVisible } from './motion.js';

const isPortraitPhone = () => window.matchMedia('(max-width: 640px)').matches;
const fmtTime = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const pad = (n) => String(n).padStart(2, '0');

/* ---------------- Hero ---------------- */
export function initHero() {
  const hero = document.querySelector('.hero');
  const video = hero.querySelector('.hero__video');
  const toggle = hero.querySelector('.hero__toggle');
  const label = toggle.querySelector('.sr-only');
  const phone = isPortraitPhone();
  video.poster = phone ? MEDIA.hero.posterMobile : MEDIA.hero.poster;
  video.src = phone ? MEDIA.hero.mobile : MEDIA.hero.desktop;

  let userPaused = reducedMotion();
  const setState = (playing) => {
    hero.classList.toggle('is-playing', playing);
    toggle.setAttribute('aria-pressed', String(!playing));
    label.textContent = playing ? 'Pause the film' : 'Play the film';
  };
  const tryPlay = () => video.play().then(() => setState(true)).catch(() => setState(false));
  video.addEventListener('playing', () => hero.classList.add('has-video'));
  if (!userPaused) tryPlay(); else setState(false);

  toggle.addEventListener('click', () => {
    if (video.paused) { userPaused = false; tryPlay(); } else { userPaused = true; video.pause(); setState(false); }
  });
  const content = hero.querySelector('.hero__content');
  let covered = false;
  return () => {
    const y = window.scrollY; const vh = window.innerHeight;
    // the pinned hero is covered by the page: stop decoding until it shows again
    const nowCovered = y > hero.offsetHeight * 1.02;
    if (nowCovered !== covered) {
      covered = nowCovered;
      if (covered) video.pause(); else if (!userPaused) tryPlay();
    }
    if (y > vh * 1.2) return;
    const k = Math.min(1, y / vh);
    hero.style.setProperty('--cover', k.toFixed(3));
    if (!reducedMotion()) content.style.transform = `translate3d(0, ${(-k * 60).toFixed(1)}px, 0)`;
  };
}

/* ---------------- Walk-through ---------------- */
export function initWalk() {
  const root = document.querySelector('.walk');
  const video = root.querySelector('.walk__video');
  const start = root.querySelector('.walk__start');
  const playBtn = root.querySelector('.walk__play');
  const track = root.querySelector('.walk__track');
  const time = root.querySelector('.walk__time');
  const list = root.querySelector('.walk__chapters');
  video.poster = MEDIA.master;

  list.innerHTML = WALK.map((c, i) => `<li><button type="button" data-i="${i}"><span>${pad(i + 1)}</span>${c.name}</button></li>`).join('');
  const chapterBtns = [...list.querySelectorAll('button')];

  let loaded = false;
  const ensure = () => { if (!loaded) { loaded = true; video.src = isPortraitPhone() ? MEDIA.walk.mobile : MEDIA.walk.desktop; video.preload = 'auto'; } };
  const play = () => { ensure(); root.classList.add('is-started'); video.play().catch(() => {}); };
  const seek = (t) => { ensure(); const go = () => { video.currentTime = t; }; if (video.readyState >= 1) go(); else video.addEventListener('loadedmetadata', go, { once: true }); };

  start.addEventListener('click', play);
  playBtn.addEventListener('click', () => (video.paused ? play() : video.pause()));
  video.addEventListener('click', () => (video.paused ? play() : video.pause()));
  chapterBtns.forEach((b) => b.addEventListener('click', () => { seek(WALK[+b.dataset.i].t + 0.01); play(); }));

  const dur = () => video.duration || 30;
  const seekFromX = (x) => { const r = track.getBoundingClientRect(); seek(Math.min(1, Math.max(0, (x - r.left) / r.width)) * dur()); };
  let scrubbing = false;
  track.addEventListener('pointerdown', (e) => { scrubbing = true; track.setPointerCapture(e.pointerId); seekFromX(e.clientX); });
  track.addEventListener('pointermove', (e) => { if (scrubbing) seekFromX(e.clientX); });
  track.addEventListener('pointerup', () => { scrubbing = false; });
  track.addEventListener('keydown', (e) => {
    const d = { ArrowRight: 2, ArrowLeft: -2, Home: -999, End: 999 }[e.key];
    if (d === undefined) return; e.preventDefault(); seek(Math.min(dur() - 0.1, Math.max(0, video.currentTime + d)));
  });

  const sync = () => {
    const t = video.currentTime; const p = t / dur();
    track.style.setProperty('--p', p.toFixed(4));
    track.setAttribute('aria-valuenow', t.toFixed(1)); track.setAttribute('aria-valuetext', `${fmtTime(t)} of ${fmtTime(dur())}`);
    time.textContent = fmtTime(t);
    let a = 0; WALK.forEach((c, i) => { if (t >= c.t - 0.05) a = i; });
    chapterBtns.forEach((b, i) => b.setAttribute('aria-current', i === a ? 'true' : 'false'));
  };
  video.addEventListener('timeupdate', sync);
  video.addEventListener('seeked', sync);
  video.addEventListener('play', () => { root.classList.add('is-playing'); playBtn.setAttribute('aria-label', 'Pause'); });
  video.addEventListener('pause', () => { root.classList.remove('is-playing'); playBtn.setAttribute('aria-label', 'Play'); });
  video.addEventListener('ended', () => { root.classList.add('is-ended'); });
  video.addEventListener('play', () => root.classList.remove('is-ended'));
  // pause when scrolled away
  new IntersectionObserver(([e]) => { if (!e.isIntersecting && !video.paused) video.pause(); }, { threshold: 0.1 }).observe(video);
}

/* ---------------- The making of the villa ---------------- */
export function initMaking() {
  const root = document.querySelector('.making');
  const video = root.querySelector('.making__video');
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
  // stage markers on the timeline
  const end = MAKING[MAKING.length - 1].t;
  timeline.innerHTML = '<i></i>' + MAKING.map((s) => `<b style="left:${(s.t / end * 100).toFixed(2)}%"></b>`).join('');

  let loaded = false;
  const ensure = () => { if (!loaded) { loaded = true; video.src = isPortraitPhone() ? MEDIA.making.mobile : MEDIA.making.desktop; } };
  onceVisible(root, ensure, '400px 0px');

  let stage = 0; let stopAt = null;
  const tOf = (k) => Math.min(MAKING[k].t, (video.duration || end + 0.1) - 0.06);
  // while playing, the stage shown is the one being built
  const stageAt = (t) => { for (let k = 0; k < MAKING.length; k++) if (t < tOf(k) - 0.02) return k; return MAKING.length - 1; };

  const render = (k) => {
    if (k === stage && num.textContent) return;
    stage = k;
    now.classList.remove('is-swap'); void now.offsetWidth; now.classList.add('is-swap');
    num.textContent = `${pad(k + 1)} / ${pad(MAKING.length)}`;
    name.textContent = MAKING[k].name;
    text.textContent = MAKING[k].text;
    stageBtns.forEach((b, i) => { b.setAttribute('aria-current', i === k ? 'step' : 'false'); b.classList.toggle('is-done', i < k); });
    root.querySelector('[data-act="prev"]').disabled = k === 0;
    root.querySelector('[data-act="next"]').disabled = k === MAKING.length - 1;
  };

  const whenReady = (fn) => { ensure(); if (video.readyState >= 1) fn(); else video.addEventListener('loadedmetadata', fn, { once: true }); };
  const playTo = (from, to) => whenReady(() => {
    video.currentTime = from; stopAt = to;
    if (reducedMotion()) { video.currentTime = to; stopAt = null; return; }
    video.play().catch(() => { video.currentTime = to; stopAt = null; });
  });
  const goTo = (k) => {
    k = Math.max(0, Math.min(MAKING.length - 1, k));
    render(k);
    if (k === 0) { whenReady(() => { video.pause(); stopAt = null; video.currentTime = 0; }); return; }
    playTo(tOf(k - 1), tOf(k)); // show this stage being built
  };

  playBtn.addEventListener('click', () => {
    if (!video.paused) { video.pause(); return; }
    whenReady(() => {
      stopAt = null;
      if (video.currentTime >= tOf(MAKING.length - 1) - 0.05) video.currentTime = 0;
      video.play().catch(() => {});
    });
  });
  root.querySelector('[data-act="prev"]').addEventListener('click', () => goTo(stage - 1));
  root.querySelector('[data-act="next"]').addEventListener('click', () => goTo(stage + 1));
  root.querySelector('[data-act="replay"]').addEventListener('click', () => whenReady(() => { stopAt = null; video.currentTime = 0; render(0); video.play().catch(() => {}); }));
  root.querySelector('[data-act="finish"]').addEventListener('click', () => whenReady(() => { video.pause(); stopAt = null; video.currentTime = tOf(MAKING.length - 1); render(MAKING.length - 1); }));
  stageBtns.forEach((b) => b.addEventListener('click', () => goTo(+b.dataset.i)));
  list.addEventListener('keydown', (e) => {
    const i = stageBtns.indexOf(document.activeElement); if (i < 0) return;
    const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]; if (!d) return;
    e.preventDefault(); stageBtns[(i + d + stageBtns.length) % stageBtns.length].focus();
  });

  video.addEventListener('play', () => { root.classList.add('is-playing'); playBtn.setAttribute('aria-label', 'Pause'); });
  video.addEventListener('pause', () => { root.classList.remove('is-playing'); playBtn.setAttribute('aria-label', 'Play'); });

  const tick = () => {
    if (loaded && video.readyState >= 1) {
      const t = video.currentTime;
      if (stopAt !== null && t >= stopAt - 0.03) { video.pause(); video.currentTime = stopAt; stopAt = null; }
      timeline.style.setProperty('--p', Math.min(1, t / tOf(MAKING.length - 1)).toFixed(4));
      if (!video.paused) render(stageAt(t));
      stageBtns.forEach((b, i) => {
        const a = i === 0 ? 0 : tOf(i - 1); const z = tOf(i);
        b.style.setProperty('--fill', i === 0 ? '1' : Math.min(1, Math.max(0, (t - a) / (z - a))).toFixed(3));
      });
      root.classList.toggle('is-end', video.paused && t >= tOf(MAKING.length - 1) - 0.05);
    }
    requestAnimationFrame(tick);
  };
  render(0); stage = 0;
  requestAnimationFrame(tick);
  // pause when scrolled away
  new IntersectionObserver(([e]) => { if (!e.isIntersecting && !video.paused) video.pause(); }, { threshold: 0.15 }).observe(video);
}
