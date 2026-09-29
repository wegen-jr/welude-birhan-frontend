import React, { useState } from 'react';
import { useContent } from '../Contexts/ContentContext';
import { useLanguage } from '../Contexts/LanguageContext';
import logo from '../assets/logo.png';
import churchHero from '../assets/selassieChurch.png';
import aboutImage from '../assets/aboutRecap.png';
import {
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  BookOpen,
  Heart,
  Target,
  Eye,
  Scroll,
  ArrowRight,
  Shield,
  Layers,
  ChevronRight,
  PlusCircle,
  ExternalLink,
  Award,
  Music,
  GraduationCap,
  Users,
  CheckCircle2,
} from 'lucide-react';
import Testimonies from '../Components/Testimonies';
import Map from '../Components/Map';
import Contact from '../Components/Contact';

export default function PublicLanding() {
  const { publishedGridEvents, openLoginModal } = useContent();
  const { t, language } = useLanguage();

  const [activeCategoryFilter, setActiveCategoryFilter] = useState('ALL');

  // Filter events by category if user clicks a filter pill
  const filteredEvents =
    activeCategoryFilter === 'ALL'
      ? publishedGridEvents
      : publishedGridEvents.filter(
          (e) => e.category.toLowerCase() === activeCategoryFilter.toLowerCase()
        );

  // Category styling helper
  const getCategoryBadge = (category) => {
    switch (category) {
      case 'Spiritual Feast':
        return {
          bg: 'bg-amber-100 text-amber-900 border-amber-300',
          icon: Sparkles,
          label: language === 'am' ? 'መንፈሳዊ በዓል' : 'Spiritual Feast',
        };
      case 'Academic':
        return {
          bg: 'bg-blue-100 text-blue-900 border-blue-300',
          icon: GraduationCap,
          label: language === 'am' ? 'አካዳሚክ' : 'Academic',
        };
      case 'Mezmur':
        return {
          bg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          icon: Music,
          label: language === 'am' ? 'ዝማሬ' : 'Mezmur',
        };
      default:
        return {
          bg: 'bg-purple-100 text-purple-900 border-purple-300',
          icon: BookOpen,
          label: language === 'am' ? 'አጠቃላይ' : 'General',
        };
    }
  };

  return (
    <div className="w-full bg-[#081226] text-slate-100">
      
      {/* ========================================================
          HERO SECTION (High-Contrast Overlay + Fixed Copy + Metrics)
         ======================================================== */}
      <section
        id="home"
        className="relative min-h-[92vh] flex items-center justify-center bg-cover bg-center bg-no-repeat overflow-hidden"
        style={{ backgroundImage: `url(${churchHero})` }}
      >
        {/* High-contrast background overlay rgba(8, 18, 38, 0.75) strictly as requested */}
        <div
          className="absolute inset-0 z-0"
          style={{ backgroundColor: 'rgba(8, 18, 38, 0.75)' }}
        />

        {/* Subtle decorative ecclesiastical radial glow */}
        <div className="absolute inset-0 bg-radial from-amber-500/10 via-transparent to-transparent pointer-events-none" />

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-16 text-center flex flex-col items-center">
          
          {/* Logo Emblem */}
          <div className="mb-6 relative group">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full p-1 bg-gradient-to-b from-amber-400 to-amber-600 shadow-2xl shadow-amber-500/30 ring-4 ring-amber-400/30">
              <img
                src={logo}
                alt="Welude Birhan Sunday School Emblem"
                className="w-full h-full object-cover rounded-full bg-[#0b1b3d]"
              />
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 text-xs font-black px-3 py-0.5 rounded-full uppercase tracking-wider shadow">
              ደቀ መዛሙርት
            </div>
          </div>

          {/* Fixed copy requirement */}
          <p className="text-xs sm:text-sm md:text-base font-bold tracking-[0.25em] text-amber-400 uppercase font-sans mb-3 drop-shadow">
            ETHIOPIAN ORTHODOX TEWAHEDO CHURCH SUNDAY SCHOOL
          </p>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold font-serif text-white tracking-tight leading-tight capitalize drop-shadow-md">
            {language === 'am' ? 'ወሉደ ብርሃን' : 'Welude Birhan'}
          </h1>

          {/* Orthodox Cross Ornament Separator */}
          <div className="flex items-center justify-center gap-3 my-4">
            <div className="h-px w-16 sm:w-28 bg-gradient-to-r from-transparent via-amber-400 to-amber-400" />
            <span className="text-amber-400 text-xl font-bold">✝</span>
            <div className="h-px w-16 sm:w-28 bg-gradient-to-l from-transparent via-amber-400 to-amber-400" />
          </div>

          {/* Subtitle */}
          <p className="text-lg sm:text-2xl font-serif text-amber-200/90 font-medium tracking-wide max-w-3xl mb-3">
            {language === 'am'
              ? 'የብርሃን ልጆች • ቅድስት ሥላሴ ሰንበት ትምህርት ቤት'
              : 'Children of Light • Holy Trinity Sunday School'}
          </p>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl font-normal leading-relaxed mb-8">
            {language === 'am'
              ? 'ቀጣዩን ትውልድ በኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተክርስቲያን ጥንታዊ እና ሕያው እምነት፣ ሥርዓትና ትውፊት ማነፅ'
              : 'Nurturing the next generation in the ancient, living faith, holy liturgy, and sacred apostolic tradition of the Ethiopian Orthodox Tewahedo Church.'}
          </p>

          {/* Action Buttons: Primary Gold Button & Ghost/Outline Button */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-14">
            <a
              href="#programs"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-sm uppercase tracking-wider shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-105 transition-all duration-200 text-center"
            >
              {language === 'am' ? 'መርሃ ግብሮቻችን' : 'Our Programs'}
            </a>
            <a
              href="#about"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full border-2 border-amber-400/80 hover:border-amber-400 text-amber-300 hover:text-white hover:bg-amber-500/10 font-bold text-sm uppercase tracking-wider transition-all duration-200 text-center"
            >
              {language === 'am' ? 'ተጨማሪ ይወቁ' : 'Learn More'}
            </a>
          </div>

          {/* Balanced Metric Counter Strip */}
          <div className="w-full max-w-4xl bg-[#0b1b3d]/90 backdrop-blur-md border border-amber-500/30 rounded-2xl p-4 sm:p-6 shadow-2xl shadow-black/50">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-700/60">
              
              {/* Metric 1 */}
              <div className="flex flex-col items-center justify-center pt-2 md:pt-0">
                <span className="font-serif text-3xl sm:text-4xl font-extrabold text-amber-400 tracking-tight">
                  200+
                </span>
                <span className="text-xs sm:text-sm font-medium text-slate-300 mt-1 uppercase tracking-wider">
                  {language === 'am' ? 'ተማሪዎች' : 'Students'}
                </span>
              </div>

              {/* Metric 2 */}
              <div className="flex flex-col items-center justify-center pt-2 md:pt-0">
                <span className="font-serif text-3xl sm:text-4xl font-extrabold text-amber-400 tracking-tight">
                  15+
                </span>
                <span className="text-xs sm:text-sm font-medium text-slate-300 mt-1 uppercase tracking-wider">
                  {language === 'am' ? 'መምህራን' : 'Teachers'}
                </span>
              </div>

              {/* Metric 3 */}
              <div className="flex flex-col items-center justify-center pt-2 md:pt-0">
                <span className="font-serif text-3xl sm:text-4xl font-extrabold text-amber-400 tracking-tight">
                  10+
                </span>
                <span className="text-xs sm:text-sm font-medium text-slate-300 mt-1 uppercase tracking-wider">
                  {language === 'am' ? 'የአገልግሎት ዓመታት' : 'Years of Service'}
                </span>
              </div>

              {/* Metric 4 */}
              <div className="flex flex-col items-center justify-center pt-2 md:pt-0">
                <span className="font-serif text-3xl sm:text-4xl font-extrabold text-amber-400 tracking-tight">
                  4
                </span>
                <span className="text-xs sm:text-sm font-medium text-slate-300 mt-1 uppercase tracking-wider">
                  {language === 'am' ? 'የዕድሜ ክፍሎች' : 'Age Divisions'}
                </span>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ========================================================
          DYNAMIC DROP ZONE (Upcoming Events & Notices)
          Clean White Cards, 3-Card Responsive Grid, Real-time from CMS
         ======================================================== */}
      <section id="events" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/60 border-t border-b border-amber-500/20">
        <div className="max-w-7xl mx-auto">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs uppercase tracking-widest mb-2">
                <Calendar className="w-4 h-4" />
                <span>{language === 'am' ? 'የሰንበት ት/ቤት ዜናዎች' : 'Live Drop Zone'}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold font-serif text-white tracking-tight">
                {language === 'am' ? 'መጪ ክስተቶች እና ማስታወቂያዎች' : 'Upcoming Events & Notices'}
              </h2>
              <p className="text-slate-400 text-sm mt-2 max-w-xl">
                {language === 'am'
                  ? 'በዓላትን፣ የዝማሬና የአካዳሚክ መርሃ ግብሮችን እንዲሁም አስቸኳይ ማስታወቂያዎችን እዚህ ያግኙ።'
                  : 'Real-time liturgical feasts, youth workshops, and Sunday school activities managed directly by our coordinators.'}
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {['ALL', 'Spiritual Feast', 'Mezmur', 'Academic', 'General'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    activeCategoryFilter.toLowerCase() === cat.toLowerCase()
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                      : 'bg-[#0b1b3d] text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700'
                  }`}
                >
                  {cat === 'ALL'
                    ? language === 'am'
                      ? 'ሁሉም'
                      : 'All'
                    : cat}
                </button>
              ))}
            </div>
          </div>

          {/* DYNAMIC 3-CARD RESPONSIVE GRID OR EMPTY STATE */}
          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.map((event) => {
                const badge = getCategoryBadge(event.category);
                const BadgeIcon = badge.icon;

                return (
                  <article
                    key={event.id}
                    className="group bg-white rounded-3xl overflow-hidden shadow-lg shadow-black/30 hover:shadow-2xl hover:shadow-amber-500/10 border border-slate-200 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Card Bar with Category Badge */}
                      <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badge.bg}`}
                        >
                          <BadgeIcon className="w-3.5 h-3.5" />
                          <span>{badge.label}</span>
                        </span>

                        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-md">
                          {event.placement === 'Urgent Notice Banner' ? 'Urgent Banner' : 'Events Grid'}
                        </span>
                      </div>

                      {/* Content Body */}
                      <div className="p-6 pt-4">
                        <h3 className="font-serif font-bold text-xl text-slate-900 group-hover:text-amber-700 transition-colors leading-snug mb-3">
                          {event.title}
                        </h3>

                        <p className="text-slate-600 text-sm leading-relaxed line-clamp-3 mb-6">
                          {event.description}
                        </p>

                        {/* Metadata Details */}
                        <div className="space-y-2 text-xs text-slate-500 border-t border-slate-100 pt-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
                            <span className="font-medium text-slate-700">{event.date}</span>
                          </div>

                          {event.time && (
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                              <span>{event.time}</span>
                            </div>
                          )}

                          {event.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                              <span className="truncate">{event.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Card Footer Action */}
                    <div className="p-6 pt-0">
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <span className="text-xs text-slate-400 font-medium">
                          Holy Trinity SS
                        </span>
                        <button
                          type="button"
                          onClick={() => alert(`Event: ${event.title}\nDate: ${event.date}\nLocation: ${event.location || 'Holy Trinity Cathedral'}\n\n${event.description}`)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors group-hover:translate-x-0.5"
                        >
                          <span>{language === 'am' ? 'ዝርዝር ይመልከቱ' : 'View Details'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            /* EMPTY STATE PLACEHOLDER */
            <div className="bg-[#0b1b3d]/80 border-2 border-dashed border-slate-700 rounded-3xl p-12 text-center max-w-xl mx-auto shadow-xl">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-4 text-amber-400">
                <Calendar className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold font-serif text-white mb-2">
                {language === 'am'
                  ? 'በአሁኑ ጊዜ የታተመ ክስተት የለም'
                  : 'No Upcoming Events Scheduled'}
              </h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
                {language === 'am'
                  ? 'በዚህ ወቅት የታተመ መርሃ ግብር የለም። አዳዲስ ማስታወቂያዎችና የበዓላት ቀናት በአስተዳዳሪው ሲለቀቁ እዚህ ይታያሉ።'
                  : 'There are currently no events marked as published for this category. New announcements and feast dates will appear here immediately once published.'}
              </p>
              <button
                type="button"
                onClick={openLoginModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Coordinator Portal Sign In</span>
              </button>
            </div>
          )}

        </div>
      </section>

      {/* ========================================================
          BALANCED ABOUT & VALUES GRID (2x2 + Full-Width Motto)
          Fixes Vertical Imbalance across cards with Clean White Cards
         ======================================================== */}
      <section id="about" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#081226] text-slate-100 relative">
        <div className="max-w-7xl mx-auto">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest mb-3">
              <span>✝</span>
              <span>{language === 'am' ? 'መሰረታዊ መመሪያ' : 'Pillars of Faith & Service'}</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold font-serif text-white tracking-tight">
              {language === 'am' ? 'ራዕይ፣ ተልዕኮ እና እሴቶቻችን' : 'Our Vision, Mission & Values'}
            </h2>
            <div className="h-1 w-20 bg-amber-500 mx-auto my-4 rounded-full" />
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              {language === 'am'
                ? 'በመንፈሳዊ እውቀት የታነፀ፣ በአገልግሎት የታመነና ለሀገርና ለቤተክርስቲያን ኩራት የሆነ ትውልድ ለማፍራት የተዘረጋ መዋቅር።'
                : 'Dedicated to cultivating spiritually rooted, academically proficient, and morally exemplary youth faithful to the Ethiopian Orthodox Tewahedo Church.'}
            </p>
          </div>

          <div className="space-y-8">
            
            {/* ----------------------------------------------------
                ROW 1 (2-Column Layout): Vision (ራዕይ) & Mission (ተልዕኮ)
               ---------------------------------------------------- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
              
              {/* Card 1: Vision (ራዕይ) */}
              <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-xl border-t-4 border-amber-500 flex flex-col justify-between text-slate-800 transition-transform duration-300 hover:-translate-y-1">
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                      <Eye className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs uppercase font-bold tracking-widest text-amber-700 block">
                        Core Pillar 01
                      </span>
                      <h3 className="text-2xl font-bold font-serif text-slate-900">
                        {language === 'am' ? 'ራዕይ (Vision)' : 'Vision (ራዕይ)'}
                      </h3>
                    </div>
                  </div>

                  <p className="text-slate-700 text-base leading-relaxed">
                    {language === 'am'
                      ? 'የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተ ክርስቲያንን ዶግማ ፣ቀኖና እና ትውፊት አውቆ የሚያሳውቅ : ጠብቆ የሚያስጠብቅ በመንፈሳዊ ሕይወቱ ጠንካራ የሆነ በመንፈሳዊ ትምህርትም በዘመናዊ ትምህርትም የበሰለ በሃይማኖት እና በምግባር የታነጸ ትውልድ ማፍራት፡፡ የሰንበት ት/ቤቱን በሁሉም ዘርፍ ራሱን የቻለ እና ለሁሉም ተደራሽ ማድረግ።'
                      : 'To nurture a generation that knows, preserves, and protects the dogma, canon, and sacred tradition of the Ethiopian Orthodox Tewahedo Church; a generation that is spiritually resilient, grounded in liturgical wisdom and modern education, and living as upright witnesses of Christ.'}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-amber-700">
                  <CheckCircle2 className="w-4 h-4 text-amber-600" />
                  <span>Preserving Apostolic Heritage for Generations</span>
                </div>
              </div>

              {/* Card 2: Mission (ተልዕኮ) */}
              <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-xl border-t-4 border-amber-500 flex flex-col justify-between text-slate-800 transition-transform duration-300 hover:-translate-y-1">
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
                      <Scroll className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs uppercase font-bold tracking-widest text-blue-800 block">
                        Core Pillar 02
                      </span>
                      <h3 className="text-2xl font-bold font-serif text-slate-900">
                        {language === 'am' ? 'ተልዕኮ (Mission)' : 'Mission (ተልዕኮ)'}
                      </h3>
                    </div>
                  </div>

                  <p className="text-slate-700 text-base leading-relaxed">
                    {language === 'am'
                      ? 'የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተ ክርስቲያን እምነት፣ ዶግማ፣ ቀኖና ትውፊት ጠንቅቆ የሚያውቅና በመንፈሳዊ ሕይወት የተጠናከረ ፣ የአብነት ትምህርት በማስተማር ለማዕረገ ክህነት የሚበቃ እና በአገልግሎቱ በሀገርና በቤተ ክርስቲያን ውስጥ ታማኝነት የሚያሳይ ትውልድ ማዘጋጀት።'
                      : 'To prepare a generation that thoroughly understands the Orthodox faith, canon, and ecclesiastical traditions; empowered with academic competence, liturgical discipline, and unwavering integrity in sacrificial service to the Church and community.'}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-blue-800">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <span>Equipping Faithful Stewards & Servants</span>
                </div>
              </div>

            </div>

            {/* ----------------------------------------------------
                ROW 2 (2-Column Layout): Core Values (ዋና እሴቶች) & Objectives (ዋና ዓላማዎች)
               ---------------------------------------------------- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
              
              {/* Card 3: Core Values (ዋና እሴቶች) */}
              <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-xl border-t-4 border-amber-500 flex flex-col justify-between text-slate-800 transition-transform duration-300 hover:-translate-y-1">
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                      <Heart className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs uppercase font-bold tracking-widest text-amber-700 block">
                        Core Pillar 03
                      </span>
                      <h3 className="text-2xl font-bold font-serif text-slate-900">
                        {language === 'am' ? 'ዋና እሴቶች (Core Values)' : 'Core Values (ዋና እሴቶች)'}
                      </h3>
                    </div>
                  </div>

                  <ul className="space-y-3 text-slate-700 text-sm">
                    {[
                      language === 'am' ? 'በፍጹም ልብ፣ ነፍስና ኃይል ለእግዚአብሔር መገዛት' : 'Wholehearted devotion and service to God with heart, soul, and strength',
                      language === 'am' ? 'በቅድስና እና በንጽሕና ሕይወት መመላለስ' : 'Pursuing holiness, purity, and upright Christian conduct in daily life',
                      language === 'am' ? 'እርስ በርሳችን ፍጹም መዋደድ እና መከባበር' : 'Mutual brotherly love, unity, and selfless respect among members',
                      language === 'am' ? 'ለተግባራዊ ክርስትና ትኩረት መስጠት (አርአያ መሆን)' : 'Living testimony of practical Christianity and charitable witness',
                      language === 'am' ? 'የቤተክርስቲያን ሕግና ሥርዓት መጠበቅ፣ ማክበርና ማስከበር' : 'Faithful obedience and reverence to the Holy Church order, canons, and clergy',
                      language === 'am' ? 'ክርስቲያናዊ አለባበስ መልበስ እና አንደበትን ከክፉ ቃል መግታት' : 'Dignified Christian attire, modesty, and abstaining from harmful speech',
                    ].map((val, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="text-amber-500 font-bold mt-0.5">✝</span>
                        <span className="leading-snug">{val}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100 text-xs font-medium text-slate-500">
                  Rooted in ancient apostolic statutes
                </div>
              </div>

              {/* Card 4: Objectives (ዋና ዓላማዎች) */}
              <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-xl border-t-4 border-amber-500 flex flex-col justify-between text-slate-800 transition-transform duration-300 hover:-translate-y-1">
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                      <Target className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs uppercase font-bold tracking-widest text-emerald-800 block">
                        Core Pillar 04
                      </span>
                      <h3 className="text-2xl font-bold font-serif text-slate-900">
                        {language === 'am' ? 'ዋና ዓላማዎች (Objectives)' : 'Objectives (ዋና ዓላማዎች)'}
                      </h3>
                    </div>
                  </div>

                  <ul className="space-y-3 text-slate-700 text-sm">
                    {[
                      language === 'am' ? 'የኦርቶዶክስ ተዋሕዶ እምነትን፣ ዶግማን እና ቀኖናን ማስተማር' : 'Comprehensive instruction in Orthodox theology, Holy Scriptures, and church dogma',
                      language === 'am' ? 'የመዝሙር፣ የዜማና የቋንቋ (ግዕዝ) ክፍሎችን ማጠናከር' : 'Mastery of Saint Yared sacred chant (Mezmur), hymns, and liturgical Ge\'ez',
                      language === 'am' ? 'ወጣቶችን በመንፈሳዊ መሪነት እና በስነ-ምግባር ማብቃት' : 'Cultivating youth leadership, spiritual maturity, and sound moral integrity',
                      language === 'am' ? 'የመጽሐፍ ቅዱስ ጥናትን እና መንፈሳዊ ጉባኤያትን ማስፋፋት' : 'Expanding Bible study seminars, spiritual counseling, and fellowship',
                      language === 'am' ? 'ለችግረኞችና ለማኅበረሰቡ የበጎ አድራጎት አገልግሎት መስጠት' : 'Community outreach, charity for the needy, and active hospital visitation',
                      language === 'am' ? 'ግልጽ፣ ዘመናዊና ተጠያቂ የሰንበት ት/ቤት አስተዳደር መገንባት' : 'Maintaining transparent, loving, and accountable Sunday school administration',
                    ].map((obj, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                        <span className="leading-snug">{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100 text-xs font-medium text-slate-500">
                  Equipping every age division effectively
                </div>
              </div>

            </div>

            {/* ----------------------------------------------------
                ROW 3 (Full-Width Banner): Motto (መሪ ቃል)
               ---------------------------------------------------- */}
            <div className="w-full bg-gradient-to-r from-[#0b1b3d] via-[#122856] to-[#0b1b3d] border-2 border-amber-400/60 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden text-center">
              
              {/* Background Cross Pattern Watermark */}
              <div className="absolute -right-10 -bottom-10 opacity-5 pointer-events-none text-9xl">
                ✝
              </div>

              <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
                <span className="inline-block px-4 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs uppercase tracking-widest mb-4">
                  ✝ OUR MOTTO • መሪ ቃል ✝
                </span>

                <blockquote className="text-2xl sm:text-4xl font-serif font-extrabold text-amber-300 tracking-wide leading-relaxed italic drop-shadow">
                  &ldquo;United in faith, growing in spiritual wisdom, devoted to selfless service.&rdquo;
                </blockquote>

                <p className="mt-4 text-lg sm:text-xl font-serif text-slate-200 font-semibold tracking-wider">
                  &ldquo;በሃይማኖት ጸንተን፣ በእውቀት አድገን፣ በአገልግሎት እንተጋለን።&rdquo;
                </p>

                <div className="h-0.5 w-16 bg-amber-500 mt-6 mb-2 rounded-full" />
                <span className="text-xs uppercase tracking-widest text-slate-400">
                  Holy Trinity Sunday School • Welude Birhan
                </span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================
          PROGRAMS & SCHEDULE SECTION
         ======================================================== */}
      <section id="programs" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0b1b3d]/60 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400 block mb-2">
                Weekly Schedule
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold font-serif text-white mb-6">
                {language === 'am'
                  ? 'የሳምንታዊ መርሃ ግብሮች ሰሌዳ'
                  : 'Weekly Sunday School Curriculum & Gatherings'}
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed mb-8">
                {language === 'am'
                  ? 'ልጆችና ወጣቶች በእድሜ ክፍላቸው መሰረት ተከፋፍለው በመዝሙር፣ በስነ-ምግባር፣ በመጽሐፍ ቅዱስና በግዕዝ ቋንቋ ጥናት የሚሳተፉባቸው ሳምንታዊ መርሃ ግብሮች።'
                  : 'Structured learning environments tailored across all 4 age divisions to cultivate biblical knowledge, liturgical choral mastery, and church etiquette.'}
              </p>

              <div className="space-y-4">
                {[
                  { day: 'Friday', time: '5:30 PM - 7:30 PM', title: 'Song & Choral Study (የዝማሬ ጥናት)', target: 'Youth & Junior Choir' },
                  { day: 'Saturday', time: '3:00 PM - 5:30 PM', title: 'Bible & Dogma Study (የመጽሐፍ ቅዱስ ጥናት)', target: 'All Divisions' },
                  { day: 'Saturday', time: '5:30 PM - 7:30 PM', title: 'Ge\'ez Literacy & Liturgy (የግዕዝ ትምህርት)', target: 'Deacons & Youth' },
                  { day: 'Sunday', time: '8:00 AM - 11:30 AM', title: 'Divine Liturgy & Children School', target: 'Nursery to Young Adults' },
                  { day: 'Sunday', time: '2:00 PM - 5:00 PM', title: 'Afternoon Fellowship & Workshop', target: 'Youth & Graduates' },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-[#081226] border border-slate-800 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs uppercase">
                        {item.day.slice(0, 3)}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white">{item.title}</h4>
                        <span className="text-xs text-slate-400">{item.target}</span>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full whitespace-nowrap">
                      {item.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="rounded-3xl overflow-hidden border-2 border-amber-500/40 shadow-2xl relative group">
                <img
                  src={aboutImage}
                  alt="Welude Birhan Students"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#081226] via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-6 left-6 right-6 p-6 rounded-2xl bg-[#081226]/90 backdrop-blur-md border border-amber-500/30">
                  <h4 className="font-serif font-bold text-amber-300 text-lg mb-1">
                    {language === 'am' ? 'የብርሃን ልጆች በጋራ' : 'United in Holy Fellowship'}
                  </h4>
                  <p className="text-xs text-slate-300">
                    Over 200 young souls gathered under the canopy of the Holy Trinity Cathedral.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================
          TESTIMONIALS SECTION
         ======================================================== */}
      <section id="gallery" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#081226]">
        <div className="max-w-7xl mx-auto">
          <Testimonies />
        </div>
      </section>

      {/* ========================================================
          MAP & CONTACT SECTION
         ======================================================== */}
      <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/60 border-t border-slate-800">
        <div className="max-w-7xl mx-auto space-y-12">
          <Map />
          <Contact />
        </div>
      </section>

    </div>
  );
}
