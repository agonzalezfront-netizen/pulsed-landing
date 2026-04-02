/**
 * visual-fx / core / zones.js
 * Particle zone definitions — each zone returns {x, y} normalized 0-1
 * Usage: pass any zone function to ParticleField.morphTo({ zone: zDiagRight, ... })
 */

function rand(a, b) { return a + Math.random() * (b - a); }

/** Diagonal streak — dense center, sparse edges. Top-left → bottom-right. */
export function zDiagRight(i, n) {
  var t = i / n;
  var cx = 0.32 + t * 0.60, cy = 0.08 + t * 0.82;
  var spread = 0.04 + Math.sin(t * Math.PI) * 0.09;
  var perp = rand(-1, 1);
  return { x: cx + perp * spread * 0.45, y: cy + perp * spread };
}

/** Horizontal wave band — particles form a wave across the lower half. */
export function zWaveBottom(i, n) {
  var tx = rand(0, 1);
  var wave = Math.sin(tx * Math.PI * 3) * 0.05 + Math.sin(tx * Math.PI * 7) * 0.02;
  return { x: tx, y: 0.52 + wave + rand(-0.06, 0.06) };
}

/** Vertical column — narrow band on the right side. */
export function zColRight(i, n) {
  var t = i / n;
  var spread = 0.025 + Math.sin(t * Math.PI) * 0.07;
  return { x: 0.62 + rand(-spread, spread), y: t * 0.92 + 0.04 };
}

/** Sphere on the left side — surface-concentrated (3D projection feel). */
export function zSphereLeft(i, n) {
  var angle = rand(0, Math.PI * 2);
  var shell = rand(0, 1) < 0.6 ? rand(0.75, 1.0) : rand(0, 0.75);
  var mob = typeof window !== 'undefined' && window.innerWidth < 768;
  var cx = mob ? 0.75 : 0.26;
  var cy = mob ? 0.85 : 0.52;
  return {
    x: cx + Math.cos(angle) * 0.30 * shell,
    y: cy + Math.sin(angle) * 0.30 * shell * 1.05
  };
}

/** Perspective plane — wide at bottom, narrow at top (3D floor illusion). */
export function zPlaneBottom(i, n) {
  var depth = rand(0, 1);
  var mob = typeof window !== 'undefined' && window.innerWidth < 768;
  var ty = (mob ? 0.78 : 0.52) + depth * 0.38;
  var spread = 0.08 + depth * 0.36;
  return { x: 0.5 + (rand(0, 1) - 0.5) * spread * 2, y: ty };
}

/** Diagonal streak — bottom-left → top-right (inverse of zDiagRight). */
export function zDiagLeft(i, n) {
  var t = i / n;
  var cx = 0.05 + t * 0.72, cy = 0.88 - t * 0.72;
  var spread = 0.03 + Math.sin(t * Math.PI) * 0.08;
  var perp = rand(-1, 1);
  return { x: cx + perp * spread, y: cy + perp * spread * 0.5 };
}

/** Sphere centered — large, surface-concentrated. */
export function zSphereCenter(i, n) {
  var angle = rand(0, Math.PI * 2);
  var shell = rand(0, 1) < 0.65 ? rand(0.7, 1.0) : rand(0, 0.7);
  return {
    x: 0.50 + Math.cos(angle) * 0.36 * shell,
    y: 0.50 + Math.sin(angle) * 0.36 * shell
  };
}

/** Ring — particles distributed around a circle. */
export function zRing(i, n) {
  var angle = (i / n) * Math.PI * 2 + rand(-0.05, 0.05);
  var r = 0.28 + rand(-0.02, 0.02);
  return { x: 0.5 + Math.cos(angle) * r, y: 0.5 + Math.sin(angle) * r * 0.9 };
}

/** Scatter — fully random, chaotic distribution. */
export function zScatter(i, n) {
  return { x: rand(0.05, 0.95), y: rand(0.05, 0.95) };
}

/** Galaxy spiral — Milky Way top-down: bright core, thick arms, diffuse disk.
 *  Optimized for 1200 particles. Sparkle particles (first 8%) go to core. */
export function zGalaxy(i, n) {
  var mob = typeof window !== 'undefined' && window.innerWidth < 768;
  var cx = mob ? 0.82 : 0.18, cy = 0.72;
  var R  = 0.70;                    // much bigger
  var ell = 0.42;
  var TILT = -0.42;
  var cosT = Math.cos(TILT), sinT = Math.sin(TILT);

  function tilt(dx, dy) {
    return { x: cx + dx * cosT - dy * sinT, y: cy + dx * sinT + dy * cosT };
  }

  // ── 1. Bright core: 8% (sparkle = brightest particles) ──
  if (i < n * 0.08) {
    var a = rand(0, Math.PI * 2);
    var r = Math.pow(rand(0, 1), 2) * R * 0.14;
    return tilt(Math.cos(a) * r, Math.sin(a) * r * ell);
  }

  // ── 2. Inner bulge: 8-18% ──
  if (i < n * 0.18) {
    var a = rand(0, Math.PI * 2);
    var r = Math.pow(rand(0, 1), 1.2) * R * 0.28;
    return tilt(Math.cos(a) * r, Math.sin(a) * r * ell);
  }

  // ── 3. Diffuse disk: 18-25% — light fill between arms ──
  if (i < n * 0.25) {
    var a = rand(0, Math.PI * 2);
    var r = Math.pow(rand(0, 1), 0.7) * R;
    return tilt(Math.cos(a) * r, Math.sin(a) * r * ell);
  }

  // ── 4. Four spiral arms: 75% — dense visible tails ──
  var t = (i - n * 0.25) / (n * 0.75);
  var arm = i % 4;
  var armStart = (arm / 4) * Math.PI * 2;

  var angle = armStart + Math.pow(t, 0.6) * Math.PI * 2.8;
  var r = R * 0.08 + t * R * 0.92;

  var thickness = 0.03 + t * 0.10;
  var perp = angle + Math.PI * 0.5;
  var off = rand(-1, 1) * thickness;

  var dx = Math.cos(angle) * r + Math.cos(perp) * off;
  var dy = (Math.sin(angle) * r + Math.sin(perp) * off) * ell;
  return tilt(dx, dy);
}
