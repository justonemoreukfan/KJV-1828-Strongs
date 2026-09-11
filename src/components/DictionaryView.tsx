import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  BookA,
  ChevronLeft,
  ChevronRight,
  Volume2,
  Bookmark,
  BookmarkCheck,
  Loader2,
  ExternalLink,
  BookOpen,
  Scroll,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';
import {
  WebsterEntryDetail,
  WebsterEntrySummary,
  DictionaryIndexResult,
  DictionaryLookupResult,
} from '../types';

interface DictionaryViewProps {
  initialWord?: string;
  onNavigateToScripture?: (ref: string) => void;
  onOpenStrongs?: (word: string) => void;
  onSpeak: (text: string) => void;
  onBookmarkWord: (word: string) => void;
  isWordBookmarked: (word: string) => boolean;
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export const DictionaryView: React.FC<DictionaryViewProps> = ({
  initialWord,
  onNavigateToScripture,
  onOpenStrongs,
  onSpeak,
  onBookmarkWord,
  isWordBookmarked,
}) => {
  const [selectedLetter, setSelectedLetter] = useState('A');
  const [page, setPage] = useState(1);
  const [indexFilter, setIndexFilter] = useState('');
  const [indexData, setIndexData] = useState<DictionaryIndexResult | null>(null);
  const [isLoadingIndex, setIsLoadingIndex] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<WebsterEntrySummary[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Active word details
  const [activeWord, setActiveWord] = useState<string>(initialWord || 'god');
  const [activeDetail, setActiveDetail] = useState<WebsterEntryDetail | null>(null);
  const [activeLookup, setActiveLookup] = useState<DictionaryLookupResult | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Synchronize when initialWord prop changes
  useEffect(() => {
    if (initialWord && initialWord.trim().toLowerCase() !== activeWord.toLowerCase()) {
      const clean = initialWord.trim();
      setActiveWord(clean);
      const firstLetter = clean.charAt(0).toUpperCase();
      if (ALPHABET.includes(firstLetter)) {
        setSelectedLetter(firstLetter);
      }
    }
  }, [initialWord]);

  // Load index when letter, page or filter changes
  useEffect(() => {
    let isMounted = true;
    setIsLoadingIndex(true);
    api
      .getDictionaryIndex(selectedLetter, page, 50, indexFilter)
      .then((res) => {
        if (isMounted) {
          setIndexData(res);
          setIsLoadingIndex(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load index:', err);
        if (isMounted) setIsLoadingIndex(false);
      });
    return () => {
      isMounted = false;
    };
  }, [selectedLetter, page, indexFilter]);

  // Load detail when activeWord changes
  useEffect(() => {
    if (!activeWord) return;
    let isMounted = true;
    setIsLoadingDetail(true);
    api
      .lookupWord(activeWord)
      .then((res) => {
        if (isMounted) {
          setActiveLookup(res);
          if (res.entry) {
            setActiveDetail(res.entry);
          } else {
            setActiveDetail(null);
          }
          setIsLoadingDetail(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load detail for', activeWord, err);
        if (isMounted) setIsLoadingDetail(false);
      });
    return () => {
      isMounted = false;
    };
  }, [activeWord]);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsSearching(true);
      api
        .searchDictionary(searchQuery.trim(), 40)
        .then((res) => {
          setSearchResults(res);
          setIsSearching(false);
        })
        .catch((err) => {
          console.error('Search failed:', err);
          setIsSearching(false);
        });
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectWord = (word: string) => {
    setActiveWord(word);
    // If on mobile, scroll detail into view
    const detailEl = document.getElementById('dictionary-detail-panel');
    if (detailEl && window.innerWidth < 768) {
      detailEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest('a.bible');
    if (anchor && onNavigateToScripture) {
      e.preventDefault();
      const text = anchor.textContent || '';
      onNavigateToScripture(text);
    }
  };

  const isBookmarked = activeDetail ? isWordBookmarked(activeDetail.word) : false;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#fbf9f4] text-stone-900 overflow-hidden font-sans-ui">
      {/* Top Bar with Alphabetical Tabs & Search */}
      <div className="bg-white border-b border-stone-200/90 shadow-xs p-3 sm:p-4 space-y-3 shrink-0">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
              <BookA className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-cinzel text-lg font-bold text-stone-900 tracking-wide">
                Noah Webster's 1828 Dictionary
              </h1>
              <p className="text-xs text-stone-500">
                The landmark American Dictionary of the English Language • 60,970+ definitions
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search words (e.g. grace, atonement)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-8 py-2 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-600 font-sans-ui"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* A - Z Alphabetical Index Selector */}
        {!searchQuery && (
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider pr-1 shrink-0">
              Index:
            </span>
            {ALPHABET.map((letter) => {
              const isSelected = selectedLetter === letter;
              return (
                <button
                  key={letter}
                  onClick={() => {
                    setSelectedLetter(letter);
                    setPage(1);
                  }}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg font-cinzel font-bold text-xs shrink-0 flex items-center justify-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-800 text-white shadow-xs scale-105'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                  }`}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Dual-Pane Layout: Word List vs Definition Detail */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
        {/* Left Column: Word List / Search Results */}
        <div className="md:col-span-4 lg:col-span-4 border-r border-stone-200/90 bg-white flex flex-col h-full overflow-hidden">
          {searchQuery ? (
            /* Search Results Header & List */
            <div className="flex flex-col h-full">
              <div className="p-3 bg-stone-50 border-b border-stone-200 text-xs text-stone-600 flex items-center justify-between">
                <span>
                  Search results for <strong>"{searchQuery}"</strong>
                </span>
                {isSearching && <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-700" />}
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-stone-100">
                {searchResults.length === 0 && !isSearching ? (
                  <div className="p-8 text-center text-xs text-stone-400">
                    No words found matching "{searchQuery}".
                  </div>
                ) : (
                  searchResults.map((item) => {
                    const isSelected = activeWord.toLowerCase() === item.word.toLowerCase();
                    return (
                      <button
                        key={item.word}
                        onClick={() => handleSelectWord(item.word)}
                        className={`w-full p-3 text-left transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-amber-50 text-amber-950 font-medium border-l-4 border-amber-700'
                            : 'hover:bg-stone-50 text-stone-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-cinzel text-sm font-bold uppercase">
                            {item.word}
                          </span>
                          {item.pos && (
                            <span className="text-[11px] italic text-stone-500 font-garamond">
                              {item.pos}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-stone-500 line-clamp-2 mt-0.5 font-garamond">
                          {item.preview}
                        </p>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            /* Alphabetical Index List */
            <div className="flex flex-col h-full">
              {/* Filter within current letter */}
              <div className="p-2.5 border-b border-stone-200 bg-stone-50 flex items-center justify-between gap-2">
                <input
                  type="text"
                  placeholder={`Filter '${selectedLetter}' words...`}
                  value={indexFilter}
                  onChange={(e) => {
                    setIndexFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full text-xs px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-amber-600 font-sans-ui"
                />
                <span className="text-[11px] text-stone-400 whitespace-nowrap">
                  {indexData?.total || 0} words
                </span>
              </div>

              {/* Word List */}
              <div className="flex-1 overflow-y-auto divide-y divide-stone-100">
                {isLoadingIndex ? (
                  <div className="p-8 flex items-center justify-center gap-2 text-stone-400 text-xs">
                    <Loader2 className="w-4 h-4 animate-spin text-amber-700" />
                    <span>Loading '{selectedLetter}' index...</span>
                  </div>
                ) : indexData?.words && indexData.words.length > 0 ? (
                  indexData.words.map((item) => {
                    const isSelected = activeWord.toLowerCase() === item.word.toLowerCase();
                    return (
                      <button
                        key={item.word}
                        onClick={() => handleSelectWord(item.word)}
                        className={`w-full px-3.5 py-2.5 text-left transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-amber-50 text-amber-950 font-medium border-l-4 border-amber-700'
                            : 'hover:bg-stone-50 text-stone-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-cinzel text-sm font-bold uppercase">
                            {item.word}
                          </span>
                          {item.pos && (
                            <span className="text-[11px] italic text-stone-500 font-garamond">
                              {item.pos}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-stone-500 line-clamp-1 mt-0.5 font-garamond">
                          {item.preview}
                        </p>
                      </button>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-xs text-stone-400">
                    No words found under this filter.
                  </div>
                )}
              </div>

              {/* Index Pagination */}
              {indexData && indexData.totalPages > 1 && (
                <div className="p-2 border-t border-stone-200 bg-stone-50 flex items-center justify-between text-xs text-stone-600">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="p-1 rounded-md hover:bg-stone-200 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-[11px] font-medium">
                    Page {indexData.page} of {indexData.totalPages}
                  </span>
                  <button
                    disabled={page >= indexData.totalPages}
                    onClick={() => setPage((p) => Math.min(indexData.totalPages, p + 1))}
                    className="p-1 rounded-md hover:bg-stone-200 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Definition Detail */}
        <div
          id="dictionary-detail-panel"
          className="md:col-span-8 lg:col-span-8 bg-[#fdfbf7] flex flex-col h-full overflow-y-auto"
        >
          {isLoadingDetail ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-stone-400">
              <Loader2 className="w-8 h-8 animate-spin text-amber-700" />
              <p className="text-sm">Fetching definition from 1828 archive...</p>
            </div>
          ) : activeDetail ? (
            <div className="p-6 sm:p-8 max-w-3xl mx-auto w-full space-y-6">
              {/* Header */}
              <div className="border-b border-amber-900/10 pb-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-cinzel text-3xl sm:text-4xl font-bold tracking-tight text-amber-950 uppercase">
                      {activeDetail.word}
                    </h2>
                    {activeDetail.pos && (
                      <span className="inline-block mt-2 text-sm italic text-amber-800 bg-amber-100/70 px-2.5 py-0.5 rounded-md font-garamond">
                        {activeDetail.pos}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    {onOpenStrongs && activeLookup?.strongsMatch?.exists && (
                      <button
                        onClick={() =>
                          onOpenStrongs(
                            activeLookup.strongsMatch?.matchedWord || activeDetail.word
                          )
                        }
                        title={`View original Hebrew & Greek roots for "${activeLookup.strongsMatch?.matchedWord || activeDetail.word}" in Strong's Concordance`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 text-xs font-semibold border border-amber-300 transition-colors cursor-pointer shadow-xs"
                      >
                        <Scroll className="w-3.5 h-3.5 text-amber-800" />
                        <span>
                          Strong's Concordance
                          {activeLookup.strongsMatch?.matchedWord &&
                          activeLookup.strongsMatch.matchedWord.toLowerCase() !== activeDetail.word.toLowerCase()
                            ? `: ${activeLookup.strongsMatch.matchedWord}`
                            : ''}
                        </span>
                      </button>
                    )}
                    {onOpenStrongs && !activeLookup?.strongsMatch?.exists && activeLookup?.strongsMatch?.suggestions && activeLookup.strongsMatch.suggestions.length > 0 && (
                      <button
                        onClick={() => onOpenStrongs(activeLookup.strongsMatch!.suggestions![0])}
                        title={`Word "${activeDetail.word}" not in Strong's. View closest biblical root "${activeLookup.strongsMatch!.suggestions![0]}"`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-medium border border-amber-200 transition-colors cursor-pointer shadow-xs"
                      >
                        <Scroll className="w-3.5 h-3.5 text-amber-800" />
                        <span>Strong's: {activeLookup.strongsMatch!.suggestions![0]}</span>
                      </button>
                    )}
                    {onNavigateToScripture && (
                      <button
                        onClick={() => onNavigateToScripture(activeDetail.word)}
                        title={`Find "${activeDetail.word}" in King James Bible${activeLookup?.bibleOccurrencesCount ? ` (${activeLookup.bibleOccurrencesCount} places)` : ''}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                      >
                        <Search className="w-3.5 h-3.5 text-amber-300" />
                        <span className="hidden sm:inline">
                          Find in Bible{activeLookup?.bibleOccurrencesCount && activeLookup.bibleOccurrencesCount > 0 ? ` (${activeLookup.bibleOccurrencesCount})` : ''}
                        </span>
                      </button>
                    )}
                    <button
                      onClick={() => onSpeak(activeDetail.preview)}
                      title="Read definition aloud"
                      className="p-2.5 text-stone-600 hover:text-amber-900 hover:bg-amber-100 rounded-xl transition-colors cursor-pointer border border-stone-200/80 bg-white shadow-xs"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onBookmarkWord(activeDetail.word)}
                      title={isBookmarked ? 'Remove bookmark' : 'Bookmark word'}
                      className={`p-2.5 rounded-xl transition-colors cursor-pointer border border-stone-200/80 shadow-xs ${
                        isBookmarked
                          ? 'text-amber-700 bg-amber-100 border-amber-300'
                          : 'text-stone-600 hover:text-amber-900 hover:bg-amber-100 bg-white'
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

                {/* Pronunciation & Etymology */}
                {(activeDetail.pronunciation || activeDetail.etymology) && (
                  <div className="mt-3 text-sm text-stone-600 space-y-1 font-garamond">
                    {activeDetail.pronunciation && (
                      <div>
                        <strong className="text-stone-800">Pronunciation:</strong>{' '}
                        {activeDetail.pronunciation}
                      </div>
                    )}
                    {activeDetail.etymology && (
                      <div>
                        <strong className="text-stone-800">Etymology:</strong> [
                        {activeDetail.etymology}]
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Full HTML Definition */}
              <div
                onClick={handleContentClick}
                className="webster-content font-garamond text-lg sm:text-xl text-stone-900 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: activeDetail.content }}
              />

              {/* Strong's or Scripture Occurrences Cross-Reference Card */}
              {onOpenStrongs && activeLookup?.strongsMatch?.exists ? (
                <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-900/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs hover:border-amber-700/40 transition-all">
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-xl bg-amber-200/70 text-amber-900 shrink-0">
                      <Scroll className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-amber-950 font-cinzel">
                        Strong's Hebrew & Greek Concordance
                      </div>
                      <p className="text-xs text-stone-600 mt-1 leading-relaxed font-sans-ui">
                        Explore original biblical Hebrew and Greek root words, Strong's numbers, transliterations, and Scripture occurrences for <strong className="text-stone-900 font-semibold">"{activeLookup.strongsMatch?.matchedWord || activeDetail.word}"</strong>.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onOpenStrongs(activeLookup.strongsMatch?.matchedWord || activeDetail.word)
                    }
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-900 hover:bg-amber-800 text-white text-xs font-bold transition-colors cursor-pointer shrink-0 shadow-xs"
                  >
                    <Scroll className="w-3.5 h-3.5 text-amber-200" />
                    <span>
                      View in Strong's
                      {activeLookup.strongsMatch?.hebrewCount > 0 || activeLookup.strongsMatch?.greekCount > 0
                        ? ` (${[
                            activeLookup.strongsMatch.hebrewCount > 0
                              ? `${activeLookup.strongsMatch.hebrewCount} Hebrew`
                              : '',
                            activeLookup.strongsMatch.greekCount > 0
                              ? `${activeLookup.strongsMatch.greekCount} Greek`
                              : '',
                          ]
                            .filter(Boolean)
                            .join(', ')})`
                        : ''}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : activeLookup?.bibleOccurrencesCount && activeLookup.bibleOccurrencesCount > 0 ? (
                <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-900/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs hover:border-amber-700/40 transition-all">
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-xl bg-amber-200/70 text-amber-900 shrink-0">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-amber-950 font-cinzel flex items-center gap-2">
                        <span>King James Scripture Occurrences</span>
                        <span className="text-[11px] font-sans-ui font-semibold bg-amber-200/80 text-amber-950 px-2 py-0.5 rounded-full">
                          {activeLookup.bibleOccurrencesCount}{' '}
                          {activeLookup.bibleOccurrencesCount === 1 ? 'place' : 'places'}
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 mt-1 leading-relaxed font-sans-ui">
                        "{activeDetail.word}" appears{' '}
                        <strong className="text-stone-900 font-semibold">
                          {activeLookup.bibleOccurrencesCount}{' '}
                          {activeLookup.bibleOccurrencesCount === 1 ? 'time' : 'times'}
                        </strong>{' '}
                        in the King James Bible text. Search and explore each verse and its biblical context.
                      </p>
                      {activeLookup.strongsMatch?.suggestions &&
                        activeLookup.strongsMatch.suggestions.length > 0 &&
                        onOpenStrongs && (
                          <div className="mt-2 text-xs text-stone-600 flex items-center gap-1.5 flex-wrap">
                            <span>Closest biblical root in Strong's:</span>
                            <button
                              type="button"
                              onClick={() =>
                                onOpenStrongs(activeLookup.strongsMatch!.suggestions![0])
                              }
                              className="font-semibold text-amber-900 underline hover:text-amber-950 cursor-pointer"
                            >
                              "{activeLookup.strongsMatch.suggestions[0]}" →
                            </button>
                          </div>
                        )}
                    </div>
                  </div>
                  {onNavigateToScripture && (
                    <button
                      type="button"
                      onClick={() => onNavigateToScripture(activeDetail.word)}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-900 hover:bg-amber-800 text-white text-xs font-bold transition-colors cursor-pointer shrink-0 shadow-xs"
                    >
                      <Search className="w-3.5 h-3.5 text-amber-200" />
                      <span>Search in Bible</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-stone-100/70 border border-stone-200/80 flex items-start gap-3 text-stone-600">
                  <div className="p-2 rounded-xl bg-stone-200/80 text-stone-700 shrink-0">
                    <BookA className="w-4 h-4" />
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="font-bold text-stone-800 font-cinzel text-xs">
                      1828 Webster English Lexicon
                    </div>
                    <p>
                      "{activeDetail.word}" is an English literary or scientific term from Noah
                      Webster's 1828 American Dictionary that does not appear in the King James
                      Bible text or original Hebrew/Greek concordances.
                    </p>
                  </div>
                </div>
              )}

              {/* Explanatory note about 1828 Webster */}
              <div className="pt-6 border-t border-amber-900/10 text-xs text-stone-500 font-sans-ui flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  Definitions published by Noah Webster in 1828, reflecting early 19th-century
                  classical English and biblical usage.
                </span>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-stone-400">
              <BookA className="w-12 h-12 mb-3 text-stone-300" />
              <p className="text-base font-medium text-stone-600">Select a word to view its 1828 definition</p>
              <p className="text-xs text-stone-400 mt-1">
                Browse the alphabetical index on the left or search any English term.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
