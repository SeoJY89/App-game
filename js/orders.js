class Order {
  constructor(chain, level, count, starReward) {
    this.chain = chain;
    this.level = level;
    this.count = count;
    this.fulfilled = 0;
    this.starReward = starReward;
    this.completed = false;
    this.animTimer = 0;
  }

  getData() {
    return CONFIG.CHAINS[this.chain].items[this.level - 1];
  }

  getColor() {
    return CONFIG.COLORS.chainColors[this.chain][this.level - 1];
  }

  tryDeliver(item) {
    if (this.completed) return false;
    if (item.chain === this.chain && item.level === this.level && this.fulfilled < this.count) {
      this.fulfilled++;
      if (this.fulfilled >= this.count) {
        this.completed = true;
        this.animTimer = 0;
      }
      return true;
    }
    return false;
  }
}

class OrderManager {
  constructor() {
    this.orders = [];
    this.stars = 0;
    this.completedCount = 0;
    this.starPopups = [];
  }

  init() {
    while (this.orders.length < CONFIG.ORDERS.maxActive) {
      this.orders.push(this._generate());
    }
  }

  _generate() {
    const diff = CONFIG.ORDERS.difficultyTable;
    const idx = Math.min(this.completedCount, diff.length - 1);
    const d = diff[idx];

    const chainKey = CONFIG.CHAIN_ORDER[Math.floor(Math.random() * CONFIG.CHAIN_ORDER.length)];
    const level = 1 + Math.floor(Math.random() * d.maxLevel);
    const count = 1 + Math.floor(Math.random() * d.maxCount);
    const starReward = CONFIG.ORDERS.starRewards[Math.min(level - 1, CONFIG.ORDERS.starRewards.length - 1)];

    return new Order(chainKey, level, count, starReward);
  }

  tryDeliver(item) {
    for (const order of this.orders) {
      if (order.tryDeliver(item)) {
        return order;
      }
    }
    return null;
  }

  collectCompleted(particles, audio) {
    let collected = false;
    for (let i = 0; i < this.orders.length; i++) {
      const order = this.orders[i];
      if (order.completed && order.animTimer > 0.5) {
        this.stars += order.starReward;
        this.completedCount++;
        this.starPopups.push({
          text: `+${order.starReward}`,
          x: CONFIG.CANVAS.WIDTH / 2,
          y: 50,
          timer: 0
        });
        audio.playDeliver();
        particles.emitDeliver(CONFIG.CANVAS.WIDTH / 2, 50);
        this.orders[i] = this._generate();
        collected = true;
      }
    }
    return collected;
  }

  update(dt) {
    for (const order of this.orders) {
      if (order.completed) order.animTimer += dt;
    }
    for (let i = this.starPopups.length - 1; i >= 0; i--) {
      this.starPopups[i].timer += dt;
      this.starPopups[i].y -= 25 * dt;
      if (this.starPopups[i].timer > 1) this.starPopups.splice(i, 1);
    }
  }

  draw(ctx) {
    const w = CONFIG.CANVAS.WIDTH;
    const panelY = 90;
    const cardW = 160;
    const cardH = 60;
    const gap = 12;
    const startX = w / 2 - cardW - gap / 2;

    // panel label
    ctx.font = 'bold 13px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = CONFIG.COLORS.textLight;
    ctx.fillText('ORDERS', w / 2, panelY - 6);

    for (let i = 0; i < this.orders.length; i++) {
      const order = this.orders[i];
      const x = startX + i * (cardW + gap);
      const y = panelY;
      const data = order.getData();
      const color = order.getColor();

      // card bg
      ctx.fillStyle = order.completed ? '#E8FFE8' : CONFIG.COLORS.white;
      ctx.strokeStyle = order.completed ? '#7ED6A8' : CONFIG.COLORS.cellBorder;
      ctx.lineWidth = order.completed ? 2 : 1;
      this._roundRect(ctx, x, y, cardW, cardH, 12);
      ctx.fill();
      ctx.stroke();

      // emoji + count
      ctx.font = '22px sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(data.emoji, x + 12, y + cardH / 2);

      ctx.font = 'bold 16px Nunito, sans-serif';
      ctx.fillStyle = CONFIG.COLORS.text;
      ctx.fillText(`x${order.count}`, x + 42, y + cardH / 2 - 8);

      // progress
      ctx.font = '12px Nunito, sans-serif';
      ctx.fillStyle = order.completed ? '#4CAF50' : CONFIG.COLORS.textLight;
      ctx.fillText(`${order.fulfilled}/${order.count}`, x + 42, y + cardH / 2 + 10);

      // star reward
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`⭐${order.starReward}`, x + cardW - 10, y + cardH / 2);

      // progress bar
      const barX = x + 42;
      const barY = y + cardH - 10;
      const barW = cardW - 60;
      const barH = 4;
      ctx.fillStyle = CONFIG.COLORS.energyBg;
      this._roundRect(ctx, barX, barY, barW, barH, 2);
      ctx.fill();
      const progress = order.count > 0 ? order.fulfilled / order.count : 0;
      ctx.fillStyle = order.completed ? '#4CAF50' : CONFIG.COLORS.energyBar;
      this._roundRect(ctx, barX, barY, barW * progress, barH, 2);
      ctx.fill();
    }

    // star popups
    for (const sp of this.starPopups) {
      const alpha = Math.max(0, 1 - sp.timer);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = 'bold 22px Nunito, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = CONFIG.COLORS.accent;
      ctx.strokeStyle = CONFIG.COLORS.white;
      ctx.lineWidth = 3;
      ctx.strokeText(`⭐ ${sp.text}`, sp.x, sp.y);
      ctx.fillText(`⭐ ${sp.text}`, sp.x, sp.y);
      ctx.restore();
    }
  }

  _roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  serialize() {
    return {
      stars: this.stars,
      completedCount: this.completedCount,
      orders: this.orders.map(o => ({
        chain: o.chain, level: o.level, count: o.count,
        fulfilled: o.fulfilled, starReward: o.starReward, completed: o.completed
      }))
    };
  }

  deserialize(data) {
    if (!data) return;
    this.stars = data.stars || 0;
    this.completedCount = data.completedCount || 0;
    this.orders = (data.orders || []).map(d => {
      const o = new Order(d.chain, d.level, d.count, d.starReward);
      o.fulfilled = d.fulfilled || 0;
      o.completed = d.completed || false;
      return o;
    });
    while (this.orders.length < CONFIG.ORDERS.maxActive) {
      this.orders.push(this._generate());
    }
  }
}
