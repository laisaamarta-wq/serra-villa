// A simple accessible lightbox for any list of { src, name, text } photographs.
let dialog; let img; let title; let text; let items = []; let current = 0; let opener = null;

function show(i, dir = 0) {
  current = (i + items.length) % items.length;
  const it = items[current];
  dialog.dataset.dir = dir > 0 ? 'next' : dir < 0 ? 'prev' : '';
  dialog.classList.remove('is-swap'); void dialog.offsetWidth; dialog.classList.add('is-swap');
  img.src = it.src; img.alt = it.name;
  title.textContent = it.name; text.textContent = it.text || '';
  dialog.classList.toggle('is-single', items.length < 2);
}

export function openLightbox(list, i = 0) {
  items = list; opener = document.activeElement;
  show(i);
  dialog.showModal();
  document.documentElement.classList.add('is-locked');
  requestAnimationFrame(() => dialog.classList.add('is-open'));
}

function close() {
  dialog.classList.remove('is-open');
  setTimeout(() => dialog.close(), 260);
}

export function initLightbox() {
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
    if (items.length < 2) return;
    if (e.key === 'ArrowRight') show(current + 1, 1);
    if (e.key === 'ArrowLeft') show(current - 1, -1);
  });
  let sx = null;
  dialog.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; }, { passive: true });
  dialog.addEventListener('touchend', (e) => {
    if (sx === null || items.length < 2) return; const dx = e.changedTouches[0].clientX - sx; sx = null;
    if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
  });
}
