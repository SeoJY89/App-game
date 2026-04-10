class Particle {
  constructor(x, y, vx, vy, r, color, life) {
    this.x = x; this.y = y; this.vx = vx; this.vy = vy;
    this.r = r; this.color = color;
    this.life = life; this.maxLife = life; this.alive = true;
  }
  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vy += 40 * dt;
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

  emitEscape(x, y) {
    const colors = ['#d4956a', '#f5e6a8', '#FFFFFF', '#7ee8a0'];
    for (let i = 0; i < 25; i++) {
      const angle = (Math.PI * 2 * i) / 25;
      const spd = 80 + Math.random() * 80;
      this.particles.push(new Particle(
        x, y, Math.cos(angle) * spd, Math.sin(angle) * spd - 40,
        3 + Math.random() * 3,
        colors[Math.floor(Math.random() * colors.length)],
        0.9 + Math.random() * 0.4
      ));
    }
  }

  emitDust(w, h) {
    if (this.particles.length > 40) return;
    this.particles.push(new Particle(
      Math.random() * w, Math.random() * h,
      (Math.random() - 0.5) * 4, -1 - Math.random() * 3,
      0.8 + Math.random(),
      'rgba(255,255,255,0.15)',
      3 + Math.random() * 2
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
