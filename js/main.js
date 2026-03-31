import { ParticleField } from '../lib/ParticleField.js';
import { PULSED_SECTIONS } from './particles-config.js';
import { animateIn, animateOut } from './text-animations.js';

const field = new ParticleField({
  canvas: document.getElementById('net-canvas'),
  bgEl:   document.getElementById('bg'),
  count: 650, mouseRadius: 180, impulse: 14,
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
  setTimeout(() => { busy = false; }, 800);
}

// Init — add CSS class for initial visibility (avoids GSAP inline style conflicts on load)
field.morphTo(PULSED_SECTIONS[0]);
const _initContent = sections[0].querySelector('.sec-content');
if (_initContent) _initContent.classList.add('is-visible');

// Wheel
window.addEventListener('wheel', e => {
  e.preventDefault();
  if (busy) return;
  e.deltaY > 0 ? goTo(curIdx + 1) : goTo(curIdx - 1);
}, { passive: false });

// Touch
let tY = 0;
window.addEventListener('touchstart', e => { tY = e.touches[0].clientY; }, { passive: true });
window.addEventListener('touchend', e => {
  if (busy) return;
  const dy = tY - e.changedTouches[0].clientY;
  if (Math.abs(dy) < 40) return;
  dy > 0 ? goTo(curIdx + 1) : goTo(curIdx - 1);
}, { passive: true });
