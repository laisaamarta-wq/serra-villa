import '@fontsource/cormorant-garamond/latin-300.css';
import '@fontsource/cormorant-garamond/latin-400.css';
import '@fontsource/cormorant-garamond/latin-400-italic.css';
import '@fontsource/cormorant-garamond/latin-500.css';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-500.css';
import './styles.css';
import { initReveals, initParallax, reducedMotion } from './motion.js';
import { initFilm, initMaking, initAerial } from './films.js';
import { initLightbox } from './lightbox.js';
import { initPlan } from './plan.js';
import { initImages, initSpecs, initMaterials, initLight, initStay, initSetting, initRhythm } from './sections.js';
import { initConcept } from './axon.js';

document.documentElement.classList.add('js');

// A reload starts the experience again from the opening film, instead of reopening
// part-way down the page at the last #anchor with the film already running.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
const navEntry = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
const isReload = navEntry && navEntry.type === 'reload';
if (isReload) {
  if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  window.scrollTo(0, 0);
  window.addEventListener('load', () => window.scrollTo(0, 0), { once: true });
}

initImages();
initLightbox();
const filmPlayer = initFilm();
initSpecs();
const updateConcept = initConcept();
initPlan();
initMaterials();
initMaking();
initLight();
initRhythm();
initAerial();
initSetting();
initStay();
initReveals();
const updateParallax = initParallax();

/* ---------- header: over the film, then solid ivory ---------- */
const header = document.querySelector('.header');
const film = document.querySelector('.film');
const headerState = () => {
  // the page slides over the pinned film; the header turns solid as it arrives
  const over = window.scrollY < film.offsetHeight - header.offsetHeight;
  const state = document.body.classList.contains('menu-open') ? 'menu' : over ? 'over' : 'solid';
  if (header.dataset.state !== state) header.dataset.state = state;
};

/* ---------- header: the link for the chapter being read is marked ---------- */
// Architecture belongs to "The villa"; Life at Serra to "Setting"; the enquiry has its own button.
const chapters = { villa: 'villa', concept: 'villa', plans: 'plans', materials: 'materials', making: 'making', location: 'location', life: 'location' };
const navLinks = [...document.querySelectorAll('.header__nav a')];
const markCurrent = () => {
  const mid = window.innerHeight * 0.45;
  let id = null;
  for (const key of Object.keys(chapters)) {
    const r = document.getElementById(key).getBoundingClientRect();
    if (r.top <= mid && r.bottom > mid) { id = chapters[key]; break; }
  }
  navLinks.forEach((a) => {
    const on = a.getAttribute('href') === `#${id}`;
    a.classList.toggle('is-current', on);
    if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
  });
};

let ticking = false;
const frame = () => { ticking = false; filmPlayer.update(); updateConcept(); updateParallax(); headerState(); markCurrent(); };
const request = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
window.addEventListener('scroll', request, { passive: true });
window.addEventListener('resize', request);
frame();

/* ---------- the brand in the top corner: back to the start of the film ---------- */
document.querySelector('.header__brand').addEventListener('click', (e) => {
  e.preventDefault();
  closeMenu({ restoreFocus: false });
  if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  window.scrollTo({ top: 0, behavior: reducedMotion() ? 'auto' : 'smooth' });
  filmPlayer.restart();
});

/* ---------- mobile menu ---------- */
const menu = document.getElementById('menu');
const burger = document.querySelector('.header__menu');
function openMenu() {
  menu.hidden = false; burger.setAttribute('aria-expanded', 'true');
  burger.querySelector('.sr-only').textContent = 'Close menu';
  document.body.classList.add('menu-open'); document.documentElement.classList.add('is-locked');
  headerState();
  menu.querySelector('a').focus();
}
function closeMenu({ restoreFocus = true } = {}) {
  if (menu.hidden) return;
  menu.hidden = true; burger.setAttribute('aria-expanded', 'false');
  burger.querySelector('.sr-only').textContent = 'Open menu';
  document.body.classList.remove('menu-open'); document.documentElement.classList.remove('is-locked');
  headerState();
  if (restoreFocus) burger.focus();
}
burger.addEventListener('click', () => (menu.hidden ? openMenu() : closeMenu()));
menu.addEventListener('click', (e) => { if (e.target.closest('a')) closeMenu({ restoreFocus: false }); });
document.addEventListener('keydown', (e) => {
  if (menu.hidden) return;
  if (e.key === 'Escape') closeMenu();
  if (e.key === 'Tab') {
    const f = [...menu.querySelectorAll('a, button'), burger];
    const i = f.indexOf(document.activeElement);
    if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
  }
});
window.matchMedia('(max-width: 960px)').addEventListener('change', (m) => { if (!m.matches) closeMenu({ restoreFocus: false }); });
