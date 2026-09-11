import { useState, useEffect, useRef, useCallback } from 'react';
import { BibleVerse } from '../types';

export interface SpeechState {
  isSupported: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  currentVerse: number | null;
  voices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  rate: number;
  pitch: number;
}

export function useSpeech(defaultRate = 1.0, defaultPitch = 1.0, defaultIncludeVerseNumber = true) {
  const [isSupported, setIsSupported] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentVerse, setCurrentVerse] = useState<number | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [rate, setRate] = useState(defaultRate);
  const [pitch, setPitch] = useState(defaultPitch);
  const [includeVerseNumber, setIncludeVerseNumber] = useState(defaultIncludeVerseNumber);

  const versesQueueRef = useRef<BibleVerse[]>([]);
  const currentIndexRef = useRef<number>(0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isCancelledRef = useRef<boolean>(false);
  const includeVerseNumberRef = useRef<boolean>(defaultIncludeVerseNumber);

  // Keep ref synchronized
  useEffect(() => {
    includeVerseNumberRef.current = includeVerseNumber;
  }, [includeVerseNumber]);

  // Load voices
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);

      const updateVoices = () => {
        const available = window.speechSynthesis.getVoices();
        setVoices(available);
        if (available.length > 0 && !selectedVoice) {
          // Find an English voice preferrably natural/neural
          const preferred =
            available.find((v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Neural') || v.name.includes('Google') || v.name.includes('Daniel') || v.name.includes('Samantha'))) ||
            available.find((v) => v.lang.startsWith('en')) ||
            available[0];
          setSelectedVoice(preferred || null);
        }
      };

      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;

      return () => {
        window.speechSynthesis.cancel();
      };
    }
  }, []);

  const stop = useCallback(() => {
    isCancelledRef.current = true;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentVerse(null);
    utteranceRef.current = null;
  }, []);

  const speakCurrentIndex = useCallback(() => {
    if (
      typeof window === 'undefined' ||
      !('speechSynthesis' in window) ||
      isCancelledRef.current ||
      currentIndexRef.current >= versesQueueRef.current.length
    ) {
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentVerse(null);
      return;
    }

    const currentV = versesQueueRef.current[currentIndexRef.current];
    if (!currentV) {
      setIsPlaying(false);
      return;
    }

    setCurrentVerse(currentV.verse);

    // Prepare clean text for reading (optionally include verse number announcement)
    const textToSpeak = includeVerseNumberRef.current
      ? `Verse ${currentV.verse}. ${currentV.cleanText}`
      : currentV.cleanText;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utteranceRef.current = utterance;

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    utterance.rate = rate;
    utterance.pitch = pitch;

    utterance.onend = () => {
      if (isCancelledRef.current) return;
      currentIndexRef.current += 1;
      if (currentIndexRef.current < versesQueueRef.current.length) {
        speakCurrentIndex();
      } else {
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentVerse(null);
      }
    };

    utterance.onerror = (e) => {
      // SpeechSynthesis error event: if cancelled manually, ignore
      if (e.error === 'canceled' || e.error === 'interrupted') return;
      console.warn('Speech synthesis notice:', e.error);
      if (!isCancelledRef.current) {
        currentIndexRef.current += 1;
        if (currentIndexRef.current < versesQueueRef.current.length) {
          speakCurrentIndex();
        } else {
          setIsPlaying(false);
        }
      }
    };

    window.speechSynthesis.speak(utterance);
  }, [rate, pitch, selectedVoice]);

  const playVerses = useCallback(
    (verses: BibleVerse[], startVerseNumber = 1) => {
      if (!verses || verses.length === 0) return;
      stop();

      isCancelledRef.current = false;
      versesQueueRef.current = verses;

      const idx = verses.findIndex((v) => v.verse === startVerseNumber);
      currentIndexRef.current = idx >= 0 ? idx : 0;

      setIsPlaying(true);
      setIsPaused(false);

      // Delay a tiny bit to avoid speech synthesis cancel race
      setTimeout(() => {
        if (!isCancelledRef.current) {
          speakCurrentIndex();
        }
      }, 50);
    },
    [stop, speakCurrentIndex]
  );

  const speakText = useCallback(
    (text: string) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
      stop();

      isCancelledRef.current = false;
      setIsPlaying(true);
      setIsPaused(false);
      setCurrentVerse(null);

      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      utterance.rate = rate;
      utterance.pitch = pitch;

      utterance.onend = () => {
        setIsPlaying(false);
        setIsPaused(false);
      };

      utterance.onerror = (e) => {
        if (e.error !== 'canceled' && e.error !== 'interrupted') {
          console.warn('Speech error:', e.error);
        }
        setIsPlaying(false);
      };

      window.speechSynthesis.speak(utterance);
    },
    [selectedVoice, rate, pitch, stop]
  );

  const pause = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && isPlaying) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, [isPlaying]);

  const resume = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, [isPaused]);

  const nextVerse = useCallback(() => {
    if (!isPlaying) return;
    if (currentIndexRef.current < versesQueueRef.current.length - 1) {
      window.speechSynthesis.cancel();
      currentIndexRef.current += 1;
      speakCurrentIndex();
    }
  }, [isPlaying, speakCurrentIndex]);

  const previousVerse = useCallback(() => {
    if (!isPlaying) return;
    if (currentIndexRef.current > 0) {
      window.speechSynthesis.cancel();
      currentIndexRef.current -= 1;
      speakCurrentIndex();
    }
  }, [isPlaying, speakCurrentIndex]);

  return {
    isSupported,
    isPlaying,
    isPaused,
    currentVerse,
    voices,
    selectedVoice,
    rate,
    pitch,
    includeVerseNumber,
    setSelectedVoice,
    setRate,
    setPitch,
    setIncludeVerseNumber,
    playVerses,
    speakText,
    pause,
    resume,
    stop,
    nextVerse,
    previousVerse,
  };
}
