import { MEDIA, PLAN, SPACES, MATERIALS, DISTANCES } from './content.js';

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const UNITS_PER_M = 28;
const area = (r) => Math.round((r.w * r.h) / (UNITS_PER_M * UNITS_PER_M));
const svgEl = (tag, attrs = {}) => {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  return el;
};
const prepDraw = (root) => root.querySelectorAll('.draw').forEach((el) => {
  const len = el.getTotalLength ? Math.ceil(el.getTotalLength()) : 1000;
  el.style.setProperty('--len', len);
});
const onceVisible = (el, fn, margin = '-15% 0px') => {
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { fn(); io.disconnect(); } }), { rootMargin: margin });
  io.observe(el);
};

/* ---------------- Plan ---------------- */
export function initPlan() {
  const svg = document.querySelector('.plan__svg');
  const info = document.querySelector('.plan__info');
  const tabs = [...document.querySelectorAll('.plan__tabs button')];
  const [hRoom, hArea, hNote] = [info.querySelector('.plan__room'), info.querySelector('.plan__area'), info.querySelector('.plan__note')];
  let level = 'terrace';

  const showLevel = () => {
    const L = PLAN[level];
    hRoom.textContent = L.title; hArea.textContent = L.summary;
    hNote.textContent = 'Point at a room or use Tab to move through them.';
  };
  const showRoom = (r) => {
    hRoom.textContent = r.name;
    hArea.textContent = `${area(r)} m²${r.outdoor ? ', outdoors' : ''}`;
    hNote.textContent = r.text;
  };

  function draw() {
    svg.innerHTML = '';
    svg.classList.remove('is-drawn');
    const L = PLAN[level];
    const indoor = L.rooms.filter((r) => !r.outdoor);
    const minX = Math.min(...indoor.map((r) => r.x)); const maxX = Math.max(...indoor.map((r) => r.x + r.w));
    const minY = Math.min(...indoor.map((r) => r.y)); const maxY = Math.max(...indoor.map((r) => r.y + r.h));
    const g = svgEl('g');
    // outdoor areas first
    L.rooms.filter((r) => r.outdoor).forEach((r) => g.appendChild(svgEl('rect', { x: r.x, y: r.y, width: r.w, height: r.h, class: 'thin draw' })));
    if (L.pool) g.appendChild(svgEl('rect', { x: L.pool.x, y: L.pool.y, width: L.pool.w, height: L.pool.h, class: 'water draw' }));
    if (level === 'terrace') {
      const per = L.rooms.find((r) => r.id === 'pergola');
      for (let x = per.x + 32; x < per.x + per.w; x += 32) g.appendChild(svgEl('line', { x1: x, y1: per.y + 12, x2: x, y2: per.y + per.h - 12, class: 'thin draw' }));
      for (let i = 0; i < 5; i++) g.appendChild(svgEl('line', { x1: 140, y1: 296 + i * 12, x2: 240, y2: 296 + i * 12, class: 'thin draw' }));
    } else {
      g.appendChild(svgEl('line', { x1: 120, y1: 128, x2: 320, y2: 128, class: 'wall draw', 'stroke-width': 5 }));
      for (let i = 0; i < 5; i++) g.appendChild(svgEl('line', { x1: 96, y1: 270 + i * 12, x2: 176, y2: 270 + i * 12, class: 'thin draw' }));
    }
    // interior partitions and outer wall
    indoor.forEach((r) => g.appendChild(svgEl('rect', { x: r.x, y: r.y, width: r.w, height: r.h, class: 'thin draw' })));
    g.appendChild(svgEl('rect', { x: minX, y: minY, width: maxX - minX, height: maxY - minY, class: 'wall draw' }));
    // dimensions
    const wM = ((maxX - minX) / UNITS_PER_M).toFixed(1); const hM = ((maxY - minY) / UNITS_PER_M).toFixed(1);
    g.appendChild(svgEl('path', { d: `M${minX},${minY - 34} L${maxX},${minY - 34} M${minX},${minY - 40} L${minX},${minY - 28} M${maxX},${minY - 40} L${maxX},${minY - 28}`, class: 'dim draw' }));
    const tw = svgEl('text', { x: (minX + maxX) / 2, y: minY - 44, 'text-anchor': 'middle', class: 'dimtext' }); tw.textContent = `${wM} m`; g.appendChild(tw);
    const xr = Math.max(...L.rooms.map((r) => r.x + r.w)) + 30;
    g.appendChild(svgEl('path', { d: `M${xr},${minY} L${xr},${maxY} M${xr - 6},${minY} L${xr + 6},${minY} M${xr - 6},${maxY} L${xr + 6},${maxY}`, class: 'dim draw' }));
    const th = svgEl('text', { x: xr + 12, y: (minY + maxY) / 2, class: 'dimtext' }); th.textContent = `${hM} m`; g.appendChild(th);
    svg.appendChild(g);
    // interactive rooms + labels
    L.rooms.forEach((r) => {
      const hit = svgEl('rect', { x: r.x, y: r.y, width: r.w, height: r.h, class: 'room' + (r.outdoor ? ' is-outdoor' : ''), tabindex: 0, role: 'button', 'aria-label': `${r.name}, ${area(r)} square metres` });
      hit.addEventListener('pointerenter', () => showRoom(r));
      hit.addEventListener('focus', () => showRoom(r));
      hit.addEventListener('click', () => showRoom(r));
      svg.appendChild(hit);
      const lx = r.x + 14; const ly = r.outdoor && L.pool && r.id === 'poolterrace' ? r.y + 30 : r.y + 26;
      const t = svgEl('text', { x: lx, y: ly, class: 'label' });
      t.innerHTML = `<tspan>${r.name}</tspan><tspan class="a" x="${lx}" dy="1.35em">${area(r)} m²</tspan>`;
      svg.appendChild(t);
    });
    prepDraw(svg);
    requestAnimationFrame(() => requestAnimationFrame(() => svg.classList.add('is-drawn')));
    showLevel();
  }

  tabs.forEach((tab) => tab.addEventListener('click', () => {
    level = tab.dataset.level;
    tabs.forEach((t) => t.setAttribute('aria-selected', String(t === tab)));
    draw();
  }));
  tabs.forEach((tab, i) => tab.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length]; n.focus(); n.click();
  }));
  svg.addEventListener('pointerleave', showLevel);
  onceVisible(svg, draw, '0px 0px -20% 0px');
}

