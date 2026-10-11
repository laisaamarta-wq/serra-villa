import { MEDIA, SPECS, MATERIALS } from './content.js';
import { onceVisible, countUp, reducedMotion } from './motion.js';
import { openLightbox } from './lightbox.js';

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const pad = (n) => String(n).padStart(2, '0');
const prepDraw = (root) => root.querySelectorAll('.draw').forEach((el) => {
  const len = Math.ceil(el.getTotalLength ? el.getTotalLength() : 1000);
  el.dataset.len = len; el.style.setProperty('--len', len);
});

/* images declared as data-src="<media key>" */
export function initImages() {
  document.querySelectorAll('img[data-src]').forEach((img) => { img.src = MEDIA[img.dataset.src]; img.decoding = 'async'; });
}

/* ---------------- Specifications ---------------- */
export function initSpecs() {
  const dl = document.querySelector('.specs');
  dl.innerHTML = SPECS.map((s) => {
    const final = s.group ? s.count.toLocaleString('en-GB') : String(s.count);
    return `<div><dt>${s.label}</dt><dd><span class="n" aria-hidden="true" style="min-width:${final.length}ch">0</span>${s.suffix ? `<span class="u" aria-hidden="true">${s.suffix}</span>` : ''}<span class="sr-only">${final}${s.suffix ? ' ' + s.suffix : ''}</span></dd></div>`;
  }).join('');
  onceVisible(dl, () => {
    dl.querySelectorAll('.n').forEach((n, i) => setTimeout(() => countUp(n, SPECS[i].count, { group: SPECS[i].group }), i * 90));
  }, '0px 0px -12% 0px');
}

/* ---------------- Architecture: an interactive section drawing ----------------
   The drawing is grouped by principle. As each principle on the right scrolls past, its
   part of the drawing is drawn and lit; at the end the whole section stays visible.
   On narrow screens and with reduced motion it is shown complete and static. */
const SECTION = `
  <defs>
    <pattern id="earth" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <line x1="0" y1="0" x2="0" y2="10" class="hatch"/>
    </pattern>
  </defs>
  <g class="step" data-step="0">
    <path class="earth" d="M0,108 L228,150 L228,232 L298,252 L298,334 L1010,358 L1046,440 L0,440 Z"/>
    <path class="tree draw" d="M60,104 L60,84 M140,120 L140,98 M1090,436 L1090,420"/>
    <circle class="tree draw" cx="60" cy="76" r="10"/><circle class="tree draw" cx="140" cy="90" r="10"/><circle class="tree draw" cx="1090" cy="412" r="9"/>
    <text x="40" y="140">The ridge</text>
  </g>
  <g class="step" data-step="1">
    <path class="ground draw" d="M0,108 L228,150 M228,232 L298,252 M298,334 L1010,358 L1028,392 L1046,440"/>
    <rect class="mass draw" x="228" y="150" width="372" height="82"/>
    <rect class="mass draw" x="298" y="252" width="522" height="82"/>
    <text x="414" y="196" text-anchor="middle">Upper level</text>
    <text x="559" y="298" text-anchor="middle">Lower level</text>
  </g>
  <g class="step" data-step="2">
    <path class="glass draw" d="M600,158 L600,226 M820,262 L820,326"/>
    <path class="deck draw" d="M600,232 L812,232 M820,334 L1010,334"/>
    <path class="pool draw" d="M864,334 L864,352 L1006,352 L1006,334"/>
    <path class="sea draw" d="M1046,440 L1200,440"/>
    <path class="wave draw" d="M1070,452 q10,-6 20,0 t20,0 M1120,462 q10,-6 20,0 t20,0"/>
    <text x="935" y="384" text-anchor="middle">28 m infinity pool</text>
    <text x="1112" y="430">The bay</text>
  </g>
  <g class="step" data-step="3">
    <path class="slab draw" d="M206,142 L712,142"/>
    <path class="pergola draw" d="M600,150 L800,150 ${Array.from({ length: 11 }, (_, i) => `M${606 + i * 18},150 L${606 + i * 18},160`).join(' ')}"/>
    <text x="440" y="128" text-anchor="middle">Roof slab</text>
    <text x="700" y="186" text-anchor="middle">Pergola terrace</text>
  </g>
`;
export function initConcept() {
  const root = document.querySelector('.concept');
  const svg = root.querySelector('.section-drawing');
  svg.insertAdjacentHTML('beforeend', SECTION);
  prepDraw(svg);
  const study = root.querySelector('.concept__study');
  const steps = [...svg.querySelectorAll('.step')];
  const draws = steps.map((g) => [...g.querySelectorAll('.draw')]);
  const items = [...root.querySelectorAll('.principles li')];
  const narrow = window.matchMedia('(max-width: 960px)');
  const isStatic = () => reducedMotion() || narrow.matches;
  const shown = steps.map(() => -1);
  const setStep = (k, p) => {
    if (Math.abs(shown[k] - p) < 0.002) return;
    shown[k] = p;
    draws[k].forEach((el) => { el.style.strokeDashoffset = (el.dataset.len * (1 - p)).toFixed(1); });
    steps[k].style.setProperty('--p', p.toFixed(3));
  };
  let state = null;
  const setActive = (next) => {
    if (next === state) return;
    state = next;
    root.classList.toggle('is-complete', next === 'all' || next === 'static');
    items.forEach((li, i) => {
      li.classList.toggle('is-on', next === 'all' || next === 'static' || i === next);
      li.classList.toggle('is-past', typeof next === 'number' && i < next);
    });
    steps.forEach((g, k) => g.classList.toggle('is-lit', typeof next === 'number' && k === next + 1));
  };
  const update = () => {
    if (isStatic()) { steps.forEach((g, k) => setStep(k, 1)); setActive('static'); return; }
    if (state === 'static') state = null;
    const vh = window.innerHeight; const r = study.getBoundingClientRect();
    if (r.top > vh * 1.5 || r.bottom < -vh * 0.5) return;
    setStep(0, clamp((vh * 0.95 - r.top) / (vh * 0.45)));
    let active = -1;
    items.forEach((li, i) => {
      const b = li.getBoundingClientRect();
      const p = clamp((vh * 0.78 - b.top) / (b.height * 0.85));
      setStep(i + 1, p);
      if (p > 0.02) active = i;
    });
    setActive(r.bottom < vh * 0.62 ? 'all' : active);
  };
  update();
  return update;
}

