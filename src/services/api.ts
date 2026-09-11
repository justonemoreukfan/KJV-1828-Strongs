import {
  BibleBookInfo,
  ChapterData,
  BibleSearchResult,
  DictionaryLookupResult,
  DictionaryIndexResult,
  WebsterEntryDetail,
  WebsterEntrySummary,
  Testament,
  StrongsLookupResult,
  StrongsIndexResult,
  StrongsIndexWord,
  StrongsEntry,
  StrongsOccurrencesResult,
} from '../types';

export const api = {
  async getBooks(): Promise<BibleBookInfo[]> {
    const res = await fetch('/api/bible/books');
    if (!res.ok) throw new Error('Failed to fetch books');
    return res.json();
  },

  async getChapter(bookId: string, chapter: number): Promise<ChapterData> {
    const res = await fetch(`/api/bible/chapter?book=${encodeURIComponent(bookId)}&chapter=${chapter}`);
    if (!res.ok) throw new Error('Failed to fetch chapter');
    return res.json();
  },

  async searchBible(
    query: string,
    testament: Testament | 'ALL' = 'ALL',
    limit = 60
  ): Promise<BibleSearchResult[]> {
    const res = await fetch(
      `/api/bible/search?q=${encodeURIComponent(query)}&testament=${testament}&limit=${limit}`
    );
    if (!res.ok) throw new Error('Failed to search Bible');
    return res.json();
  },

  async lookupWord(word: string): Promise<DictionaryLookupResult> {
    const res = await fetch(`/api/dictionary/lookup?word=${encodeURIComponent(word)}`);
    if (!res.ok) throw new Error('Failed to lookup word');
    return res.json();
  },

  async searchDictionary(query: string, limit = 30): Promise<WebsterEntrySummary[]> {
    const res = await fetch(`/api/dictionary/search?q=${encodeURIComponent(query)}&limit=${limit}`);
    if (!res.ok) throw new Error('Failed to search dictionary');
    return res.json();
  },

  async getDictionaryIndex(
    letter: string,
    page = 1,
    limit = 60,
    filter = ''
  ): Promise<DictionaryIndexResult> {
    const res = await fetch(
      `/api/dictionary/index?letter=${encodeURIComponent(letter)}&page=${page}&limit=${limit}&q=${encodeURIComponent(
        filter
      )}`
    );
    if (!res.ok) throw new Error('Failed to get dictionary index');
    return res.json();
  },

  async getWordDetail(word: string): Promise<WebsterEntryDetail> {
    const res = await fetch(`/api/dictionary/word/${encodeURIComponent(word)}`);
    if (!res.ok) throw new Error('Failed to fetch word detail');
    return res.json();
  },

  async lookupStrongs(word: string, testament?: Testament): Promise<StrongsLookupResult> {
    const url = testament
      ? `/api/strongs/lookup?word=${encodeURIComponent(word)}&testament=${testament}`
      : `/api/strongs/lookup?word=${encodeURIComponent(word)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to lookup Strongs entry');
    return res.json();
  },

  async searchStrongs(query: string, limit = 40): Promise<StrongsIndexWord[]> {
    const res = await fetch(`/api/strongs/search?q=${encodeURIComponent(query)}&limit=${limit}`);
    if (!res.ok) throw new Error('Failed to search Strongs index');
    return res.json();
  },

  async getStrongsIndex(
    letter: string,
    page = 1,
    limit = 50,
    filter = ''
  ): Promise<StrongsIndexResult> {
    const res = await fetch(
      `/api/strongs/index?letter=${encodeURIComponent(letter)}&page=${page}&limit=${limit}&q=${encodeURIComponent(
        filter
      )}`
    );
    if (!res.ok) throw new Error('Failed to get Strongs index');
    return res.json();
  },

  async getStrongsEntry(id: string): Promise<StrongsEntry> {
    const res = await fetch(`/api/strongs/entry/${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error('Failed to fetch Strongs entry detail');
    return res.json();
  },

  async getStrongsOccurrences(
    word: string,
    testament: Testament | 'ALL' = 'ALL',
    bookId?: string,
    limit = 100
  ): Promise<StrongsOccurrencesResult> {
    const params = new URLSearchParams({
      word,
      testament,
      limit: limit.toString(),
    });
    if (bookId) {
      params.append('bookId', bookId);
    }
    const res = await fetch(`/api/strongs/occurrences?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch Strongs occurrences in Bible');
    return res.json();
  },
};