/* ---------------- Spaces ---------------- */
export function initSpaces() {
  const section = document.querySelector('.spaces');
  const media = section.querySelector('.spaces__media');
  const copy = section.querySelector('.spaces__copy');
  const bar = section.querySelector('.spaces__progress');
  const n = SPACES.length;
  section.style.setProperty('--n', n);
  const imgs = SPACES.map((s, i) => {
    const img = new Image(); img.src = MEDIA[s.key]; img.alt = s.name; img.loading = i < 2 ? 'eager' : 'lazy'; img.decoding = 'async';
    media.appendChild(img); return img;
  });
  const texts = SPACES.map((s) => {
    const el = document.createElement('div'); el.className = 'space';
    el.innerHTML = `<h3><span>${s.name}</span></h3><p>${s.text}</p>`;
    copy.appendChild(el); return el;
  });
  let active = -1;
  return function update() {
    const r = section.getBoundingClientRect();
    const span = r.height - window.innerHeight;
    if (r.top > window.innerHeight || r.bottom < 0) return;
    const u = clamp(-r.top / span) * (n - 1); // 0 … n-1
    imgs.forEach((img, k) => {
      if (k === 0) { img.style.setProperty('--s', (1.06 - 0.06 * clamp(u)).toFixed(4)); return; }
      const reveal = clamp((u - (k - 0.62)) / 0.5);
      img.style.setProperty('--clip', `${((1 - reveal) * 100).toFixed(2)}%`);
      img.style.setProperty('--s', (1.1 - 0.1 * clamp((u - (k - 0.62)) / 1.2)).toFixed(4));
    });
    const a = Math.min(n - 1, Math.floor(u + 0.38));
    if (a !== active) {
      active = a;
      texts.forEach((t, k) => { t.classList.toggle('is-on', k === a); t.classList.toggle('is-past', k < a); t.setAttribute('aria-hidden', String(k !== a)); });
    }
    bar.style.setProperty('--p', (u / (n - 1)).toFixed(4));
  };
}

