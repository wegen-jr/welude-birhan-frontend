import React, { useState } from 'react';
import { useCms } from '../../Contexts/CmsContext.jsx';
import logo from '../../assets/logo.png';
import {
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  BookOpen,
  GraduationCap,
  Music,
  ArrowRight,
  PlusCircle,
} from 'lucide-react';

/* =========================================================================
   1. STATIC CONTENT & LOCALIZATION OBJECT
   ========================================================================= */
export const HOME_CONFIG = {
  hero: {
    badge: {
      am: 'ደቀ መዛሙርት',
      en: 'Children of Light',
    },
    institutionHeader: {
      am: 'የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተክርስቲያን ሰንበት ትምህርት ቤት',
      en: 'ETHIOPIAN ORTHODOX TEWAHEDO CHURCH SUNDAY SCHOOL',
    },
    title: {
      am: 'ወሉደ ብርሃን',
      en: 'Welude Birhan',
    },
    subtitle: {
      am: 'የቅድስት ሥላሴ ሰንበት ትምህርት ቤት',
      en: 'Holy Trinity Sunday School',
    },
    location: {
      am: 'በድሬዳዋ ቅድስት ሥላሴ ካቴድራል፣ ኢትዮጵያ',
      en: 'Holy Trinity Cathedral, Dire Dawa, Ethiopia',
    },
    description: {
      am: 'ቀጣዩን ትውልድ በጥንታዊቷ፣ ሕያው በሆነችው እምነት፣ በቅዱስ ቅዳሴ እና በኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተክርስቲያን ሐዋርያዊ ትውፊት ማነፅ።',
      en: 'Nurturing the next generation in the ancient, living faith, holy liturgy, and sacred apostolic tradition of the Ethiopian Orthodox Tewahedo Church.',
    },
    cta: {
      programs: {
        am: 'የትምህርት መርሃ ግብሮቻችን',
        en: 'Our Programs',
        targetId: 'programs',
      },
      about: {
        am: 'ስለ እኛ እና 4ቱ ምሰሶዎች',
        en: 'About & Pillars',
        targetId: 'about-pillars',
      },
    },
  },
  eventsSection: {
    sectionTag: {
      am: 'የቀጥታ ዜናዎችና በዓላት',
      en: 'Live Drop Zone',
    },
    heading: {
      am: 'መጪ ክስተቶች እና ማስታወቂያዎች',
      en: 'Upcoming Events & Notices',
    },
    subheading: {
      am: 'በድሬዳዋ ቅድስት ሥላሴ ካቴድራል የሚዘጋጁ መንፈሳዊ በዓላት፣ የዝማሬና የስነ-ጽሑፍ ጉባኤያት ቀጥታ መረጃ።',
      en: 'Liturgy schedules, feast celebrations, and Sunday school activities updated directly from the coordinator desk.',
    },
    emptyState: {
      title: {
        am: 'በአሁኑ ጊዜ የታተመ ክስተት የለም',
        en: 'No Upcoming Events Scheduled',
      },
      description: {
        am: 'በዚህ ዘርፍ የተመዘገበ ዝግጅት የለም። አዳዲስ ማስታወቂያዎች በአስተዳዳሪው ዴስክ ሲለቀቁ በቀጥታ እዚህ ይታያሉ።',
        en: 'There are currently no events marked as published. Coordinators can publish feasts and announcements immediately via the CMS.',
      },
      actionBtn: {
        am: 'የአስተዳዳሪ መግቢያ',
        en: 'Coordinator Portal Sign In',
      },
    },
    cardLabels: {
      churchLocation: 'Holy Trinity Cathedral',
      subCategory: 'Dire Dawa SS',
      viewDetails: {
        am: 'ሙሉ ዝርዝር',
        en: 'View Details',
      },
      closeModal: {
        am: 'ዝጋ',
        en: 'Close Details',
      },
    },
  },
};

/* =========================================================================
   2. METRICS CONFIGURATION OBJECT
   ========================================================================= */
