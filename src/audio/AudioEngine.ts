import { planets } from '../config/planets';
import { site } from '../config/site';
import { clamp } from '../lib/math';
import { bridge } from '../state/bridge';

/**
 * Spatial ambient audio — fully synthesised with the Web Audio API, so there
 * are no external audio files to load or break.
 *
 *  • Sun: a low drone + filtered "solar wind", panned to where the sun sits
 *    on screen and louder the closer the camera is.
 *  • Destinations: each planet has its own chord, panned to the planet.
 *  • One-shots: flight whoosh, flare rumble, lunar chime.
 *
 * If a music file is configured (site.audio.music → public/audio/ambient.mp3)
 * and it loads, that file loops instead of the synthesised drone and chords;
 * the one-shots stay. A missing file simply leaves the synthesised ambience on.
 *
 * Starts silent. The context is only created after the visitor presses the
 * sound toggle (browser autoplay policy). Project audio ducks the ambience.
 */
class AudioEngine {
  private ctx: AudioContext | null = null;
  private master!: GainNode;
  private ambience!: GainNode;
  /** Synthesised drone + chords: silenced while a music file is playing. */
  private synth!: GainNode;
  private musicGain!: GainNode;
  private music: HTMLAudioElement | null = null;
  private musicOk = false;
  private sunGain!: GainNode;
  private sunPan!: StereoPannerNode;
  private windFilter!: BiquadFilterNode;
  private voices: { gain: GainNode; pan: StereoPannerNode }[] = [];
  private enabled = false;
  private volume = 1;
  private ducked = false;
  private raf = 0;
  private noiseBuffer: AudioBuffer | null = null;

  get active() {
    return this.enabled;
  }

  private build() {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return false;
    const ctx = new Ctor();
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.gain.value = 0;
    const comp = ctx.createDynamicsCompressor();
    this.master.connect(comp).connect(ctx.destination);
    this.ambience = ctx.createGain();
    this.ambience.gain.value = 1;
    this.ambience.connect(this.master);
    this.synth = ctx.createGain();
    this.synth.connect(this.ambience);
    this.musicGain = ctx.createGain();
    this.musicGain.gain.value = 0;
    this.musicGain.connect(this.ambience);
    if (site.audio.music) {
      const el = new Audio();
      el.loop = true;
      el.preload = 'auto';
      el.addEventListener('canplay', () => {
        if (this.musicOk) return;
        this.musicOk = true;
        const t = ctx.currentTime;
        this.synth.gain.setTargetAtTime(0, t, 0.8);
        this.musicGain.gain.setTargetAtTime(clamp(site.audio.volume), t, 0.8);
      });
      el.addEventListener('error', () => {
        // no file → synthesised ambience stays. The name must match site.audio.music exactly.
        console.warn(`[audio] ${site.audio.music} not found — playing the built-in ambience instead`);
        this.music = null;
      });
      el.src = site.audio.music;
      try {
        ctx.createMediaElementSource(el).connect(this.musicGain);
        this.music = el;
      } catch {
        this.music = null;
      }
    }

    // brown noise buffer
    const len = ctx.sampleRate * 4;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      last = (last + 0.02 * w) / 1.02;
      data[i] = last * 3.2;
    }
    this.noiseBuffer = buf;

    // ── sun ──
    this.sunGain = ctx.createGain();
    this.sunGain.gain.value = 0.2;
    this.sunPan = ctx.createStereoPanner();
    this.sunGain.connect(this.sunPan).connect(this.synth);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 180;
    lp.connect(this.sunGain);
    [55, 55.4, 82.5, 110.3].forEach((f, i) => {
      const o = ctx.createOscillator();
      o.type = i < 2 ? 'sawtooth' : 'sine';
      o.frequency.value = f;
      const g = ctx.createGain();
      g.gain.value = i < 2 ? 0.16 : 0.1;
      o.connect(g).connect(lp);
      o.start();
    });
    const wind = ctx.createBufferSource();
    wind.buffer = buf;
    wind.loop = true;
    this.windFilter = ctx.createBiquadFilter();
    this.windFilter.type = 'bandpass';
    this.windFilter.frequency.value = 420;
    this.windFilter.Q.value = 0.6;
    const windGain = ctx.createGain();
    windGain.gain.value = 0.55;
    wind.connect(this.windFilter).connect(windGain).connect(this.sunGain);
    wind.start();
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.07;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 160;
    lfo.connect(lfoGain).connect(this.windFilter.frequency);
    lfo.start();

