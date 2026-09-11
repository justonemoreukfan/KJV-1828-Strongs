import fs from 'fs';
import path from 'path';
import https from 'https';
import {
  WebsterEntryDetail,
  WebsterEntrySummary,
  DictionaryLookupResult,
  DictionaryIndexResult,
} from '../src/types';

interface RawWebsterItem {
  word: string;
  content: string;
}

const KJV_ARCHAIC_MAP: Record<string, string> = {
  saith: 'say',
  spake: 'speak',
  hath: 'have',
  doth: 'do',
  didst: 'do',
  hadst: 'have',
  wast: 'be',
  wert: 'be',
  art: 'be',
  shalt: 'shall',
  wilt: 'will',
  canst: 'can',
  mayest: 'may',
  begat: 'beget',
  smote: 'smite',
  brake: 'break',
  bare: 'bear',
  sware: 'swear',
  thou: 'thou',
  thee: 'thee',
  thy: 'thy',
  thine: 'thine',
  ye: 'ye',
  whosoever: 'whosoever',
  whence: 'whence',
  wherefore: 'wherefore',
  thither: 'thither',
  hither: 'hither',
  anon: 'anon',
  wot: 'wot',
  wist: 'wist',
  shew: 'shew',
  shewed: 'shew',
  sheweth: 'shew',
  clave: 'cleave',
  stank: 'stink',
  durst: 'dare',
  lest: 'lest',
  forasmuch: 'forasmuch',
  howbeit: 'howbeit',
  cherubims: 'cherubim',
  seraphims: 'seraphim',
};

export class DictionaryService {
  private entriesMap = new Map<string, RawWebsterItem>();
  private allEntriesSorted: RawWebsterItem[] = [];
  private letterIndex = new Map<string, RawWebsterItem[]>();
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

      const filePath = path.join(dataDir, 'webster1828.json');
      if (!fs.existsSync(filePath)) {
        console.log('Downloading Webster 1828 dictionary data...');
        await this.downloadFile(
          'https://raw.githubusercontent.com/man4christ/1828-dictionary/master/json/dictionary_webster1828.json',
          filePath
        );
      }

      console.log('Loading Webster 1828 Dictionary into memory...');
      const rawText = fs.readFileSync(filePath, 'utf8');
      const items: RawWebsterItem[] = JSON.parse(rawText);

      this.entriesMap.clear();
      this.letterIndex.clear();

      for (const item of items) {
        if (!item || !item.word) continue;
        const lower = item.word.trim().toLowerCase();
        this.entriesMap.set(lower, item);

        const firstChar = lower.charAt(0).toUpperCase();
        const letter = firstChar >= 'A' && firstChar <= 'Z' ? firstChar : '#';
        if (!this.letterIndex.has(letter)) {
          this.letterIndex.set(letter, []);
        }
        this.letterIndex.get(letter)!.push(item);
      }

      this.allEntriesSorted = Array.from(this.entriesMap.values()).sort((a, b) =>
        a.word.localeCompare(b.word)
      );

      // Sort letter indexes
      for (const [letter, list] of this.letterIndex.entries()) {
        list.sort((a, b) => a.word.localeCompare(b.word));
      }