export const METRIC_CONFIGS = [
  {
    key: 'studentsCount',
    fallback: '200+',
    label: {
      am: 'ተማሪዎች (Students)',
      en: 'Students',
    },
  },
  {
    key: 'teachersCount',
    fallback: '15+',
    label: {
      am: 'መምህራን (Teachers)',
      en: 'Teachers',
    },
  },
  {
    key: 'yearsOfService',
    fallback: '10+',
    label: {
      am: 'የአገልግሎት ዓመታት',
      en: 'Years of Service',
    },
  },
  {
    key: 'ageDivisionsCount',
    fallback: '4',
    label: {
      am: 'የዕድሜ ክፍሎች',
      en: 'Age Divisions',
    },
  },
];

/* =========================================================================
   3. CATEGORY BADGE & FILTER CONFIGURATIONS
   ========================================================================= */
export const CATEGORY_BADGES = {
  'Spiritual Feast': {
    bg: 'bg-amber-100 text-amber-900 border-amber-300',
    icon: Sparkles,
    label: { am: 'መንፈሳዊ በዓል', en: 'Spiritual Feast' },
  },
  Academic: {
    bg: 'bg-blue-100 text-blue-900 border-blue-300',
    icon: GraduationCap,
    label: { am: 'አካዳሚክ', en: 'Academic' },
  },
  Mezmur: {
    bg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    icon: Music,
    label: { am: 'ዝማሬ', en: 'Mezmur' },
  },
  General: {
    bg: 'bg-purple-100 text-purple-900 border-purple-300',
    icon: BookOpen,
    label: { am: 'አጠቃላይ', en: 'General' },
  },
};

export const EVENT_FILTER_TABS = [
  { id: 'ALL', label: { am: 'ሁሉም (All)', en: 'All' } },
  { id: 'Spiritual Feast', label: { am: 'መንፈሳዊ በዓል', en: 'Spiritual Feast' } },
  { id: 'Mezmur', label: { am: 'ዝማሬ', en: 'Mezmur' } },
  { id: 'Academic', label: { am: 'አካዳሚክ', en: 'Academic' } },
  { id: 'General', label: { am: 'አጠቃላይ', en: 'General' } },
];

/* =========================================================================
   MAIN COMPONENT
   ========================================================================= */
