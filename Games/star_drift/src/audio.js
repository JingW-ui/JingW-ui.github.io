/**
 * 音频管理系统 - 音效与背景音乐
 */
class AudioManager {
    constructor() {
        this.enabled = true;
        this.musicEnabled = true;
        this.sounds = {};
        this.music = null;
        this.masterVolume = 0.7;
        this.sfxVolume = 0.8;
        this.musicVolume = 0.4;

        // Web Audio API 上下文
        this.audioContext = null;
        this.initAudioContext();
    }

    initAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported');
        }
    }

    /**
     * 生成激光射击音效 (程序化生成)
     */
    playShoot() {
        if (!this.enabled || !this.audioContext) return;

        const ctx = this.audioContext;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(800, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.15);

        gainNode.gain.setValueAtTime(this.sfxVolume * 0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.15);
    }

    /**
     * 生成爆炸音效
     */
    playExplosion() {
        if (!this.enabled || !this.audioContext) return;

        const ctx = this.audioContext;

        // 噪声缓冲
        const bufferSize = ctx.sampleRate * 0.5;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(this.sfxVolume * 0.5, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

        // 低通滤波器
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.5);

        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);

        noise.start(ctx.currentTime);
    }

    /**
     * 生成击中音效
     */
    playHit() {
        if (!this.enabled || !this.audioContext) return;

        const ctx = this.audioContext;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(400, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);

        gainNode.gain.setValueAtTime(this.sfxVolume * 0.2, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.1);
    }

    /**
     * 生成收集音效
     */
    playCollect() {
        if (!this.enabled || !this.audioContext) return;

        const ctx = this.audioContext;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(600, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);

        gainNode.gain.setValueAtTime(this.sfxVolume * 0.2, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.2);
    }

    /**
     * 生成警告音效
     */
    playWarning() {
        if (!this.enabled || !this.audioContext) return;

        const ctx = this.audioContext;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(300, ctx.currentTime);
        oscillator.frequency.setValueAtTime(400, ctx.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(300, ctx.currentTime + 0.2);

        gainNode.gain.setValueAtTime(this.sfxVolume * 0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.3);
    }

    /**
     * 生成引擎音效 (持续)
     */
    createEngineSound() {
        if (!this.enabled || !this.audioContext) return null;

        const ctx = this.audioContext;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(80, ctx.currentTime);

        gainNode.gain.setValueAtTime(0, ctx.currentTime);

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start(ctx.currentTime);

        return { oscillator, gainNode };
    }

    /**
     * 更新引擎音效强度
     */
    updateEngineSound(engineSound, intensity) {
        if (!engineSound || !this.audioContext) return;

        const { oscillator, gainNode } = engineSound;
        const ctx = this.audioContext;

        oscillator.frequency.setTargetAtTime(80 + intensity * 100, ctx.currentTime, 0.1);
        gainNode.gain.setTargetAtTime(intensity * this.sfxVolume * 0.1, ctx.currentTime, 0.1);
    }

    /**
     * 停止引擎音效
     */
    stopEngineSound(engineSound) {
        if (!engineSound || !this.audioContext) return;

        const { oscillator, gainNode } = engineSound;
        const ctx = this.audioContext;

        gainNode.gain.setTargetAtTime(0, ctx.currentTime, 0.1);
        setTimeout(() => {
            try {
                oscillator.stop();
            } catch (e) {}
        }, 200);
    }

    /**
     * 播放背景音乐 (程序化生成简单循环)
     */
    playMusic() {
        if (!this.musicEnabled || !this.audioContext) return;

        // 简单的环境音
        this.createAmbientDrone();
    }

    createAmbientDrone() {
        const ctx = this.audioContext;

        // 创建多个振荡器形成和弦
        const frequencies = [55, 82.5, 110, 165]; // 低八度五声音阶
        const oscillators = [];
        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(this.musicVolume * 0.05, ctx.currentTime);

        // 添加混响效果
        const convolver = ctx.createConvolver();
        const reverbBuffer = this.createReverbBuffer();
        convolver.buffer = reverbBuffer;

        for (const freq of frequencies) {
            const osc = ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, ctx.currentTime);

            const oscGain = ctx.createGain();
            oscGain.gain.setValueAtTime(0.25, ctx.currentTime);

            osc.connect(oscGain);
            oscGain.connect(gainNode);
            osc.start(ctx.currentTime);
            oscillators.push({ osc, oscGain });
        }

        gainNode.connect(convolver);
        convolver.connect(ctx.destination);
        gainNode.connect(ctx.destination);

        this.music = { oscillators, gainNode };
    }

    createReverbBuffer() {
        const ctx = this.audioContext;
        const rate = ctx.sampleRate;
        const length = rate * 2; // 2秒混响
        const decay = 2;
        const impulse = ctx.createBuffer(2, length, rate);

        for (let channel = 0; channel < 2; channel++) {
            const channelData = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
            }
        }

        return impulse;
    }

    stopMusic() {
        if (this.music && this.audioContext) {
            const { gainNode } = this.music;
            gainNode.gain.setTargetAtTime(0, this.audioContext.currentTime, 0.5);

            setTimeout(() => {
                for (const { osc } of this.music.oscillators) {
                    try {
                        osc.stop();
                    } catch (e) {}
                }
                this.music = null;
            }, 600);
        }
    }

    /**
     * 设置音效开关
     */
    setEnabled(enabled) {
        this.enabled = enabled;
        if (!enabled) {
            this.stopMusic();
        }
    }

    /**
     * 设置音乐开关
     */
    setMusicEnabled(enabled) {
        this.musicEnabled = enabled;
        if (!enabled) {
            this.stopMusic();
        }
    }

    /**
     * 恢复音频上下文 (用户交互后调用)
     */
    resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
}
