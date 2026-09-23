import React, { useState } from 'react';
import {
  BookOpen,
  BookA,
  Scroll,
  Search,
  Volume2,
  Columns,
  Bookmark,
  Sliders,
  ArrowRight,
  HelpCircle,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  Layers,
  Compass,
  FileText,
  Lightbulb,
  ChevronRight,
  Library,
  Server,
  Terminal,
  Copy,
  Check,
  Github,
  Globe,
  GitBranch,
} from 'lucide-react';

interface AboutViewProps {
  onNavigateToBible: (bookId?: string, chapter?: number) => void;
  onNavigateToDictionary: (word?: string) => void;
  onNavigateToStrongs: (word?: string) => void;
  onToggleSplitView?: () => void;
  isSplitView?: boolean;
}

export const AboutView: React.FC<AboutViewProps> = ({
  onNavigateToBible,
  onNavigateToDictionary,
  onNavigateToStrongs,
  onToggleSplitView,
  isSplitView = false,
}) => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#faf8f5] text-stone-900 font-sans-ui selection:bg-amber-200">
      {/* Top Banner / Hero Header */}
      <section className="border-b border-stone-200/80 bg-gradient-to-b from-[#24211d] to-[#1c1a17] text-stone-100 py-12 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-950/80 border border-amber-500/30 text-amber-300 text-xs font-semibold tracking-wide shadow-xs">
            <Library className="w-3.5 h-3.5" />
            <span>Integrated Classical Bible Study Suite</span>
          </div>

          <h1 className="font-cinzel text-2xl sm:text-4xl font-bold tracking-tight text-stone-100 leading-tight">
            Scripture, Lexicon & Concordance
          </h1>

          <p className="text-stone-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-sans-ui">
            A scholarly environment bringing together the{' '}
            <strong className="text-amber-200 font-semibold">1611 King James Bible</strong>,{' '}
            <strong className="text-amber-200 font-semibold">Noah Webster's 1828 Dictionary</strong>, and{' '}
            <strong className="text-amber-200 font-semibold">James Strong's Hebrew & Greek Concordance</strong>{' '}
            into an interconnected, interactive platform.
          </p>

          {/* Quick Launch Buttons */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-2.5">
            <button
              onClick={() => onNavigateToBible('gn', 1)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs sm:text-sm font-semibold transition-all shadow-sm cursor-pointer hover:scale-102"
            >
              <BookOpen className="w-4 h-4" />
              <span>Read Scripture (Genesis 1)</span>
            </button>
            <button
              onClick={() => onNavigateToDictionary('grace')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-100 border border-stone-700 text-xs sm:text-sm font-semibold transition-all cursor-pointer hover:scale-102"
            >
              <BookA className="w-4 h-4 text-amber-300" />
              <span>1828 Dictionary ("Grace")</span>
            </button>
            <button
              onClick={() => onNavigateToStrongs('faith')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-100 border border-stone-700 text-xs sm:text-sm font-semibold transition-all cursor-pointer hover:scale-102"
            >
              <Scroll className="w-4 h-4 text-amber-300" />
              <span>Strong's ("Faith")</span>
            </button>
            <a
              href="https://github.com/justonemoreukfan/KJV-1828-Strongs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900/90 hover:bg-black text-stone-200 border border-stone-700 text-xs sm:text-sm font-semibold transition-all cursor-pointer hover:scale-102"
            >
              <Github className="w-4 h-4 text-stone-300" />
              <span>GitHub Repo</span>
              <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
            </a>
            <a
              href="https://kjv-bible-1828-webster-dictionary-strong-s.ai.studio/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-900/80 hover:bg-amber-800 text-amber-100 border border-amber-700/60 text-xs sm:text-sm font-semibold transition-all cursor-pointer hover:scale-102"
            >
              <Globe className="w-4 h-4 text-amber-300" />
              <span>Live Web Edition</span>
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
            </a>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-10 space-y-12">
        {/* SECTION 1: WHAT ALL THIS IS */}
        <section className="space-y-6">
          <div className="space-y-1">
            <div className="text-xs font-bold uppercase tracking-widest text-amber-900 flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-800" />
              <span>Foundational Elements</span>
            </div>
            <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-stone-900">
              What Is This Application?
            </h2>
            <p className="text-sm text-stone-600 leading-relaxed max-w-3xl">
              This application is designed for deep, contextual scripture study. Instead of consulting isolated books across separate websites, three historical reference works have been cross-indexed into a single real-time engine:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Pillar 1: KJV Bible */}
            <div className="p-6 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="font-cinzel text-base font-bold text-stone-900">
                  1. King James Bible (1611)
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed font-sans-ui">
                  The complete 66 books of the Old and New Testaments in the authoritative Authorized Version (Pure Cambridge Text). Preserves translator italics, marginal references, chapter summaries, and verse notations.
                </p>
              </div>
              <button
                onClick={() => onNavigateToBible('jn', 1)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 hover:text-amber-700 cursor-pointer pt-2 border-t border-stone-100"
              >
                <span>Read John 1</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Pillar 2: 1828 Webster */}
            <div className="p-6 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center">
                  <BookA className="w-5 h-5" />
                </div>
                <h3 className="font-cinzel text-base font-bold text-stone-900">
                  2. Webster's 1828 Dictionary
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed font-sans-ui">
                  Noah Webster's monumental <em>American Dictionary of the English Language</em>. Unlike modern secular dictionaries, Webster defined vocabulary through a Christian biblical worldview, utilizing Scripture citations to explain seventeenth- and nineteenth-century English meanings.
                </p>
              </div>
              <button
                onClick={() => onNavigateToDictionary('charity')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 hover:text-amber-700 cursor-pointer pt-2 border-t border-stone-100"
              >
                <span>Define "Charity" (1828)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Pillar 3: Strong's Concordance */}
            <div className="p-6 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center">
                  <Scroll className="w-5 h-5" />
                </div>
                <h3 className="font-cinzel text-base font-bold text-stone-900">
                  3. Strong's Concordance
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed font-sans-ui">
                  Dr. James Strong's exhaustive indexing of every biblical root. Connects English words to 8,674 Hebrew/Aramaic entries (H1–H8674) in the Old Testament and 5,624 Koine Greek entries (G1–G5624) in the New Testament with transliterations, pronunciations, and verse occurrences.
                </p>
              </div>
              <button
                onClick={() => onNavigateToStrongs('love')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 hover:text-amber-700 cursor-pointer pt-2 border-t border-stone-100"
              >
                <span>Examine "Love" Roots</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 2: HOW IT WORKS */}
        <section className="space-y-6">
          <div className="space-y-1">
            <div className="text-xs font-bold uppercase tracking-widest text-amber-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-800" />
              <span>The Interconnected Engine</span>
            </div>
            <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-stone-900">
              How the System Works
            </h2>
            <p className="text-sm text-stone-600 leading-relaxed max-w-3xl">
              Behind the reading interface is an interconnected indexing pipeline that processes Scripture words in real time:
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200/90 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-stone-900 font-cinzel">
                  <span className="w-6 h-6 rounded-full bg-amber-200 text-amber-950 text-xs flex items-center justify-center font-sans-ui font-bold">
                    1
                  </span>
                  <span>Interactive Scripture Tokenization</span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed pl-8">
                  Every verse in the Bible is parsed into distinct words. Clicking any word queries the server to instantly look up its 1828 Webster definition or its Hebrew and Greek roots.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-stone-900 font-cinzel">
                  <span className="w-6 h-6 rounded-full bg-amber-200 text-amber-950 text-xs flex items-center justify-center font-sans-ui font-bold">
                    2
                  </span>
                  <span>Cross-Dataset Verification</span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed pl-8">
                  The engine dynamically cross-checks both datasets. If an 1828 word appears in Strong's concordance, a direct bridge is provided. If a biblical word has no direct 1828 entry (such as proper names), the app displays related roots or Scripture occurrences rather than broken links.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-stone-900 font-cinzel">
                  <span className="w-6 h-6 rounded-full bg-amber-200 text-amber-950 text-xs flex items-center justify-center font-sans-ui font-bold">
                    3
                  </span>
                  <span>Testament-Sensitive Concordance</span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed pl-8">
                  When viewing a passage in Genesis, Old Testament Hebrew roots are prioritized. When reading Matthew or Romans, New Testament Greek entries are automatically highlighted, displaying the original scripts (e.g. בְּרֵאשִׁית, ἀγάπη).
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-stone-900 font-cinzel">
                  <span className="w-6 h-6 rounded-full bg-amber-200 text-amber-950 text-xs flex items-center justify-center font-sans-ui font-bold">
                    4
                  </span>
                  <span>Synchronized Speech Narration</span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed pl-8">
                  Integrated browser speech synthesis reads chapters verse-by-verse with visual highlighting and full playback speed, pitch, and voice customization.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: HOW TO USE IT */}
        <section className="space-y-6">
          <div className="space-y-1">
            <div className="text-xs font-bold uppercase tracking-widest text-amber-900 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-800" />
              <span>Step-by-Step User Guide</span>
            </div>
            <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-stone-900">
              How to Use This Study Suite
            </h2>
            <p className="text-sm text-stone-600 leading-relaxed max-w-3xl">
              Master the key workflows to get the most out of your Scripture study:
            </p>
          </div>

          <div className="space-y-4">
            {/* Guide Step 1 */}
            <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex flex-col sm:flex-row items-start gap-4">
              <div className="p-3 rounded-xl bg-stone-100 text-amber-900 shrink-0 font-cinzel font-bold text-base">
                Step 1
              </div>
              <div className="space-y-2 flex-1">
                <h3 className="font-cinzel text-base font-bold text-stone-900">
                  Read Scripture & Inspect Words
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Open the <strong className="text-stone-900">Scripture</strong> tab and navigate to any book or chapter using the selector at the top. Simply click on any word in the text. A side drawer will immediately appear with:
                </p>
                <ul className="text-xs text-stone-600 space-y-1 list-disc pl-4">
                  <li>In <strong>1828 Mode</strong>: The original Webster dictionary definition, pronunciation, etymology, and biblical citations.</li>
                  <li>In <strong>Strong's Mode</strong>: The Hebrew or Greek root lemma, transliteration, Strong's number (e.g. H7225, G26), and concordance count.</li>
                </ul>
                <div className="pt-2">
                  <button
                    onClick={() => onNavigateToBible('ps', 23)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold cursor-pointer"
                  >
                    <span>Try It: Read Psalm 23</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Guide Step 2 */}
            <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex flex-col sm:flex-row items-start gap-4">
              <div className="p-3 rounded-xl bg-stone-100 text-amber-900 shrink-0 font-cinzel font-bold text-base">
                Step 2
              </div>
              <div className="space-y-2 flex-1">
                <h3 className="font-cinzel text-base font-bold text-stone-900">
                  Browse the 1828 Webster Dictionary
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Switch to the <strong className="text-stone-900">1828 Dictionary</strong> tab in the navigation bar. You can:
                </p>
                <ul className="text-xs text-stone-600 space-y-1 list-disc pl-4">
                  <li>Browse words alphabetically (A–Z) across thousands of entries.</li>
                  <li>Search for any classical English term in the search box.</li>
                  <li>Listen to the definition read aloud with the speaker icon.</li>
                  <li>Click <strong>"Strong's Concordance"</strong> or <strong>"Find in Bible"</strong> to see how the word is used in Scripture.</li>
                </ul>
                <div className="pt-2">
                  <button
                    onClick={() => onNavigateToDictionary('atonement')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold cursor-pointer"
                  >
                    <span>Look up "Atonement" in 1828 Webster</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Guide Step 3 */}
            <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex flex-col sm:flex-row items-start gap-4">
              <div className="p-3 rounded-xl bg-stone-100 text-amber-900 shrink-0 font-cinzel font-bold text-base">
                Step 3
              </div>
              <div className="space-y-2 flex-1">
                <h3 className="font-cinzel text-base font-bold text-stone-900">
                  Explore Strong's Hebrew & Greek Roots
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Switch to the <strong className="text-stone-900">Strong's Concordance</strong> tab. Here you can explore:
                </p>
                <ul className="text-xs text-stone-600 space-y-1 list-disc pl-4">
                  <li>Over 10,000 English keywords mapped to their original biblical roots.</li>
                  <li>Toggle between <strong>Old Testament (Hebrew/Aramaic)</strong> and <strong>New Testament (Greek)</strong>.</li>
                  <li>Read the Strong's definition, derivation, and transliteration.</li>
                  <li>View every occurrence in Scripture and jump straight to that passage with one click.</li>
                </ul>
                <div className="pt-2">
                  <button
                    onClick={() => onNavigateToStrongs('peace')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold cursor-pointer"
                  >
                    <span>Explore "Peace" (Shalom / Eirene) in Strong's</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Guide Step 4 */}
            <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex flex-col sm:flex-row items-start gap-4">
              <div className="p-3 rounded-xl bg-stone-100 text-amber-900 shrink-0 font-cinzel font-bold text-base">
                Step 4
              </div>
              <div className="space-y-2 flex-1">
                <h3 className="font-cinzel text-base font-bold text-stone-900">
                  Use Side-by-Side Split Study View
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  On desktop or tablet screens, click the <strong className="text-stone-900">Split View</strong> button in the navigation bar. This places the King James Scripture text on the left and Noah Webster's 1828 Lexicon on the right side simultaneously, enabling seamless comparative reading.
                </p>
                {onToggleSplitView && (
                  <div className="pt-2">
                    <button
                      onClick={onToggleSplitView}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold cursor-pointer"
                    >
                      <Columns className="w-3.5 h-3.5 text-amber-300" />
                      <span>{isSplitView ? 'Exit Split View' : 'Launch Side-by-Side Split View'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Guide Step 5 */}
            <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex flex-col sm:flex-row items-start gap-4">
              <div className="p-3 rounded-xl bg-stone-100 text-amber-900 shrink-0 font-cinzel font-bold text-base">
                Step 5
              </div>
              <div className="space-y-2 flex-1">
                <h3 className="font-cinzel text-base font-bold text-stone-900">
                  Audio Read-Aloud, Search & Bookmarks
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Take advantage of the secondary study tools:
                </p>
                <ul className="text-xs text-stone-600 space-y-1 list-disc pl-4">
                  <li><strong>Read Aloud (Speaker Icon)</strong>: Listen to chapters read verse-by-verse with playback rate, pitch, and voice controls.</li>
                  <li><strong>Search (Magnifying Glass)</strong>: Concordance search across all 31,102 verses with testament and book filters.</li>
                  <li><strong>Bookmarks (Ribbon Icon)</strong>: Save your favorite verses, 1828 definitions, or Strong's entries with offline persistence.</li>
                  <li><strong>Settings (Sliders Icon)</strong>: Switch color themes (Paper, Parchment, Sepia, Night), font sizing, and verse vs. paragraph layout.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: FREQUENTLY ASKED QUESTIONS */}
        <section className="space-y-6">
          <div className="space-y-1">
            <div className="text-xs font-bold uppercase tracking-widest text-amber-900 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-800" />
              <span>Study Notes & Clarifications</span>
            </div>
            <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-stone-900">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {[
              {
                q: 'Why are some words displayed in italics in the King James text?',
                a: 'In the King James Bible, words printed in italics were supplied by the 1611 translators to ensure natural English grammatical sense where the original Hebrew or Greek manuscript implied the word but did not contain a formal literal equivalent. You can toggle italics on or off in the Settings menu.',
              },
              {
                q: "Why is Noah Webster's 1828 edition preferred over modern dictionaries?",
                a: "Noah Webster's 1828 American Dictionary was written at the historical intersection of classical English and Christian scholarship. Webster deliberately used biblical passages as illustrative examples for definitions. Modern dictionaries have evolved to reflect secular and colloquial modern usage, which frequently obscures the theological meaning intended in KJV English (such as 'charity', 'conversation', 'prevent', or 'peculiar').",
              },
              {
                q: "What do the Strong's numbers (like H7225 or G26) mean?",
                a: "In 1890, Dr. James Strong assigned a unique reference number to every distinct Hebrew/Aramaic root in the Old Testament (prefixed with 'H', from H1 to H8674) and every Greek root in the New Testament (prefixed with 'G', from G1 to G5624). This allows English readers without knowledge of Hebrew or Greek alphabets to identify the original root word, pronunciation, and cross-reference every passage where that root was translated.",
              },
              {
                q: 'Why do some words have no Strong\'s Concordance number?',
                a: 'Certain English words in the text were either supplied by the translators for grammatical flow (often indicated in italics), or function as common English articles/conjunctions without a dedicated Hebrew or Greek root in the manuscript.',
              },
              {
                q: 'Does this application save my bookmarks and preferences?',
                a: 'Yes. All bookmarks, recent reading locations, audio preferences, and theme settings are saved locally in your browser storage so your study session is preserved across reloads.',
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="border border-stone-200/90 rounded-xl bg-white overflow-hidden shadow-2xs"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left p-4.5 flex items-center justify-between gap-4 font-semibold text-sm text-stone-900 hover:bg-stone-50 transition-colors cursor-pointer"
                >
                  <span className="font-cinzel text-stone-800">{faq.q}</span>
                  <ChevronRight
                    className={`w-4 h-4 text-stone-400 shrink-0 transition-transform ${
                      activeFaq === idx ? 'rotate-90 text-amber-800' : ''
                    }`}
                  />
                </button>
                {activeFaq === idx && (
                  <div className="px-4.5 pb-4.5 pt-1 text-xs text-stone-600 leading-relaxed border-t border-stone-100 font-sans-ui">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 5: PROJECT REPOSITORY & PUBLISHED WEB EDITION */}
        <section className="space-y-6">
          <div className="space-y-1">
            <div className="text-xs font-bold uppercase tracking-widest text-amber-900 flex items-center gap-2">
              <Github className="w-4 h-4 text-amber-800" />
              <span>Open-Source Project & Online Access</span>
            </div>
            <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-stone-900">
              Project Repository & Published Online Edition
            </h2>
            <p className="text-sm text-stone-600 leading-relaxed max-w-3xl">
              This application is 100% open-source, free to study, share, and fork. The complete source code, issue tracker, release notes, and documentation are hosted on GitHub, and the live application is published on Google Cloud for instant web access.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* GitHub Card */}
            <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-amber-700/40 transition-colors">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-stone-900 text-white">
                      <Github className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-stone-900 text-sm">Official GitHub Repository</div>
                      <div className="text-[11px] text-stone-500 font-mono">justonemoreukfan/KJV-1828-Strongs</div>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Open Source
                  </span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  View the full codebase, review technical specifications, report bugs or suggest enhancements via GitHub Issues, and clone or fork the project.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-stone-100">
                <div className="flex items-center gap-2">
                  <a
                    href="https://github.com/justonemoreukfan/KJV-1828-Strongs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition-colors shadow-xs"
                  >
                    <span>Open GitHub Repository</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        'https://github.com/justonemoreukfan/KJV-1828-Strongs',
                        'github-link'
                      )
                    }
                    className="p-2 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-600 transition-colors cursor-pointer"
                    title="Copy GitHub URL"
                  >
                    {copiedCmd === 'github-link' ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <div className="text-[11px] font-mono text-stone-500 bg-stone-50 p-2 rounded-lg border border-stone-200/80 truncate">
                  git clone https://github.com/justonemoreukfan/KJV-1828-Strongs.git
                </div>
              </div>
            </div>

            {/* Published Google Cloud / Web App Card */}
            <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-amber-700/40 transition-colors">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-amber-800 text-white">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-stone-900 text-sm">Published Online Web Edition</div>
                      <div className="text-[11px] text-stone-500 font-mono">Google Cloud Platform / AI Studio</div>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    Live Web
                  </span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  The live, publicly accessible instance of this suite. Accessible from any modern browser on Android, iPhone, iPad, Mac, Linux, or PC with zero installation required.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-stone-100">
                <div className="flex items-center gap-2">
                  <a
                    href="https://kjv-bible-1828-webster-dictionary-strong-s.ai.studio/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-amber-800 hover:bg-amber-700 text-white text-xs font-semibold transition-colors shadow-xs"
                  >
                    <span>Open Published Web Page</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        'https://kjv-bible-1828-webster-dictionary-strong-s.ai.studio/',
                        'pub-link'
                      )
                    }
                    className="p-2 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-600 transition-colors cursor-pointer"
                    title="Copy Published Web Page URL"
                  >
                    {copiedCmd === 'pub-link' ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <div className="text-[11px] font-mono text-stone-500 bg-stone-50 p-2 rounded-lg border border-stone-200/80 truncate">
                  https://kjv-bible-1828-webster-dictionary-strong-s.ai.studio/
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 6: BACKEND ARCHITECTURE & RUNNING OUTSIDE AI STUDIO */}
        <section className="space-y-6">
          <div className="space-y-1">
            <div className="text-xs font-bold uppercase tracking-widest text-amber-900 flex items-center gap-2">
              <Server className="w-4 h-4 text-amber-800" />
              <span>Developer & Deployment Guide</span>
            </div>
            <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-stone-900">
              Backend Architecture & Running Outside This Environment
            </h2>
            <p className="text-sm text-stone-600 leading-relaxed max-w-3xl">
              This application is completely self-contained. It requires no external cloud database, no SQL service, and no third-party paid API keys. Everything runs locally on a standard Node.js server with high-performance in-memory search and JSON indexing.
            </p>
          </div>

          {/* Quick Specifications Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4.5 rounded-xl bg-white border border-stone-200/90 shadow-2xs space-y-1.5">
              <div className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-amber-800" />
                <span>Runtime Engine</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Node.js 18+ (or 20+ LTS recommended) / Bun / npm. Standard Express.js backend with Vite middleware in development and esbuild in production.
              </p>
            </div>

            <div className="p-4.5 rounded-xl bg-white border border-stone-200/90 shadow-2xs space-y-1.5">
              <div className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-amber-800" />
                <span>Memory & Datasets</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Loads <code className="text-amber-900 font-mono text-[11px]">server_data/</code> into memory: KJV Bible (31,102 verses), Webster 1828 (~40MB), and Strong's Hebrew & Greek. Requires ~250–500MB RAM.
              </p>
            </div>

            <div className="p-4.5 rounded-xl bg-white border border-stone-200/90 shadow-2xs space-y-1.5">
              <div className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-amber-800" />
                <span>Documentation File</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Step-by-step setup guides for Windows, Mac, Linux, and Docker are in <code className="text-amber-900 font-mono text-[11px]">INSTALL.md</code>. Complete API and architecture specs are in <code className="text-amber-900 font-mono text-[11px]">HELP.md</code>.
              </p>
            </div>
          </div>

          {/* Quick Command Snippets */}
          <div className="space-y-4">
            {/* Step 1: Install */}
            <div className="rounded-xl border border-stone-800 bg-[#1e1c19] text-stone-100 p-4 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs text-stone-400 font-mono">
                <span>1. Install dependencies:</span>
                <button
                  onClick={() => copyToClipboard('npm install', 'install')}
                  className="flex items-center gap-1 text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                >
                  {copiedCmd === 'install' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 text-[11px]">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span className="text-[11px]">Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="text-xs font-mono text-amber-200 bg-black/40 p-2.5 rounded-lg overflow-x-auto">
                npm install
              </pre>
            </div>

            {/* Step 2: Dev Mode */}
            <div className="rounded-xl border border-stone-800 bg-[#1e1c19] text-stone-100 p-4 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs text-stone-400 font-mono">
                <span>2. Start in Development mode (with live frontend compilation):</span>
                <button
                  onClick={() => copyToClipboard('npm run dev', 'dev')}
                  className="flex items-center gap-1 text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                >
                  {copiedCmd === 'dev' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 text-[11px]">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span className="text-[11px]">Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="text-xs font-mono text-amber-200 bg-black/40 p-2.5 rounded-lg overflow-x-auto">
                npm run dev
              </pre>
              <div className="text-[11px] text-stone-400">
                Then open your browser to <strong className="text-stone-200">http://localhost:3000</strong>.
              </div>
            </div>

            {/* Step 3: Production Build & Run */}
            <div className="rounded-xl border border-stone-800 bg-[#1e1c19] text-stone-100 p-4 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs text-stone-400 font-mono">
                <span>3. Build and run in Production mode:</span>
                <button
                  onClick={() => copyToClipboard('npm run build && npm start', 'prod')}
                  className="flex items-center gap-1 text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                >
                  {copiedCmd === 'prod' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 text-[11px]">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span className="text-[11px]">Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="text-xs font-mono text-amber-200 bg-black/40 p-2.5 rounded-lg overflow-x-auto">
                npm run build && npm start
              </pre>
              <div className="text-[11px] text-stone-400">
                This compiles Vite assets into <code className="text-amber-300">dist/</code> and bundles the server into <code className="text-amber-300">dist/server.cjs</code>, serving at <strong className="text-stone-200">http://0.0.0.0:3000</strong>.
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 6: FOOTER QUOTE */}
        <section className="pt-8 border-t border-stone-200/80 text-center space-y-3">
          <blockquote className="font-serif italic text-sm text-stone-600 max-w-xl mx-auto">
            "Thy word is a lamp unto my feet, and a light unto my path."
          </blockquote>
          <p className="font-cinzel text-xs font-bold text-amber-900 tracking-wider">
            Psalm 119:105
          </p>
          <div className="pt-4 flex justify-center gap-3">
            <button
              onClick={() => onNavigateToBible('gn', 1)}
              className="px-4 py-2 rounded-xl bg-amber-800 hover:bg-amber-700 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Start Reading Scripture
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
