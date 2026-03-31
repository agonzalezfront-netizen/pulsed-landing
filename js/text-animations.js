/** Animate outgoing section content upward */
export function animateOut(section) {
  const content = section.querySelector('.sec-content');
  if (!content) return Promise.resolve();
  return new Promise(resolve => {
    gsap.to(content, { opacity: 0, y: -16, duration: 0.35, ease: 'power2.in', onComplete: resolve });
  });
}

/** Animate incoming section content up from below */
export function animateIn(section) {
  const content = section.querySelector('.sec-content');
  if (!content) return;
  gsap.set(content, { opacity: 0, y: 28 });
  gsap.to(content, { opacity: 1, y: 0, duration: 0.65, ease: 'power2.out', delay: 0.15 });
}
