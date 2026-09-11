import fs from 'fs';
import path from 'path';
import {
  StrongsEntry,
  StrongsLookupResult,
  StrongsIndexResult,
  StrongsIndexWord,
  Testament,
} from '../src/types';

interface RawStrongsHebrew {
  lemma?: string;
  xlit?: string;
  pron?: string;
  derivation?: string;
  strongs_def?: string;
  kjv_def?: string;
}

interface RawStrongsGreek {
  lemma?: string;
  translit?: string;
  pron?: string;
  derivation?: string;
  strongs_def?: string;
  kjv_def?: string;
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
  believeth: 'believe',
  loveth: 'love',
  maketh: 'make',
  cometh: 'come',
  giveth: 'give',
  knoweth: 'know',
  liveth: 'live',
  walketh: 'walk',
  worketh: 'work',
  heareth: 'hear',
  judgeth: 'judge',
  standeth: 'stand',
  leadeth: 'lead',
  saveth: 'save',
};

export class StrongsService {
  private hebrewEntries = new Map<string, StrongsEntry>();
  private greekEntries = new Map<string, StrongsEntry>();
  // englishWord -> { hebrew: string[], greek: string[] }
  private englishIndex = new Map<string, { hebrew: string[]; greek: string[] }>();
  private allEnglishWordsSorted: string[] = [];
  private letterIndex = new Map<string, string[]>();

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
      const greekPath = path.join(dataDir, 'strongs_greek.json');
      const hebrewPath = path.join(dataDir, 'strongs_hebrew.json');

      if (!fs.existsSync(greekPath) || !fs.existsSync(hebrewPath)) {
        console.error('Strongs JSON files missing in server_data directory');
        return;
      }

      console.log("Loading Strong's Greek and Hebrew dictionaries into memory...");
      const rawGreek: Record<string, RawStrongsGreek> = JSON.parse(
        fs.readFileSync(greekPath, 'utf8')
      );
      const rawHebrew: Record<string, RawStrongsHebrew> = JSON.parse(
        fs.readFileSync(hebrewPath, 'utf8')
      );

      this.greekEntries.clear();
      this.hebrewEntries.clear();
      this.englishIndex.clear();
      this.letterIndex.clear();

      // Process Hebrew entries
      for (const [key, val] of Object.entries(rawHebrew)) {
        if (!key || !val) continue;
        const id = key.toUpperCase();
        const num = parseInt(id.replace(/[^0-9]/g, ''), 10) || 0;
        const entry: StrongsEntry = {
          id,
          number: num,
          testament: 'OT',
          lemma: val.lemma || '',
          translit: val.xlit || '',
          pron: val.pron || '',
          derivation: (val.derivation || '').trim(),
          strongs_def: (val.strongs_def || '').trim(),
          kjv_def: (val.kjv_def || '').trim(),
        };
        this.hebrewEntries.set(id, entry);
        this.indexKjvDef(entry.kjv_def, id, false);
      }

      // Process Greek entries
      for (const [key, val] of Object.entries(rawGreek)) {
        if (!key || !val) continue;
        const id = key.toUpperCase();
        const num = parseInt(id.replace(/[^0-9]/g, ''), 10) || 0;
        const entry: StrongsEntry = {
          id,
          number: num,
          testament: 'NT',
          lemma: val.lemma || '',
          translit: val.translit || '',
          pron: val.pron || '',
          derivation: (val.derivation || '').trim(),
          strongs_def: (val.strongs_def || '').trim(),
          kjv_def: (val.kjv_def || '').trim(),
        };
        this.greekEntries.set(id, entry);
        this.indexKjvDef(entry.kjv_def, id, true);
      }

      // Index and organize English words
      this.allEnglishWordsSorted = Array.from(this.englishIndex.keys()).sort((a, b) =>
        a.localeCompare(b)
      );

      for (const word of this.allEnglishWordsSorted) {
        const firstChar = word.charAt(0).toUpperCase();
        const letter = firstChar >= 'A' && firstChar <= 'Z' ? firstChar : '#';
        if (!this.letterIndex.has(letter)) {
          this.letterIndex.set(letter, []);
        }
        this.letterIndex.get(letter)!.push(word);
      }

