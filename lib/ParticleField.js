/**
 * visual-fx / core / ParticleField.js
 *
 * A canvas-based particle field with:
 *  - Per-particle independent drift, pulse, opacity
 *  - Per-particle mass (lighter = flies further on mouse hit)
 *  - Mouse interaction: velocity-based impulse + spring return
 *  - Smooth zone morphing between section states
 *  - Global parallax tied to mouse position
 *
 * Usage:
 *   import { ParticleField } from './core/ParticleField.js';
 *   import { zDiagRight, zSphereCenter } from './core/zones.js';
 *
 *   const field = new ParticleField({ canvas: document.getElementById('c') });
 *   field.morphTo({ zone: zDiagRight, color: '#a78bfa', bg: 'radial-gradient(...)' });
 */

export class ParticleField {
  constructor(options = {}) {
    this.cv  = options.canvas;
    this.ctx = this.cv.getContext('2d');

    // Config with defaults
    this.count        = options.count        ?? 650;
    this.sparkleRatio = options.sparkleRatio ?? 0.08;
    this.bgEl         = options.bgEl         ?? null;  // element to apply bg gradient

    // Physics
    this.MOUSE_R  = options.mouseRadius  ?? 180;
    this.IMPULSE  = options.impulse      ?? 14;
    this.SPRING   = options.spring       ?? 0.7;
    this.DAMPING  = options.damping      ?? 0.96;
    this.MORPH_DUR = options.morphDur    ?? 1.5;  // seconds

    // State
    this.VW = 0; this.VH = 0;
    this.mouse  = { x:-9999, y:-9999, vx:0, vy:0, nx:0, ny:0, tx:0, ty:0 };
    this.pts    = [];
    this.morphFrom = null; this._morphTarget = null; this.morphT = 1;
    this.curColor  = { base: '#a78bfa', bright: '#c4b5fd' };
    this._prev  = null;

    this._buildParticles();
    this._bindEvents();
    this._loop = this._loop.bind(this);
    this._paused = false;
    requestAnimationFrame(this._loop);

    // Pause rendering when tab is not visible — saves CPU/GPU
    document.addEventListener('visibilitychange', () => {
      this._paused = document.hidden;
      if (!this._paused) {
        this._prev = null; // reset delta time to avoid huge jump
        requestAnimationFrame(this._loop);
      }
    });
  }

  // ── Build ────────────────────────────────────────────────────
  _r(a, b) { return a + Math.random() * (b - a); }

  _buildParticles() {
    const r = this._r.bind(this);
    this.pts = [];
    for (let i = 0; i < this.count; i++) {
      const sparkle = i < this.count * this.sparkleRatio;
      this.pts.push({
        bx: r(0,1), by: r(0,1),
        r:    sparkle ? r(1.4,2.4) : r(0.5,1.1),
        ob:   sparkle ? r(0.55,0.85) : r(0.25,0.60),
        oa:   r(0.04,0.12),
        os:   r(0.3,1.1),
        dax:  r(2,9),   day:  r(2,9),
        dsx:  r(0.2,0.9), dsy: r(0.2,0.9),
        psx:  r(0.5,1.6), pa:  r(0.08,0.22),
        ph:   r(0, Math.PI*2),
        depth: r(0.3,1.0),
        mass:  r(0.3,2.8),
        ox:0, oy:0, vx:0, vy:0,
      });
    }
  }

  // ── Events ───────────────────────────────────────────────────
  _bindEvents() {
    const m = this.mouse;

    // Mouse
    window.addEventListener('mousemove', e => {
      m.vx = e.clientX - m.x;
      m.vy = e.clientY - m.y;
      m.x  = e.clientX; m.y  = e.clientY;
      m.tx = (e.clientX / this.VW) - 0.5;
      m.ty = (e.clientY / this.VH) - 0.5;
    });
    window.addEventListener('mouseleave', () => {
      m.x = -9999; m.y = -9999; m.vx = 0; m.vy = 0;
    });

    // Touch — particles react to finger drag
    window.addEventListener('touchstart', e => {
      const t = e.touches[0];
      m.x = t.clientX; m.y = t.clientY;
      m.vx = 0; m.vy = 0;
      m.tx = (t.clientX / this.VW) - 0.5;
      m.ty = (t.clientY / this.VH) - 0.5;
    }, { passive: true });

    window.addEventListener('touchmove', e => {
      const t = e.touches[0];
      m.vx = t.clientX - m.x;
      m.vy = t.clientY - m.y;
      m.x  = t.clientX; m.y  = t.clientY;
      m.tx = (t.clientX / this.VW) - 0.5;
      m.ty = (t.clientY / this.VH) - 0.5;
    }, { passive: true });

    window.addEventListener('touchend', () => {
      m.x = -9999; m.y = -9999;
      m.vx = 0; m.vy = 0;
    }, { passive: true });

    window.addEventListener('resize', () => this._resize());
    this._resize();
  }

