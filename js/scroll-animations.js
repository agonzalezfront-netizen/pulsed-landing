// scroll-animations.js — Hero pin (3 actos) + secciones 02-07

export function initScrollAnimations({ words, camera }) {
  gsap.registerPlugin(ScrollTrigger);

  // ══════════════════════════════════════════════
  // HERO — Pin ~300vh, timeline con scrub
  // ══════════════════════════════════════════════

  const heroTl = gsap.timeline({
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: '+=300%',
      scrub: 1,
      pin: true,
      anticipatePin: 1,
      onUpdate: (self) => {
        const canvas = document.getElementById('cosmos-canvas');
        if (self.progress < 0.99) {
          canvas.style.position = 'fixed';
        }
      },
      onLeave: () => {
        const canvas = document.getElementById('cosmos-canvas');
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
      },
      onEnterBack: () => {
        const canvas = document.getElementById('cosmos-canvas');
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
      },
    }
  });

  // ── Acto 1 (0–33%): Badge + Headline 3D ──
  heroTl
    .to('#hero-badge', {
      opacity: 1,
      y: 0,
      duration: 0.08,
      ease: 'power2.out',
    }, 0)
    .to(words.length ? words : '#hero-headline', {
      rotateX: 0,
      opacity: 1,
      stagger: 0.06,
      duration: 0.18,
      ease: 'back.out(1.5)',
    }, 0.04);

  // ── Acto 2 (33–66%): iframe director + subtítulo + CTAs ──
  heroTl
    .to('#hero-iframe-wrapper', {
      y: 0,
      opacity: 1,
      duration: 0.25,
      ease: 'power3.out',
    }, 0.33)
    .to('#hero-subtitle', {
      opacity: 1,
      y: 0,
      duration: 0.15,
      ease: 'power2.out',
    }, 0.42)
    .to('#hero-ctas', {
      opacity: 1,
      y: 0,
      duration: 0.15,
      ease: 'power2.out',
    }, 0.48);

  // ── Acto 3 (66–100%): Geometría + camera zoom-out ──
  heroTl
    .to('#hero-geo', {
      opacity: 1,
      scale: 1,
      x: 0,
      duration: 0.2,
      ease: 'back.out(1.2)',
    }, 0.66)
    .to(camera.position, {
      z: camera.position.z + 1.2,
      duration: 0.34,
      ease: 'power1.inOut',
    }, 0.66);

  // ══════════════════════════════════════════════
  // SECCIÓN 02 — Pain Points
  // ══════════════════════════════════════════════

  gsap.to('.pain-card', {
    opacity: 1,
    y: 0,
    stagger: 0.12,
    duration: 0.6,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '.pain-grid',
      start: 'top 80%',
    }
  });

  const counterEl = document.getElementById('pain-counter');
  const painStat  = document.querySelector('.pain-stat');

  gsap.to(painStat, {
    opacity: 1,
    y: 0,
    duration: 0.6,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '.pain-stat',
      start: 'top 80%',
      onEnter: () => {
        gsap.to({ val: 0 }, {
          val: 70,
          duration: 1.8,
          ease: 'power2.out',
          onUpdate: function() {
            counterEl.textContent = Math.floor(this.targets()[0].val);
          }
        });
      },
      once: true,
    }
  });

  // ══════════════════════════════════════════════
  // SECCIÓN 03 — Features
  // ══════════════════════════════════════════════

  document.querySelectorAll('.feature-row').forEach((row, i) => {
    const isOdd = i % 2 === 0;
    const textEl   = row.querySelector('.feature-text');
    const iframeEl = row.querySelector('.feature-iframe-wrap');

    gsap.fromTo(textEl,
      { opacity: 0, x: isOdd ? -50 : 50 },
      {
        opacity: 1, x: 0,
        duration: 0.7,
        ease: 'power2.out',
        scrollTrigger: { trigger: row, start: 'top 80%' }
      }
    );

    gsap.fromTo(iframeEl,
      { opacity: 0, x: isOdd ? 60 : -60 },
      {
        opacity: 1, x: 0,
        duration: 0.7,
        ease: 'power2.out',
        delay: 0.1,
        scrollTrigger: { trigger: row, start: 'top 80%' }
      }
    );
  });

  // ══════════════════════════════════════════════
  // SECCIÓN 04 — Steps
  // ══════════════════════════════════════════════

  gsap.to('.step-col', {
    opacity: 1,
    y: 0,
    stagger: 0.18,
    duration: 0.65,
    ease: 'back.out(1.3)',
    scrollTrigger: {
      trigger: '.steps-grid',
      start: 'top 80%',
    }
  });

  // ══════════════════════════════════════════════
  // SECCIÓN 05 — Stats + Testimonio
  // ══════════════════════════════════════════════

  gsap.to('.stat-card', {
    opacity: 1,
    scale: 1,
    stagger: 0.12,
    duration: 0.6,
    ease: 'back.out(1.2)',
    scrollTrigger: {
      trigger: '.stats-grid',
      start: 'top 80%',
    }
  });

  gsap.to('.testimonial', {
    opacity: 1,
    y: 0,
    duration: 0.7,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '.testimonial',
      start: 'top 85%',
    }
  });

  // ══════════════════════════════════════════════
  // SECCIÓN 06 — Pricing
  // ══════════════════════════════════════════════

  gsap.to('.pricing-card', {
    opacity: 1,
    scale: 1,
    stagger: 0.1,
    duration: 0.55,
    ease: 'back.out(1.2)',
    scrollTrigger: {
      trigger: '.pricing-grid',
      start: 'top 80%',
    }
  });

  // ══════════════════════════════════════════════
  // TÍTULOS DE SECCIÓN con SplitText (data-split)
  // ══════════════════════════════════════════════

  document.querySelectorAll('.section-title[data-split]').forEach(title => {
    const split = (typeof SplitText !== 'undefined')
      ? new SplitText(title, { type: 'words' }).words
      : (() => {
          const words = title.innerText.split(/\s+/).filter(Boolean);
          title.innerHTML = words.map(w => `<span class="word" style="display:inline-block">${w}</span>`).join(' ');
          return Array.from(title.querySelectorAll('.word'));
        })();

    gsap.fromTo(split,
      { opacity: 0, y: 20, rotateX: 15 },
      {
        opacity: 1, y: 0, rotateX: 0,
        stagger: 0.06,
        duration: 0.55,
        ease: 'power2.out',
        scrollTrigger: { trigger: title, start: 'top 85%' }
      }
    );
  });
}