/* ---------------- Materials in context ---------------- */
export function initMaterials() {
  const grid = document.querySelector('.materials__grid');
  const items = MATERIALS.map((m) => ({ src: MEDIA[m.context], name: `${m.name}, ${m.where.toLowerCase()}`, text: m.text }));
  grid.innerHTML = MATERIALS.map((m, i) => `
    <figure class="mat mat--${i + 1}">
      <div class="mat__frame" data-reveal="image">
        <button type="button" class="mat__open" data-i="${i}">
          <img src="${MEDIA[m.context]}" alt="${m.name} in the ${m.where.toLowerCase()}" loading="lazy" decoding="async" data-parallax="0.05" />
          <span class="sr-only">Open photograph: ${m.name}</span>
        </button>
        <span class="mat__swatch" aria-hidden="true"><img src="${MEDIA[m.key]}" alt="" loading="lazy" decoding="async" /></span>
      </div>
      <figcaption>
        <span class="mat__n">${pad(i + 1)}</span>
        <h3>${m.name}</h3>
        <p class="mat__where">${m.where}</p>
        <p>${m.text}</p>
      </figcaption>
    </figure>`).join('');
  grid.querySelectorAll('.mat__open').forEach((b) => b.addEventListener('click', () => openLightbox(items, +b.dataset.i)));
}

/* ---------------- Life at Serra: morning sun / evening sun ----------------
   Two renders from the same viewpoint. The morning picture sits on top and is clipped
   at the divider; drag, click or use the arrow keys to move it. */
