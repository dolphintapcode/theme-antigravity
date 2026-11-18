/**
 * Lightweight hardware-friendly Ambient Particle Canvas.
 * Supports: thunder-rain (matches Image 3), rain, stardust, sakura, fireflies, none.
 */
export class AmbientCanvasEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.mode = 'none';
    this.intensity = 65;
    this.particles = [];
    this.sparks = [];
    this.rafId = null;
    this.lastTs = 0;
    this.destroyed = false;

    this.onResize = this.resize.bind(this);
    this.onVisibility = () => {
      if (document.hidden) {
        this.stopLoop();
      } else if (this.mode !== 'none' && !this.destroyed) {
        this.startLoop();
      }
    };

    window.addEventListener('resize', this.onResize);
    document.addEventListener('visibilitychange', this.onVisibility);
    this.resize();
  }

  resize() {
    if (!this.canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = Math.floor(this.width * dpr);
    this.canvas.height = Math.floor(this.height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  configure(mode, intensity = 65) {
    const changed = this.mode !== mode || Math.abs(this.intensity - intensity) > 8;
    this.mode = mode || 'none';
    this.intensity = Math.max(10, Math.min(100, Number(intensity) || 65));

    if (this.mode === 'none') {
      this.stopLoop();
      this.clear();
      return;
    }

    if (changed || this.particles.length === 0) {
      this.seedParticles();
    }
    if (!document.hidden && !this.rafId) {
      this.startLoop();
    }
  }

  seedParticles() {
    const factor = this.intensity / 100;
    const w = this.width || window.innerWidth;
    const h = this.height || window.innerHeight;
    this.particles = [];
    this.sparks = [];

    let count = 45;
    if (this.mode === 'thunder-rain' || this.mode === 'rain') {
      count = Math.round(55 + factor * 85);
    } else if (this.mode === 'snow') {
      count = Math.round(45 + factor * 75);
    } else if (this.mode === 'maple') {
      count = Math.round(18 + factor * 26);
    } else if (this.mode === 'embers') {
      count = Math.round(30 + factor * 45);
    } else if (this.mode === 'meteors') {
      count = Math.round(30 + factor * 50);
    } else if (this.mode === 'stardust') {
      count = Math.round(35 + factor * 65);
    } else if (this.mode === 'sakura') {
      count = Math.round(18 + factor * 30);
    } else if (this.mode === 'fireflies') {
      count = Math.round(22 + factor * 36);
    }

    for (let i = 0; i < count; i++) {
      this.particles.push(this.createParticle(w, h, true));
    }
  }

  createParticle(w, h, randomY = false) {
    const x = Math.random() * (w + 120) - 60;
    const y = randomY ? Math.random() * h : -20;

    if (this.mode === 'thunder-rain' || this.mode === 'rain') {
      return {
        x,
        y,
        len: 12 + Math.random() * 18,
        vx: -1.4 - Math.random() * 1.2,
        vy: 8 + Math.random() * 7,
        alpha: 0.14 + Math.random() * 0.24
      };
    }

    if (this.mode === 'snow') {
      return {
        x,
        y: randomY ? Math.random() * h : -15,
        r: 1.2 + Math.random() * 2.8,
        vx: -0.3 + Math.random() * 0.6,
        vy: 0.9 + Math.random() * 1.6,
        swayPhase: Math.random() * Math.PI * 2,
        swaySpeed: 0.02 + Math.random() * 0.025,
        alpha: 0.35 + Math.random() * 0.55
      };
    }

    if (this.mode === 'maple') {
      const colors = ['#dc2626', '#ef4444', '#ea580c', '#d97706', '#b91c1c'];
      return {
        x,
        y: randomY ? Math.random() * h : -25,
        size: 8 + Math.random() * 9,
        vx: 0.5 + Math.random() * 1.1,
        vy: 0.9 + Math.random() * 1.3,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.035,
        tilt: Math.random() * Math.PI * 2,
        tiltSpeed: 0.025 + Math.random() * 0.035,
        swayPhase: Math.random() * Math.PI * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 0.65 + Math.random() * 0.3
      };
    }

    if (this.mode === 'embers') {
      const emberColors = ['#fde047', '#fb923c', '#f97316', '#ef4444'];
      return {
        x: Math.random() * w,
        y: randomY ? Math.random() * h : h + 15,
        r: 1.2 + Math.random() * 2.4,
        vx: (Math.random() - 0.5) * 0.7,
        vy: -1.0 - Math.random() * 1.8,
        swayPhase: Math.random() * Math.PI * 2,
        phase: Math.random() * Math.PI * 2,
        color: emberColors[Math.floor(Math.random() * emberColors.length)],
        alpha: 0.4 + Math.random() * 0.55
      };
    }

    if (this.mode === 'sakura') {
      return {
        x,
        y,
        size: 5 + Math.random() * 6,
        vx: 0.4 + Math.random() * 0.9,
        vy: 0.8 + Math.random() * 1.1,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.04,
        swayPhase: Math.random() * Math.PI * 2,
        alpha: 0.45 + Math.random() * 0.4
      };
    }

    if (this.mode === 'fireflies') {
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        r: 1.5 + Math.random() * 2.4,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.45,
        phase: Math.random() * Math.PI * 2,
        hue: Math.random() > 0.28 ? '#34d399' : '#fde047'
      };
    }

    // stardust & meteors base
    return {
      x: Math.random() * w,
      y: randomY ? Math.random() * h : h + 10,
      r: 0.8 + Math.random() * 1.9,
      vx: (Math.random() - 0.5) * 0.25,
      vy: -0.25 - Math.random() * 0.45,
      phase: Math.random() * Math.PI * 2,
      color: Math.random() > 0.35 ? '#fef3c7' : '#93c5fd'
    };
  }

  maybeSpawnLightningSpark(w, h) {
    if (this.mode !== 'thunder-rain') return;
    if (this.sparks.length < 4 && Math.random() < 0.028 * (this.intensity / 65)) {
      const startX = w * (0.25 + Math.random() * 0.55);
      const startY = h * (0.15 + Math.random() * 0.65);
      const pts = [{ x: startX, y: startY }];
      let cx = startX;
      let cy = startY;
      const segs = 4 + Math.floor(Math.random() * 4);
      for (let i = 0; i < segs; i++) {
        cx += (Math.random() - 0.5) * 42;
        cy += (Math.random() - 0.35) * 40;
        pts.push({ x: cx, y: cy });
      }
      this.sparks.push({ pts, life: 1, decay: 0.045 + Math.random() * 0.03 });
    }
  }

  maybeSpawnMeteor(w, h) {
    if (this.mode !== 'meteors') return;
    if (this.sparks.length < 3 && Math.random() < 0.024 * (this.intensity / 65)) {
      const startX = Math.random() * (w * 0.85);
      const startY = Math.random() * (h * 0.4);
      const len = 90 + Math.random() * 110;
      const angle = (32 + Math.random() * 16) * (Math.PI / 180);
      const speed = 14 + Math.random() * 10;
      this.sparks.push({
        x: startX,
        y: startY,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        len,
        angle,
        life: 1,
        decay: 0.035 + Math.random() * 0.025
      });
    }
  }

  startLoop() {
    this.stopLoop();
    const tick = (ts) => {
      if (this.destroyed || this.mode === 'none') return;
      if (ts - this.lastTs >= 24) {
        this.lastTs = ts;
        this.drawFrame(ts);
      }
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  stopLoop() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  clear() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.width || 0, this.height || 0);
  }

  drawFrame(ts) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    ctx.clearRect(0, 0, w, h);

    if (this.mode === 'thunder-rain' || this.mode === 'rain') {
      ctx.lineCap = 'round';
      ctx.lineWidth = 1;
      for (const p of this.particles) {
        ctx.strokeStyle =
          this.mode === 'thunder-rain'
            ? `rgba(210, 224, 245, ${p.alpha})`
            : `rgba(190, 215, 255, ${p.alpha})`;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + p.vx * 1.4, p.y + p.len);
        ctx.stroke();

        p.x += p.vx;
        p.y += p.vy;
        if (p.y > h + 20 || p.x < -80) {
          Object.assign(p, this.createParticle(w, h, false));
        }
      }

      if (this.mode === 'thunder-rain') {
        this.maybeSpawnLightningSpark(w, h);
        for (let i = this.sparks.length - 1; i >= 0; i--) {
          const sp = this.sparks[i];
          ctx.save();
          ctx.strokeStyle = `rgba(253, 224, 71, ${sp.life * 0.85})`;
          ctx.shadowColor = '#facc15';
          ctx.shadowBlur = 10;
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          sp.pts.forEach((pt, idx) => {
            if (idx === 0) ctx.moveTo(pt.x, pt.y);
            else ctx.lineTo(pt.x, pt.y);
          });
          ctx.stroke();
          ctx.restore();
          sp.life -= sp.decay;
          if (sp.life <= 0) this.sparks.splice(i, 1);
        }
      }
      return;
    }

    if (this.mode === 'snow') {
      for (const p of this.particles) {
        p.swayPhase += p.swaySpeed;
        p.x += p.vx + Math.sin(p.swayPhase) * 0.7;
        p.y += p.vy;

        ctx.save();
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.shadowColor = '#e0f2fe';
        ctx.shadowBlur = p.r > 2.2 ? 6 : 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (p.y > h + 15 || p.x > w + 40 || p.x < -40) {
          Object.assign(p, this.createParticle(w, h, false));
        }
      }
      return;
    }

    if (this.mode === 'maple') {
      for (const p of this.particles) {
        p.swayPhase += 0.025;
        p.x += p.vx + Math.sin(p.swayPhase) * 1.1;
        p.y += p.vy;
        p.angle += p.spin;
        p.tilt += p.tiltSpeed;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.scale(Math.cos(p.tilt), 1);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
        ctx.shadowBlur = 4;

        const s = p.size;
        ctx.beginPath();
        ctx.moveTo(0, -s);
        ctx.quadraticCurveTo(s * 0.25, -s * 0.75, s * 0.45, -s * 0.7);
        ctx.lineTo(s * 0.3, -s * 0.5);
        ctx.quadraticCurveTo(s * 0.65, -s * 0.45, s * 0.9, -s * 0.2);
        ctx.lineTo(s * 0.65, -s * 0.1);
        ctx.quadraticCurveTo(s * 0.8, s * 0.2, s * 0.6, s * 0.5);
        ctx.lineTo(s * 0.35, s * 0.35);
        ctx.lineTo(s * 0.1, s * 0.75);
        ctx.lineTo(0, s * 0.65);
        ctx.lineTo(-s * 0.1, s * 0.75);
        ctx.lineTo(-s * 0.35, s * 0.35);
        ctx.quadraticCurveTo(-s * 0.8, s * 0.2, -s * 0.65, -s * 0.1);
        ctx.lineTo(-s * 0.9, -s * 0.2);
        ctx.quadraticCurveTo(-s * 0.65, -s * 0.45, -s * 0.3, -s * 0.5);
        ctx.lineTo(-s * 0.45, -s * 0.7);
        ctx.quadraticCurveTo(-s * 0.25, -s * 0.75, 0, -s);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(0, s * 0.65);
        ctx.lineTo(0, s * 0.98);
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = Math.max(0.8, s * 0.08);
        ctx.stroke();

        ctx.restore();

        if (p.y > h + 30 || p.x > w + 60 || p.x < -60) {
          Object.assign(p, this.createParticle(w, h, false));
        }
      }
      return;
    }

    if (this.mode === 'embers') {
      for (const p of this.particles) {
        p.swayPhase += 0.035;
        p.x += p.vx + Math.sin(p.swayPhase) * 0.7;
        p.y += p.vy;

        const pulse = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(ts * 0.005 + p.phase));
        ctx.save();
        ctx.globalAlpha = p.alpha * pulse;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (p.y < -15 || p.x < -20 || p.x > w + 20) {
          Object.assign(p, this.createParticle(w, h, false));
        }
      }
      return;
    }

    if (this.mode === 'meteors') {
      for (const p of this.particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -10) {
          p.y = h + 10;
          p.x = Math.random() * w;
        }
        const alpha = 0.2 + 0.6 * (0.5 + 0.5 * Math.sin(ts * 0.0025 + p.phase));
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      this.maybeSpawnMeteor(w, h);
      for (let i = this.sparks.length - 1; i >= 0; i--) {
        const m = this.sparks[i];
        ctx.save();
        ctx.globalAlpha = m.life;
        const tailX = m.x - Math.cos(m.angle) * m.len;
        const tailY = m.y - Math.sin(m.angle) * m.len;
        const grad = ctx.createLinearGradient(tailX, tailY, m.x, m.y);
        grad.addColorStop(0, 'rgba(147, 197, 253, 0)');
        grad.addColorStop(0.7, 'rgba(191, 219, 254, 0.6)');
        grad.addColorStop(1, '#ffffff');

        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.8;
        ctx.shadowColor = '#60a5fa';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(m.x, m.y);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(m.x, m.y, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        m.x += m.dx;
        m.y += m.dy;
        m.life -= m.decay;
        if (m.life <= 0 || m.x > w + 100 || m.y > h + 100) {
          this.sparks.splice(i, 1);
        }
      }
      return;
    }

    if (this.mode === 'sakura') {
      for (const p of this.particles) {
        p.swayPhase += 0.03;
        p.x += p.vx + Math.sin(p.swayPhase) * 0.65;
        p.y += p.vy;
        p.angle += p.spin;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = `rgba(249, 168, 212, ${p.alpha})`;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (p.y > h + 20 || p.x > w + 40) {
          Object.assign(p, this.createParticle(w, h, false));
        }
      }
      return;
    }

    if (this.mode === 'fireflies') {
      for (const p of this.particles) {
        p.x += p.vx + Math.sin(ts * 0.001 + p.phase) * 0.25;
        p.y += p.vy + Math.cos(ts * 0.0012 + p.phase) * 0.2;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        const glow = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(ts * 0.003 + p.phase));
        ctx.save();
        ctx.globalAlpha = glow;
        ctx.fillStyle = p.hue;
        ctx.shadowColor = p.hue;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      return;
    }

    // stardust
    for (const p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.y < -10) {
        p.y = h + 10;
        p.x = Math.random() * w;
      }
      const alpha = 0.25 + 0.65 * (0.5 + 0.5 * Math.sin(ts * 0.0025 + p.phase));
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  destroy() {
    this.destroyed = true;
    this.stopLoop();
    window.removeEventListener('resize', this.onResize);
    document.removeEventListener('visibilitychange', this.onVisibility);
  }
}
