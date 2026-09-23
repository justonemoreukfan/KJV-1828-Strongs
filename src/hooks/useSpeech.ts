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

export function useSpeech(
  defaultRate = 1.0,
  defaultPitch = 1.0,
  defaultIncludeVerseNumber = true,
  savedVoiceIdentifier = '',
  onVoicePersist?: (voiceId: string) => void
) {
  const [isSupported, setIsSupported] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentVerse, setCurrentVerse] = useState<number | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoiceState] = useState<SpeechSynthesisVoice | null>(null);
  const [rate, setRate] = useState(defaultRate);
  const [pitch, setPitch] = useState(defaultPitch);
  const [includeVerseNumber, setIncludeVerseNumber] = useState(defaultIncludeVerseNumber);

  const versesQueueRef = useRef<BibleVerse[]>([]);
  const currentIndexRef = useRef<number>(0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isCancelledRef = useRef<boolean>(false);
  const includeVerseNumberRef = useRef<boolean>(defaultIncludeVerseNumber);

  // Keep references synchronized to avoid stale closures in event listeners
  const selectedVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const savedVoiceIdentifierRef = useRef<string>(savedVoiceIdentifier);

  useEffect(() => {
    includeVerseNumberRef.current = includeVerseNumber;
  }, [includeVerseNumber]);

  useEffect(() => {
    savedVoiceIdentifierRef.current = savedVoiceIdentifier;
  }, [savedVoiceIdentifier]);

  // Resolves a fresh SpeechSynthesisVoice instance from getVoices()
  // to avoid dead/stale voice references on Android Chrome
  const resolveFreshVoice = useCallback((target: SpeechSynthesisVoice | null): SpeechSynthesisVoice | null => {
    if (!target || typeof window === 'undefined' || !('speechSynthesis' in window)) return target;
    const available = window.speechSynthesis.getVoices();
    if (!available || available.length === 0) return target;

    return (
      available.find((v) => target.voiceURI && v.voiceURI === target.voiceURI) ||
      available.find((v) => v.name === target.name && v.lang === target.lang) ||
      available.find((v) => v.name === target.name) ||
      target
    );
  }, []);

  const selectVoice = useCallback(
    (voice: SpeechSynthesisVoice | null) => {
      selectedVoiceRef.current = voice;
      setSelectedVoiceState(voice);
      if (voice) {
        const id = voice.voiceURI || voice.name;
        if (onVoicePersist) {
          onVoicePersist(id);
        }
      }
    },
    [onVoicePersist]
  );

  // Load and synchronize voices
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);

      const updateVoices = () => {
        const available = window.speechSynthesis.getVoices();
        if (!available || available.length === 0) return;

        setVoices(available);

        // Check if we can match an already chosen voice or previously saved voice identifier
        const targetId =
          selectedVoiceRef.current?.voiceURI ||
          selectedVoiceRef.current?.name ||
          savedVoiceIdentifierRef.current;

        let matched: SpeechSynthesisVoice | undefined;
        if (targetId) {
          matched =
            available.find((v) => v.voiceURI === targetId) ||
            available.find((v) => v.name === targetId);
        }

        if (matched) {
          selectedVoiceRef.current = matched;
          setSelectedVoiceState(matched);
        } else if (!selectedVoiceRef.current) {
          // If no voice is yet selected, pick a natural English voice if available
          const preferred =
            available.find(
              (v) =>
                v.lang.startsWith('en') &&
                (v.name.includes('Natural') ||
                  v.name.includes('Neural') ||
                  v.name.includes('Google') ||
                  v.name.includes('Daniel') ||
                  v.name.includes('Samantha'))
            ) ||
            available.find((v) => v.lang.startsWith('en')) ||
            available[0];

          selectedVoiceRef.current = preferred || null;
          setSelectedVoiceState(preferred || null);
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

    // Resolve current active voice ensuring fresh object reference
    const activeVoice = resolveFreshVoice(selectedVoiceRef.current);
    if (activeVoice) {
      utterance.voice = activeVoice;
      // CRITICAL FOR ANDROID:
      // Android Text-to-Speech ignores utterance.voice unless utterance.lang is explicitly set!
      // Format with BCP-47 standard hyphens (e.g., replace en_US with en-US).
      if (activeVoice.lang) {
        utterance.lang = activeVoice.lang.replace(/_/g, '-');
      }
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

    // On Android Chrome, resume if audio context is in a paused state before speak
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
    window.speechSynthesis.speak(utterance);
  }, [rate, pitch, resolveFreshVoice]);

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

      // Small delay to allow audio subsystem cleanup
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

      const activeVoice = resolveFreshVoice(selectedVoiceRef.current);
      if (activeVoice) {
        utterance.voice = activeVoice;
        if (activeVoice.lang) {
          utterance.lang = activeVoice.lang.replace(/_/g, '-');
        }
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

      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      window.speechSynthesis.speak(utterance);
    },
    [resolveFreshVoice, rate, pitch, stop]
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
    setSelectedVoice: selectVoice,
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