export function initCompare() {
  const root = document.querySelector('.compare');
  const handle = root.querySelector('.compare__handle');
  let pos = 50; let drag = null;
  const set = (v, { animate = false } = {}) => {
    pos = clamp(v, 0, 100);
    root.classList.toggle('is-animating', animate);
    root.style.setProperty('--pos', `${pos.toFixed(2)}%`);
    root.style.setProperty('--k', (pos / 100).toFixed(4));
    handle.setAttribute('aria-valuenow', String(Math.round(pos)));
    handle.setAttribute('aria-valuetext', pos >= 99.5 ? 'Morning sun' : pos <= 0.5 ? 'Evening sun' : `${Math.round(pos)}% morning sun, ${Math.round(100 - pos)}% evening sun`);
  };
  const at = (x) => { const r = root.getBoundingClientRect(); return ((x - r.left) / r.width) * 100; };
  root.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: false, touch: e.pointerType === 'touch' };
    if (!drag.touch) { e.preventDefault(); try { root.setPointerCapture(e.pointerId); } catch (_) { /* pointer already gone */ } root.classList.add('is-dragging'); set(at(e.clientX), { animate: true }); handle.focus({ preventScroll: true }); }
  });
  root.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    if (drag.touch && !drag.moved) {
      // decide between a horizontal drag and a vertical page scroll
      const dx = Math.abs(e.clientX - drag.x); const dy = Math.abs(e.clientY - drag.y);
      if (dx < 6 && dy < 6) return;
      if (dy > dx) { drag = null; return; }
      drag.moved = true; try { root.setPointerCapture(e.pointerId); } catch (_) { /* pointer already gone */ } root.classList.add('is-dragging');
    }
    drag.moved = true;
    set(at(e.clientX));
  });
  const end = (e) => {
    if (!drag || (e && e.pointerId !== drag.id)) return;
    if (drag.touch && !drag.moved && e && e.type === 'pointerup') set(at(e.clientX), { animate: true });
    drag = null; root.classList.remove('is-dragging');
  };
  root.addEventListener('pointerup', end); root.addEventListener('pointercancel', end);
  handle.addEventListener('keydown', (e) => {
    const step = { ArrowLeft: -5, ArrowDown: -5, ArrowRight: 5, ArrowUp: 5, PageDown: -20, PageUp: 20 }[e.key];
    if (step !== undefined) { e.preventDefault(); set(pos + step, { animate: true }); }
    else if (e.key === 'Home') { e.preventDefault(); set(0, { animate: true }); }
    else if (e.key === 'End') { e.preventDefault(); set(100, { animate: true }); }
  });
  set(50);
}

/* ---------------- Stay enquiry (concept: nothing is sent) ---------------- */
export function initStay() {
  const form = document.querySelector('.form');
  const done = document.querySelector('.form__done');
  const err = form.querySelector('.form__error');
  const f = form.elements;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const iso = (d) => d.toISOString().slice(0, 10);
  f.arrival.min = iso(today);
  f.arrival.addEventListener('change', () => {
    if (!f.arrival.value) return;
    const next = new Date(f.arrival.value); next.setDate(next.getDate() + 1);
    f.departure.min = iso(next);
    if (f.departure.value && f.departure.value <= f.arrival.value) f.departure.value = '';
  });
  const fmt = (v) => new Date(v + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const checks = [
      [f.arrival, !!f.arrival.value && new Date(f.arrival.value) >= today, 'Choose an arrival date from today onwards.'],
      [f.departure, !!f.departure.value && f.departure.value > f.arrival.value, 'Choose a departure date after your arrival.'],
      [f.guests, Number.isInteger(+f.guests.value) && +f.guests.value >= 1, 'Tell us how many guests will stay.'],
      [f.name, f.name.value.trim().length > 1, 'Add your name so we know who is writing.'],
      [f.email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.value.trim()), 'Add an email address we can reply to.'],
    ];
    checks.forEach(([field, ok]) => field.setAttribute('aria-invalid', String(!ok)));
    const bad = checks.find(([, ok]) => !ok);
    if (bad) { err.textContent = bad[2]; bad[0].focus(); return; }
    err.textContent = '';
    const nights = Math.round((new Date(f.departure.value) - new Date(f.arrival.value)) / 864e5);
    done.querySelector('.form__who').textContent = `, ${f.name.value.trim().split(' ')[0]}`;
    done.querySelector('.form__summary').textContent = `Your enquiry: ${fmt(f.arrival.value)} to ${fmt(f.departure.value)}, ${nights} night${nights === 1 ? '' : 's'}, ${f.guests.value} guest${+f.guests.value === 1 ? '' : 's'}.`;
    form.hidden = true; done.hidden = false; done.focus();
  });
  done.querySelector('.form__again').addEventListener('click', () => {
    form.reset(); form.querySelectorAll('[aria-invalid]').forEach((x) => x.removeAttribute('aria-invalid'));
    done.hidden = true; form.hidden = false; f.arrival.focus();
  });
}
