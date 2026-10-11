import '@fontsource/cormorant-garamond/latin-300.css';
import '@fontsource/cormorant-garamond/latin-400.css';
import '@fontsource/cormorant-garamond/latin-400-italic.css';
import '@fontsource/cormorant-garamond/latin-500.css';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-500.css';
import './styles.css';
import { initReveals, initParallax } from './motion.js';
import { initFilm, initMaking } from './films.js';
import { initLightbox } from './lightbox.js';
import { initPlan } from './plan.js';
import { initImages, initSpecs, initConcept, initMaterials, initLife, initLocation, initStay } from './sections.js';

document.documentElement.classList.add('js');
initImages();
initLightbox();
const updateFilm = initFilm();
initSpecs();
initConcept();
initPlan();
initMaterials();
initMaking();
initLife();
initLocation();
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

let ticking = false;
const frame = () => { ticking = false; updateFilm(); updateParallax(); headerState(); };
const request = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
window.addEventListener('scroll', request, { passive: true });
window.addEventListener('resize', request);
frame();

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
