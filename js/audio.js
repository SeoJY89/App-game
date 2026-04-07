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

  _playTone(freq, duration, type = 'sine', vol = 0.12, delay = 0) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + duration);
  }

  playSpawn() {
    this._playTone(500, 0.1, 'sine', 0.08);
    this._playTone(700, 0.1, 'sine', 0.06, 0.05);
  }

  playMerge(level) {
    const base = 400 + level * 80;
    this._playTone(base, 0.12, 'sine', 0.1);
    this._playTone(base * 1.25, 0.12, 'sine', 0.08, 0.06);
    this._playTone(base * 1.5, 0.15, 'sine', 0.1, 0.12);
    if (level >= 5) {
      this._playTone(base * 2, 0.2, 'sine', 0.06, 0.18);
    }
  }

  playDeliver() {
    const notes = [600, 750, 900, 1100];
    notes.forEach((f, i) => this._playTone(f, 0.12, 'sine', 0.1, i * 0.06));
  }

  playDrop() {
    this._playTone(300, 0.08, 'triangle', 0.06);
  }

  playError() {
    this._playTone(200, 0.15, 'triangle', 0.08);
  }

  playStart() {
    this._playTone(400, 0.12, 'sine', 0.08);
    this._playTone(600, 0.12, 'sine', 0.08, 0.1);
    this._playTone(800, 0.18, 'sine', 0.1, 0.2);
  }
}
