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

/**
 * =========================================================================
 * KJV ARCHAIC & ORTHOGRAPHIC NORMALIZATION SETTINGS
 * =========================================================================
 * Added during Issue #5 investigation:
 * If you need to roll back the extended normalization, set this flag to false:
 *   export const ENABLE_EXTENDED_KJV_NORMALIZATION = false;
 *
 * When false, DictionaryService strictly uses the original BASELINE_ARCHAIC_MAP
 * and baseline lemmatizer rules without British-to-American orthographic transformations
 * (-our -> -or, -re -> -er) or irregular past tense mappings.
 *
 * NOTE: Base dictionary words restored in server_data/webster1828.json (such as
 * "meet", "meek", "meat", "plain", "arm", "lamb", "leave") are authentic 1828
 * Webster headwords from the original publication and remain intact in the dataset.
 * =========================================================================
 */
export const ENABLE_EXTENDED_KJV_NORMALIZATION = true;

// Original baseline archaic mappings
const BASELINE_ARCHAIC_MAP: Record<string, string> = {
  saith: 'say',
  spake: 'speak',
  hath: 'have',
  doth: 'do',
  doeth: 'do',
  doest: 'do',
  sayeth: 'say',
  sayest: 'say',
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

// Extended KJV archaic & irregular forms (active only when ENABLE_EXTENDED_KJV_NORMALIZATION = true)
const EXTENDED_ARCHAIC_MAP: Record<string, string> = {
  dost: 'do',
  couldst: 'can',
  mightest: 'may',
  woe: 'wo', // Webster 1828 lists as 'WO'
  dwelt: 'dwell',
  known: 'know',
  began: 'begin',
  drew: 'draw',
  dealt: 'deal',
  graven: 'grave',
  oxen: 'ox',
  asses: 'ass',
  horsemen: 'horseman',
  yourselves: 'yourself',
  themselves: 'themself',
  himself: 'himself',
  subtil: 'subtil',
  sope: 'sope',
  nought: 'nought',
  olivet: 'olive',
  enquire: 'inquire',
  enquiry: 'inquiry',
  fain: 'fain',
  privily: 'privy',
  unawares: 'unaware',
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

  private extractPronunciation(headword: string, content: string): string {
    if (!content) return '';

    // Must extract from the entry header paragraph only, NOT definition or verse paragraphs
    const firstPMatch = content.match(/<p>([\s\S]*?)<\/p>/i);
    const header = firstPMatch ? firstPMatch[1] : content.slice(0, 350);

    // 1. Explicit: "Pronounced <word>" or "pron. <word>"
    const explicitMatch = header.match(/(?:pronounced|pron\.)\s+([a-zA-Z'’\-]+)/i);
    if (explicitMatch) {
      const word = explicitMatch[1].trim();
      const nonPron = new Set([
        'by', 'in', 'with', 'from', 'after', 'like', 'so', 'guilty', 'most',
        'separately', 'as', 'the', 'one', 'two', 'at', 'upon', 'to', 'for',
      ]);
      if (!nonPron.has(word.toLowerCase())) {
        return word;
      }
    }

    // 2. Bracketed: [pron. ...] or [Fr. pron. ...]
    const bracketMatch = header.match(/\[(?:[a-zA-Z\.\s]+)?(?:pron\.|pronounced)\s+([^\]]+)\]/i);
    if (bracketMatch) {
      return bracketMatch[1].trim();
    }

    // 3. Phonetic respelling following part of speech in header
    // Remove <b>...</b> headword
    const afterHead = header.replace(/<b>[\s\S]*?<\/b>[,;\s]*/i, '');

    // If header has preterit tense tag, it indicates past forms, not pronunciation
    if (/<i>\s*(?:preterit|pret|preterite)/i.test(afterHead.slice(0, 60))) {
      return '';
    }

    // Match leading part of speech tags
    const posPrefixMatch = afterHead.match(/^(?:or\s+[^,]+,\s*)?(?:<i>[a-zA-Z\.\s,]+<\/i>[,;\s]*)+/i);
    if (!posPrefixMatch) {
      return '';
    }

    const remainder = afterHead.slice(posPrefixMatch[0].length).trim();
    const respellMatch = remainder.match(/^([a-z'’\-]+)\.\s*(?:\[|[A-Z]|<a|$)/);
    if (!respellMatch) {
      return '';
    }

    const cand = respellMatch[1].trim();
    const grammarAndCommonTerms = new Set([
      'superlative', 'comparative', 'singular', 'plural', 'plur', 'sing', 'substantive',
      'preterit', 'pret', 'pp', 'adv', 'obs', 'not', 'see', 'little', 'rarely',
      'strictly', 'properly', 'commonly', 'popularly', 'formerly', 'hence', 'usually',
      'latin', 'french', 'sax', 'gr', 'it', 'sp', 'part', 'pass', 'act', 'v',
      'same', 'an', 'the', 'in', 'for', 'of', 'to', 'on', 'by', 'as', 'with', 'from',
      'or', 'and', 'is', 'are', 'was', 'were', 'been', 'being', 'that', 'this', 'which',
      'first', 'second', 'third',
    ]);

    if (cand.length < 2 || grammarAndCommonTerms.has(cand.toLowerCase())) {
      return '';
    }

    const hw = headword.toLowerCase().replace(/[^a-z]/g, '');
    const cd = cand.toLowerCase().replace(/[^a-z]/g, '');

    // If candidate is a plural form of headword (e.g. apex -> apexes, attorney -> attorneys, axis -> axes)
    if (cd === hw + 's' || cd === hw + 'es' || (hw.endsWith('is') && cd === hw.slice(0, -2) + 'es')) {
      return '';
    }
    if (/\[\s*(?:Latin|Greek)?[^\]]*plural/i.test(remainder)) {
      return '';
    }

    // If candidate has an apostrophe (Webster stress mark), it is an authentic respelling
    if (cand.includes("'") || cand.includes('’')) {
      return cand;
    }

    // Check silent initial clusters
    const isSilentCluster = (
      (hw.startsWith('gn') && cd.startsWith('n')) ||
      (hw.startsWith('kn') && cd.startsWith('n')) ||
      (hw.startsWith('wr') && cd.startsWith('r')) ||
      (hw.startsWith('ps') && cd.startsWith('s')) ||
      (hw.startsWith('pn') && cd.startsWith('n')) ||
      (hw.startsWith('pt') && cd.startsWith('t')) ||
      (hw.startsWith('ph') && cd.startsWith('f')) ||
      (hw.startsWith('ch') && (cd.startsWith('k') || cd.startsWith('sh')))
    );

    const h1 = hw[0];
    const c1 = cd[0];
    const soundEquivs = [
      ['c', 'k', 'q', 's'],
      ['p', 'f'],
      ['g', 'j'],
      ['w', 'r', 'b'],
      ['e', 'i', 'y', 'u'],
    ];
    const sameStart = h1 === c1 || soundEquivs.some(group => group.includes(h1) && group.includes(c1));

    if (!isSilentCluster && !sameStart) {
      return '';
    }

    // Reject definitions whose length is drastically different
    if (Math.abs(hw.length - cd.length) > 3) {
      return '';
    }

    // If candidate ends with a different noun suffix like -ism, -ness, -ity while headword does not:
    const nounSuffixes = ['ism', 'ness', 'ity', 'ment', 'tion', 'sion'];
    if (nounSuffixes.some(s => cd.endsWith(s) && !hw.endsWith(s))) {
      return '';
    }

    // Check if what follows is only [Not in use] or [Little used] with no other content in entry
    const afterCand = remainder.slice(cand.length + 1).trim();
    if (/^\[(?:Not in use|Little used|Obsolete)\.?\]$/i.test(afterCand)) {
      return '';
    }

    return cand;
  }

  public parseDetail(entry: RawWebsterItem): WebsterEntryDetail {
    const content = entry.content || '';
    let pos = '';
    let etymology = '';

    const firstPMatch = content.match(/<p>([\s\S]*?)<\/p>/i);
    const header = firstPMatch ? firstPMatch[1] : content.slice(0, 400);

    // Part of speech detection (first italic in header)
    const posMatch = header.match(/<i>([a-z\.\s,]+)<\/i>/i);
    if (posMatch) {
      pos = posMatch[1].trim();
    }

    // Etymology detection (bracketed info in header)
    const etymMatch = header.match(/\[([^\]]+)\]/);
    if (etymMatch) {
      etymology = etymMatch[1].trim();
    }

    // Pronunciation detection (authentic phonetic respelling in header only)
    const pronunciation = this.extractPronunciation(entry.word, content);

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
    const activeArchaicMap = ENABLE_EXTENDED_KJV_NORMALIZATION
      ? { ...BASELINE_ARCHAIC_MAP, ...EXTENDED_ARCHAIC_MAP }
      : BASELINE_ARCHAIC_MAP;

    if (activeArchaicMap[clean] && this.entriesMap.has(activeArchaicMap[clean])) {
      const target = activeArchaicMap[clean];
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

    // Extended normalization rules (controlled by ENABLE_EXTENDED_KJV_NORMALIZATION)
    if (ENABLE_EXTENDED_KJV_NORMALIZATION) {
      // British to American spelling variations (Webster 1828 standardized -or and -er)
      if (w.endsWith('our') && w.length > 4) {
        res.push(w.slice(0, -3) + 'or'); // e.g. honour -> honor, labour -> labor, favour -> favor
      }
      if (w.endsWith('re') && w.length > 4 && !w.endsWith('ere') && !w.endsWith('are')) {
        res.push(w.slice(0, -2) + 'er'); // e.g. sepulchre -> sepulcher, centre -> center
      }
      if (w.endsWith('selves')) {
        res.push(w.slice(0, -6) + 'self'); // e.g. yourselves -> yourself
      }
      if (w.length > 5 && w.endsWith('ied')) {
        res.push(w.slice(0, -3) + 'y'); // e.g. carried -> carry, buried -> bury
      }
      if (w.endsWith('ily')) {
        res.push(w.slice(0, -3) + 'y');
      }
    }

    // Archaic verb endings: -eth
    if (w.endsWith('eth') && w.length >= 4) {
      const base = w.slice(0, -3);
      if (base.endsWith('ng') || base.endsWith('rn') || base.endsWith('il') || base.endsWith('w')) {
        res.push(base); // e.g. singeth -> sing, mourneth -> mourn, loweth -> low
        res.push(base + 'e');
      } else {
        res.push(base + 'e'); // e.g. cometh -> come, biteth -> bite, hateth -> hate, careth -> care, useth -> use
        res.push(base);
      }
    }

    // Archaic verb endings: -est
    if (w.endsWith('est') && w.length >= 4) {
      const base = w.slice(0, -3);
      if (base.endsWith('ng') || base.endsWith('rn') || base.endsWith('il') || base.endsWith('w')) {
        res.push(base);
        res.push(base + 'e');
      } else {
        res.push(base + 'e'); // e.g. comest -> come, hatest -> hate, carest -> care, usest -> use
        res.push(base);
      }
    }

    // Present participle: -ing
    if (w.endsWith('ing') && w.length >= 5) {
      const base = w.slice(0, -3);
      const doubledConsonants = ['pp', 'bb', 'tt', 'dd', 'gg', 'mm', 'nn'];
      if (w.length > 5 && doubledConsonants.some(d => base.endsWith(d))) {
        // Doubled consonant: running -> run, begging -> beg, sinning -> sin
        res.push(w.slice(0, -4));
      }
      if (base.endsWith('ng') || base.endsWith('rn') || base.endsWith('y') || base.endsWith('w')) {
        res.push(base); // singing -> sing, mourning -> mourn, saying -> say, lowing -> low
        res.push(base + 'e');
      } else {
        res.push(base + 'e'); // snaring -> snare, coming -> come, writing -> write, hoping -> hope, using -> use
        res.push(base);
      }
    }

    // Past tense / participle: -ed
    if (w.endsWith('ed') && w.length >= 4) {
      const base = w.slice(0, -2);
      const doubledConsonants = ['pp', 'bb', 'tt', 'dd', 'gg', 'mm', 'nn'];
      if (w.length > 5 && doubledConsonants.some(d => base.endsWith(d))) {
        // e.g. sinned -> sin, stopped -> stop, begged -> beg
        res.push(w.slice(0, -3));
      }
      if (w === 'severed') {
        res.push('sever', 'severe');
      } else if (w === 'mourned') {
        res.push('mourn', 'mourne');
      } else if (w === 'barbed') {
        res.push('barb');
      } else {
        res.push(w.slice(0, -1)); // created -> create, snared -> snare, hated -> hate, hoped -> hope, cared -> care
        res.push(base); // walked -> walk, missed -> miss, erred -> err
      }
    }

    // Plurals: -ies -> -y
    if (w.endsWith('ies') && w.length >= 4) {
      res.push(w.slice(0, -3) + 'y');
    }

    // Plurals: -es
    if (w.endsWith('es') && w.length >= 4) {
      const pre = w.slice(0, -2);
      const sibilants = ['ch', 'sh', 'ss', 'x', 'z'];
      if (sibilants.some(s => pre.endsWith(s))) {
        // Sibilant root adds -es: branches -> branch, churches -> church, boxes -> box, glasses -> glass
        res.push(pre);
        res.push(w.slice(0, -1));
      } else {
        // Non-sibilant root ends in silent -e and simply added -s:
        // snares -> snare, robes -> robe, gates -> gate, trees -> tree, eyes -> eye, flames -> flame, cares -> care, uses -> use
        res.push(w.slice(0, -1));
        res.push(pre); // e.g. heroes -> hero, potatoes -> potato
      }
    }

    // Standard plural: -s
    if (w.endsWith('s') && !w.endsWith('ss') && w.length >= 3) {
      res.push(w.slice(0, -1));
    }

    // Adverbs: -ly
    if (w.endsWith('ly') && w.length >= 4) {
      res.push(w.slice(0, -2));
    }

    // Comparatives: -er (length >= 5 to prevent 3-letter proper nouns like Zer/Ner reducing to single letters)
    if (w.endsWith('er') && w.length >= 5) {
      res.push(w.slice(0, -2));
      res.push(w.slice(0, -1));
    }

    // Filter out invalid candidates (empty, single-letter like 'z' or 'n')
    return res.filter(c => c && c.length >= 2);
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
