import { PLAN } from './content.js';
import { reducedMotion } from './motion.js';

/* ---------------- Architecture: an axonometric of the two levels ----------------
   Drawn from the floor-plan geometry, so every room is its real size and carries its
   measured area. The drawing assembles as the three principles scroll past:
   0 the pool level · 1 the terrace level steps back into the slope · 2 the glass and
   the pool face the bay · 3 one roof slab with the pergola. Heights are schematic. */

const UNITS_PER_M = 28;
const SK = -0.45; // depth skews to the left
const DP = 0.62;  // depth is drawn shortened
const LEVELS = {
  pool: { dy: 0, z: 0, wall: 118, name: 'Pool level' },
  terrace: { dy: -200, z: 118, wall: 104, name: 'Terrace level' },
};
const ROOF_Z = 118 + 104 + 70; // the roof is lifted a little above the walls, as in an exploded drawing
const P = (x, y, z) => [x + y * SK, y * DP - z];
const pts = (list) => list.map(([x, y, z]) => P(x, y, z).map((v) => v.toFixed(1)).join(',')).join(' ');
const area = (r) => Math.round((r.w * r.h) / (UNITS_PER_M * UNITS_PER_M));
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

function quad(x, y, w, h, z) { return [[x, y, z], [x + w, y, z], [x + w, y + h, z], [x, y + h, z]]; }

function buildLevel(key, all) {
  const L = PLAN[key]; const S = LEVELS[key];
  const rooms = L.rooms.map((r) => ({ ...r, y: r.y + S.dy }));
  const indoor = rooms.filter((r) => !r.outdoor);
  const x0 = Math.min(...indoor.map((r) => r.x)); const x1 = Math.max(...indoor.map((r) => r.x + r.w));
  const y0 = Math.min(...indoor.map((r) => r.y)); const y1 = Math.max(...indoor.map((r) => r.y + r.h));
  const z = S.z; const zt = z + S.wall;
  const push = (...p) => all.push(...p);
  let out = '';
  // floor slab: its front edge has a little thickness
  const slab = [[x0, y1, z], [x1, y1, z], [x1, y1, z - 10], [x0, y1, z - 10]];
  push(...slab, ...quad(x0, y0, x1 - x0, y1 - y0, zt));
  out += `<polygon class="ax-slab" points="${pts(slab)}"/>`;
  // rooms, back to front so nearer rooms sit on top
  [...rooms].sort((a, b) => a.y - b.y).forEach((r) => {
    const q = quad(r.x, r.y, r.w, r.h, z); push(...q);
    const n = L.rooms.findIndex((x) => x.id === r.id) + 1;
    out += `<polygon class="ax-room draw${r.outdoor ? ' is-outdoor' : ''}" points="${pts(q)}" data-level="${key}" data-id="${r.id}" data-n="${n}" data-name="${r.name}" data-area="${area(r)}" tabindex="0" role="button" aria-label="${r.name}, ${area(r)} square metres, ${S.name}"/>`;
  });
  // envelope: four corner posts and the top outline (the walls are left open so the rooms stay visible)
  const corners = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  out += `<path class="ax-wall draw" d="${corners.map(([x, y]) => `M${P(x, y, z).join(',')} L${P(x, y, zt).join(',')}`).join(' ')}"/>`;
  out += `<polygon class="ax-top draw" points="${pts(quad(x0, y0, x1 - x0, y1 - y0, zt))}"/>`;
  // labels: name and measured area in every room
  [...rooms].sort((a, b) => a.y - b.y).forEach((r) => {
    const [cx, cy] = P(r.x + r.w / 2, r.y + r.h / 2, z);
    const big = r.w * r.h > 30000;
    out += `<text class="ax-label${big ? '' : ' is-small'}" x="${cx.toFixed(1)}" y="${(cy - 8).toFixed(1)}" text-anchor="middle"><tspan class="ax-name">${r.name}</tspan><tspan class="ax-area" x="${cx.toFixed(1)}" dy="1.25em">${area(r)} m²</tspan></text>`;
  });
  // level name at its left end
  const [lx, ly] = P(x0, y1, z);
  out += `<text class="ax-level" x="${(lx - 18).toFixed(1)}" y="${(ly + 4).toFixed(1)}" text-anchor="end">${S.name}</text>`;
  // glass facade toward the bay (step 2)
  const glass = [[x0, y1, z], [x1, y1, z], [x1, y1, zt], [x0, y1, zt]];
  let mullions = '';
  for (let x = x0 + 64; x < x1 - 20; x += 64) mullions += `M${P(x, y1, z).join(',')} L${P(x, y1, zt).join(',')} `;
  // pool water on the pool terrace appears with the glass (step 2)
  const water = L.pool ? `<polygon class="ax-water" points="${pts(quad(L.pool.x, L.pool.y + S.dy, L.pool.w, L.pool.h, z))}"/>` : '';
  const glassSvg = `${water}<polygon class="ax-glass" points="${pts(glass)}"/><path class="ax-mullion draw" d="${mullions}"/>`;
  return { out, glassSvg, box: { x0, x1, y0, y1, z, zt } };
}