export default function HomeSection() {
  const {
    language = 'en',
    aboutData = {},
    publishedGridEvents = [],
    openLoginModal,
    setActiveNavSection,
  } = useCms();

  const [activeCategoryFilter, setActiveCategoryFilter] = useState('ALL');
  const [selectedEventModal, setSelectedEventModal] = useState(null);

  // Filter items
  const filteredEvents =
    activeCategoryFilter === 'ALL'
      ? publishedGridEvents
      : publishedGridEvents.filter(
        (e) => e.category?.toLowerCase() === activeCategoryFilter.toLowerCase()
      );

  // Helper for Category Badges
  const getBadgeConfig = (category) => {
    const config = CATEGORY_BADGES[category] || CATEGORY_BADGES.General;
    return {
      bg: config.bg,
      icon: config.icon,
      label: config.label[language] || config.label.en,
    };
  };

  // Generic smooth-scroller
  const scrollToSection = (e, sectionId) => {
    e.preventDefault();
    setActiveNavSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      const navOffset = 80;
      window.scrollTo({
        top: element.getBoundingClientRect().top + window.pageYOffset - navOffset,
        behavior: 'smooth',
      });
    }
  };

  const { hero, eventsSection } = HOME_CONFIG;

  return (
    <div id="home" className="w-full bg-[#081226] text-slate-100 pt-20">
      {/* ================= HERO SECTION ================= */}
      <section
        className="relative min-h-[90vh] flex items-center justify-center bg-cover bg-center bg-no-repeat overflow-hidden"
        style={{ backgroundImage: `url(${aboutData?.sanctuaryImage})` }}
      >
        <div
          className="absolute inset-0 z-0"
          style={{ backgroundColor: 'rgba(8, 18, 38, 0.75)' }}
        />
        <div className="absolute inset-0 bg-radial from-amber-500/10 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-16 text-center flex flex-col items-center">
          {/* Logo Emblem */}
          <div className="mb-6 relative group">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full p-1 bg-gradient-to-b from-amber-400 via-amber-300 to-amber-600 shadow-2xl shadow-amber-500/30 ring-4 ring-amber-400/30 group-hover:scale-105 transition-transform duration-300">
              <img
                src={logo}
                alt={hero.title[language] || hero.title.en}
                className="w-full h-full object-cover rounded-full bg-[#0b1b3d]"
              />
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 text-xs font-black px-3.5 py-0.5 rounded-full uppercase tracking-wider shadow">
              {hero.badge[language] || hero.badge.en}
            </div>
          </div>

          <p className="text-xs sm:text-sm md:text-base font-bold tracking-[0.25em] text-amber-400 uppercase font-sans mb-3 drop-shadow">
            {hero.institutionHeader[language] || hero.institutionHeader.en}
          </p>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold font-serif text-white tracking-tight leading-tight capitalize drop-shadow-md">
            {hero.title[language] || hero.title.en}
          </h1>

          <div className="flex items-center justify-center gap-3 my-4">
            <div className="h-px w-16 sm:w-28 bg-gradient-to-r from-transparent via-amber-400 to-amber-400" />
            <span className="text-amber-400 text-xl font-bold">✝</span>
            <div className="h-px w-16 sm:w-28 bg-gradient-to-l from-transparent via-amber-400 to-amber-400" />
          </div>

          <p className="text-lg sm:text-2xl font-serif text-amber-200/90 font-medium tracking-wide max-w-3xl mb-3">
            {hero.subtitle[language] || hero.subtitle.en}
            <span className="block text-sm font-sans text-amber-300/80 mt-1 font-normal">
              {hero.location[language] || hero.location.en}
            </span>
          </p>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl font-normal leading-relaxed mb-8">
            {hero.description[language] || hero.description.en}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-14">
            <button
              type="button"
              onClick={(e) => scrollToSection(e, hero.cta.programs.targetId)}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm uppercase tracking-wider shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-105 transition-all duration-200 text-center cursor-pointer"
            >
              {hero.cta.programs[language] || hero.cta.programs.en}
            </button>
            <button
              type="button"
              onClick={(e) => scrollToSection(e, hero.cta.about.targetId)}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full border-2 border-amber-400/80 hover:border-amber-400 text-amber-300 hover:text-white hover:bg-amber-500/10 font-bold text-sm uppercase tracking-wider transition-all duration-200 text-center cursor-pointer"
            >
              {hero.cta.about[language] || hero.cta.about.en}
            </button>
          </div>

          {/* Metrics Strip */}
          <div className="w-full max-w-4xl bg-[#0b1b3d]/90 backdrop-blur-md border border-amber-500/30 rounded-2xl p-4 sm:p-6 shadow-2xl shadow-black/50">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-700/60">
              {METRIC_CONFIGS.map((metric, idx) => (
                <div
                  key={metric.key}
                  className={`flex flex-col items-center justify-center ${idx > 1 ? 'pt-2 md:pt-0' : ''
                    }`}
                >
                  <span className="font-serif text-3xl sm:text-4xl font-extrabold text-amber-400">
                    {aboutData?.[metric.key] || metric.fallback}
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-slate-300 mt-1 uppercase tracking-wider">
                    {metric.label[language] || metric.label.en}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= EVENTS DROP ZONE ================= */}
      <section
        id="events"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/60 border-t border-b border-amber-500/20"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs uppercase tracking-widest mb-2">
                <Calendar className="w-4 h-4" />
                <span>{eventsSection.sectionTag[language] || eventsSection.sectionTag.en}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold font-serif text-white tracking-tight">
                {eventsSection.heading[language] || eventsSection.heading.en}
              </h2>
              <p className="text-slate-400 text-sm mt-2 max-w-xl">
                {eventsSection.subheading[language] || eventsSection.subheading.en}
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              {EVENT_FILTER_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveCategoryFilter(tab.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${activeCategoryFilter.toLowerCase() === tab.id.toLowerCase()
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'bg-[#0b1b3d] text-slate-300 hover:text-white border border-slate-700'
                    }`}
                >
                  {tab.label[language] || tab.label.en}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid or Empty State */}
          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.map((event) => {
                const badge = getBadgeConfig(event.category);
                const BadgeIcon = badge.icon;
                const displayTitle = language === 'am' && event.titleAm ? event.titleAm : event.title;
                const displayDesc =
                  language === 'am' && event.descriptionAm ? event.descriptionAm : event.description;
                const displayLoc = language === 'am' && event.locationAm ? event.locationAm : event.location;

                return (
                  <article
                    key={event.id}
                    className="group bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-200 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Bar with Badge */}
                      <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badge.bg}`}
                        >
                          <BadgeIcon className="w-3.5 h-3.5" />
                          <span>{badge.label}</span>
                        </span>
                        <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-md">
                          {eventsSection.cardLabels.subCategory}
                        </span>
                      </div>

                      {/* Card Body */}
                      <div className="p-6 pt-4">
                        <h3 className="font-serif font-bold text-xl text-slate-900 group-hover:text-amber-700 transition-colors leading-snug mb-3">
                          {displayTitle}
                        </h3>

                        <p className="text-slate-600 text-sm leading-relaxed line-clamp-3 mb-6">
                          {displayDesc}
                        </p>

                        <div className="space-y-2 text-xs text-slate-500 border-t border-slate-100 pt-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
                            <span className="font-semibold text-slate-700">{event.date}</span>
                          </div>
                          {event.time && (
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                              <span>{event.time}</span>
                            </div>
                          )}
                          {displayLoc && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                              <span className="truncate">{displayLoc}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="p-6 pt-0">
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <span className="text-xs text-slate-400 font-medium">
                          {eventsSection.cardLabels.churchLocation}
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedEventModal(event)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-800 transition-colors group-hover:translate-x-1 cursor-pointer"
                        >
                          <span>
                            {eventsSection.cardLabels.viewDetails[language] ||
                              eventsSection.cardLabels.viewDetails.en}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-[#0b1b3d]/80 border-2 border-dashed border-slate-700 rounded-3xl p-12 text-center max-w-xl mx-auto shadow-2xl">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-4 text-amber-400">
                <Calendar className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold font-serif text-white mb-2">
                {eventsSection.emptyState.title[language] || eventsSection.emptyState.title.en}
              </h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
                {eventsSection.emptyState.description[language] ||
                  eventsSection.emptyState.description.en}
              </p>
              <button
                type="button"
                onClick={openLoginModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>
                  {eventsSection.emptyState.actionBtn[language] ||
                    eventsSection.emptyState.actionBtn.en}
                </span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ================= DETAIL MODAL ================= */}
      {selectedEventModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedEventModal(null)}
        >
          <div
            className="w-full max-w-lg bg-[#0b1b3d] border border-amber-500/40 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <span className="text-xs uppercase font-bold text-amber-400 block mb-1">
                  {selectedEventModal.category}
                </span>
                <h3 className="font-serif font-bold text-2xl text-white">
                  {language === 'am' && selectedEventModal.titleAm
                    ? selectedEventModal.titleAm
                    : selectedEventModal.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEventModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              {language === 'am' && selectedEventModal.descriptionAm
                ? selectedEventModal.descriptionAm
                : selectedEventModal.description}
            </p>

            <div className="space-y-2 text-xs text-slate-400 bg-[#081226] p-4 rounded-2xl border border-slate-700/60 mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span className="text-slate-200">{selectedEventModal.date}</span>
              </div>
              {selectedEventModal.time && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span className="text-slate-200">{selectedEventModal.time}</span>
                </div>
              )}
              {selectedEventModal.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <span className="text-slate-200">{selectedEventModal.location}</span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setSelectedEventModal(null)}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider cursor-pointer"
            >
              {eventsSection.cardLabels.closeModal[language] ||
                eventsSection.cardLabels.closeModal.en}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}