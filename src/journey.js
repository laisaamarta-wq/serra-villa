import { MEDIA, BEATS, CHAPTERS, STAGES } from './content.js';

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (t) => t * t * (3 - 2 * t);

// Plan lines that float over the studio model (same drawing language as the Plan section)
const HOLO = `
  <rect x="120" y="140" width="640" height="220"/>
  <line x1="260" y1="140" x2="260" y2="360"/><line x1="380" y1="140" x2="380" y2="360"/>
  <line x1="620" y1="140" x2="620" y2="360"/><line x1="260" y1="250" x2="380" y2="250"/>
  <rect x="120" y="360" width="640" height="160"/>
  ${Array.from({ length: 19 }, (_, i) => `<line x1="${152 + i * 32}" y1="372" x2="${152 + i * 32}" y2="508"/>`).join('')}
  <line x1="140" y1="300" x2="240" y2="300"/><line x1="140" y1="316" x2="240" y2="316"/><line x1="140" y1="332" x2="240" y2="332"/>
  <path d="M120,110 L760,110 M120,104 L120,116 M760,104 L760,116"/>
  <path d="M790,140 L790,520 M784,140 L796,140 M784,520 L796,520"/>
  <text x="420" y="100">22.9 m</text><text x="800" y="334">13.6 m</text>
  <text x="140" y="200">Entrance</text><text x="420" y="250">Master suite</text><text x="360" y="450">Pergola terrace</text>
`;

