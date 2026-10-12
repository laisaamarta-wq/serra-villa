import { MEDIA, SPECS, MATERIALS } from './content.js';
import { onceVisible, countUp, reducedMotion } from './motion.js';
import { openLightbox } from './lightbox.js';

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const pad = (n) => String(n).padStart(2, '0');

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

/* ---------------- Life at Serra: one view, all day ----------------
   The original time-of-day slider: the same view cross-fades from morning light through
   golden hour to blue hour, with the time shown above the track. It plays through once
   on arrival, then belongs to the visitor. */
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
  range.addEventListener('pointerdown', () => { touched = true; });
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
