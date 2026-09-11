import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Languages,
  Volume2,
  Bookmark,
  BookmarkCheck,
  BookA,
  Loader2,
  Sparkles,
  ArrowRight,
  Scroll,
  BookOpen,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  StrongsLookupResult,
  StrongsEntry,
  Testament,
  StrongsOccurrencesResult,
  BibleSearchResult,
} from '../types';
import { api } from '../services/api';
import {
  parseKjvRenderings,
  renderTextWithScriptureCitations,
  highlightWordInText,
} from '../utils/scriptureRef';

interface StrongsDrawerProps {
  isOpen: boolean;
  lookupResult: StrongsLookupResult | null;
  isLoading: boolean;
  activeTestament?: Testament;
  onClose: () => void;
  onSelectWord: (word: string) => void;
  onOpenWebster1828: (word: string) => void;
  onSpeakText: (text: string) => void;
  onBookmarkStrongs: (word: string, entryId: string, title: string) => void;
  isStrongsBookmarked: (word: string, entryId: string) => boolean;
  onNavigateToVerse?: (bookId: string, chapter: number, verse: number) => void;
  onNavigateToScripture?: (ref: string) => void;
}

export const StrongsDrawer: React.FC<StrongsDrawerProps> = ({
  isOpen,
  lookupResult,
  isLoading,
  activeTestament = 'OT',
  onClose,
  onSelectWord,
  onOpenWebster1828,
  onSpeakText,
  onBookmarkStrongs,
  isStrongsBookmarked,
  onNavigateToVerse,
  onNavigateToScripture,
}) => {
  if (!isOpen) return null;

  const hasHebrew = (lookupResult?.hebrewEntries.length || 0) > 0;
  const hasGreek = (lookupResult?.greekEntries.length || 0) > 0;

  // Default tab based on current chapter testament and availability
  const [selectedTab, setSelectedTab] = useState<'hebrew' | 'greek'>(() => {
    if (activeTestament === 'NT' && hasGreek) return 'greek';
    if (hasHebrew) return 'hebrew';
    if (hasGreek) return 'greek';
    return 'hebrew';
  });

  // Track which entry currently has its Bible occurrences panel open
  const [openOccurrencesEntryId, setOpenOccurrencesEntryId] = useState<string | null>(null);
  const [occurrencesWord, setOccurrencesWord] = useState<string>('');
  const [occurrencesData, setOccurrencesData] = useState<StrongsOccurrencesResult | null>(null);
  const [isLoadingOccurrences, setIsLoadingOccurrences] = useState(false);

  // Recompute tab when lookup changes
  useEffect(() => {
    if (activeTestament === 'NT' && hasGreek) {
      setSelectedTab('greek');
    } else if (hasHebrew) {
      setSelectedTab('hebrew');
    } else if (hasGreek) {
      setSelectedTab('greek');
    }
    setOpenOccurrencesEntryId(null);
    setOccurrencesData(null);
  }, [lookupResult, activeTestament, hasHebrew, hasGreek]);

  const activeEntries: StrongsEntry[] =
    selectedTab === 'hebrew'
      ? lookupResult?.hebrewEntries || []
      : lookupResult?.greekEntries || [];

  const handleToggleOccurrences = (
    entryId: string,
    wordToSearch: string,
    testament: Testament
  ) => {
    if (openOccurrencesEntryId === entryId && occurrencesWord === wordToSearch) {
      // Toggle close
      setOpenOccurrencesEntryId(null);
      return;
    }

    setOpenOccurrencesEntryId(entryId);
    setOccurrencesWord(wordToSearch);
    setIsLoadingOccurrences(true);

    api
      .getStrongsOccurrences(wordToSearch, testament, undefined, 60)
      .then((res) => {
        setOccurrencesData(res);
        setIsLoadingOccurrences(false);
      })
      .catch((err) => {
        console.error('Failed to load occurrences:', err);
        setIsLoadingOccurrences(false);
      });
  };

  const handleVerseClick = (verse: BibleSearchResult) => {
    if (onNavigateToVerse) {
      onNavigateToVerse(verse.bookId, verse.chapter, verse.verse);
      onClose();
    } else if (onNavigateToScripture) {
      onNavigateToScripture(`${verse.bookName} ${verse.chapter}:${verse.verse}`);
      onClose();
    }
  };

  const safeNavigateScripture = (ref: string) => {
    if (onNavigateToScripture) {
      onNavigateToScripture(ref);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] md:w-[540px] flex flex-col bg-[#fcfaf6] border-l border-amber-900/20 shadow-2xl overflow-hidden font-sans-ui">
        {/* Top Header */}
        <div className="px-5 py-4 border-b border-amber-900/15 bg-gradient-to-r from-amber-900 via-stone-900 to-amber-950 text-amber-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 shadow-xs">
              <Scroll className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-cinzel tracking-widest text-amber-300 font-bold uppercase flex items-center gap-1.5">
                <span>Strong's Concordance</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-amber-400/20 rounded text-amber-200 border border-amber-400/30">
                  English Index
                </span>
              </div>
              <div className="text-[11px] text-stone-300">
                Original Hebrew & Greek Lexicon & Definitions
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Headword Bar */}
        {lookupResult && lookupResult.found && (
          <div className="px-5 py-3 bg-amber-50/80 border-b border-amber-900/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500">English Word:</span>
              <span className="font-serif text-lg font-bold text-amber-950 capitalize tracking-wide">
                {lookupResult.matchedWord || lookupResult.query}
              </span>
              {lookupResult.matchedWord &&
                lookupResult.matchedWord.toLowerCase() !==
                  lookupResult.query.toLowerCase() && (
                  <span className="text-[11px] text-stone-400 italic">
                    (from "{lookupResult.query}")
                  </span>
                )}
            </div>

            {/* Quick Link to 1828 Webster Dictionary (Only if word exists in Webster) */}
            {lookupResult.websterMatch?.exists ? (
              <button
                onClick={() =>
                  onOpenWebster1828(
                    lookupResult.websterMatch?.matchedWord ||
                    lookupResult.matchedWord ||
                    lookupResult.query
                  )
                }
                title="Compare with 1828 Webster Dictionary definition"
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-amber-900 bg-amber-200/50 hover:bg-amber-200/80 border border-amber-300/80 rounded-lg transition-colors cursor-pointer"
              >
                <BookA className="w-3.5 h-3.5" />
                <span>
                  1828 Webster
                  {lookupResult.websterMatch?.matchedWord &&
                  lookupResult.websterMatch.matchedWord.toLowerCase() !==
                    (lookupResult.matchedWord || lookupResult.query).toLowerCase()
                    ? `: ${lookupResult.websterMatch.matchedWord}`
                    : ''}
                </span>
              </button>
            ) : lookupResult.websterMatch?.suggestions &&
              lookupResult.websterMatch.suggestions.length > 0 ? (
              <button
                onClick={() =>
                  onOpenWebster1828(lookupResult.websterMatch!.suggestions![0])
                }
                title={`Word not in 1828 Webster. View closest entry "${lookupResult.websterMatch!.suggestions![0]}"`}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-amber-100 border border-stone-300 rounded-lg transition-colors cursor-pointer"
              >
                <BookA className="w-3.5 h-3.5 text-amber-800" />
                <span>Webster: {lookupResult.websterMatch!.suggestions![0]}</span>
              </button>
            ) : null}
          </div>
        )}

        {/* Hebrew vs Greek Tabs */}
        {lookupResult && lookupResult.found && (
          <div className="px-5 pt-3 pb-0 bg-stone-100/70 border-b border-stone-200 flex gap-2">
            <button
              onClick={() => setSelectedTab('hebrew')}
              disabled={!hasHebrew}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-all cursor-pointer border-t border-x ${
                selectedTab === 'hebrew'
                  ? 'bg-[#fcfaf6] text-amber-900 border-amber-900/20 border-b-transparent shadow-xs font-bold'
                  : hasHebrew
                  ? 'text-stone-600 hover:text-stone-900 border-transparent'
                  : 'text-stone-400 opacity-50 cursor-not-allowed border-transparent'
              }`}
            >
              <span>Old Testament Hebrew</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  selectedTab === 'hebrew'
                    ? 'bg-amber-100 text-amber-900 font-bold'
                    : 'bg-stone-200 text-stone-600'
                }`}
              >
                {lookupResult.hebrewEntries.length}
              </span>
            </button>

            <button
              onClick={() => setSelectedTab('greek')}
              disabled={!hasGreek}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-all cursor-pointer border-t border-x ${
                selectedTab === 'greek'
                  ? 'bg-[#fcfaf6] text-amber-900 border-amber-900/20 border-b-transparent shadow-xs font-bold'
                  : hasGreek
                  ? 'text-stone-600 hover:text-stone-900 border-transparent'
                  : 'text-stone-400 opacity-50 cursor-not-allowed border-transparent'
              }`}
            >
              <span>New Testament Greek</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  selectedTab === 'greek'
                    ? 'bg-amber-100 text-amber-900 font-bold'
                    : 'bg-stone-200 text-stone-600'
                }`}
              >
                {lookupResult.greekEntries.length}
              </span>
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3 text-stone-400">
              <Loader2 className="w-7 h-7 animate-spin text-amber-700" />
              <p className="text-sm font-medium">Consulting Strong's Concordance...</p>
            </div>
          ) : !lookupResult || !lookupResult.found ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
                <Scroll className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-800">
                  "{lookupResult?.query}" not found in Strong's index
                </h3>
                <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
                  Try searching for a root English word or explore one of these related suggestions:
                </p>
              </div>

              {lookupResult?.suggestions && lookupResult.suggestions.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center max-w-sm mx-auto pt-2">
                  {lookupResult.suggestions.map((sug: any) => {
                    const sugWord = typeof sug === 'string' ? sug : sug?.word || '';
                    if (!sugWord) return null;
                    return (
                      <button
                        key={sugWord}
                        onClick={() => onSelectWord(sugWord)}
                        className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 rounded-lg text-xs font-medium transition-colors cursor-pointer capitalize"
                      >
                        {sugWord}
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="pt-4 border-t border-stone-200">
                {lookupResult?.websterMatch?.exists ? (
                  <button
                    onClick={() =>
                      onOpenWebster1828(
                        lookupResult.websterMatch?.matchedWord || lookupResult?.query || ''
                      )
                    }
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <BookA className="w-3.5 h-3.5 text-amber-800" />
                    <span>
                      View "{lookupResult.websterMatch?.matchedWord || lookupResult?.query}" in 1828 Webster
                    </span>
                  </button>
                ) : lookupResult?.websterMatch?.suggestions &&
                  lookupResult.websterMatch.suggestions.length > 0 ? (
                  <button
                    onClick={() =>
                      onOpenWebster1828(lookupResult.websterMatch!.suggestions![0])
                    }
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-stone-100 hover:bg-amber-100 text-stone-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <BookA className="w-3.5 h-3.5 text-amber-800" />
                    <span>
                      Webster 1828: "{lookupResult.websterMatch!.suggestions![0]}"
                    </span>
                  </button>
                ) : onNavigateToScripture ? (
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateToScripture(lookupResult?.query || '');
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Search className="w-3.5 h-3.5 text-amber-300" />
                    <span>Search Scripture for "{lookupResult?.query}"</span>
                  </button>
                ) : null}
              </div>
            </div>
          ) : activeEntries.length === 0 ? (
            <div className="py-8 text-center text-stone-500 space-y-2">
              <p className="text-sm">
                No {selectedTab === 'hebrew' ? 'Hebrew' : 'Greek'} entries for "
                {lookupResult.matchedWord || lookupResult.query}".
              </p>
              {selectedTab === 'hebrew' && hasGreek && (
                <button
                  onClick={() => setSelectedTab('greek')}
                  className="text-xs text-amber-800 font-semibold underline hover:text-amber-900 cursor-pointer"
                >
                  Switch to Greek New Testament ({lookupResult.greekEntries.length} entries)
                </button>
              )}
              {selectedTab === 'greek' && hasHebrew && (
                <button
                  onClick={() => setSelectedTab('hebrew')}
                  className="text-xs text-amber-800 font-semibold underline hover:text-amber-900 cursor-pointer"
                >
                  Switch to Hebrew Old Testament ({lookupResult.hebrewEntries.length} entries)
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {activeEntries.map((entry, index) => {
                const bookmarked = isStrongsBookmarked(
                  lookupResult.matchedWord || lookupResult.query,
                  entry.id
                );

                return (
                  <div
                    key={entry.id}
                    className="p-5 rounded-2xl bg-white border border-amber-900/15 shadow-sm space-y-4 hover:border-amber-700/40 transition-all"
                  >
                    {/* Entry Top Row: Strong's ID, Original Word, and Action Buttons */}
                    <div className="flex items-start justify-between gap-3 border-b border-stone-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-mono font-bold text-xs border border-amber-300">
                            Strong's {entry.id}
                          </span>
                          <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wide">
                            {entry.testament === 'OT' ? 'Hebrew' : 'Greek'}
                          </span>
                        </div>

                        {/* Original Language Script Display */}
                        <div className="mt-2 flex items-baseline gap-3">
                          <span
                            className="text-2xl sm:text-3xl font-serif text-amber-950 select-text"
                            dir={entry.testament === 'OT' ? 'rtl' : 'ltr'}
                          >
                            {entry.lemma}
                          </span>
                          <div className="text-xs text-stone-600">
                            <span className="font-semibold italic text-stone-800">
                              {entry.translit}
                            </span>
                            {entry.pron && (
                              <span className="text-stone-500 ml-1.5 font-mono text-[11px]">
                                \{entry.pron}\
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Read Aloud & Bookmark */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() =>
                            onSpeakText(
                              `Strong's ${entry.id}. ${entry.translit}. Definition: ${entry.strongs_def}`
                            )
                          }
                          title="Read Strong's definition aloud"
                          className="p-1.5 text-stone-500 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            onBookmarkStrongs(
                              lookupResult.matchedWord || lookupResult.query,
                              entry.id,
                              `Strong's ${entry.id}: ${entry.translit} (${entry.lemma})`
                            )
                          }
                          title={bookmarked ? 'Remove bookmark' : 'Bookmark Strong entry'}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            bookmarked
                              ? 'text-amber-700 bg-amber-50'
                              : 'text-stone-400 hover:text-amber-800 hover:bg-amber-50'
                          }`}
                        >
                          {bookmarked ? (
                            <BookmarkCheck className="w-4 h-4 text-amber-700" />
                          ) : (
                            <Bookmark className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Strong's Definition Block (Highlighted Prominently) */}
                    <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/70 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase tracking-wider">
                        <Scroll className="w-3.5 h-3.5 text-amber-700" />
                        <span>Strong's Definition</span>
                      </div>
                      <p className="text-sm sm:text-base leading-relaxed text-stone-800 font-serif">
                        {entry.strongs_def || 'No specific definition provided.'}
                      </p>
                    </div>

                    {/* Derivation / Root Etymology with Scripture Citation Links */}
                    {entry.derivation && (
                      <div className="space-y-1 text-xs">
                        <span className="font-semibold text-stone-500 uppercase tracking-wider text-[10px]">
                          Root / Derivation:
                        </span>
                        <div className="text-stone-700 italic bg-stone-50 p-2.5 rounded-lg border border-stone-200/60 leading-relaxed">
                          {renderTextWithScriptureCitations(
                            entry.derivation,
                            safeNavigateScripture
                          )}
                        </div>
                      </div>
                    )}

                    {/* KJV Translation Renderings & Clickable Chips */}
                    {entry.kjv_def && (
                      <div className="space-y-2 text-xs">
                        <span className="font-semibold text-stone-500 uppercase tracking-wider text-[10px]">
                          Translated in King James Version As:
                        </span>
                        <div className="text-stone-800 font-medium bg-amber-100/30 p-2.5 rounded-lg border border-amber-200/50 leading-relaxed">
                          {renderTextWithScriptureCitations(
                            entry.kjv_def,
                            safeNavigateScripture
                          )}
                        </div>

                        {/* Interactive Translation Chips */}
                        {(() => {
                          const renderings = parseKjvRenderings(entry.kjv_def);
                          if (renderings.length === 0) return null;

                          return (
                            <div className="pt-1">
                              <div className="text-[10px] uppercase font-bold text-stone-600 mb-1.5 flex items-center gap-1">
                                <Search className="w-3 h-3 text-amber-700" />
                                <span>Find specific translation in Bible:</span>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {renderings.slice(0, 8).map((wordToken) => {
                                  const isSelected =
                                    openOccurrencesEntryId === entry.id &&
                                    occurrencesWord.toLowerCase() === wordToken.toLowerCase();

                                  return (
                                    <button
                                      key={wordToken}
                                      type="button"
                                      onClick={() =>
                                        handleToggleOccurrences(
                                          entry.id,
                                          wordToken,
                                          entry.testament
                                        )
                                      }
                                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer flex items-center gap-1 ${
                                        isSelected
                                          ? 'bg-amber-800 text-white border-amber-900 shadow-xs'
                                          : 'bg-white hover:bg-amber-100/70 text-stone-800 border-stone-300/80 hover:border-amber-400'
                                      }`}
                                    >
                                      <span>{wordToken}</span>
                                      <BookOpen className="w-3 h-3 opacity-60" />
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {/* Places in the Bible (Occurrences in Scripture) Section */}
                    <div className="pt-2 border-t border-stone-200/70">
                      <button
                        type="button"
                        onClick={() =>
                          handleToggleOccurrences(
                            entry.id,
                            lookupResult.matchedWord || lookupResult.query,
                            entry.testament
                          )
                        }
                        className={`w-full py-2.5 px-3.5 rounded-xl border flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                          openOccurrencesEntryId === entry.id
                            ? 'bg-amber-900 text-amber-50 border-amber-950 shadow-xs'
                            : 'bg-stone-100 hover:bg-amber-100/60 text-stone-800 border-stone-300/80 hover:border-amber-400'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <BookOpen className={`w-4 h-4 ${openOccurrencesEntryId === entry.id ? 'text-amber-300' : 'text-amber-700'}`} />
                          <span>Places Found in the Bible ({entry.testament === 'OT' ? 'Old Testament' : 'New Testament'})</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {openOccurrencesEntryId === entry.id && occurrencesData && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-800 text-amber-200 text-[10px]">
                              {occurrencesData.totalCount} verses
                            </span>
                          )}
                          {openOccurrencesEntryId === entry.id ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </div>
                      </button>

                      {/* Expanded Occurrences Panel */}
                      {openOccurrencesEntryId === entry.id && (
                        <div className="mt-3 p-3 rounded-xl bg-amber-50/50 border border-amber-200/80 space-y-3">
                          <div className="flex items-center justify-between text-xs pb-1 border-b border-amber-200/60">
                            <span className="text-stone-600 font-medium">
                              Verses matching <strong className="text-amber-950">"{occurrencesWord}"</strong>:
                            </span>
                            {occurrencesData && (
                              <span className="text-stone-500 font-mono text-[11px]">
                                {occurrencesData.verses.length} of {occurrencesData.totalCount} shown
                              </span>
                            )}
                          </div>

                          {isLoadingOccurrences ? (
                            <div className="py-6 flex flex-col items-center justify-center gap-2 text-stone-500 text-xs">
                              <Loader2 className="w-5 h-5 animate-spin text-amber-700" />
                              <span>Searching Scripture occurrences...</span>
                            </div>
                          ) : occurrencesData && occurrencesData.verses.length > 0 ? (
                            <div className="space-y-2 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
                              {occurrencesData.verses.map((v, vIdx) => (
                                <div
                                  key={`${v.bookId}-${v.chapter}-${v.verse}-${vIdx}`}
                                  onClick={() => handleVerseClick(v)}
                                  className="p-2.5 rounded-lg bg-white border border-amber-900/10 hover:border-amber-600 hover:bg-amber-100/40 transition-all cursor-pointer group shadow-2xs"
                                >
                                  <div className="flex items-center justify-between gap-2 mb-1">
                                    <span className="text-xs font-bold text-amber-950 group-hover:text-amber-800 flex items-center gap-1.5">
                                      <span>{v.bookName} {v.chapter}:{v.verse}</span>
                                      <span className="text-[10px] font-normal text-stone-600 px-1.5 py-0.2 rounded bg-stone-100">
                                        {v.testament}
                                      </span>
                                    </span>
                                    <span className="text-[11px] text-amber-700 font-semibold group-hover:underline flex items-center gap-0.5 shrink-0">
                                      <span>Read verse</span>
                                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                                    </span>
                                  </div>
                                  <p className="text-xs text-stone-700 leading-relaxed font-serif line-clamp-2">
                                    {highlightWordInText(v.cleanText, occurrencesWord)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="py-4 text-center text-xs text-stone-500">
                              No direct verse matches found for "{occurrencesWord}". Try selecting another translation rendering above.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AnimatePresence>
  );
};
