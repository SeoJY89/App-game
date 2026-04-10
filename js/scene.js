class Scene {
  constructor(stageData) {
    this.data = stageData;
    this.hotspots = stageData.hotspots;
    this.pulsePhase = 0;
    this.hoveredHotspot = null;
  }

  update(dt) {
    this.pulsePhase += dt * 2;
  }

  draw(ctx) {
    const w = CONFIG.CANVAS.WIDTH;
    const L = CONFIG.LAYOUT;
    const sceneTop = L.headerH;
    const sceneH = L.sceneBottom - sceneTop;

    // Scene background - dark room with gradient
    const grad = ctx.createLinearGradient(0, sceneTop, 0, L.sceneBottom);
    grad.addColorStop(0, this.data.bgTop);
    grad.addColorStop(1, this.data.bgBottom);
    ctx.fillStyle = grad;
    ctx.fillRect(0, sceneTop, w, sceneH);

    // Subtle grid/wall texture
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    for (let y = sceneTop; y < L.sceneBottom; y += 20) {
      ctx.fillRect(0, y, w, 1);
    }

    // Floor line
    const floorY = sceneTop + sceneH * 0.82;
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, floorY);
    ctx.lineTo(w, floorY);
    ctx.stroke();

    // Vignette effect
    const vignette = ctx.createRadialGradient(
      w / 2, sceneTop + sceneH / 2, 50,
      w / 2, sceneTop + sceneH / 2, sceneH * 0.7
    );
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(0,0,0,0.5)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, sceneTop, w, sceneH);

    // Draw hotspots
    for (const h of this.hotspots) {
      this._drawHotspot(ctx, h, sceneTop, sceneH);
    }
  }

  _drawHotspot(ctx, h, sceneTop, sceneH) {
    const w = CONFIG.CANVAS.WIDTH;
    const cx = h.x * w;
    const cy = sceneTop + h.y * sceneH;
    const size = h.size;
    const half = size / 2;

    const isHover = this.hoveredHotspot === h;
    const pulse = 0.95 + Math.sin(this.pulsePhase + h.x * 10) * 0.05;

    // Glow
    ctx.save();
    ctx.shadowColor = CONFIG.COLORS.accentGlow;
    ctx.shadowBlur = isHover ? 20 : 10;

    // Card background
    ctx.fillStyle = isHover ? CONFIG.COLORS.hotspotHover : CONFIG.COLORS.hotspotBg;
    this._roundRect(ctx, cx - half, cy - half, size, size, 12);
    ctx.fill();

    // Border
    ctx.shadowBlur = 0;
    ctx.strokeStyle = isHover ? CONFIG.COLORS.accent : CONFIG.COLORS.hotspotBorder;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // Icon
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(pulse, pulse);
    ctx.font = `${size * 0.55}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(h.icon, 0, 2);
    ctx.restore();

    // Label
    ctx.font = '11px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = CONFIG.COLORS.textDim;
    ctx.fillText(h.label, cx, cy + half + 4);
    ctx.textBaseline = 'alphabetic';
  }

  hitTest(px, py) {
    const w = CONFIG.CANVAS.WIDTH;
    const L = CONFIG.LAYOUT;
    const sceneTop = L.headerH;
    const sceneH = L.sceneBottom - sceneTop;

    for (const h of this.hotspots) {
      const cx = h.x * w;
      const cy = sceneTop + h.y * sceneH;
      const half = h.size / 2 + 4;
      if (px >= cx - half && px <= cx + half &&
          py >= cy - half && py <= cy + half) {
        return h;
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
