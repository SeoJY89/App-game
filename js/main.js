const State = { MENU: 0, PLAYING: 1, COMPLETE: 2 };

class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.audio = new AudioManager();
    this.particles = new ParticleSystem();
    this.ui = new UI();
    this.popup = new PopupManager(this.audio);
    this.inventory = new Inventory();

    this.state = State.MENU;
    this.scale = 1;
    this.lastTime = 0;
    this.dustTimer = 0;

    this.currentStageIdx = 0;
    this.scene = null;
    this.flags = new Set();

    this.menuRects = {};
    this.headerRects = {};
    this.completeRects = {};

    this.maxUnlocked = parseInt(localStorage.getItem('escapeProgress')) || 1;

    this._setupCanvas();
    this._setupEvents();

    document.fonts.ready.then(() => {
      requestAnimationFrame(t => this._loop(t));
    });
  }

  // === Game state API used by stage handlers ===
  addItem(item) {
    this.inventory.add(item);
    this.audio.playItem();
  }

  removeItem(id) {
    this.inventory.remove(id);
  }

  hasItem(id) {
    return this.inventory.has(id);
  }

  markStageComplete() {
    this.state = State.COMPLETE;
    this.particles.emitEscape(CONFIG.CANVAS.WIDTH / 2, CONFIG.CANVAS.HEIGHT / 2);
    this.audio.playEscape();

    const next = this.currentStageIdx + 2;
    if (next > this.maxUnlocked) {
      this.maxUnlocked = next;
      localStorage.setItem('escapeProgress', this.maxUnlocked.toString());
    }
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
      this._onClick(p.x, p.y);
    }, { passive: false });
  }

  _startStage(idx) {
    if (idx >= CONFIG.STAGES.length) {
      this.state = State.MENU;
      return;
    }
    this.currentStageIdx = idx;
    const stageData = CONFIG.STAGES[idx];
    this.scene = new Scene(stageData);
    this.flags = new Set();
    this.inventory.clear();
    this.state = State.PLAYING;
    this.popup.close();

    // Show intro
    if (stageData.intro) {
      this.popup.showMessage(stageData.intro);
    }
  }

  _onClick(x, y) {
    if (this.state === State.MENU) {
      const btn = this.menuRects.playBtn;
      if (btn && this._hit(x, y, btn)) {
        this._startStage(Math.min(this.maxUnlocked - 1, CONFIG.STAGES.length - 1));
        this.audio.playButton();
      }
      return;
    }

    if (this.state === State.COMPLETE) {
      const btn = this.completeRects.nextBtn;
      if (btn && this._hit(x, y, btn)) {
        const isLast = this.currentStageIdx + 1 >= CONFIG.STAGES.length;
        if (isLast) {
          this.state = State.MENU;
        } else {
          this._startStage(this.currentStageIdx + 1);
        }
        this.audio.playButton();
      }
      return;
    }

    // PLAYING state

    // popup takes priority
    if (this.popup.isOpen()) {
      this.popup.handleClick(x, y, this);
      return;
    }

    // header menu button
    if (this.headerRects.menuBtn && this._hit(x, y, this.headerRects.menuBtn)) {
      this.state = State.MENU;
      this.audio.playButton();
      return;
    }

    // inventory click
    const invHit = this.inventory.hitTest(x, y);
    if (invHit) {
      this.inventory.toggleSelect(invHit);
      this.audio.playTap();
      return;
    }

    // hotspot click
    if (!this.scene) return;
    const hs = this.scene.hitTest(x, y);
    if (!hs) return;

    this.audio.playTap();

    // Check item usage first
    if (this.inventory.selected && hs.onUseItem) {
      const result = hs.onUseItem(this, this.inventory.selected);
      if (result) {
        this.inventory.selected = null;
        this._processResult(result);
        return;
      }
    }

    // Normal tap
    if (hs.onTap) {
      const result = hs.onTap(this);
      if (result) this._processResult(result);
    }
  }

  _processResult(result) {
    if (result.msg && result.popup) {
      // First show popup then message
      this.popup.showPopup(result.popup, result.onCorrect);
      return;
    }
    if (result.popup) {
      this.popup.showPopup(result.popup, result.onCorrect);
      return;
    }
    if (result.msg) {
      this.popup.showMessage(result.msg, result.complete ? () => this.markStageComplete() : null);
      return;
    }
    if (result.complete) {
      this.markStageComplete();
    }
  }

  _hit(x, y, r) {
    return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
  }

  _update(dt) {
    this.ui.update(dt);
    this.particles.update(dt);
    this.popup.update(dt);

    this.dustTimer += dt;
    if (this.dustTimer > 0.3) {
      this.dustTimer = 0;
      if (this.state === State.PLAYING) {
        this.particles.emitDust(CONFIG.CANVAS.WIDTH, CONFIG.LAYOUT.sceneBottom);
      }
    }

    if (this.scene) this.scene.update(dt);
  }

  _draw() {
    const ctx = this.ctx;
    const w = CONFIG.CANVAS.WIDTH;
    const h = CONFIG.CANVAS.HEIGHT;

    ctx.save();
    ctx.scale(this.scale, this.scale);

    // base background
    ctx.fillStyle = '#0a0510';
    ctx.fillRect(0, 0, w, h);

    if (this.state === State.MENU) {
      this.menuRects = this.ui.drawMenu(ctx, w, h, this.maxUnlocked) || {};
    } else if (this.state === State.PLAYING || this.state === State.COMPLETE) {
      if (this.scene) {
        this.scene.draw(ctx);
        this.particles.draw(ctx);
      }
      if (this.scene) {
        this.headerRects = this.ui.drawHeader(ctx, this.scene.data, this.currentStageIdx + 1, CONFIG.STAGES.length);
      }
      this.inventory.draw(ctx);

      // popup on top
      this.popup.draw(ctx);

      if (this.state === State.COMPLETE && !this.popup.isOpen()) {
        const isLast = this.currentStageIdx + 1 >= CONFIG.STAGES.length;
        this.completeRects = this.ui.drawStageComplete(ctx, w, h, this.currentStageIdx + 1, isLast) || {};
      }
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
