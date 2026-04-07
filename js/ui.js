class UI {
  constructor() {
    this.titleBounce = 0;
    this.showCollection = false;
    this.tutorialStep = 0;
    this.hintTimer = 0;
    this.hintVisible = false;
  }

  update(dt) {
    this.titleBounce += dt * 2;
    this.hintTimer += dt;
  }

  drawTopBar(ctx, stars, energy, maxEnergy) {
    const w = CONFIG.CANVAS.WIDTH;

    // background bar
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    this._roundRect(ctx, 10, 10, w - 20, 44, 14);
    ctx.fill();

    // stars
    ctx.font = '18px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('⭐', 22, 32);
    ctx.font = 'bold 18px Nunito, sans-serif';
    ctx.fillStyle = CONFIG.COLORS.text;
    ctx.fillText(stars.toLocaleString(), 44, 32);

    // energy bar
    const barX = 140;
    const barY = 24;
    const barW = 130;
    const barH = 14;

    ctx.font = '14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('⚡', barX - 20, 32);

    ctx.fillStyle = CONFIG.COLORS.energyBg;
    this._roundRect(ctx, barX, barY, barW, barH, 7);
    ctx.fill();

    const ratio = energy / maxEnergy;
    ctx.fillStyle = CONFIG.COLORS.energyBar;
    if (barW * ratio > 1) {
      this._roundRect(ctx, barX, barY, barW * ratio, barH, 7);
      ctx.fill();
    }

    ctx.font = 'bold 11px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = CONFIG.COLORS.text;
    ctx.fillText(`${energy}/${maxEnergy}`, barX + barW / 2, barY + barH / 2 + 1);

    // collection button
    const btnX = w - 50;
    ctx.font = '22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('📖', btnX, 32);

    return { collectionBtn: { x: btnX - 18, y: 14, w: 36, h: 36 } };
  }

  drawMenu(ctx, w, h) {
    const bounceY = Math.sin(this.titleBounce) * 6;

    // title
    ctx.save();
    ctx.translate(w / 2, h * 0.28 + bounceY);
    ctx.font = 'bold 46px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = CONFIG.COLORS.white;
    ctx.lineWidth = 6;
    ctx.strokeText('Mochi Merge!', 0, 0);
    ctx.fillStyle = '#FF7EB0';
    ctx.fillText('Mochi Merge!', 0, 0);

    ctx.font = '16px Nunito, sans-serif';
    ctx.fillStyle = CONFIG.COLORS.textLight;
    ctx.fillText('모찌 머지!', 0, 35);
    ctx.restore();

    // sample items
    const emojis = ['🌸', '🍰', '🐱', '💐', '🍩', '🦄'];
    const positions = [
      { x: w * 0.2, y: h * 0.45 }, { x: w * 0.5, y: h * 0.42 }, { x: w * 0.8, y: h * 0.45 },
      { x: w * 0.3, y: h * 0.52 }, { x: w * 0.6, y: h * 0.52 }, { x: w * 0.7, y: h * 0.48 }
    ];
    ctx.font = '36px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let i = 0; i < emojis.length; i++) {
      const p = positions[i];
      const bob = Math.sin(this.titleBounce + i * 0.8) * 5;
      ctx.fillText(emojis[i], p.x, p.y + bob);
    }

    // tap to start
    const tapAlpha = 0.5 + Math.sin(Date.now() / 400) * 0.5;
    ctx.globalAlpha = tapAlpha;
    ctx.font = '22px Nunito, sans-serif';
    ctx.fillStyle = CONFIG.COLORS.text;
    ctx.fillText('Tap to Start!', w / 2, h * 0.65);
    ctx.globalAlpha = 1;

    // instructions
    ctx.font = '14px Nunito, sans-serif';
    ctx.fillStyle = CONFIG.COLORS.textLight;
    ctx.fillText('같은 아이템을 합쳐서 새로운 아이템을 만드세요!', w / 2, h * 0.82);
    ctx.fillText('주문을 완성하면 별을 받아요 ⭐', w / 2, h * 0.86);
  }

  drawTutorial(ctx, step, w, h) {
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(0, 0, w, h);

    const msgs = [
      { emoji: '👆', text: '제너레이터를 탭해서\n아이템을 만드세요!', y: CONFIG.GENERATORS.y - 60 },
      { emoji: '👉', text: '같은 아이템 위에\n드래그해서 합치세요!', y: CONFIG.GRID.OFFSET_Y + 60 },
      { emoji: '📦', text: '주문에 맞는 아이템을 만들어\n탭하면 납품됩니다!', y: 140 }
    ];

    if (step >= msgs.length) return;
    const msg = msgs[step];

    // bubble
    const bw = 260;
    const bh = 90;
    const bx = w / 2 - bw / 2;
    const by = msg.y;

    ctx.fillStyle = CONFIG.COLORS.white;
    ctx.shadowColor = 'rgba(0,0,0,0.15)';
    ctx.shadowBlur = 10;
    this._roundRect(ctx, bx, by, bw, bh, 16);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.font = '30px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(msg.emoji, bx + 40, by + bh / 2);

    ctx.font = '14px Nunito, sans-serif';
    ctx.fillStyle = CONFIG.COLORS.text;
    ctx.textAlign = 'left';
    const lines = msg.text.split('\n');
    lines.forEach((line, i) => {
      ctx.fillText(line, bx + 65, by + bh / 2 - 8 + i * 20);
    });

    // tap to continue
    const alpha = 0.5 + Math.sin(Date.now() / 300) * 0.5;
    ctx.globalAlpha = alpha;
    ctx.font = '12px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = CONFIG.COLORS.textLight;
    ctx.fillText('탭하여 계속', w / 2, by + bh + 20);
    ctx.globalAlpha = 1;
  }

  drawCollection(ctx, discovered, w, h) {
    ctx.fillStyle = CONFIG.COLORS.overlay;
    ctx.fillRect(0, 0, w, h);

    // panel
    const pw = 340;
    const ph = 560;
    const px = w / 2 - pw / 2;
    const py = h / 2 - ph / 2;

    ctx.fillStyle = CONFIG.COLORS.white;
    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.shadowBlur = 15;
    this._roundRect(ctx, px, py, pw, ph, 20);
    ctx.fill();
    ctx.shadowBlur = 0;

    // title
    ctx.font = 'bold 24px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = CONFIG.COLORS.text;
    ctx.fillText('📖 도감', w / 2, py + 35);

    // count
    ctx.font = '13px Nunito, sans-serif';
    ctx.fillStyle = CONFIG.COLORS.textLight;
    ctx.fillText(`${discovered.size} / 21 발견`, w / 2, py + 55);

    // items grid
    let iy = py + 80;
    for (const chainKey of CONFIG.CHAIN_ORDER) {
      const chain = CONFIG.CHAINS[chainKey];

      // chain label
      ctx.font = 'bold 13px Nunito, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillStyle = CONFIG.COLORS.text;
      ctx.fillText(`${chain.icon} ${chain.name}`, px + 15, iy);
      iy += 20;

      for (let lv = 0; lv < chain.items.length; lv++) {
        const item = chain.items[lv];
        const key = `${chainKey}_${lv + 1}`;
        const found = discovered.has(key);
        const ix = px + 15 + lv * 44;

        // cell
        ctx.fillStyle = found ? CONFIG.COLORS.chainColors[chainKey][lv] : '#F0F0F0';
        this._roundRect(ctx, ix, iy, 38, 38, 8);
        ctx.fill();

        if (found) {
          ctx.font = '20px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(item.emoji, ix + 19, iy + 20);
        } else {
          ctx.font = '18px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#C0C0C0';
          ctx.fillText('?', ix + 19, iy + 20);
        }
      }
      iy += 55;
    }

    // close button
    const closeBtnY = py + ph - 55;
    ctx.fillStyle = '#FF7EB0';
    this._roundRect(ctx, w / 2 - 60, closeBtnY, 120, 38, 19);
    ctx.fill();
    ctx.font = 'bold 16px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = CONFIG.COLORS.white;
    ctx.fillText('닫기', w / 2, closeBtnY + 19);

    return { closeBtn: { x: w / 2 - 60, y: closeBtnY, w: 120, h: 38 } };
  }

  drawHint(ctx, text, w) {
    if (this.hintTimer < 5) return;
    const alpha = Math.min(1, (this.hintTimer - 5) * 2);
    ctx.save();
    ctx.globalAlpha = alpha * 0.7;
    ctx.font = '13px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = CONFIG.COLORS.textLight;
    ctx.fillText(text, w / 2, CONFIG.GRID.OFFSET_Y - 8);
    ctx.restore();
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
