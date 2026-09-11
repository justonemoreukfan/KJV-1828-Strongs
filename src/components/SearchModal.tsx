import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, X, BookOpen, Loader2, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { BibleSearchResult, Testament } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult: (bookId: string, chapter: number, verse: number) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectResult,
}) => {
  const [query, setQuery] = useState('');
  const [testament, setTestament] = useState<Testament | 'ALL'>('ALL');
  const [results, setResults] = useState<BibleSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsLoading(true);
      api
        .searchBible(query.trim(), testament, 60)
        .then((res) => {
          setResults(res);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error('Bible search error:', err);
          setIsLoading(false);
        });
    }, 250);

    return () => clearTimeout(timer);
  }, [query, testament]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs font-sans-ui">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white text-stone-900 w-full max-w-2xl max-h-[85vh] rounded-2xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 bg-stone-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-900">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-cinzel text-base sm:text-lg font-bold text-stone-900">
                Bible Concordance & Search
              </h2>
              <p className="text-xs text-stone-500">
                Search across all 31,102 verses of the King James Bible
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

        {/* Input Bar & Testament Filter */}
        <div className="p-4 border-b border-stone-200 space-y-3 bg-white">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              placeholder="Search words or phrases (e.g. 'in the beginning', 'faith', 'love never faileth')..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-600 font-sans-ui"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-stone-500 font-medium">Filter:</span>
              <button
                onClick={() => setTestament('ALL')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  testament === 'ALL'
                    ? 'bg-amber-800 text-white font-semibold'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                All (66 Books)
              </button>
              <button
                onClick={() => setTestament('OT')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  testament === 'OT'
                    ? 'bg-amber-800 text-white font-semibold'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                Old Testament
              </button>
              <button
                onClick={() => setTestament('NT')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  testament === 'NT'
                    ? 'bg-amber-800 text-white font-semibold'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                New Testament
              </button>
            </div>

            {results.length > 0 && (
              <span className="text-stone-400">
                {results.length} results found
              </span>
            )}
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-stone-100">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-2 text-stone-400 text-xs">
              <Loader2 className="w-6 h-6 animate-spin text-amber-700" />
              <span>Searching scripture...</span>
            </div>
          ) : query && results.length === 0 ? (
            <div className="py-16 text-center text-stone-400 text-sm">
              No matching verses found for "{query}".
            </div>
          ) : !query ? (
            <div className="py-16 text-center text-stone-400 text-sm">
              Type keywords above to search all verses in the KJV Bible.
            </div>
          ) : (
            results.map((res) => (
              <button
                key={`${res.bookId}-${res.chapter}-${res.verse}`}
                onClick={() => {
                  onSelectResult(res.bookId, res.chapter, res.verse);
                  onClose();
                }}
                className="w-full py-3.5 px-3 text-left hover:bg-amber-50/60 rounded-xl transition-colors group flex items-start justify-between gap-3 cursor-pointer"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-cinzel text-sm font-bold text-amber-950 group-hover:text-amber-800">
                      {res.bookName} {res.chapter}:{res.verse}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-sans-ui">
                      {res.testament === 'OT' ? 'Old Testament' : 'New Testament'}
                    </span>
                  </div>
                  <p className="font-garamond text-base text-stone-800 leading-relaxed">
                    "{res.cleanText}"
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-stone-300 group-hover:text-amber-700 shrink-0 mt-1" />
              </button>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};
