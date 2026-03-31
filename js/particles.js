// particles.js — Sistema de partículas cosmos + mouse glow

const PARTICLE_COUNT = 1500;
const PALETTE = [
  new THREE.Color('#a78bfa'),
  new THREE.Color('#7c3aed'),
  new THREE.Color('#c4b5fd'),
  new THREE.Color('#ffffff'),
];

export function initParticles(scene) {
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const colors    = new Float32Array(PARTICLE_COUNT * 3);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.acos(2 * Math.random() - 1);
    const r     = 3 + Math.random() * 5;

    positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);

    const col = PALETTE[Math.floor(Math.random() * PALETTE.length)];
    colors[i * 3]     = col.r;
    colors[i * 3 + 1] = col.g;
    colors[i * 3 + 2] = col.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color',    new THREE.BufferAttribute(colors,    3));

  const material = new THREE.PointsMaterial({
    size: 0.06,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    sizeAttenuation: true,
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  return { points, geometry, material };
}

const mouse = { x: 0, y: 0 };

export function onMouseMove(e) {
  mouse.x = (e.clientX / window.innerWidth  - 0.5) * 2;
  mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
}

export function updateParticles(camera) {
  camera.position.x += (mouse.x * 0.3 - camera.position.x) * 0.02;
  camera.position.y += (-mouse.y * 0.2 - camera.position.y) * 0.02;
}
