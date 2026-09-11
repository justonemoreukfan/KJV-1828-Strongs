import React from 'react';

/**
 * Parses the KJV translation rendering string from Strong's entry
 * e.g., "(be-) love(-d, -ly, -r), like, friend." -> ['love', 'like', 'friend']
 * e.g., "chief, (fore-) father(-less), [idiom] patrimony, principal." -> ['chief', 'father', 'patrimony', 'principal']
 */
export function parseKjvRenderings(kjvDef: string): string[] {
  if (!kjvDef) return [];

  // Remove notes like [idiom], [phrase], Compare..., See also...
  let text = kjvDef
    .replace(/\[[^\]]+\]/g, ' ')
    .replace(/\b(?:Compare|compare|See|see)\b[^.;)]+[.;)]?/g, ' ')
    .replace(/\([HhGg]\d+\)/g, ' ');

  // Split by common separators
  const rawParts = text.split(/[,;.]+/);
  const wordsSet = new Set<string>();

  for (let part of rawParts) {
    part = part.trim();
    if (!part) continue;

    // Remove parentheses, brackets, hyphens e.g. (fore-) father(-less) -> father
    // (be-) love(-d, -ly, -r) -> love
    const cleaned = part
      .replace(/[\(\)\[\]\-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();

    const tokens = cleaned.split(/\s+/);
    for (const t of tokens) {
      const cleanWord = t.replace(/[^a-z]/g, '');
      if (
        cleanWord.length >= 2 &&
        !['be', 'and', 'the', 'of', 'to', 'in', 'or', 'by', 'for', 'with', 'on', 'as', 'at', 'an', 'is', 'it'].includes(
          cleanWord
        )
      ) {
        wordsSet.add(cleanWord);
      }
    }
  }

  return Array.from(wordsSet);
}

// Regex matching common biblical citations like: "Genesis 1:1", "Gen 25:25", "Hosea 13:10,14", "Matt. 1:21"
const SCRIPTURE_CITATION_REGEX =
  /(?:(?:[1-3]\s+)?(?:Genesis|Gen|Exodus|Exod|Ex|Leviticus|Lev|Numbers|Num|Deuteronomy|Deut|Joshua|Josh|Judges|Judg|Ruth|Samuel|Sam|Kings|Kgs|Chronicles|Chron|Ezra|Nehemiah|Neh|Esther|Esth|Job|Psalms?|Psa?|Proverbs?|Prov|Ecclesiastes|Eccles|Song\s+of\s+Solomon|Isaiah|Isa|Jeremiah|Jer|Lamentations|Lam|Ezekiel|Ezek|Daniel|Dan|Hosea|Hos|Joel|Amos|Obadiah|Obad|Jonah|Micah|Mic|Nahum|Nah|Habakkuk|Hab|Zephaniah|Zeph|Haggai|Hag|Zechariah|Zech|Malachi|Mal|Matthew|Matt|Mark|Luke|John|Acts|Romans|Rom|Corinthians|Cor|Galatians|Gal|Ephesians|Eph|Philippians|Phil|Colossians|Col|Thessalonians|Thess|Timothy|Tim|Titus|Philemon|Philem|Hebrews|Heb|James|Jas|Peter|Pet|Jude|Revelation|Rev)\.?\s+\d+(?::\d+(?:[,\-–]\d+)*)?)/gi;

/**
 * Scans a text string for scripture references and renders them as clickable links
 */
export function renderTextWithScriptureCitations(
  text: string,
  onNavigateToScripture: (reference: string) => void
): React.ReactNode {
  if (!text) return null;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  // Reset regex index
  SCRIPTURE_CITATION_REGEX.lastIndex = 0;

  while ((match = SCRIPTURE_CITATION_REGEX.exec(text)) !== null) {
    const matchStart = match.index;
    const matchEnd = SCRIPTURE_CITATION_REGEX.lastIndex;
    const matchedRef = match[0];

    // Push preceding text
    if (matchStart > lastIndex) {
      parts.push(text.substring(lastIndex, matchStart));
    }

    // Push interactive link
    parts.push(
      <button
        key={`ref-${matchStart}`}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onNavigateToScripture(matchedRef);
        }}
        title={`Open ${matchedRef} in King James Bible`}
        className="inline-flex items-center gap-0.5 px-1.5 py-0.5 mx-0.5 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 font-medium text-xs border border-amber-300/80 transition-colors cursor-pointer underline decoration-amber-600/50 underline-offset-2"
      >
        <span>{matchedRef}</span>
      </button>
    );

    lastIndex = matchEnd;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return <>{parts}</>;
}

/**
 * Highlights a query word inside a verse text string
 */
export function highlightWordInText(text: string, word: string): React.ReactNode {
  if (!text || !word) return text;
  const clean = word.trim().replace(/[^a-z-]/gi, '');
  if (!clean) return text;

  try {
    const regex = new RegExp(`(\\b${clean}(?:s|d|ed|eth|est|ing)?\\b)`, 'gi');
    const parts = text.split(regex);

    return (
      <>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <mark
              key={i}
              className="bg-amber-200 text-amber-950 font-semibold px-0.5 py-0.2 rounded"
            >
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  } catch {
    return text;
  }
}
