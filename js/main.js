const State = { MENU: 0, PLAYING: 1 };

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

    this.currentIdx = 0;
    this.puzzle = null;

    this.menuRects = {};
    this.footerRects = {};

    this.maxUnlocked = parseInt(localStorage.getItem('theLineProgress')) || 1;

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
      if (this.puzzle && this.puzzle.drawing) {
        this.puzzle.endDraw();
      }
    });
  }

  _loadPuzzle(idx) {
    if (idx >= CONFIG.PUZZLES.length) {
      this.state = State.MENU;
      return;
    }
    this.currentIdx = idx;
    this.puzzle = new Puzzle(CONFIG.PUZZLES[idx]);
    this.state = State.PLAYING;
  }

  _onDown(x, y) {
    if (this.state === State.MENU) {
      const btn = this.menuRects.playBtn;
      if (btn && this._hit(x, y, btn)) {
        this._loadPuzzle(Math.min(this.maxUnlocked - 1, CONFIG.PUZZLES.length - 1));
        this.audio.playButton();
      }
      return;
    }

    // PLAYING
    if (!this.puzzle) return;

    // check buttons
    if (this.puzzle.completed) {
      const nb = this.footerRects.nextBtn;
      if (nb && this._hit(x, y, nb)) {
        if (this.currentIdx + 1 >= CONFIG.PUZZLES.length) {
          this.state = State.MENU;
        } else {
          this._loadPuzzle(this.currentIdx + 1);
        }
        this.audio.playButton();
      }
      return;
    }

    const rb = this.footerRects.resetBtn;
    if (rb && this._hit(x, y, rb)) {
      this.puzzle.path = [];
      this.puzzle.drawing = false;
      this.audio.playButton();
      return;
    }

    const mb = this.footerRects.menuBtn;
    if (mb && this._hit(x, y, mb)) {
      this.state = State.MENU;
      this.audio.playButton();
      return;
    }

    // start drawing if pressed on start node
    if (this.puzzle.hitStart(x, y)) {
      this.puzzle.startDraw();
      this.audio.playStart();
    }
  }

  _onMove(x, y) {
    if (this.state !== State.PLAYING || !this.puzzle) return;
    if (!this.puzzle.drawing) return;
    const prevLen = this.puzzle.path.length;
    this.puzzle.tryMove(x, y);
    if (this.puzzle.path.length !== prevLen) {
      this.audio.playMove();
    }
  }

  _onUp(x, y) {
    if (this.state !== State.PLAYING || !this.puzzle) return;
    if (!this.puzzle.drawing) return;

    const result = this.puzzle.endDraw();
    if (result === 'solved') {
      this.audio.playSolved();
      const p = this.puzzle.nodeToScreen(this.puzzle.data.end.col, this.puzzle.data.end.row);
      this.particles.emitSolved(p.x, p.y);
      // unlock next
      const nextProgress = this.currentIdx + 2;
      if (nextProgress > this.maxUnlocked) {
        this.maxUnlocked = nextProgress;
        localStorage.setItem('theLineProgress', this.maxUnlocked.toString());
      }
    } else if (result === 'failed') {
      this.audio.playFailed();
    }
  }

  _hit(x, y, r) {
    return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
  }

  _update(dt) {
    this.ui.update(dt);
    this.particles.update(dt);

    this.sparkleTimer += dt;
    if (this.sparkleTimer > 0.4) {
      this.sparkleTimer = 0;
      this.particles.emitAmbient(CONFIG.CANVAS.WIDTH, CONFIG.CANVAS.HEIGHT);
    }

    if (this.state === State.PLAYING && this.puzzle) {
      this.puzzle.update(dt);
    }
  }

  _draw() {
    const ctx = this.ctx;
    const w = CONFIG.CANVAS.WIDTH;
    const h = CONFIG.CANVAS.HEIGHT;

    ctx.save();
    ctx.scale(this.scale, this.scale);

    // bg gradient
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, CONFIG.COLORS.bgTop);
    grad.addColorStop(1, CONFIG.COLORS.bgBottom);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    this.particles.draw(ctx);

    if (this.state === State.MENU) {
      this.menuRects = this.ui.drawMenu(ctx, w, h, this.maxUnlocked) || {};
    } else if (this.state === State.PLAYING && this.puzzle) {
      this.ui.drawHeader(ctx, this.puzzle, CONFIG.PUZZLES.length);
      this.puzzle.draw(ctx);
      this.footerRects = this.ui.drawFooter(ctx, this.puzzle) || {};
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
