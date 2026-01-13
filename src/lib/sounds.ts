export type SoundType = 'mechanical' | 'laptop' | 'bubble';

class SoundManager {
    private context: AudioContext | null = null;
    private gainNode: GainNode | null = null;

    constructor() {
        try {
            // Lazy init to comply with browser autoplay policies usually requiring user interaction first
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContextClass) {
                this.context = new AudioContextClass();
                this.gainNode = this.context.createGain();
                this.gainNode.connect(this.context.destination);
            }
        } catch (e) {
            console.error('Web Audio API not supported', e);
        }
    }

    private ensureContext() {
        if (this.context?.state === 'suspended') {
            this.context.resume();
        }
    }

    public setVolume(volume: number) {
        if (this.gainNode) {
            this.gainNode.gain.value = Math.max(0, Math.min(1, volume));
        }
    }

    public play(type: SoundType) {
        if (!this.context || !this.gainNode) return;
        this.ensureContext();

        const t = this.context.currentTime;
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();

        osc.connect(gain);
        gain.connect(this.gainNode);

        switch (type) {
            case 'mechanical':
                // High pitched click
                osc.frequency.setValueAtTime(600, t);
                osc.frequency.exponentialRampToValueAtTime(100, t + 0.05);
                osc.type = 'square';

                gain.gain.setValueAtTime(0.5, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);

                osc.start(t);
                osc.stop(t + 0.05);

                // Add a "thack" sound (noise buffer would be better, but another osc works for simple synth)
                const thackOsc = this.context.createOscillator();
                const thackGain = this.context.createGain();
                thackOsc.connect(thackGain);
                thackGain.connect(this.gainNode);

                thackOsc.frequency.setValueAtTime(100, t);
                thackOsc.type = 'triangle';
                thackGain.gain.setValueAtTime(0.8, t);
                thackGain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

                thackOsc.start(t);
                thackOsc.stop(t + 0.1);
                break;

            case 'laptop':
                // Softer, muted sound
                osc.frequency.setValueAtTime(300, t);
                osc.frequency.exponentialRampToValueAtTime(50, t + 0.03);
                osc.type = 'sine';

                gain.gain.setValueAtTime(0.3, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.03);

                osc.start(t);
                osc.stop(t + 0.03);
                break;

            case 'bubble':
                // Pop sound
                osc.frequency.setValueAtTime(400, t);
                osc.frequency.exponentialRampToValueAtTime(800, t + 0.1);
                osc.type = 'sine';

                gain.gain.setValueAtTime(0.5, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

                osc.start(t);
                osc.stop(t + 0.1);
                break;
        }
    }
}

// Singleton instance
export const soundManager = new SoundManager();