    // ── destination chords ──
    this.voices = planets.map((p) => {
      const gain = ctx.createGain();
      gain.gain.value = 0;
      const pan = ctx.createStereoPanner();
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 900;
      filter.connect(gain).connect(pan).connect(this.synth);
      [1, 1.5, 2.005, 2.52].forEach((ratio, i) => {
        const o = ctx.createOscillator();
        o.type = i === 0 ? 'triangle' : 'sine';
        o.frequency.value = p.tone * ratio;
        const g = ctx.createGain();
        g.gain.value = [0.5, 0.26, 0.18, 0.1][i];
        const trem = ctx.createOscillator();
        trem.frequency.value = 0.05 + i * 0.037;
        const tremGain = ctx.createGain();
        tremGain.gain.value = g.gain.value * 0.45;
        trem.connect(tremGain).connect(g.gain);
        trem.start();
        o.connect(g).connect(filter);
        o.start();
      });
      return { gain, pan };
    });
    return true;
  }

  async setEnabled(on: boolean) {
    if (on && !this.ctx && !this.build()) return false;
    if (!this.ctx) return false;
    this.enabled = on;
    if (on) {
      // started inside the tap that turned sound on (mobile autoplay rules)
      this.music?.play().catch(() => undefined);
      await this.ctx.resume().catch(() => undefined);
      this.master.gain.setTargetAtTime(0.5 * this.volume, this.ctx.currentTime, 0.6);
      cancelAnimationFrame(this.raf);
      this.loop();
    } else {
      this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.25);
      cancelAnimationFrame(this.raf);
      window.setTimeout(() => {
        if (this.enabled) return;
        this.music?.pause();
        this.ctx?.suspend().catch(() => undefined);
      }, 900);
    }
    return true;
  }

  /** Master volume 0..1 (the visitor's slider). */
  setVolume(v: number) {
    this.volume = clamp(v);
    if (this.ctx && this.enabled) this.master.gain.setTargetAtTime(0.5 * this.volume, this.ctx.currentTime, 0.06);
  }

  /** Project audio takes priority over the ambience. */
  duck(on: boolean) {
    this.ducked = on;
    if (this.ctx) this.ambience.gain.setTargetAtTime(on ? 0 : 1, this.ctx.currentTime, 0.35);
  }

  private loop = () => {
    this.raf = requestAnimationFrame(this.loop);
    const ctx = this.ctx;
    if (!ctx || !this.enabled) return;
    const now = ctx.currentTime;
    const sun = bridge.sun;
    const closeness = clamp(1 - (sun.dist - 10) / 130);
    this.sunPan.pan.setTargetAtTime(clamp(sun.x * sun.facing, -1, 1) * 0.8, now, 0.2);
    this.sunGain.gain.setTargetAtTime(0.1 + closeness * closeness * 0.75 + bridge.flare * 0.5, now, 0.25);
    this.windFilter.frequency.setTargetAtTime(300 + closeness * 700 + bridge.flare * 900, now, 0.4);
    const stop = bridge.progress - 1;
    this.voices.forEach((v, i) => {
      const near = clamp(1 - Math.abs(stop - i) * 1.4);
      const level = near * clamp(1.4 - bridge.focus.dist / 60) * 0.16;
      v.gain.gain.setTargetAtTime(level, now, 0.5);
      if (near > 0.01) v.pan.pan.setTargetAtTime(bridge.focus.x * 0.7, now, 0.2);
    });
  };

  private noise(duration: number, from: number, to: number, level: number, q = 0.8) {
    const ctx = this.ctx;
    if (!ctx || !this.enabled || !this.noiseBuffer || this.ducked) return;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.Q.value = q;
    const g = ctx.createGain();
    const now = ctx.currentTime;
    f.frequency.setValueAtTime(from, now);
    f.frequency.exponentialRampToValueAtTime(to, now + duration);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(level, now + duration * 0.35);
    g.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    src.connect(f).connect(g).connect(this.ambience);
    src.start(now, Math.random() * 2);
    src.stop(now + duration + 0.1);
  }

  /** Camera flight between destinations. */
  whoosh(duration = 2.4) {
    this.noise(duration, 160, 1400, 0.5);
  }

  /** Coronal mass ejection. */
  flare() {
    this.noise(5, 900, 70, 0.9, 0.5);
  }

  /** Lunar resonance — a soft bell built from the planet's tone. */
  chime(base = 220) {
    const ctx = this.ctx;
    if (!ctx || !this.enabled || this.ducked) return;
    const now = ctx.currentTime;
    [1, 2.01, 2.99, 4.2].forEach((r, i) => {
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.value = base * 2 * r;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(0.16 / (i + 1), now + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 3.2 - i * 0.5);
      o.connect(g).connect(this.ambience);
      o.start(now);
      o.stop(now + 3.4);
    });
  }
}

export const audio = new AudioEngine();
