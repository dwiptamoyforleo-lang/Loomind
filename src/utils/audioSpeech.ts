import { AudioOverviewDialogue } from '../types';

export class AudioSpeechPlayer {
  private dialogue: AudioOverviewDialogue[] = [];
  private currentIndex: number = 0;
  private isPlaying: boolean = false;
  private rate: number = 1.05;
  private onTurnChange?: (index: number) => void;
  private onPlaybackEnd?: () => void;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.loadVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        this.loadVoices();
      };
    }
  }

  private loadVoices() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.voices = window.speechSynthesis.getVoices();
    }
  }

  public setDialogue(
    dialogue: AudioOverviewDialogue[],
    onTurnChange?: (index: number) => void,
    onPlaybackEnd?: () => void
  ) {
    this.stop();
    this.dialogue = dialogue;
    this.currentIndex = 0;
    this.onTurnChange = onTurnChange;
    this.onPlaybackEnd = onPlaybackEnd;
  }

  public setRate(rate: number) {
    this.rate = rate;
  }

  public play(startIndex: number = this.currentIndex) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('SpeechSynthesis not available');
      return;
    }

    if (this.dialogue.length === 0) return;

    this.isPlaying = true;
    this.currentIndex = startIndex;
    this.speakTurn(this.currentIndex);
  }

  private speakTurn(index: number) {
    if (!this.isPlaying || index >= this.dialogue.length) {
      this.isPlaying = false;
      this.currentIndex = 0;
      this.onPlaybackEnd?.();
      return;
    }

    window.speechSynthesis.cancel();
    const turn = this.dialogue[index];
    this.currentIndex = index;
    this.onTurnChange?.(index);

    const utterance = new SpeechSynthesisUtterance(turn.text);
    utterance.rate = this.rate;

    // Distinguish Alex vs Jordan via pitch & voice if available
    const englishVoices = this.voices.filter((v) => v.lang.startsWith('en'));

    if (turn.speaker === 'Alex') {
      utterance.pitch = 1.15;
      if (englishVoices.length > 0) {
        // Pick first or female-oriented / lighter voice
        utterance.voice = englishVoices[0];
      }
    } else {
      utterance.pitch = 0.85;
      if (englishVoices.length > 1) {
        // Pick second or deeper voice
        utterance.voice = englishVoices[1];
      }
    }

    utterance.onend = () => {
      if (this.isPlaying) {
        this.speakTurn(index + 1);
      }
    };

    utterance.onerror = (e) => {
      console.warn('Utterance playback error:', e);
      if (this.isPlaying) {
        this.speakTurn(index + 1);
      }
    };

    window.speechSynthesis.speak(utterance);
  }

  public pause() {
    this.isPlaying = false;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
    }
  }

  public resume() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        this.isPlaying = true;
      } else {
        this.play(this.currentIndex);
      }
    }
  }

  public stop() {
    this.isPlaying = false;
    this.currentIndex = 0;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  public getCurrentIndex(): number {
    return this.currentIndex;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const speechOverviewPlayer = new AudioSpeechPlayer();
