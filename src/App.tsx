import React, { useState, useEffect, useCallback } from 'react';
import { api } from './services/api';
import { useSpeech } from './hooks/useSpeech';
import {
  BibleBookInfo,
  ChapterData,
  BibleVerse,
  ReadingSettings,
  Bookmark,
  DictionaryLookupResult,
  StrongsLookupResult,
  BibleMode,
  NavigationTab,
} from './types';
import { Navbar } from './components/Navbar';
import { BibleReader } from './components/BibleReader';
import { BibleNavigator } from './components/BibleNavigator';
import { AudioPlayerBar } from './components/AudioPlayerBar';
import { WordDefinitionDrawer } from './components/WordDefinitionDrawer';
import { DictionaryView } from './components/DictionaryView';
import { StrongsDrawer } from './components/StrongsDrawer';
import { StrongsView } from './components/StrongsView';
import { AboutView } from './components/AboutView';
import { SearchModal } from './components/SearchModal';
import { BookmarksDrawer } from './components/BookmarksDrawer';
import { SettingsModal } from './components/SettingsModal';
import { Loader2 } from 'lucide-react';

const DEFAULT_SETTINGS: ReadingSettings = {
  fontSize: 'md',
  fontFamily: 'serif',
  theme: 'paper',
  layout: 'verse',
  bibleMode: '1828',
  showItalics: true,
  showNotes: true,
  readVerseNumbers: false,
  speechRate: 1.0,
  speechPitch: 1.0,
  speechVoiceName: '',
};

