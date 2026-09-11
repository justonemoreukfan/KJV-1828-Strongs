export type Testament = 'OT' | 'NT';

export type NavigationTab = 'bible' | 'dictionary' | 'strongs' | 'about';

export type BookCategory =
  | 'Law'
  | 'History'
  | 'Poetry'
  | 'Major Prophets'
  | 'Minor Prophets'
  | 'Gospels'
  | 'Church History'
  | 'Pauline Epistles'
  | 'General Epistles'
  | 'Prophecy';

export interface BibleBookInfo {
  id: string; // e.g. 'gn'
  name: string; // e.g. 'Genesis'
  order: number; // 1 to 66
  testament: Testament;
  category: BookCategory;
  chaptersCount: number;
}

export interface VerseWord {
  raw: string;
  clean: string;
  hasDefinition?: boolean;
}

export interface BibleVerse {
  verse: number;
  text: string;
  cleanText: string;
  notes: string[];
}

export interface ChapterData {
  book: BibleBookInfo;
  chapter: number;
  verses: BibleVerse[];
  prev: { bookId: string; chapter: number } | null;
  next: { bookId: string; chapter: number } | null;
}

export interface BibleSearchResult {
  bookId: string;
  bookName: string;
  testament: Testament;
  chapter: number;
  verse: number;
  text: string;
  cleanText: string;
}

export interface WebsterEntrySummary {
  word: string;
  pos?: string;
  preview: string;
}

export interface WebsterEntryDetail {
  word: string;
  pos?: string;
  etymology?: string;
  pronunciation?: string;
  content: string; // full HTML content
  preview: string;
}

export interface DictionaryLookupResult {
  query: string;
  found: boolean;
  matchedWord?: string;
  isStem?: boolean;
  entry?: WebsterEntryDetail;
  suggestions: WebsterEntrySummary[];
  strongsMatch?: {
    exists: boolean;
    matchedWord?: string;
    hebrewCount: number;
    greekCount: number;
    suggestions?: string[];
  };
  bibleOccurrencesCount?: number;
}

export interface DictionaryIndexResult {
  letter: string;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  words: WebsterEntrySummary[];
}

export type BibleMode = '1828' | 'strongs' | 'parallel';

export interface StrongsEntry {
  id: string; // e.g. 'H1254' or 'G26'
  number: number;
  testament: Testament; // 'OT' (Hebrew) or 'NT' (Greek)
  lemma: string; // Hebrew / Greek script
  translit: string; // transliteration
  pron?: string; // pronunciation
  derivation: string; // root origin
  strongs_def: string; // Strong's definition
  kjv_def: string; // KJV English renderings
}

export interface StrongsLookupResult {
  query: string;
  matchedWord?: string;
  found: boolean;
  hebrewEntries: StrongsEntry[];
  greekEntries: StrongsEntry[];
  suggestions?: (string | StrongsIndexWord)[];
  websterMatch?: {
    exists: boolean;
    matchedWord?: string;
    preview?: string;
    suggestions?: string[];
  };
}

export interface StrongsIndexWord {
  word: string;
  hebrewCount: number;
  greekCount: number;
  previewDef: string;
  sampleIds: string[];
}

export interface StrongsIndexResult {
  letter: string;
  page: number;
  totalPages: number;
  total: number;
  words: StrongsIndexWord[];
}

export interface StrongsOccurrencesResult {
  query: string;
  testament: Testament | 'ALL';
  totalCount: number;
  bookDistribution: {
    bookId: string;
    bookName: string;
    testament: Testament;
    count: number;
  }[];
  verses: BibleSearchResult[];
}

export interface ReadingSettings {
  fontSize: 'sm' | 'md' | 'lg' | 'xl';
  fontFamily: 'serif' | 'classic' | 'sans';
  theme: 'paper' | 'light' | 'sepia' | 'dark';
  layout: 'verse' | 'paragraph';
  showItalics: boolean;
  showNotes: boolean;
  readVerseNumbers: boolean;
  bibleMode: BibleMode;
  speechRate: number;
  speechPitch: number;
  speechVoiceName: string;
}

export interface Bookmark {
  id: string;
  type: 'verse' | 'word' | 'strongs';
  title: string;
  subtitle: string;
  bookId?: string;
  chapter?: number;
  verse?: number;
  word?: string;
  strongsId?: string;
  timestamp: number;
}
