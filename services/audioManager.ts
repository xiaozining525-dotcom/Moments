
export class AudioManager {
  private ctx: AudioContext | null = null;
  private bgmGain: GainNode | null = null;
  private bgmOscillators: OscillatorNode[] = [];
  private bgmBuffer: AudioBuffer | null = null;
  private bgmSource: AudioBufferSourceNode | null = null;
  private isBgmPlaying: boolean = false;
  private masterGain: GainNode | null = null;

  constructor() {
    // Lazy initialization handled in init()
  }

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.masterGain.gain.value = 0.5; // Master volume
      
      // Attempt to load custom BGM
      this.loadBGM();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private async loadBGM() {
    if (!this.ctx) return;
    try {
      const response = await fetch('/bgm.mp3');
      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        this.bgmBuffer = await this.ctx.decodeAudioData(arrayBuffer);
      }
    } catch (e) {
      console.log('Custom BGM not found, using synthesizer fallback.');
    }
  }

  public setVolume(val: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(val, this.ctx.currentTime);
    }
  }

  // --- BGM: Ambient Drone or File ---
  public toggleBGM(enable: boolean) {
    this.init();
    if (!this.ctx) return;

    if (enable && !this.isBgmPlaying) {
      this.startBGM();
    } else if (!enable && this.isBgmPlaying) {
      this.stopBGM();
    }
  }

  private startBGM() {
    if (!this.ctx) return;
    this.stopBGM(); // Clear existing

    this.bgmGain = this.ctx.createGain();
    this.bgmGain.gain.value = 0; // Fade in start
    this.bgmGain.connect(this.masterGain!);

    // Check if we have a loaded BGM file
    if (this.bgmBuffer) {
      this.bgmSource = this.ctx.createBufferSource();
      this.bgmSource.buffer = this.bgmBuffer;
      this.bgmSource.loop = true;
      this.bgmSource.connect(this.bgmGain);
      this.bgmSource.start();
    } else {
      // Fallback: Create a "Zen" chord synthesizer
      const freqs = [110, 164.81, 220, 111]; // A2, E3, A3, slightly detuned A2
      
      freqs.forEach(freq => {
        const osc = this.ctx!.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;
        osc.connect(this.bgmGain!);
        osc.start();
        this.bgmOscillators.push(osc);
      });
    }

    // Fade in
    this.bgmGain.gain.linearRampToValueAtTime(0.3, this.ctx.currentTime + 3);
    this.isBgmPlaying = true;
  }

  private stopBGM() {
    if (this.bgmGain && this.ctx) {
      // Fade out
      this.bgmGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.bgmGain.gain.setValueAtTime(this.bgmGain.gain.value, this.ctx.currentTime);
      this.bgmGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1.5);
      
      setTimeout(() => {
        // Stop Oscillators
        this.bgmOscillators.forEach(osc => {
            try { osc.stop(); } catch(e) {}
        });
        this.bgmOscillators = [];
        
        // Stop File Source
        if (this.bgmSource) {
            try { this.bgmSource.stop(); } catch(e) {}
            this.bgmSource = null;
        }

        if (this.bgmGain) {
            this.bgmGain.disconnect();
            this.bgmGain = null;
        }
        this.isBgmPlaying = false;
      }, 1500);
    }
  }
}

export const audioManager = new AudioManager();
