class UI {
  constructor() {
    this.titleBounce = 0;
  }

  update(dt) {
    this.titleBounce += dt * 1.5;
  }

  drawHeader(ctx, puzzle, total) {
    const w = CONFIG.CANVAS.WIDTH;
    const d = puzzle.data;

    ctx.font = 'bold 11px Nunito, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillStyle = CONFIG.COLORS.textDim;
    ctx.fillText(`CHAPTER ${d.chapter} · ${d.id} / ${total}`, 20, 28);

    ctx.font = 'bold 20px Nunito, sans-serif';
    ctx.fillStyle = CONFIG.COLORS.text;
    ctx.fillText(d.title, 20, 52);

    // reset hint text on the right
    ctx.font = '11px Nunito, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillStyle = CONFIG.COLORS.textDim;
    ctx.fillText('시작점에서 드래그 →', w - 20, 40);
  }

  drawFooter(ctx, puzzle) {
    const w = CONFIG.CANVAS.WIDTH;
    const y = CONFIG.LAYOUT.footerTop;

    if (puzzle.completed) {
      ctx.font = 'bold 18px Nunito, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = CONFIG.COLORS.success;
      ctx.fillText('✓ SOLVED', w / 2, y + 20);

      // next button
      const btnW = 180, btnH = 46;
      const bx = w / 2 - btnW / 2;
      const by = y + 40;
      ctx.fillStyle = CONFIG.COLORS.success;
      this._roundRect(ctx, bx, by, btnW, btnH, 23);
      ctx.fill();

      ctx.font = 'bold 16px Nunito, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#0e1820';
      ctx.fillText('다음 →', w / 2, by + btnH / 2);
      ctx.textBaseline = 'alphabetic';

      return { nextBtn: { x: bx, y: by, w: btnW, h: btnH } };
    }

    // reset button
    const btnW = 110, btnH = 36;
    const bx = w - btnW - 20;
    const by = y + 20;
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    this._roundRect(ctx, bx, by, btnW, btnH, 18);
    ctx.fill();
    ctx.stroke();

    ctx.font = '13px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = CONFIG.COLORS.text;
    ctx.fillText('↺ 리셋', bx + btnW / 2, by + btnH / 2);
    ctx.textBaseline = 'alphabetic';

    // menu button
    const mbW = 110, mbH = 36;
    const mx = 20;
    const my = y + 20;
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    this._roundRect(ctx, mx, my, mbW, mbH, 18);
    ctx.fill();
    ctx.stroke();

    ctx.font = '13px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = CONFIG.COLORS.text;
    ctx.fillText('☰ 메뉴', mx + mbW / 2, my + mbH / 2);
    ctx.textBaseline = 'alphabetic';

    return {
      resetBtn: { x: bx, y: by, w: btnW, h: btnH },
      menuBtn: { x: mx, y: my, w: mbW, h: mbH }
    };
  }

  drawMenu(ctx, w, h, progress) {
    const bounce = Math.sin(this.titleBounce) * 4;

    // title
    ctx.save();
    ctx.translate(w / 2, h * 0.25 + bounce);
    ctx.font = 'bold 42px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = CONFIG.COLORS.line;
    ctx.shadowColor = CONFIG.COLORS.lineGlow;
    ctx.shadowBlur = 20;
    ctx.fillText('THE LINE', 0, 0);
    ctx.shadowBlur = 0;

    ctx.font = '14px Nunito, sans-serif';
    ctx.fillStyle = CONFIG.COLORS.textDim;
    ctx.fillText('규칙을 발견하라', 0, 32);
    ctx.restore();

    // sample line drawing
    this._drawSampleLine(ctx, w / 2, h * 0.47);

    // description
    ctx.font = '13px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = CONFIG.COLORS.textDim;
    ctx.fillText('시작점에서 끝점까지 선을 그어', w / 2, h * 0.62);
    ctx.fillText('퍼즐을 풀어보세요', w / 2, h * 0.66);

    ctx.font = 'italic 12px Nunito, sans-serif';
    ctx.fillStyle = 'rgba(245,230,168,0.7)';
    ctx.fillText('※ 규칙은 알려주지 않습니다.', w / 2, h * 0.72);
    ctx.fillText('스스로 관찰하여 발견하세요.', w / 2, h * 0.755);

    // play button
    const btnW = 220, btnH = 52;
    const bx = w / 2 - btnW / 2;
    const by = h * 0.82;

    ctx.fillStyle = CONFIG.COLORS.line;
    ctx.shadowColor = CONFIG.COLORS.lineGlow;
    ctx.shadowBlur = 18;
    this._roundRect(ctx, bx, by, btnW, btnH, 26);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.font = 'bold 18px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#0e1820';
    const label = progress > 1 ? `이어서 (Puzzle ${progress})` : '시작';
    ctx.fillText(label, w / 2, by + btnH / 2);
    ctx.textBaseline = 'alphabetic';

    // progress
    if (progress > 1) {
      ctx.font = '11px Nunito, sans-serif';
      ctx.fillStyle = CONFIG.COLORS.textDim;
      ctx.fillText(`진행: ${progress - 1} / ${CONFIG.PUZZLES.length}`, w / 2, by + btnH + 22);
    }

    return { playBtn: { x: bx, y: by, w: btnW, h: btnH } };
  }

  _drawSampleLine(ctx, cx, cy) {
    const size = 110;
    const gx = cx - size / 2;
    const gy = cy - size / 2;

    // simple 2x2 grid
    ctx.strokeStyle = CONFIG.COLORS.gridLineDim;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    for (let i = 0; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(gx, gy + (size / 2) * i);
      ctx.lineTo(gx + size, gy + (size / 2) * i);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(gx + (size / 2) * i, gy);
      ctx.lineTo(gx + (size / 2) * i, gy + size);
      ctx.stroke();
    }

    // sample path
    ctx.strokeStyle = CONFIG.COLORS.line;
    ctx.shadowColor = CONFIG.COLORS.lineGlow;
    ctx.shadowBlur = 10;
    ctx.lineWidth = 8;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(gx, gy + size);
    ctx.lineTo(gx + size / 2, gy + size);
    ctx.lineTo(gx + size / 2, gy + size / 2);
    ctx.lineTo(gx + size, gy + size / 2);
    ctx.lineTo(gx + size, gy);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // start dot
    ctx.fillStyle = CONFIG.COLORS.line;
    ctx.beginPath();
    ctx.arc(gx, gy + size, 7, 0, Math.PI * 2);
    ctx.fill();
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
