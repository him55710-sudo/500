// A quiet, original music-box arrangement, synthesized locally after a click.
export class MemoryFilmAudio {
  constructor() { this.enabled = true; this.context = null; this.beat = 0; }
  async play() {
    if (!this.enabled) return;
    try {
      if (!this.context) {
        this.context = new AudioContext();
        this.output = this.context.createGain();
        this.output.gain.value = .14;
        this.output.connect(this.context.destination);
      }
      await this.context.resume();
      this.next = this.context.currentTime + .06;
    } catch { this.enabled = false; }
  }
  pause() { this.context?.suspend().catch(() => {}); }
  reset() { this.beat = 0; }
  note(midi, at, duration, gain) {
    const c = this.context;
    for (const [ratio, level] of [[1, 1], [2, .22], [3, .045]]) {
      const oscillator = c.createOscillator(), envelope = c.createGain();
      oscillator.frequency.value = 440 * 2 ** ((midi - 69) / 12) * ratio;
      envelope.gain.setValueAtTime(0, at);
      envelope.gain.linearRampToValueAtTime(gain * level, at + .02);
      envelope.gain.exponentialRampToValueAtTime(.0001, at + duration);
      oscillator.connect(envelope); envelope.connect(this.output);
      oscillator.start(at); oscillator.stop(at + duration + .05);
      oscillator.onended = () => { oscillator.disconnect(); envelope.disconnect(); };
    }
  }
  update() {
    const c = this.context;
    if (!this.enabled || !c || c.state !== 'running') return;
    const chords = [[48, 55, 60, 64], [45, 52, 57, 60], [41, 48, 53, 57], [43, 50, 55, 59]];
    const tune = [76, 79, 0, 76, 74, 72, 0, 74, 76, 0, 72, 69, 72, 74, 0, 71];
    // Never catch up missed notes in a burst after a backgrounded tab.
    if (this.next < c.currentTime - .15) this.next = c.currentTime + .05;
    if (c.currentTime + .12 < this.next) return;
    const chord = chords[Math.floor(this.beat / 8) % chords.length];
    this.note(chord[[0, 2, 1, 3][this.beat % 4]], this.next, 2.9, .23);
    if (this.beat % 2 === 0) {
      const note = tune[Math.floor(this.beat / 2) % tune.length];
      if (note) this.note(note, this.next + .025, 3.6, .2);
    }
    this.beat++; this.next += .58;
  }
  dispose() { this.context?.close().catch(() => {}); }
}
