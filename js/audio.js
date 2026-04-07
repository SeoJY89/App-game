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
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }

  _playTone(frequency, duration, type = 'sine', volume = 0.15) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + duration);
  }

  playPop(pitch = 0) {
    const baseFreq = 600 + pitch * 80;
    this._playTone(baseFreq, 0.12, 'sine', 0.12);
    setTimeout(() => this._playTone(baseFreq * 1.5, 0.08, 'sine', 0.06), 30);
  }

  playCombo(level) {
    const baseFreq = 500 + level * 60;
    for (let i = 0; i < Math.min(level, 4); i++) {
      setTimeout(() => this._playTone(baseFreq + i * 100, 0.1, 'sine', 0.1), i * 50);
    }
  }

  playMiss() {
    this._playTone(250, 0.2, 'triangle', 0.1);
    setTimeout(() => this._playTone(180, 0.3, 'triangle', 0.08), 100);
  }

  playGameOver() {
    const notes = [400, 350, 300, 200];
    notes.forEach((freq, i) => {
      setTimeout(() => this._playTone(freq, 0.25, 'sine', 0.1), i * 150);
    });
  }

  playFever() {
    const notes = [500, 600, 700, 900];
    notes.forEach((freq, i) => {
      setTimeout(() => this._playTone(freq, 0.15, 'sine', 0.12), i * 80);
    });
  }

  playStart() {
    this._playTone(400, 0.15, 'sine', 0.1);
    setTimeout(() => this._playTone(600, 0.15, 'sine', 0.1), 120);
    setTimeout(() => this._playTone(800, 0.2, 'sine', 0.12), 240);
  }
}
