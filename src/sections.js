import { MEDIA, SPECS, MATERIALS, DISTANCES } from './content.js';
import { onceVisible, countUp, reducedMotion } from './motion.js';

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
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
  }, '0px 0px -18% 0px');
}

/* ---------------- Concept: the plan drawn over the studio model ---------------- */
const HOLO = `
  <rect x="120" y="140" width="640" height="220"/>
  <line x1="260" y1="140" x2="260" y2="360"/><line x1="380" y1="140" x2="380" y2="360"/>
  <line x1="620" y1="140" x2="620" y2="360"/><line x1="260" y1="250" x2="380" y2="250"/>
  <rect x="120" y="360" width="640" height="160"/>
  ${Array.from({ length: 19 }, (_, i) => `<line x1="${152 + i * 32}" y1="372" x2="${152 + i * 32}" y2="508"/>`).join('')}
  <path d="M120,110 L760,110 M120,104 L120,116 M760,104 L760,116"/>
  <path d="M790,140 L790,520 M784,140 L796,140 M784,520 L796,520"/>
  <text x="440" y="98" text-anchor="middle">22.9 m</text><text x="804" y="334">13.6 m</text>
`;
export function initConcept() {
  const svg = document.querySelector('.holo');
  svg.innerHTML = HOLO;
  svg.querySelectorAll('rect, line, path').forEach((el, i) => { el.classList.add('draw'); el.style.transitionDelay = `${(i * 0.045).toFixed(2)}s`; });
  prepDraw(svg);
  onceVisible(svg, () => svg.classList.add('is-drawn'), '0px 0px -25% 0px');
}

/* ---------------- Materials: magnifying lens ---------------- */
export function initMaterials() {
  const ul = document.querySelector('.materials__grid');
  ul.innerHTML = MATERIALS.map((m) => `
    <li class="material">
      <div class="material__swatch" data-src="${MEDIA[m.key]}" data-reveal="image">
        <img src="${MEDIA[m.key]}" alt="${m.name} sample" loading="lazy" decoding="async" />
        <span class="lens" aria-hidden="true"></span>
      </div>
      <h3>${m.name}</h3><p>${m.text}</p>
    </li>`).join('');
  if (!window.matchMedia('(hover: hover)').matches) return;
  ul.querySelectorAll('.material__swatch').forEach((sw) => {
    const lens = sw.querySelector('.lens'); const Z = 2.6;
    lens.style.backgroundImage = `url("${sw.dataset.src}")`;
    const move = (e) => {
      const r = sw.getBoundingClientRect();
      const x = e.clientX - r.left; const y = e.clientY - r.top;
      const side = Math.max(r.width, r.height); const R = 80;
      lens.style.setProperty('--x', `${x}px`); lens.style.setProperty('--y', `${y}px`);
      lens.style.backgroundSize = `${side * Z}px ${side * Z}px`;
      lens.style.backgroundPosition = `${-(x * Z - R) - (side - r.width) * Z / 2}px ${-(y * Z - R) - (side - r.height) * Z / 2}px`;
    };
    sw.addEventListener('pointerenter', (e) => { move(e); sw.classList.add('is-lens'); });
    sw.addEventListener('pointermove', move);
    sw.addEventListener('pointerleave', () => sw.classList.remove('is-lens'));
  });
}

/* ---------------- Time of day ---------------- */
export function initLight() {
  const el = document.querySelector('.life__light');
  const range = el.querySelector('input'); const time = el.querySelector('.light__time');
  const toMin = (h, m) => h * 60 + m;
  const fmt = (min) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(Math.round(min % 60)).padStart(2, '0')}`;
  const set = (v) => {
    el.style.setProperty('--day', clamp((50 - v) / 50).toFixed(3));
    el.style.setProperty('--night', clamp((v - 50) / 50).toFixed(3));
    const min = v <= 50 ? toMin(10, 40) + (toMin(19, 20) - toMin(10, 40)) * (v / 50) : toMin(19, 20) + (toMin(20, 45) - toMin(19, 20)) * ((v - 50) / 50);
    const name = v < 30 ? 'morning light' : v < 70 ? 'golden hour' : 'blue hour';
    time.textContent = `${fmt(min)}, ${name}`;
    range.setAttribute('aria-valuetext', time.textContent);
  };
  let touched = false;
  range.addEventListener('input', () => { touched = true; set(+range.value); });
  set(50);
  if (reducedMotion()) return;
  onceVisible(el, () => {
    const keys = [[0, 50], [1500, 8], [3200, 92], [4600, 50]];
    const t0 = performance.now();
    const step = (now) => {
      if (touched) return;
      const t = now - t0; let i = 0; while (i < keys.length - 2 && t > keys[i + 1][0]) i++;
      const [ta, va] = keys[i]; const [tb, vb] = keys[i + 1];
      const k = clamp((t - ta) / (tb - ta)); const e = k * k * (3 - 2 * k);
      const v = va + (vb - va) * e; range.value = v; set(v);
      if (t < keys[keys.length - 1][0]) requestAnimationFrame(step);
    };
    setTimeout(() => requestAnimationFrame(step), 400);
  }, '0px 0px -35% 0px');
}

/* ---------------- Location ---------------- */
export function initLocation() {
  document.querySelector('.distances').innerHTML = DISTANCES.map((d) => `<li><span>${d.place}</span><span>${d.how}</span></li>`).join('');
  const svg = document.querySelector('.coast');
  svg.innerHTML = `
    <path class="sea" d="M600,0 L600,600 L0,600 L0,430 C70,415 120,450 170,438 C230,422 250,360 300,350 C352,340 372,392 420,380 C470,368 470,300 520,262 C560,232 600,236 600,236 Z"/>
    <path class="contour draw" d="M0,380 C80,360 130,392 175,380 C232,364 250,300 300,292 C352,284 368,332 420,322 C468,312 470,250 515,214 C552,184 600,186 600,186"/>
    <path class="contour draw" d="M0,320 C90,300 140,330 182,318 C236,302 256,240 304,232 C352,224 366,272 418,262 C462,252 468,196 508,166 C546,138 600,138 600,138"/>
    <path class="contour draw" d="M0,250 C100,236 150,262 190,250 C240,236 262,178 308,170 C352,162 364,208 414,200 C456,192 462,142 500,116 C540,90 600,92 600,92"/>
    <path class="shore draw" d="M0,430 C70,415 120,450 170,438 C230,422 250,360 300,350 C352,340 372,392 420,380 C470,368 470,300 520,262 C560,232 600,236 600,236"/>
    <path class="road draw" d="M298,338 C300,300 330,270 360,250 C400,224 440,236 470,250 C500,264 512,252 522,250"/>
    <circle class="pin pin--serra" cx="298" cy="342" r="7"/><text x="282" y="326" text-anchor="end" class="pin-label pin-label--serra">Serra</text>
    <circle class="pin" cx="522" cy="262" r="4.5"/><text x="512" y="290" text-anchor="end">Village and harbour</text>
    <circle class="pin" cx="176" cy="436" r="4.5"/><text x="168" y="466" text-anchor="middle">Swimming cove</text>
    <circle class="pin" cx="560" cy="246" r="4.5"/><text x="560" y="226" text-anchor="middle">Marina</text>
    <text x="380" y="520" class="bay">the bay</text>
  `;
  prepDraw(svg);
  onceVisible(svg, () => svg.classList.add('is-drawn'));
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