      this.isLoaded = true;
      console.log(
        `Strong's Concordance Loaded: ${this.englishIndex.size} English words indexed (` +
          `${this.hebrewEntries.size} Hebrew, ${this.greekEntries.size} Greek).`
      );
    } catch (err) {
      console.error("Failed to initialize Strong's concordance:", err);
    }
  }

  private addIndexWord(word: string, id: string, isGreek: boolean) {
    if (!word) return;
    const clean = word.trim().toLowerCase().replace(/[^a-z-]/g, '');
    if (clean.length < 2) return;
    if (!this.englishIndex.has(clean)) {
      this.englishIndex.set(clean, { hebrew: [], greek: [] });
    }
    const bucket = this.englishIndex.get(clean)!;
    const list = isGreek ? bucket.greek : bucket.hebrew;
    if (!list.includes(id)) {
      list.push(id);
    }
  }

  private indexKjvDef(kjvDef: string, id: string, isGreek: boolean) {
    if (!kjvDef) return;
    // Replace [idiom], [phrase], and bracketed text
    const expanded = kjvDef
      .replace(/\[[^\]]+\]/g, ' ')
      .replace(/\([^)]+\)/g, ' ');

    const parts = expanded.split(/[,;.()]+/);
    for (const part of parts) {
      const tokens = part.trim().split(/[\s\/]+/);
      for (const t of tokens) {
        this.addIndexWord(t, id, isGreek);
      }
    }
  }

  /**
   * Look up an English word with stemming and archaic mapping
   */
  public lookup(rawWord: string, preferredTestament?: Testament): StrongsLookupResult {
    const clean = rawWord.trim().toLowerCase().replace(/[^a-z-]/g, '');
    if (!clean) {
      return {
        query: rawWord,
        found: false,
        hebrewEntries: [],
        greekEntries: [],
      };
    }

    let targetWord = clean;
    let match = this.englishIndex.get(clean);

    // 1. Check archaic map
    if (!match && KJV_ARCHAIC_MAP[clean]) {
      const mapped = KJV_ARCHAIC_MAP[clean];
      if (this.englishIndex.has(mapped)) {
        targetWord = mapped;
        match = this.englishIndex.get(mapped);
      }
    }

    // 2. Try regular English stemming
    if (!match) {
      const candidates: string[] = [];
      if (clean.endsWith('ed')) {
        candidates.push(clean.slice(0, -2));
        candidates.push(clean.slice(0, -1)); // create -> created
      }
      if (clean.endsWith('eth') || clean.endsWith('est')) {
        candidates.push(clean.slice(0, -3));
        candidates.push(clean.slice(0, -3) + 'e');
      }
      if (clean.endsWith('ing')) {
        candidates.push(clean.slice(0, -3));
        candidates.push(clean.slice(0, -3) + 'e');
      }
      if (clean.endsWith('s') && !clean.endsWith('ss')) {
        candidates.push(clean.slice(0, -1));
        if (clean.endsWith('es')) candidates.push(clean.slice(0, -2));
      }
      if (clean.endsWith('ly')) {
        candidates.push(clean.slice(0, -2));
      }

      for (const c of candidates) {
        if (this.englishIndex.has(c)) {
          targetWord = c;
          match = this.englishIndex.get(c);
          break;
        }
      }
    }

    if (!match || (match.hebrew.length === 0 && match.greek.length === 0)) {
      // Find suggestions
      const suggestions = this.findSuggestions(clean, 6);
      return {
        query: rawWord,
        found: false,
        hebrewEntries: [],
        greekEntries: [],
        suggestions,
      };
    }

    const hebrewEntries = match.hebrew
      .map((id) => this.hebrewEntries.get(id)!)
      .filter(Boolean);

    const greekEntries = match.greek
      .map((id) => this.greekEntries.get(id)!)
      .filter(Boolean);

    // Sort entries: if preferredTestament is specified, ensure it is highlighted
    return {
      query: rawWord,
      matchedWord: targetWord,
      found: true,
      hebrewEntries,
      greekEntries,
    };
  }

  /**
   * Search English words in Strong's index
   */
  public search(query: string, limit = 40): StrongsIndexWord[] {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const results: StrongsIndexWord[] = [];
    let count = 0;

    // Exact prefix matches first
    for (const word of this.allEnglishWordsSorted) {
      if (word.startsWith(q)) {
        results.push(this.formatIndexWord(word));
        count++;
        if (count >= limit) return results;
      }
    }

    // Substring matches next
    if (results.length < limit) {
      for (const word of this.allEnglishWordsSorted) {
        if (!word.startsWith(q) && word.includes(q)) {
          results.push(this.formatIndexWord(word));
          count++;
          if (count >= limit) return results;
        }
      }
    }

    return results;
  }

  /**
   * Get paginated English index for a letter
   */
  public getIndex(letter: string, page = 1, limit = 50, filter = ''): StrongsIndexResult {
    const l = letter.toUpperCase();
    let words = this.letterIndex.get(l) || [];

    if (filter) {
      const f = filter.toLowerCase().trim();
      words = words.filter((w) => w.includes(f));
    }

    const total = words.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const validPage = Math.max(1, Math.min(page, totalPages));
    const offset = (validPage - 1) * limit;
    const sliced = words.slice(offset, offset + limit);

    return {
      letter: l,
      page: validPage,
      totalPages,
      total,
      words: sliced.map((w) => this.formatIndexWord(w)),
    };
  }

  /**
   * Get single entry by Strong's ID (e.g. H1254 or G26)
   */
  public getEntryById(id: string): StrongsEntry | null {
    const key = id.toUpperCase().trim();
    if (key.startsWith('H')) {
      return this.hebrewEntries.get(key) || null;
    }
    if (key.startsWith('G')) {
      return this.greekEntries.get(key) || null;
    }
    return null;
  }

  private formatIndexWord(word: string): StrongsIndexWord {
    const match = this.englishIndex.get(word) || { hebrew: [], greek: [] };
    const sampleIds = [...match.hebrew.slice(0, 2), ...match.greek.slice(0, 2)];

    let previewDef = '';
    if (match.hebrew.length > 0) {
      const h = this.hebrewEntries.get(match.hebrew[0]);
      if (h) previewDef = h.strongs_def;
    } else if (match.greek.length > 0) {
      const g = this.greekEntries.get(match.greek[0]);
      if (g) previewDef = g.strongs_def;
    }

    return {
      word,
      hebrewCount: match.hebrew.length,
      greekCount: match.greek.length,
      previewDef,
      sampleIds,
    };
  }

  private findSuggestions(clean: string, count = 6): string[] {
    const res: string[] = [];
    for (const w of this.allEnglishWordsSorted) {
      if (w.startsWith(clean.slice(0, Math.min(clean.length, 3)))) {
        res.push(w);
        if (res.length >= count) break;
      }
    }
    return res;
  }
}

export const strongsService = new StrongsService();
