import React, { useRef, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Volume2,
  Bookmark,
  BookmarkCheck,
  Share2,
  Check,
  BookOpen,
  BookA,
  Scroll,
  Columns,
  HelpCircle,
} from 'lucide-react';
import { ChapterData, BibleVerse, ReadingSettings, BibleMode } from '../types';

interface BibleReaderProps {
  chapterData: ChapterData;
  settings: ReadingSettings;
  currentSpokenVerse: number | null;
  activeWord: string | null;
  onWordClick: (word: string, targetMode: '1828' | 'strongs') => void;
  onChangeBibleMode: (mode: BibleMode) => void;
  onPrevChapter: () => void;
  onNextChapter: () => void;
  onPlayFromVerse: (verseNum: number) => void;
  onBookmarkVerse: (verse: BibleVerse) => void;
  isVerseBookmarked: (bookId: string, chapter: number, verse: number) => boolean;
  onOpenAbout?: () => void;
}

export const BibleReader: React.FC<BibleReaderProps> = ({
  chapterData,
  settings,
  currentSpokenVerse,
  activeWord,
  onWordClick,
  onChangeBibleMode,
  onPrevChapter,
  onNextChapter,
  onPlayFromVerse,
  onBookmarkVerse,
  isVerseBookmarked,
  onOpenAbout,
}) => {
  const activeVerseRef = useRef<HTMLDivElement | null>(null);
  const [copiedVerse, setCopiedVerse] = React.useState<number | null>(null);

  // Auto-scroll to active spoken verse
  useEffect(() => {
    if (currentSpokenVerse && activeVerseRef.current) {
      activeVerseRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [currentSpokenVerse]);

  const handleCopyVerse = (verse: BibleVerse) => {
    const textToCopy = `${chapterData.book.name} ${chapterData.chapter}:${verse.verse} - "${verse.cleanText}" (KJV)`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedVerse(verse.verse);
    setTimeout(() => setCopiedVerse(null), 2000);
  };

  // Font size classes
  const fontSizes = {
    sm: 'text-base sm:text-lg leading-relaxed',
    md: 'text-lg sm:text-xl leading-relaxed',
    lg: 'text-xl sm:text-2xl leading-relaxed',
    xl: 'text-2xl sm:text-3xl leading-loose',
  };

  // Font family classes
  const fontFamilies = {
    serif: 'font-garamond',
    classic: 'font-garamond',
    sans: 'font-sans-ui',
  };

  // Theme styling
  const themeStyles = {
    paper: {
      bg: 'bg-[#fbf8f2]',
      text: 'text-[#1c1917]',
      secondary: 'text-[#78716c]',
      border: 'border-[#e7e0d4]',
      card: 'bg-[#f5efe4]/60',
      highlight: 'bg-amber-100/90 text-amber-950 ring-1 ring-amber-400',
      activeVerse: 'bg-[#f4ebe0] ring-1 ring-amber-600/40 shadow-xs',
      wordHover: 'hover:text-amber-800 hover:bg-amber-100/70',
      wordActive: 'bg-amber-200 text-amber-950 font-semibold rounded-xs px-0.5',
    },
    light: {
      bg: 'bg-white',
      text: 'text-slate-900',
      secondary: 'text-slate-500',
      border: 'border-slate-200',
      card: 'bg-slate-50',
      highlight: 'bg-blue-50 text-blue-900 ring-1 ring-blue-300',
      activeVerse: 'bg-slate-100/80 ring-1 ring-blue-500/40 shadow-xs',
      wordHover: 'hover:text-blue-700 hover:bg-blue-50',
      wordActive: 'bg-blue-100 text-blue-950 font-semibold rounded-xs px-0.5',
    },
    sepia: {
      bg: 'bg-[#f4ecd8]',
      text: 'text-[#3b2d1d]',
      secondary: 'text-[#7d6852]',
      border: 'border-[#dfd3b8]',
      card: 'bg-[#ebe0c4]/70',
      highlight: 'bg-[#e2d4b0] text-[#2c2012] ring-1 ring-[#a6864c]',
      activeVerse: 'bg-[#ecdeb9] ring-1 ring-[#a6864c] shadow-xs',
      wordHover: 'hover:text-[#6a4f2c] hover:bg-[#e4d4b1]',
      wordActive: 'bg-[#dfce9f] text-[#2c2012] font-semibold rounded-xs px-0.5',
    },
    dark: {
      bg: 'bg-[#12141a]',
      text: 'text-[#e6e8ee]',
      secondary: 'text-[#8c94a4]',
      border: 'border-[#262a36]',
      card: 'bg-[#1b1f2b]',
      highlight: 'bg-amber-950/70 text-amber-200 ring-1 ring-amber-600/50',
      activeVerse: 'bg-[#1d2334] ring-1 ring-amber-500/50 shadow-md',
      wordHover: 'hover:text-amber-300 hover:bg-amber-900/40',
      wordActive: 'bg-amber-900/80 text-amber-100 font-semibold rounded-xs px-0.5',
    },
  };

  const currentTheme = themeStyles[settings.theme] || themeStyles.paper;

  // Render verse words with interactive tap-to-define
  const renderInteractiveText = (
    rawVerseText: string,
    targetMode: '1828' | 'strongs'
  ) => {
    const verseText = rawVerseText
      .replace(/«\{[^{}]+\}»/g, '')
      .replace(/\{[^{}]+:[^{}]+\}/g, '')
      .replace(/\{[^{}]*;\s*(?:or|Heb\.|Gr\.|Chald\.)[^{}]*\}/gi, '')
      .replace(/\{[^{}]*\bor,\s+[^{}]*\}/gi, '')
      .replace(/\{[^{}]*\b(?:Heb\.|Gr\.|Chald\.|Chal\.)[^{}]*\}/g, '')
      .replace(/\{[^{}]*not found in most of the Greek copies[^{}]*\}/gi, '')
      .replace(/\s{2,}/g, ' ')
      .trim();

    const tokens = verseText.split(/(\s+|[{}]|[.,;!?:()\[\]"]+)/g).filter(Boolean);
    let isInsideItalic = false;

    const testamentLabel = chapterData.book.testament === 'OT' ? 'Hebrew' : 'Greek';
    const tooltipText =
      targetMode === 'strongs'
        ? `Tap for Strong's Concordance (${testamentLabel} original definition)`
        : `Tap to define in 1828 Webster Dictionary`;

    return (
      <>
        {tokens.map((token, idx) => {
          if (token === '{') {
            isInsideItalic = true;
            return null;
          }
          if (token === '}') {
            isInsideItalic = false;
            return null;
          }

          const isWord = /[a-zA-Z]/.test(token);
          if (!isWord) {
            return (
              <span key={idx} className="select-none">
                {token}
              </span>
            );
          }

          const cleanWord = token.toLowerCase().replace(/[^a-z]/g, '');
          const isCurrentActive =
            activeWord && cleanWord === activeWord.toLowerCase();

          return (
            <span
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                onWordClick(cleanWord, targetMode);
              }}
              title={`${tooltipText}: "${cleanWord}"`}
              className={`cursor-pointer transition-colors duration-150 rounded-xs ${
                isInsideItalic && settings.showItalics ? 'italic' : ''
              } ${isCurrentActive ? currentTheme.wordActive : currentTheme.wordHover}`}
            >
              {token}
            </span>
          );
        })}
      </>
    );
  };

  const isParallel = settings.bibleMode === 'parallel';

  return (
    <div
      className={`flex-1 overflow-y-auto px-3 py-6 sm:px-8 md:px-12 transition-colors duration-200 ${currentTheme.bg} ${currentTheme.text}`}
    >
      <div className={`mx-auto pb-32 ${isParallel ? 'max-w-7xl' : 'max-w-3xl'}`}>
        {/* Chapter Header Banner */}
        <div className="text-center mb-8 pb-6 border-b border-stone-300/40">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs uppercase tracking-widest font-semibold text-amber-800 bg-amber-100/60 mb-3 font-sans-ui">
            <span>
              {chapterData.book.testament === 'OT' ? 'Old Testament' : 'New Testament'}
            </span>
            <span>•</span>
            <span>{chapterData.book.category}</span>
          </div>

          <h1 className="font-cinzel text-3xl sm:text-5xl font-bold tracking-tight mb-2">
            {chapterData.book.name}
          </h1>

          <div className="font-cinzel text-xl sm:text-2xl text-stone-600 font-semibold tracking-wide mb-5">
            Chapter {chapterData.chapter}
          </div>

          {/* Bible Mode Switcher Bar */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 p-1 bg-stone-200/70 dark:bg-stone-800/80 rounded-2xl w-fit mx-auto border border-stone-300/80 dark:border-stone-700 shadow-xs mb-5">
            <button
              onClick={() => onChangeBibleMode('1828')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                settings.bibleMode === '1828'
                  ? 'bg-amber-800 text-white shadow-xs'
                  : 'text-stone-700 dark:text-stone-300 hover:text-stone-900'
              }`}
            >
              <BookA className="w-3.5 h-3.5" />
              <span>KJV • 1828 Webster</span>
            </button>

            <button
              onClick={() => onChangeBibleMode('strongs')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                settings.bibleMode === 'strongs'
                  ? 'bg-amber-800 text-white shadow-xs'
                  : 'text-stone-700 dark:text-stone-300 hover:text-stone-900'
              }`}
            >
              <Scroll className="w-3.5 h-3.5" />
              <span>KJV • Strong's Concordance</span>
            </button>

            <button
              onClick={() => onChangeBibleMode('parallel')}
              className={`hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                settings.bibleMode === 'parallel'
                  ? 'bg-amber-800 text-white shadow-xs'
                  : 'text-stone-700 dark:text-stone-300 hover:text-stone-900'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Dual Parallel Bibles</span>
            </button>
          </div>

          {/* Active Mode Notice / Subtitle */}
          <div className="text-xs text-stone-500 font-sans-ui flex items-center justify-center gap-2">
            {settings.bibleMode === '1828' && (
              <span>
                📖 <strong>1828 Mode:</strong> Tap any English word to view Noah Webster's 1828 definition.
              </span>
            )}
            {settings.bibleMode === 'strongs' && (
              <span>
                📜 <strong>Strong's Mode:</strong> Tap any English word for original{' '}
                {chapterData.book.testament === 'OT' ? 'Hebrew' : 'Greek'} Strong's Concordance definition & root.
              </span>
            )}
            {settings.bibleMode === 'parallel' && (
              <span>
                ⚖️ <strong>Dual Parallel Mode:</strong> Compare 1828 Webster's (left) and Strong's Concordance (right).
              </span>
            )}
          </div>

          {/* Quick Chapter Navigation Buttons */}
          <div className="flex items-center justify-center gap-4 mt-5">
            <button
              onClick={onPrevChapter}
              disabled={!chapterData.prev}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                chapterData.prev
                  ? `${currentTheme.card} hover:scale-105 border ${currentTheme.border}`
                  : 'opacity-30 cursor-not-allowed'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Chapter</span>
            </button>

            <button
              onClick={onNextChapter}
              disabled={!chapterData.next}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                chapterData.next
                  ? `${currentTheme.card} hover:scale-105 border ${currentTheme.border}`
                  : 'opacity-30 cursor-not-allowed'
              }`}
            >
              <span>Next Chapter</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Verses Rendering: Single vs Parallel Layout */}
        {isParallel ? (
          /* Parallel Dual Bible Columns */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Left Column: 1828 Webster Bible */}
            <div className="p-4 sm:p-6 rounded-2xl bg-amber-50/40 dark:bg-stone-900/40 border border-amber-900/15 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-amber-900/10">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-200/60 text-amber-900">
                    <BookA className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-cinzel text-sm font-bold text-amber-950 dark:text-amber-100">
                      KJV • 1828 Webster Bible
                    </h3>
                    <p className="text-[10px] text-stone-500">
                      Tap words for 1828 American English definitions
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {chapterData.verses.map((verse) => {
                  const isSpoken = currentSpokenVerse === verse.verse;
                  return (
                    <div
                      key={`1828-${verse.verse}`}
                      className={`p-2.5 rounded-xl transition-all duration-150 flex items-baseline gap-2.5 ${
                        isSpoken ? currentTheme.activeVerse : 'hover:bg-amber-100/30'
                      }`}
                    >
                      <span className="font-cinzel font-bold text-amber-800 text-xs shrink-0 w-5 text-right">
                        {verse.verse}
                      </span>
                      <div
                        className={`flex-1 ${fontFamilies[settings.fontFamily]} ${
                          fontSizes[settings.fontSize]
                        }`}
                      >
                        {renderInteractiveText(verse.text, '1828')}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Strong's Concordance Bible */}
            <div className="p-4 sm:p-6 rounded-2xl bg-amber-50/40 dark:bg-stone-900/40 border border-amber-900/15 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-amber-900/10">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-700 text-amber-100">
                    <Scroll className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-cinzel text-sm font-bold text-amber-950 dark:text-amber-100">
                      KJV • Strong's Concordance Bible
                    </h3>
                    <p className="text-[10px] text-stone-500">
                      Tap words for Strong's original Hebrew & Greek definitions
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {chapterData.verses.map((verse) => {
                  const isSpoken = currentSpokenVerse === verse.verse;
                  return (
                    <div
                      key={`strongs-${verse.verse}`}
                      className={`p-2.5 rounded-xl transition-all duration-150 flex items-baseline gap-2.5 ${
                        isSpoken ? currentTheme.activeVerse : 'hover:bg-amber-100/30'
                      }`}
                    >
                      <span className="font-cinzel font-bold text-amber-800 text-xs shrink-0 w-5 text-right">
                        {verse.verse}
                      </span>
                      <div
                        className={`flex-1 ${fontFamilies[settings.fontFamily]} ${
                          fontSizes[settings.fontSize]
                        }`}
                      >
                        {renderInteractiveText(verse.text, 'strongs')}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Single Column Bible View */
          <div>
            {settings.layout === 'verse' ? (
              <div className="space-y-4 sm:space-y-6">
                {chapterData.verses.map((verse) => {
                  const isSpoken = currentSpokenVerse === verse.verse;
                  const isBookmarked = isVerseBookmarked(
                    chapterData.book.id,
                    chapterData.chapter,
                    verse.verse
                  );

                  return (
                    <div
                      key={verse.verse}
                      data-verse={verse.verse}
                      ref={isSpoken ? activeVerseRef : null}
                      className={`group relative p-3 sm:p-4 rounded-xl transition-all duration-200 border border-transparent ${
                        isSpoken ? currentTheme.activeVerse : 'hover:border-stone-200/50'
                      }`}
                    >
                      <div className="flex items-baseline gap-3">
                        <span className="font-cinzel font-bold text-amber-800/90 text-sm sm:text-base select-none shrink-0 w-6 text-right">
                          {verse.verse}
                        </span>

                        <div
                          className={`flex-1 ${fontFamilies[settings.fontFamily]} ${
                            fontSizes[settings.fontSize]
                          }`}
                        >
                          {renderInteractiveText(
                            verse.text,
                            settings.bibleMode === 'strongs' ? 'strongs' : '1828'
                          )}
                        </div>
                      </div>

                      {/* Hover Quick Actions */}
                      <div className="opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity absolute right-2 top-2 flex items-center gap-1 bg-stone-900/80 text-white rounded-lg p-1 backdrop-blur-xs shadow-md">
                        <button
                          onClick={() => onPlayFromVerse(verse.verse)}
                          title="Listen from this verse"
                          className="p-1 hover:text-amber-300 rounded cursor-pointer"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onBookmarkVerse(verse)}
                          title={isBookmarked ? 'Remove bookmark' : 'Bookmark verse'}
                          className={`p-1 rounded cursor-pointer ${
                            isBookmarked ? 'text-amber-400' : 'hover:text-amber-300'
                          }`}
                        >
                          {isBookmarked ? (
                            <BookmarkCheck className="w-3.5 h-3.5" />
                          ) : (
                            <Bookmark className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleCopyVerse(verse)}
                          title="Copy verse"
                          className="p-1 hover:text-amber-300 rounded cursor-pointer"
                        >
                          {copiedVerse === verse.verse ? (
                            <Check className="w-3.5 h-3.5 text-green-400" />
                          ) : (
                            <Share2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Paragraph Layout */
              <div
                className={`space-y-4 ${fontFamilies[settings.fontFamily]} ${
                  fontSizes[settings.fontSize]
                } leading-relaxed text-justify`}
              >
                <p>
                  {chapterData.verses.map((verse) => {
                    const isSpoken = currentSpokenVerse === verse.verse;
                    return (
                      <span
                        key={verse.verse}
                        ref={isSpoken ? activeVerseRef : null}
                        className={`inline ${
                          isSpoken
                            ? 'bg-amber-200/70 text-amber-950 font-medium px-1 rounded-sm'
                            : ''
                        }`}
                      >
                        <sup className="font-cinzel font-bold text-amber-800 text-xs px-1 select-none">
                          {verse.verse}
                        </sup>
                        {renderInteractiveText(
                          verse.text,
                          settings.bibleMode === 'strongs' ? 'strongs' : '1828'
                        )}{' '}
                      </span>
                    );
                  })}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Chapter Bottom Navigation */}
        <div className="mt-16 pt-8 border-t border-stone-300/40 flex items-center justify-between">
          {chapterData.prev ? (
            <button
              onClick={onPrevChapter}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 border ${currentTheme.border} ${currentTheme.card} hover:scale-105 transition-all cursor-pointer`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Chapter</span>
            </button>
          ) : (
            <div />
          )}

          {chapterData.next ? (
            <button
              onClick={onNextChapter}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 border ${currentTheme.border} ${currentTheme.card} hover:scale-105 transition-all cursor-pointer`}
            >
              <span>Next Chapter</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <div />
          )}
        </div>

        {/* Study Suite Reference & Guide Footer */}
        {onOpenAbout && (
          <div className="mt-8 pt-6 border-t border-stone-300/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs opacity-75 hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400">
              <BookOpen className="w-3.5 h-3.5 text-amber-700" />
              <span>King James 1611 • Noah Webster 1828 • Strong's Hebrew & Greek</span>
            </div>
            <button
              onClick={onOpenAbout}
              className="inline-flex items-center gap-1.5 font-semibold text-amber-800 hover:text-amber-950 underline underline-offset-2 cursor-pointer transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>About & How to Use this Bible Study Suite →</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
