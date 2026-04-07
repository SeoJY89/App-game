class Item {
  constructor(chain, level, gridX, gridY) {
    this.chain = chain;
    this.level = level;
    this.gridX = gridX;
    this.gridY = gridY;

    const g = CONFIG.GRID;
    this.drawX = g.OFFSET_X + gridX * (g.CELL_SIZE + g.PADDING) + g.CELL_SIZE / 2;
    this.drawY = g.OFFSET_Y + gridY * (g.CELL_SIZE + g.PADDING) + g.CELL_SIZE / 2;
    this.targetX = this.drawX;
    this.targetY = this.drawY;

    this.scale = 0;
    this.targetScale = 1;
    this.alpha = 1;
    this.animating = false;
    this.spawning = true;
    this.merging = false;
    this.removing = false;
  }

  getData() {
    return CONFIG.CHAINS[this.chain].items[this.level - 1];
  }

  getColor() {
    return CONFIG.COLORS.chainColors[this.chain][this.level - 1];
  }

  setGridPos(gx, gy) {
    this.gridX = gx;
    this.gridY = gy;
    const g = CONFIG.GRID;
    this.targetX = g.OFFSET_X + gx * (g.CELL_SIZE + g.PADDING) + g.CELL_SIZE / 2;
    this.targetY = g.OFFSET_Y + gy * (g.CELL_SIZE + g.PADDING) + g.CELL_SIZE / 2;
    this.animating = true;
  }

  startSpawn() {
    this.scale = 0;
    this.targetScale = 1;
    this.spawning = true;
  }

  startMergeAway() {
    this.removing = true;
    this.targetScale = 0;
  }

  update(dt) {
    const speed = 12;

    // smooth move
    if (this.animating) {
      this.drawX += (this.targetX - this.drawX) * speed * dt;
      this.drawY += (this.targetY - this.drawY) * speed * dt;
      if (Math.abs(this.drawX - this.targetX) < 0.5 && Math.abs(this.drawY - this.targetY) < 0.5) {
        this.drawX = this.targetX;
        this.drawY = this.targetY;
        this.animating = false;
      }
    }

    // scale animation
    if (this.spawning) {
      this.scale += (1.25 - this.scale) * 10 * dt;
      if (this.scale >= 1.2) {
        this.spawning = false;
      }
    } else if (this.removing) {
      this.scale += (0 - this.scale) * 12 * dt;
      if (this.scale < 0.05) {
        this.scale = 0;
        this.alpha = 0;
      }
    } else {
      this.scale += (this.targetScale - this.scale) * 8 * dt;
    }
  }

  draw(ctx, overrideX, overrideY) {
    if (this.alpha <= 0) return;

    const x = overrideX !== undefined ? overrideX : this.drawX;
    const y = overrideY !== undefined ? overrideY : this.drawY;
    const data = this.getData();
    const color = this.getColor();
    const size = CONFIG.GRID.CELL_SIZE;
    const half = size / 2;
    const s = this.scale;

    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.translate(x, y);
    ctx.scale(s, s);

    // item background
    const r = 10;
    ctx.fillStyle = color;
    ctx.shadowColor = 'rgba(0,0,0,0.1)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 2;
    ctx.beginPath();
    ctx.moveTo(-half + r, -half);
    ctx.lineTo(half - r, -half);
    ctx.quadraticCurveTo(half, -half, half, -half + r);
    ctx.lineTo(half, half - r);
    ctx.quadraticCurveTo(half, half, half - r, half);
    ctx.lineTo(-half + r, half);
    ctx.quadraticCurveTo(-half, half, -half, half - r);
    ctx.lineTo(-half, -half + r);
    ctx.quadraticCurveTo(-half, -half, -half + r, -half);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    // highlight
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath();
    ctx.ellipse(-5, -8, half * 0.5, half * 0.25, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // level 7 glow
    if (this.level === 7) {
      ctx.shadowColor = CONFIG.COLORS.accent;
      ctx.shadowBlur = 12;
      ctx.strokeStyle = CONFIG.COLORS.accent;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-half + r, -half);
      ctx.lineTo(half - r, -half);
      ctx.quadraticCurveTo(half, -half, half, -half + r);
      ctx.lineTo(half, half - r);
      ctx.quadraticCurveTo(half, half, half - r, half);
      ctx.lineTo(-half + r, half);
      ctx.quadraticCurveTo(-half, half, -half, half - r);
      ctx.lineTo(-half, -half + r);
      ctx.quadraticCurveTo(-half, -half, -half + r, -half);
      ctx.closePath();
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // emoji
    const emojiSize = this.level >= 5 ? 26 : 22;
    ctx.font = `${emojiSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(data.emoji, 0, 1);

    ctx.restore();
  }
}