function buildSvg() {
  const all = [];
  const pool = buildLevel('pool', all);
  const terrace = buildLevel('terrace', all);
  // the slope, cut at the east end of the house: the hill behind the terrace level, the roof
  // of the pool level as the upper terrace, the pool terrace, then the drop to the water
  const X = 930;
  const prof = [[-230, 300], [-60, 228], [160, 118], [330, 118], [330, 0], [570, 0], [610, -30], [650, -96]];
  const profPts = prof.map(([y, z]) => [X, y, z]);
  all.push(...profPts);
  const ground = `M${profPts.map((p) => P(...p).map((v) => v.toFixed(1)).join(',')).join(' L')}`;
  const earth = `${ground} L${P(X, 650, -140).join(',')} L${P(X, -230, -140).join(',')} Z`;
  all.push([X, 650, -140]);
  // the bay in front
  const seaY = 660; const seaZ = -96;
  const sea = [[60, seaY, seaZ], [930, seaY, seaZ]]; all.push(...sea);
  let waves = '';
  [[120, 700], [460, 716], [780, 694]].forEach(([x, y]) => { const [a, b] = P(x, y, seaZ); waves += `M${a.toFixed(1)},${b.toFixed(1)} q16,-8 32,0 t32,0 `; });
  all.push([460, 740, seaZ]);
  const [bx, by] = P(470, seaY + 60, seaZ); const byText = by + 34;
  // the roof slab and the pergola over the terrace level
  const tb = terrace.box;
  const roof = quad(tb.x0 - 20, tb.y0 - 24, tb.x1 - tb.x0 + 40, tb.y1 - tb.y0 + 34, ROOF_Z);
  const roofEdge = [[tb.x0 - 20, tb.y1 + 10, ROOF_Z], [tb.x1 + 20, tb.y1 + 10, ROOF_Z], [tb.x1 + 20, tb.y1 + 10, ROOF_Z - 9], [tb.x0 - 20, tb.y1 + 10, ROOF_Z - 9]];
  const per = PLAN.terrace.rooms.find((r) => r.id === 'pergola');
  const py0 = per.y + LEVELS.terrace.dy; const py1 = py0 + per.h; const pz = ROOF_Z - 6;
  let slats = `M${P(per.x, py0, pz).join(',')} L${P(per.x + per.w, py0, pz).join(',')} `;
  for (let x = per.x; x <= per.x + per.w; x += 32) slats += `M${P(x, py0, pz).join(',')} L${P(x, py1, pz).join(',')} `;
  all.push(...roof, ...quad(per.x, py0, per.w, per.h, pz));
  const [rx, ry] = P(tb.x0 + 150, tb.y0 - 24, ROOF_Z);
  const [sx, sy] = P(X, -150, 262);
  // bounds
  const pr = all.map((p) => P(...p));
  const minX = Math.min(...pr.map((p) => p[0])) - 40; const maxX = Math.max(...pr.map((p) => p[0])) + 110;
  const minY = Math.min(...pr.map((p) => p[1])) - 40; const maxY = Math.max(...pr.map((p) => p[1])) + 30;
  const svg = `
    <defs><pattern id="ax-earth" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="12" class="ax-hatch"/></pattern></defs>
    <g class="step" data-step="0">${pool.out}</g>
    <g class="step" data-step="1">
      <path class="ax-earth" d="${earth}"/><path class="ax-ground draw" d="${ground}"/>
      <text class="ax-note" x="${(sx + 14).toFixed(1)}" y="${(sy - 10).toFixed(1)}">The slope</text>
      <g class="ax-rise">${terrace.out}</g>
    </g>
    <g class="step" data-step="2">${pool.glassSvg}<g class="ax-rise-2">${terrace.glassSvg}</g>
      <path class="ax-sea draw" d="M${P(...sea[0]).join(',')} L${P(...sea[1]).join(',')}"/><path class="ax-wave draw" d="${waves}"/>
      <text class="ax-note" x="${bx.toFixed(1)}" y="${byText.toFixed(1)}" text-anchor="middle">The bay</text>
    </g>
    <g class="step" data-step="3"><g class="ax-roof">
      <polygon class="ax-roofplane" data-step-fill="3" points="${pts(roof)}"/>
      <polygon class="ax-roofedge draw" points="${pts(roofEdge)}"/>
      <polygon class="ax-rooftop draw" points="${pts(roof)}"/>
      <path class="ax-pergola draw" d="${slats}"/>
      <text class="ax-note" x="${rx.toFixed(1)}" y="${(ry - 14).toFixed(1)}">One roof slab</text>
    </g></g>`;
  return { svg, viewBox: `${minX.toFixed(0)} ${minY.toFixed(0)} ${(maxX - minX).toFixed(0)} ${(maxY - minY).toFixed(0)}` };
}

