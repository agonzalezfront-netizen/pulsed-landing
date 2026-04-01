import { zDiagRight, zWaveBottom, zColRight, zSphereLeft, zPlaneBottom, zGalaxy, zSphereCenter } from '../lib/zones.js';

export const PULSED_SECTIONS = [
  { zone: zDiagRight,    color: { base: '#a78bfa', bright: '#c4b5fd' }, bg: 'radial-gradient(ellipse 90% 70% at 65% 25%, #0d1f38 0%, #050c1a 65%)' },
  { zone: zWaveBottom,   color: { base: '#f87171', bright: '#fca5a5' }, bg: 'radial-gradient(ellipse 80% 60% at 30% 70%, #1c0a0a 0%, #050c1a 65%)' },
  { zone: zColRight,     color: { base: '#22d3ee', bright: '#67e8f9' }, bg: 'radial-gradient(ellipse 60% 90% at 72% 50%, #071a24 0%, #050c1a 65%)' },
  { zone: zSphereLeft,   color: { base: '#34d399', bright: '#6ee7b7' }, bg: 'radial-gradient(ellipse 70% 80% at 22% 50%, #071a10 0%, #050c1a 65%)' },
  { zone: zPlaneBottom,  color: { base: '#818cf8', bright: '#a5b4fc' }, bg: 'radial-gradient(ellipse 100% 60% at 50% 85%, #0c0c22 0%, #050c1a 65%)' },
  { zone: zGalaxy,       color: { base: '#fbbf24', bright: '#fde68a' }, bg: 'radial-gradient(ellipse 70% 60% at 18% 72%, #1a150a 0%, #050c1a 60%)' },
  { zone: zSphereCenter, color: { base: '#a78bfa', bright: '#ffffff' }, bg: 'radial-gradient(ellipse 90% 90% at 50% 50%, #0d1230 0%, #050c1a 65%)' },
];
