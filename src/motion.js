// One-shot reveals, gentle parallax and number counters.
// Everything reveals once and then stays: scrolling back never hides content.

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function onceVisible(el, fn, rootMargin = '0px 0px -12% 0px') {
  if (!('IntersectionObserver' in window)) { fn(); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { io.disconnect(); fn(); } });
  }, { rootMargin });
  io.observe(el);
}

export function initReveals(root = document) {
  const items = root.querySelectorAll('[data-reveal]');
  if (reducedMotion()) { items.forEach((el) => el.classList.add('is-in')); return; }
  items.forEach((el) => {
    if (el.dataset.reveal === 'lines') {
      // wrap each line span in a mask so it can rise into place
      [...el.children].forEach((line, i) => {
        const mask = document.createElement('span');
        mask.className = 'mask';
        line.replaceWith(mask);
        mask.appendChild(line);
        line.style.transitionDelay = `${i * 90}ms`;
      });
    }
    onceVisible(el, () => el.classList.add('is-in'));
  });
}

// Subtle parallax on [data-parallax="0.08"] elements, measured against their own section.
export function initParallax() {
  if (reducedMotion()) return () => {};
  const els = [...document.querySelectorAll('[data-parallax]')];
  return () => {
    const vh = window.innerHeight;
    els.forEach((el) => {
      const r = el.parentElement.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      const k = parseFloat(el.dataset.parallax) || 0.08;
      const p = clamp((vh - r.top) / (vh + r.height)) - 0.5; // -0.5 … 0.5 across the viewport
      el.style.transform = `translate3d(0, ${(-p * k * 100).toFixed(2)}%, 0) scale(${1 + k})`;
    });
  };
}

// Count a number up once, keeping the final value stable afterwards.
export function countUp(el, to, { group = false, duration = 1400 } = {}) {
  const fmt = (n) => (group ? n.toLocaleString('en-GB') : String(n));
  if (reducedMotion()) { el.textContent = fmt(to); return; }
  const t0 = performance.now();
  const step = (now) => {
    const k = clamp((now - t0) / duration);
    const e = 1 - Math.pow(1 - k, 3);
    el.textContent = fmt(Math.round(to * e));
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
