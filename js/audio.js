class AudioManager {
  constructor() {
    this.ctx = null;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.initialized = true;
    } catch (e) {}
  }

  _tone(freq, dur, type = 'sine', vol = 0.08, delay = 0) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime + delay;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g);
    g.connect(this.ctx.destination);
    o.start(t);
    o.stop(t + dur);
  }

  playTap() {
    this._tone(450, 0.08, 'sine', 0.06);
  }

  playKey() {
    this._tone(600, 0.05, 'sine', 0.05);
  }

  playButton() {
    this._tone(500, 0.1, 'sine', 0.06);
  }

  playCorrect() {
    [523, 659, 784, 1047].forEach((f, i) =>
      this._tone(f, 0.25, 'sine', 0.08, i * 0.08)
    );
  }

  playWrong() {
    this._tone(220, 0.2, 'sawtooth', 0.07);
    this._tone(180, 0.25, 'sawtooth', 0.05, 0.1);
  }

  playItem() {
    this._tone(700, 0.1, 'sine', 0.06);
    this._tone(900, 0.15, 'sine', 0.05, 0.08);
  }

  playEscape() {
    [400, 500, 600, 800, 1000, 1200].forEach((f, i) =>
      this._tone(f, 0.3, 'sine', 0.1, i * 0.12)
    );
  }
}
