class UI {
  constructor() {
    this.titleBounce = 0;
  }

  update(dt) {
    this.titleBounce += dt * 1.5;
  }

  drawHeader(ctx, stageData, stageNum, total) {
    const w = CONFIG.CANVAS.WIDTH;
    const h = CONFIG.LAYOUT.headerH;

    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(212,149,106,0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(w, h);
    ctx.stroke();

    ctx.font = 'bold 11px Nunito, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillStyle = CONFIG.COLORS.accent;
    ctx.fillText(`ROOM ${stageNum} / ${total}`, 16, 20);

    ctx.font = 'bold 17px Nunito, sans-serif';
    ctx.fillStyle = CONFIG.COLORS.text;
    ctx.fillText(stageData.title, 16, 40);

    // menu button
    const mbW = 50, mbH = 28;
    const mbX = w - mbW - 12;
    const mbY = 12;
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    this._roundRect(ctx, mbX, mbY, mbW, mbH, 14);
    ctx.fill();
    ctx.stroke();
    ctx.font = '11px Nunito, sans-serif';
    ctx.fillStyle = CONFIG.COLORS.text;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('메뉴', mbX + mbW / 2, mbY + mbH / 2);
    ctx.textBaseline = 'alphabetic';

    return { menuBtn: { x: mbX, y: mbY, w: mbW, h: mbH } };
  }

  drawMenu(ctx, w, h, progress) {
    const bounce = Math.sin(this.titleBounce) * 4;

    // title
    ctx.save();
    ctx.translate(w / 2, h * 0.22 + bounce);
    ctx.font = 'bold 46px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = CONFIG.COLORS.accentGlow;
    ctx.shadowBlur = 20;
    ctx.fillStyle = CONFIG.COLORS.accent;
    ctx.fillText('ESCAPE', 0, 0);
    ctx.font = 'bold 28px Nunito, sans-serif';
    ctx.fillText('방탈출', 0, 38);
    ctx.shadowBlur = 0;
    ctx.restore();

    // decorative items
    const emojis = ['🗝️', '🔒', '📜', '🕯️', '🔮', '💀'];
    emojis.forEach((e, i) => {
      const a = this.titleBounce * 0.4 + i * (Math.PI * 2 / emojis.length);
      const ex = w / 2 + Math.cos(a) * 110;
      const ey = h * 0.5 + Math.sin(a) * 60;
      ctx.font = '32px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(e, ex, ey);
    });

    // description
    ctx.font = '13px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = CONFIG.COLORS.textDim;
    ctx.fillText('방 안의 물건을 조사하고', w / 2, h * 0.66);
    ctx.fillText('단서를 조합하여 탈출하라', w / 2, h * 0.70);

    // play button
    const btnW = 220, btnH = 54;
    const bx = w / 2 - btnW / 2;
    const by = h * 0.78;

    ctx.fillStyle = CONFIG.COLORS.accent;
    ctx.shadowColor = CONFIG.COLORS.accentGlow;
    ctx.shadowBlur = 18;
    this._roundRect(ctx, bx, by, btnW, btnH, 27);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.font = 'bold 18px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#0f0518';
    const label = progress > 1 ? `이어서 (Room ${progress})` : '시작';
    ctx.fillText(label, w / 2, by + btnH / 2);
    ctx.textBaseline = 'alphabetic';

    if (progress > 1) {
      ctx.font = '11px Nunito, sans-serif';
      ctx.fillStyle = CONFIG.COLORS.textDim;
      ctx.textAlign = 'center';
      ctx.fillText(`진행: ${progress - 1} / ${CONFIG.STAGES.length} 탈출`, w / 2, by + btnH + 22);
    }

    return { playBtn: { x: bx, y: by, w: btnW, h: btnH } };
  }

  drawStageComplete(ctx, w, h, stageNum, isLast) {
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.translate(w / 2, h * 0.35);
    ctx.font = 'bold 38px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = CONFIG.COLORS.accentGlow;
    ctx.shadowBlur = 20;
    ctx.fillStyle = CONFIG.COLORS.success;
    ctx.fillText('ESCAPED!', 0, 0);
    ctx.shadowBlur = 0;
    ctx.font = 'bold 18px Nunito, sans-serif';
    ctx.fillStyle = CONFIG.COLORS.text;
    ctx.fillText(`Room ${stageNum} 클리어`, 0, 42);
    ctx.restore();

    // next button
    const btnW = 200, btnH = 50;
    const bx = w / 2 - btnW / 2;
    const by = h * 0.55;

    ctx.fillStyle = CONFIG.COLORS.accent;
    this._roundRect(ctx, bx, by, btnW, btnH, 25);
    ctx.fill();

    ctx.font = 'bold 17px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#0f0518';
    ctx.fillText(isLast ? '메뉴로' : '다음 방 →', w / 2, by + btnH / 2);
    ctx.textBaseline = 'alphabetic';

    return { nextBtn: { x: bx, y: by, w: btnW, h: btnH } };
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
