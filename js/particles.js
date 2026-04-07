class Particle {
  constructor(x, y, vx, vy, radius, color, life) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.radius = radius;
    this.color = color;
    this.life = life;
    this.maxLife = life;
    this.alive = true;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vy += 60 * dt;
    this.life -= dt;
    if (this.life <= 0) this.alive = false;
  }

  draw(ctx) {
    const a = Math.max(0, this.life / this.maxLife);
    const s = 0.3 + 0.7 * a;
    ctx.globalAlpha = a;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  _emit(x, y, count, speed, color, life, radius) {
    if (this.particles.length >= CONFIG.PARTICLES.maxParticles) return;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
      const spd = speed * (0.6 + Math.random() * 0.8);
      const vx = Math.cos(angle) * spd;
      const vy = Math.sin(angle) * spd - 30;
      const r = radius * (0.6 + Math.random() * 0.8);
      const l = life * (0.7 + Math.random() * 0.6);
      this.particles.push(new Particle(x, y, vx, vy, r, color, l));
    }
  }

  emitMerge(x, y, color) {
    this._emit(x, y, CONFIG.PARTICLES.mergeCount, 100, color, 0.5, 5);
    this._emit(x, y, 4, 60, CONFIG.COLORS.accent, 0.6, 3);
  }

  emitSpawn(x, y) {
    this._emit(x, y, CONFIG.PARTICLES.spawnCount, 50, '#FFFFFF', 0.4, 3);
  }

  emitDeliver(x, y) {
    this._emit(x, y, CONFIG.PARTICLES.deliverCount, 120, CONFIG.COLORS.accent, 0.7, 4);
    this._emit(x, y, 5, 80, '#FFFFFF', 0.5, 3);
  }

  emitSparkle(w, h) {
    if (this.particles.length >= CONFIG.PARTICLES.maxParticles) return;
    const x = Math.random() * w;
    const y = Math.random() * h;
    const colors = ['#FFD700', '#FFFFFF', '#FFB8D0', '#B8E6C8'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    this.particles.push(new Particle(x, y, (Math.random() - 0.5) * 8, -3 - Math.random() * 8, 1.5 + Math.random() * 1.5, color, 2 + Math.random()));
  }

  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update(dt);
      if (!this.particles[i].alive) this.particles.splice(i, 1);
    }
  }

  draw(ctx) {
    for (const p of this.particles) p.draw(ctx);
  }
}
