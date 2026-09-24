# KJV Archaic & Orthographic Normalization — Rollback & Reference Guide

This document records the exact changes made to **`server/dictionaryService.ts`** regarding the *"Expanded KJV Archaic & Orthographic Normalization"* introduced during the investigation of **Issue #5**.

---

## 1. Quick Rollback (Single-Line Switch)

If you ever wish to disable this feature and return strictly to the original baseline lookup behavior, open **`server/dictionaryService.ts`** and change line 32:

```typescript
// server/dictionaryService.ts
export const ENABLE_EXTENDED_KJV_NORMALIZATION = false; // <-- Change true to false
```

Then restart the development server. All extended normalization rules will immediately shut off, reverting to the strict baseline lookup behavior.

---

## 2. Key Distinction: Dataset Recovery vs. Runtime Normalization

It is critical to distinguish between the two separate actions taken:

### Part A: Dataset Recovery (`server_data/webster1828.json`) — **Permanent 1828 Data**
- **What it is:** Authentic Noah Webster 1828 headwords from the 1828 publication (including **`meet`**, **`meek`**, **`meekness`**, **`plain`**, **`meat`**, **`lamb`**, **`arm`**, **`leave`**).
- **Why it was needed:** The original digitizer's export script inadvertently omitted 1,997 entries due to a web-scraper artifact in the header column. These entries were recovered directly from the raw database export.
- **Rollback impact:** Rolling back the normalization flag in `dictionaryService.ts` does **NOT** remove these words. `meet` and other base words remain genuine Webster 1828 entries in the dictionary.

### Part B: Runtime Normalization (`server/dictionaryService.ts`) — **Subject of This Note**
- **What it is:** Runtime morphological lemmatization and mapping rules to bridge KJV spelling/inflections to 1828 Webster headwords when clicking words in the Bible reader.
- **Controlled by:** `ENABLE_EXTENDED_KJV_NORMALIZATION` in `server/dictionaryService.ts`.

---

## 3. What Was Added in Extended Normalization

When `ENABLE_EXTENDED_KJV_NORMALIZATION = true`, the following two extensions are active:

### A. Extended Archaic & Irregular Word Mapping (`EXTENDED_ARCHAIC_MAP`)
Webster 1828 standardized American spelling and listed verbs under their present infinitive. In the KJV text, irregular biblical forms and archaic spellings occur:

| KJV Word in Bible | Maps to 1828 Webster Headword | Reason |
|:---|:---|:---|
| `woe` | `wo` | Webster 1828 lists the entry under `WO` (*"Grief; sorrow; misery..."*) |
| `dwelt` | `dwell` | Irregular past tense; Webster defines under root verb `DWELL` |
| `known` | `know` | Past participle; Webster defines under `KNOW` |
| `began` | `begin` | Past tense; Webster defines under `BEGIN` |
| `drew` | `draw` | Past tense; Webster defines under `DRAW` |
| `dealt` | `deal` | Past tense; Webster defines under `DEAL` |
| `graven` | `grave` | Archaic participle; Webster defines under `GRAVE` |
| `oxen` | `ox` | Irregular plural; Webster defines under `OX` |
| `asses` | `ass` | Plural; Webster defines under `ASS` |
| `horsemen` | `horseman` | Compound plural; Webster defines under `HORSEMAN` |
| `yourselves` | `yourself` | Compound plural; Webster defines under `YOURSELF` |
| `themselves` | `themself` | Compound plural |
| `himself` | `himself` | Compound pronoun |
| `subtil` | `subtil` | Archaic variant |
| `sope` | `sope` | Archaic variant |
| `nought` | `nought` | Archaic variant |
| `olivet` | `olive` | Mount of Olives reference |
| `enquire` | `inquire` | Archaic variant |
| `enquiry` | `inquiry` | Archaic variant |
| `fain` | `fain` | Archaic word |
| `privily` | `privy` | Archaic adverb |
| `unawares` | `unaware` | Archaic adverb |
| `dost` | `do` | 2nd person singular verb |
| `couldst` | `can` | Archaic modal |
| `mightest` | `may` | Archaic modal |

