import { MEDIA, SPECS, MATERIALS, LIGHT, PLACES } from './content.js';
import { onceVisible, countUp, reducedMotion } from './motion.js';
import { openLightbox } from './lightbox.js';

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const pad = (n) => String(n).padStart(2, '0');
const prepDraw = (root) => root.querySelectorAll('.draw').forEach((el) => {
  el.style.setProperty('--len', Math.ceil(el.getTotalLength ? el.getTotalLength() : 1000));
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

/* ---------------- Architecture: schematic section ---------------- */
const SECTION = `
  <defs>
    <pattern id="earth" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <line x1="0" y1="0" x2="0" y2="10" class="hatch"/>
    </pattern>
  </defs>
  <path class="earth" d="M0,108 L228,150 L228,232 L298,252 L298,334 L1010,358 L1046,440 L0,440 Z"/>
  <path class="ground draw" d="M0,108 L228,150 M228,232 L298,252 M298,334 L1010,358 L1028,392 L1046,440"/>
  <path class="sea draw" d="M1046,440 L1200,440"/>
  <path class="wave draw" d="M1070,452 q10,-6 20,0 t20,0 M1120,462 q10,-6 20,0 t20,0"/>
  <rect class="mass draw" x="228" y="150" width="372" height="82"/>
  <rect class="mass draw" x="298" y="252" width="522" height="82"/>
  <path class="slab draw" d="M206,142 L712,142"/>
  <path class="deck draw" d="M600,232 L812,232"/>
  <path class="pergola draw" d="M600,150 L800,150 ${Array.from({ length: 11 }, (_, i) => `M${606 + i * 18},150 L${606 + i * 18},160`).join(' ')}"/>
  <path class="glass draw" d="M600,158 L600,226 M820,262 L820,326"/>
  <path class="deck draw" d="M820,334 L1010,334"/>
  <path class="pool draw" d="M864,334 L864,352 L1006,352 L1006,334"/>
  <path class="tree draw" d="M60,104 L60,84 M140,120 L140,98 M1090,436 L1090,420"/>
  <circle class="tree draw" cx="60" cy="76" r="10"/><circle class="tree draw" cx="140" cy="90" r="10"/><circle class="tree draw" cx="1090" cy="412" r="9"/>
  <g class="notes">
    <text x="440" y="128" text-anchor="middle">Roof slab</text>
    <text x="414" y="196" text-anchor="middle">Upper level</text>
    <text x="700" y="186" text-anchor="middle">Pergola terrace</text>
    <text x="559" y="298" text-anchor="middle">Lower level</text>
    <text x="935" y="384" text-anchor="middle">28 m infinity pool</text>
    <text x="1140" y="428" text-anchor="middle">The bay</text>
    <text x="40" y="140">The ridge</text>
  </g>
`;
export function initConcept() {
  const svg = document.querySelector('.section-drawing');
  svg.insertAdjacentHTML('beforeend', SECTION);
  svg.querySelectorAll('.draw').forEach((el, i) => { el.style.transitionDelay = `${(i * 0.08).toFixed(2)}s`; });
  prepDraw(svg);
  onceVisible(svg, () => svg.classList.add('is-drawn'), '0px 0px -20% 0px');
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

/* ---------------- Life at Serra: time of day ---------------- */
export function initLife() {
  const root = document.querySelector('.life');
  const imgs = [...root.querySelectorAll('.life__img')];
  const tabsEl = root.querySelector('.life__tabs');
  const title = root.querySelector('.life__title');
  const text = root.querySelector('.life__text');
  const copy = root.querySelector('.life__copy');
  tabsEl.innerHTML = LIGHT.map((l, i) => `<button type="button" role="tab" id="light-${i}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}"><span>${pad(i + 1)}</span>${l.name}</button>`).join('');
  const tabs = [...tabsEl.children];
  const set = (k, focus = false) => {
    imgs.forEach((im, i) => im.classList.toggle('is-on', i === k));
    tabs.forEach((t, i) => { t.setAttribute('aria-selected', String(i === k)); t.tabIndex = i === k ? 0 : -1; });
    if (focus) tabs[k].focus();
    copy.classList.remove('is-swap'); void copy.offsetWidth; copy.classList.add('is-swap');
    title.textContent = LIGHT[k].title; text.textContent = LIGHT[k].text;
    root.querySelector('.life__frame').setAttribute('aria-labelledby', tabs[k].id);
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => set(i));
    t.addEventListener('keydown', (e) => {
      const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key]; if (!d) return;
      e.preventDefault(); set((i + d + tabs.length) % tabs.length, true);
    });
  });
  set(0);
}

