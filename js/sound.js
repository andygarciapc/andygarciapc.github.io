/**
 * Sound Manager
 * Handles audio effects (optional, muted by default)
 */

class SoundManager {
  constructor() {
    this.enabled = false;
    this.sounds = {};
    this.audioContext = null;
  }

  /**
   * Initialize the sound system
   */
  init() {
    // Load saved preference
    this.enabled = localStorage.getItem('portfolio_sound') === 'true';

    // Create audio context on first user interaction
    document.addEventListener('click', () => this.initAudioContext(), { once: true });
  }

  /**
   * Initialize Web Audio API context
   */
  initAudioContext() {
    if (this.audioContext) return;

    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }

  /**
   * Enable/disable sound
   */
  setEnabled(enabled) {
    this.enabled = enabled;
    localStorage.setItem('portfolio_sound', enabled);
  }

  /**
   * Play a synthesized sound effect
   */
  play(soundName) {
    if (!this.enabled || !this.audioContext) return;

    try {
      switch (soundName) {
        case 'click':
          this.playClick();
          break;
        case 'collect':
          this.playCollect();
          break;
        case 'levelup':
          this.playLevelUp();
          break;
        case 'achievement':
          this.playAchievement();
          break;
        case 'powerup':
          this.playPowerUp();
          break;
        default:
          this.playClick();
      }
    } catch (e) {
      console.warn('Sound play failed:', e);
    }
  }

  /**
   * Play a simple click sound
   */
  playClick() {
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(800, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.1);

    gain.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    osc.start();
    osc.stop(this.audioContext.currentTime + 0.1);
  }

  /**
   * Play a collect/coin sound
   */
  playCollect() {
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(587.33, this.audioContext.currentTime);
    osc.frequency.setValueAtTime(880, this.audioContext.currentTime + 0.1);

    gain.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    osc.start();
    osc.stop(this.audioContext.currentTime + 0.2);
  }

  /**
   * Play level up fanfare
   */
  playLevelUp() {
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    const now = this.audioContext.currentTime;

    notes.forEach((freq, i) => {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now + i * 0.1);

      gain.gain.setValueAtTime(0.1, now + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.3);

      osc.connect(gain);
      gain.connect(this.audioContext.destination);

      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.3);
    });
  }

  /**
   * Play achievement unlock sound
   */
  playAchievement() {
    const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
    const now = this.audioContext.currentTime;

    notes.forEach((freq, i) => {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);

      gain.gain.setValueAtTime(0.15, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.4);

      osc.connect(gain);
      gain.connect(this.audioContext.destination);

      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.4);
    });
  }

  /**
   * Play power up sound (for Konami code etc)
   */
  playPowerUp() {
    const now = this.audioContext.currentTime;

    // Rising sweep
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(1600, now + 0.5);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.setValueAtTime(0.1, now + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    osc.start();
    osc.stop(now + 0.6);
  }
}

// Export singleton
const soundManager = new SoundManager();
export default soundManager;
