import { ParticleField } from '../lib/ParticleField.js';
import { PULSED_SECTIONS } from './particles-config.js';
import { animateIn, animateOut } from './text-animations.js';

const field = new ParticleField({
  canvas: document.getElementById('net-canvas'),
  bgEl:   document.getElementById('bg'),
  count: window.innerWidth < 768 ? 500 : 2400,
  mouseRadius: window.innerWidth < 768 ? 100 : 180,
  impulse: 14,
  spring: 0.7, damping: 0.96, morphDur: 1.5, sparkleRatio: 0.08,
});

const sections = Array.from(document.querySelectorAll('.section'));
let curIdx = 0, busy = false;

// Dots
const dotsEl = document.getElementById('nav-dots');
sections.forEach((_, i) => {
  const dot = document.createElement('span');
  if (i === 0) dot.classList.add('active');
  dot.addEventListener('click', () => goTo(i));
  dotsEl.appendChild(dot);
});

function updateDots(idx) {
  dotsEl.querySelectorAll('span').forEach((d, i) => d.classList.toggle('active', i === idx));
}

async function goTo(idx) {
  if (idx < 0 || idx >= sections.length || idx === curIdx || busy) return;
  busy = true;
  await animateOut(sections[curIdx]);
  sections[curIdx].classList.remove('active');
  sections[idx].classList.add('active');
  animateIn(sections[idx]);
  field.morphTo(PULSED_SECTIONS[idx]);
  curIdx = idx;
  updateDots(idx);
  hideScrollHint();
  // Trigger counter animation when landing on section 05
  if (idx === 4) {
    setTimeout(() => {
      sections[4].querySelectorAll('.stat-n[data-target]').forEach(countUp);
    }, 200);
  }
  setTimeout(() => { busy = false; }, 800);
}

// Init — hero entrance animation
field.morphTo(PULSED_SECTIONS[0]);
(() => {
  const hero = sections[0].querySelector('.sec-content');
  if (!hero) return;

  const left  = hero.querySelector('.split-left');
  const panel = hero.querySelector('.hero-panel');
  if (!left) return;

  const leftEls = [
    left.querySelector('.hero-badge'),
    left.querySelector('.sec-tag'),
    left.querySelector('h1'),
    left.querySelector('.sec-body'),
    left.querySelector('.hero-ctas'),
    left.querySelector('.hero-trust'),
  ].filter(Boolean);

  // Show container, then animate children FROM hidden states
  hero.classList.add('is-visible');

  const tl = gsap.timeline({ delay: 0.35 });

  // Left elements stagger up
  tl.from(leftEls, {
    opacity: 0, y: 28, duration: 0.55,
    ease: 'power2.out', stagger: 0.1
  });

  // Panel slides in from right
  if (panel) {
    tl.from(panel, {
      opacity: 0, x: 50, scale: 0.97, duration: 0.85,
      ease: 'power2.out'
    }, 0.45);

    // Donut arc fills up
    const arc = panel.querySelector('.hp-donut-arc');
    if (arc) {
      tl.to(arc, {
        attr: { 'stroke-dashoffset': 19.6 },
        duration: 1.3, ease: 'power2.out'
      }, 0.9);
    }

    // Numbers count up after panel appears
    tl.add(() => {
      panel.querySelectorAll('.hp-count').forEach(countUp);
    }, 1.0);
  }
})();

// Wheel
window.addEventListener('wheel', e => {
  e.preventDefault();
  if (busy) return;
  e.deltaY > 0 ? goTo(curIdx + 1) : goTo(curIdx - 1);
}, { passive: false });

// ── Counter animation (section 05, idx 4) ───────────────────────────────────
function countUp(el) {
  const target = parseFloat(el.dataset.target);
  const suffix = el.dataset.suffix || '';
  const duration = 1400;
  const start = Date.now();
  const ease = p => 1 - Math.pow(1 - p, 3);
  const tick = () => {
    const p = Math.min(1, (Date.now() - start) / duration);
    el.textContent = Math.round(ease(p) * target) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  };
  tick();
}

// ── Feat-list hover → mockup highlight (section 03, idx 2) ──────────────────
sections[2].querySelectorAll('.feat-list-item[data-feat]').forEach(item => {
  const feat = item.dataset.feat;
  const target = sections[2].querySelector(`[data-feat-target="${feat}"]`);
  item.addEventListener('mouseenter', () => {
    item.classList.add('feat-active');
    if (target) target.classList.add('feat-highlighted');
  });
  item.addEventListener('mouseleave', () => {
    item.classList.remove('feat-active');
    if (target) target.classList.remove('feat-highlighted');
  });
});

// Logo → home
const navHome = document.getElementById('nav-home');
if (navHome) navHome.addEventListener('click', e => { e.preventDefault(); goTo(0); });

// Scroll hint — hide after first navigation
const scrollHint = document.getElementById('scroll-hint');
function hideScrollHint() { if (scrollHint) scrollHint.style.opacity = '0'; }

// Touch
let tY = 0;
window.addEventListener('touchstart', e => { tY = e.touches[0].clientY; }, { passive: true });
window.addEventListener('touchend', e => {
  if (busy) return;
  const dy = tY - e.changedTouches[0].clientY;
  if (Math.abs(dy) < 40) return;
  dy > 0 ? goTo(curIdx + 1) : goTo(curIdx - 1);
}, { passive: true });
