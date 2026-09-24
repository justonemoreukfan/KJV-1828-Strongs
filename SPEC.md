# Classical Bible Study Suite — Technical Specification (SPEC.md)

**Document Version**: 1.3.0  
**Last Updated**: September 23, 2026  
**Status**: Living Architecture & Engineering Specification  
**GitHub Repository**: [https://github.com/justonemoreukfan/KJV-1828-Strongs](https://github.com/justonemoreukfan/KJV-1828-Strongs)  
**Live Published Web Edition**: [https://kjv-bible-1828-webster-dictionary-strong-s.ai.studio/](https://kjv-bible-1828-webster-dictionary-strong-s.ai.studio/)

---

## 1. Executive Summary & Design Principles

The **Classical Bible Study Suite** is a 100% offline, local-first Scripture study workstation that brings together three foundational historical resources:
1. **Authorized King James Version (1611/1769 KJV)** with full translator supplied words (italics) and parsed marginal cross-references.
2. **Noah Webster’s 1828 American Dictionary of the English Language** with biblical word usages and theological contexts.
3. **Dr. James Strong’s Exhaustive Concordance** with original Hebrew (OT) and Greek (NT) lexicons, roots, transliterations, and pronunciations.

### Core Architectural Axioms
- **Zero Remote Dependencies**: The application boots from local storage and memory without calling external services, CDNs, or telemetry servers.
- **Data Integrity**: Scriptural text must maintain strict fidelity to historical typography, specifically preserving translator italics while separating marginal annotations.
- **Cross-Platform Accessibility**: Full support for desktop and mobile browsers (specifically addressing Web Speech API inconsistencies across operating systems such as Android).

---

## 2. Scripture Corpus & Text Processing Specification

### 2.1 Raw Corpus Architecture
Scripture data resides in `/server_data/kjv.json` (66 books, 1,189 chapters, 31,102 verses). Each book contains an array of chapters, which in turn contain arrays of verse strings.

### 2.2 Distinction: Supplied Words (Italics) vs. Marginal Notes

In the historical Authorized Version, the translators used two distinct non-body text elements:
1. **Supplied Words (Translator Italics)**: Words added into the English translation to complete the sense of the original Hebrew/Greek idioms where English requires an explicit verb or pronoun (e.g., *"{is}"*, *"{He that is}"*, *"{are}"*, *"{that is}"*).
2. **Marginal Notes & Cross-References**: Translation alternatives, literal Hebrew/Greek glosses, and textual notes inserted into the margins (e.g., *"{hasty...: Heb. short of spirit}"*, *"{Abelmizraim: that is, The mourning of the Egyptians}"*, *"{digged...: or, houghed oxen}"*).

### 2.3 Text Parser & Regular Expression Specification (Issue #2 Fix)

#### The Problem (Regression History):
Early implementations used an overbroad case-insensitive pattern:
```regex
/\{[^{}]*(?:Heb\.|Gr\.|Chald\.|that is|Or,)[^{}]*\}/gi
```
Because `(?:that is)` was evaluated case-insensitively without syntactic delimiters, it matched any sentence where `{He that is}`, `{he that is}`, or `{that is}` appeared as supplied words. This deleted the first words of **Proverbs 14:17**, **Proverbs 14:29**, **Proverbs 16:32**, and over 120 other verses across the Bible.

#### The Authoritative Specification:
The parser in `server/bibleService.ts` and `src/components/BibleReader.tsx` MUST use strict structural identifiers to delineate marginal commentary from supplied italics:

```typescript
function stripMarginalNotes(raw: string): string {
  return raw
    // 1. Postscripts / subscriptions enclosed in «{...}»
    .replace(/«\{[^{}]+\}»/g, '')
    // 2. Marginal notes with colon delimiters: {word: note}
    .replace(/\{[^{}]+:[^{}]+\}/g, '')
    // 3. Marginal notes with semicolon delimiters: {word; or, alternative}
    .replace(/\{[^{}]*;\s*(?:or|Heb\.|Gr\.|Chald\.)[^{}]*\}/gi, '')
    // 4. Marginal notes starting with or containing alternative reading 'or, '
    .replace(/\{[^{}]*\bor,\s+[^{}]*\}/gi, '')
    // 5. Marginal notes with original language tags: Heb., Gr., Chald., Chal.
    .replace(/\{[^{}]*\b(?:Heb\.|Gr\.|Chald\.|Chal\.)[^{}]*\}/g, '')
    // 6. Explicit textual variant commentary
    .replace(/\{[^{}]*not found in most of the Greek copies[^{}]*\}/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}
```

#### Clean Text Derivation:
For search indexing, copy-pasting, and Text-to-Speech narration, `cleanText` strips the outer curly braces while keeping the supplied text intact:
```typescript
const cleanText = textWithoutNotes
  .replace(/\{([^{}]+)\}/g, '$1')
  .replace(/\s+/g, ' ')
  .trim();
```

---

## 3. Audio & Speech Synthesis Specification (Issue #4 Fix)

The application provides a built-in verse-by-verse audio narrator using the browser's native **Web Speech API** (`SpeechSynthesis` and `SpeechSynthesisUtterance`).

### 3.1 Android TTS Compatibility Requirements

Mobile operating systems—specifically Android with Google Text-to-Speech—exhibit unique behaviors that differ from desktop browsers:
1. **Mandatory BCP-47 Language Tag (`utterance.lang`)**:
   - On Android Chrome, assigning `utterance.voice = voice` is ignored by the underlying Android TTS service unless `utterance.lang` is also explicitly set to a valid BCP-47 tag matching the voice (e.g. `en-US`, converting underscore formatting like `en_US` to `en-US`). If omitted, Android always reverts to the system default voice.
2. **Duplicate Voice Names in Google TTS**:
   - Android's Google TTS engine exposes multiple voice variants under identical names (e.g., several voices labeled *"Google US English"* or *"English (United States)"*).
   - **Requirement**: Voice selections MUST be uniquely identified and matched using `voice.voiceURI || voice.name`, never solely `voice.name`.
3. **Dynamic Voice Invalidation (`voiceschanged`)**:
   - Android reloads voices asynchronously whenever audio focus shifts. Previous `SpeechSynthesisVoice` object references become stale.
   - **Requirement**: The player must run `resolveFreshVoice()` before calling `window.speechSynthesis.speak(utterance)` to bind to an active object reference from `window.speechSynthesis.getVoices()`.
4. **Resuming Paused Audio Contexts**:
   - On mobile browsers, entering background tabs or pausing can leave `speechSynthesis` in a paused state. Always verify `if (window.speechSynthesis.paused) window.speechSynthesis.resume()` before dispatching speech.

---

## 4. Lexical Engine & Concordance Specification

### 4.1 Noah Webster’s 1828 Dictionary
- Stored in `/server_data/webster1828.json` (approx. 65,000 definitions).
- Indexed in-memory by headword (normalized uppercase and lower-case lookup).
- Fallback stemming algorithm removes standard English inflections (`-s`, `-es`, `-ed`, `-ing`, `-eth`, `-est`, `-ly`) when looking up archaic Authorized Version verbs and adverbs.

### 4.2 Strong's Exhaustive Concordance
- Hebrew Lexicon: `/server_data/strongs_hebrew.json` (H1 to H8674).
- Greek Lexicon: `/server_data/strongs_greek.json` (G1 to G5624).
- Entries contain:
  - Strong's numeric identifier (prefixed with `H` or `G`).
  - Native script (Hebrew with vowel points / Greek with diacritics).
  - Transliteration and phonetic pronunciation guide.
  - Definition, original root derivation, and KJV translation occurrence counts.

### 4.3 Strong's Mobile & Responsive Index Navigation (Issue #3 Fix)

#### The Problem:
On desktop displays, `StrongsView.tsx` renders a dual-pane split layout: the A-Z English word index list on the left, and the detailed Strong's Hebrew/Greek root card on the right. Because the right detail pane previously used `hidden md:flex`, on mobile devices (Android/iOS phones with viewport width `< 768px`) the detail card was completely hidden from the DOM layout. When mobile users clicked any word or link in the index, state updated, but the screen appeared unresponsive because the detail panel was styled `hidden`.

#### The Authoritative Specification:
- Responsive dual-state rendering:
  - Desktop (`md:` and above): Side-by-side split pane (`md:flex` for both columns).
  - Mobile (`< md:`): Single active view controlled by `isMobileDetailOpen`.
    - When `isMobileDetailOpen === false`: The A-Z English word index occupies full viewport width.
    - When `isMobileDetailOpen === true`: The Strong's detail card occupies full viewport width, with an authoritative top navigation bar containing `Back to Word Index` and the active letter/search context.
  - Tapping any word in the index triggers `setSelectedWord(item.word)`, sets `isMobileDetailOpen(true)`, and scrolls the detail pane to top.
  - Changing search query or tapping alphabet index buttons automatically returns to the word index view (`setIsMobileDetailOpen(false)`).

### 4.4 Lemmatization & Morphological Root Mapping Engine (Issue #6 Fix)

#### The Problem:
Biblical inflections in Scripture (e.g. `snares` in Proverbs 22:5, `created`, `shined`, `thorns`) must map to their root dictionary headwords. An earlier naive suffix-stripper tested `w.slice(0, -2)` (`snar`) before `w.slice(0, -1)` (`snare`). Because `snar` was an obsolete headword in Webster 1828 (*"SN'AR, v.i. To snarl"*), `snares` was erroneously mapped to `snar` instead of `snare`. Furthermore, 3-letter proper biblical names like `Zer` or `Ner` were stripping `-er` down to 1-letter invalid stems.

#### The Authoritative Specification:
The lemmatizer in `server/dictionaryService.ts` (`generateLemmas`) enforces English morphological phonology:
1. **Plurals in `-es`**:
   - Words ending in sibilant stems (`-ch`, `-sh`, `-ss`, `-x`, `-z`): strip `-es` (e.g., `branches` $\rightarrow$ `branch`, `churches` $\rightarrow$ `church`, `boxes` $\rightarrow$ `box`, `glasses` $\rightarrow$ `glass`).
   - All non-sibilant words ending in `-es`: prioritize stripping `-s` first (e.g., `snares` $\rightarrow$ `snare`, `robes` $\rightarrow$ `robe`, `gates` $\rightarrow$ `gate`, `trees` $\rightarrow$ `tree`, `eyes` $\rightarrow$ `eye`, `flames` $\rightarrow$ `flame`, `cares` $\rightarrow$ `care`, `uses` $\rightarrow$ `use`).
2. **Past Tense and Participles in `-ed`**:
   - Prioritize verbs ending in silent -e: strip `-d` first (`created` $\rightarrow$ `create`, `snared` $\rightarrow$ `snare`, `hated` $\rightarrow$ `hate`, `hoped` $\rightarrow$ `hope`, `cared` $\rightarrow$ `care`, `shined` $\rightarrow$ `shine`).
   - Handle doubled consonants (`sinned` $\rightarrow$ `sin`, `stopped` $\rightarrow$ `stop`).
   - Strip `-ed` for base verbs (`walked` $\rightarrow$ `walk`, `severed` $\rightarrow$ `sever`, `mourned` $\rightarrow$ `mourn`).
3. **Present Participles in `-ing`**:
   - Prioritize verbs ending in silent -e (`coming` $\rightarrow$ `come`, `writing` $\rightarrow$ `write`, `hoping` $\rightarrow$ `hope`, `using` $\rightarrow$ `use`, `snaring` $\rightarrow$ `snare`).
   - Handle doubled consonants (`running` $\rightarrow$ `run`, `begging` $\rightarrow$ `beg`).
4. **Stem Length Protection**:
   - Candidates shorter than 2 characters (e.g. `Zer` $\rightarrow$ `z`) are strictly rejected.
5. **Proper Noun Transparency**:
   - When a word has no direct English 1828 definition (such as biblical proper names `David`, `Solomon`), the drawer provides transparent fallback linking directly to Strong's Concordance Hebrew/Greek entries and Scripture occurrences.

### 4.5 Webster 1828 Pronunciation Parsing Specification (Issue #7 Fix)

#### The Problem:
Early versions parsed pronunciation using `/<\/i>\s+([a-zA-Z'’\-]+)[\.,]/` across the entire entry HTML content. Because italic tags `<i>...</i>` are frequently used throughout definitions for cross-references, emphasis, and biblical quotes, the regex captured whatever arbitrary word followed the italic tag (e.g. `chosen` captured `generation` from `<p>Ye are a <i>chosen</i> generation...</p>`, `good` captured `claim`, `to` captured `from`, `be` captured `substantive`).

#### The Authoritative Specification:
The extractor in `server/dictionaryService.ts` (`extractPronunciation`) restricts extraction exclusively to the **entry header paragraph** (`<p><b>WORD</b>, <i>pos</i> ...</p>`):
1. **Header-Only Boundary**:
   - Only the first `<p>...</p>` is evaluated; definition body paragraphs, examples, and scripture citations are strictly ignored.
2. **Explicit Pronunciation Markers**:
   - Matches `Pronounced <word>` or `pron. <word>` (e.g. `aisle` $\rightarrow$ `"Ile"`).
   - Matches bracketed pronunciations: `[pron. ...]` or `[Fr. pron. ...]`.
3. **Phonetic Respellings Following Part of Speech**:
   - Matches lowercase phonetic respellings immediately following `<p><b>WORD</b>, <i>pos</i>...`:
     - Accented respellings containing Webster stress apostrophes: `a'bl`, `abolishun`, `abra'zhun`, `abrawd'`, `agenst'`.
     - Silent-letter reformed spellings with phonetic letter matching: `doubt` $\rightarrow$ `"dout"`, `feign` $\rightarrow$ `"fane"`, `guard` $\rightarrow$ `"gard"`, `gnome` $\rightarrow$ `"nome"`, `bright` $\rightarrow$ `"brite"`, `bread` $\rightarrow$ `"bred"`.
4. **Metadata & Definition Exclusion Filters**:
   - Excludes grammatical designations: `substantive`, `superlative`, `comparative`, `singular`, `plural`, `plur`, `preterit`.
   - Excludes one-word synonym definitions (`fitness`, `atheism`).
5. **Absence of Phonetic Respelling**:
   - Standard English words lacking a separate phonetic respelling in Webster 1828 (e.g., `chosen`, `be`, `to`, `good`) return an empty string (`""`), suppressing the `Pronunciation:` element from rendering in the UI.

---

## 5. Storage & Persistence Specification

All user data is stored strictly on the client side using `window.localStorage` under dedicated keys:

| LocalStorage Key | Type | Description |
|---|---|---|
| `classical_bible_settings` | `UserSettings` | Display theme, font sizes, speech rate, selected voice identifier, read-verse-numbers toggle. |
| `classical_bible_bookmarks` | `BookmarkItem[]` | User saved Scripture verses with timestamps and custom tags. |
| `classical_bible_notes` | `UserNote[]` | User written verse study notes and theological commentary. |
| `classical_bible_highlights`| `HighlightRecord[]` | Color-coded verse highlight references. |
| `classical_bible_history` | `HistoryEntry[]` | Chronological reading navigation breadcrumbs. |

---

## 6. Testing & Quality Assurance Checklist

Prior to releasing updates or commits, verify:
- [ ] **Proverbs 14:17**: Begins with *"He that is soon angry dealeth foolishly..."*
- [ ] **Proverbs 14:29**: Begins with *"He that is slow to wrath is of great understanding..."*
- [ ] **Proverbs 16:32**: Begins with *"He that is slow to anger is better than the mighty..."*
- [ ] **Proverbs 22:5 (Issue #6)**: Word `snares` maps to singular root `snare` (not obsolete `snar`).
- [ ] **Lemmatization (Issue #6)**: `created` maps to `create`, `shined` to `shine`, `robes` to `robe`, `thorns` to `thorn`.
- [ ] **Pronunciation (Issue #7)**: `chosen`, `be`, `to`, `good` have empty pronunciation fields (no definition text leakage).
- [ ] **Pronunciation (Issue #7)**: `able` yields `"a'bl"`, `abolition` yields `"abolishun"`, `aisle` yields `"Ile"`, `doubt` yields `"dout"`.
- [ ] **Supplied Italics**: Run `tsc --noEmit` and check that supplied word brackets `{...}` render with italic styling across all books.
- [ ] **Marginal Notes**: Ensure no leaked colons or tags appear in `cleanText` or audio playback.
- [ ] **Speech Synthesis**: Verify voice changes take effect on Android Chrome and voice selections persist after refresh.
- [ ] **Compilation**: Run `npm run lint` and `npm run build` with zero errors.
