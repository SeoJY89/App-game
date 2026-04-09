class StageObject {
  constructor(data, sceneRect) {
    this.id = data.id;
    this.emoji = data.emoji;
    this.homeX = sceneRect.x + data.startX * sceneRect.w;
    this.homeY = sceneRect.y + data.startY * sceneRect.h;
    this.x = this.homeX;
    this.y = this.homeY;
    this.targetX = this.x;
    this.targetY = this.y;
    this.scale = 1;
    this.targetScale = 1;
    this.placedZoneId = null;
    this.size = CONFIG.LAYOUT.objectSize;
  }

  update(dt) {
    const spd = 14;
    this.x += (this.targetX - this.x) * spd * dt;
    this.y += (this.targetY - this.y) * spd * dt;
    this.scale += (this.targetScale - this.scale) * 10 * dt;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(this.scale, this.scale);

    // bg circle
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // emoji
    ctx.font = `${this.size * 0.6}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.emoji, 0, 2);

    ctx.restore();
  }

  hitTest(px, py) {
    const dx = px - this.x;
    const dy = py - this.y;
    return dx * dx + dy * dy <= (this.size / 2 + 8) * (this.size / 2 + 8);
  }

  returnHome() {
    this.targetX = this.homeX;
    this.targetY = this.homeY;
    this.placedZoneId = null;
  }
}

class DropZone {
  constructor(data, sceneRect) {
    this.id = data.id;
    this.x = sceneRect.x + data.x * sceneRect.w;
    this.y = sceneRect.y + data.y * sceneRect.h;
    this.label = data.label;
    this.size = CONFIG.LAYOUT.zoneSize;
    this.occupied = false;
    this.correct = false;
    this.glowTimer = 0;
  }

  update(dt) {
    if (this.correct) this.glowTimer += dt * 3;
  }

  draw(ctx) {
    const s = this.size;
    ctx.save();
    ctx.translate(this.x, this.y);

    if (this.correct) {
      const glow = 0.15 + Math.sin(this.glowTimer) * 0.08;
      ctx.fillStyle = `rgba(80,220,150,${glow})`;
      ctx.shadowColor = CONFIG.COLORS.correct;
      ctx.shadowBlur = 12;
    } else {
      ctx.fillStyle = CONFIG.COLORS.cell;
    }

    // rounded rect zone
    const r = 14;
    const half = s / 2;
    ctx.beginPath();
    ctx.moveTo(-half + r, -half);
    ctx.lineTo(half - r, -half);
    ctx.quadraticCurveTo(half, -half, half, -half + r);
    ctx.lineTo(half, half - r);
    ctx.quadraticCurveTo(half, half, half - r, half);
    ctx.lineTo(-half + r, half);
    ctx.quadraticCurveTo(-half, half, -half, half - r);
    ctx.lineTo(-half, -half + r);
    ctx.quadraticCurveTo(-half, -half, -half + r, -half);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    // dashed border
    ctx.strokeStyle = this.correct ? CONFIG.COLORS.correct : 'rgba(255,255,255,0.2)';
    ctx.lineWidth = this.correct ? 2 : 1;
    ctx.setLineDash(this.correct ? [] : [4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // label
    if (!this.occupied) {
      ctx.font = '18px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.fillText(this.label, 0, 1);
    }

    ctx.restore();
  }

  hitTest(px, py) {
    const dx = px - this.x;
    const dy = py - this.y;
    const half = this.size / 2 + 5;
    return Math.abs(dx) <= half && Math.abs(dy) <= half;
  }
}

class Stage {
  constructor(stageData, audio, particles) {
    this.data = stageData;
    this.audio = audio;
    this.particles = particles;

    const L = CONFIG.LAYOUT;
    this.sceneRect = {
      x: 20, y: L.sceneTop,
      w: CONFIG.CANVAS.WIDTH - 40,
      h: L.sceneBottom - L.sceneTop
    };

    this.objects = stageData.objects.map(d => new StageObject(d, this.sceneRect));
    this.zones = stageData.zones.map(d => new DropZone(d, this.sceneRect));
    this.revealedHints = [];
    this.allHintsRevealed = false;
    this.questionVisible = false;
    this.questionRevealTimer = 0;
    this.floatingTexts = [];
  }

  checkMatch(obj, zone) {
    const match = this.data.matches.find(
      m => m.objectId === obj.id && m.zoneId === zone.id
    );
    if (match && !this.revealedHints.includes(match.hint)) {
      zone.correct = true;
      this.revealedHints.push(match.hint);
      this.audio.playHint();
      this.particles.emitCorrect(zone.x, zone.y);

      this.floatingTexts.push({
        text: '✓ 힌트 발견!',
        x: zone.x, y: zone.y - 40,
        timer: 0
      });

      if (this.revealedHints.length === this.data.matches.length) {
        this.allHintsRevealed = true;
        this.questionRevealTimer = 0;
        this.audio.playAllHints();
      }
      return true;
    }
    return false;
  }

  placeObject(obj, zone) {
    // remove obj from previous zone
    if (obj.placedZoneId) {
      const prevZone = this.zones.find(z => z.id === obj.placedZoneId);
      if (prevZone) {
        prevZone.occupied = false;
        if (prevZone.correct) {
          // check if this was the matching pair
          const m = this.data.matches.find(
            mm => mm.objectId === obj.id && mm.zoneId === prevZone.id
          );
          if (m) {
            prevZone.correct = false;
            const idx = this.revealedHints.indexOf(m.hint);
            if (idx >= 0) this.revealedHints.splice(idx, 1);
            this.allHintsRevealed = false;
            this.questionVisible = false;
          }
        }
      }
    }

    // place on new zone
    obj.placedZoneId = zone.id;
    obj.targetX = zone.x;
    obj.targetY = zone.y;
    zone.occupied = true;

    return this.checkMatch(obj, zone);
  }

  removeFromZone(obj) {
    if (!obj.placedZoneId) return;
    const zone = this.zones.find(z => z.id === obj.placedZoneId);
    if (zone) {
      zone.occupied = false;
      if (zone.correct) {
        const m = this.data.matches.find(
          mm => mm.objectId === obj.id && mm.zoneId === zone.id
        );
        if (m) {
          zone.correct = false;
          const idx = this.revealedHints.indexOf(m.hint);
          if (idx >= 0) this.revealedHints.splice(idx, 1);
          this.allHintsRevealed = false;
          this.questionVisible = false;
        }
      }
    }
    obj.placedZoneId = null;
  }

  update(dt) {
    for (const o of this.objects) o.update(dt);
    for (const z of this.zones) z.update(dt);

    if (this.allHintsRevealed && !this.questionVisible) {
      this.questionRevealTimer += dt;
      if (this.questionRevealTimer > 0.5) this.questionVisible = true;
    }

    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      this.floatingTexts[i].timer += dt;
      this.floatingTexts[i].y -= 25 * dt;
      if (this.floatingTexts[i].timer > 1) this.floatingTexts.splice(i, 1);
    }
  }

  draw(ctx) {
    // scene background
    const sr = this.sceneRect;
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    this._roundRect(ctx, sr.x - 5, sr.y - 5, sr.w + 10, sr.h + 10, 16);
    ctx.fill();

    // zones first (behind objects)
    for (const z of this.zones) z.draw(ctx);

    // objects
    for (const o of this.objects) o.draw(ctx);

    // floating texts
    for (const ft of this.floatingTexts) {
      const a = Math.max(0, 1 - ft.timer);
      ctx.save();
      ctx.globalAlpha = a;
      ctx.font = 'bold 14px Nunito, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = CONFIG.COLORS.correct;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }
  }

  drawHintPanel(ctx) {
    const L = CONFIG.LAYOUT;
    const w = CONFIG.CANVAS.WIDTH;

    // panel bg
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    this._roundRect(ctx, 15, L.hintPanelTop, w - 30, L.hintPanelBottom - L.hintPanelTop, 12);
    ctx.fill();

    // "HINTS" label
    ctx.font = 'bold 11px Nunito, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillStyle = CONFIG.COLORS.textDim;
    ctx.fillText('💡 HINTS', 25, L.hintPanelTop + 18);

    // hint slots
    const totalHints = this.data.matches.length;
    const startY = L.hintPanelTop + 32;
    const lineH = 20;

    for (let i = 0; i < totalHints; i++) {
      const y = startY + i * lineH;
      if (i < this.revealedHints.length) {
        ctx.font = '14px Nunito, sans-serif';
        ctx.fillStyle = CONFIG.COLORS.textHint;
        ctx.textAlign = 'left';
        ctx.fillText(this.revealedHints[i], 30, y);
      } else {
        ctx.font = '13px Nunito, sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.textAlign = 'left';
        ctx.fillText('??? 올바른 위치에 놓으면 힌트 등장', 30, y);
      }
    }

    // question
    if (this.questionVisible) {
      const qy = L.questionY;
      ctx.font = 'bold 20px Nunito, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = CONFIG.COLORS.gold;
      ctx.fillText('❓ ' + this.data.question, w / 2, qy);
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
}
