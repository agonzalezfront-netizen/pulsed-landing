// main.js — Init y orquestación de todos los módulos

import { initScene }            from './scene.js';
import { initParticles, onMouseMove, updateParticles } from './particles.js';
import { initGeometry, animateGeometry }               from './geometry.js';
import { initSplitText }        from './split-text.js';
import { initScrollAnimations } from './scroll-animations.js';

const isMobile = window.innerWidth <= 768;

let scene, camera, renderer;
let geoScene, geoCamera, geoRenderer;
let particles, icoMesh, ringMesh;
const clock = { start: Date.now() };

function init() {
  if (isMobile) {
    document.getElementById('cosmos-canvas').style.display = 'none';
    const geoEl = document.getElementById('geo-canvas');
    if (geoEl) geoEl.style.display = 'none';
    const split = initSplitText();
    initScrollAnimationsMobile();
    return;
  }

  // ── Three.js ──
  const sceneData = initScene();
  scene       = sceneData.scene;
  camera      = sceneData.camera;
  renderer    = sceneData.renderer;
  geoScene    = sceneData.geoScene;
  geoCamera   = sceneData.geoCamera;
  geoRenderer = sceneData.geoRenderer;

  // ── Partículas ──
  const particleData = initParticles(scene);
  particles = particleData.points;

  // ── Geometría ──
  const geoData = initGeometry(geoScene);
  icoMesh  = geoData.icoMesh;
  ringMesh = geoData.ringMesh;

  // ── SplitText ──
  const split = initSplitText();
  const words = split.words;

  // ── GSAP Scroll Animations ──
  initScrollAnimations({ words, camera });

  // ── Mouse ──
  window.addEventListener('mousemove', onMouseMove);

  // ── Render loop ──
  requestAnimationFrame(renderLoop);
}

function renderLoop() {
  requestAnimationFrame(renderLoop);
  const elapsed = (Date.now() - clock.start) / 1000;

  if (particles) {
    particles.rotation.y = elapsed * 0.015;
    particles.rotation.x = elapsed * 0.006;
  }

  if (icoMesh) animateGeometry(icoMesh, ringMesh, elapsed);

  updateParticles(camera);

  renderer.render(scene, camera);
  geoRenderer.render(geoScene, geoCamera);
}

function initScrollAnimationsMobile() {
  gsap.registerPlugin(ScrollTrigger);

  gsap.to('.pain-card', {
    opacity: 1, y: 0, stagger: 0.1, duration: 0.5, ease: 'power2.out',
    scrollTrigger: { trigger: '.pain-grid', start: 'top 85%' }
  });

  gsap.to('.feature-text', {
    opacity: 1, stagger: 0.12, duration: 0.5, ease: 'power2.out',
    scrollTrigger: { trigger: '#features', start: 'top 85%' }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
