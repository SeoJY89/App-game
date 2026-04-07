const State = { MENU: 0, TUTORIAL: 1, PLAYING: 2, COLLECTION: 3 };

class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.audio = new AudioManager();
    this.particles = new ParticleSystem();
    this.board = new Board(this.audio, this.particles);
    this.orders = new OrderManager();
    this.ui = new UI();

    this.state = State.MENU;
    this.scale = 1;
    this.lastTime = 0;
    this.saveTimer = 0;
    this.sparkleTimer = 0;
    this.uiRects = {};

    this._setupCanvas();
    this._setupEvents();

    // try load saved game
    const saved = SaveManager.load();
    if (saved) {
      this.board.deserialize(saved.board);
      this.orders.deserialize(saved.orders);
    }

    document.fonts.ready.then(() => {
      requestAnimationFrame((t) => this._loop(t));
    });
  }

  _setupCanvas() {
    const resize = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const target = CONFIG.CANVAS.WIDTH / CONFIG.CANVAS.HEIGHT;
      const screen = vw / vh;
      if (screen > target) {
        this.canvas.height = vh;
        this.canvas.width = vh * target;
      } else {
        this.canvas.width = vw;
        this.canvas.height = vw / target;
      }
      this.scale = this.canvas.width / CONFIG.CANVAS.WIDTH;
    };
    window.addEventListener('resize', resize);
    resize();
  }

  _setupEvents() {
    const getPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      return {
        x: (e.clientX - rect.left) / this.scale,
        y: (e.clientY - rect.top) / this.scale
      };
    };

    this.canvas.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.audio.init();
      const pos = getPos(e);
      this._handleDown(pos.x, pos.y);
    }, { passive: false });

    this.canvas.addEventListener('pointermove', (e) => {
      e.preventDefault();
      const pos = getPos(e);
      this._handleMove(pos.x, pos.y);
    }, { passive: false });

    this.canvas.addEventListener('pointerup', (e) => {
      e.preventDefault();
      const pos = getPos(e);
      this._handleUp(pos.x, pos.y);
    }, { passive: false });

    this.canvas.addEventListener('pointercancel', (e) => {
      if (this.board.dragging) {
        this.board.dragging.targetScale = 1;
        this.board.dragging.setGridPos(this.board.dragStartGX, this.board.dragStartGY);
        this.board.dragging = null;
      }
    });
  }

  _handleDown(x, y) {
    if (this.state === State.MENU) {
      this.state = SaveManager.hasSave() ? State.PLAYING : State.TUTORIAL;
      if (this.state === State.TUTORIAL) {
        this.ui.tutorialStep = 0;
      }
      if (!SaveManager.hasSave()) {
        this.orders.init();
      }
      this.audio.playStart();
      return;
    }

    if (this.state === State.TUTORIAL) {
      this.ui.tutorialStep++;
      if (this.ui.tutorialStep >= 3) {
        this.state = State.PLAYING;
      }
      return;
    }

    if (this.state === State.COLLECTION) {
      const btn = this.uiRects.closeBtn;
      if (btn && x >= btn.x && x <= btn.x + btn.w && y >= btn.y && y <= btn.y + btn.h) {
        this.state = State.PLAYING;
      }
      return;
    }

    // PLAYING state
    // check collection button
    const colBtn = this.uiRects.collectionBtn;
    if (colBtn && x >= colBtn.x && x <= colBtn.x + colBtn.w && y >= colBtn.y && y <= colBtn.y + colBtn.h) {
      this.state = State.COLLECTION;
      return;
    }

    // check if tapping an item on the board (for delivery)
    const gp = this.board.getGridPos(x, y);
    if (gp) {
      const item = this.board.grid[gp.row][gp.col];
      if (item && !item.removing) {
        // try deliver first on single tap (will be checked on up as well)
        this._tapTarget = item;
      }
    }

    // delegate to board (generators + drag start)
    const result = this.board.handlePointerDown(x, y);
    if (result === 'generator') {
      this.ui.hintTimer = 0; // reset hint on action
    }
  }

  _handleMove(x, y) {
    if (this.state !== State.PLAYING) return;
    this.board.handlePointerMove(x, y);
    if (this.board.dragging) {
      this._tapTarget = null; // moved, not a tap
    }
  }

  _handleUp(x, y) {
    if (this.state !== State.PLAYING) return;

    // if we were dragging, handle drop
    if (this.board.dragging) {
      const result = this.board.handlePointerUp(x, y);
      this.ui.hintTimer = 0;
      return;
    }

    // tap delivery: if user tapped (didn't drag) on an item
    if (this._tapTarget) {
      const item = this._tapTarget;
      this._tapTarget = null;

      const order = this.orders.tryDeliver(item);
      if (order) {
        const pos = this.board.getScreenPos(item.gridX, item.gridY);
        this.particles.emitSpawn(pos.x, pos.y);
        this.audio.playSpawn();
        this.board.removeItem(item);
        this.ui.hintTimer = 0;
      }
    }
  }

  _update(dt) {
    this.ui.update(dt);
    this.particles.update(dt);

    // background sparkle
    this.sparkleTimer += dt * 1000;
    if (this.sparkleTimer > 400) {
      this.sparkleTimer -= 400;
      this.particles.emitSparkle(CONFIG.CANVAS.WIDTH, CONFIG.CANVAS.HEIGHT);
    }

    if (this.state === State.PLAYING) {
      this.board.update(dt);
      this.orders.update(dt);
      this.orders.collectCompleted(this.particles, this.audio);

      // auto save
      this.saveTimer += dt;
      if (this.saveTimer > 30) {
        this.saveTimer = 0;
        SaveManager.save(this.board, this.orders);
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

    // background particles
    this.particles.draw(ctx);

    if (this.state === State.MENU) {
      this.ui.drawMenu(ctx, w, h);
    } else {
      // top bar
      this.uiRects = this.ui.drawTopBar(ctx, this.orders.stars, this.board.energy, CONFIG.ENERGY.max);

      // orders
      this.orders.draw(ctx);

      // board
      this.board.draw(ctx);

      // hint
      const g = CONFIG.GRID;
      let hasItems = false;
      for (let r = 0; r < g.ROWS && !hasItems; r++)
        for (let c = 0; c < g.COLS && !hasItems; c++)
          if (this.board.grid[r][c]) hasItems = true;

      if (hasItems) {
        this.ui.drawHint(ctx, '💡 같은 아이템끼리 합쳐보세요!', w);
      } else {
        this.ui.drawHint(ctx, '👆 위 버튼을 탭해서 아이템을 만드세요!', w);
      }

      // tutorial overlay
      if (this.state === State.TUTORIAL) {
        this.ui.drawTutorial(ctx, this.ui.tutorialStep, w, h);
      }

      // collection overlay
      if (this.state === State.COLLECTION) {
        const rects = this.ui.drawCollection(ctx, this.board.discovered, w, h);
        if (rects) Object.assign(this.uiRects, rects);
      }
    }

    ctx.restore();
  }

  _loop(timestamp) {
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05);
    this.lastTime = timestamp;
    this._update(dt);
    this._draw();
    requestAnimationFrame((t) => this._loop(t));
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new Game();
});