### B. Orthographic Normalization in Lemmatizer (`generateLemmas`)
Noah Webster's 1828 dictionary is historically famous for reforming British English orthography into American English:
1. **`-our` $\rightarrow$ `-or`:** KJV spellings like *honour*, *labour*, *favour*, *savour*, *succour*, *clamour*, *vigour*, *vapour*, *splendour*, *odour*, *neighbour*, *harbour* map to Webster's reformed 1828 entries (*honor*, *labor*, *favor*, *savor*, *succor*, *neighbor*, etc.).
2. **`-re` $\rightarrow$ `-er`:** KJV spellings like *sepulchre*, *centre* map to Webster's 1828 entries (*sepulcher*, *center*).
3. **`-selves` $\rightarrow$ `-self`:** e.g., *yourselves* $\rightarrow$ *yourself*.
4. **`-ied` $\rightarrow$ `-y`:** e.g., *carried* $\rightarrow$ *carry*, *buried* $\rightarrow$ *bury*, *multiplied* $\rightarrow$ *multiply*.
5. **`-ily` $\rightarrow$ `-y`:** e.g., *mightily* $\rightarrow$ *mighty*.

---

## 4. What Happens if You Disable It (`ENABLE_EXTENDED_KJV_NORMALIZATION = false`)

If set to `false`:
1. Clicking words like `meet`, `meek`, `plain`, `meat`, `arm`, `lamb`, `faith`, `grace`, etc. will **still work perfectly** because they are in the dictionary data file.
2. Clicking a British-spelled word in the KJV like `honour` or `labour` will **not** automatically redirect to Webster's `honor` or `labor`. Instead, the dictionary will show suggestions (`honor`, etc.) or indicate not found.
3. Clicking irregular biblical past-tense forms like `dwelt` or `drew` will **not** automatically redirect to `dwell` or `draw`.
4. The system will use only the original 35 `BASELINE_ARCHAIC_MAP` items (`saith`, `spake`, `hath`, `doth`, `didst`, `hadst`, `wast`, `wert`, `art`, `shalt`, `wilt`, `canst`, `mayest`, `begat`, `smote`, `brake`, `bare`, `sware`, `thou`, `thee`, `thy`, `thine`, `ye`, `whosoever`, `whence`, `wherefore`, `thither`, `hither`, `anon`, `wot`, `wist`, `shew`, `shewed`, `sheweth`, `clave`, `stank`, `durst`, `lest`, `forasmuch`, `howbeit`, `cherubims`, `seraphims`).

---

## 5. Issue #6 Root Mapping Corrections (Plurals & Inflections)

In resolving Issue #6 (*"Words need to be mapped to the root words. In Proverbs 22:5 the word snares is liking to snar"*):
- Previously, the lemmatizer candidate order for words ending in `-es` tested `w.slice(0, -2)` (`snar`) before `w.slice(0, -1)` (`snare`). Because `snar` exists as an obsolete headword in Webster 1828 (*"SN'AR, v.i. To snarl [Not in use.]"*), `snares` was mistakenly linking to `snar`.
- **Linguistic Correction Applied:**
  - Words ending in sibilants (`-ch`, `-sh`, `-ss`, `-x`, `-z`): strip `-es` (e.g., `branches` $\rightarrow$ `branch`, `churches` $\rightarrow$ `church`, `boxes` $\rightarrow$ `box`, `glasses` $\rightarrow$ `glass`).
  - All non-sibilant words ending in `-es`: strip `-s` first (e.g., `snares` $\rightarrow$ `snare`, `robes` $\rightarrow$ `robe`, `gates` $\rightarrow$ `gate`, `trees` $\rightarrow$ `tree`, `eyes` $\rightarrow$ `eye`, `flames` $\rightarrow$ `flame`, `cares` $\rightarrow$ `care`, `uses` $\rightarrow$ `use`).
  - Words ending in `-ed`: strip `-d` first to reach root verbs ending in silent -e (`created` $\rightarrow$ `create`, `snared` $\rightarrow$ `snare`, `hated` $\rightarrow$ `hate`, `hoped` $\rightarrow$ `hope`, `cared` $\rightarrow$ `care`, `shined` $\rightarrow$ `shine`), while properly handling doubled consonants (`sinned` $\rightarrow$ `sin`, `stopped` $\rightarrow$ `stop`) and verbs ending in -ed (`walked` $\rightarrow$ `walk`, `severed` $\rightarrow$ `sever`, `mourned` $\rightarrow$ `mourn`).
  - Participles in `-ing`: properly prioritize base verbs ending in silent -e (`coming` $\rightarrow$ `come`, `writing` $\rightarrow$ `write`, `hoping` $\rightarrow$ `hope`, `using` $\rightarrow$ `use`, `snaring` $\rightarrow$ `snare`) and doubled consonants (`running` $\rightarrow$ `run`, `begging` $\rightarrow$ `beg`).
  - Candidate validation: stems shorter than 2 characters or single letters (such as 3-letter proper names like `Zer` or `Ner` reducing to `z` or `n`) are strictly rejected.
  - UI transparency: when a word has no direct 1828 entry (such as Biblical proper names `David`, `Solomon`), the drawer clearly indicates this and provides direct access to its Strong's Concordance Hebrew/Greek entries and Scripture occurrences.

