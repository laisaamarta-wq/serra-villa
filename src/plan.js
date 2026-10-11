import { PLAN, ROOM_PHOTOS, MEDIA } from './content.js';
import { onceVisible, reducedMotion } from './motion.js';
import { openLightbox } from './lightbox.js';

const UNITS_PER_M = 28;
const W = 1000; const H = 620;
const area = (r) => Math.round((r.w * r.h) / (UNITS_PER_M * UNITS_PER_M));
const svgEl = (tag, attrs = {}) => {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  return el;
};
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

function drawLevel(key) {
  const L = PLAN[key];
  const g = svgEl('g', { class: 'level', 'data-level': key });
  const indoor = L.rooms.filter((r) => !r.outdoor);
  const minX = Math.min(...indoor.map((r) => r.x)); const maxX = Math.max(...indoor.map((r) => r.x + r.w));
  const minY = Math.min(...indoor.map((r) => r.y)); const maxY = Math.max(...indoor.map((r) => r.y + r.h));
  const lines = svgEl('g', { class: 'lines' });
  L.rooms.filter((r) => r.outdoor).forEach((r) => lines.appendChild(svgEl('rect', { x: r.x, y: r.y, width: r.w, height: r.h, class: 'thin draw' })));
  if (L.pool) lines.appendChild(svgEl('rect', { x: L.pool.x, y: L.pool.y, width: L.pool.w, height: L.pool.h, class: 'water draw' }));
  if (key === 'terrace') {
    const per = L.rooms.find((r) => r.id === 'pergola');
    for (let x = per.x + 32; x < per.x + per.w; x += 32) lines.appendChild(svgEl('line', { x1: x, y1: per.y + 12, x2: x, y2: per.y + per.h - 12, class: 'slat draw' }));
    for (let i = 0; i < 5; i++) lines.appendChild(svgEl('line', { x1: 140, y1: 296 + i * 12, x2: 240, y2: 296 + i * 12, class: 'thin draw' }));
  } else {
    lines.appendChild(svgEl('line', { x1: 120, y1: 128, x2: 320, y2: 128, class: 'hearth draw' }));
    for (let i = 0; i < 5; i++) lines.appendChild(svgEl('line', { x1: 96, y1: 270 + i * 12, x2: 176, y2: 270 + i * 12, class: 'thin draw' }));
  }
  indoor.forEach((r) => lines.appendChild(svgEl('rect', { x: r.x, y: r.y, width: r.w, height: r.h, class: 'thin draw' })));
  lines.appendChild(svgEl('rect', { x: minX, y: minY, width: maxX - minX, height: maxY - minY, class: 'wall draw' }));
  // dimensions
  const wM = ((maxX - minX) / UNITS_PER_M).toFixed(1); const hM = ((maxY - minY) / UNITS_PER_M).toFixed(1);
  lines.appendChild(svgEl('path', { d: `M${minX},${minY - 34} L${maxX},${minY - 34} M${minX},${minY - 40} L${minX},${minY - 28} M${maxX},${minY - 40} L${maxX},${minY - 28}`, class: 'dim draw' }));
  const tw = svgEl('text', { x: (minX + maxX) / 2, y: minY - 44, 'text-anchor': 'middle', class: 'dimtext' }); tw.textContent = `${wM} m`; lines.appendChild(tw);
  const xr = Math.max(...L.rooms.map((r) => r.x + r.w)) + 30;
  lines.appendChild(svgEl('path', { d: `M${xr},${minY} L${xr},${maxY} M${xr - 6},${minY} L${xr + 6},${minY} M${xr - 6},${maxY} L${xr + 6},${maxY}`, class: 'dim draw' }));
  const th = svgEl('text', { x: xr + 12, y: (minY + maxY) / 2, class: 'dimtext' }); th.textContent = `${hM} m`; lines.appendChild(th);
  g.appendChild(lines);
  // rooms: interactive regions follow the drawn walls exactly
  L.rooms.forEach((r, i) => {
    const room = svgEl('rect', {
      x: r.x, y: r.y, width: r.w, height: r.h, class: 'room' + (r.outdoor ? ' is-outdoor' : ''),
      tabindex: 0, role: 'button', 'aria-pressed': 'false', 'data-room': r.id,
      'aria-label': `${String(i + 1).padStart(2, '0')}, ${r.name}, ${area(r)} square metres`,
    });
    g.appendChild(room);
    // room number in a small circle, name and area beneath it
    const badge = svgEl('g', { class: 'badge', 'data-room': r.id, 'aria-hidden': 'true' });
    badge.appendChild(svgEl('circle', { cx: r.x + 24, cy: r.y + 24, r: 12 }));
    const n = svgEl('text', { x: r.x + 24, y: r.y + 28.5, 'text-anchor': 'middle' }); n.textContent = String(i + 1).padStart(2, '0');
    badge.appendChild(n);
    g.appendChild(badge);
    const lx = r.x + 12; const ly = r.y + 58;
    const t = svgEl('text', { x: lx, y: ly, class: 'rlabel', 'aria-hidden': 'true' });
    t.innerHTML = `<tspan>${r.name}</tspan><tspan class="a" x="${lx}" dy="1.3em">${area(r)} m²</tspan>`;
    g.appendChild(t);
  });
  return g;
}

