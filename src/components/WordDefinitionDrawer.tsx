import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  BookA,
  Volume2,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Loader2,
  Sparkles,
  ArrowRight,
  Scroll,
  BookOpen,
} from 'lucide-react';
import { DictionaryLookupResult } from '../types';

interface WordDefinitionDrawerProps {
  isOpen: boolean;
  lookupResult: DictionaryLookupResult | null;
  isLoading: boolean;
  onClose: () => void;
  onOpenFullDictionary: (word: string) => void;
  onOpenStrongs?: (word: string) => void;
  onSpeakDefinition: (text: string) => void;
  onBookmarkWord: (word: string) => void;
  isWordBookmarked: (word: string) => boolean;
  onNavigateToScripture?: (scriptureRef: string) => void;
}

export const WordDefinitionDrawer: React.FC<WordDefinitionDrawerProps> = ({
  isOpen,
  lookupResult,
  isLoading,
  onClose,
  onOpenFullDictionary,
  onOpenStrongs,
  onSpeakDefinition,
  onBookmarkWord,
  isWordBookmarked,
  onNavigateToScripture,
}) => {
  if (!isOpen) return null;

  const entry = lookupResult?.entry;
  const isBookmarked = entry ? isWordBookmarked(entry.word) : false;

  const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest('a.bible');
    if (anchor && onNavigateToScripture) {
      e.preventDefault();
      const text = anchor.textContent || '';
      onNavigateToScripture(text);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] md:w-[500px] flex flex-col bg-[#fdfbf7] border-l border-amber-900/20 shadow-2xl overflow-hidden font-sans-ui">
        {/* Top Header */}
        <div className="px-5 py-4 border-b border-amber-900/10 bg-amber-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-200/60 text-amber-900">
              <BookA className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-cinzel tracking-widest text-amber-900 font-bold uppercase">
                1828 Webster Dictionary
              </div>
              <div className="text-[11px] text-stone-500">
                Noah Webster's American Dictionary
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-amber-200/40 rounded-lg transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3 text-stone-400">
              <Loader2 className="w-7 h-7 animate-spin text-amber-700" />
              <p className="text-sm">Consulting Webster's 1828 Dictionary...</p>
            </div>
          ) : !lookupResult || !lookupResult.found ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
                <BookA className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-800">
                  "{lookupResult?.query}" not found directly
                </h3>
                <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
                  {lookupResult?.strongsMatch?.exists
                    ? `This term has no separate entry in Webster's 1828 English dictionary, but is indexed in Strong's Concordance (${lookupResult.bibleOccurrencesCount || 0} Bible occurrences).`
                    : 'Try one of these closely matching entries from the 1828 dictionary:'}
                </p>
              </div>

              {/* Direct Strong's Concordance option if available */}
              {onOpenStrongs && lookupResult?.strongsMatch?.exists && (
                <div className="p-4 bg-amber-50/80 border border-amber-200/80 rounded-xl text-left space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-900 uppercase tracking-wider">
                    <Scroll className="w-4 h-4 text-amber-700" />
                    <span>Strong's Concordance Available</span>
                  </div>
                  <p className="text-xs text-stone-600">
                    Explore original Hebrew or Greek definitions and verse cross-references for <strong>"{lookupResult.strongsMatch.matchedWord || lookupResult.query}"</strong>.
                  </p>
                  <button
                    onClick={() => onOpenStrongs(lookupResult.strongsMatch?.matchedWord || lookupResult.query)}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-amber-800 hover:bg-amber-900 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    <Scroll className="w-3.5 h-3.5" />
                    <span>Open in Strong's Concordance</span>
                  </button>
                </div>
              )}

              {/* Suggestions */}
              {lookupResult?.suggestions && lookupResult.suggestions.length > 0 && (
                <div className="grid gap-2 text-left pt-2">
                  <div className="text-xs font-semibold text-stone-600 px-1">
                    Related 1828 Headwords:
                  </div>
                  {lookupResult.suggestions.map((s) => (
                    <button
                      key={s.word}
                      onClick={() => onOpenFullDictionary(s.word)}
                      className="p-3 bg-white hover:bg-amber-50 rounded-xl border border-stone-200 hover:border-amber-300 transition-all text-left group flex items-center justify-between cursor-pointer"
                    >
                      <div>
                        <div className="text-sm font-bold text-stone-900 group-hover:text-amber-900">
                          {s.word.toUpperCase()}
                        </div>
                        <div className="text-xs text-stone-500 line-clamp-1">
                          {s.preview}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-stone-300 group-hover:text-amber-700 shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : entry ? (
            <div className="space-y-4">
              {/* Inflection notice */}
              {lookupResult.isStem && lookupResult.query.toLowerCase() !== entry.word.toLowerCase() && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100/60 border border-amber-300/60 rounded-lg text-xs text-amber-900">
                  <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-700" />
                  <span>
                    Linked from Biblical text <strong>"{lookupResult.query}"</strong> to singular / root entry <strong>"{entry.word}"</strong>
                  </span>
                </div>
              )}

              {/* Word Title & Part of speech */}
              <div className="border-b border-amber-900/10 pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-cinzel text-2xl sm:text-3xl font-bold tracking-tight text-amber-950 uppercase">
                      {entry.word}
                    </h2>
                    {entry.pos && (
                      <span className="inline-block mt-1 text-xs italic text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-md font-garamond text-sm">
                        {entry.pos}
                      </span>
                    )}
                  </div>

                  {/* Actions: TTS, Strongs, and Bookmark */}
                  <div className="flex items-center gap-1">
                    {onOpenStrongs && lookupResult.strongsMatch?.exists && (
                      <button
                        onClick={() =>
                          onOpenStrongs(
                            lookupResult.strongsMatch?.matchedWord || entry.word
                          )
                        }
                        title={`View original Hebrew/Greek for "${lookupResult.strongsMatch?.matchedWord || entry.word}" in Strong's Concordance`}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-amber-900 bg-amber-100/80 hover:bg-amber-200 border border-amber-300/80 rounded-lg transition-colors cursor-pointer"
                      >
                        <Scroll className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Strong's</span>
                      </button>
                    )}
                    {onOpenStrongs && !lookupResult.strongsMatch?.exists && lookupResult.strongsMatch?.suggestions && lookupResult.strongsMatch.suggestions.length > 0 && (
                      <button
                        onClick={() => onOpenStrongs(lookupResult.strongsMatch!.suggestions![0])}
                        title={`"${entry.word}" not in Strong's. View closest root "${lookupResult.strongsMatch!.suggestions![0]}"`}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors cursor-pointer"
                      >
                        <Scroll className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Root: {lookupResult.strongsMatch!.suggestions![0]}</span>
                      </button>
                    )}
                    <button
                      onClick={() => onSpeakDefinition(entry.preview)}
                      title="Read definition aloud"
                      className="p-2 text-stone-600 hover:text-amber-900 hover:bg-amber-100 rounded-lg transition-colors cursor-pointer"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onBookmarkWord(entry.word)}
                      title={isBookmarked ? 'Remove bookmark' : 'Bookmark word'}
                      className={`p-2 rounded-lg transition-colors cursor-pointer ${
                        isBookmarked
                          ? 'text-amber-700 bg-amber-100'
                          : 'text-stone-600 hover:text-amber-900 hover:bg-amber-100'
                      }`}
                    >
                      {isBookmarked ? (
                        <BookmarkCheck className="w-4 h-4" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Pronunciation / Etymology */}
                {(entry.pronunciation || entry.etymology) && (
                  <div className="mt-2 text-xs text-stone-600 space-y-0.5 font-garamond text-sm">
                    {entry.pronunciation && (
                      <div>
                        <span className="font-semibold text-stone-700">Pronunciation:</span> {entry.pronunciation}
                      </div>
                    )}
                    {entry.etymology && (
                      <div>
                        <span className="font-semibold text-stone-700">Etymology:</span> [{entry.etymology}]
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Webster 1828 Definition HTML Content */}
              <div
                onClick={handleContentClick}
                className="webster-content font-garamond text-base sm:text-lg text-stone-900 leading-relaxed pt-1"
                dangerouslySetInnerHTML={{ __html: entry.content }}
              />

              {/* Strong's or Scripture Occurrences Cross-Reference */}
              {onOpenStrongs && lookupResult.strongsMatch?.exists ? (
                <div className="p-3.5 rounded-xl bg-amber-100/50 border border-amber-300/60 flex items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-amber-200/80 text-amber-900">
                      <Scroll className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-amber-950 font-cinzel">
                        Strong's Hebrew & Greek Roots
                      </div>
                      <div className="text-[11px] text-stone-600">
                        Biblical roots & Strong's numbers for "{lookupResult.strongsMatch?.matchedWord || entry.word}"
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      onOpenStrongs(lookupResult.strongsMatch?.matchedWord || entry.word)
                    }
                    className="px-2.5 py-1.5 text-xs font-semibold text-white bg-amber-900 hover:bg-amber-800 rounded-lg flex items-center gap-1 transition-colors cursor-pointer shrink-0 shadow-xs"
                  >
                    <span>Strong's</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ) : lookupResult.bibleOccurrencesCount && lookupResult.bibleOccurrencesCount > 0 ? (
                <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-900/15 flex items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-amber-200/70 text-amber-900">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-amber-950 font-cinzel flex items-center gap-1.5">
                        <span>King James Bible</span>
                        <span className="text-[10px] font-sans-ui font-semibold bg-amber-200 text-amber-950 px-1.5 py-0.2 rounded-full">
                          {lookupResult.bibleOccurrencesCount}{' '}
                          {lookupResult.bibleOccurrencesCount === 1 ? 'place' : 'places'}
                        </span>
                      </div>
                      <div className="text-[11px] text-stone-600">
                        "{entry.word}" occurs in {lookupResult.bibleOccurrencesCount}{' '}
                        {lookupResult.bibleOccurrencesCount === 1 ? 'verse' : 'verses'} of Scripture
                      </div>
                    </div>
                  </div>
                  {lookupResult.strongsMatch?.suggestions &&
                  lookupResult.strongsMatch.suggestions.length > 0 &&
                  onOpenStrongs ? (
                    <button
                      onClick={() =>
                        onOpenStrongs(lookupResult.strongsMatch!.suggestions![0])
                      }
                      className="px-2.5 py-1.5 text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300/80 rounded-lg flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                    >
                      <span>Root: {lookupResult.strongsMatch!.suggestions![0]}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  ) : onNavigateToScripture ? (
                    <button
                      onClick={() => {
                        onClose();
                        onNavigateToScripture(entry.word);
                      }}
                      className="px-2.5 py-1.5 text-xs font-semibold text-white bg-amber-900 hover:bg-amber-800 rounded-lg flex items-center gap-1 transition-colors cursor-pointer shrink-0 shadow-xs"
                    >
                      <span>Search Bible</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  ) : null}
                </div>
              ) : null}

              {/* Related suggestions */}
              {lookupResult.suggestions && lookupResult.suggestions.length > 1 && (
                <div className="pt-4 border-t border-amber-900/10">
                  <div className="text-xs uppercase tracking-wider font-bold text-stone-500 mb-2 font-sans-ui">
                    Related 1828 Headwords
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {lookupResult.suggestions
                      .filter((s) => s.word.toLowerCase() !== entry.word.toLowerCase())
                      .map((s) => (
                        <button
                          key={s.word}
                          onClick={() => onOpenFullDictionary(s.word)}
                          className="px-2.5 py-1 text-xs bg-white hover:bg-amber-50 text-stone-700 hover:text-amber-900 border border-stone-200 hover:border-amber-400 rounded-lg transition-all cursor-pointer"
                        >
                          {s.word}
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        {entry && (
          <div className="p-4 border-t border-amber-900/10 bg-amber-50/50 flex items-center justify-between">
            <button
              onClick={() => onOpenFullDictionary(entry.word)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-900 hover:text-amber-950 hover:underline cursor-pointer"
            >
              <span>Explore "{entry.word}" in Dictionary Index</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </AnimatePresence>
  );
};
