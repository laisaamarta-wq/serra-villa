import '@fontsource/bodoni-moda/latin-400.css';
import '@fontsource/bodoni-moda/latin-400-italic.css';
import '@fontsource/manrope/latin-400.css';
import '@fontsource/manrope/latin-500.css';
import './styles.css';
import Lenis from 'lenis';
import { MEDIA } from './content.js';
import { initJourney } from './journey.js';
import { initPlan, initSpaces, initLight, initMaterials, initLocation, initForm } from './sections.js';

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isPhone = window.matchMedia('(max-width: 640px)').matches;
const root = document.documentElement;
if (reduced) root.classList.add('is-static');

/* ---------- loader: waits for the first frames the visitor will see ---------- */
const loader = document.querySelector('.loader');
const count = loader.querySelector('.loader__count');
const ridge = loader.querySelector('.loader__ridge');
const essentials = [MEDIA.studio, MEDIA.s0, MEDIA.master];
let done = 0;
const setLoad = (f) => { ridge.style.setProperty('--draw', String(1 - f)); count.textContent = String(Math.round(f * 100)); };
const finish = () => { setLoad(1); setTimeout(() => root.classList.add('is-loaded'), 350); };
setLoad(0);
Promise.all(essentials.map((src) => new Promise((res) => {
  const im = new Image(); im.onload = im.onerror = () => { done++; setLoad(done / essentials.length * 0.95); res(); }; im.src = src;
}))).then(finish);
setTimeout(finish, 7000); // never hold the page hostage

/* ---------- journey + sections ---------- */
const journey = initJourney({ isStatic: reduced, isPhone });
initPlan();
const updateSpaces = initSpaces();
initLight({ reduced });
initMaterials();
initLocation();
initForm();

/* ---------- header: glass over the journey, solid afterwards ---------- */
const header = document.querySelector('.header');
const headerState = () => {
  const end = journey.section ? journey.section.getBoundingClientRect().bottom : 0;
  const solid = reduced || document.body.classList.contains('menu-open') || end <= header.offsetHeight;
  header.dataset.state = solid ? 'solid' : 'glass';
};

/* ---------- smooth scroll ---------- */
let lenis = null;
if (!reduced) {
  lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.9, touchMultiplier: 1.4 });
}
const frame = (time) => {
  if (lenis) lenis.raf(time);
  journey.update();
  updateSpaces();
  headerState();
  requestAnimationFrame(frame);
};
requestAnimationFrame(frame);

/* in-page links go through Lenis so the journey stays in sync */
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute('href');
  const target = id === '#top' ? 0 : document.querySelector(id);
  if (target === null) return;
  e.preventDefault();
  closeMenu();
  if (lenis) lenis.scrollTo(target, { offset: id === '#top' ? 0 : -header.offsetHeight - 8, duration: 1.4 });
  else window.scrollTo({ top: target === 0 ? 0 : target.getBoundingClientRect().top + scrollY - header.offsetHeight - 8 });
  if (target && target.focus) { target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: true }); }
});

/* ---------- mobile menu ---------- */
const menu = document.getElementById('menu');
const burger = document.querySelector('.header__menu');
function openMenu() {
  menu.hidden = false; burger.setAttribute('aria-expanded', 'true');
  burger.querySelector('.sr-only').textContent = 'Close menu';
  document.body.classList.add('menu-open'); document.body.style.overflow = 'hidden';
  if (lenis) lenis.stop();
  menu.querySelector('a').focus();
}
function closeMenu() {
  if (menu.hidden) return;
  menu.hidden = true; burger.setAttribute('aria-expanded', 'false');
  burger.querySelector('.sr-only').textContent = 'Open menu';
  document.body.classList.remove('menu-open'); document.body.style.overflow = '';
  if (lenis) lenis.start();
  burger.focus();
}
burger.addEventListener('click', () => (menu.hidden ? openMenu() : closeMenu()));
menu.querySelector('.menu__close').addEventListener('click', closeMenu);
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
window.matchMedia('(max-width: 960px)').addEventListener('change', (m) => { if (!m.matches) closeMenu(); });
