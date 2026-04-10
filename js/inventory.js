class Inventory {
  constructor() {
    this.items = [];
    this.selected = null;
    this.slotRects = [];
  }

  add(item) {
    this.items.push(item);
  }

  remove(id) {
    const idx = this.items.findIndex(i => i.id === id);
    if (idx >= 0) this.items.splice(idx, 1);
    if (this.selected === id) this.selected = null;
  }

  has(id) {
    return this.items.some(i => i.id === id);
  }

  clear() {
    this.items = [];
    this.selected = null;
  }

  toggleSelect(id) {
    this.selected = this.selected === id ? null : id;
  }

  draw(ctx) {
    const w = CONFIG.CANVAS.WIDTH;
    const L = CONFIG.LAYOUT;
    const y = L.inventoryTop;
    const h = L.inventoryH;

    // background
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(0, y, w, h);
    ctx.strokeStyle = 'rgba(212,149,106,0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();

    // label
    ctx.font = 'bold 10px Nunito, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillStyle = CONFIG.COLORS.textDim;
    ctx.fillText('인벤토리', 14, y + 14);

    // slots
    const slotSize = 54;
    const gap = 8;
    const startX = 14;
    const slotY = y + 20;

    this.slotRects = [];
    const maxSlots = 6;

    for (let i = 0; i < maxSlots; i++) {
      const sx = startX + i * (slotSize + gap);
      const item = this.items[i];
      const isSelected = item && item.id === this.selected;

      ctx.fillStyle = isSelected ? CONFIG.COLORS.inventorySlotActive : CONFIG.COLORS.inventorySlot;
      ctx.strokeStyle = isSelected ? CONFIG.COLORS.accent : 'rgba(255,255,255,0.1)';
      ctx.lineWidth = isSelected ? 2 : 1;
      this._roundRect(ctx, sx, slotY, slotSize, slotSize, 8);
      ctx.fill();
      ctx.stroke();

      if (item) {
        ctx.font = '28px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.icon, sx + slotSize / 2, slotY + slotSize / 2);
        ctx.textBaseline = 'alphabetic';

        this.slotRects.push({ id: item.id, x: sx, y: slotY, w: slotSize, h: slotSize });
      }
    }

    // show selected item name
    if (this.selected) {
      const item = this.items.find(i => i.id === this.selected);
      if (item) {
        ctx.font = 'bold 11px Nunito, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillStyle = CONFIG.COLORS.accent;
        ctx.fillText(item.label + ' (선택됨)', w - 14, y + 14);
      }
    }
  }

  hitTest(x, y) {
    for (const r of this.slotRects) {
      if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) {
        return r.id;
      }
    }
    return null;
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
}
