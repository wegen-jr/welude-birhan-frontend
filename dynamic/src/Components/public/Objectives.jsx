import React from 'react';
import { useLanguage } from '../../Contexts/LanguageContext';
import {
  Eye,
  Compass,
  ShieldCheck,
  Target,
  ListChecks,
  Quote,
} from 'lucide-react';

/* =========================================================================
   OBJECT-BASED SECTION BLUEPRINT (Kept inside this single file)
   ========================================================================= */
const SECTION_DEFINITIONS = [
  {
    id: 'vision',
    dataKey: 'vision',
    type: 'text',
    icon: Eye,
    title: {
      am: 'ራዕይ',
      en: 'Vision',
    },
  },
  {
    id: 'mission',
    dataKey: 'mission',
    type: 'text',
    icon: Compass,
    title: {
      am: 'ተልዕኮ',
      en: 'Mission',
    },
  },
  {
    id: 'motto',
    dataKey: 'motto',
    altKey: 'moto', // Handles the "moto" spelling in your language file
    type: 'quote',
    icon: Quote,
    title: {
      am: 'መሪ ቃል',
      en: 'Motto',
    },
  },
  {
    id: 'coreValues',
    dataKey: 'coreValues',
    type: 'list',
    icon: ShieldCheck,
    title: {
      am: 'ዋና እሴቶች',
      en: 'Core Values',
    },
  },
  {
    id: 'goals',
    dataKey: 'goals',
    type: 'list',
    icon: Target,
    title: {
      am: 'ስትራቴጂካዊ ግቦች',
      en: 'Strategic Goals',
    },
  },
  {
    id: 'objectives',
    dataKey: 'objectives',
    type: 'list',
    icon: ListChecks,
    title: {
      am: 'ዋና ዓላማዎች',
      en: 'Objectives',
    },
  },
];

/* =========================================================================
   COMPONENT
   ========================================================================= */
export default function Objectives() {
  const { t, language = 'am' } = useLanguage();
  const objectivesData = t?.objectives || {};

  // Formats title based on the active language with bilingual subtitle
  const formatTitle = (titleObj) => {
    if (!titleObj) return '';
    return language === 'am'
      ? `${titleObj.am} (${titleObj.en})`
      : `${titleObj.en} (${titleObj.am})`;
  };

  // Safely extracts data from t.objectives using primary and fallback keys
  const getSectionContent = (item) => {
    return (
      objectivesData[item.dataKey] ??
      (item.altKey ? objectivesData[item.altKey] : null) ??
      (item.type === 'list' ? [] : '')
    );
  };

  return (
    <div className="min-h-screen bg-[#081226] text-slate-100 p-6 sm:p-10">
      <div className="max-w-7xl mx-auto">

        {/* Dynamic Header */}
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-10 text-amber-400 capitalize font-serif tracking-tight">
          {objectivesData.title || (language === 'am' ? 'ዓላማዎችና መርሆዎች' : 'Our Objectives & Principles')}
        </h1>

        {/* Dynamic Card Grid derived from the Object Schema */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {SECTION_DEFINITIONS.map((section) => {
            const Icon = section.icon;
            const content = getSectionContent(section);
            const isList = section.type === 'list' && Array.isArray(content);
            const isQuote = section.type === 'quote';

            return (
              <div
                key={section.id}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between border border-slate-100"
              >
                <div>
                  {/* Card Header with Icon and Dynamic Title */}
                  <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 font-serif">
                      {formatTitle(section.title)}
                    </h2>
                  </div>

                  {/* Quote Style (Motto) */}
                  {isQuote && content && (
                    <blockquote className="p-4 rounded-xl bg-amber-50 border-l-4 border-amber-500 text-amber-950 font-serif italic text-sm leading-relaxed">
                      "{content}"
                    </blockquote>
                  )}

                  {/* Standard Text (Vision, Mission) */}
                  {section.type === 'text' && content && (
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {content}
                    </p>
                  )}

                  {/* List Style (Core Values, Goals, Objectives) */}
                  {isList && (
                    <ul className="space-y-2 text-sm text-slate-600">
                      {content.map((item, idx) => (
                        <li key={`${section.id}-${idx}`} className="flex items-start gap-2.5">
                          <span className="text-amber-500 font-bold text-base leading-none">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Subtle Decorative Footer */}
                <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-400">
                  <span>Sunday School</span>
                  <span className="text-amber-500 font-bold">✝</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}