---

## 6. Issue #7 Webster 1828 Pronunciation Parsing Fix

In resolving Issue #7 (*"Pronunciations are incorrect for words in the 1828 dictionary. Some examples of this are the words: chosen, be, to, and good. The Pronunciation seems to be for a word that is in the definition"*):
- **Root Cause Discovered:**
  - In `server/dictionaryService.ts`, pronunciation was parsed using:
    `const pronMatch = content.match(/<\/i>\s+([a-zA-Z'’\-]+)[\.,]/);`
  - This regex searched across the **entire HTML body** of the definition without restricting to the entry header. Whenever an italicized word appeared in a definition sentence or Bible verse quote (e.g., `Ye are a <i>chosen</i> generation.`, `opposed <i>to</i> from`, `as a <i>good</i> claim`, `or <i>be</i> fixed`), the regex captured the subsequent word as the entry's pronunciation!
  - Over 8,800 entries were exhibiting random definition words as their pronunciation (e.g., `chosen` $\rightarrow$ `"generation"`, `be` $\rightarrow$ `"substantive"`, `to` $\rightarrow$ `"from"`, `good` $\rightarrow$ `"claim"`, `about` $\rightarrow$ `"ship"`, `abate` $\rightarrow$ `"courage"`, `above` $\rightarrow$ `"rubies"`).
- **Linguistic Correction Applied:**
  - Pronunciation extraction is now strictly scoped to the entry's **header paragraph** (`<p><b>WORD</b>, <i>pos</i> ...</p>`).
  - Supports genuine Webster 1828 phonetic respellings:
    1. Explicit pronunciation phrases: `Pronounced <word>` or `pron. <word>` (e.g., `aisle` $\rightarrow$ `"Ile"`).
    2. Bracketed pronunciations: `[pron. ...]` or `[Fr. pron. ...]`.
    3. Syllabified and accented respellings: words containing Webster stress apostrophes immediately following the part of speech (e.g., `able` $\rightarrow$ `"a'bl"`, `abolition` $\rightarrow$ `"abolishun"`, `abrasion` $\rightarrow$ `"abra'zhun"`, `against` $\rightarrow$ `"agenst'"`).
    4. Silent-letter reformed spellings with phonetic match (e.g., `gnome` $\rightarrow$ `"nome"`, `doubt` $\rightarrow$ `"dout"`, `feign` $\rightarrow$ `"fane"`, `guard` $\rightarrow$ `"gard"`, `bread` $\rightarrow$ `"bred"`).
  - Filters out grammatical notes (`substantive`, `superlative`, `preterit`, `singular`, `plural`, `plur`) and one-word definitions/synonyms (`fitness`, `atheism`).
  - For standard words with no phonetic respelling in Webster's 1828 dictionary (such as `chosen`, `be`, `to`, `good`), `pronunciation` is empty and no erroneous pronunciation line is displayed in the UI.

---

## 7. Summary

The feature remains fully active by default (`ENABLE_EXTENDED_KJV_NORMALIZATION = true`) to provide readers with seamless lookup from KJV text into 1828 Webster definitions. Should you decide you prefer strict, verbatim-only lookups without orthographic expansion, simply toggle `ENABLE_EXTENDED_KJV_NORMALIZATION` to `false` in `server/dictionaryService.ts`.