/* ---------------- Light ---------------- */
export function initLight({ reduced }) {
  const el = document.querySelector('.light');
  const [day, gold, night] = ['day', 'gold', 'night'].map((k) => el.querySelector(`.light__img--${k}`));
  day.src = MEDIA.day; gold.src = MEDIA.master; night.src = MEDIA.night;
  day.loading = gold.loading = night.loading = 'lazy';
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
  if (reduced) return;
  // one demonstration sweep the first time the section is seen
  onceVisible(el, () => {
    const keys = [[0, 50], [1400, 6], [3000, 94], [4300, 50]];
    const t0 = performance.now();
    const step = (now) => {
      if (touched) return;
      const t = now - t0; let i = 0; while (i < keys.length - 2 && t > keys[i + 1][0]) i++;
      const [ta, va] = keys[i]; const [tb, vb] = keys[i + 1];
      const k = clamp((t - ta) / (tb - ta)); const e = k * k * (3 - 2 * k);
      const v = va + (vb - va) * e; range.value = v; set(v);
      if (t < keys[keys.length - 1][0]) requestAnimationFrame(step);
    };
    setTimeout(() => requestAnimationFrame(step), 500);
  }, '-30% 0px');
}

/* ---------------- Materials ---------------- */
export function initMaterials() {
  const ul = document.querySelector('.materials__grid');
  ul.innerHTML = MATERIALS.map((m) => `
    <li class="material">
      <div class="material__swatch" data-src="${MEDIA[m.key]}">
        <img src="${MEDIA[m.key]}" alt="${m.name} sample" loading="lazy" decoding="async" />
        <span class="lens" aria-hidden="true"></span>
      </div>
      <h3>${m.name}</h3><p>${m.text}</p>
    </li>`).join('');
  ul.querySelectorAll('.material__swatch').forEach((sw) => {
    const lens = sw.querySelector('.lens');
    const Z = 3;
    lens.style.backgroundImage = `url("${sw.dataset.src}")`;
    const move = (e) => {
      const r = sw.getBoundingClientRect();
      const x = e.clientX - r.left; const y = e.clientY - r.top;
      const side = Math.max(r.width, r.height);
      lens.style.setProperty('--x', `${x}px`); lens.style.setProperty('--y', `${y}px`);
      lens.style.backgroundSize = `${side * Z}px ${side * Z}px`;
      lens.style.backgroundPosition = `${-(x * Z - 85) - (side - r.width) * Z / 2}px ${-(y * Z - 85) - (side - r.height) * Z / 2}px`;
    };
    sw.addEventListener('pointerenter', (e) => { move(e); lens.style.setProperty('--ls', 1); });
    sw.addEventListener('pointermove', move);
    sw.addEventListener('pointerleave', () => lens.style.setProperty('--ls', 0));
  });
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
    <circle class="pin pin--serra" cx="298" cy="342" r="7"/><text x="270" y="326" text-anchor="end">Serra</text>
    <circle class="pin" cx="522" cy="262" r="4.5"/><text x="534" y="256">Village and harbour</text>
    <circle class="pin" cx="176" cy="436" r="4.5"/><text x="168" y="466" text-anchor="middle">Swimming cove</text>
    <circle class="pin" cx="560" cy="246" r="4.5"/><text x="560" y="226" text-anchor="middle">Marina</text>
    <text x="360" y="520" style="font-style:italic;font-family:var(--f-display);font-size:22px;fill:rgba(27,32,28,.55)">the bay</text>
  `;
  prepDraw(svg);
  onceVisible(svg, () => svg.classList.add('is-drawn'));
}

/* ---------------- Viewing form (demo) ---------------- */
export function initForm() {
  const form = document.querySelector('.form');
  const status = form.querySelector('.form__status');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.elements.name; const email = form.elements.email;
    const okName = name.value.trim().length > 1; const okEmail = /.+@.+\..+/.test(email.value);
    name.setAttribute('aria-invalid', String(!okName)); email.setAttribute('aria-invalid', String(!okEmail));
    if (!okName || !okEmail) { status.textContent = !okName ? 'Add your name so we know who to expect.' : 'Add an email address we can reply to.'; (!okName ? name : email).focus(); return; }
    status.textContent = `Thank you, ${name.value.trim().split(' ')[0]}. This is a concept site, so your request was not sent.`;
    form.reset();
  });
}
