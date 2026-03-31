// scene.js — Three.js renderer, camera, scene. Exporta { scene, camera, renderer, geoScene, geoCamera, geoRenderer }

export function initScene() {
  // ── Canvas principal (partículas cosmos) ──
  const canvas = document.getElementById('cosmos-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  // ── Canvas secundario (icosaedro hero) ──
  const geoCanvas = document.getElementById('geo-canvas');
  const geoRenderer = new THREE.WebGLRenderer({ canvas: geoCanvas, alpha: true, antialias: true });
  geoRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  geoRenderer.setSize(220, 220);
  geoRenderer.setClearColor(0x000000, 0);

  const geoScene = new THREE.Scene();
  const geoCamera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  geoCamera.position.z = 4;

  // ── Resize handler ──
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  return { scene, camera, renderer, geoScene, geoCamera, geoRenderer };
}
