import { GALLERY, MEDIA } from './content.js';

let dialog; let img; let title; let text; let current = 0; let opener = null;

function show(i, dir = 0) {
  current = (i + GALLERY.length) % GALLERY.length;
  const g = GALLERY[current];
  dialog.dataset.dir = dir > 0 ? 'next' : dir < 0 ? 'prev' : '';
  dialog.classList.remove('is-swap'); void dialog.offsetWidth; dialog.classList.add('is-swap');
  img.src = MEDIA[g.key]; img.alt = g.name;
  title.textContent = g.name; text.textContent = g.text;
}

export function openLightbox(i) {
  opener = document.activeElement;
  show(i);
  dialog.showModal();
  document.documentElement.classList.add('is-locked');
  requestAnimationFrame(() => dialog.classList.add('is-open'));
}

function close() {
  dialog.classList.remove('is-open');
  setTimeout(() => { dialog.close(); }, 260);
}

export function initGallery() {
  dialog = document.querySelector('.lightbox');
  img = dialog.querySelector('img');
  title = dialog.querySelector('figcaption strong');
  text = dialog.querySelector('figcaption span');
  dialog.querySelector('.lightbox__prev').addEventListener('click', () => show(current - 1, -1));
  dialog.querySelector('.lightbox__next').addEventListener('click', () => show(current + 1, 1));
  dialog.querySelector('.lightbox__close').addEventListener('click', close);
  dialog.addEventListener('click', (e) => { if (e.target === dialog) close(); });
  dialog.addEventListener('cancel', (e) => { e.preventDefault(); close(); });
  dialog.addEventListener('close', () => { document.documentElement.classList.remove('is-locked'); if (opener) opener.focus(); });
  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') show(current + 1, 1);
    if (e.key === 'ArrowLeft') show(current - 1, -1);
  });
  // swipe on touch screens
  let sx = null;
  dialog.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; }, { passive: true });
  dialog.addEventListener('touchend', (e) => {
    if (sx === null) return; const dx = e.changedTouches[0].clientX - sx; sx = null;
    if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
  });

  // editorial gallery
  const root = document.querySelector('.gallery');
  root.innerHTML = GALLERY.map((g, i) => `
    <figure class="gallery__item gallery__item--${i + 1}">
      <button type="button" class="gallery__open" data-index="${i}" data-reveal="image">
        <img src="${MEDIA[g.key]}" alt="${g.name}" loading="lazy" decoding="async" data-parallax="0.06" />
        <span class="sr-only">Open photograph: ${g.name}</span>
      </button>
      <figcaption><h3>${g.name}</h3><p>${g.text}</p></figcaption>
    </figure>`).join('');
  root.querySelectorAll('.gallery__open').forEach((b) => b.addEventListener('click', () => openLightbox(+b.dataset.index)));
}
