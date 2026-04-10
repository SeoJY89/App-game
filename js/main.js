const State = { MENU: 0, PLAYING: 1, COMPLETE: 2 };

class Game {
  constructor() {
    const W = CONFIG.CANVAS.WIDTH;
    const H = CONFIG.CANVAS.HEIGHT;

    // Create PIXI application
    this.app = new PIXI.Application({
      width: W,
      height: H,
      backgroundColor: 0x0a0510,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true
    });

    this.mountEl = document.getElementById('pixi-mount');
    this.overlayEl = document.getElementById('ui-overlay');
    this.mountEl.appendChild(this.app.view);

    // Game state
    this.audio = new AudioManager();
    this.ui = new UI(this, this.overlayEl);

    this.state = State.MENU;
    this.currentStageIdx = 0;
    this.scene = null;
    this.flags = new Set();
    this.inventory = [];
    this.selectedItem = null;

    this.maxUnlocked = parseInt(localStorage.getItem('escapeProgress')) || 1;

    // Setup scaling
    this._setupScaling();

    // Setup PIXI stage interactivity
    this.app.stage.eventMode = 'static';
    this.app.stage.hitArea = this.app.screen;
    this.app.stage.on('pointerdown', (e) => this._onStagePointerDown(e));

    // Start ticker
    this.app.ticker.add((dt) => this._update(dt / 60));

    // Show menu
    this._showMenu();
  }

  _setupScaling() {
    const W = CONFIG.CANVAS.WIDTH;
    const H = CONFIG.CANVAS.HEIGHT;
    const gameEl = document.getElementById('game');

    const resize = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const targetRatio = W / H;
      const screenRatio = vw / vh;

      let scale;
      if (screenRatio > targetRatio) {
        scale = vh / H;
      } else {
        scale = vw / W;
      }

      gameEl.style.transform = `scale(${scale})`;
      gameEl.style.transformOrigin = 'center center';
    };
    window.addEventListener('resize', resize);
    window.addEventListener('orientationchange', resize);
    resize();
  }

  // ============ Game state API ============
  addItem(item) {
    this.inventory.push(item);
    this.audio.playItem();
    this.ui.refreshInventory();
  }

  removeItem(id) {
    const idx = this.inventory.findIndex(i => i.id === id);
    if (idx >= 0) this.inventory.splice(idx, 1);
    if (this.selectedItem === id) this.selectedItem = null;
    this.ui.refreshInventory();
  }

  hasItem(id) {
    return this.inventory.some(i => i.id === id);
  }

  toggleItemSelection(id) {
    this.selectedItem = this.selectedItem === id ? null : id;
    this.ui.refreshInventory();
  }

  // ============ Menu / Stage control ============
  _showMenu() {
    this.state = State.MENU;
    if (this.scene) {
      this.app.stage.removeChild(this.scene);
      this.scene.destroy();
      this.scene = null;
    }
    this.ui.showMenu(this.maxUnlocked);
  }

  backToMenu() {
    this._showMenu();
  }

  startStage(idx) {
    if (idx >= CONFIG.STAGES.length) {
      this._showMenu();
      return;
    }

    // Clear old scene
    if (this.scene) {
      this.app.stage.removeChild(this.scene);
      this.scene.destroy();
    }

    this.currentStageIdx = idx;
    const stageData = CONFIG.STAGES[idx];

    // Create new scene
    this.scene = new Scene(stageData, CONFIG.CANVAS.WIDTH, CONFIG.CANVAS.HEIGHT);
    this.app.stage.addChildAt(this.scene, 0);

    // Reset state
    this.flags = new Set();
    this.inventory = [];
    this.selectedItem = null;

    this.state = State.PLAYING;
    this.ui.showGameUI(stageData, idx + 1, CONFIG.STAGES.length);

    // Show intro
    if (stageData.intro) {
      this.ui.showMessage(stageData.intro);
    }
  }

  markStageComplete() {
    this.state = State.COMPLETE;
    this.audio.playEscape();

    // Particle burst via GSAP + PIXI
    if (this.scene) {
      this._emitEscapeParticles();
    }

    const next = this.currentStageIdx + 2;
    if (next > this.maxUnlocked) {
      this.maxUnlocked = next;
      localStorage.setItem('escapeProgress', this.maxUnlocked.toString());
    }

    const isLast = this.currentStageIdx + 1 >= CONFIG.STAGES.length;
    setTimeout(() => {
      this.ui.showStageComplete(this.currentStageIdx + 1, isLast, () => {
        if (isLast) {
          this._showMenu();
        } else {
          this.startStage(this.currentStageIdx + 1);
        }
      });
    }, 800);
  }

  _emitEscapeParticles() {
    const W = CONFIG.CANVAS.WIDTH;
    const H = CONFIG.CANVAS.HEIGHT;
    const container = new PIXI.Container();
    this.app.stage.addChild(container);

    for (let i = 0; i < 40; i++) {
      const p = new PIXI.Graphics();
      const colors = [0xf5e6a8, 0xd4956a, 0xffffff, 0x7ee8a0];
      p.beginFill(colors[Math.floor(Math.random() * colors.length)]);
      p.drawCircle(0, 0, 2 + Math.random() * 4);
      p.endFill();
      p.x = W / 2;
      p.y = H / 2;
      container.addChild(p);

      const angle = (Math.PI * 2 * i) / 40;
      const dist = 150 + Math.random() * 150;
      if (typeof gsap !== 'undefined') {
        gsap.to(p, {
          x: W / 2 + Math.cos(angle) * dist,
          y: H / 2 + Math.sin(angle) * dist,
          alpha: 0,
          duration: 1.2 + Math.random() * 0.5,
          ease: 'power2.out',
          onComplete: () => p.destroy()
        });
      }
    }

    setTimeout(() => {
      this.app.stage.removeChild(container);
      container.destroy();
    }, 2000);
  }

  // ============ Input handling ============
  _onStagePointerDown(e) {
    if (this.state !== State.PLAYING) return;
    if (this.ui.isPopupOpen()) return;

    const pos = e.global;
    const hs = this.scene ? this.scene.hitTest(pos.x, pos.y) : null;
    if (!hs) return;

    this.audio.playTap();

    // Pulse animation
    if (this.scene.pulseHotspot) {
      this.scene.pulseHotspot(hs.id);
    }

    // Try item use first
    if (this.selectedItem && hs.onUseItem) {
      const result = hs.onUseItem(this, this.selectedItem);
      if (result) {
        this.selectedItem = null;
        this.ui.refreshInventory();
        this.processResult(result);
        return;
      }
    }

    // Normal tap
    if (hs.onTap) {
      const result = hs.onTap(this);
      if (result) this.processResult(result);
    }
  }

  processResult(result) {
    if (!result) return;

    const complete = result.complete;

    if (result.popup) {
      const popup = result.popup;
      const onCorrect = result.onCorrect;

      if (popup.type === 'info') {
        this.ui.showInfo(popup.title, popup.text);
      } else if (popup.type === 'books') {
        this.ui.showBooks(popup.title, popup.books);
      } else if (popup.type === 'keypad') {
        this.ui.showKeypad(popup.title, popup.length, popup.answer, popup.hint, onCorrect);
      }
      return;
    }

    if (result.msg) {
      this.ui.showMessage(result.msg, complete ? () => this.markStageComplete() : null);
      return;
    }

    if (complete) {
      this.markStageComplete();
    }
  }

  _update(dt) {
    if (this.scene) {
      this.scene.update(dt);
    }
  }
}

// Wait for fonts then start
document.fonts.ready.then(() => {
  new Game();
});
