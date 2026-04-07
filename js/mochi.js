class Mochi {
  constructor(canvasWidth, canvasHeight, speedMultiplier = 1) {
    const mc = CONFIG.MOCHI;
    this.radius = mc.minRadius + Math.random() * (mc.maxRadius - mc.minRadius);
    this.x = this.radius + Math.random() * (canvasWidth - this.radius * 2);
    this.y = canvasHeight + this.radius + Math.random() * 40;
    this.speed = (mc.minSpeed + Math.random() * (mc.maxSpeed - mc.minSpeed)) * speedMultiplier;
    this.isGolden = Math.random() < mc.goldenChance;
    this.color = this.isGolden
      ? CONFIG.COLORS.golden
      : CONFIG.COLORS.mochi[Math.floor(Math.random() * CONFIG.COLORS.mochi.length)];
    this.colorIndex = CONFIG.COLORS.mochi.indexOf(this.color);
    this.wobblePhase = Math.random() * Math.PI * 2;
    this.wobbleX = 0;
    this.rotation = 0;
    this.alive = true;
    this.escaped = false;
    this.squish = 1;
    this.popScale = 1;
    this.popping = false;
    this.popTimer = 0;

    // face variation
    this.eyeStyle = Math.floor(Math.random() * 3); // 0: normal, 1: happy, 2: sleepy
    this.mouthOpen = Math.random() > 0.6;
  }

  update(dt) {
    if (this.popping) {
      this.popTimer += dt;
      this.popScale = 1 + this.popTimer * 4;
      if (this.popTimer > 0.15) {
        this.alive = false;
      }
      return;
    }

    this.y -= this.speed * dt;
    this.wobblePhase += CONFIG.MOCHI.wobbleSpeed * dt * Math.PI * 2;
    this.wobbleX = Math.sin(this.wobblePhase) * CONFIG.MOCHI.wobbleAmplitude;
    this.rotation = Math.sin(this.wobblePhase * 0.7) * 0.08;

    // gentle squish animation
    this.squish = 1 + Math.sin(this.wobblePhase * 1.3) * 0.05;

    if (this.y + this.radius < -10) {
      this.escaped = true;
      this.alive = false;
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x + this.wobbleX, this.y);
    ctx.rotate(this.rotation);

    if (this.popping) {
      ctx.globalAlpha = Math.max(0, 1 - this.popTimer / 0.15);
      ctx.scale(this.popScale, this.popScale);
    }

    const r = this.radius;
    const squishX = 1.15 * this.squish;
    const squishY = 0.88 / this.squish;

    // shadow
    ctx.fillStyle = 'rgba(0,0,0,0.06)';
    ctx.beginPath();
    ctx.ellipse(2, r * 0.15, r * squishX * 0.9, r * squishY * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();

    // body
    if (this.isGolden) {
      ctx.shadowColor = CONFIG.COLORS.accent;
      ctx.shadowBlur = 15;
    }
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, r * squishX, r * squishY, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // body highlight
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath();
    ctx.ellipse(-r * 0.25, -r * 0.2, r * 0.35, r * 0.2, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // blush cheeks
    ctx.fillStyle = 'rgba(255,150,150,0.3)';
    ctx.beginPath();
    ctx.ellipse(-r * 0.5, r * 0.12, r * 0.18, r * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(r * 0.5, r * 0.12, r * 0.18, r * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();

    // eyes
    const eyeY = -r * 0.1;
    const eyeSpacing = r * 0.28;
    ctx.fillStyle = CONFIG.COLORS.text;

    if (this.eyeStyle === 0) {
      // normal round eyes
      ctx.beginPath();
      ctx.arc(-eyeSpacing, eyeY, r * 0.07, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(eyeSpacing, eyeY, r * 0.07, 0, Math.PI * 2);
      ctx.fill();
      // eye sparkle
      ctx.fillStyle = CONFIG.COLORS.white;
      ctx.beginPath();
      ctx.arc(-eyeSpacing + 1.5, eyeY - 1.5, r * 0.03, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(eyeSpacing + 1.5, eyeY - 1.5, r * 0.03, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.eyeStyle === 1) {
      // happy curved eyes (^_^)
      ctx.strokeStyle = CONFIG.COLORS.text;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(-eyeSpacing, eyeY + 2, r * 0.08, Math.PI, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(eyeSpacing, eyeY + 2, r * 0.08, Math.PI, Math.PI * 2);
      ctx.stroke();
    } else {
      // sleepy eyes (- -)
      ctx.strokeStyle = CONFIG.COLORS.text;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-eyeSpacing - r * 0.06, eyeY);
      ctx.lineTo(-eyeSpacing + r * 0.06, eyeY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(eyeSpacing - r * 0.06, eyeY);
      ctx.lineTo(eyeSpacing + r * 0.06, eyeY);
      ctx.stroke();
    }

    // mouth
    ctx.strokeStyle = CONFIG.COLORS.text;
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    const mouthY = r * 0.18;
    if (this.mouthOpen) {
      ctx.fillStyle = '#FF9999';
      ctx.beginPath();
      ctx.ellipse(0, mouthY, r * 0.08, r * 0.06, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(0, mouthY - r * 0.04, r * 0.1, 0.2, Math.PI - 0.2);
      ctx.stroke();
    }

    // golden sparkle effect
    if (this.isGolden) {
      const sparkleTime = Date.now() / 300;
      for (let i = 0; i < 4; i++) {
        const angle = sparkleTime + (Math.PI * 2 * i) / 4;
        const dist = r * 1.2;
        const sx = Math.cos(angle) * dist;
        const sy = Math.sin(angle) * dist * squishY / squishX;
        const size = 2 + Math.sin(sparkleTime * 2 + i) * 1;
        ctx.fillStyle = CONFIG.COLORS.accent;
        ctx.globalAlpha = 0.6 + Math.sin(sparkleTime * 3 + i) * 0.4;
        this._drawStar(ctx, sx, sy, size);
        ctx.globalAlpha = 1;
      }
    }

    ctx.restore();
  }

  _drawStar(ctx, x, y, size) {
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x + size * 0.3, y - size * 0.3);
    ctx.lineTo(x + size, y);
    ctx.lineTo(x + size * 0.3, y + size * 0.3);
    ctx.lineTo(x, y + size);
    ctx.lineTo(x - size * 0.3, y + size * 0.3);
    ctx.lineTo(x - size, y);
    ctx.lineTo(x - size * 0.3, y - size * 0.3);
    ctx.closePath();
    ctx.fill();
  }

  hitTest(px, py) {
    const dx = px - (this.x + this.wobbleX);
    const dy = py - this.y;
    const hitRadius = this.radius * CONFIG.MOCHI.hitRadiusMultiplier;
    return dx * dx + dy * dy <= hitRadius * hitRadius;
  }

  pop() {
    this.popping = true;
    this.popTimer = 0;
    return this.isGolden ? CONFIG.MOCHI.goldenScore : CONFIG.MOCHI.normalScore;
  }
}
