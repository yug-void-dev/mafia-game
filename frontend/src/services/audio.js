import * as Tone from 'tone';

class AudioManager {
  constructor() {
    this.initialized = false;
    this.settings = this.loadSettings();

    // Setup master volume nodes
    this.musicVolumeNode = new Tone.Volume(-12); // Buff default starting gain
    this.soundVolumeNode = new Tone.Volume(-10);

    this.musicVolumeNode.toDestination();
    this.soundVolumeNode.toDestination();

    // Spooky wind nodes
    this.windNoise = null;
    this.windFilter = null;
    this.windLfo = null;
    this.rumbleOsc = null;
    this.rumbleFilter = null;

    // UI Click synth
    this.clickSynth = null;

    this.applySettings();
  }

  loadSettings() {
    const saved = localStorage.getItem('mafia_audio_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return {
      musicEnabled: true,
      soundEnabled: true,
      musicVolume: 40, // 0 - 100
      soundVolume: 65, // 0 - 100
    };
  }

  saveSettings() {
    localStorage.setItem('mafia_audio_settings', JSON.stringify(this.settings));
  }

  applySettings() {
    // 1. Music Volume Control (Whistling storm wind)
    if (this.musicVolumeNode) {
      if (this.settings.musicEnabled) {
        this.musicVolumeNode.mute = false;
        // Buffed range: -40dB (quiet) to 2dB (prominent and whistling loud)
        const musicDb = this.mapVolumeToDb(this.settings.musicVolume, -40, 2);
        this.musicVolumeNode.volume.value = musicDb;
      } else {
        this.musicVolumeNode.mute = true;
        this.musicVolumeNode.volume.value = -Infinity; // Absolute silence guarantee
      }
    }

    // 2. Sound Effects Control
    if (this.soundVolumeNode) {
      if (this.settings.soundEnabled) {
        this.soundVolumeNode.mute = false;
        const soundDb = this.mapVolumeToDb(this.settings.soundVolume, -45, 0);
        this.soundVolumeNode.volume.value = soundDb;
      } else {
        this.soundVolumeNode.mute = true;
        this.soundVolumeNode.volume.value = -Infinity; // Absolute silence guarantee
      }
    }
  }

  mapVolumeToDb(volume, minDb, maxDb) {
    if (volume <= 0) return -Infinity;
    return minDb + (volume / 100) * (maxDb - minDb);
  }

  async init() {
    if (this.initialized) return;
    this.initialized = true;

    try {
      await Tone.start();
      console.log('Audio Engine started successfully');
      
      this.setupHorrorWind();
      this.setupClickSynth();
      
      // Force settings sync now that context is active
      this.applySettings();
      
      this.startAudioLoops();
    } catch (err) {
      console.error('Failed to initialize audio manager:', err);
    }
  }

  setupClickSynth() {
    // Spooky interface clicking sound synth
    this.clickSynth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.002, decay: 0.07, sustain: 0, release: 0.04 },
    }).connect(this.soundVolumeNode);
  }

  setupHorrorWind() {
    // Buffed base noise gain from -14 to -6 for rich presence
    this.windNoise = new Tone.Noise({
      type: 'pink',
      volume: -6
    });

    // High Q (5.8) creates a scary, howling whistle characteristic for storm wind
    this.windFilter = new Tone.Filter({
      type: 'bandpass',
      frequency: 380,
      Q: 5.8
    });

    // LFO to sweep filter frequency, creating whistling gusts rising and falling
    this.windLfo = new Tone.LFO({
      frequency: 0.05, // 20s gust cycle
      min: 150,
      max: 750
    });

    // Sub-bass rumble for structural house vibration (very quiet)
    this.rumbleOsc = new Tone.Oscillator({
      frequency: 35,
      type: 'sine',
      volume: -18
    });

    this.rumbleFilter = new Tone.Filter({
      type: 'lowpass',
      frequency: 45
    });

    // Connections
    this.windLfo.connect(this.windFilter.frequency);
    this.windNoise.connect(this.windFilter);
    this.windFilter.connect(this.musicVolumeNode);

    this.rumbleOsc.connect(this.rumbleFilter);
    this.rumbleFilter.connect(this.musicVolumeNode);
  }

  startAudioLoops() {
    if (this.windNoise && this.windLfo && this.rumbleOsc) {
      this.windNoise.start();
      this.windLfo.start();
      this.rumbleOsc.start();
    }
  }

  playClick() {
    if (!this.initialized) return;
    if (this.clickSynth && this.settings.soundEnabled) {
      this.clickSynth.triggerAttackRelease('A4', '16n');
    }
  }

  playSpookyImpact() {
    if (!this.initialized) return;
    if (this.clickSynth && this.settings.soundEnabled) {
      // Spooky drop pitch sweep
      this.clickSynth.triggerAttackRelease('C3', '2n');
    }
  }

  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
    this.applySettings();
  }
}

const audioInstance = new AudioManager();
export default audioInstance;
