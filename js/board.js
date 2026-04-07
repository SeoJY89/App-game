class Board {
  constructor(audio, particles) {
    this.audio = audio;
    this.particles = particles;
    const g = CONFIG.GRID;
    this.grid = [];
    for (let r = 0; r < g.ROWS; r++) {
      this.grid[r] = new Array(g.COLS).fill(null);
    }
    this.energy = CONFIG.ENERGY.max;
    this.energyTimer = 0;
    this.dragging = null;
    this.dragOffsetX = 0;
    this.dragOffsetY = 0;
    this.dragPointerX = 0;
    this.dragPointerY = 0;
    this.dragStartGX = -1;
    this.dragStartGY = -1;
    this.discovered = new Set();
    this.floatingTexts = [];
    this.mergeAnimations = [];
  }

  getGridPos(px, py) {
    const g = CONFIG.GRID;
    const col = Math.floor((px - g.OFFSET_X) / (g.CELL_SIZE + g.PADDING));
    const row = Math.floor((py - g.OFFSET_Y) / (g.CELL_SIZE + g.PADDING));
    if (col < 0 || col >= g.COLS || row < 0 || row >= g.ROWS) return null;
    return { col, row };
  }

  getScreenPos(col, row) {
    const g = CONFIG.GRID;
    return {
      x: g.OFFSET_X + col * (g.CELL_SIZE + g.PADDING) + g.CELL_SIZE / 2,
      y: g.OFFSET_Y + row * (g.CELL_SIZE + g.PADDING) + g.CELL_SIZE / 2
    };
  }

  findEmpty() {
    const g = CONFIG.GRID;
    const cells = [];
    for (let r = 0; r < g.ROWS; r++) {
      for (let c = 0; c < g.COLS; c++) {
        if (!this.grid[r][c]) cells.push({ col: c, row: r });
      }
    }
    if (cells.length === 0) return null;
    return cells[Math.floor(Math.random() * cells.length)];
  }

  spawnItem(chainKey) {
    if (this.energy < CONFIG.ENERGY.costPerSpawn) return false;
    const empty = this.findEmpty();
    if (!empty) return false;

    this.energy -= CONFIG.ENERGY.costPerSpawn;
    const item = new Item(chainKey, 1, empty.col, empty.row);
    item.startSpawn();
    this.grid[empty.row][empty.col] = item;
    this.discoverItem(item);

    const pos = this.getScreenPos(empty.col, empty.row);
    this.particles.emitSpawn(pos.x, pos.y);
    this.audio.playSpawn();
    return true;
  }

  discoverItem(item) {
    this.discovered.add(`${item.chain}_${item.level}`);
  }

  canMerge(a, b) {
    return a && b && a !== b && a.chain === b.chain && a.level === b.level && a.level < 7;
  }

  merge(draggedItem, targetItem) {
    const newLevel = targetItem.level + 1;
    const gx = targetItem.gridX;
    const gy = targetItem.gridY;

    // remove both from grid
    this.grid[draggedItem.gridY][draggedItem.gridX] = null;
    this.grid[targetItem.gridY][targetItem.gridX] = null;

    // create new item
    const newItem = new Item(targetItem.chain, newLevel, gx, gy);
    newItem.startSpawn();
    this.grid[gy][gx] = newItem;
    this.discoverItem(newItem);

    // effects
    const pos = this.getScreenPos(gx, gy);
    const color = newItem.getColor();
    this.particles.emitMerge(pos.x, pos.y, color);
    this.audio.playMerge(newLevel);

    // floating text
    const data = newItem.getData();
    this.floatingTexts.push({
      text: `${data.emoji} Lv${newLevel}!`,
      x: pos.x, y: pos.y - 20,
      timer: 0, duration: 0.8
    });

    return newItem;
  }

  handlePointerDown(px, py) {
    // check generator taps
    const genY = CONFIG.GENERATORS.y;
    const genR = CONFIG.GENERATORS.radius;
    const cw = CONFIG.CANVAS.WIDTH;
    const gap = CONFIG.GENERATORS.gap;
    const startX = cw / 2 - gap;

    for (let i = 0; i < 3; i++) {
      const gx = startX + i * gap;
      const dx = px - gx;
      const dy = py - genY;
      if (dx * dx + dy * dy <= (genR + 8) * (genR + 8)) {
        this.spawnItem(CONFIG.CHAIN_ORDER[i]);
        return 'generator';
      }
    }

    // check grid item
    const gp = this.getGridPos(px, py);
    if (!gp) return null;
    const item = this.grid[gp.row][gp.col];
    if (!item || item.removing) return null;

    this.dragging = item;
    this.dragStartGX = gp.col;
    this.dragStartGY = gp.row;
    this.dragPointerX = px;
    this.dragPointerY = py;
    this.dragOffsetX = px - item.drawX;
    this.dragOffsetY = py - item.drawY;
    item.targetScale = 1.15;
    return 'item';
  }

  handlePointerMove(px, py) {
    if (!this.dragging) return;
    this.dragPointerX = px;
    this.dragPointerY = py;
  }

  handlePointerUp(px, py) {
    if (!this.dragging) return null;
    const item = this.dragging;
    item.targetScale = 1;
    this.dragging = null;

    const gp = this.getGridPos(px, py);
    if (!gp) {
      // return to original position
      item.setGridPos(this.dragStartGX, this.dragStartGY);
      return null;
    }

    const target = this.grid[gp.row][gp.col];

    if (this.canMerge(item, target)) {
      const newItem = this.merge(item, target);
      return { type: 'merge', item: newItem };
    }

    if (!target && (gp.col !== this.dragStartGX || gp.row !== this.dragStartGY)) {
      // move to empty cell
      this.grid[this.dragStartGY][this.dragStartGX] = null;
      this.grid[gp.row][gp.col] = item;
      item.setGridPos(gp.col, gp.row);
      this.audio.playDrop();
      return { type: 'move' };
    }

    // return to original
    item.setGridPos(this.dragStartGX, this.dragStartGY);
    return null;
  }

  getItemAt(px, py) {
    const gp = this.getGridPos(px, py);
    if (!gp) return null;
    return this.grid[gp.row][gp.col];
  }

  removeItem(item) {
    if (this.grid[item.gridY] && this.grid[item.gridY][item.gridX] === item) {
      this.grid[item.gridY][item.gridX] = null;
    }
  }

  update(dt) {
    // energy recharge
    if (this.energy < CONFIG.ENERGY.max) {
      this.energyTimer += dt * 1000;
      if (this.energyTimer >= CONFIG.ENERGY.rechargeTime) {
        this.energyTimer -= CONFIG.ENERGY.rechargeTime;
        this.energy = Math.min(this.energy + 1, CONFIG.ENERGY.max);
      }
    }

    // update items
    const g = CONFIG.GRID;
    for (let r = 0; r < g.ROWS; r++) {
      for (let c = 0; c < g.COLS; c++) {
        const item = this.grid[r][c];
        if (item) item.update(dt);
      }
    }

    // update floating texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.timer += dt;
      ft.y -= 30 * dt;
      if (ft.timer >= ft.duration) this.floatingTexts.splice(i, 1);
    }
  }

  draw(ctx) {
    const g = CONFIG.GRID;

    // draw grid background
    for (let r = 0; r < g.ROWS; r++) {
      for (let c = 0; c < g.COLS; c++) {
        const x = g.OFFSET_X + c * (g.CELL_SIZE + g.PADDING);
        const y = g.OFFSET_Y + r * (g.CELL_SIZE + g.PADDING);
        ctx.fillStyle = CONFIG.COLORS.cellBg;
        ctx.strokeStyle = CONFIG.COLORS.cellBorder;
        ctx.lineWidth = 1;
        this._roundRect(ctx, x, y, g.CELL_SIZE, g.CELL_SIZE, g.RADIUS);
        ctx.fill();
        ctx.stroke();
      }
    }

    // draw items (skip dragging item)
    for (let r = 0; r < g.ROWS; r++) {
      for (let c = 0; c < g.COLS; c++) {
        const item = this.grid[r][c];
        if (item && item !== this.dragging) item.draw(ctx);
      }
    }

    // draw dragging item on top
    if (this.dragging) {
      const dx = this.dragPointerX - this.dragOffsetX;
      const dy = this.dragPointerY - this.dragOffsetY;
      this.dragging.draw(ctx, dx, dy);

      // highlight target cell
      const gp = this.getGridPos(this.dragPointerX, this.dragPointerY);
      if (gp) {
        const target = this.grid[gp.row][gp.col];
        if (this.canMerge(this.dragging, target)) {
          const hx = g.OFFSET_X + gp.col * (g.CELL_SIZE + g.PADDING);
          const hy = g.OFFSET_Y + gp.row * (g.CELL_SIZE + g.PADDING);
          ctx.strokeStyle = CONFIG.COLORS.accent;
          ctx.lineWidth = 2.5;
          this._roundRect(ctx, hx - 1, hy - 1, g.CELL_SIZE + 2, g.CELL_SIZE + 2, g.RADIUS + 1);
          ctx.stroke();
        }
      }
    }

    // draw generators
    this._drawGenerators(ctx);

    // draw floating texts
    for (const ft of this.floatingTexts) {
      const alpha = Math.max(0, 1 - ft.timer / ft.duration);
      const scale = 1 + ft.timer * 0.4;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(ft.x, ft.y);
      ctx.scale(scale, scale);
      ctx.font = 'bold 18px Nunito, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.strokeStyle = CONFIG.COLORS.white;
      ctx.lineWidth = 3;
      ctx.strokeText(ft.text, 0, 0);
      ctx.fillStyle = CONFIG.COLORS.accent;
      ctx.fillText(ft.text, 0, 0);
      ctx.restore();
    }
  }

  _drawGenerators(ctx) {
    const genY = CONFIG.GENERATORS.y;
    const genR = CONFIG.GENERATORS.radius;
    const cw = CONFIG.CANVAS.WIDTH;
    const gap = CONFIG.GENERATORS.gap;
    const startX = cw / 2 - gap;

    for (let i = 0; i < 3; i++) {
      const chainKey = CONFIG.CHAIN_ORDER[i];
      const chain = CONFIG.CHAINS[chainKey];
      const x = startX + i * gap;
      const hasEnergy = this.energy >= CONFIG.ENERGY.costPerSpawn;

      // button bg
      ctx.fillStyle = hasEnergy ? CONFIG.COLORS.chainColors[chainKey][0] : '#E0E0E0';
      ctx.shadowColor = 'rgba(0,0,0,0.1)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetY = 2;
      ctx.beginPath();
      ctx.arc(x, genY, genR, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // border
      ctx.strokeStyle = hasEnergy ? CONFIG.COLORS.chainColors[chainKey][2] : '#C0C0C0';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, genY, genR, 0, Math.PI * 2);
      ctx.stroke();

      // emoji
      ctx.globalAlpha = hasEnergy ? 1 : 0.5;
      ctx.font = '22px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(chain.items[0].emoji, x, genY + 1);
      ctx.globalAlpha = 1;

      // label
      ctx.font = '10px Nunito, sans-serif';
      ctx.fillStyle = CONFIG.COLORS.textLight;
      ctx.fillText(chain.name, x, genY + genR + 14);
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
    const g = CONFIG.GRID;
    const items = [];
    for (let r = 0; r < g.ROWS; r++) {
      for (let c = 0; c < g.COLS; c++) {
        const item = this.grid[r][c];
        if (item) items.push({ chain: item.chain, level: item.level, col: c, row: r });
      }
    }
    return {
      items,
      energy: this.energy,
      discovered: Array.from(this.discovered)
    };
  }

  deserialize(data) {
    if (!data) return;
    const g = CONFIG.GRID;
    for (let r = 0; r < g.ROWS; r++) this.grid[r].fill(null);

    for (const d of data.items) {
      const item = new Item(d.chain, d.level, d.col, d.row);
      item.scale = 1;
      item.spawning = false;
      this.grid[d.row][d.col] = item;
    }
    this.energy = data.energy !== undefined ? data.energy : CONFIG.ENERGY.max;
    this.discovered = new Set(data.discovered || []);
  }
}