export function initPlan() {
  const section = document.querySelector('.plans');
  const svg = section.querySelector('.plans__svg');
  const canvas = section.querySelector('.plans__canvas');
  const tabs = [...section.querySelectorAll('[role="tab"]')];
  const info = section.querySelector('.plans__info');
  const el = {
    level: info.querySelector('.plans__level'), room: info.querySelector('.plans__room'), area: info.querySelector('.plans__area'),
    note: info.querySelector('.plans__note'), photo: info.querySelector('.plans__photo'), list: info.querySelector('.plans__list'),
    detail: info.querySelector('.plans__detail'), back: info.querySelector('.plans__back'),
    caption: info.querySelector('.plans__caption'), empty: info.querySelector('.plans__empty'),
    tbLevel: section.querySelector('.plans__tb-level'), tbSheet: section.querySelector('.plans__tb-sheet'),
  };
  const photoImg = el.photo.querySelector('img');
  const emptySvg = el.empty.querySelector('svg');
  // fade each new photograph in once it has loaded, so the panel never flashes empty
  photoImg.addEventListener('load', () => el.photo.classList.remove('is-loading'));
  const showPhoto = (key, name) => {
    el.empty.hidden = true; el.photo.hidden = false;
    el.caption.textContent = name;
    if (photoImg.getAttribute('src') === MEDIA[key]) return;
    el.photo.classList.add('is-loading');
    photoImg.src = MEDIA[key]; photoImg.alt = name;
  };
  // a room without a photograph: draw it on its own, with its measured size
  const showEmpty = (r) => {
    el.photo.hidden = true; el.empty.hidden = false;
    const s = Math.min(240 / r.w, 140 / r.h); const w = r.w * s; const h = r.h * s; const x = (300 - w) / 2; const y = (200 - h) / 2 + 6;
    const wM = (r.w / UNITS_PER_M).toFixed(1); const hM = (r.h / UNITS_PER_M).toFixed(1);
    emptySvg.innerHTML = `<rect x="${x}" y="${y}" width="${w}" height="${h}" class="e-room"/>`
      + `<path class="e-dim" d="M${x},${y - 14} L${x + w},${y - 14} M${x},${y - 19} L${x},${y - 9} M${x + w},${y - 19} L${x + w},${y - 9}"/>`
      + `<text x="${x + w / 2}" y="${y - 20}" text-anchor="middle">${wM} m</text>`
      + `<path class="e-dim" d="M${x + w + 14},${y} L${x + w + 14},${y + h} M${x + w + 9},${y} L${x + w + 19},${y} M${x + w + 9},${y + h} L${x + w + 19},${y + h}"/>`
      + `<text x="${x + w + 24}" y="${y + h / 2 + 4}">${hM} m</text>`;
  };
  // every photograph on the current level, for the gallery
  const levelPhotos = () => [{ src: MEDIA.reveal, name: 'Serra from the air', text: 'Both levels, set into the slope above the bay.' }]
    .concat(PLAN[level].rooms.filter((r) => ROOM_PHOTOS[r.id]).map((r) => ({ src: MEDIA[ROOM_PHOTOS[r.id].key], name: ROOM_PHOTOS[r.id].detail ? `${r.name}: ${ROOM_PHOTOS[r.id].detail}` : r.name, text: r.text, id: r.id })));
  const scaleBar = section.querySelector('.plans__scale i');

  const levels = { terrace: drawLevel('terrace'), pool: drawLevel('pool') };
  Object.values(levels).forEach((g) => svg.appendChild(g));
  svg.querySelectorAll('.draw').forEach((p) => p.style.setProperty('--len', Math.ceil(p.getTotalLength ? p.getTotalLength() : 1200)));

  let level = 'terrace';
  let selected = null;

  // ---------- view box: zoom and pan ----------
  const view = { s: 1, cx: W / 2, cy: H / 2 };
  let anim = null;
  const apply = () => {
    const w = W / view.s; const h = H / view.s;
    view.cx = clamp(view.cx, w / 2, W - w / 2); view.cy = clamp(view.cy, h / 2, H - h / 2);
    svg.setAttribute('viewBox', `${(view.cx - w / 2).toFixed(2)} ${(view.cy - h / 2).toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)}`);
    canvas.classList.toggle('is-zoomed', view.s > 1.01);
    const px = svg.getBoundingClientRect().width / W;
    scaleBar.style.width = `${(5 * UNITS_PER_M * view.s * px).toFixed(1)}px`;
  };
  const animateTo = (s, cx, cy) => {
    cancelAnimationFrame(anim);
    const from = { ...view }; const to = { s: clamp(s, 1, 3), cx, cy };
    if (reducedMotion()) { Object.assign(view, to); apply(); return; }
    const t0 = performance.now();
    const step = (now) => {
      const k = Math.min(1, (now - t0) / 520); const e = 1 - Math.pow(1 - k, 3);
      view.s = from.s + (to.s - from.s) * e; view.cx = from.cx + (to.cx - from.cx) * e; view.cy = from.cy + (to.cy - from.cy) * e;
      apply();
      if (k < 1) anim = requestAnimationFrame(step);
    };
    anim = requestAnimationFrame(step);
  };
  section.querySelectorAll('[data-zoom]').forEach((b) => b.addEventListener('click', () => {
    animateTo(view.s * (b.dataset.zoom === 'in' ? 1.5 : 1 / 1.5), view.cx, view.cy);
  }));

  // drag to pan when zoomed (mouse, pen and touch)
  let drag = null;
  svg.addEventListener('pointerdown', (e) => {
    if (view.s <= 1.01) return;
    drag = { x: e.clientX, y: e.clientY, cx: view.cx, cy: view.cy, moved: false, id: e.pointerId };
  });
  svg.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x; const dy = e.clientY - drag.y;
    if (!drag.moved && Math.hypot(dx, dy) < 5) return;
    if (!drag.moved) { drag.moved = true; svg.setPointerCapture(e.pointerId); canvas.classList.add('is-dragging'); }
    const k = W / view.s / svg.getBoundingClientRect().width;
    cancelAnimationFrame(anim);
    view.cx = drag.cx - dx * k; view.cy = drag.cy - dy * k; apply();
  });
  const endDrag = () => { if (drag && drag.moved) setTimeout(() => { drag = null; }, 0); else drag = null; canvas.classList.remove('is-dragging'); };
  svg.addEventListener('pointerup', endDrag); svg.addEventListener('pointercancel', endDrag);

  // ---------- information panel ----------
  const showLevelInfo = () => {
    const L = PLAN[level];
    el.level.textContent = level === 'terrace' ? 'Upper level' : 'Lower level';
    el.room.textContent = L.title;
    el.area.textContent = `${L.rooms.length} spaces on this level`;
    el.note.textContent = L.summary; el.back.hidden = true;
    showPhoto('reveal', 'Serra from the air: both levels on the slope');
  };
  const swap = () => { el.detail.classList.remove('is-swap'); void el.detail.offsetWidth; el.detail.classList.add('is-swap'); };
  const select = (id, { focusPlan = false } = {}) => {
    const L = PLAN[level];
    const r = L.rooms.find((x) => x.id === id);
    selected = r ? id : null;
    svg.querySelectorAll('.room, .badge').forEach((n) => { const on = n.dataset.room === selected; n.classList.toggle('is-selected', on); if (n.classList.contains('room')) n.setAttribute('aria-pressed', String(on)); });
    svg.classList.toggle('has-selection', !!selected);
    el.list.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.room === selected)));
    swap();
    if (!r) { showLevelInfo(); if (focusPlan) animateTo(1, W / 2, H / 2); return; }
    const i = L.rooms.indexOf(r);
    el.level.textContent = `${String(i + 1).padStart(2, '0')}  ${L.title}`;
    el.room.textContent = r.name;
    el.area.textContent = `${area(r)} m²${r.outdoor ? ', outdoors' : ''}`;
    el.note.textContent = r.text;
    const ph = ROOM_PHOTOS[r.id];
    if (ph) showPhoto(ph.key, ph.name); else showEmpty(r);
    el.back.hidden = false;
    if (focusPlan) animateTo(Math.max(view.s, 1.35), r.x + r.w / 2, r.y + r.h / 2);
  };
  el.photo.querySelector('button').addEventListener('click', () => {
    const list = levelPhotos();
    openLightbox(list, Math.max(0, list.findIndex((x) => x.id === selected)));
  });
  el.back.addEventListener('click', () => { select(null, { focusPlan: true }); });

  svg.addEventListener('click', (e) => {
    if (drag && drag.moved) return;
    const room = e.target.closest('.room');
    if (room) select(room.dataset.room === selected ? null : room.dataset.room);
  });
  svg.addEventListener('keydown', (e) => {
    const room = e.target.closest('.room');
    if (room && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); select(room.dataset.room); }
  });

  const fillList = () => {
    el.list.innerHTML = PLAN[level].rooms.map((r, i) => `<li><button type="button" data-room="${r.id}" aria-pressed="false"><span class="n">${String(i + 1).padStart(2, '0')}</span><span>${r.name}</span><span>${area(r)} m²</span></button></li>`).join('');
    el.list.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => select(b.dataset.room, { focusPlan: true })));
  };

  // ---------- levels ----------
  const setLevel = (key, { focusTab = false } = {}) => {
    level = key;
    tabs.forEach((t) => {
      const on = t.dataset.level === key;
      t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1;
      if (on) { canvas.setAttribute('aria-labelledby', t.id); if (focusTab) t.focus(); }
    });
    Object.entries(levels).forEach(([k, g]) => { g.classList.toggle('is-current', k === key); g.setAttribute('aria-hidden', String(k !== key)); g.querySelectorAll('.room').forEach((r) => { r.tabIndex = k === key ? 0 : -1; }); });
    // redraw the new level's lines
    const g = levels[key];
    g.classList.remove('draw-in');
    requestAnimationFrame(() => requestAnimationFrame(() => g.classList.add('draw-in')));
    selected = null;
    svg.classList.remove('has-selection');
    svg.querySelectorAll('.is-selected').forEach((n) => n.classList.remove('is-selected'));
    el.tbLevel.textContent = PLAN[key].title;
    el.tbSheet.textContent = `Drawing ${key === 'terrace' ? '01' : '02'} of 02`;
    fillList(); swap(); showLevelInfo();
    animateTo(1, W / 2, H / 2);
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => setLevel(t.dataset.level));
    t.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
      setLevel(n.dataset.level, { focusTab: true });
    });
  });

  setLevel('terrace');
  window.addEventListener('resize', apply);
  onceVisible(svg, () => svg.classList.add('is-drawn'), '0px 0px -20% 0px');
}
