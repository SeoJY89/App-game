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

  emitSolved(x, y) {
    const colors = ['#7ee8a0', '#f5e6a8', '#FFFFFF'];
    for (let i = 0; i < 20; i++) {
      const angle = (Math.PI * 2 * i) / 20;
      const spd = 80 + Math.random() * 60;
      this.particles.push(new Particle(
        x, y, Math.cos(angle) * spd, Math.sin(angle) * spd - 30,
        3 + Math.random() * 3,
        colors[Math.floor(Math.random() * colors.length)],
        0.8 + Math.random() * 0.4
      ));
    }
  }

  emitAmbient(w, h) {
    if (this.particles.length > 30) return;
    const colors = ['rgba(245,230,168,0.3)', 'rgba(126,232,160,0.2)', 'rgba(255,255,255,0.3)'];
    this.particles.push(new Particle(
      Math.random() * w, Math.random() * h,
      (Math.random() - 0.5) * 4, -2 - Math.random() * 3,
      1 + Math.random(),
      colors[Math.floor(Math.random() * colors.length)],
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
