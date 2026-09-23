import fs from 'fs';
import path from 'path';
import https from 'https';
import {
  BibleBookInfo,
  BibleVerse,
  ChapterData,
  BibleSearchResult,
  Testament,
} from '../src/types';
import { BIBLE_BOOKS, BOOK_BY_ID } from './bibleMetadata';

interface RawKjvBook {
  abbrev: string;
  chapters: string[][];
}

export class BibleService {
  private rawBooks: RawKjvBook[] = [];
  private bookMap = new Map<string, RawKjvBook>();
  private isLoaded = false;
  private loadPromise: Promise<void> | null = null;

  constructor() {
    this.init();
  }

  public async ensureLoaded(): Promise<void> {
    if (this.isLoaded) return;
    if (this.loadPromise) return this.loadPromise;
    this.loadPromise = this.init();
    return this.loadPromise;
  }

  private async init(): Promise<void> {
    try {
      const dataDir = path.join(process.cwd(), 'server_data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      const filePath = path.join(dataDir, 'kjv.json');
      if (!fs.existsSync(filePath)) {
        console.log('Downloading KJV Bible data...');
        await this.downloadFile(
          'https://raw.githubusercontent.com/thiagobodruk/bible/master/json/en_kjv.json',
          filePath
        );
      }

      console.log('Loading KJV Bible into memory...');
      let rawText = fs.readFileSync(filePath, 'utf8');
      if (rawText.charCodeAt(0) === 0xfeff) {
        rawText = rawText.slice(1);
      }
      this.rawBooks = JSON.parse(rawText);

      this.bookMap.clear();
      for (const b of this.rawBooks) {
        this.bookMap.set(b.abbrev.toLowerCase(), b);
      }

      this.isLoaded = true;
      console.log(`KJV Bible Loaded: ${this.rawBooks.length} books ready.`);
    } catch (err) {
      console.error('Failed to load KJV Bible:', err);
    }
  }

  private downloadFile(url: string, dest: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(dest);
      https
        .get(url, (res) => {
          if (res.statusCode !== 200) {
            reject(new Error(`Failed to download ${url}: status ${res.statusCode}`));
            return;
          }
          res.pipe(file);
          file.on('finish', () => {
            file.close();
            resolve();
          });
        })
        .on('error', (err) => {
          fs.unlink(dest, () => {});
          reject(err);
        });
    });
  }

  public getBooks(): BibleBookInfo[] {
    return BIBLE_BOOKS;
  }

  public getBookInfo(bookId: string): BibleBookInfo | undefined {
    return BOOK_BY_ID.get(bookId.toLowerCase());
  }

  private parseVerse(rawText: string, verseNum: number): BibleVerse {
    // Remove marginal notes while strictly preserving translator supplied words/italics (e.g. {He that is}, {that is}, {is})
    const textWithoutNotes = rawText
      .replace(/«\{[^{}]+\}»/g, '')
      .replace(/\{[^{}]+:[^{}]+\}/g, '')
      .replace(/\{[^{}]*;\s*(?:or|Heb\.|Gr\.|Chald\.)[^{}]*\}/gi, '')
      .replace(/\{[^{}]*\bor,\s+[^{}]*\}/gi, '')
      .replace(/\{[^{}]*\b(?:Heb\.|Gr\.|Chald\.|Chal\.)[^{}]*\}/g, '')
      .replace(/\{[^{}]*not found in most of the Greek copies[^{}]*\}/gi, '')
      .replace(/\s{2,}/g, ' ')
      .trim();

    // Clean text for speech synthesis and display (remove supplied word braces {word} -> word)
    const cleanText = textWithoutNotes
      .replace(/\{([^{}]+)\}/g, '$1')
      .replace(/\s+/g, ' ')
      .trim();

    return {
      verse: verseNum,
      text: textWithoutNotes,
      cleanText,
      notes: [],
    };
  }

  public getChapter(bookId: string, chapterNum: number): ChapterData | null {
    const bookMeta = BOOK_BY_ID.get(bookId.toLowerCase());
    if (!bookMeta) return null;

    const rawBook = this.bookMap.get(bookMeta.id.toLowerCase());
    if (!rawBook) return null;

    const chapIdx = chapterNum - 1;
    if (chapIdx < 0 || chapIdx >= rawBook.chapters.length) return null;

    const rawVerses = rawBook.chapters[chapIdx];
    const verses: BibleVerse[] = rawVerses.map((v, i) => this.parseVerse(v, i + 1));

    // Calculate prev / next
    let prev: { bookId: string; chapter: number } | null = null;
    let next: { bookId: string; chapter: number } | null = null;

    if (chapterNum > 1) {
      prev = { bookId: bookMeta.id, chapter: chapterNum - 1 };
    } else if (bookMeta.order > 1) {
      const prevBook = BIBLE_BOOKS[bookMeta.order - 2];
      prev = { bookId: prevBook.id, chapter: prevBook.chaptersCount };
    }

    if (chapterNum < bookMeta.chaptersCount) {
      next = { bookId: bookMeta.id, chapter: chapterNum + 1 };
    } else if (bookMeta.order < BIBLE_BOOKS.length) {
      const nextBook = BIBLE_BOOKS[bookMeta.order];
      next = { bookId: nextBook.id, chapter: 1 };
    }

    return {
      book: bookMeta,
      chapter: chapterNum,
      verses,
      prev,
      next,
    };
  }

  public search(
    query: string,
    testament: Testament | 'ALL' = 'ALL',
    limit = 60
  ): BibleSearchResult[] {
    const q = query.trim();
    if (!q || q.length < 2) return [];

    const lowerQ = q.toLowerCase();
    const results: BibleSearchResult[] = [];

    for (const bookMeta of BIBLE_BOOKS) {
      if (testament !== 'ALL' && bookMeta.testament !== testament) {
        continue;
      }

      const rawBook = this.bookMap.get(bookMeta.id.toLowerCase());
      if (!rawBook) continue;

      for (let cIdx = 0; cIdx < rawBook.chapters.length; cIdx++) {
        const chapterNum = cIdx + 1;
        const chapterVerses = rawBook.chapters[cIdx];

        for (let vIdx = 0; vIdx < chapterVerses.length; vIdx++) {
          const rawVerse = chapterVerses[vIdx];
          if (rawVerse.toLowerCase().includes(lowerQ)) {
            const parsed = this.parseVerse(rawVerse, vIdx + 1);
            results.push({
              bookId: bookMeta.id,
              bookName: bookMeta.name,
              testament: bookMeta.testament,
              chapter: chapterNum,
              verse: vIdx + 1,
              text: parsed.text,
              cleanText: parsed.cleanText,
            });

            if (results.length >= limit) return results;
          }
        }
      }
    }

    return results;
  }

  public getWordOccurrences(
    query: string,
    testament: Testament | 'ALL' = 'ALL',
    bookId?: string,
    limit = 100
  ): {
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
  } {
    const q = query.trim();
    if (!q || q.length < 2) {
      return {
        query: q,
        testament,
        totalCount: 0,
        bookDistribution: [],
        verses: [],
      };
    }

    const cleanWord = q.toLowerCase().replace(/[^a-z-]/g, '');
    let regex: RegExp;
    try {
      if (/^[a-z]+$/i.test(cleanWord)) {
        regex = new RegExp(`\\b${cleanWord}(s|d|ed|eth|est|ing)?\\b`, 'i');
      } else {
        const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        regex = new RegExp(`\\b${escaped}\\b`, 'i');
      }
    } catch {
      const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      regex = new RegExp(escaped, 'i');
    }

    const bookDistribution: {
      bookId: string;
      bookName: string;
      testament: Testament;
      count: number;
    }[] = [];
    const verses: BibleSearchResult[] = [];
    let totalCount = 0;

    for (const bookMeta of BIBLE_BOOKS) {
      if (testament !== 'ALL' && bookMeta.testament !== testament) {
        continue;
      }

      const rawBook = this.bookMap.get(bookMeta.id.toLowerCase());
      if (!rawBook) continue;

      let bookMatches = 0;
      const shouldCollectVerses = !bookId || bookMeta.id.toLowerCase() === bookId.toLowerCase();

      for (let cIdx = 0; cIdx < rawBook.chapters.length; cIdx++) {
        const chapterNum = cIdx + 1;
        const chapterVerses = rawBook.chapters[cIdx];

        for (let vIdx = 0; vIdx < chapterVerses.length; vIdx++) {
          const rawVerse = chapterVerses[vIdx];
          if (regex.test(rawVerse)) {
            bookMatches++;
            totalCount++;

            if (shouldCollectVerses && verses.length < limit) {
              const parsed = this.parseVerse(rawVerse, vIdx + 1);
              verses.push({
                bookId: bookMeta.id,
                bookName: bookMeta.name,
                testament: bookMeta.testament,
                chapter: chapterNum,
                verse: vIdx + 1,
                text: parsed.text,
                cleanText: parsed.cleanText,
              });
            }
          }
        }
      }

      if (bookMatches > 0) {
        bookDistribution.push({
          bookId: bookMeta.id,
          bookName: bookMeta.name,
          testament: bookMeta.testament,
          count: bookMatches,
        });
      }
    }

    return {
      query: q,
      testament,
      totalCount,
      bookDistribution,
      verses,
    };
  }
}

export const bibleService = new BibleService();
