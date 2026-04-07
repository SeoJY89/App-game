const State = { MENU: 0, PLAYING: 1, GAME_OVER: 2 };

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
    this.playAgainBtn = null;

    this._resetGame();
    this._setupCanvas();
    this._setupEvents();

    // load high score
    this.highScore = parseInt(localStorage.getItem('mochiPopHighScore')) || 0;

    // start loop
    document.fonts.ready.then(() => {
      requestAnimationFrame((t) => this._loop(t));
    });
  }

  _resetGame() {
    this.score = 0;
    this.lives = CONFIG.GAME.initialLives;
    this.combo = 0;
    this.lastPopTime = 0;
    this.mochis = [];
    this.spawnTimer = 0;
    this.gameTime = 0;
    this.currentSpawnInterval = CONFIG.DIFFICULTY.initialSpawnInterval;
    this.speedMultiplier = 1;
    this.feverActive = false;
    this.feverTimer = 0;
    this.feverTriggered = new Set();
    this.isNewBest = false;
    this.sparkleTimer = 0;
  }

  _setupCanvas() {
    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const targetRatio = CONFIG.CANVAS.WIDTH / CONFIG.CANVAS.HEIGHT;
      const screenRatio = w / h;

      if (screenRatio > targetRatio) {
        this.canvas.height = h;
        this.canvas.width = h * targetRatio;
      } else {
        this.canvas.width = w;
        this.canvas.height = w / targetRatio;
      }
      this.scale = this.canvas.width / CONFIG.CANVAS.WIDTH;
    };
    window.addEventListener('resize', resize);
    resize();
  }

  _setupEvents() {
    const handler = (e) => {
      e.preventDefault();
      this.audio.init();

      const rect = this.canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / this.scale;
      const y = (e.clientY - rect.top) / this.scale;
      this._handleInput(x, y);
    };

    this.canvas.addEventListener('pointerdown', handler, { passive: false });
  }

  _handleInput(x, y) {
    if (this.state === State.MENU) {
      this.state = State.PLAYING;
      this._resetGame();
      this.audio.playStart();
      this.ui.menuMochi = null;
      return;
    }

    if (this.state === State.GAME_OVER) {
      if (this.playAgainBtn) {
        const b = this.playAgainBtn;
        if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
          this.state = State.MENU;
        }
      }
      return;
    }

    // playing - check mochi hits (reverse order for topmost first)
    for (let i = this.mochis.length - 1; i >= 0; i--) {
      const m = this.mochis[i];
      if (m.popping) continue;

      if (m.hitTest(x, y)) {
        const baseScore = m.pop();
        const now = Date.now();

        // combo logic
        if (now - this.lastPopTime < CONFIG.GAME.comboTimeout) {
          this.combo = Math.min(this.combo + 1, CONFIG.GAME.maxCombo);
        } else {
          this.combo = 1;
        }
        this.lastPopTime = now;

        // calculate score
        let points = baseScore * this.combo;
        if (this.feverActive) points *= CONFIG.GAME.feverScoreMultiplier;
        this.score += points;

        // effects
        const px = m.x + m.wobbleX;
        const py = m.y;
        this.particles.emitPop(px, py, m.color);
        this.audio.playPop(m.colorIndex >= 0 ? m.colorIndex : 3);

        if (this.combo >= 3) {
          this.particles.emitCombo(px, py, this.combo);
          this.ui.addComboText(px, py - 30, this.combo);
          this.audio.playCombo(this.combo);
        }

        // check fever thresholds
        for (const threshold of CONFIG.GAME.feverThresholds) {
          if (this.score >= threshold && !this.feverTriggered.has(threshold)) {
            this.feverTriggered.add(threshold);
            this.feverActive = true;
            this.feverTimer = CONFIG.GAME.feverDuration;
            this.audio.playFever();
          }
        }

        // update high score
        if (this.score > this.highScore) {
          this.highScore = this.score;
          this.isNewBest = true;
        }

        break; // only pop one per tap
      }
    }
  }

  _spawnMochi() {
    this.mochis.push(new Mochi(CONFIG.CANVAS.WIDTH, CONFIG.CANVAS.HEIGHT, this.speedMultiplier));
  }

  _update(dt) {
    this.ui.update(dt);
    this.particles.update(dt);

    // background sparkles (all states)
    this.sparkleTimer += dt * 1000;
    if (this.sparkleTimer >= CONFIG.PARTICLES.sparkleInterval) {
      this.sparkleTimer -= CONFIG.PARTICLES.sparkleInterval;
      this.particles.emitSparkle(CONFIG.CANVAS.WIDTH, CONFIG.CANVAS.HEIGHT);
    }

    if (this.state !== State.PLAYING) return;

    this.gameTime += dt;

    // difficulty increase
    this.currentSpawnInterval = Math.max(
      CONFIG.DIFFICULTY.minSpawnInterval,
      CONFIG.DIFFICULTY.initialSpawnInterval - this.gameTime * CONFIG.DIFFICULTY.spawnIntervalDecrease
    );
    this.speedMultiplier = Math.min(
      CONFIG.DIFFICULTY.maxSpeedMultiplier,
      1 + this.gameTime * CONFIG.DIFFICULTY.speedIncreasePerSecond / 60
    );

    // fever timer
    if (this.feverActive) {
      this.feverTimer -= dt * 1000;
      if (this.feverTimer <= 0) {
        this.feverActive = false;
        this.feverTimer = 0;
      }
    }

    // spawn mochi
    this.spawnTimer += dt * 1000;
    const spawnInterval = this.feverActive ? this.currentSpawnInterval * 0.5 : this.currentSpawnInterval;
    if (this.spawnTimer >= spawnInterval) {
      this.spawnTimer -= spawnInterval;
      this._spawnMochi();
    }

    // update mochis
    for (let i = this.mochis.length - 1; i >= 0; i--) {
      const m = this.mochis[i];
      m.update(dt);

      if (!m.alive) {
        if (m.escaped) {
          this.lives--;
          this.audio.playMiss();
          // screen shake would go here
          if (this.lives <= 0) {
            this._gameOver();
          }
        }
        this.mochis.splice(i, 1);
      }
    }
  }

  _gameOver() {
    this.state = State.GAME_OVER;
    this.audio.playGameOver();
    localStorage.setItem('mochiPopHighScore', this.highScore.toString());
  }

  _draw() {
    const ctx = this.ctx;
    const w = CONFIG.CANVAS.WIDTH;
    const h = CONFIG.CANVAS.HEIGHT;

    ctx.save();
    ctx.scale(this.scale, this.scale);

    // background gradient
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, CONFIG.COLORS.backgroundTop);
    grad.addColorStop(1, CONFIG.COLORS.background);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // background particles
    this.particles.draw(ctx);

    if (this.state === State.MENU) {
      this.ui.drawMenu(ctx, w, h, this.highScore);
    }

    if (this.state === State.PLAYING || this.state === State.GAME_OVER) {
      // draw mochis
      for (const m of this.mochis) {
        m.draw(ctx);
      }

      // UI
      this.ui.drawScore(ctx, this.score, this.highScore, w);
      this.ui.drawLives(ctx, this.lives);
      this.ui.drawComboTexts(ctx);

      if (this.feverActive) {
        this.ui.drawFever(ctx, this.feverTimer, w, h);
      }
    }

    if (this.state === State.GAME_OVER) {
      this.playAgainBtn = this.ui.drawGameOver(ctx, w, h, this.score, this.highScore, this.isNewBest);
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

// Start game when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  new Game();
});
