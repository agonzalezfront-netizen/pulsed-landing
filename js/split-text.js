// split-text.js — Preparar headline para animación GSAP 3D

let splitInstance = null;

export function initSplitText() {
  const headline = document.getElementById('hero-headline');
  if (!headline) return { words: [] };

  // Verificar si SplitText de GSAP está disponible
  if (typeof SplitText !== 'undefined') {
    splitInstance = new SplitText(headline, {
      type: 'words',
      wordsClass: 'word',
    });

    // Estado inicial: rotados en X, invisibles
    gsap.set(splitInstance.words, {
      rotateX: 90,
      opacity: 0,
      transformOrigin: '50% 50% -20px',
      transformPerspective: 600,
    });

    return { words: splitInstance.words };
  }

  // Fallback manual si SplitText no está disponible
  const text = headline.innerText;
  const wordArray = text.split(/\s+/).filter(Boolean);
  headline.innerHTML = wordArray
    .map(w => `<span class="word">${w}</span>`)
    .join(' ');

  const words = headline.querySelectorAll('.word');

  gsap.set(words, {
    rotateX: 90,
    opacity: 0,
    transformOrigin: '50% 50% -20px',
    transformPerspective: 600,
    display: 'inline-block',
  });

  return { words: Array.from(words) };
}

export function getSplitInstance() {
  return splitInstance;
}