export function initConcept() {
  const root = document.querySelector('.concept');
  const svg = root.querySelector('.axon__svg');
  const card = root.querySelector('.axon__card');
  const { svg: inner, viewBox } = buildSvg();
  svg.setAttribute('viewBox', viewBox);
  svg.insertAdjacentHTML('beforeend', inner);
  svg.querySelectorAll('.draw').forEach((el) => {
    const len = Math.ceil(el.getTotalLength ? el.getTotalLength() : 1000);
    el.dataset.len = len; el.style.setProperty('--len', len);
  });
  // on a phone the drawing is wider than the screen: start with the house centred
  const scroller = root.querySelector('.concept__sticky');
  const centre = () => { if (scroller.scrollWidth > scroller.clientWidth + 4) scroller.scrollLeft = (scroller.scrollWidth - scroller.clientWidth) * 0.42; };
  centre(); window.addEventListener('resize', centre);

  // room card: hover, focus or tap a room
  const k = card.querySelector('.axon__k'); const nm = card.querySelector('.axon__name'); const m = card.querySelector('.axon__m');
  let picked = null;
  const pick = (room) => {
    if (room === picked) return;
    if (picked) picked.classList.remove('is-picked');
    picked = room;
    if (!room) return;
    room.classList.add('is-picked');
    k.textContent = `${String(room.dataset.n).padStart(2, '0')}  ${LEVELS[room.dataset.level].name}`;
    nm.textContent = room.dataset.name;
    m.textContent = `${room.dataset.area} m²${room.classList.contains('is-outdoor') ? ', outdoors' : ''}`;
    card.classList.remove('is-swap'); void card.offsetWidth; card.classList.add('is-swap');
  };
  svg.addEventListener('pointerover', (e) => { const r = e.target.closest('.ax-room'); if (r) pick(r); });
  svg.addEventListener('click', (e) => { const r = e.target.closest('.ax-room'); if (r) pick(r); });
  svg.addEventListener('focusin', (e) => { const r = e.target.closest('.ax-room'); if (r) pick(r); });
  svg.addEventListener('keydown', (e) => { const r = e.target.closest('.ax-room'); if (r && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); pick(r); } });

  // scroll assembly, one principle at a time
  const study = root.querySelector('.concept__study');
  const steps = [...svg.querySelectorAll('.step')];
  const draws = steps.map((g) => [...g.querySelectorAll('.draw')]);
  const items = [...root.querySelectorAll('.principles li')];
  const rise = svg.querySelector('.ax-rise'); const rise2 = svg.querySelector('.ax-rise-2'); const roofG = svg.querySelector('.ax-roof');
  const narrow = window.matchMedia('(max-width: 960px)');
  const isStatic = () => reducedMotion() || narrow.matches;
  const shown = steps.map(() => -1);
  const setStep = (i, p) => {
    if (Math.abs(shown[i] - p) < 0.002) return;
    shown[i] = p;
    draws[i].forEach((el) => { el.style.strokeDashoffset = (el.dataset.len * (1 - p)).toFixed(1); });
    steps[i].style.setProperty('--p', p.toFixed(3));
    const e = 1 - Math.pow(1 - p, 3);
    if (i === 1) { const t = `translate(0 ${(-(1 - e) * 90).toFixed(1)})`; rise.setAttribute('transform', t); rise2.setAttribute('transform', t); }
    if (i === 3) roofG.setAttribute('transform', `translate(0 ${(-(1 - e) * 70).toFixed(1)})`);
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
    steps.forEach((g, i) => g.classList.toggle('is-lit', typeof next === 'number' && i === next + 1));
  };
  const update = () => {
    if (isStatic()) { steps.forEach((g, i) => setStep(i, 1)); setActive('static'); return; }
    if (state === 'static') state = null;
    const vh = window.innerHeight; const r = study.getBoundingClientRect();
    if (r.top > vh * 1.5 || r.bottom < -vh * 0.5) return;
    setStep(0, clamp((vh * 0.95 - r.top) / (vh * 0.5)));
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
