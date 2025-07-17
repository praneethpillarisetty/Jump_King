class SoundManager {
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();

  constructor() {
    // Initialize Web Audio API
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  // Generate simple sound effects using Web Audio API
  private createTone(frequency: number, duration: number, type: OscillatorType = 'sine'): AudioBuffer {
    if (!this.audioContext) throw new Error('Audio context not available');
    
    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      let value = 0;
      
      switch (type) {
        case 'sine':
          value = Math.sin(2 * Math.PI * frequency * t);
          break;
        case 'square':
          value = Math.sin(2 * Math.PI * frequency * t) > 0 ? 1 : -1;
          break;
        case 'sawtooth':
          value = 2 * (t * frequency - Math.floor(t * frequency + 0.5));
          break;
      }
      
      // Apply envelope
      const envelope = Math.exp(-t * 5); // Exponential decay
      data[i] = value * envelope * 0.3;
    }

    return buffer;
  }

  async initializeSounds() {
    if (!this.audioContext) return;

    try {
      // Generate sound effects
      this.sounds.set('jump', this.createTone(450, 0.15, 'square'));
      this.sounds.set('land', this.createTone(200, 0.1, 'sine'));
      this.sounds.set('charge', this.createTone(300, 0.08, 'sine'));
      this.sounds.set('death', this.createTone(150, 1.0, 'sawtooth'));
      this.sounds.set('fall_small', this.createTone(300, 0.3, 'sawtooth'));
      this.sounds.set('fall_medium', this.createTone(250, 0.5, 'sawtooth'));
      this.sounds.set('fall_big', this.createTone(150, 0.8, 'sawtooth'));
    } catch (error) {
      console.warn('Could not initialize sounds:', error);
    }
  }

  playSound(soundName: string) {
    if (!this.audioContext || !this.sounds.has(soundName)) return;

    try {
      // Resume audio context if suspended (required by some browsers)
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      const buffer = this.sounds.get(soundName)!;
      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(this.audioContext.destination);
      source.start();
    } catch (error) {
      console.warn('Could not play sound:', error);
    }
  }

  playFallSound(severity: number) {
    const soundMap = ['', 'fall_small', 'fall_medium', 'fall_big'];
    if (severity > 0 && severity < soundMap.length) {
      this.playSound(soundMap[severity]);
    }
  }

  playDeathSound() {
    this.playSound('death');
  }
}

export const soundManager = new SoundManager();