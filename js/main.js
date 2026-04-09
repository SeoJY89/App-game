const State = { MENU: 0, PLAYING: 1, CLEAR: 2 };

class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.audio = new AudioManager();
    this.particles = new ParticleSystem();
    this.ui = new UI();

    this.state = State.MENU;
    this.scale = 1;
    this.lastTime = 0;
    this.sparkleTimer = 0;

    this.currentStageIdx = 0;
    this.stage = null;
    this.dragging = null;
    this.dragOffsetX = 0;
    this.dragOffsetY = 0;
    this.pointerX = 0;
    this.pointerY = 0;

    this.keyRects = [];
    this.menuRects = {};
    this.clearRects = null;

    // load progress
    this.maxUnlockedStage = parseInt(localStorage.getItem('hintRoomProgress')) || 1;

    this._setupCanvas();
    this._setupEvents();

    document.fonts.ready.then(() => {
      requestAnimationFrame(t => this._loop(t));
    });
  }

  _setupCanvas() {
    const resize = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const ratio = CONFIG.CANVAS.WIDTH / CONFIG.CANVAS.HEIGHT;
      const sr = vw / vh;
      if (sr > ratio) {
        this.canvas.height = vh;
        this.canvas.width = vh * ratio;
      } else {
        this.canvas.width = vw;
        this.canvas.height = vw / ratio;
      }
      this.scale = this.canvas.width / CONFIG.CANVAS.WIDTH;
    };
    window.addEventListener('resize', resize);
    resize();
  }

  _getPos(e) {
    const r = this.canvas.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) / this.scale,
      y: (e.clientY - r.top) / this.scale
    };
  }

  _setupEvents() {
    this.canvas.addEventListener('pointerdown', e => {
      e.preventDefault();
      this.audio.init();
      const p = this._getPos(e);
      this._onDown(p.x, p.y);
    }, { passive: false });

    this.canvas.addEventListener('pointermove', e => {
      e.preventDefault();
      const p = this._getPos(e);
      this._onMove(p.x, p.y);
    }, { passive: false });

    this.canvas.addEventListener('pointerup', e => {
      e.preventDefault();
      const p = this._getPos(e);
      this._onUp(p.x, p.y);
    }, { passive: false });

    this.canvas.addEventListener('pointercancel', () => {
      if (this.dragging) {
        this.dragging.returnHome();
        this.dragging.targetScale = 1;
        this.dragging = null;
      }
    });
  }

  _startStage(idx) {
    if (idx >= CONFIG.STAGES.length) {
      this.state = State.MENU;
      return;
    }
    this.currentStageIdx = idx;
    this.stage = new Stage(CONFIG.STAGES[idx], this.audio, this.particles);
    this.ui.answerText = '';
    this.ui.answerFlash = 0;
    this.ui.answerCorrect = false;
    this.ui.answerWrong = false;
    this.ui.showClear = false;
    this.ui.clearAnim = 0;
    this.state = State.PLAYING;
    this.dragging = null;
  }

  _onDown(x, y) {
    if (this.state === State.MENU) {
      const btn = this.menuRects.btn;
      if (btn && x >= btn.x && x <= btn.x + btn.w && y >= btn.y && y <= btn.y + btn.h) {
        this._startStage(this.maxUnlockedStage - 1);
        this.audio.playPickup();
      }
      return;
    }

    if (this.state === State.CLEAR) {
      if (this.clearRects) {
        const nb = this.clearRects.nextBtn;
        if (nb && x >= nb.x && x <= nb.x + nb.w && y >= nb.y && y <= nb.y + nb.h) {
          this._startStage(this.currentStageIdx + 1);
          this.audio.playPickup();
        }
        const mb = this.clearRects.menuBtn;
        if (mb && x >= mb.x && x <= mb.x + mb.w && y >= mb.y && y <= mb.y + mb.h) {
          this.state = State.MENU;
          this.audio.playPickup();
        }
      }
      return;
    }

    // PLAYING state

    // check keypad
    if (this.stage && this.stage.questionVisible) {
      const key = this.ui.hitKeypad(x, y, this.keyRects);
      if (key) {
        this._handleKey(key);
        return;
      }
    }

    // check objects for drag
    if (!this.stage) return;
    for (let i = this.stage.objects.length - 1; i >= 0; i--) {
      const obj = this.stage.objects[i];
      if (obj.hitTest(x, y)) {
        this.dragging = obj;
        this.dragOffsetX = x - obj.x;
        this.dragOffsetY = y - obj.y;
        this.pointerX = x;
        this.pointerY = y;
        obj.targetScale = 1.2;
        this.audio.playPickup();

        // remove from current zone if placed
        this.stage.removeFromZone(obj);
        return;
      }
    }
  }

  _onMove(x, y) {
    if (!this.dragging) return;
    this.pointerX = x;
    this.pointerY = y;
  }

  _onUp(x, y) {
    if (!this.dragging) return;
    const obj = this.dragging;
    obj.targetScale = 1;
    this.dragging = null;

    // check if dropped on a zone
    let placed = false;
    for (const zone of this.stage.zones) {
      if (zone.hitTest(x, y)) {
        // check if zone already occupied by another object
        const occupier = this.stage.objects.find(
          o => o !== obj && o.placedZoneId === zone.id
        );
        if (occupier) {
          // swap: send occupier back home
          this.stage.removeFromZone(occupier);
          occupier.returnHome();
        }
        this.stage.placeObject(obj, zone);
        placed = true;
        this.audio.playDrop();
        break;
      }
    }

    if (!placed) {
      obj.returnHome();
      this.audio.playDrop();
    }
  }

  _handleKey(key) {
    this.audio.playKeypress();

    if (key === '←') {
      this.ui.answerText = this.ui.answerText.slice(0, -1);
      return;
    }

    if (key === '✓') {
      this._checkAnswer();
      return;
    }

    // number
    if (this.ui.answerText.length < 6) {
      this.ui.answerText += key;
    }
  }

  _checkAnswer() {
    if (!this.stage || !this.ui.answerText) return;

    if (this.ui.answerText === this.stage.data.answer) {
      // correct!
      this.ui.answerCorrect = true;
      this.ui.answerWrong = false;
      this.ui.answerFlash = 1;
      this.audio.playStageClear();
      this.particles.emitClear(CONFIG.CANVAS.WIDTH / 2, CONFIG.CANVAS.HEIGHT * 0.4);

      // unlock next stage
      const nextStage = this.currentStageIdx + 2; // 1-indexed
      if (nextStage > this.maxUnlockedStage) {
        this.maxUnlockedStage = nextStage;
        localStorage.setItem('hintRoomProgress', this.maxUnlockedStage.toString());
      }

      // show clear screen after delay
      setTimeout(() => {
        this.state = State.CLEAR;
        this.ui.showClear = true;
        this.ui.clearAnim = 0;
      }, 600);
    } else {
      // wrong
      this.ui.answerWrong = true;
      this.ui.answerCorrect = false;
      this.ui.answerFlash = 1;
      this.audio.playWrong();
      this.particles.emitWrong(CONFIG.CANVAS.WIDTH / 2, CONFIG.LAYOUT.answerY);
      this.ui.answerText = '';
    }
  }

  _update(dt) {
    this.ui.update(dt);
    this.particles.update(dt);

    this.sparkleTimer += dt * 1000;
    if (this.sparkleTimer > CONFIG.PARTICLES.sparkleInterval) {
      this.sparkleTimer -= CONFIG.PARTICLES.sparkleInterval;
      this.particles.emitSparkle(CONFIG.CANVAS.WIDTH, CONFIG.CANVAS.HEIGHT);
    }

    if (this.state === State.PLAYING && this.stage) {
      this.stage.update(dt);

      // update dragging object position
      if (this.dragging) {
        this.dragging.targetX = this.pointerX - this.dragOffsetX;
        this.dragging.targetY = this.pointerY - this.dragOffsetY;
      }
    }
  }

  _draw() {
    const ctx = this.ctx;
    const w = CONFIG.CANVAS.WIDTH;
    const h = CONFIG.CANVAS.HEIGHT;

    ctx.save();
    ctx.scale(this.scale, this.scale);

    // background
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, CONFIG.COLORS.bgTop);
    grad.addColorStop(1, CONFIG.COLORS.bgBottom);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    this.particles.draw(ctx);

    if (this.state === State.MENU) {
      this.menuRects = this.ui.drawMenu(ctx, w, h, this.maxUnlockedStage) || {};
    }

    if (this.state === State.PLAYING && this.stage) {
      this.ui.drawHeader(ctx, this.stage.data);
      this.stage.draw(ctx);
      this.stage.drawHintPanel(ctx);
      this.ui.drawAnswerInput(ctx, this.stage.questionVisible);

      if (this.stage.questionVisible) {
        this.keyRects = this.ui.drawKeypad(ctx);
      }
    }

    if (this.state === State.CLEAR) {
      // draw the stage behind
      if (this.stage) {
        this.ui.drawHeader(ctx, this.stage.data);
        this.stage.draw(ctx);
        this.stage.drawHintPanel(ctx);
      }
      this.clearRects = this.ui.drawStageClear(ctx, w, h, this.stage ? this.stage.data.id : 0);
    }

    ctx.restore();
  }

  _loop(timestamp) {
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05);
    this.lastTime = timestamp;
    this._update(dt);
    this._draw();
    requestAnimationFrame(t => this._loop(t));
  }
}

window.addEventListener('DOMContentLoaded', () => new Game());
