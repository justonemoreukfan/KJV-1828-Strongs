import { BibleBookInfo } from '../src/types';

export const BIBLE_BOOKS: BibleBookInfo[] = [
  // Old Testament - Law (Pentateuch)
  { id: 'gn', name: 'Genesis', order: 1, testament: 'OT', category: 'Law', chaptersCount: 50 },
  { id: 'ex', name: 'Exodus', order: 2, testament: 'OT', category: 'Law', chaptersCount: 40 },
  { id: 'lv', name: 'Leviticus', order: 3, testament: 'OT', category: 'Law', chaptersCount: 27 },
  { id: 'nm', name: 'Numbers', order: 4, testament: 'OT', category: 'Law', chaptersCount: 36 },
  { id: 'dt', name: 'Deuteronomy', order: 5, testament: 'OT', category: 'Law', chaptersCount: 34 },

  // Old Testament - History
  { id: 'js', name: 'Joshua', order: 6, testament: 'OT', category: 'History', chaptersCount: 24 },
  { id: 'jud', name: 'Judges', order: 7, testament: 'OT', category: 'History', chaptersCount: 21 },
  { id: 'rt', name: 'Ruth', order: 8, testament: 'OT', category: 'History', chaptersCount: 4 },
  { id: '1sm', name: '1 Samuel', order: 9, testament: 'OT', category: 'History', chaptersCount: 31 },
  { id: '2sm', name: '2 Samuel', order: 10, testament: 'OT', category: 'History', chaptersCount: 24 },
  { id: '1kgs', name: '1 Kings', order: 11, testament: 'OT', category: 'History', chaptersCount: 22 },
  { id: '2kgs', name: '2 Kings', order: 12, testament: 'OT', category: 'History', chaptersCount: 25 },
  { id: '1ch', name: '1 Chronicles', order: 13, testament: 'OT', category: 'History', chaptersCount: 29 },
  { id: '2ch', name: '2 Chronicles', order: 14, testament: 'OT', category: 'History', chaptersCount: 36 },
  { id: 'ezr', name: 'Ezra', order: 15, testament: 'OT', category: 'History', chaptersCount: 10 },
  { id: 'ne', name: 'Nehemiah', order: 16, testament: 'OT', category: 'History', chaptersCount: 13 },
  { id: 'et', name: 'Esther', order: 17, testament: 'OT', category: 'History', chaptersCount: 10 },

  // Old Testament - Poetry & Wisdom
  { id: 'job', name: 'Job', order: 18, testament: 'OT', category: 'Poetry', chaptersCount: 42 },
  { id: 'ps', name: 'Psalms', order: 19, testament: 'OT', category: 'Poetry', chaptersCount: 150 },
  { id: 'prv', name: 'Proverbs', order: 20, testament: 'OT', category: 'Poetry', chaptersCount: 31 },
  { id: 'ec', name: 'Ecclesiastes', order: 21, testament: 'OT', category: 'Poetry', chaptersCount: 12 },
  { id: 'so', name: 'Song of Solomon', order: 22, testament: 'OT', category: 'Poetry', chaptersCount: 8 },

  // Old Testament - Major Prophets
  { id: 'is', name: 'Isaiah', order: 23, testament: 'OT', category: 'Major Prophets', chaptersCount: 66 },
  { id: 'jr', name: 'Jeremiah', order: 24, testament: 'OT', category: 'Major Prophets', chaptersCount: 52 },
  { id: 'lm', name: 'Lamentations', order: 25, testament: 'OT', category: 'Major Prophets', chaptersCount: 5 },
  { id: 'ez', name: 'Ezekiel', order: 26, testament: 'OT', category: 'Major Prophets', chaptersCount: 48 },
  { id: 'dn', name: 'Daniel', order: 27, testament: 'OT', category: 'Major Prophets', chaptersCount: 12 },

  // Old Testament - Minor Prophets
  { id: 'ho', name: 'Hosea', order: 28, testament: 'OT', category: 'Minor Prophets', chaptersCount: 14 },
  { id: 'jl', name: 'Joel', order: 29, testament: 'OT', category: 'Minor Prophets', chaptersCount: 3 },
  { id: 'am', name: 'Amos', order: 30, testament: 'OT', category: 'Minor Prophets', chaptersCount: 9 },
  { id: 'ob', name: 'Obadiah', order: 31, testament: 'OT', category: 'Minor Prophets', chaptersCount: 1 },
  { id: 'jn', name: 'Jonah', order: 32, testament: 'OT', category: 'Minor Prophets', chaptersCount: 4 },
  { id: 'mi', name: 'Micah', order: 33, testament: 'OT', category: 'Minor Prophets', chaptersCount: 7 },
  { id: 'na', name: 'Nahum', order: 34, testament: 'OT', category: 'Minor Prophets', chaptersCount: 3 },
  { id: 'hk', name: 'Habakkuk', order: 35, testament: 'OT', category: 'Minor Prophets', chaptersCount: 3 },
  { id: 'zp', name: 'Zephaniah', order: 36, testament: 'OT', category: 'Minor Prophets', chaptersCount: 3 },
  { id: 'hg', name: 'Haggai', order: 37, testament: 'OT', category: 'Minor Prophets', chaptersCount: 2 },
  { id: 'zc', name: 'Zechariah', order: 38, testament: 'OT', category: 'Minor Prophets', chaptersCount: 14 },
  { id: 'ml', name: 'Malachi', order: 39, testament: 'OT', category: 'Minor Prophets', chaptersCount: 4 },

  // New Testament - Gospels
  { id: 'mt', name: 'Matthew', order: 40, testament: 'NT', category: 'Gospels', chaptersCount: 28 },
  { id: 'mk', name: 'Mark', order: 41, testament: 'NT', category: 'Gospels', chaptersCount: 16 },
  { id: 'lk', name: 'Luke', order: 42, testament: 'NT', category: 'Gospels', chaptersCount: 24 },
  { id: 'jo', name: 'John', order: 43, testament: 'NT', category: 'Gospels', chaptersCount: 21 },

  // New Testament - Church History
  { id: 'act', name: 'Acts', order: 44, testament: 'NT', category: 'Church History', chaptersCount: 28 },

  // New Testament - Pauline Epistles
  { id: 'rm', name: 'Romans', order: 45, testament: 'NT', category: 'Pauline Epistles', chaptersCount: 16 },
  { id: '1co', name: '1 Corinthians', order: 46, testament: 'NT', category: 'Pauline Epistles', chaptersCount: 16 },
  { id: '2co', name: '2 Corinthians', order: 47, testament: 'NT', category: 'Pauline Epistles', chaptersCount: 13 },
  { id: 'gl', name: 'Galatians', order: 48, testament: 'NT', category: 'Pauline Epistles', chaptersCount: 6 },
  { id: 'eph', name: 'Ephesians', order: 49, testament: 'NT', category: 'Pauline Epistles', chaptersCount: 6 },
  { id: 'ph', name: 'Philippians', order: 50, testament: 'NT', category: 'Pauline Epistles', chaptersCount: 4 },
  { id: 'cl', name: 'Colossians', order: 51, testament: 'NT', category: 'Pauline Epistles', chaptersCount: 4 },
  { id: '1ts', name: '1 Thessalonians', order: 52, testament: 'NT', category: 'Pauline Epistles', chaptersCount: 5 },
  { id: '2ts', name: '2 Thessalonians', order: 53, testament: 'NT', category: 'Pauline Epistles', chaptersCount: 3 },
  { id: '1tm', name: '1 Timothy', order: 54, testament: 'NT', category: 'Pauline Epistles', chaptersCount: 6 },
  { id: '2tm', name: '2 Timothy', order: 55, testament: 'NT', category: 'Pauline Epistles', chaptersCount: 4 },
  { id: 'tt', name: 'Titus', order: 56, testament: 'NT', category: 'Pauline Epistles', chaptersCount: 3 },
  { id: 'phm', name: 'Philemon', order: 57, testament: 'NT', category: 'Pauline Epistles', chaptersCount: 1 },

  // New Testament - General Epistles
  { id: 'hb', name: 'Hebrews', order: 58, testament: 'NT', category: 'General Epistles', chaptersCount: 13 },
  { id: 'jm', name: 'James', order: 59, testament: 'NT', category: 'General Epistles', chaptersCount: 5 },
  { id: '1pe', name: '1 Peter', order: 60, testament: 'NT', category: 'General Epistles', chaptersCount: 5 },
  { id: '2pe', name: '2 Peter', order: 61, testament: 'NT', category: 'General Epistles', chaptersCount: 3 },
  { id: '1jo', name: '1 John', order: 62, testament: 'NT', category: 'General Epistles', chaptersCount: 5 },
  { id: '2jo', name: '2 John', order: 63, testament: 'NT', category: 'General Epistles', chaptersCount: 1 },
  { id: '3jo', name: '3 John', order: 64, testament: 'NT', category: 'General Epistles', chaptersCount: 1 },
  { id: 'jd', name: 'Jude', order: 65, testament: 'NT', category: 'General Epistles', chaptersCount: 1 },

  // New Testament - Prophecy
  { id: 're', name: 'Revelation', order: 66, testament: 'NT', category: 'Prophecy', chaptersCount: 22 },
];

export const BOOK_BY_ID = new Map<string, BibleBookInfo>(
  BIBLE_BOOKS.map((b) => [b.id.toLowerCase(), b])
);
