// src/utils/audioSystem.ts

class RetroAudioSystem {
    private ctx: AudioContext | null = null;
    private masterGain: GainNode | null = null;
    private initialized: boolean = false;
    private _muted: boolean = false;

    public get isMuted() {
        return this._muted;
    }

    public toggleMute() {
        this._muted = !this._muted;
        if (this.masterGain) {
            this.masterGain.gain.value = this._muted ? 0 : 0.4;
        }
        return this._muted;
    }

    public init() {
        if (this.initialized) return;

        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) {
            console.warn('Web Audio API not supported in this browser');
            return;
        }

        this.ctx = new AudioContextClass();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.4; // Overall volume
        this.masterGain.connect(this.ctx.destination);

        this.initialized = true;
        this.resume();
    }

    private resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(err => console.error("Audio resume failed:", err));
        }
    }

    // Short crisp tick for typing text
    public playTyping() {
        if (this._muted) return;
        this.playTone(1200, 'square', 0.005, 0.02, 0.05);
    }

    // A light, high-pitched tech sound for UI hovering
    public playHover() {
        this.playTone(800, 'square', 0.01, 0.05, 0.05);
    }

    // Solid beep for clicking buttons
    public playClick() {
        this.playTone(600, 'sine', 0.01, 0.1, 0.2);
    }

    // Deep satisfying thud for dropping cards
    public playDrop() {
        this.playTone(150, 'triangle', 0.05, 0.2, 0.3, true);
    }

    // Discordant double-beep for invalid actions
    public playError() {
        this.playTone(150, 'sawtooth', 0.05, 0.2, 0.2);
        setTimeout(() => this.playTone(120, 'sawtooth', 0.05, 0.2, 0.2), 150);
    }

    // Arpeggio for positive feedback (level ups, happy guests)
    public playSuccess() {
        if (this._muted) return;
        this.resume();
        if (!this.ctx || !this.masterGain) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.setValueAtTime(504, now + 0.1); // Major third
        osc.frequency.setValueAtTime(599, now + 0.2); // Perfect fifth
        osc.frequency.setValueAtTime(800, now + 0.3); // Octave

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.15, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.5);
    }

    // Descending or chaotic noise for burning/venting
    public playBurn() {
        this.playTone(400, 'sawtooth', 0.1, 0.4, 0.1, true);
        setTimeout(() => this.playTone(200, 'square', 0.1, 0.4, 0.1, true), 100);
    }

    // Hissing airlock for new guests arriving
    public playAirlockHiss() {
        this.resume();
        if (!this.ctx || !this.masterGain) return;

        const now = this.ctx.currentTime;

        // To make white noise, we use an AudioBuffer
        const bufferSize = this.ctx.sampleRate * 1; // 1 second buffer
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        const noiseSource = this.ctx.createBufferSource();
        noiseSource.buffer = buffer;

        // Use a lowpass filter to make it sound muffled/airy
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, now);
        filter.frequency.exponentialRampToValueAtTime(100, now + 1);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.2, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 1);

        noiseSource.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        noiseSource.start(now);
    }

    private playTone(
        freq: number,
        type: OscillatorType,
        attack: number,
        decay: number,
        volume: number = 0.2,
        pitchDrop: boolean = false
    ) {
        if (this._muted) return;
        this.resume();
        if (!this.ctx || !this.masterGain) return;
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, now);
        if (pitchDrop) {
            osc.frequency.exponentialRampToValueAtTime(Math.max(freq / 4, 20), now + decay);
        }

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(volume, now + attack);
        gain.gain.exponentialRampToValueAtTime(0.01, now + attack + decay);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + attack + decay);
    }
}

export const audioSystem = new RetroAudioSystem();
