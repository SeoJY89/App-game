class PopupManager {
  constructor(audio) {
    this.audio = audio;
    this.current = null;
    this.keypadInput = '';
    this.keypadShake = 0;
    this.keypadRects = [];
    this.closeRect = null;
    this.anim = 0;
    this.messageText = '';
    this.messageCallback = null;
  }

  showMessage(text, callback = null) {
    this.current = { type: 'message', text };
    this.messageCallback = callback;
    this.anim = 0;
  }

  showPopup(popup, onCorrect = null) {
    this.current = { ...popup, onCorrect };
    this.keypadInput = '';
    this.anim = 0;
  }

  close() {
    const cb = this.messageCallback;
    this.current = null;
    this.messageCallback = null;
    if (cb) cb();
  }

  isOpen() {
    return this.current !== null;
  }

  update(dt) {
    if (this.current) this.anim = Math.min(this.anim + dt * 5, 1);
    if (this.keypadShake > 0) this.keypadShake -= dt * 4;
  }

  draw(ctx) {
    if (!this.current) return;

    const w = CONFIG.CANVAS.WIDTH;
    const h = CONFIG.CANVAS.HEIGHT;

    // overlay
    ctx.fillStyle = `rgba(0,0,0,${0.7 * this.anim})`;
    ctx.fillRect(0, 0, w, h);

    // panel
    const panelW = 330;
    const panelH = this._getPanelHeight();
    const px = w / 2 - panelW / 2;
    const py = h / 2 - panelH / 2;

    ctx.save();
    const scale = 0.85 + this.anim * 0.15;
    ctx.translate(px + panelW / 2, py + panelH / 2);
    ctx.scale(scale, scale);
    ctx.translate(-(px + panelW / 2), -(py + panelH / 2));

    // shake
    const shakeX = this.keypadShake > 0 ? Math.sin(this.keypadShake * 30) * 6 : 0;
    ctx.translate(shakeX, 0);

    ctx.fillStyle = CONFIG.COLORS.panel;
    ctx.strokeStyle = CONFIG.COLORS.panelBorder;
    ctx.lineWidth = 2;
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 20;
    this._roundRect(ctx, px, py, panelW, panelH, 16);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    if (this.current.type === 'message') {
      this._drawMessage(ctx, px, py, panelW, panelH);
    } else if (this.current.type === 'info') {
      this._drawInfo(ctx, px, py, panelW, panelH);
    } else if (this.current.type === 'keypad') {
      this._drawKeypad(ctx, px, py, panelW, panelH);
    } else if (this.current.type === 'books') {
      this._drawBooks(ctx, px, py, panelW, panelH);
    }

    ctx.restore();
  }

  _getPanelHeight() {
    if (!this.current) return 0;
    if (this.current.type === 'message') return 220;
    if (this.current.type === 'info') return 260;
    if (this.current.type === 'keypad') return 420;
    if (this.current.type === 'books') return 350;
    return 200;
  }

  _drawMessage(ctx, px, py, w, h) {
    ctx.font = '15px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = CONFIG.COLORS.text;
    const lines = this.current.text.split('\n');
    const lineH = 22;
    const startY = py + h / 2 - (lines.length * lineH) / 2 + 8;
    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], px + w / 2, startY + i * lineH);
    }

    this._drawCloseButton(ctx, px + w / 2, py + h - 36, '확인');
  }

  _drawInfo(ctx, px, py, w, h) {
    ctx.font = 'bold 16px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = CONFIG.COLORS.accent;
    ctx.fillText(this.current.title || '', px + w / 2, py + 30);

    ctx.font = '14px Nunito, sans-serif';
    ctx.fillStyle = CONFIG.COLORS.text;
    const lines = this.current.text.split('\n');
    const lineH = 20;
    const startY = py + h / 2 - (lines.length * lineH) / 2 + 10;
    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], px + w / 2, startY + i * lineH);
    }

    this._drawCloseButton(ctx, px + w / 2, py + h - 36, '닫기');
  }

  _drawKeypad(ctx, px, py, w, h) {
    ctx.font = 'bold 16px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = CONFIG.COLORS.accent;
    ctx.fillText(this.current.title || '코드 입력', px + w / 2, py + 30);

    // hint
    if (this.current.hint) {
      ctx.font = '12px Nunito, sans-serif';
      ctx.fillStyle = CONFIG.COLORS.textHint;
      ctx.fillText('힌트: ' + this.current.hint, px + w / 2, py + 52);
    }

    // input display
    const len = this.current.length || 4;
    const slotW = 40;
    const slotGap = 10;
    const totalW = len * slotW + (len - 1) * slotGap;
    const startX = px + w / 2 - totalW / 2;
    const inputY = py + 75;

    for (let i = 0; i < len; i++) {
      const sx = startX + i * (slotW + slotGap);
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.strokeStyle = i < this.keypadInput.length ? CONFIG.COLORS.accent : CONFIG.COLORS.hotspotBorder;
      ctx.lineWidth = 2;
      this._roundRect(ctx, sx, inputY, slotW, 44, 6);
      ctx.fill();
      ctx.stroke();

      if (i < this.keypadInput.length) {
        ctx.font = 'bold 24px Nunito, sans-serif';
        ctx.fillStyle = CONFIG.COLORS.white;
        ctx.textBaseline = 'middle';
        ctx.fillText(this.keypadInput[i], sx + slotW / 2, inputY + 22);
        ctx.textBaseline = 'alphabetic';
      }
    }

    // keypad buttons
    this.keypadRects = [];
    const keys = [['1','2','3'],['4','5','6'],['7','8','9'],['←','0','✓']];
    const bw = 62, bh = 42;
    const gap = 8;
    const kpW = 3 * bw + 2 * gap;
    const kpX = px + w / 2 - kpW / 2;
    const kpY = py + 140;

    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 3; c++) {
        const key = keys[r][c];
        const bx = kpX + c * (bw + gap);
        const by = kpY + r * (bh + gap);

        let bgColor = CONFIG.COLORS.keypadBtn;
        if (key === '✓') bgColor = CONFIG.COLORS.success;
        if (key === '←') bgColor = CONFIG.COLORS.textDanger;

        ctx.fillStyle = bgColor;
        this._roundRect(ctx, bx, by, bw, bh, 8);
        ctx.fill();

        ctx.font = key === '✓' || key === '←' ? 'bold 18px sans-serif' : 'bold 20px Nunito, sans-serif';
        ctx.fillStyle = key === '✓' ? '#0f0518' : CONFIG.COLORS.white;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(key, bx + bw / 2, by + bh / 2);
        ctx.textBaseline = 'alphabetic';

        this.keypadRects.push({ key, x: bx, y: by, w: bw, h: bh });
      }
    }

    // close button
    this._drawCloseButton(ctx, px + w / 2, py + h - 30, '취소');
  }

  _drawBooks(ctx, px, py, w, h) {
    ctx.font = 'bold 16px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = CONFIG.COLORS.accent;
    ctx.fillText(this.current.title || '책장', px + w / 2, py + 30);

    const books = this.current.books;
    const bw = 60;
    const bh = 140;
    const gap = 14;
    const totalW = books.length * bw + (books.length - 1) * gap;
    const startX = px + w / 2 - totalW / 2;
    const by = py + 60;

    for (let i = 0; i < books.length; i++) {
      const b = books[i];
      const bx = startX + i * (bw + gap);

      // book
      ctx.fillStyle = b.color;
      this._roundRect(ctx, bx, by, bw, bh, 6);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.4)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // spine decoration
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(bx + 5, by + 20);
      ctx.lineTo(bx + bw - 5, by + 20);
      ctx.moveTo(bx + 5, by + bh - 20);
      ctx.lineTo(bx + bw - 5, by + bh - 20);
      ctx.stroke();

      // number
      ctx.font = 'bold 32px Nunito, sans-serif';
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(b.number, bx + bw / 2, by + bh / 2);
      ctx.textBaseline = 'alphabetic';

      // label
      ctx.font = '11px Nunito, sans-serif';
      ctx.fillStyle = CONFIG.COLORS.textDim;
      ctx.textAlign = 'center';
      ctx.fillText(b.label, bx + bw / 2, by + bh + 16);
    }

    this._drawCloseButton(ctx, px + w / 2, py + h - 30, '닫기');
  }

  _drawCloseButton(ctx, cx, cy, text) {
    const bw = 100, bh = 32;
    const bx = cx - bw / 2;
    const by = cy - bh / 2;

    ctx.fillStyle = CONFIG.COLORS.keypadBtn;
    this._roundRect(ctx, bx, by, bw, bh, 16);
    ctx.fill();

    ctx.font = 'bold 14px Nunito, sans-serif';
    ctx.fillStyle = CONFIG.COLORS.text;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, cx, cy);
    ctx.textBaseline = 'alphabetic';

    this.closeRect = { x: bx, y: by, w: bw, h: bh };
  }

  handleClick(x, y, game) {
    if (!this.current) return false;

    // close button
    if (this.closeRect && this._hit(x, y, this.closeRect)) {
      this.audio.playButton();
      this.close();
      return true;
    }

    if (this.current.type === 'keypad') {
      for (const r of this.keypadRects) {
        if (this._hit(x, y, r)) {
          this.audio.playKey();
          this._handleKey(r.key, game);
          return true;
        }
      }
    }

    return true; // swallow click
  }

  _handleKey(key, game) {
    if (key === '←') {
      this.keypadInput = this.keypadInput.slice(0, -1);
      return;
    }
    if (key === '✓') {
      if (this.keypadInput === this.current.answer) {
        this.audio.playCorrect();
        const onCorrect = this.current.onCorrect;
        this.current = null;
        if (onCorrect) {
          const result = onCorrect(game);
          if (result) {
            if (result.msg) this.showMessage(result.msg);
            if (result.complete) game.markStageComplete();
          }
        }
      } else {
        this.audio.playWrong();
        this.keypadShake = 0.5;
        this.keypadInput = '';
      }
      return;
    }
    if (this.keypadInput.length < (this.current.length || 4)) {
      this.keypadInput += key;
    }
  }

  _hit(x, y, r) {
    return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
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