  _resize() {
    this.VW = this.cv.width  = window.innerWidth;
    this.VH = this.cv.height = window.innerHeight;
  }

  // ── Morph API ────────────────────────────────────────────────
  /**
   * Transition particles to a new zone.
   * @param {object} config
   * @param {Function} config.zone   - zone function (i, n) => {x, y}
   * @param {object}  [config.color] - { base, bright } hex strings
   * @param {string}  [config.bg]    - CSS gradient string for bgEl
   */
  morphTo({ zone, color, bg } = {}) {
    this.morphFrom = this.pts.map(p => ({ bx: p.bx, by: p.by }));
    this._morphTarget = Array.from({ length: this.count }, (_, i) => {
      const pos = zone(i, this.count);
      return {
        bx: pos.x,
        by: pos.y,
      };
    });
    if (color) this.curColor = color;
    if (bg && this.bgEl) this.bgEl.style.background = bg;
    this.morphT = 0;
  }

  // ── Render ───────────────────────────────────────────────────
  _easeInOut(t) { return t < 0.5 ? 2*t*t : -1+(4-2*t)*t; }

  _loop(ts) {
    const dt = this._prev ? Math.min((ts - this._prev) / 1000, 0.05) : 0.016;
    this._prev = ts;
    const t = ts / 1000;
    const { ctx, VW, VH, pts, mouse, curColor } = this;
    const N = this.count;

    // Morph progress
    if (this.morphT < 1 && this.morphFrom && this._morphTarget) {
      this.morphT = Math.min(1, this.morphT + dt / this.MORPH_DUR);
      const e = this._easeInOut(this.morphT);
      for (let i = 0; i < N; i++) {
        pts[i].bx = this.morphFrom[i].bx + (this._morphTarget[i].bx - this.morphFrom[i].bx) * e;
        pts[i].by = this.morphFrom[i].by + (this._morphTarget[i].by - this.morphFrom[i].by) * e;
      }
    }

    // Mouse parallax lag
    mouse.nx += (mouse.tx - mouse.nx) * 0.05;
    mouse.ny += (mouse.ty - mouse.ny) * 0.05;

    ctx.clearRect(0, 0, VW, VH);

    const cursorSpeed = Math.sqrt(mouse.vx*mouse.vx + mouse.vy*mouse.vy);

    for (let i = 0; i < N; i++) {
      const p  = pts[i];
      const ph = t + p.ph;

      // Base position: morph + drift + parallax
      const bx = p.bx*VW + Math.sin(ph*p.dsx)*p.dax + mouse.nx*14*p.depth;
      const by = p.by*VH + Math.cos(ph*p.dsy)*p.day + mouse.ny*10*p.depth;

      // Distance to mouse (world position)
      const wx = bx + p.ox, wy = by + p.oy;
      const dx = wx - mouse.x, dy = wy - mouse.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      const near = dist < this.MOUSE_R && dist > 0.5;

      // Velocity-based impulse
      if (near && cursorSpeed > 1.5) {
        const f = Math.pow(1 - dist/this.MOUSE_R, 2);
        const ndx = dx/dist, ndy = dy/dist;
        const spd = cursorSpeed;
        p.vx += (ndx*0.7 + (mouse.vx/spd)*0.3) * f * spd * this.IMPULSE / p.mass;
        p.vy += (ndy*0.7 + (mouse.vy/spd)*0.3) * f * spd * this.IMPULSE / p.mass;
      }

      // Spring — only when cursor not hovering stationary
      if (!near || cursorSpeed < 1.5) {
        p.vx -= p.ox * this.SPRING * dt;
        p.vy -= p.oy * this.SPRING * dt;
      }

      p.vx *= this.DAMPING;
      p.vy *= this.DAMPING;
      p.ox += p.vx * dt;
      p.oy += p.vy * dt;

      const x = bx + p.ox, y = by + p.oy;

      // Size pulse
      const r = Math.max(0.3, p.r * (1 + Math.sin(ph*p.psx)*p.pa));
      // Opacity pulse
      const a = Math.max(0.04, Math.min(0.9, p.ob + Math.sin(ph*p.os)*p.oa));

      const col = p.r > 1.3 ? curColor.bright : curColor.base;

      // Sparkle particles: halo + shadow (expensive, only ~8% of total)
      if (p.r > 1.3) {
        ctx.save();
        ctx.globalAlpha = a * 0.12;
        const g = ctx.createRadialGradient(x,y,0,x,y,r*5);
        g.addColorStop(0, col); g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(x,y,r*5,0,Math.PI*2); ctx.fill();
        ctx.globalAlpha = a;
        ctx.shadowColor = col;
        ctx.shadowBlur  = r * 2.5;
        ctx.fillStyle   = col;
        ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
        ctx.restore();
      } else {
        // Normal particles: simple dot, NO shadow (fast)
        ctx.globalAlpha = a;
        ctx.fillStyle   = col;
        ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
      }
    }

    if (!this._paused) requestAnimationFrame(this._loop);
  }
}
