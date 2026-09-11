import React, { useState, useEffect } from 'react';
import {
  Search,
  Scroll,
  BookOpen,
  Volume2,
  Bookmark,
  BookmarkCheck,
  BookA,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Filter,
} from 'lucide-react';
import {
  StrongsIndexWord,
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

interface StrongsViewProps {
  initialWord?: string;
  onWordClick: (word: string) => void;
  onOpenWebster1828: (word: string) => void;
  onSpeakText: (text: string) => void;
  onBookmarkStrongs: (word: string, entryId: string, title: string) => void;
  isStrongsBookmarked: (word: string, entryId: string) => boolean;
  onNavigateToScripture?: (query: string) => void;
  onNavigateToVerse?: (bookId: string, chapter: number, verse: number) => void;
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export const StrongsView: React.FC<StrongsViewProps> = ({
  initialWord,
  onWordClick,
  onOpenWebster1828,
  onSpeakText,
  onBookmarkStrongs,
  isStrongsBookmarked,
  onNavigateToScripture,
  onNavigateToVerse,
}) => {
  const [selectedLetter, setSelectedLetter] = useState('A');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [words, setWords] = useState<StrongsIndexWord[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);

  // Selected word detail
  const [selectedWord, setSelectedWord] = useState<string>(initialWord || 'abide');
  const [selectedWordDetail, setSelectedWordDetail] = useState<StrongsLookupResult | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [detailTab, setDetailTab] = useState<'hebrew' | 'greek' | 'occurrences'>('hebrew');

  // Synchronize when initialWord prop changes
  useEffect(() => {
    if (initialWord && initialWord.trim().toLowerCase() !== selectedWord.toLowerCase()) {
      const clean = initialWord.trim().toLowerCase();
      setSelectedWord(clean);
      const firstLetter = clean.charAt(0).toUpperCase();
      if (ALPHABET.includes(firstLetter)) {
        setSelectedLetter(firstLetter);
      }
      setSearchQuery('');
    }
  }, [initialWord]);

  // Biblical Occurrences State
  const [occurrencesWord, setOccurrencesWord] = useState<string>('abide');
  const [occurrencesTestament, setOccurrencesTestament] = useState<Testament | 'ALL'>('ALL');
  const [selectedBookFilter, setSelectedBookFilter] = useState<string>('');
  const [occurrencesData, setOccurrencesData] = useState<StrongsOccurrencesResult | null>(null);
  const [isLoadingOccurrences, setIsLoadingOccurrences] = useState(false);

  // Helper to load occurrences for a word/translation
  const loadOccurrences = (
    wordToFind: string,
    testament: Testament | 'ALL' = 'ALL',
    bookId?: string
  ) => {
    setOccurrencesWord(wordToFind);
    setOccurrencesTestament(testament);
    setSelectedBookFilter(bookId || '');
    setIsLoadingOccurrences(true);
    setDetailTab('occurrences');

    api
      .getStrongsOccurrences(wordToFind, testament, bookId, 100)
      .then((data) => {
        setOccurrencesData(data);
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
    } else if (onNavigateToScripture) {
      onNavigateToScripture(`${verse.bookName} ${verse.chapter}:${verse.verse}`);
    }
  };

  const safeNavigateScripture = (ref: string) => {
    if (onNavigateToScripture) {
      onNavigateToScripture(ref);
    }
  };

  // Load index for letter / search
  useEffect(() => {
    let isMounted = true;
    setIsLoadingList(true);

    if (searchQuery.trim().length >= 2) {
      // Search API
      fetch(`/api/strongs/search?q=${encodeURIComponent(searchQuery.trim())}&limit=50`)
        .then((r) => r.json())
        .then((data: StrongsIndexWord[]) => {
          if (!isMounted) return;
          setWords(data);
          setTotalCount(data.length);
          setTotalPages(1);
          setCurrentPage(1);
          setIsLoadingList(false);
          if (data.length > 0 && !selectedWord) {
            setSelectedWord(data[0].word);
          }
        })
        .catch(() => {
          if (isMounted) setIsLoadingList(false);
        });
    } else {
      // Paginated letter index
      fetch(
        `/api/strongs/index?letter=${encodeURIComponent(selectedLetter)}&page=${currentPage}&limit=40`
      )
        .then((r) => r.json())
        .then((data) => {
          if (!isMounted) return;
          setWords(data.words || []);
          setTotalPages(data.totalPages || 1);
          setTotalCount(data.total || 0);
          setIsLoadingList(false);
        })
        .catch(() => {
          if (isMounted) setIsLoadingList(false);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [selectedLetter, currentPage, searchQuery]);

  // Load word detail when selectedWord changes
  useEffect(() => {
    if (!selectedWord) return;
    let isMounted = true;
    setIsLoadingDetail(true);

    fetch(`/api/strongs/lookup?word=${encodeURIComponent(selectedWord)}`)
      .then((r) => r.json())
      .then((data: StrongsLookupResult) => {
        if (!isMounted) return;
        setSelectedWordDetail(data);
        setIsLoadingDetail(false);
        if (data.hebrewEntries.length > 0) {
          setDetailTab('hebrew');
        } else if (data.greekEntries.length > 0) {
          setDetailTab('greek');
        }
      })
      .catch(() => {
        if (isMounted) setIsLoadingDetail(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedWord]);

  const activeEntries: StrongsEntry[] =
    detailTab === 'hebrew'
      ? selectedWordDetail?.hebrewEntries || []
      : selectedWordDetail?.greekEntries || [];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8f6f0] text-stone-800 font-sans-ui overflow-hidden">
      {/* Top Banner */}
      <div className="bg-[#24211d] text-amber-100 px-4 sm:px-8 py-5 border-b border-stone-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-600/20 border border-amber-500/40 text-amber-300">
              <Scroll className="w-6 h-6" />
            </div>
            <div>
              <div className="font-cinzel text-lg sm:text-xl font-bold tracking-wider text-amber-100 flex items-center gap-2">
                <span>Strong's Exhaustive Concordance</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-widest font-mono">
                  English-Indexed
                </span>
              </div>
              <p className="text-xs text-stone-300 mt-0.5">
                Indexes every English word in the King James Bible to original Hebrew & Greek roots with Strong's definitions.
              </p>
            </div>
          </div>

          {/* Quick Search */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search English word in Strong's..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-stone-900/90 border border-stone-700 rounded-xl text-xs sm:text-sm text-stone-100 placeholder-stone-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Alphabet Selector (when not searching) */}
      {!searchQuery && (
        <div className="bg-[#edeae1] border-b border-stone-300/80 px-2 sm:px-6 py-2 overflow-x-auto flex items-center justify-center gap-1 scrollbar-thin">
          {ALPHABET.map((letter) => (
            <button
              key={letter}
              onClick={() => {
                setSelectedLetter(letter);
                setCurrentPage(1);
              }}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                selectedLetter === letter
                  ? 'bg-amber-800 text-white shadow-xs scale-105'
                  : 'text-stone-700 hover:bg-stone-300/60'
              }`}
            >
              {letter}
            </button>
          ))}
        </div>
      )}

      {/* Main Split Layout: Word List on Left, Detailed Strong's Definition Card on Right */}
      <div className="flex-1 flex overflow-hidden max-w-7xl mx-auto w-full">
        {/* Left Column: English Words List */}
        <div className="w-full md:w-80 lg:w-96 border-r border-stone-300/70 bg-white flex flex-col shrink-0">
          <div className="p-3 bg-stone-50 border-b border-stone-200 flex items-center justify-between text-xs text-stone-600 font-medium">
            <span>
              {searchQuery ? `Search results: ${totalCount}` : `Letter ${selectedLetter} (${totalCount} words)`}
            </span>
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1 rounded hover:bg-stone-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span>
                  {currentPage} / {totalPages}
                </span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1 rounded hover:bg-stone-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-stone-100">
            {isLoadingList ? (
              <div className="p-8 text-center text-stone-400 flex flex-col items-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-amber-700" />
                <span className="text-xs">Loading English Concordance Index...</span>
              </div>
            ) : words.length === 0 ? (
              <div className="p-8 text-center text-stone-400 text-xs">
                No words found matching "{searchQuery}".
              </div>
            ) : (
              words.map((item) => {
                const isSelected =
                  selectedWord.toLowerCase() === item.word.toLowerCase();

                return (
                  <button
                    key={item.word}
                    onClick={() => setSelectedWord(item.word)}
                    className={`w-full text-left p-3 sm:p-3.5 transition-colors cursor-pointer flex flex-col gap-1 ${
                      isSelected
                        ? 'bg-amber-50/90 border-l-4 border-amber-800'
                        : 'hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`font-serif text-sm font-bold capitalize ${
                          isSelected ? 'text-amber-950' : 'text-stone-800'
                        }`}
                      >
                        {item.word}
                      </span>
                      <div className="flex items-center gap-1">
                        {item.hebrewCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-100 text-amber-900 font-semibold">
                            {item.hebrewCount} Heb
                          </span>
                        )}
                        {item.greekCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-100 text-blue-900 font-semibold">
                            {item.greekCount} Grk
                          </span>
                        )}
                      </div>
                    </div>

                    {item.previewDef && (
                      <p className="text-[11px] text-stone-500 line-clamp-1 italic">
                        {item.previewDef}
                      </p>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Selected Word's Strong's Definition Details */}
        <div className="hidden md:flex flex-1 flex-col bg-[#fdfbf7] overflow-y-auto">
          {isLoadingDetail ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-stone-400">
              <Loader2 className="w-8 h-8 animate-spin text-amber-700" />
              <p className="text-sm">Loading Strong's Concordance Details...</p>
            </div>
          ) : !selectedWordDetail || !selectedWordDetail.found ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-stone-400">
              <Scroll className="w-10 h-10 mb-2 opacity-50" />
              <p className="text-sm">Select an English word from the index to view Strong's Concordance</p>
            </div>
          ) : (
            <div className="p-6 sm:p-8 space-y-6 max-w-3xl">
              {/* Word Header */}
              <div className="flex items-start justify-between gap-4 border-b border-stone-200 pb-5">
                <div>
                  <div className="text-xs uppercase tracking-widest font-semibold text-amber-800">
                    Strong's English Concordance Entry
                  </div>
                  <h2 className="text-3xl font-serif font-bold text-amber-950 capitalize tracking-wide mt-1">
                    {selectedWordDetail.matchedWord || selectedWordDetail.query}
                  </h2>
                  <div className="text-xs text-stone-500 mt-1 flex items-center gap-3">
                    <span>
                      {selectedWordDetail.hebrewEntries.length} Old Testament Hebrew roots
                    </span>
                    <span>•</span>
                    <span>
                      {selectedWordDetail.greekEntries.length} New Testament Greek roots
                    </span>
                  </div>
                </div>

                {/* Actions: Compare with 1828 & Search in Scripture */}
                <div className="flex flex-wrap items-center gap-2">
                  {selectedWordDetail.websterMatch?.exists ? (
                    <button
                      onClick={() =>
                        onOpenWebster1828(
                          selectedWordDetail.websterMatch?.matchedWord ||
                          selectedWordDetail.matchedWord ||
                          selectedWordDetail.query
                        )
                      }
                      title={`Compare with 1828 Webster Dictionary definition of "${selectedWordDetail.websterMatch?.matchedWord || selectedWordDetail.matchedWord || selectedWordDetail.query}"`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300/80 text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                    >
                      <BookA className="w-4 h-4 text-amber-800" />
                      <span>
                        Webster 1828
                        {selectedWordDetail.websterMatch?.matchedWord &&
                        selectedWordDetail.websterMatch.matchedWord.toLowerCase() !==
                          (selectedWordDetail.matchedWord || selectedWordDetail.query).toLowerCase()
                          ? `: ${selectedWordDetail.websterMatch.matchedWord}`
                          : ''}
                      </span>
                    </button>
                  ) : selectedWordDetail.websterMatch?.suggestions &&
                    selectedWordDetail.websterMatch.suggestions.length > 0 ? (
                    <button
                      onClick={() =>
                        onOpenWebster1828(selectedWordDetail.websterMatch!.suggestions![0])
                      }
                      title={`"${selectedWordDetail.matchedWord || selectedWordDetail.query}" not in 1828 Webster. View closest entry "${selectedWordDetail.websterMatch!.suggestions![0]}"`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-medium transition-colors cursor-pointer shadow-xs"
                    >
                      <BookA className="w-4 h-4 text-amber-800" />
                      <span>Webster: {selectedWordDetail.websterMatch!.suggestions![0]}</span>
                    </button>
                  ) : (
                    <div
                      title="Original biblical Hebrew/Greek term or proper name found directly in Scripture"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 text-stone-600 border border-stone-200 text-xs font-medium"
                    >
                      <Scroll className="w-3.5 h-3.5 text-amber-800" />
                      <span>Biblical Term (Scripture Only)</span>
                    </div>
                  )}

                  <button
                    onClick={() =>
                      loadOccurrences(
                        selectedWordDetail.matchedWord || selectedWordDetail.query,
                        'ALL'
                      )
                    }
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                    <span>Places in Bible</span>
                  </button>
                </div>
              </div>

              {/* Hebrew vs Greek vs Places in Bible Tabs */}
              <div className="flex flex-wrap gap-2 sm:gap-3 border-b border-stone-200">
                <button
                  onClick={() => setDetailTab('hebrew')}
                  disabled={selectedWordDetail.hebrewEntries.length === 0}
                  className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                    detailTab === 'hebrew'
                      ? 'border-amber-800 text-amber-900'
                      : selectedWordDetail.hebrewEntries.length > 0
                      ? 'border-transparent text-stone-500 hover:text-stone-800'
                      : 'border-transparent text-stone-300 opacity-40 cursor-not-allowed'
                  }`}
                >
                  <span>Hebrew (Old Testament)</span>
                  <span className="px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-900">
                    {selectedWordDetail.hebrewEntries.length}
                  </span>
                </button>

                <button
                  onClick={() => setDetailTab('greek')}
                  disabled={selectedWordDetail.greekEntries.length === 0}
                  className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                    detailTab === 'greek'
                      ? 'border-amber-800 text-amber-900'
                      : selectedWordDetail.greekEntries.length > 0
                      ? 'border-transparent text-stone-500 hover:text-stone-800'
                      : 'border-transparent text-stone-300 opacity-40 cursor-not-allowed'
                  }`}
                >
                  <span>Greek (New Testament)</span>
                  <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-900">
                    {selectedWordDetail.greekEntries.length}
                  </span>
                </button>

                <button
                  onClick={() => {
                    if (!occurrencesData || occurrencesWord !== (selectedWordDetail.matchedWord || selectedWordDetail.query)) {
                      loadOccurrences(
                        selectedWordDetail.matchedWord || selectedWordDetail.query,
                        'ALL'
                      );
                    } else {
                      setDetailTab('occurrences');
                    }
                  }}
                  className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                    detailTab === 'occurrences'
                      ? 'border-amber-800 text-amber-900'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-amber-700" />
                  <span>Places in the Bible</span>
                  {occurrencesData && (
                    <span className="px-2 py-0.5 rounded-full text-xs bg-amber-200/80 text-amber-950 font-mono">
                      {occurrencesData.totalCount}
                    </span>
                  )}
                </button>
              </div>

              {/* View Content: Hebrew / Greek Cards OR Places in the Bible Tab */}
              {detailTab === 'occurrences' ? (
                /* Places in the Bible View */
                <div className="space-y-5">
                  {/* Occurrences Header & Filter Controls */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-white border border-amber-900/15 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="text-base font-bold text-amber-950 flex items-center gap-2">
                          <BookOpen className="w-5 h-5 text-amber-700" />
                          <span>Scripture Occurrences for "{occurrencesWord}"</span>
                        </div>
                        <p className="text-xs text-stone-600 mt-0.5">
                          {occurrencesData ? (
                            <span>
                              Found in <strong className="text-stone-900">{occurrencesData.totalCount} verses</strong> across{' '}
                              <strong className="text-stone-900">{occurrencesData.bookDistribution.length} books</strong> of the Bible
                            </span>
                          ) : (
                            'Searching King James Bible...'
                          )}
                        </p>
                      </div>

                      {/* Testament Filters */}
                      <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl border border-stone-200 self-start sm:self-auto">
                        <button
                          onClick={() => loadOccurrences(occurrencesWord, 'ALL', selectedBookFilter)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            occurrencesTestament === 'ALL'
                              ? 'bg-amber-800 text-white shadow-xs'
                              : 'text-stone-600 hover:text-stone-900'
                          }`}
                        >
                          All Bible
                        </button>
                        <button
                          onClick={() => loadOccurrences(occurrencesWord, 'OT', selectedBookFilter)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            occurrencesTestament === 'OT'
                              ? 'bg-amber-800 text-white shadow-xs'
                              : 'text-stone-600 hover:text-stone-900'
                          }`}
                        >
                          Old Testament
                        </button>
                        <button
                          onClick={() => loadOccurrences(occurrencesWord, 'NT', selectedBookFilter)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            occurrencesTestament === 'NT'
                              ? 'bg-amber-800 text-white shadow-xs'
                              : 'text-stone-600 hover:text-stone-900'
                          }`}
                        >
                          New Testament
                        </button>
                      </div>
                    </div>

                    {/* Book Distribution Pills */}
                    {occurrencesData && occurrencesData.bookDistribution.length > 0 && (
                      <div className="space-y-1.5 pt-3 border-t border-stone-100">
                        <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
                          <Filter className="w-3.5 h-3.5 text-amber-700" />
                          <span>Filter occurrences by book:</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1 scrollbar-thin">
                          <button
                            onClick={() => loadOccurrences(occurrencesWord, occurrencesTestament, '')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                              !selectedBookFilter
                                ? 'bg-amber-900 text-white border-amber-950 shadow-xs'
                                : 'bg-stone-50 hover:bg-amber-100/60 text-stone-700 border-stone-200'
                            }`}
                          >
                            All Books ({occurrencesData.totalCount})
                          </button>
                          {occurrencesData.bookDistribution.map((b) => (
                            <button
                              key={b.bookId}
                              onClick={() =>
                                loadOccurrences(
                                  occurrencesWord,
                                  occurrencesTestament,
                                  selectedBookFilter === b.bookId ? '' : b.bookId
                                )
                              }
                              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer flex items-center gap-1.5 ${
                                selectedBookFilter.toLowerCase() === b.bookId.toLowerCase()
                                  ? 'bg-amber-900 text-white border-amber-950 shadow-xs'
                                  : 'bg-white hover:bg-amber-100/60 text-stone-700 border-stone-200'
                              }`}
                            >
                              <span>{b.bookName}</span>
                              <span
                                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                                  selectedBookFilter.toLowerCase() === b.bookId.toLowerCase()
                                    ? 'bg-amber-700 text-amber-100'
                                    : 'bg-stone-100 text-stone-600'
                                }`}
                              >
                                {b.count}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Verses List */}
                  {isLoadingOccurrences ? (
                    <div className="py-16 flex flex-col items-center justify-center gap-3 text-stone-500">
                      <Loader2 className="w-7 h-7 animate-spin text-amber-700" />
                      <span className="text-sm font-medium">Finding occurrences in the King James Bible...</span>
                    </div>
                  ) : occurrencesData && occurrencesData.verses.length > 0 ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-stone-500 px-1">
                        <span>
                          Showing {occurrencesData.verses.length} of {occurrencesData.totalCount} verses
                          {selectedBookFilter ? ` in selected book` : ''}
                        </span>
                        <span>Click any verse to read in context</span>
                      </div>

                      <div className="space-y-3">
                        {occurrencesData.verses.map((v, idx) => (
                          <div
                            key={`${v.bookId}-${v.chapter}-${v.verse}-${idx}`}
                            onClick={() => handleVerseClick(v)}
                            className="p-5 rounded-2xl bg-white border border-amber-900/15 hover:border-amber-600 hover:shadow-md transition-all cursor-pointer group space-y-2"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-amber-950 group-hover:text-amber-800 flex items-center gap-1.5">
                                  <span>{v.bookName} {v.chapter}:{v.verse}</span>
                                </span>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 border border-stone-200">
                                  {v.testament === 'OT' ? 'Old Testament' : 'New Testament'}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleVerseClick(v);
                                }}
                                className="text-xs font-semibold text-amber-800 hover:text-amber-950 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors"
                              >
                                <span>Read in Bible</span>
                                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                              </button>
                            </div>

                            <p className="text-base text-stone-800 leading-relaxed font-serif">
                              {highlightWordInText(v.cleanText, occurrencesWord)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="py-16 text-center text-stone-500 bg-white rounded-2xl border border-stone-200 p-8 space-y-2">
                      <BookOpen className="w-8 h-8 text-stone-400 mx-auto" />
                      <div className="text-sm font-semibold text-stone-700">No verses found</div>
                      <p className="text-xs text-stone-500 max-w-md mx-auto">
                        No occurrences found for "{occurrencesWord}" in the selected testament or book. Try selecting another translation rendering from the Hebrew or Greek tab.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* Hebrew / Greek Cards View */
                <div className="space-y-6">
                  {activeEntries.map((entry) => {
                    const bookmarked = isStrongsBookmarked(
                      selectedWordDetail.matchedWord || selectedWordDetail.query,
                      entry.id
                    );

                    return (
                      <div
                        key={entry.id}
                        className="p-6 rounded-2xl bg-white border border-amber-900/15 shadow-sm space-y-5 hover:border-amber-700/40 transition-all"
                      >
                        {/* Top Header */}
                        <div className="flex items-start justify-between gap-3 border-b border-stone-100 pb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 font-mono font-bold text-xs border border-amber-300">
                                Strong's {entry.id}
                              </span>
                              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
                                {entry.testament === 'OT' ? 'Biblical Hebrew' : 'Koine Greek'}
                              </span>
                            </div>

                            <div className="mt-2.5 flex items-baseline gap-3">
                              <span
                                className="text-3xl sm:text-4xl font-serif text-amber-950 select-text"
                                dir={entry.testament === 'OT' ? 'rtl' : 'ltr'}
                              >
                                {entry.lemma}
                              </span>
                              <div className="text-sm text-stone-700">
                                <span className="font-bold italic text-stone-900">
                                  {entry.translit}
                                </span>
                                {entry.pron && (
                                  <span className="text-stone-500 ml-2 font-mono text-xs">
                                    \{entry.pron}\
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Speech and Bookmark */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() =>
                                onSpeakText(
                                  `Strong's ${entry.id}. ${entry.translit}. Definition: ${entry.strongs_def}`
                                )
                              }
                              title="Read definition aloud"
                              className="p-2 text-stone-500 hover:text-amber-800 hover:bg-amber-50 rounded-xl transition-colors cursor-pointer"
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                onBookmarkStrongs(
                                  selectedWordDetail.matchedWord || selectedWordDetail.query,
                                  entry.id,
                                  `Strong's ${entry.id}: ${entry.translit} (${entry.lemma})`
                                )
                              }
                              title={bookmarked ? 'Remove bookmark' : 'Bookmark Strong entry'}
                              className={`p-2 rounded-xl transition-colors cursor-pointer ${
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

                        {/* Strong's Definition Box */}
                        <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/80 space-y-1.5">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase tracking-wider">
                            <Scroll className="w-4 h-4 text-amber-700" />
                            <span>Strong's Definition</span>
                          </div>
                          <div className="text-base leading-relaxed text-stone-900 font-serif">
                            {renderTextWithScriptureCitations(
                              entry.strongs_def || 'No specific definition provided.',
                              safeNavigateScripture
                            )}
                          </div>
                        </div>

                        {/* Derivation / Origin with Scripture Reference Links */}
                        {entry.derivation && (
                          <div className="space-y-1 text-xs">
                            <span className="font-semibold text-stone-500 uppercase tracking-wider text-[10px]">
                              Etymology / Derivation:
                            </span>
                            <div className="text-stone-700 italic bg-stone-50 p-3 rounded-xl border border-stone-200/70 leading-relaxed">
                              {renderTextWithScriptureCitations(
                                entry.derivation,
                                safeNavigateScripture
                              )}
                            </div>
                          </div>
                        )}

                        {/* KJV Translation Renderings & Interactive Chips */}
                        {entry.kjv_def && (
                          <div className="space-y-2 text-xs">
                            <span className="font-semibold text-stone-500 uppercase tracking-wider text-[10px]">
                              King James Version Renderings:
                            </span>
                            <div className="text-stone-800 font-medium bg-amber-100/40 p-3 rounded-xl border border-amber-200/60 leading-relaxed">
                              {renderTextWithScriptureCitations(
                                entry.kjv_def,
                                safeNavigateScripture
                              )}
                            </div>

                            {/* Clickable Translation Chips to Jump to Occurrences */}
                            {(() => {
                              const renderings = parseKjvRenderings(entry.kjv_def);
                              if (renderings.length === 0) return null;

                              return (
                                <div className="pt-1.5">
                                  <div className="text-[10px] uppercase font-bold text-stone-600 mb-1.5 flex items-center gap-1">
                                    <Search className="w-3 h-3 text-amber-700" />
                                    <span>Find places in Bible for specific translation:</span>
                                  </div>
                                  <div className="flex flex-wrap gap-1.5">
                                    {renderings.map((token) => (
                                      <button
                                        key={token}
                                        type="button"
                                        onClick={() => loadOccurrences(token, entry.testament)}
                                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white hover:bg-amber-100 text-stone-800 border border-stone-300/80 hover:border-amber-400 transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                                        title={`Find places where ${entry.id} is translated "${token}" in the King James Bible`}
                                      >
                                        <span>{token}</span>
                                        <ArrowRight className="w-3 h-3 opacity-60" />
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        )}

                        {/* Bottom Action: View all places in the Bible for this Root */}
                        <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() =>
                              loadOccurrences(
                                selectedWordDetail.matchedWord || selectedWordDetail.query,
                                entry.testament
                              )
                            }
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-900 hover:bg-amber-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                          >
                            <BookOpen className="w-4 h-4 text-amber-200" />
                            <span>
                              View Bible Occurrences ({entry.testament === 'OT' ? 'Old Testament' : 'New Testament'})
                            </span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
