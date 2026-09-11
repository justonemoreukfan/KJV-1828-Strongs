import React from 'react';
import {
  BookOpen,
  BookA,
  Search,
  Volume2,
  Sliders,
  Bookmark,
  Columns,
  ChevronDown,
  Scroll,
  HelpCircle,
} from 'lucide-react';
import { BibleBookInfo, NavigationTab } from '../types';

interface NavbarProps {
  currentBook: BibleBookInfo | null;
  currentChapter: number;
  activeTab: NavigationTab;
  isSplitView: boolean;
  isAudioBarOpen: boolean;
  isPlayingAudio: boolean;
  bookmarksCount: number;
  onOpenNavigator: () => void;
  onSelectTab: (tab: NavigationTab) => void;
  onToggleSplitView: () => void;
  onToggleAudioBar: () => void;
  onOpenSearch: () => void;
  onOpenBookmarks: () => void;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentBook,
  currentChapter,
  activeTab,
  isSplitView,
  isAudioBarOpen,
  isPlayingAudio,
  bookmarksCount,
  onOpenNavigator,
  onSelectTab,
  onToggleSplitView,
  onToggleAudioBar,
  onOpenSearch,
  onOpenBookmarks,
  onOpenSettings,
}) => {
  return (
    <header className="bg-[#1f1d1a] text-stone-100 border-b border-stone-800 shadow-md sticky top-0 z-30 font-sans-ui select-none">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-700/80 border border-amber-500/40 flex items-center justify-center text-amber-200 shadow-xs">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="hidden sm:block">
            <div className="font-cinzel text-sm sm:text-base font-bold tracking-wider text-amber-100 leading-tight">
              KJV Bible
            </div>
            <div className="text-[10px] text-amber-400/80 tracking-wide font-medium">
              1828 Webster & Strong's
            </div>
          </div>
        </div>

        {/* Center: Book & Chapter Navigation Trigger */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenNavigator}
            className="flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-xl bg-stone-800/90 hover:bg-stone-700/90 border border-stone-700/80 text-amber-200 hover:text-amber-100 transition-all shadow-xs cursor-pointer group"
          >
            <BookOpen className="w-4 h-4 text-amber-400 group-hover:scale-105 transition-transform" />
            <span className="font-cinzel text-xs sm:text-sm font-bold tracking-wide">
              {currentBook ? `${currentBook.name} ${currentChapter}` : 'Select Book'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-200" />
          </button>

          {/* Tab Switcher: Bible vs Dictionary vs Strong's */}
          <div className="hidden md:flex p-1 bg-stone-900/90 rounded-xl border border-stone-800 text-xs">
            <button
              onClick={() => onSelectTab('bible')}
              className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'bible' && !isSplitView
                  ? 'bg-amber-800 text-white shadow-xs font-semibold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Scripture</span>
            </button>
            <button
              onClick={() => onSelectTab('dictionary')}
              className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'dictionary' && !isSplitView
                  ? 'bg-amber-800 text-white shadow-xs font-semibold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <BookA className="w-3.5 h-3.5" />
              <span>1828 Dictionary</span>
            </button>
            <button
              onClick={() => onSelectTab('strongs')}
              className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'strongs' && !isSplitView
                  ? 'bg-amber-800 text-white shadow-xs font-semibold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Scroll className="w-3.5 h-3.5" />
              <span>Strong's Concordance</span>
            </button>
            <button
              onClick={() => onSelectTab('about')}
              className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'about' && !isSplitView
                  ? 'bg-amber-800 text-white shadow-xs font-semibold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>About & Guide</span>
            </button>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Split View Toggle (Desktop only) */}
          <button
            onClick={onToggleSplitView}
            title={isSplitView ? 'Exit Split View' : 'Side-by-Side Study View'}
            className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              isSplitView
                ? 'bg-amber-700/30 border-amber-500 text-amber-200'
                : 'bg-stone-800/80 border-stone-700/80 text-stone-300 hover:bg-stone-700/80'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Split View</span>
          </button>

          {/* Read Aloud Toggle */}
          <button
            onClick={onToggleAudioBar}
            title={isPlayingAudio ? 'Audio playing' : 'Read Aloud Audio Player'}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              isAudioBarOpen || isPlayingAudio
                ? 'bg-amber-600 text-white border-amber-500 shadow-xs'
                : 'bg-stone-800/80 border-stone-700/80 text-stone-300 hover:bg-stone-700/80'
            }`}
          >
            <Volume2 className={`w-3.5 h-3.5 ${isPlayingAudio ? 'animate-pulse text-amber-200' : ''}`} />
            <span className="hidden sm:inline">Read Aloud</span>
          </button>

          {/* Search Concordance */}
          <button
            onClick={onOpenSearch}
            title="Search Bible verses"
            className="p-2 text-stone-300 hover:text-white bg-stone-800/80 hover:bg-stone-700/80 border border-stone-700/80 rounded-xl transition-colors cursor-pointer"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Bookmarks */}
          <button
            onClick={onOpenBookmarks}
            title="Bookmarks"
            className="p-2 text-stone-300 hover:text-white bg-stone-800/80 hover:bg-stone-700/80 border border-stone-700/80 rounded-xl transition-colors cursor-pointer relative"
          >
            <Bookmark className="w-4 h-4" />
            {bookmarksCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-600 text-[10px] font-bold text-white flex items-center justify-center">
                {bookmarksCount}
              </span>
            )}
          </button>

          {/* About Quick Button */}
          <button
            onClick={() => onSelectTab('about')}
            title="About this Bible Study Suite & Guide"
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              activeTab === 'about' && !isSplitView
                ? 'bg-amber-800 text-white border-amber-600'
                : 'text-stone-300 hover:text-white bg-stone-800/80 hover:bg-stone-700/80 border-stone-700/80'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            title="Reading Settings"
            className="p-2 text-stone-300 hover:text-white bg-stone-800/80 hover:bg-stone-700/80 border border-stone-700/80 rounded-xl transition-colors cursor-pointer"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation for Tab switching */}
      <div className="flex md:hidden border-t border-stone-800 px-2 py-1.5 justify-around text-xs bg-stone-900/90">
        <button
          onClick={() => onSelectTab('bible')}
          className={`flex items-center gap-1 py-1 px-2 rounded-lg font-medium cursor-pointer ${
            activeTab === 'bible'
              ? 'text-amber-300 font-bold bg-stone-800'
              : 'text-stone-400'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Bible</span>
        </button>
        <button
          onClick={() => onSelectTab('dictionary')}
          className={`flex items-center gap-1 py-1 px-2 rounded-lg font-medium cursor-pointer ${
            activeTab === 'dictionary'
              ? 'text-amber-300 font-bold bg-stone-800'
              : 'text-stone-400'
          }`}
        >
          <BookA className="w-3.5 h-3.5" />
          <span>1828</span>
        </button>
        <button
          onClick={() => onSelectTab('strongs')}
          className={`flex items-center gap-1 py-1 px-2 rounded-lg font-medium cursor-pointer ${
            activeTab === 'strongs'
              ? 'text-amber-300 font-bold bg-stone-800'
              : 'text-stone-400'
          }`}
        >
          <Scroll className="w-3.5 h-3.5" />
          <span>Strong's</span>
        </button>
        <button
          onClick={() => onSelectTab('about')}
          className={`flex items-center gap-1 py-1 px-2 rounded-lg font-medium cursor-pointer ${
            activeTab === 'about'
              ? 'text-amber-300 font-bold bg-stone-800'
              : 'text-stone-400'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>About</span>
        </button>
      </div>
    </header>
  );
};
