import React from 'react';
import { motion } from 'motion/react';
import { X, Sliders, Type, Palette, AlignLeft, Eye, Volume2, BookA, Scroll, Columns, HelpCircle } from 'lucide-react';
import { ReadingSettings, BibleMode } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ReadingSettings;
  onUpdateSettings: (newSettings: Partial<ReadingSettings>) => void;
  onOpenAbout?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onOpenAbout,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans-ui">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white text-stone-900 w-full max-w-md rounded-2xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 bg-stone-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-900">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-cinzel text-base font-bold text-stone-900">
                Reading & Audio Settings
              </h2>
              <p className="text-xs text-stone-500">
                Customize appearance, typography, and playback
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-800 hover:bg-stone-200/60 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Bible Study Mode */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5 mb-2.5">
              <BookA className="w-3.5 h-3.5" />
              <span>Scripture Interactive Study Mode</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => onUpdateSettings({ bibleMode: '1828' })}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  settings.bibleMode === '1828'
                    ? 'bg-amber-50 border-amber-600 text-amber-950 font-bold ring-1 ring-amber-500'
                    : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                <BookA className="w-4 h-4 text-amber-800" />
                <span className="text-xs font-semibold">1828 Webster</span>
              </button>

              <button
                onClick={() => onUpdateSettings({ bibleMode: 'strongs' })}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  settings.bibleMode === 'strongs'
                    ? 'bg-amber-50 border-amber-600 text-amber-950 font-bold ring-1 ring-amber-500'
                    : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                <Scroll className="w-4 h-4 text-amber-800" />
                <span className="text-xs font-semibold">Strong's Concordance</span>
              </button>

              <button
                onClick={() => onUpdateSettings({ bibleMode: 'parallel' })}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  settings.bibleMode === 'parallel'
                    ? 'bg-amber-50 border-amber-600 text-amber-950 font-bold ring-1 ring-amber-500'
                    : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                <Columns className="w-4 h-4 text-amber-800" />
                <span className="text-xs font-semibold">Dual Parallel</span>
              </button>
            </div>
            <p className="text-[11px] text-stone-500 mt-1.5">
              Determines whether clicking words opens Noah Webster's 1828 American Dictionary, Strong's original Hebrew/Greek roots, or displays both side-by-side.
            </p>
          </div>

          {/* Theme */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5 mb-2.5">
              <Palette className="w-3.5 h-3.5" />
              <span>Color Theme</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'paper', label: 'Paper', bg: 'bg-[#fbf8f2]', border: 'border-[#e7e0d4]', text: 'text-stone-900' },
                { id: 'light', label: 'Light', bg: 'bg-white', border: 'border-slate-300', text: 'text-slate-900' },
                { id: 'sepia', label: 'Sepia', bg: 'bg-[#f4ecd8]', border: 'border-[#dfd3b8]', text: 'text-[#3b2d1d]' },
                { id: 'dark', label: 'Dark', bg: 'bg-[#12141a]', border: 'border-[#262a36]', text: 'text-stone-100' },
              ].map((th) => (
                <button
                  key={th.id}
                  onClick={() => onUpdateSettings({ theme: th.id as any })}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    th.bg
                  } ${th.border} ${th.text} ${
                    settings.theme === th.id
                      ? 'ring-2 ring-amber-600 shadow-sm scale-102'
                      : 'hover:border-stone-400 opacity-90'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full border border-current opacity-60" />
                  <span>{th.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5 mb-2.5">
              <Type className="w-3.5 h-3.5" />
              <span>Scripture Font Size</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'sm', label: 'Small', sample: '16px' },
                { id: 'md', label: 'Regular', sample: '18px' },
                { id: 'lg', label: 'Large', sample: '21px' },
                { id: 'xl', label: 'XL', sample: '24px' },
              ].map((sz) => (
                <button
                  key={sz.id}
                  onClick={() => onUpdateSettings({ fontSize: sz.id as any })}
                  className={`py-2 px-1 rounded-xl border text-xs font-semibold flex flex-col items-center transition-all cursor-pointer ${
                    settings.fontSize === sz.id
                      ? 'bg-amber-800 text-white border-amber-800 shadow-xs'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  <span>{sz.label}</span>
                  <span className="text-[10px] opacity-70">{sz.sample}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Font Family */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5 mb-2.5">
              <Type className="w-3.5 h-3.5" />
              <span>Typeface Family</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onUpdateSettings({ fontFamily: 'serif' })}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  settings.fontFamily === 'serif'
                    ? 'bg-amber-50 border-amber-600 text-amber-950 font-bold ring-1 ring-amber-500'
                    : 'bg-stone-50 border-stone-200 text-stone-800 hover:bg-stone-100'
                }`}
              >
                <div className="font-garamond text-base">EB Garamond</div>
                <div className="text-[11px] text-stone-500 font-sans-ui">Traditional Bible Serif</div>
              </button>

              <button
                onClick={() => onUpdateSettings({ fontFamily: 'sans' })}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  settings.fontFamily === 'sans'
                    ? 'bg-amber-50 border-amber-600 text-amber-950 font-bold ring-1 ring-amber-500'
                    : 'bg-stone-50 border-stone-200 text-stone-800 hover:bg-stone-100'
                }`}
              >
                <div className="font-sans-ui text-sm font-semibold">Plus Jakarta Sans</div>
                <div className="text-[11px] text-stone-500 font-sans-ui">Clean Modern Sans</div>
              </button>
            </div>
          </div>

          {/* Layout Format */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5 mb-2.5">
              <AlignLeft className="w-3.5 h-3.5" />
              <span>Layout Arrangement</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onUpdateSettings({ layout: 'verse' })}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  settings.layout === 'verse'
                    ? 'bg-amber-800 text-white border-amber-800'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <span>Verse-by-Verse</span>
              </button>

              <button
                onClick={() => onUpdateSettings({ layout: 'paragraph' })}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  settings.layout === 'paragraph'
                    ? 'bg-amber-800 text-white border-amber-800'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <span>Paragraph Flow</span>
              </button>
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-3 pt-2 border-t border-stone-200 text-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-xs text-stone-800">
                  Show Translators' Italics
                </div>
                <div className="text-[11px] text-stone-500">
                  Words added by KJV translators for English readability
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.showItalics}
                onChange={(e) => onUpdateSettings({ showItalics: e.target.checked })}
                className="w-4 h-4 text-amber-700 rounded accent-amber-700 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-xs text-stone-800">
                  Read Verse Numbers in Audio
                </div>
                <div className="text-[11px] text-stone-500">
                  Spoken voice announces "Verse 1...", "Verse 2..." before each verse
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.readVerseNumbers}
                onChange={(e) => onUpdateSettings({ readVerseNumbers: e.target.checked })}
                className="w-4 h-4 text-amber-700 rounded accent-amber-700 cursor-pointer"
              />
            </div>

            {/* About & Guide Link */}
            {onOpenAbout && (
              <div className="pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAbout();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-amber-50 hover:bg-amber-100/80 border border-amber-200 text-amber-950 transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-amber-200/80 text-amber-900">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-amber-950 font-cinzel">
                        About & User Study Guide
                      </div>
                      <div className="text-[11px] text-stone-600">
                        Learn how KJV, 1828 Webster & Strong's work together
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-amber-800 shrink-0">Open →</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Save & Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};
