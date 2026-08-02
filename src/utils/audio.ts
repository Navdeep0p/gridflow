export type SoundType = 'click' | 'undo' | 'success' | 'warning' | 'error' | 'flowTick';

class AudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isUnlocked: boolean = false;

  constructor() {
    // Lazy setup on first interaction
    if (typeof window !== 'undefined') {
      const unlockEvents = ['pointerdown', 'touchstart', 'click', 'keydown'];
      const unlock = () => {
        this.init();
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume().catch((e) => console.warn('Failed to resume AudioContext:', e));
        }
        if (this.ctx && this.ctx.state === 'running') {
          this.isUnlocked = true;
          unlockEvents.forEach((evt) => window.removeEventListener(evt, unlock));
        }
      };
      unlockEvents.forEach((evt) => window.addEventListener(evt, unlock, { passive: true }));
    }
  }

  private init(): AudioContext | null {
    if (this.ctx) return this.ctx;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return null;

      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      return this.ctx;
    } catch (e) {
      console.warn('Failed to initialize central AudioContext:', e);
      return null;
    }
  }

  public async unlockContext(): Promise<void> {
    const ctx = this.init();
    if (ctx && ctx.state === 'suspended') {
      try {
        await ctx.resume();
        this.isUnlocked = true;
      } catch (e) {
        console.warn('Error unlocking AudioContext:', e);
      }
    }
  }

  public playSound(type: SoundType, volume: number = 0.8): void {
    if (volume <= 0) return;

    try {
      const ctx = this.init();
      if (!ctx || !this.masterGain) return;

      // Resume context if suspended
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      const now = ctx.currentTime;
      const gainNode = ctx.createGain();
      const scaledVol = Math.max(0.0001, Math.min(1.0, volume));
      gainNode.gain.setValueAtTime(scaledVol, now);
      gainNode.connect(this.masterGain);

      switch (type) {
        case 'click': {
          const osc = ctx.createOscillator();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(220, now);
          
          gainNode.gain.setValueAtTime(scaledVol, now);
          gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
          
          osc.connect(gainNode);
          osc.start(now);
          osc.stop(now + 0.04);
          break;
        }

        case 'flowTick': {
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(320, now);
          
          gainNode.gain.setValueAtTime(scaledVol * 0.4, now);
          gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);
          
          osc.connect(gainNode);
          osc.start(now);
          osc.stop(now + 0.03);
          break;
        }

        case 'undo': {
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(400, now);
          osc.frequency.exponentialRampToValueAtTime(250, now + 0.15);
          
          gainNode.gain.setValueAtTime(scaledVol, now);
          gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
          
          osc.connect(gainNode);
          osc.start(now);
          osc.stop(now + 0.15);
          break;
        }

        case 'success': {
          const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
          notes.forEach((freq, idx) => {
            const noteOsc = ctx.createOscillator();
            const noteGain = ctx.createGain();
            const noteStartTime = now + idx * 0.08;
            
            noteOsc.type = 'sine';
            noteOsc.frequency.setValueAtTime(freq, noteStartTime);
            
            noteGain.gain.setValueAtTime(scaledVol * 0.5, noteStartTime);
            noteGain.gain.exponentialRampToValueAtTime(0.0001, noteStartTime + 0.22);
            
            noteOsc.connect(noteGain);
            noteGain.connect(this.masterGain!);
            
            noteOsc.start(noteStartTime);
            noteOsc.stop(noteStartTime + 0.22);
          });
          break;
        }

        case 'warning': {
          const osc = ctx.createOscillator();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(220, now);
          
          gainNode.gain.setValueAtTime(scaledVol * 0.7, now);
          gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
          
          osc.connect(gainNode);
          osc.start(now);
          osc.stop(now + 0.2);
          break;
        }

        case 'error': {
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          
          osc1.type = 'sawtooth';
          osc1.frequency.setValueAtTime(150, now);
          osc2.type = 'square';
          osc2.frequency.setValueAtTime(155, now);
          
          gainNode.gain.setValueAtTime(scaledVol * 0.5, now);
          gainNode.gain.linearRampToValueAtTime(0.0001, now + 0.35);
          
          osc1.connect(gainNode);
          osc2.connect(gainNode);
          
          osc1.start(now);
          osc2.start(now);
          osc1.stop(now + 0.35);
          osc2.stop(now + 0.35);
          break;
        }
      }
    } catch (e) {
      console.warn('Centralized sound playback failed:', e);
    }
  }
}

export const audioManager = new AudioManager();
