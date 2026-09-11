import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { bibleService } from './server/bibleService';
import { dictionaryService } from './server/dictionaryService';
import { strongsService } from './server/strongsService';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize datasets in parallel
  bibleService.ensureLoaded();
  dictionaryService.ensureLoaded();
  strongsService.ensureLoaded();

  // API routes
  app.get('/api/health', async (req, res) => {
    res.json({
      status: 'ok',
      booksCount: bibleService.getBooks().length,
    });
  });

  // 1. Bible endpoints
  app.get('/api/bible/books', async (req, res) => {
    await bibleService.ensureLoaded();
    res.json(bibleService.getBooks());
  });

  app.get('/api/bible/chapter', async (req, res) => {
    await bibleService.ensureLoaded();
    const book = (req.query.book as string) || 'gn';
    const chapter = parseInt((req.query.chapter as string) || '1', 10);
    const data = bibleService.getChapter(book, chapter);
    if (!data) {
      res.status(404).json({ error: 'Chapter not found' });
      return;
    }
    res.json(data);
  });

  app.get('/api/bible/search', async (req, res) => {
    await bibleService.ensureLoaded();
    const q = (req.query.q as string) || '';
    const testament = (req.query.testament as any) || 'ALL';
    const limit = parseInt((req.query.limit as string) || '60', 10);
    const results = bibleService.search(q, testament, limit);
    res.json(results);
  });

  // 2. 1828 Dictionary endpoints
  app.get('/api/dictionary/lookup', async (req, res) => {
    await dictionaryService.ensureLoaded();
    await strongsService.ensureLoaded();
    await bibleService.ensureLoaded();
    const word = (req.query.word as string) || '';
    const result = dictionaryService.lookup(word);

    // Cross-check existence in Strong's Concordance
    const targetWord = result.matchedWord || result.query || word;
    const strongsCheck = strongsService.lookup(targetWord);

    // Bible occurrences count if in Scripture
    let occurrencesCount = 0;
    try {
      const occ = bibleService.getWordOccurrences(targetWord, 'ALL', undefined, 1);
      occurrencesCount = occ.totalCount;
    } catch {
      occurrencesCount = 0;
    }

    const enhanced = {
      ...result,
      strongsMatch: {
        exists: strongsCheck.found,
        matchedWord: strongsCheck.matchedWord,
        hebrewCount: strongsCheck.hebrewEntries.length,
        greekCount: strongsCheck.greekEntries.length,
        suggestions: strongsCheck.suggestions?.map((s) => (typeof s === 'string' ? s : s.word)) || [],
      },
      bibleOccurrencesCount: occurrencesCount,
    };

    res.json(enhanced);
  });

  app.get('/api/dictionary/search', async (req, res) => {
    await dictionaryService.ensureLoaded();
    const q = (req.query.q as string) || '';
    const limit = parseInt((req.query.limit as string) || '30', 10);
    const results = dictionaryService.search(q, limit);
    res.json(results);
  });

  app.get('/api/dictionary/index', async (req, res) => {
    await dictionaryService.ensureLoaded();
    const letter = (req.query.letter as string) || 'A';
    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || '60', 10);
    const filter = (req.query.q as string) || '';
    const result = dictionaryService.getIndex(letter, page, limit, filter);
    res.json(result);
  });

  app.get('/api/dictionary/word/:word', async (req, res) => {
    await dictionaryService.ensureLoaded();
    const word = req.params.word;
    const detail = dictionaryService.getWordDetail(word);
    if (!detail) {
      res.status(404).json({ error: 'Word not found in Webster 1828' });
      return;
    }
    res.json(detail);
  });

  // 3. Strong's Concordance endpoints (Indexed by English words)
  app.get('/api/strongs/lookup', async (req, res) => {
    await strongsService.ensureLoaded();
    await dictionaryService.ensureLoaded();
    const word = (req.query.word as string) || '';
    const testament = (req.query.testament as any) || undefined;
    const result = strongsService.lookup(word, testament);

    // Cross-check existence in Webster 1828 Dictionary
    const targetWord = result.matchedWord || result.query || word;
    const websterCheck = dictionaryService.lookup(targetWord);

    const enhanced = {
      ...result,
      websterMatch: {
        exists: websterCheck.found,
        matchedWord: websterCheck.matchedWord,
        preview: websterCheck.entry?.preview,
        suggestions: websterCheck.suggestions?.map((s) => s.word) || [],
      },
    };

    res.json(enhanced);
  });

  app.get('/api/strongs/search', async (req, res) => {
    await strongsService.ensureLoaded();
    const q = (req.query.q as string) || '';
    const limit = parseInt((req.query.limit as string) || '40', 10);
    const results = strongsService.search(q, limit);
    res.json(results);
  });

  app.get('/api/strongs/index', async (req, res) => {
    await strongsService.ensureLoaded();
    const letter = (req.query.letter as string) || 'A';
    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || '50', 10);
    const filter = (req.query.q as string) || '';
    const result = strongsService.getIndex(letter, page, limit, filter);
    res.json(result);
  });

  app.get('/api/strongs/entry/:id', async (req, res) => {
    await strongsService.ensureLoaded();
    const id = req.params.id;
    const entry = strongsService.getEntryById(id);
    if (!entry) {
      res.status(404).json({ error: 'Strongs entry not found' });
      return;
    }
    res.json(entry);
  });

  // Places words are found in the Bible from Strong's Concordance
  app.get('/api/strongs/occurrences', async (req, res) => {
    await bibleService.ensureLoaded();
    const word = (req.query.word as string) || '';
    const testament = (req.query.testament as any) || 'ALL';
    const bookId = (req.query.bookId as string) || undefined;
    const limit = parseInt((req.query.limit as string) || '100', 10);
    const occurrences = bibleService.getWordOccurrences(word, testament, bookId, limit);
    res.json(occurrences);
  });

  // Vite middleware for development vs static in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
