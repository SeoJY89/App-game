class UI {
  constructor() {
    this.titleBounce = 0;
    this.answerText = '';
    this.answerFlash = 0;
    this.answerCorrect = false;
    this.answerWrong = false;
    this.clearAnim = 0;
    this.showClear = false;
  }

  update(dt) {
    this.titleBounce += dt * 2;
    if (this.answerFlash > 0) this.answerFlash -= dt * 3;
    if (this.showClear) this.clearAnim = Math.min(this.clearAnim + dt * 2, 1);
  }

  drawHeader(ctx, stageData) {
    const w = CONFIG.CANVAS.WIDTH;

    // header bg
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(0, 0, w, CONFIG.LAYOUT.headerH);

    // stage number
    ctx.font = 'bold 13px Nunito, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillStyle = CONFIG.COLORS.accent;
    ctx.fillText(`STAGE ${stageData.id}`, 16, 22);

    // title
    ctx.font = 'bold 18px Nunito, sans-serif';
    ctx.fillStyle = CONFIG.COLORS.text;
    ctx.fillText(stageData.title, 16, 44);

    // description
    ctx.font = '12px Nunito, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillStyle = CONFIG.COLORS.textDim;
    ctx.fillText(stageData.desc, w - 16, 44);
  }

  drawAnswerInput(ctx, questionVisible) {
    if (!questionVisible) return;

    const w = CONFIG.CANVAS.WIDTH;
    const y = CONFIG.LAYOUT.answerY;

    // answer box
    const boxW = 140;
    const boxH = 36;
    const bx = w / 2 - boxW / 2;

    let borderColor = 'rgba(255,255,255,0.3)';
    if (this.answerCorrect && this.answerFlash > 0) borderColor = CONFIG.COLORS.correct;
    if (this.answerWrong && this.answerFlash > 0) borderColor = CONFIG.COLORS.wrong;

    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2;
    this._roundRect(ctx, bx, y - boxH / 2, boxW, boxH, 10);
    ctx.fill();
    ctx.stroke();

    // answer text
    ctx.font = 'bold 22px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = this.answerText ? CONFIG.COLORS.white : 'rgba(255,255,255,0.3)';
    ctx.fillText(this.answerText || '???', w / 2, y);
    ctx.textBaseline = 'alphabetic';
  }

  drawKeypad(ctx) {
    const L = CONFIG.LAYOUT;
    const w = CONFIG.CANVAS.WIDTH;
    const keys = [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      ['←', '0', '✓']
    ];
    const cw = L.keypadCellW;
    const ch = L.keypadCellH;
    const gap = L.keypadGap;
    const totalW = 3 * cw + 2 * gap;
    const startX = w / 2 - totalW / 2;

    const rects = [];

    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 3; c++) {
        const key = keys[r][c];
        const x = startX + c * (cw + gap);
        const y = L.keypadTop + r * (ch + gap);

        let bgColor = CONFIG.COLORS.keypad;
        if (key === '✓') bgColor = CONFIG.COLORS.correct;
        if (key === '←') bgColor = CONFIG.COLORS.accent;

        ctx.fillStyle = bgColor;
        this._roundRect(ctx, x, y, cw, ch, 10);
        ctx.fill();

        ctx.font = key === '✓' || key === '←' ? 'bold 18px sans-serif' : 'bold 20px Nunito, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = CONFIG.COLORS.white;
        ctx.fillText(key, x + cw / 2, y + ch / 2);
        ctx.textBaseline = 'alphabetic';

        rects.push({ key, x, y, w: cw, h: ch });
      }
    }
    return rects;
  }

  hitKeypad(px, py, keyRects) {
    for (const k of keyRects) {
      if (px >= k.x && px <= k.x + k.w && py >= k.y && py <= k.y + k.h) {
        return k.key;
      }
    }
    return null;
  }

  drawMenu(ctx, w, h, maxStage) {
    const bounce = Math.sin(this.titleBounce) * 6;

    // title
    ctx.save();
    ctx.translate(w / 2, h * 0.22 + bounce);
    ctx.font = 'bold 42px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 6;
    ctx.strokeText('HINT ROOM', 0, 0);
    ctx.fillStyle = CONFIG.COLORS.accent;
    ctx.fillText('HINT ROOM', 0, 0);
    ctx.restore();

    ctx.font = '16px Nunito, sans-serif';
    ctx.fillStyle = CONFIG.COLORS.textDim;
    ctx.textAlign = 'center';
    ctx.fillText('힌트 룸', w / 2, h * 0.22 + bounce + 30);

    // decorative emojis
    const emojis = ['🔍', '💡', '🧩', '🔑', '🧠', '⭐'];
    emojis.forEach((e, i) => {
      const angle = this.titleBounce * 0.5 + i * (Math.PI * 2 / emojis.length);
      const ex = w / 2 + Math.cos(angle) * 100;
      const ey = h * 0.42 + Math.sin(angle) * 60;
      ctx.font = '28px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(e, ex, ey);
    });

    // description
    ctx.font = '14px Nunito, sans-serif';
    ctx.fillStyle = CONFIG.COLORS.text;
    ctx.textAlign = 'center';
    ctx.fillText('물체를 올바른 위치에 놓아 힌트를 찾고', w / 2, h * 0.58);
    ctx.fillText('논리적으로 문제를 풀어보세요!', w / 2, h * 0.62);

    // play button
    const btnW = 200;
    const btnH = 50;
    const btnX = w / 2 - btnW / 2;
    const btnY = h * 0.72;

    ctx.fillStyle = CONFIG.COLORS.accent;
    ctx.shadowColor = CONFIG.COLORS.accentGlow;
    ctx.shadowBlur = 15;
    this._roundRect(ctx, btnX, btnY, btnW, btnH, 25);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.font = 'bold 20px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = CONFIG.COLORS.white;
    const btnText = maxStage > 1 ? `이어서 하기 (Stage ${maxStage})` : '게임 시작';
    ctx.fillText(btnText, w / 2, btnY + btnH / 2);
    ctx.textBaseline = 'alphabetic';

    // progress
    if (maxStage > 1) {
      ctx.font = '12px Nunito, sans-serif';
      ctx.fillStyle = CONFIG.COLORS.textDim;
      ctx.fillText(`진행: ${maxStage - 1} / ${CONFIG.STAGES.length} 클리어`, w / 2, btnY + btnH + 25);
    }

    return { btn: { x: btnX, y: btnY, w: btnW, h: btnH } };
  }

  drawStageClear(ctx, w, h, stageId) {
    if (!this.showClear) return null;

    const a = Math.min(this.clearAnim, 1);
    ctx.fillStyle = `rgba(0,0,0,${0.6 * a})`;
    ctx.fillRect(0, 0, w, h);

    const scale = 0.5 + a * 0.5;
    ctx.save();
    ctx.translate(w / 2, h * 0.35);
    ctx.scale(scale, scale);
    ctx.globalAlpha = a;

    ctx.font = 'bold 40px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = CONFIG.COLORS.gold;
    ctx.fillText('⭐ STAGE CLEAR! ⭐', 0, 0);

    ctx.font = '20px Nunito, sans-serif';
    ctx.fillStyle = CONFIG.COLORS.text;
    ctx.fillText(`Stage ${stageId} 클리어!`, 0, 45);

    ctx.restore();

    if (a >= 1) {
      const isLast = stageId >= CONFIG.STAGES.length;
      const btnW = 180;
      const btnH = 48;
      const btnX = w / 2 - btnW / 2;
      const btnY = h * 0.55;

      ctx.fillStyle = CONFIG.COLORS.accent;
      this._roundRect(ctx, btnX, btnY, btnW, btnH, 24);
      ctx.fill();

      ctx.font = 'bold 18px Nunito, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = CONFIG.COLORS.white;
      ctx.fillText(isLast ? '🎉 축하합니다!' : '다음 스테이지 →', w / 2, btnY + btnH / 2);
      ctx.textBaseline = 'alphabetic';

      if (isLast) {
        ctx.font = '14px Nunito, sans-serif';
        ctx.fillStyle = CONFIG.COLORS.textDim;
        ctx.fillText('모든 스테이지를 클리어했습니다!', w / 2, btnY + btnH + 30);

        // menu button
        const menuBtnY = btnY + btnH + 50;
        ctx.fillStyle = CONFIG.COLORS.keypad;
        this._roundRect(ctx, btnX, menuBtnY, btnW, btnH, 24);
        ctx.fill();
        ctx.font = 'bold 16px Nunito, sans-serif';
        ctx.fillStyle = CONFIG.COLORS.white;
        ctx.textBaseline = 'middle';
        ctx.fillText('메뉴로', w / 2, menuBtnY + btnH / 2);
        ctx.textBaseline = 'alphabetic';

        return {
          nextBtn: null,
          menuBtn: { x: btnX, y: menuBtnY, w: btnW, h: btnH }
        };
      }

      return { nextBtn: { x: btnX, y: btnY, w: btnW, h: btnH } };
    }
    return null;
  }

  drawAllClear(ctx, w, h) {
    // already handled in drawStageClear for last stage
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
