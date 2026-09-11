import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Bookmark, Trash2, ArrowRight, BookOpen, BookA, Scroll } from 'lucide-react';
import { Bookmark as BookmarkType } from '../types';

interface BookmarksDrawerProps {
  isOpen: boolean;
  bookmarks: BookmarkType[];
  onClose: () => void;
  onNavigateToVerse: (bookId: string, chapter: number, verse: number) => void;
  onNavigateToWord: (word: string) => void;
  onNavigateToStrongs?: (word: string, strongsId?: string) => void;
  onRemoveBookmark: (id: string) => void;
  onClearAll: () => void;
}

export const BookmarksDrawer: React.FC<BookmarksDrawerProps> = ({
  isOpen,
  bookmarks,
  onClose,
  onNavigateToVerse,
  onNavigateToWord,
  onNavigateToStrongs,
  onRemoveBookmark,
  onClearAll,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[400px] flex flex-col bg-white border-l border-stone-200 shadow-2xl overflow-hidden font-sans-ui">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-900">
              <Bookmark className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="font-cinzel text-base font-bold text-stone-900">
                Bookmarks & Saved Items
              </h2>
              <p className="text-xs text-stone-500">
                {bookmarks.length} saved scripture verses, definitions & Strong's roots
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-800 hover:bg-stone-200/60 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {bookmarks.length === 0 ? (
            <div className="py-16 text-center text-stone-400 text-xs">
              <Bookmark className="w-8 h-8 mx-auto mb-2 text-stone-300" />
              <p className="text-sm font-semibold text-stone-600">No bookmarks yet</p>
              <p className="mt-1">
                Tap the bookmark icon on any verse, 1828 dictionary entry, or Strong's Concordance root to save it here for quick access.
              </p>
            </div>
          ) : (
            bookmarks.map((bm) => (
              <div
                key={bm.id}
                className="p-3.5 rounded-xl border border-stone-200 hover:border-amber-300 bg-stone-50/50 hover:bg-amber-50/40 transition-all flex items-start justify-between gap-3 group"
              >
                <div
                  onClick={() => {
                    if (bm.type === 'verse' && bm.bookId && bm.chapter && bm.verse) {
                      onNavigateToVerse(bm.bookId, bm.chapter, bm.verse);
                    } else if (bm.type === 'word' && bm.word) {
                      onNavigateToWord(bm.word);
                    } else if (bm.type === 'strongs' && bm.word && onNavigateToStrongs) {
                      onNavigateToStrongs(bm.word, bm.strongsId);
                    }
                    onClose();
                  }}
                  className="flex-1 cursor-pointer"
                >
                  <div className="flex items-center gap-2 mb-1">
                    {bm.type === 'verse' ? (
                      <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                    ) : bm.type === 'strongs' ? (
                      <Scroll className="w-3.5 h-3.5 text-amber-700" />
                    ) : (
                      <BookA className="w-3.5 h-3.5 text-amber-700" />
                    )}
                    <span className="font-cinzel text-sm font-bold text-stone-900 group-hover:text-amber-900">
                      {bm.title}
                    </span>
                  </div>
                  <p className="font-garamond text-xs text-stone-600 line-clamp-2">
                    {bm.subtitle}
                  </p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveBookmark(bm.id);
                  }}
                  title="Remove bookmark"
                  className="p-1 text-stone-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {bookmarks.length > 0 && (
          <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between text-xs">
            <button
              onClick={onClearAll}
              className="text-red-600 hover:text-red-700 font-medium cursor-pointer"
            >
              Clear all bookmarks
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg cursor-pointer"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </AnimatePresence>
  );
};
