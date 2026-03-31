// geometry.js — Icosaedro wireframe (hero + stats background)

export function initGeometry(geoScene) {
  const icoGeo = new THREE.IcosahedronGeometry(1.4, 1);
  const icoMat = new THREE.MeshBasicMaterial({
    color: 0xa78bfa,
    wireframe: true,
    transparent: true,
    opacity: 0.45,
  });
  const icoMesh = new THREE.Mesh(icoGeo, icoMat);
  geoScene.add(icoMesh);

  const ringGeo = new THREE.TorusGeometry(2.0, 0.008, 8, 80);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x7c3aed,
    transparent: true,
    opacity: 0.2,
  });
  const ringMesh = new THREE.Mesh(ringGeo, ringMat);
  ringMesh.rotation.x = Math.PI / 3;
  geoScene.add(ringMesh);

  return { icoMesh, ringMesh };
}

export function animateGeometry(icoMesh, ringMesh, elapsed) {
  icoMesh.rotation.x = elapsed * 0.15;
  icoMesh.rotation.y = elapsed * 0.22;
  ringMesh.rotation.z = elapsed * 0.08;
}
