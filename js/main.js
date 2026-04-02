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

// ── Desktop: wheel navigation ─────────────────────────────────────────────
const isMobile = window.innerWidth < 768;

if (!isMobile) {
  window.addEventListener('wheel', e => {
    e.preventDefault();
    if (busy) return;
    e.deltaY > 0 ? goTo(curIdx + 1) : goTo(curIdx - 1);
  }, { passive: false });
}

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

if (isMobile) {
  // ── Mobile: Custom drag system ────────────────────────────────────────
  // State 1: Section fits → drag moves section, rubber band / transition
  // State 2: Section overflows → free scroll, rubber band at edges
  // State 3: Threshold → <90px bounces back, >90px transitions

  const THRESHOLD = 90;
  const RESIST = 0.4;        // how much the section follows your finger (0-1)
  const SLIDE_DUR = 400;     // ms for section slide in/out

  let tStartY = 0, engaged = false, dragPx = 0;

  // Make body minimally scrollable for chrome hide trick
  document.body.style.minHeight = 'calc(100vh + 2px)';
  document.body.style.overflow = 'auto';

  window.addEventListener('touchstart', e => {
    tStartY = e.touches[0].clientY;
    engaged = false;
    dragPx = 0;
    sections[curIdx].style.transition = 'none';

    // Micro-scroll to trigger browser chrome hide/show
    if (window.scrollY < 1) {
      window.scrollTo({ top: 1, behavior: 'instant' });
    }
  }, { passive: true });

  window.addEventListener('touchmove', e => {
    const y = e.touches[0].clientY;
    const rawDy = y - tStartY;
    const sec = sections[curIdx];
    const hasOverflow = sec.scrollHeight > sec.clientHeight + 5;

    // ── State 2: section has overflow — free scroll, engage at edges ──
    if (hasOverflow && !engaged) {
      const atTop = sec.scrollTop <= 2;
      const atBottom = sec.scrollTop + sec.clientHeight >= sec.scrollHeight - 2;

      if (rawDy > 0 && atTop) { engaged = true; tStartY = y; }
      else if (rawDy < 0 && atBottom) { engaged = true; tStartY = y; }
      else return; // native scroll → chrome hides naturally
    }

    // ── State 1: no overflow — let first 6px be native scroll (hides chrome) ──
    if (!hasOverflow && !engaged) {
      if (Math.abs(rawDy) < 6) return; // let browser handle → scrolls body → chrome hides
      engaged = true;
      tStartY = y; // reset origin after the native scroll pixels
    }

    // ── Engaged: custom drag with resistance ──
    if (engaged) {
      e.preventDefault();
      dragPx = (y - tStartY) * RESIST;
      sec.style.transform = `translateY(${dragPx}px)`;
    }
  }, { passive: false });

  window.addEventListener('touchend', () => {
    if (!engaged) return;
    const sec = sections[curIdx];
    const absDrag = Math.abs(dragPx);

    if (absDrag > THRESHOLD * RESIST) {
      // ── State 3: exceeded threshold → slide out + transition ──
      const direction = dragPx < 0 ? -1 : 1;  // -1 = going to next, 1 = going to prev
      const targetIdx = curIdx + (direction < 0 ? 1 : -1);

      if (targetIdx >= 0 && targetIdx < sections.length) {
        // Slide current section OUT
        sec.style.transition = `transform ${SLIDE_DUR}ms cubic-bezier(0.4, 0, 0.2, 1)`;
        sec.style.transform = `translateY(${direction * window.innerHeight}px)`;

        setTimeout(() => {
          sec.style.transition = 'none';
          sec.style.transform = '';
          sec.classList.remove('active');

          // Slide new section IN from opposite side
          const next = sections[targetIdx];
          next.style.transition = 'none';
          next.style.transform = `translateY(${-direction * window.innerHeight}px)`;
          next.classList.add('active');

          // Animate content in
          const sc = next.querySelector('.sec-content');
          if (sc) sc.classList.add('is-visible');

          // Force reflow then animate
          next.offsetHeight;
          next.style.transition = `transform ${SLIDE_DUR}ms cubic-bezier(0.4, 0, 0.2, 1)`;
          next.style.transform = '';

          // Update state
          field.morphTo(PULSED_SECTIONS[targetIdx]);
          curIdx = targetIdx;
          updateDots(targetIdx);
          hideScrollHint();

          if (targetIdx === 4) {
            setTimeout(() => sections[4].querySelectorAll('.stat-n[data-target]').forEach(countUp), 200);
          }

          // Reset scroll position for new section
          next.scrollTop = direction < 0 ? 0 : next.scrollHeight;

          setTimeout(() => {
            next.style.transition = '';
            busy = false;
          }, SLIDE_DUR);
        }, SLIDE_DUR);

        busy = true;
      } else {
        // Edge of sections (first/last) — just bounce back
        sec.style.transition = 'transform 0.35s cubic-bezier(0.25, 1, 0.5, 1)';
        sec.style.transform = '';
        setTimeout(() => { sec.style.transition = ''; }, 400);
      }
    } else {
      // ── Below threshold → rubber band back ──
      sec.style.transition = 'transform 0.35s cubic-bezier(0.25, 1, 0.5, 1)';
      sec.style.transform = '';
      setTimeout(() => { sec.style.transition = ''; }, 400);
    }

    engaged = false;
    dragPx = 0;
  }, { passive: true });

} else {
  // ── Desktop: touch swipe ──────────────────────────────────────────────
  let tY = 0;
  window.addEventListener('touchstart', e => { tY = e.touches[0].clientY; }, { passive: true });
  window.addEventListener('touchend', e => {
    if (busy) return;
    const dy = tY - e.changedTouches[0].clientY;
    if (Math.abs(dy) < 40) return;
    dy > 0 ? goTo(curIdx + 1) : goTo(curIdx - 1);
  }, { passive: true });
}