      this.isLoaded = true;
      console.log(`Webster 1828 Loaded: ${this.entriesMap.size} words indexed.`);
    } catch (err) {
      console.error('Failed to load Webster 1828 dictionary:', err);
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

  public parseDetail(entry: RawWebsterItem): WebsterEntryDetail {
    const content = entry.content || '';
    let pos = '';
    let pronunciation = '';
    let etymology = '';

    // Part of speech detection
    const posMatch = content.match(/<i>([a-z\.\s,]+)<\/i>/i);
    if (posMatch) {
      pos = posMatch[1].trim();
    }

    // Etymology detection
    const etymMatch = content.match(/\[([^\]]+)\]/);
    if (etymMatch) {
      etymology = etymMatch[1].trim();
    }

    // Pronunciation detection (e.g. <b>WORD</b>, <i>noun</i> pron.)
    const pronMatch = content.match(/<\/i>\s+([a-zA-Z'’\-]+)[\.,]/);
    if (pronMatch) {
      pronunciation = pronMatch[1].trim();
    }

    // Preview
    const plain = content
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const preview = plain.length > 160 ? plain.slice(0, 160) + '...' : plain;

    return {
      word: entry.word,
      pos,
      pronunciation,
      etymology,
      content,
      preview,
    };
  }

  public parseSummary(entry: RawWebsterItem): WebsterEntrySummary {
    const content = entry.content || '';
    let pos = '';
    const posMatch = content.match(/<i>([a-z\.\s,]+)<\/i>/i);
    if (posMatch) {
      pos = posMatch[1].trim();
    }

    const plain = content
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const preview = plain.length > 120 ? plain.slice(0, 120) + '...' : plain;

    return {
      word: entry.word,
      pos,
      preview,
    };
  }

  public lookup(rawWord: string): DictionaryLookupResult {
    const clean = rawWord
      .toLowerCase()
      .trim()
      .replace(/^[^a-z]+|[^a-z]+$/g, '');

    if (!clean) {
      return {
        query: rawWord,
        found: false,
        suggestions: [],
      };
    }

    // 1. Direct match
    if (this.entriesMap.has(clean)) {
      const entry = this.entriesMap.get(clean)!;
      return {
        query: rawWord,
        found: true,
        matchedWord: entry.word,
        isStem: false,
        entry: this.parseDetail(entry),
        suggestions: this.findSuggestions(clean, 5),
      };
    }

    // 2. KJV Archaic forms lookup
    if (KJV_ARCHAIC_MAP[clean] && this.entriesMap.has(KJV_ARCHAIC_MAP[clean])) {
      const target = KJV_ARCHAIC_MAP[clean];
      const entry = this.entriesMap.get(target)!;
      return {
        query: rawWord,
        found: true,
        matchedWord: entry.word,
        isStem: true,
        entry: this.parseDetail(entry),
        suggestions: this.findSuggestions(clean, 5),
      };
    }

    // 3. Morphological stemming & lemmatization candidates
    const candidates = this.generateLemmas(clean);
    for (const c of candidates) {
      if (this.entriesMap.has(c)) {
        const entry = this.entriesMap.get(c)!;
        return {
          query: rawWord,
          found: true,
          matchedWord: entry.word,
          isStem: true,
          entry: this.parseDetail(entry),
          suggestions: this.findSuggestions(c, 5),
        };
      }
    }

    // 4. Not found - return suggestions
    return {
      query: rawWord,
      found: false,
      suggestions: this.findSuggestions(clean, 8),
    };
  }

  private generateLemmas(w: string): string[] {
    const res: string[] = [];

    // Archaic verb endings
    if (w.endsWith('eth')) {
      res.push(w.slice(0, -3));
      res.push(w.slice(0, -3) + 'e');
    }
    if (w.endsWith('est')) {
      res.push(w.slice(0, -3));
      res.push(w.slice(0, -3) + 'e');
    }
    if (w.endsWith('ing')) {
      res.push(w.slice(0, -3));
      res.push(w.slice(0, -3) + 'e');
      if (w.length > 5 && w[w.length - 4] === w[w.length - 5]) {
        // e.g. running -> run
        res.push(w.slice(0, -4));
      }
    }
    if (w.endsWith('ed')) {
      res.push(w.slice(0, -2));
      res.push(w.slice(0, -1)); // e.g. created -> create
      if (w.length > 4 && w[w.length - 3] === w[w.length - 4]) {
        res.push(w.slice(0, -3));
      }
    }
    if (w.endsWith('ies')) {
      res.push(w.slice(0, -3) + 'y');
    }
    if (w.endsWith('es')) {
      res.push(w.slice(0, -2));
      res.push(w.slice(0, -1));
    }
    if (w.endsWith('s') && !w.endsWith('ss')) {
      res.push(w.slice(0, -1));
    }
    if (w.endsWith('ly')) {
      res.push(w.slice(0, -2));
    }
    if (w.endsWith('er')) {
      res.push(w.slice(0, -2));
      res.push(w.slice(0, -1));
    }

    return res;
  }

  public findSuggestions(prefix: string, maxCount = 10): WebsterEntrySummary[] {
    const q = prefix.toLowerCase();
    const results: WebsterEntrySummary[] = [];

    // First: words starting with prefix
    for (const entry of this.allEntriesSorted) {
      if (entry.word.toLowerCase().startsWith(q)) {
        results.push(this.parseSummary(entry));
        if (results.length >= maxCount) return results;
      }
    }

    // Second: words containing prefix
    if (results.length < maxCount && q.length >= 3) {
      for (const entry of this.allEntriesSorted) {
        if (
          !entry.word.toLowerCase().startsWith(q) &&
          entry.word.toLowerCase().includes(q)
        ) {
          results.push(this.parseSummary(entry));
          if (results.length >= maxCount) break;
        }
      }
    }

    return results;
  }

  public search(q: string, limit = 40): WebsterEntrySummary[] {
    const query = q.trim().toLowerCase();
    if (!query) return [];

    const starts: WebsterEntrySummary[] = [];
    const contains: WebsterEntrySummary[] = [];

    for (const entry of this.allEntriesSorted) {
      const lower = entry.word.toLowerCase();
      if (lower === query) {
        starts.unshift(this.parseSummary(entry));
      } else if (lower.startsWith(query)) {
        starts.push(this.parseSummary(entry));
      } else if (query.length >= 3 && lower.includes(query)) {
        contains.push(this.parseSummary(entry));
      }

      if (starts.length >= limit) break;
    }

    const combined = [...starts, ...contains].slice(0, limit);
    return combined;
  }

  public getIndex(
    letter: string,
    page = 1,
    limit = 50,
    filter = ''
  ): DictionaryIndexResult {
    const targetLetter = letter.toUpperCase();
    const list = this.letterIndex.get(targetLetter) || [];

    let filtered = list;
    if (filter && filter.trim()) {
      const f = filter.trim().toLowerCase();
      filtered = list.filter((e) => e.word.toLowerCase().includes(f));
    }

    const total = filtered.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const validPage = Math.max(1, Math.min(page, totalPages));
    const start = (validPage - 1) * limit;
    const paginated = filtered.slice(start, start + limit);

    return {
      letter: targetLetter,
      total,
      page: validPage,
      limit,
      totalPages,
      words: paginated.map((e) => this.parseSummary(e)),
    };
  }

  public getWordDetail(word: string): WebsterEntryDetail | null {
    const clean = word.toLowerCase().trim();
    const entry = this.entriesMap.get(clean);
    if (!entry) return null;
    return this.parseDetail(entry);
  }
}

export const dictionaryService = new DictionaryService();
