// Subsea Audio Synthesizer using Web Audio API

class SoundSystem {
  constructor() {
    this.ctx = null;
    this.ambientGain = null;
    this.ambientOsc = null;
    this.isMuted = false;
    this.isAmbientPlaying = false;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Resonant 1.2kHz Hydrographic Sonar Ping
  playSonarPing(freq = 1250, duration = 1.4) {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // Bandpass underwater acoustic filter
      filter.type = 'bandpass';
      filter.frequency.value = freq;
      filter.Q.value = 8.0;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.85, this.ctx.currentTime + duration);

      // Attack and exponential ocean reverb decay
      gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.22, this.ctx.currentTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime);
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn("Audio play error:", e);
    }
  }

  // Target Classification Beep
  playTargetLock() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(1760, now + 0.08);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {
      console.warn("Audio lock error:", e);
    }
  }

  // Subtle Ambient Deep Ocean Hum
  toggleAmbient(enable) {
    try {
      this.init();
      if (!this.ctx) return;

      if (!enable || this.isMuted) {
        if (this.ambientOsc) {
          this.ambientGain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.5);
          setTimeout(() => {
            if (this.ambientOsc) {
              this.ambientOsc.stop();
              this.ambientOsc.disconnect();
              this.ambientOsc = null;
            }
          }, 500);
        }
        this.isAmbientPlaying = false;
        return;
      }

      if (this.ambientOsc) return;

      this.ambientOsc = this.ctx.createOscillator();
      this.ambientGain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.value = 180;

      this.ambientOsc.type = 'sawtooth';
      this.ambientOsc.frequency.value = 54; // Deep 54Hz abyssal hum

      this.ambientGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      this.ambientGain.gain.linearRampToValueAtTime(0.025, this.ctx.currentTime + 1.0);

      this.ambientOsc.connect(filter);
      filter.connect(this.ambientGain);
      this.ambientGain.connect(this.ctx.destination);

      this.ambientOsc.start();
      this.isAmbientPlaying = true;
    } catch (e) {
      console.warn("Ambient audio error:", e);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted && this.ambientOsc) {
      this.toggleAmbient(false);
    }
    return this.isMuted;
  }
}

export const soundFx = new SoundSystem();
