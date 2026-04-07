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
    this.vy += 80 * dt; // slight gravity
    this.life -= dt;
    if (this.life <= 0) this.alive = false;
  }

  draw(ctx) {
    const alpha = Math.max(0, this.life / this.maxLife);
    const scale = 0.3 + 0.7 * alpha;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  emitPop(x, y, color) {
    const count = CONFIG.PARTICLES.popCount;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
      const speed = CONFIG.PARTICLES.popSpeed * (0.7 + Math.random() * 0.6);
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed - 40;
      const radius = 4 + Math.random() * 5;
      const life = CONFIG.PARTICLES.popLife * (0.7 + Math.random() * 0.6);
      this.particles.push(new Particle(x, y, vx, vy, radius, color, life));
    }
  }

  emitCombo(x, y, level) {
    const count = Math.min(level * 3, 15);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 100;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed - 50;
      const radius = 2 + Math.random() * 3;
      const life = 0.5 + Math.random() * 0.3;
      this.particles.push(new Particle(x, y, vx, vy, radius, CONFIG.COLORS.accent, life));
    }
  }

  emitSparkle(canvasWidth, canvasHeight) {
    if (this.particles.length >= CONFIG.PARTICLES.maxParticles) return;
    const x = Math.random() * canvasWidth;
    const y = Math.random() * canvasHeight;
    const vx = (Math.random() - 0.5) * 10;
    const vy = -5 - Math.random() * 10;
    const radius = 1.5 + Math.random() * 2;
    const life = 1.5 + Math.random() * 1.5;
    const colors = ['#FFD700', '#FFFFFF', '#FFB8D0', '#D4B8FF'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    this.particles.push(new Particle(x, y, vx, vy, radius, color, life));
  }

  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update(dt);
      if (!this.particles[i].alive) {
        this.particles.splice(i, 1);
      }
    }
  }

  draw(ctx) {
    for (const p of this.particles) {
      p.draw(ctx);
    }
  }
}
