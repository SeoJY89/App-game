class Particle {
  constructor(x, y, vx, vy, r, color, life) {
    this.x = x; this.y = y; this.vx = vx; this.vy = vy;
    this.r = r; this.color = color;
    this.life = life; this.maxLife = life; this.alive = true;
  }
  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vy += 50 * dt;
    this.life -= dt;
    if (this.life <= 0) this.alive = false;
  }
  draw(ctx) {
    const a = Math.max(0, this.life / this.maxLife);
    ctx.globalAlpha = a;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r * (0.3 + 0.7 * a), 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

class ParticleSystem {
  constructor() { this.particles = []; }

  _emit(x, y, count, speed, colors, life, r) {
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= CONFIG.PARTICLES.maxParticles) break;
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const spd = speed * (0.5 + Math.random());
      const color = colors[Math.floor(Math.random() * colors.length)];
      this.particles.push(new Particle(
        x, y, Math.cos(angle) * spd, Math.sin(angle) * spd - 20,
        r * (0.5 + Math.random()), color, life * (0.7 + Math.random() * 0.6)
      ));
    }
  }

  emitCorrect(x, y) {
    this._emit(x, y, CONFIG.PARTICLES.correctCount, 80,
      [CONFIG.COLORS.correct, CONFIG.COLORS.textHint, '#FFFFFF'], 0.6, 4);
  }

  emitClear(x, y) {
    this._emit(x, y, CONFIG.PARTICLES.clearCount, 140,
      [CONFIG.COLORS.gold, CONFIG.COLORS.accent, '#FFFFFF', CONFIG.COLORS.correct], 1, 5);
  }

  emitWrong(x, y) {
    this._emit(x, y, 6, 50, [CONFIG.COLORS.wrong], 0.4, 3);
  }

  emitSparkle(w, h) {
    if (this.particles.length >= CONFIG.PARTICLES.maxParticles) return;
    const colors = ['rgba(255,255,255,0.6)', 'rgba(120,232,176,0.4)', 'rgba(233,69,96,0.3)'];
    this.particles.push(new Particle(
      Math.random() * w, Math.random() * h,
      (Math.random() - 0.5) * 6, -2 - Math.random() * 5,
      1 + Math.random(), colors[Math.floor(Math.random() * colors.length)],
      2 + Math.random() * 2
    ));
  }

  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update(dt);
      if (!this.particles[i].alive) this.particles.splice(i, 1);
    }
  }

  draw(ctx) { for (const p of this.particles) p.draw(ctx); }
}
