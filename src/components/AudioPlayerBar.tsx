import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  Volume2,
  Settings2,
  X,
  Gauge,
} from 'lucide-react';
import { BibleBookInfo, BibleVerse } from '../types';

interface AudioPlayerBarProps {
  book: BibleBookInfo;
  chapter: number;
  verses: BibleVerse[];
  isPlaying: boolean;
  isPaused: boolean;
  currentVerse: number | null;
  rate: number;
  readVerseNumbers: boolean;
  voices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  onPlay: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onNext: () => void;
  onPrev: () => void;
  onRateChange: (newRate: number) => void;
  onVoiceChange: (voice: SpeechSynthesisVoice) => void;
  onToggleReadVerseNumbers: (val: boolean) => void;
  onClose: () => void;
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({
  book,
  chapter,
  verses,
  isPlaying,
  isPaused,
  currentVerse,
  rate,
  readVerseNumbers,
  voices,
  selectedVoice,
  onPlay,
  onPause,
  onResume,
  onStop,
  onNext,
  onPrev,
  onRateChange,
  onVoiceChange,
  onToggleReadVerseNumbers,
  onClose,
}) => {
  const [showVoicePicker, setShowVoicePicker] = useState(false);

  const currentVerseIdx = currentVerse
    ? verses.findIndex((v) => v.verse === currentVerse)
    : -1;
  const progressPercent =
    verses.length > 0 && currentVerseIdx >= 0
      ? ((currentVerseIdx + 1) / verses.length) * 100
      : 0;

  const speedOptions = [0.75, 1.0, 1.25, 1.5, 1.75];

  const cycleSpeed = () => {
    const nextIdx = (speedOptions.indexOf(rate) + 1) % speedOptions.length;
    onRateChange(speedOptions[nextIdx]);
  };

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      className="fixed bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-2xl bg-stone-900/95 text-stone-100 backdrop-blur-md rounded-2xl shadow-2xl border border-stone-700/60 p-3 sm:p-4"
    >
      {/* Progress Bar */}
      <div className="w-full bg-stone-700/60 h-1.5 rounded-full overflow-hidden mb-3">
        <div
          className="bg-amber-500 h-full transition-all duration-300 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="flex items-center justify-between gap-2 sm:gap-4">
        {/* Track / Verse Info */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-9 h-9 rounded-xl bg-amber-600/30 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <Volume2 className="w-4 h-4 animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="text-xs sm:text-sm font-semibold truncate text-amber-200">
              {book.name} {chapter}
              {currentVerse ? ` : ${currentVerse}` : ''}
            </div>
            <div className="text-[11px] text-stone-400 truncate">
              {currentVerse
                ? `Verse ${currentVerse} of ${verses.length}`
                : isPaused
                ? 'Paused'
                : 'Ready to Read Aloud'}
            </div>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={onPrev}
            title="Previous Verse"
            className="p-2 text-stone-300 hover:text-white hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          {isPlaying && !isPaused ? (
            <button
              onClick={onPause}
              title="Pause"
              className="w-10 h-10 rounded-full bg-amber-600 hover:bg-amber-500 text-white flex items-center justify-center transition-transform active:scale-95 shadow-md cursor-pointer"
            >
              <Pause className="w-5 h-5 fill-current" />
            </button>
          ) : (
            <button
              onClick={() => {
                if (isPaused) onResume();
                else onPlay();
              }}
              title="Play / Resume"
              className="w-10 h-10 rounded-full bg-amber-600 hover:bg-amber-500 text-white flex items-center justify-center transition-transform active:scale-95 shadow-md cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current ml-0.5" />
            </button>
          )}

          <button
            onClick={onStop}
            title="Stop"
            className="p-2 text-stone-300 hover:text-red-400 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
          >
            <Square className="w-4 h-4 fill-current" />
          </button>

          <button
            onClick={onNext}
            title="Next Verse"
            className="p-2 text-stone-300 hover:text-white hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Speed & Voice Settings */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 pl-1 border-l border-stone-800">
          <button
            onClick={cycleSpeed}
            title="Change reading speed"
            className="px-2 py-1 bg-stone-800 hover:bg-stone-700 text-amber-300 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Gauge className="w-3 h-3 text-stone-400" />
            <span>{rate}x</span>
          </button>

          <button
            onClick={() => setShowVoicePicker(!showVoicePicker)}
            title="Voice options"
            className="p-1.5 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
          >
            <Settings2 className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            title="Close audio reader"
            className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Voice selection & audio options dropdown */}
      {showVoicePicker && (
        <div className="mt-3 pt-3 border-t border-stone-800 flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs text-stone-400">
              <span>Select Reading Voice:</span>
              <span className="text-[11px] text-stone-500">
                {voices.length} voices available
              </span>
            </div>
            <select
              value={selectedVoice?.name || ''}
              onChange={(e) => {
                const v = voices.find((voice) => voice.name === e.target.value);
                if (v) onVoiceChange(v);
              }}
              className="w-full bg-stone-800 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-stone-200 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
            >
              {voices.map((v) => (
                <option key={v.name} value={v.name}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-stone-800/80">
            <div>
              <div className="text-xs font-medium text-stone-200">
                Announce Verse Numbers
              </div>
              <div className="text-[11px] text-stone-500">
                Reads aloud "Verse 1...", "Verse 2..." before each verse
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={readVerseNumbers}
                onChange={(e) => onToggleReadVerseNumbers(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-stone-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
            </label>
          </div>
        </div>
      )}
    </motion.div>
  );
};
