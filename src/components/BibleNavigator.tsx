import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, ChevronRight, BookOpen } from 'lucide-react';
import { BibleBookInfo, BookCategory, Testament } from '../types';

interface BibleNavigatorProps {
  isOpen: boolean;
  onClose: () => void;
  books: BibleBookInfo[];
  currentBook: BibleBookInfo | null;
  currentChapter: number;
  onSelect: (bookId: string, chapter: number) => void;
}

export const BibleNavigator: React.FC<BibleNavigatorProps> = ({
  isOpen,
  onClose,
  books,
  currentBook,
  currentChapter,
  onSelect,
}) => {
  const [testament, setTestament] = useState<Testament>('OT');
  const [selectedCategory, setSelectedCategory] = useState<BookCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeBookForChapters, setActiveBookForChapters] = useState<BibleBookInfo | null>(null);

  if (!isOpen) return null;

  // Filter books
  const filteredBooks = books.filter((b) => {
    if (searchQuery.trim()) {
      return b.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    if (b.testament !== testament) return false;
    if (selectedCategory !== 'ALL' && b.category !== selectedCategory) return false;
    return true;
  });

  const categoriesForTestament = Array.from(
    new Set(books.filter((b) => b.testament === testament).map((b) => b.category))
  );

  const handleBookClick = (book: BibleBookInfo) => {
    setActiveBookForChapters(book);
  };

  const handleChapterClick = (chap: number) => {
    if (activeBookForChapters) {
      onSelect(activeBookForChapters.id, chap);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-[#fcfbf9] text-stone-900 w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl border border-stone-200/80 flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-100/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-900">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-cinzel text-lg font-bold tracking-wide text-stone-900">
                Bible Index & Navigation
              </h2>
              <p className="text-xs text-stone-600 font-sans-ui">
                66 Books of the Authorized King James Version
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-200/60 rounded-xl transition-colors cursor-pointer"
            aria-label="Close Navigator"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Testament Tabs */}
        <div className="p-4 border-b border-stone-200 bg-white space-y-3">
          {/* Quick Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Quick jump to book (e.g. Genesis, Psalms, Romans, Revelation)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-600 font-sans-ui"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700"
              >
                Clear
              </button>
            )}
          </div>

          {/* OT / NT Selector */}
          {!searchQuery && (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex p-1 bg-stone-100 rounded-xl border border-stone-200">
                <button
                  onClick={() => {
                    setTestament('OT');
                    setSelectedCategory('ALL');
                    setActiveBookForChapters(null);
                  }}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    testament === 'OT'
                      ? 'bg-amber-800 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Old Testament (39)
                </button>
                <button
                  onClick={() => {
                    setTestament('NT');
                    setSelectedCategory('ALL');
                    setActiveBookForChapters(null);
                  }}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    testament === 'NT'
                      ? 'bg-amber-800 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  New Testament (27)
                </button>
              </div>

              {/* Category pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto py-1 text-xs">
                <button
                  onClick={() => setSelectedCategory('ALL')}
                  className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory === 'ALL'
                      ? 'bg-stone-800 text-stone-100 font-medium'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  All
                </button>
                {categoriesForTestament.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-amber-700 text-white font-medium'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Content Area: Books List & Chapter Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[360px]">
          {/* Books Column */}
          <div className={`${activeBookForChapters ? 'md:col-span-5' : 'md:col-span-12'} transition-all`}>
            <div className="text-xs uppercase tracking-wider font-bold text-stone-500 mb-3 px-1">
              Select Book
            </div>
            <div
              className={`grid gap-2 ${
                activeBookForChapters
                  ? 'grid-cols-1'
                  : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
              }`}
            >
              {filteredBooks.map((book) => {
                const isSelected = activeBookForChapters?.id === book.id;
                const isCurrent = currentBook?.id === book.id;
                return (
                  <button
                    key={book.id}
                    onClick={() => handleBookClick(book)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-amber-600 bg-amber-50/80 text-amber-950 font-semibold shadow-xs ring-1 ring-amber-500'
                        : isCurrent
                        ? 'border-stone-400 bg-stone-100 text-stone-900 font-medium'
                        : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50 text-stone-800'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className="text-sm font-cinzel truncate">{book.name}</div>
                      <div className="text-[11px] text-stone-500">
                        {book.chaptersCount} chapters • {book.category}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-400 shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chapter Selector Column (shown when a book is selected) */}
          {activeBookForChapters && (
            <div className="md:col-span-7 bg-white p-4 rounded-xl border border-stone-200/90 shadow-xs flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
                <div>
                  <h3 className="font-cinzel text-lg font-bold text-amber-900">
                    {activeBookForChapters.name}
                  </h3>
                  <p className="text-xs text-stone-500">
                    Select chapter (1 to {activeBookForChapters.chaptersCount})
                  </p>
                </div>
                <button
                  onClick={() => setActiveBookForChapters(null)}
                  className="text-xs text-stone-500 hover:text-stone-800 underline md:hidden"
                >
                  Back to books
                </button>
              </div>

              <div className="flex-1 overflow-y-auto max-h-[320px] pr-1">
                <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-7 gap-2">
                  {Array.from(
                    { length: activeBookForChapters.chaptersCount },
                    (_, i) => i + 1
                  ).map((chapNum) => {
                    const isCurrentChap =
                      currentBook?.id === activeBookForChapters.id &&
                      currentChapter === chapNum;
                    return (
                      <button
                        key={chapNum}
                        onClick={() => handleChapterClick(chapNum)}
                        className={`py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                          isCurrentChap
                            ? 'bg-amber-800 text-white shadow-xs'
                            : 'bg-stone-100 hover:bg-amber-100 hover:text-amber-900 text-stone-800'
                        }`}
                      >
                        {chapNum}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-stone-100 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
          <span>Tip: Tap any word in the text while reading to see its 1828 definition.</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-lg cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};