export default function App() {
  // Books & Chapter State
  const [books, setBooks] = useState<BibleBookInfo[]>([]);
  const [currentBookId, setCurrentBookId] = useState<string>('gn');
  const [currentChapterNum, setCurrentChapterNum] = useState<number>(1);
  const [chapterData, setChapterData] = useState<ChapterData | null>(null);
  const [isLoadingChapter, setIsLoadingChapter] = useState<boolean>(true);

  // Active View Tabs
  const [activeTab, setActiveTab] = useState<NavigationTab>('bible');
  const [isSplitView, setIsSplitView] = useState<boolean>(false);

  // Modals & Panels
  const [isNavigatorOpen, setIsNavigatorOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAudioBarOpen, setIsAudioBarOpen] = useState(false);

  // 1828 Word Definition Drawer State
  const [isWordDrawerOpen, setIsWordDrawerOpen] = useState(false);
  const [activeWord, setActiveWord] = useState<string | null>(null);
  const [lookupResult, setLookupResult] = useState<DictionaryLookupResult | null>(null);
  const [isLoadingWord, setIsLoadingWord] = useState(false);

  // Strong's Concordance Drawer State
  const [isStrongsDrawerOpen, setIsStrongsDrawerOpen] = useState(false);
  const [strongsLookupResult, setStrongsLookupResult] = useState<StrongsLookupResult | null>(null);
  const [isLoadingStrongs, setIsLoadingStrongs] = useState(false);

  // Dictionary Tab Active Word
  const [dictionarySelectedWord, setDictionarySelectedWord] = useState<string>('god');

  // Strong's Concordance Tab Active Word
  const [strongsSelectedWord, setStrongsSelectedWord] = useState<string>('abide');

  const handleOpenStrongsFromDictionary = (word: string) => {
    setStrongsSelectedWord(word);
    if (isSplitView) {
      handleWordClick(word, 'strongs');
    } else {
      setActiveTab('strongs');
    }
  };

  // Reading Settings
  const [settings, setSettings] = useState<ReadingSettings>(() => {
    try {
      const saved = localStorage.getItem('kjv_settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Bookmarks
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    try {
      const saved = localStorage.getItem('kjv_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save Settings
  const updateSettings = (newSettings: Partial<ReadingSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem('kjv_settings', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save settings:', e);
      }
      return updated;
    });
  };

  // Save Bookmarks
  useEffect(() => {
    try {
      localStorage.setItem('kjv_bookmarks', JSON.stringify(bookmarks));
    } catch (e) {
      console.error('Failed to save bookmarks:', e);
    }
  }, [bookmarks]);

  // Audio Speech Hook
  const {
    isSupported: isSpeechSupported,
    isPlaying: isPlayingAudio,
    isPaused: isPausedAudio,
    currentVerse: currentSpokenVerse,
    voices,
    selectedVoice,
    rate: speechRate,
    setSelectedVoice,
    setRate: setSpeechRate,
    setIncludeVerseNumber,
    playVerses,
    speakText,
    pause: pauseAudio,
    resume: resumeAudio,
    stop: stopAudio,
    nextVerse: nextAudioVerse,
    previousVerse: prevAudioVerse,
  } = useSpeech(
    settings.speechRate,
    settings.speechPitch,
    settings.readVerseNumbers,
    settings.speechVoiceName,
    (voiceId) => updateSettings({ speechVoiceName: voiceId })
  );

  // Synchronize readVerseNumbers if setting changed
  useEffect(() => {
    setIncludeVerseNumber(settings.readVerseNumbers);
  }, [settings.readVerseNumbers, setIncludeVerseNumber]);

  // Load All Books on Mount
  useEffect(() => {
    api
      .getBooks()
      .then((data) => {
        setBooks(data);
      })
      .catch((err) => console.error('Failed to load Bible books:', err));
  }, []);

  // Load Chapter Data when Book or Chapter changes
  useEffect(() => {
    let isMounted = true;
    setIsLoadingChapter(true);
    stopAudio();

    api
      .getChapter(currentBookId, currentChapterNum)
      .then((data) => {
        if (isMounted) {
          setChapterData(data);
          setIsLoadingChapter(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load chapter:', err);
        if (isMounted) setIsLoadingChapter(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentBookId, currentChapterNum, stopAudio]);

  // Handle Tap on Any Word in Bible Text -> Link to 1828 Webster Dictionary or Strong's Concordance
  const handleWordClick = useCallback(
    (rawWord: string, targetMode?: '1828' | 'strongs') => {
      const modeToUse = targetMode || (settings.bibleMode === 'strongs' ? 'strongs' : '1828');

      if (modeToUse === 'strongs') {
        setActiveWord(rawWord);
        setIsStrongsDrawerOpen(true);
        setIsLoadingStrongs(true);
        const currentTestament = chapterData?.book.testament;

        api
          .lookupStrongs(rawWord, currentTestament)
          .then((res) => {
            setStrongsLookupResult(res);
            setIsLoadingStrongs(false);
          })
          .catch((err) => {
            console.error('Strongs lookup error:', err);
            setIsLoadingStrongs(false);
          });
      } else {
        setActiveWord(rawWord);
        setIsWordDrawerOpen(true);
        setIsLoadingWord(true);

        api
          .lookupWord(rawWord)
          .then((res) => {
            setLookupResult(res);
            setIsLoadingWord(false);
          })
          .catch((err) => {
            console.error('Word lookup error:', err);
            setIsLoadingWord(false);
          });
      }
    },
    [settings.bibleMode, chapterData]
  );

  // Jump from Webster 1828 Definition to Full Dictionary Tab
  const handleOpenFullDictionary = (word: string) => {
    setDictionarySelectedWord(word);
    setActiveTab('dictionary');
    setIsWordDrawerOpen(false);
  };

  // Jump from Scripture reference inside 1828 definition back to Bible
  const handleNavigateToScripture = (scriptureRef: string) => {
    // e.g. "Genesis 1:6", "Romans 5:11", "John 3:16"
    const match = scriptureRef.match(/([0-9]?\s*[a-zA-Z\s]+)\s+([0-9]+):?([0-9]+)?/);
    if (!match) return;

    const bookName = match[1].trim().toLowerCase();
    const chapNum = parseInt(match[2], 10);
    const verseNum = match[3] ? parseInt(match[3], 10) : 1;

    const foundBook = books.find(
      (b) =>
        b.name.toLowerCase() === bookName ||
        b.name.toLowerCase().replace(/\s+/g, '') === bookName.replace(/\s+/g, '')
    );

    if (foundBook && chapNum <= foundBook.chaptersCount) {
      setCurrentBookId(foundBook.id);
      setCurrentChapterNum(chapNum);
      setActiveTab('bible');
      setIsWordDrawerOpen(false);
      setIsStrongsDrawerOpen(false);
      if (verseNum) {
        setTimeout(() => {
          const verseEl = document.querySelector(`[data-verse="${verseNum}"]`);
          if (verseEl) verseEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 350);
      }
    }
  };

  // Jump directly to a verse from Strong's occurrences or search results
  const handleNavigateToVerse = (bookId: string, chapter: number, verse: number) => {
    setCurrentBookId(bookId);
    setCurrentChapterNum(chapter);
    setActiveTab('bible');
    setIsWordDrawerOpen(false);
    setIsStrongsDrawerOpen(false);
    setTimeout(() => {
      const verseEl = document.querySelector(`[data-verse="${verse}"]`);
      if (verseEl) verseEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 350);
  };

  // Bookmarking helpers
  const handleBookmarkVerse = (verse: BibleVerse) => {
    if (!chapterData) return;
    const existingIndex = bookmarks.findIndex(
      (b) =>
        b.type === 'verse' &&
        b.bookId === chapterData.book.id &&
        b.chapter === chapterData.chapter &&
        b.verse === verse.verse
    );

    if (existingIndex >= 0) {
      setBookmarks((prev) => prev.filter((_, idx) => idx !== existingIndex));
    } else {
      const newBm: Bookmark = {
        id: `verse-${chapterData.book.id}-${chapterData.chapter}-${verse.verse}`,
        type: 'verse',
        title: `${chapterData.book.name} ${chapterData.chapter}:${verse.verse}`,
        subtitle: verse.cleanText,
        bookId: chapterData.book.id,
        chapter: chapterData.chapter,
        verse: verse.verse,
        timestamp: Date.now(),
      };
      setBookmarks((prev) => [newBm, ...prev]);
    }
  };

  const handleBookmarkWord = (word: string) => {
    const clean = word.toLowerCase().trim();
    const existingIndex = bookmarks.findIndex(
      (b) => b.type === 'word' && b.word?.toLowerCase() === clean
    );

    if (existingIndex >= 0) {
      setBookmarks((prev) => prev.filter((_, idx) => idx !== existingIndex));
    } else {
      const newBm: Bookmark = {
        id: `word-${clean}`,
        type: 'word',
        title: word.toUpperCase(),
        subtitle: `1828 Webster Dictionary Definition`,
        word: clean,
        timestamp: Date.now(),
      };
      setBookmarks((prev) => [newBm, ...prev]);
    }
  };

  const handleBookmarkStrongs = (word: string, entryId: string, title: string) => {
    const existingIndex = bookmarks.findIndex(
      (b) => b.type === 'strongs' && b.strongsId === entryId
    );

    if (existingIndex >= 0) {
      setBookmarks((prev) => prev.filter((_, idx) => idx !== existingIndex));
    } else {
      const newBm: Bookmark = {
        id: `strongs-${entryId}`,
        type: 'strongs',
        title: title,
        subtitle: `Strong's Concordance (${word})`,
        word: word,
        strongsId: entryId,
        timestamp: Date.now(),
      };
      setBookmarks((prev) => [newBm, ...prev]);
    }
  };

  const isVerseBookmarked = (bookId: string, chapter: number, verse: number) => {
    return bookmarks.some(
      (b) =>
        b.type === 'verse' &&
        b.bookId === bookId &&
        b.chapter === chapter &&
        b.verse === verse
    );
  };

  const isWordBookmarked = (word: string) => {
    return bookmarks.some(
      (b) => b.type === 'word' && b.word?.toLowerCase() === word.toLowerCase()
    );
  };

  const isStrongsBookmarked = (_word: string, entryId: string) => {
    return bookmarks.some(
      (b) => b.type === 'strongs' && b.strongsId === entryId
    );
  };

  // Audio Playback trigger
  const handlePlayFromVerse = (verseNum = 1) => {
    if (!chapterData) return;
    setIsAudioBarOpen(true);
    playVerses(chapterData.verses, verseNum);
  };

  const currentBook = chapterData ? chapterData.book : books.find((b) => b.id === currentBookId) || null;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#fbf8f2] text-stone-900 select-text">
      {/* Top Navigation */}
      <Navbar
        currentBook={currentBook}
        currentChapter={currentChapterNum}
        activeTab={activeTab}
        isSplitView={isSplitView}
        isAudioBarOpen={isAudioBarOpen}
        isPlayingAudio={isPlayingAudio}
        bookmarksCount={bookmarks.length}
        onOpenNavigator={() => setIsNavigatorOpen(true)}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          if (isSplitView) setIsSplitView(false);
        }}
        onToggleSplitView={() => setIsSplitView((prev) => !prev)}
        onToggleAudioBar={() => {
          if (isAudioBarOpen) {
            setIsAudioBarOpen(false);
            stopAudio();
          } else {
            setIsAudioBarOpen(true);
            if (chapterData && !isPlayingAudio) {
              playVerses(chapterData.verses, 1);
            }
          }
        }}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenBookmarks={() => setIsBookmarksOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Workspace Area */}
      <main className="flex-1 flex overflow-hidden relative">
        {isSplitView ? (
          /* Split View: Scripture on Left + 1828 Dictionary on Right */
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden divide-x divide-stone-300">
            {/* Bible Reader Pane */}
            <div className="flex flex-col h-full overflow-hidden">
              {isLoadingChapter || !chapterData ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 text-stone-400">
                  <Loader2 className="w-8 h-8 animate-spin text-amber-700" />
                  <p className="text-sm font-cinzel">Loading King James Scripture...</p>
                </div>
              ) : (
                <BibleReader
                  chapterData={chapterData}
                  settings={settings}
                  currentSpokenVerse={currentSpokenVerse}
                  activeWord={activeWord}
                  onWordClick={handleWordClick}
                  onChangeBibleMode={(mode) => updateSettings({ bibleMode: mode })}
                  onPrevChapter={() => {
                    if (chapterData.prev) {
                      setCurrentBookId(chapterData.prev.bookId);
                      setCurrentChapterNum(chapterData.prev.chapter);
                    }
                  }}
                  onNextChapter={() => {
                    if (chapterData.next) {
                      setCurrentBookId(chapterData.next.bookId);
                      setCurrentChapterNum(chapterData.next.chapter);
                    }
                  }}
                  onPlayFromVerse={handlePlayFromVerse}
                  onBookmarkVerse={handleBookmarkVerse}
                  isVerseBookmarked={isVerseBookmarked}
                  onOpenAbout={() => setActiveTab('about')}
                />
              )}
            </div>

            {/* 1828 Dictionary Pane */}
            <div className="flex flex-col h-full overflow-hidden">
              <DictionaryView
                initialWord={dictionarySelectedWord}
                onNavigateToScripture={handleNavigateToScripture}
                onOpenStrongs={handleOpenStrongsFromDictionary}
                onSpeak={speakText}
                onBookmarkWord={handleBookmarkWord}
                isWordBookmarked={isWordBookmarked}
              />
            </div>
          </div>
        ) : activeTab === 'bible' ? (
          /* Single Tab: Scripture Reader */
          isLoadingChapter || !chapterData ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-stone-400">
              <Loader2 className="w-8 h-8 animate-spin text-amber-700" />
              <p className="text-sm font-cinzel">Loading King James Scripture...</p>
            </div>
          ) : (
            <BibleReader
              chapterData={chapterData}
              settings={settings}
              currentSpokenVerse={currentSpokenVerse}
              activeWord={activeWord}
              onWordClick={handleWordClick}
              onChangeBibleMode={(mode) => updateSettings({ bibleMode: mode })}
              onPrevChapter={() => {
                if (chapterData.prev) {
                  setCurrentBookId(chapterData.prev.bookId);
                  setCurrentChapterNum(chapterData.prev.chapter);
                }
              }}
              onNextChapter={() => {
                if (chapterData.next) {
                  setCurrentBookId(chapterData.next.bookId);
                  setCurrentChapterNum(chapterData.next.chapter);
                }
              }}
              onPlayFromVerse={handlePlayFromVerse}
              onBookmarkVerse={handleBookmarkVerse}
              isVerseBookmarked={isVerseBookmarked}
              onOpenAbout={() => setActiveTab('about')}
            />
          )
        ) : activeTab === 'about' ? (
          /* Single Tab: About & User Study Guide */
          <AboutView
            onNavigateToBible={(bookId, chapter) => {
              if (bookId) setCurrentBookId(bookId);
              if (chapter) setCurrentChapterNum(chapter);
              setActiveTab('bible');
            }}
            onNavigateToDictionary={(word) => {
              if (word) setDictionarySelectedWord(word);
              setActiveTab('dictionary');
            }}
            onNavigateToStrongs={(word) => {
              if (word) setStrongsSelectedWord(word);
              setActiveTab('strongs');
            }}
            onToggleSplitView={() => setIsSplitView((prev) => !prev)}
            isSplitView={isSplitView}
          />
        ) : activeTab === 'strongs' ? (
          /* Single Tab: Strong's Concordance Lexicon & Index */
          <StrongsView
            initialWord={strongsSelectedWord}
            onWordClick={(word) => handleWordClick(word, 'strongs')}
            onOpenWebster1828={(word) => {
              setDictionarySelectedWord(word);
              setActiveTab('dictionary');
            }}
            onSpeakText={speakText}
            onBookmarkStrongs={handleBookmarkStrongs}
            isStrongsBookmarked={isStrongsBookmarked}
            onNavigateToScripture={handleNavigateToScripture}
            onNavigateToVerse={handleNavigateToVerse}
          />
        ) : (
          /* Single Tab: 1828 Webster Dictionary */
          <DictionaryView
            initialWord={dictionarySelectedWord}
            onNavigateToScripture={handleNavigateToScripture}
            onOpenStrongs={handleOpenStrongsFromDictionary}
            onSpeak={speakText}
            onBookmarkWord={handleBookmarkWord}
            isWordBookmarked={isWordBookmarked}
          />
        )}

        {/* Word Definition Drawer (pops up when any word is tapped in Bible text) */}
        <WordDefinitionDrawer
          isOpen={isWordDrawerOpen}
          lookupResult={lookupResult}
          isLoading={isLoadingWord}
          onClose={() => {
            setIsWordDrawerOpen(false);
            setActiveWord(null);
          }}
          onOpenFullDictionary={handleOpenFullDictionary}
          onOpenStrongs={(word) => {
            setIsWordDrawerOpen(false);
            handleWordClick(word, 'strongs');
          }}
          onSpeakDefinition={speakText}
          onBookmarkWord={handleBookmarkWord}
          isWordBookmarked={isWordBookmarked}
          onNavigateToScripture={handleNavigateToScripture}
        />

        {/* Strong's Concordance Drawer (pops up when clicking words in Strong's mode or cross-referencing) */}
        <StrongsDrawer
          isOpen={isStrongsDrawerOpen}
          lookupResult={strongsLookupResult}
          isLoading={isLoadingStrongs}
          activeTestament={chapterData?.book.testament}
          onClose={() => {
            setIsStrongsDrawerOpen(false);
            setActiveWord(null);
          }}
          onSelectWord={(word) => handleWordClick(word, 'strongs')}
          onOpenWebster1828={(word) => {
            setIsStrongsDrawerOpen(false);
            handleWordClick(word, '1828');
          }}
          onSpeakText={speakText}
          onBookmarkStrongs={handleBookmarkStrongs}
          isStrongsBookmarked={isStrongsBookmarked}
          onNavigateToVerse={handleNavigateToVerse}
          onNavigateToScripture={handleNavigateToScripture}
        />
      </main>

      {/* Floating Read-Aloud Audio Player Bar */}
      {isAudioBarOpen && chapterData && (
        <AudioPlayerBar
          book={chapterData.book}
          chapter={chapterData.chapter}
          verses={chapterData.verses}
          isPlaying={isPlayingAudio}
          isPaused={isPausedAudio}
          currentVerse={currentSpokenVerse}
          rate={speechRate}
          readVerseNumbers={settings.readVerseNumbers}
          voices={voices}
          selectedVoice={selectedVoice}
          onPlay={() => playVerses(chapterData.verses, currentSpokenVerse || 1)}
          onPause={pauseAudio}
          onResume={resumeAudio}
          onStop={stopAudio}
          onNext={nextAudioVerse}
          onPrev={prevAudioVerse}
          onRateChange={(r) => {
            setSpeechRate(r);
            updateSettings({ speechRate: r });
          }}
          onVoiceChange={(v) => {
            setSelectedVoice(v);
            updateSettings({ speechVoiceName: v.voiceURI || v.name });
          }}
          onToggleReadVerseNumbers={(val) => {
            updateSettings({ readVerseNumbers: val });
          }}
          onClose={() => {
            setIsAudioBarOpen(false);
            stopAudio();
          }}
        />
      )}

      {/* Book & Chapter Navigation Modal */}
      <BibleNavigator
        isOpen={isNavigatorOpen}
        onClose={() => setIsNavigatorOpen(false)}
        books={books}
        currentBook={currentBook}
        currentChapter={currentChapterNum}
        onSelect={(bookId, chapter) => {
          setCurrentBookId(bookId);
          setCurrentChapterNum(chapter);
          setActiveTab('bible');
        }}
      />

      {/* Concordance & Full Bible Verse Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectResult={(bookId, chapter, verse) => {
          setCurrentBookId(bookId);
          setCurrentChapterNum(chapter);
          setActiveTab('bible');
          // Start reading or highlight
          setTimeout(() => {
            const verseEl = document.querySelector(`[data-verse="${verse}"]`);
            if (verseEl) verseEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 300);
        }}
      />

      {/* Bookmarks Drawer */}
      <BookmarksDrawer
        isOpen={isBookmarksOpen}
        bookmarks={bookmarks}
        onClose={() => setIsBookmarksOpen(false)}
        onNavigateToVerse={(bookId, chapter, verse) => {
          setCurrentBookId(bookId);
          setCurrentChapterNum(chapter);
          setActiveTab('bible');
        }}
        onNavigateToWord={(word) => {
          setDictionarySelectedWord(word);
          setActiveTab('dictionary');
        }}
        onNavigateToStrongs={(word) => {
          handleWordClick(word, 'strongs');
        }}
        onRemoveBookmark={(id) => {
          setBookmarks((prev) => prev.filter((b) => b.id !== id));
        }}
        onClearAll={() => setBookmarks([])}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={updateSettings}
        onOpenAbout={() => setActiveTab('about')}
      />
    </div>
  );
}
