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

  _tone(freq, dur, type = 'sine', vol = 0.1, delay = 0) {
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

  playPickup() {
    this._tone(400, 0.08, 'sine', 0.08);
  }

  playDrop() {
    this._tone(300, 0.1, 'triangle', 0.06);
  }

  playCorrect() {
    this._tone(523, 0.12, 'sine', 0.1);
    this._tone(659, 0.12, 'sine', 0.1, 0.08);
    this._tone(784, 0.18, 'sine', 0.12, 0.16);
  }

  playWrong() {
    this._tone(200, 0.2, 'sawtooth', 0.06);
    this._tone(180, 0.25, 'sawtooth', 0.04, 0.1);
  }

  playHint() {
    this._tone(600, 0.15, 'sine', 0.08);
    this._tone(800, 0.1, 'sine', 0.06, 0.1);
  }

  playKeypress() {
    this._tone(500, 0.05, 'sine', 0.04);
  }

  playStageClear() {
    [523, 659, 784, 1047].forEach((f, i) =>
      this._tone(f, 0.2, 'sine', 0.1, i * 0.1)
    );
  }

  playAllHints() {
    this._tone(440, 0.15, 'sine', 0.08);
    this._tone(550, 0.15, 'sine', 0.08, 0.1);
    this._tone(660, 0.2, 'sine', 0.1, 0.2);
  }
}