export function initJourney({ isStatic, isPhone }) {
  const section = document.querySelector('.journey');
  const stage = section.querySelector('.journey__stage');
  const studio = section.querySelector('.layer--studio');
  const studioImg = studio.querySelector('.studio__img');
  const holo = studio.querySelector('.holo');
  const build = section.querySelector('.layer--build');
  const film = section.querySelector('.film');
  const chaptersEl = section.querySelector('.chapters');
  const stagesEl = section.querySelector('.stages');
  const cue = section.querySelector('.scroll-cue');

  // ---------- chapters ----------
  const chapterNodes = CHAPTERS.map((c, i) => {
    const el = document.createElement('div');
    el.className = 'chapter' + (c.hero ? ' chapter--hero' : '');
    el.dataset.place = c.place;
    const tag = i === 0 ? 'h1' : 'h2';
    el.innerHTML =
      `<${tag} class="chapter__title">${c.title.map((l) => `<span class="chapter__line"><span>${l}</span></span>`).join('')}</${tag}>` +
      `<p class="chapter__body">${c.body}</p>` +
      (c.cta ? `<a class="btn btn--ghost" href="${c.cta.href}">${c.cta.label}</a>` : '');
    chaptersEl.appendChild(el);
    return el;
  });

  if (isStatic) {
    const bg = [MEDIA.studio, MEDIA.s0, MEDIA.master, MEDIA.living, MEDIA.reveal || MEDIA.master];
    chapterNodes.forEach((el, i) => { el.style.backgroundImage = `url("${bg[i] || MEDIA.master}")`; el.style.setProperty('--y', '0%'); });
    return { update() {}, progress: () => 0 };
  }

  // ---------- stages list ----------
  stagesEl.innerHTML = STAGES.map((s, i) => `<li data-beat="${s.beat}"><span>0${i + 1}</span><span>${s.name}</span></li>`).join('');
  const stageItems = [...stagesEl.children];

  // ---------- media ----------
  studioImg.src = MEDIA.studio;
  holo.innerHTML = HOLO;
  const holoEls = [...holo.querySelectorAll('rect, line, path')];
  holoEls.forEach((el) => { const len = el.getTotalLength ? el.getTotalLength() : 600; el.style.strokeDasharray = len; el.style.strokeDashoffset = len; el._len = len; });

  // build stack: 0 empty, (1 = lines over empty), 2 foundation, 3 structure, 4 stone, 5 finished
  const stackSrc = [MEDIA.s0, null, MEDIA.s1, MEDIA.s2, MEDIA.s3, MEDIA.master];
  const stack = stackSrc.map((src, k) => {
    if (!src) return null;
    const img = new Image();
    img.decoding = 'async'; img.alt = ''; img.src = src;
    if (k > 0) img.style.opacity = '0';
    build.appendChild(img);
    return img;
  });
  const lines = new Image();
  lines.className = 'lines'; lines.alt = ''; lines.src = MEDIA.wireLines; lines.style.opacity = '0';
  build.appendChild(lines);

  // fly-through video: fetched whole so scrubbing never waits on the network
  let filmReady = false;
  const filmSrc = isPhone && MEDIA.film.mobile ? MEDIA.film.mobile : MEDIA.film.desktop;
  fetch(filmSrc)
    .then((r) => { if (!r.ok) throw new Error(r.status); return r.blob(); })
    .then((blob) => { film.src = URL.createObjectURL(blob); return new Promise((res) => film.addEventListener('loadeddata', res, { once: true })); })
    .then(() => { filmReady = true; film.currentTime = 0.001; })
    .catch(() => { film.src = filmSrc; film.addEventListener('loadeddata', () => { filmReady = true; }, { once: true }); });

  // ---------- timeline ----------
  let beats = [];
  let total = 0;
  const layout = () => {
    const phone = window.matchMedia('(max-width: 640px)').matches;
    let acc = 0;
    beats = BEATS.map((b) => { const vh = phone && b.mvh ? b.mvh : b.vh; const s = { ...b, vh, start: acc, end: acc + vh }; acc += vh; return s; });
    total = acc;
    section.style.height = `calc(${total * 100}vh + 100vh)`;
    chapterRanges = CHAPTERS.map((c) => {
      const a = beats.find((b) => b.id === c.from); const z = beats.find((b) => b.id === c.to);
      return { start: a.start, end: z.end };
    });
  };
  let chapterRanges = [];
  layout();

  let filmTime = 0;
  let lastFilter = '';
  const state = { p: 0 };

  function beatAt(p) {
    for (const b of beats) if (p < b.end) return b;
    return beats[beats.length - 1];
  }

  function update() {
    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight;
    const p = clamp(-rect.top / vh, 0, total);
    state.p = p;
    const b = beatAt(p);
    const t = clamp((p - b.start) / b.vh);

    // studio + hologram
    const studioIdx = beats.findIndex((x) => x.id === 'zoom');
    const zoomBeat = beats[studioIdx];
    if (p < zoomBeat.end) {
      studio.style.visibility = 'visible';
      const draw = b.id === 'studio' ? smooth(clamp(t * 1.15)) : 1;
      holoEls.forEach((el, i) => {
        const d = clamp(draw * 1.35 - (i / holoEls.length) * 0.35);
        el.style.strokeDashoffset = el._len * (1 - d);
      });
      holo.style.setProperty('--labels', clamp((draw - 0.75) * 4));
      const z = b.id === 'zoom' ? smooth(t) : 0;
      studio.style.transform = `scale(${1 + z * 1.9})`;
      studio.style.opacity = String(1 - smooth(clamp((z - 0.45) / 0.55)));
      studio.style.filter = `brightness(${1 + z * 0.9})`;
    } else {
      studio.style.visibility = 'hidden';
    }

    // construction
    let f = 0; // fractional stage 0..5
    if (b.type === 'build') f = b.from + (b.to - b.from) * smooth(t);
    else if (b.type === 'film') f = 5;
    for (let k = 2; k <= 5; k++) {
      const r = clamp(f - (k - 1));
      const img = stack[k];
      if (r <= 0) { img.style.opacity = '0'; continue; }
      img.style.opacity = '1';
      const edge = r * 130 - 30; // soft rising wipe
      const m = r >= 1 ? 'none' : `linear-gradient(to top, #000 ${edge}%, transparent ${edge + 30}%)`;
      img.style.webkitMaskImage = m; img.style.maskImage = m;
    }
    const lineO = f < 1 ? f : f < 4 ? 1 - ((f - 1) / 3) * 0.55 : Math.max(0, 0.45 * (5 - f));
    lines.style.opacity = String(lineO);
    const k = f / 5; // dawn → golden hour grade
    const filter = `saturate(${(0.76 + 0.24 * k).toFixed(3)}) brightness(${(1.07 - 0.07 * k).toFixed(3)}) contrast(${(0.92 + 0.08 * k).toFixed(3)}) hue-rotate(${(-7 + 7 * k).toFixed(1)}deg)`;
    if (filter !== lastFilter) { build.style.filter = filter; lastFilter = filter; }

    // hand-off from the finished still to the film
    if (b.type === 'film') {
      const fin = beats.find((x) => x.id === 'finished');
      const handoff = filmReady ? 1 - smooth(clamp((p - fin.start - fin.vh * 0.45) / (fin.vh * 0.4))) : 1;
      build.style.opacity = String(handoff);
      build.style.visibility = handoff <= 0 ? 'hidden' : 'visible';
      const target = b.from + (b.to - b.from) * t;
      filmTime += (target - filmTime) * 0.2;
      if (Math.abs(target - filmTime) < 0.004) filmTime = target;
      // portrait crop focus, eased between beats
      const i = beats.indexOf(b);
      const next = beats[i + 1] && beats[i + 1].focus != null ? beats[i + 1].focus : b.focus;
      const focus = (b.focus ?? 0.5) + (next - (b.focus ?? 0.5)) * smooth(t);
      film.style.setProperty('--focus', `${(focus * 100).toFixed(1)}%`);
      build.style.setProperty('--focus', `${(focus * 100).toFixed(1)}%`);
    } else {
      build.style.opacity = '1'; build.style.visibility = 'visible';
      filmTime = 0;
    }
    if (filmReady && !film.seeking) {
      const ft = clamp(filmTime, 0, (film.duration || MEDIA.film.duration) - 0.04);
      if (Math.abs(film.currentTime - ft) > 0.015) film.currentTime = ft;
    }

    // chapters
    const fade = 0.35;
    chapterRanges.forEach((r, i) => {
      const first = i === 0; const last = i === chapterRanges.length - 1;
      const ein = first ? 1 : clamp((p - r.start) / fade);
      const eout = last ? 1 : clamp((r.end - p) / fade);
      const e = smooth(Math.min(ein, eout));
      const el = chapterNodes[i];
      const on = e > 0.001 && p >= r.start - (first ? 0 : 0) && p <= r.end + (last ? 99 : 0);
      el.classList.toggle('is-on', on);
      if (on) {
        el.style.setProperty('--y', `${((1 - e) * 105).toFixed(2)}%`);
        el.style.setProperty('--o', e.toFixed(3));
      }
    });

    // construction stage list
    const firstStage = beats.find((x) => x.id === STAGES[0].beat);
    const lastStage = beats.find((x) => x.id === STAGES[STAGES.length - 1].beat);
    stagesEl.classList.toggle('is-on', p > firstStage.start - 0.3 && p < lastStage.end + 0.4);
    stageItems.forEach((li) => {
      const sb = beats.find((x) => x.id === li.dataset.beat);
      const fill = clamp((p - sb.start) / sb.vh);
      li.style.setProperty('--fill', fill.toFixed(3));
      li.classList.toggle('is-active', fill > 0 && fill < 1 ? true : p >= sb.start && p < sb.end);
    });

    cue.style.opacity = p > 0.15 ? '0' : '1';
    return p;
  }

  window.addEventListener('resize', () => { layout(); update(); });
  return { update, section, stage, progress: () => state.p };
}
