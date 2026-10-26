/**
 * Procedural Web Audio API sound synthesizer for cozy winter snow-plowing.
 * 100% zero external audio files. Pure mathematical synthesis.
 */

class SoundFX {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private engineGain: GainNode | null = null;
  private engineOsc: OscillatorNode | null = null;
  private engineFilter: BiquadFilterNode | null = null;
  private snowCrunchGain: GainNode | null = null;
  private snowCrunchNoise: AudioBufferSourceNode | null = null;
  private windGain: GainNode | null = null;
  private isMuted: boolean = false;
  private initialized: boolean = false;

  private initContext() {
    if (this.initialized && this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.startAmbientEngine();
      this.startAmbientSnowCrunch();
      this.startAmbientWind();
      this.initialized = true;
    } catch {
      // AudioContext could fail if blocked before interaction
    }
  }

  public resume() {
    if (!this.initialized) {
      this.initContext();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.7, this.ctx.currentTime, 0.05);
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Continuous low-frequency rumble of the diesel plow engine
  private startAmbientEngine() {
    if (!this.ctx || !this.masterGain) return;
    try {
      this.engineOsc = this.ctx.createOscillator();
      this.engineOsc.type = 'sawtooth';
      this.engineOsc.frequency.setValueAtTime(45, this.ctx.currentTime);

      this.engineFilter = this.ctx.createBiquadFilter();
      this.engineFilter.type = 'lowpass';
      this.engineFilter.frequency.setValueAtTime(140, this.ctx.currentTime);
      this.engineFilter.Q.setValueAtTime(4, this.ctx.currentTime);

      this.engineGain = this.ctx.createGain();
      this.engineGain.gain.setValueAtTime(0.04, this.ctx.currentTime);

      this.engineOsc.connect(this.engineFilter);
      this.engineFilter.connect(this.engineGain);
      this.engineGain.connect(this.masterGain);
      this.engineOsc.start();
    } catch {
      // Ignore
    }
  }

  // Continuous procedural white noise buffer for snow crunch & wind
  private createNoiseBuffer(durationSeconds = 2.0): AudioBuffer | null {
    if (!this.ctx) return null;
    const bufferSize = Math.floor(this.ctx.sampleRate * durationSeconds);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  private startAmbientSnowCrunch() {
    if (!this.ctx || !this.masterGain) return;
    const noiseBuffer = this.createNoiseBuffer(3.0);
    if (!noiseBuffer) return;

    try {
      this.snowCrunchNoise = this.ctx.createBufferSource();
      this.snowCrunchNoise.buffer = noiseBuffer;
      this.snowCrunchNoise.loop = true;

      const bandpass = this.ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(1200, this.ctx.currentTime);
      bandpass.Q.setValueAtTime(1.8, this.ctx.currentTime);

      this.snowCrunchGain = this.ctx.createGain();
      this.snowCrunchGain.gain.setValueAtTime(0, this.ctx.currentTime);

      this.snowCrunchNoise.connect(bandpass);
      bandpass.connect(this.snowCrunchGain);
      this.snowCrunchGain.connect(this.masterGain);
      this.snowCrunchNoise.start();
    } catch {
      // Ignore
    }
  }

  private startAmbientWind() {
    if (!this.ctx || !this.masterGain) return;
    const noiseBuffer = this.createNoiseBuffer(4.0);
    if (!noiseBuffer) return;

    try {
      const windSource = this.ctx.createBufferSource();
      windSource.buffer = noiseBuffer;
      windSource.loop = true;

      const lowpass = this.ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.setValueAtTime(320, this.ctx.currentTime);

      this.windGain = this.ctx.createGain();
      this.windGain.gain.setValueAtTime(0.025, this.ctx.currentTime);

      windSource.connect(lowpass);
      lowpass.connect(this.windGain);
      this.windGain.connect(this.masterGain);
      windSource.start();
    } catch {
      // Ignore
    }
  }

  // Update real-time continuous sound parameters
  public updatePlowDrive(speedRatio: number, isPlowing: boolean, isBoosting: boolean) {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Engine pitch and presence
    if (this.engineOsc && this.engineGain && this.engineFilter) {
      const targetFreq = 42 + speedRatio * 55 + (isBoosting ? 30 : 0);
      const targetFilter = 120 + speedRatio * 240 + (isBoosting ? 180 : 0);
      const targetGain = 0.04 + speedRatio * 0.1 + (isBoosting ? 0.06 : 0);
      this.engineOsc.frequency.setTargetAtTime(targetFreq, now, 0.08);
      this.engineFilter.frequency.setTargetAtTime(targetFilter, now, 0.08);
      this.engineGain.gain.setTargetAtTime(targetGain, now, 0.08);
    }

    // Snow crunch hiss
    if (this.snowCrunchGain) {
      const targetCrunchGain = isPlowing && speedRatio > 0.05 ? Math.min(0.18, 0.04 + speedRatio * 0.16) : 0;
      this.snowCrunchGain.gain.setTargetAtTime(targetCrunchGain, now, 0.06);
    }
  }

  // Musical chime when combo increments (pentatonic scale ascending)
  public playComboChime(comboLevel: number) {
    this.resume();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const baseFreqs = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00];
    const index = Math.min(Math.max(0, comboLevel - 1), baseFreqs.length - 1);
    const freq = baseFreqs[index];

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const oscHarmonic = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    oscHarmonic.type = 'sine';
    oscHarmonic.frequency.setValueAtTime(freq * 2, now);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    oscHarmonic.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    oscHarmonic.start(now);
    osc.stop(now + 0.36);
    oscHarmonic.stop(now + 0.36);
  }

  // Cash / coin collect chime
  public playCoinSound() {
    this.resume();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(987.77, now); // B5
    osc1.frequency.setValueAtTime(1318.51, now + 0.08); // E6

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1975.53, now); // B6
    osc2.frequency.setValueAtTime(2637.02, now + 0.08); // E7

    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.masterGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.3);
    osc2.stop(now + 0.3);
  }

  // Nitro boost whoosh
  public playNitroBoost() {
    this.resume();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const noiseBuffer = this.createNoiseBuffer(0.6);
    if (!noiseBuffer) return;

    const src = this.ctx.createBufferSource();
    src.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(400, now);
    filter.frequency.exponentialRampToValueAtTime(3200, now + 0.35);
    filter.Q.setValueAtTime(2.5, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    src.start(now);
    src.stop(now + 0.6);
  }

  // Heavy snowbank impact thump
  public playImpactSound(intensity = 1.0) {
    this.resume();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.25);

    gain.gain.setValueAtTime(Math.min(0.25, 0.15 * intensity), now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.26);
  }

  // Upgrade purchase success fanfare
  public playUpgradeSound() {
    this.resume();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const freqs = [330, 440, 554, 659]; // E4, A4, C#5, E5
    freqs.forEach((freq, idx) => {
      const now = this.ctx!.currentTime + idx * 0.06;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(now);
      osc.stop(now + 0.26);
    });
  }

  // Level complete / victory jingle
  public playVictoryJingle() {
    this.resume();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    // Bright ascending arpeggio and victory chord
    const notes = [
      { f: 523.25, t: 0.0, d: 0.12 }, // C5
      { f: 659.25, t: 0.12, d: 0.12 }, // E5
      { f: 783.99, t: 0.24, d: 0.12 }, // G5
      { f: 1046.50, t: 0.36, d: 0.5 }, // C6
    ];

    notes.forEach(({ f, t, d }) => {
      const now = this.ctx!.currentTime + t;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + d);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(now);
      osc.stop(now + d + 0.05);
    });
  }
}

export const soundFX = new SoundFX();