/* ---------------- Location: illustrative map ---------------- */
export function initLocation() {
  const list = document.querySelector('.places');
  const fig = document.querySelector('.map');
  const svg = fig.querySelector('.coast');
  list.innerHTML = PLACES.map((p) => `<li><button type="button" data-id="${p.id}" aria-pressed="false"><span>${p.place}</span><span>${p.how}</span></button></li>`).join('');
  const on = PLACES.filter((p) => p.at);
  svg.innerHTML = `
    <defs><pattern id="paper" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24,0 L0,0 L0,24" class="grid"/></pattern></defs>
    <rect width="600" height="600" class="paper"/>
    <rect width="600" height="600" fill="url(#paper)"/>
    <path class="sea" d="M600,0 L600,600 L0,600 L0,430 C70,415 120,450 170,438 C230,422 250,360 300,350 C352,340 372,392 420,380 C470,368 470,300 520,262 C560,232 600,236 600,236 Z"/>
    <path class="contour draw" d="M0,380 C80,360 130,392 175,380 C232,364 250,300 300,292 C352,284 368,332 420,322 C468,312 470,250 515,214 C552,184 600,186 600,186"/>
    <path class="contour draw" d="M0,320 C90,300 140,330 182,318 C236,302 256,240 304,232 C352,224 366,272 418,262 C462,252 468,196 508,166 C546,138 600,138 600,138"/>
    <path class="contour draw" d="M0,250 C100,236 150,262 190,250 C240,236 262,178 308,170 C352,162 364,208 414,200 C456,192 462,142 500,116 C540,90 600,92 600,92"/>
    <path class="contour draw" d="M0,180 C110,170 160,196 200,186 C250,172 270,118 312,110 C356,102 366,146 412,140 C452,134 458,88 496,64 C534,40 600,44 600,44"/>
    <path class="shore draw" d="M0,430 C70,415 120,450 170,438 C230,422 250,360 300,350 C352,340 372,392 420,380 C470,368 470,300 520,262 C560,232 600,236 600,236"/>
    <path class="road draw" d="M298,338 C300,300 330,270 360,250 C400,224 440,236 470,250 C500,264 512,252 522,250"/>
    <text x="380" y="520" class="bay">the bay</text>
    ${on.map((p) => `
    <g class="pin${p.id === 'serra' ? ' pin--serra' : ''}" data-id="${p.id}" tabindex="0" role="button" aria-label="${p.place}: ${p.how}" transform="translate(${p.at[0]} ${p.at[1]})">
      ${p.id === 'serra' ? '<circle class="pulse" r="14"/>' : ''}
      <circle class="hit" r="18"/>
      <circle class="dot" r="${p.id === 'serra' ? 7 : 5}"/>
      <text class="pin__label" ${p.id === 'serra' ? 'x="-14" y="-16" text-anchor="end"' : p.id === 'cove' ? 'y="28" text-anchor="middle"' : p.id === 'marina' ? 'y="-16" text-anchor="middle"' : 'x="-12" y="26" text-anchor="end"'}>${p.place}</text>
    </g>`).join('')}
  `;
  const card = document.createElement('div');
  card.className = 'map__card'; card.setAttribute('aria-live', 'polite');
  card.innerHTML = '<strong></strong><span></span>';
  fig.appendChild(card);
  prepDraw(svg);
  onceVisible(svg, () => svg.classList.add('is-drawn'));

  // gentle zoom toward the chosen place
  const view = { s: 1, cx: 300, cy: 300 }; let anim = null;
  const applyView = () => {
    const w = 600 / view.s;
    const cx = clamp(view.cx, w / 2, 600 - w / 2); const cy = clamp(view.cy, w / 2, 600 - w / 2);
    svg.setAttribute('viewBox', `${(cx - w / 2).toFixed(1)} ${(cy - w / 2).toFixed(1)} ${w.toFixed(1)} ${w.toFixed(1)}`);
  };
  const zoomTo = (s, cx, cy) => {
    cancelAnimationFrame(anim);
    const from = { ...view }; const to = { s, cx, cy };
    if (reducedMotion()) { Object.assign(view, to); applyView(); return; }
    const t0 = performance.now();
    const step = (now) => {
      const k = Math.min(1, (now - t0) / 700); const e = 1 - Math.pow(1 - k, 3);
      view.s = from.s + (to.s - from.s) * e; view.cx = from.cx + (to.cx - from.cx) * e; view.cy = from.cy + (to.cy - from.cy) * e;
      applyView(); if (k < 1) anim = requestAnimationFrame(step);
    };
    anim = requestAnimationFrame(step);
  };

  const select = (id, { zoom = true } = {}) => {
    const p = PLACES.find((x) => x.id === id);
    svg.querySelectorAll('.pin').forEach((g) => g.classList.toggle('is-active', g.dataset.id === id));
    list.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.id === id)));
    card.querySelector('strong').textContent = p.place;
    card.querySelector('span').textContent = p.at ? p.how : `${p.how}, beyond the edge of this map`;
    card.classList.remove('is-swap'); void card.offsetWidth; card.classList.add('is-swap');
    if (!zoom) return;
    if (p.at && p.id !== 'serra') {
      const s = PLACES.find((x) => x.id === 'serra').at; // frame the place together with Serra
      zoomTo(1.5, (p.at[0] + s[0]) / 2, (p.at[1] + s[1]) / 2);
    } else zoomTo(1, 300, 300);
  };
  list.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => select(b.dataset.id)));
  svg.querySelectorAll('.pin').forEach((g) => {
    g.addEventListener('click', () => select(g.dataset.id));
    g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(g.dataset.id); } });
  });
  fig.querySelector('.map__home').addEventListener('click', () => select('serra'));
  select('serra', { zoom: false });
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
