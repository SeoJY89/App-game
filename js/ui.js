class UI {
  constructor() {
    this.comboTexts = [];
    this.feverFlash = 0;
    this.titleBounce = 0;
    this.menuMochi = null;
  }

  update(dt) {
    this.titleBounce += dt * 2;
    this.feverFlash += dt * 8;

    for (let i = this.comboTexts.length - 1; i >= 0; i--) {
      const ct = this.comboTexts[i];
      ct.timer += dt;
      ct.y -= 40 * dt;
      if (ct.timer > 0.8) {
        this.comboTexts.splice(i, 1);
      }
    }
  }

  addComboText(x, y, combo) {
    this.comboTexts.push({
      x, y, combo,
      timer: 0
    });
  }

  drawScore(ctx, score, highScore, w) {
    // score bubble
    const bubbleW = 160;
    const bubbleH = 50;
    const bubbleX = w / 2 - bubbleW / 2;
    const bubbleY = 15;

    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    this._roundRect(ctx, bubbleX, bubbleY, bubbleW, bubbleH, 25);
    ctx.fill();

    ctx.fillStyle = CONFIG.COLORS.text;
    ctx.font = 'bold 26px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(score.toLocaleString(), w / 2, bubbleY + bubbleH / 2);

    // high score small text
    ctx.fillStyle = CONFIG.COLORS.textLight;
    ctx.font = '12px Nunito, sans-serif';
    ctx.fillText('BEST: ' + highScore.toLocaleString(), w / 2, bubbleY + bubbleH + 10);
  }

  drawLives(ctx, lives) {
    const startX = 20;
    const y = 30;
    const size = 14;
    const gap = 34;

    for (let i = 0; i < CONFIG.GAME.initialLives; i++) {
      const x = startX + i * gap;
      ctx.fillStyle = i < lives ? CONFIG.COLORS.heart : CONFIG.COLORS.heartEmpty;
      this._drawHeart(ctx, x, y, size);
    }
  }

  _drawHeart(ctx, x, y, size) {
    ctx.beginPath();
    ctx.moveTo(x, y + size * 0.3);
    ctx.bezierCurveTo(x, y, x - size, y, x - size, y + size * 0.3);
    ctx.bezierCurveTo(x - size, y + size * 0.7, x, y + size, x, y + size * 1.2);
    ctx.bezierCurveTo(x, y + size, x + size, y + size * 0.7, x + size, y + size * 0.3);
    ctx.bezierCurveTo(x + size, y, x, y, x, y + size * 0.3);
    ctx.fill();
  }

  drawComboTexts(ctx) {
    for (const ct of this.comboTexts) {
      const alpha = Math.max(0, 1 - ct.timer / 0.8);
      const scale = 1 + ct.timer * 0.5;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(ct.x, ct.y);
      ctx.scale(scale, scale);
      ctx.font = 'bold 28px Nunito, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.strokeStyle = CONFIG.COLORS.white;
      ctx.lineWidth = 4;
      ctx.strokeText(`x${ct.combo}!`, 0, 0);
      ctx.fillStyle = CONFIG.COLORS.accent;
      ctx.fillText(`x${ct.combo}!`, 0, 0);
      ctx.restore();
    }
  }

  drawFever(ctx, timer, w, h) {
    const alpha = 0.7 + Math.sin(this.feverFlash) * 0.3;
    ctx.save();
    ctx.globalAlpha = alpha;

    // fever background glow
    const gradient = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w);
    gradient.addColorStop(0, 'rgba(255, 215, 0, 0.15)');
    gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // fever text
    const scale = 1.2 + Math.sin(this.feverFlash * 1.5) * 0.1;
    ctx.translate(w / 2, 110);
    ctx.scale(scale, scale);
    ctx.font = 'bold 32px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = CONFIG.COLORS.white;
    ctx.lineWidth = 5;
    ctx.strokeText('FEVER TIME!', 0, 0);

    const hue = (Date.now() / 10) % 360;
    ctx.fillStyle = `hsl(${hue}, 80%, 55%)`;
    ctx.fillText('FEVER TIME!', 0, 0);

    // timer bar
    ctx.restore();
    const barW = 120;
    const barH = 6;
    const barX = w / 2 - barW / 2;
    const barY = 132;
    const progress = timer / CONFIG.GAME.feverDuration;
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    this._roundRect(ctx, barX, barY, barW, barH, 3);
    ctx.fill();
    ctx.fillStyle = CONFIG.COLORS.accent;
    this._roundRect(ctx, barX, barY, barW * progress, barH, 3);
    ctx.fill();
  }

  drawMenu(ctx, w, h, highScore) {
    // title
    const bounceY = Math.sin(this.titleBounce) * 8;
    ctx.save();
    ctx.translate(w / 2, h * 0.25 + bounceY);

    ctx.font = 'bold 52px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = CONFIG.COLORS.white;
    ctx.lineWidth = 6;
    ctx.strokeText('Mochi Pop!', 0, 0);
    ctx.fillStyle = CONFIG.COLORS.mochi[0];
    ctx.fillText('Mochi Pop!', 0, 0);

    // subtitle
    ctx.font = '18px Nunito, sans-serif';
    ctx.fillStyle = CONFIG.COLORS.textLight;
    ctx.fillText('모찌 팝!', 0, 40);

    ctx.restore();

    // draw sample mochi
    if (!this.menuMochi) {
      this.menuMochi = new Mochi(w, h);
      this.menuMochi.x = w / 2;
      this.menuMochi.y = h * 0.48;
      this.menuMochi.radius = 50;
      this.menuMochi.speed = 0;
      this.menuMochi.eyeStyle = 1; // happy face
    }
    this.menuMochi.wobblePhase += 0.02;
    this.menuMochi.squish = 1 + Math.sin(this.menuMochi.wobblePhase * 1.3) * 0.05;
    this.menuMochi.wobbleX = Math.sin(this.menuMochi.wobblePhase) * 5;
    this.menuMochi.rotation = Math.sin(this.menuMochi.wobblePhase * 0.7) * 0.08;
    this.menuMochi.draw(ctx);

    // tap to start
    const tapAlpha = 0.5 + Math.sin(Date.now() / 400) * 0.5;
    ctx.globalAlpha = tapAlpha;
    ctx.font = '22px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = CONFIG.COLORS.text;
    ctx.fillText('Tap to Start!', w / 2, h * 0.68);
    ctx.globalAlpha = 1;

    // high score
    if (highScore > 0) {
      ctx.font = '16px Nunito, sans-serif';
      ctx.fillStyle = CONFIG.COLORS.textLight;
      ctx.fillText('Best: ' + highScore.toLocaleString(), w / 2, h * 0.75);
    }

    // instructions
    ctx.font = '14px Nunito, sans-serif';
    ctx.fillStyle = CONFIG.COLORS.textLight;
    ctx.textAlign = 'center';
    ctx.fillText('떠오르는 모찌를 탭해서 터뜨리세요!', w / 2, h * 0.85);
    ctx.fillText('놓치면 하트를 잃어요 💔', w / 2, h * 0.89);
  }

  drawGameOver(ctx, w, h, score, highScore, isNewBest) {
    // overlay
    ctx.fillStyle = CONFIG.COLORS.overlay;
    ctx.fillRect(0, 0, w, h);

    // panel
    const panelW = 280;
    const panelH = 320;
    const panelX = w / 2 - panelW / 2;
    const panelY = h / 2 - panelH / 2 - 20;

    ctx.fillStyle = CONFIG.COLORS.white;
    this._roundRect(ctx, panelX, panelY, panelW, panelH, 24);
    ctx.fill();

    // game over text
    ctx.font = 'bold 32px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = CONFIG.COLORS.text;
    ctx.fillText('Game Over', w / 2, panelY + 50);

    // sad mochi
    ctx.font = '48px sans-serif';
    ctx.fillText('🥺', w / 2, panelY + 105);

    // score
    ctx.font = '16px Nunito, sans-serif';
    ctx.fillStyle = CONFIG.COLORS.textLight;
    ctx.fillText('SCORE', w / 2, panelY + 150);

    ctx.font = 'bold 40px Nunito, sans-serif';
    ctx.fillStyle = CONFIG.COLORS.text;
    ctx.fillText(score.toLocaleString(), w / 2, panelY + 185);

    // new best
    if (isNewBest) {
      const flash = 0.7 + Math.sin(Date.now() / 200) * 0.3;
      ctx.globalAlpha = flash;
      ctx.font = 'bold 18px Nunito, sans-serif';
      ctx.fillStyle = CONFIG.COLORS.accent;
      ctx.fillText('✨ NEW BEST! ✨', w / 2, panelY + 215);
      ctx.globalAlpha = 1;
    } else {
      ctx.font = '14px Nunito, sans-serif';
      ctx.fillStyle = CONFIG.COLORS.textLight;
      ctx.fillText('Best: ' + highScore.toLocaleString(), w / 2, panelY + 215);
    }

    // play again button
    const btnW = 180;
    const btnH = 48;
    const btnX = w / 2 - btnW / 2;
    const btnY = panelY + panelH - 70;

    ctx.fillStyle = CONFIG.COLORS.mochi[0];
    this._roundRect(ctx, btnX, btnY, btnW, btnH, 24);
    ctx.fill();

    ctx.font = 'bold 20px Nunito, sans-serif';
    ctx.fillStyle = CONFIG.COLORS.white;
    ctx.fillText('Play Again', w / 2, btnY + btnH / 2);

    return { x: btnX, y: btnY, w: btnW, h: btnH };
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
