import React from 'react';
import { useCms } from '../../Contexts/CmsContext.jsx';
import {
  Church, Eye, Scroll, Heart, Target, Sparkles, CheckCircle2,
  Calendar, MapPin, Award, BookOpen
} from 'lucide-react';

export default function AboutPillarsSection() {
  const { aboutData, language } = useCms();

  return (
    <section id="about-pillars" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#081226] text-slate-100 relative">
      <div className="max-w-7xl mx-auto space-y-16">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest mb-3">
            <span>✝</span>
            <span>{language === 'am' ? 'የካቴድራሉ ታሪክና 4ቱ ምሰሶዎች' : 'Cathedral Heritage & The 4 Pillars'}</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold font-serif text-white tracking-tight">
            {language === 'am' ? 'ስለ እኛ እና 4ቱ መንፈሳዊ ምሰሶዎች' : 'About & Spiritual Pillars'}
          </h2>

          <div className="h-1 w-20 bg-amber-500 mx-auto my-4 rounded-full" />

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {language === 'am'
              ? 'በድሬዳዋ ቅድስት ሥላሴ ካቴድራል ስር የኦርቶዶክሳዊት ቤተክርስቲያንን ሐዋርያዊ ትውፊት ጠብቆ ለትውልድ ለማስተላለፍ የተዘረጋ የተቀደሰ መዋቅር።'
              : 'The sacred foundation, historical roots, and guiding spiritual pillars of Welude Birhan Sunday School at Holy Trinity Cathedral, Dire Dawa.'}
          </p>
        </div>

        {/* 1. Sunday School & Church Heritage + 2. CM-Controlled Church Showcase */}
        <div className="grid lg:grid-cols-12 gap-10 items-stretch">

          {/* Heritage Narrative (Left Column) */}
          <div className="lg:col-span-6 bg-[#0b1b3d] border border-amber-500/30 rounded-3xl p-8 sm:p-10 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                  <Church className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs uppercase font-bold text-amber-400 tracking-wider block">
                    Diocese of Dire Dawa & Eastern Hararghe
                  </span>
                  <h3 className="font-serif font-bold text-2xl text-white">
                    {language === 'am' ? 'የካቴድራሉ እና የሰንበት ት/ቤቱ ቅርስ' : 'Cathedral & Sunday School Heritage'}
                  </h3>
                </div>
              </div>

              <div className="space-y-4 text-sm text-slate-300 leading-relaxed font-sans">
                <p>
                  {language === 'am' ? aboutData?.historyTextAm : aboutData?.historyTextEn}
                </p>
                <p className="text-slate-400 text-xs leading-relaxed">
                  {language === 'am'
                    ? 'ሰንበት ት/ቤቱ የተማሪዎችን መንፈሳዊ ጉዞ በ4 የተዋቀሩ የዕድሜ ክፍሎች (ህፃናት፣ ታዳጊዎች፣ ወጣቶችና ተመራቂዎች) በማስተባበር፤ በድሬዳዋና ምስራቅ ሐረርጌ ሀገረ ስብከት ስር በታማኝነት በማገልገል ላይ ይገኛል።'
                    : 'The Sunday school operates under the episcopal oversight of the diocese, offering foundational education across four age divisions: Nursery, Junior, Youth, and Senior Graduates.'}
                </p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-700/80 grid grid-cols-2 gap-4 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Established: <strong className="text-white">{aboutData?.establishedYear || '1945 E.C.'}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Location: <strong className="text-white">Dire Dawa, Kebele 02</strong></span>
              </div>
            </div>
          </div>

          {/* CM-Controlled Church Showcase (Right Column) */}
          <div className="lg:col-span-6 bg-[#0b1b3d] border border-amber-500/30 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col justify-between group">
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-700/60 shadow-lg h-[340px] sm:h-[380px]">

              {/* Church Image dynamically bound to CmsContext.aboutData */}
              <img
                src={aboutData?.sanctuaryImage}
                alt="Holy Trinity Cathedral Sanctuary Dire Dawa"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />

              {/* Gradient Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#081226] via-transparent to-transparent opacity-90" />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg">
                  Cathedral Sanctuary
                </span>
                <span className="px-2.5 py-1 rounded-full bg-slate-900/80 text-amber-300 border border-amber-500/40 text-xs font-semibold backdrop-blur-md">
                  ድሬዳዋ
                </span>
              </div>

              {/* Floating Image Information */}
              <div className="absolute bottom-4 left-4 right-4 p-5 rounded-2xl bg-[#081226]/95 backdrop-blur-md border border-amber-500/30">
                <h4 className="font-serif font-bold text-lg text-white mb-1">
                  {language === 'am' ? aboutData?.titleAm : aboutData?.title}
                </h4>
                <p className="text-xs text-slate-300 leading-snug">
                  {language === 'am' ? aboutData?.captionAm : aboutData?.caption}
                </p>
              </div>
            </div>

            <div className="mt-4 px-2 flex items-center justify-between text-xs text-slate-400">
              <span>Managed dynamically via Content Coordinator Desk</span>
              <span className="text-amber-400 font-semibold">Live CMS Bound</span>
            </div>
          </div>

        </div>

        {/* 3. The 4 Spiritual Pillars (Balanced 2x2 Grid) */}
        <div className="space-y-6 pt-6">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400 block mb-1">
              Spiritual Framework
            </span>
            <h3 className="font-serif font-bold text-2xl sm:text-3xl text-white">
              {language === 'am' ? 'አራቱ መንፈሳዊ ምሰሶዎች' : 'The Four Spiritual Pillars'}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">

            {/* Pillar 01 - Vision (ራዕይ) */}
            <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border-t-4 border-amber-500 flex flex-col justify-between text-slate-800 transition-all duration-300 hover:-translate-y-1">
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <Eye className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs uppercase font-black tracking-widest text-amber-700 block">
                      Pillar 01
                    </span>
                    <h4 className="text-2xl font-bold font-serif text-slate-900">
                      {language === 'am' ? 'ራዕይ (Vision)' : 'Vision (ራዕይ)'}
                    </h4>
                  </div>
                </div>

                <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
                  {language === 'am' ? aboutData?.visionAm : aboutData?.visionEn}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-amber-700">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Preserving Apostolic Tradition & Spiritual Resiliency</span>
              </div>
            </div>

            {/* Pillar 02 - Mission (ተልዕኮ) */}
            <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border-t-4 border-amber-500 flex flex-col justify-between text-slate-800 transition-all duration-300 hover:-translate-y-1">
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
                    <Scroll className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs uppercase font-black tracking-widest text-blue-800 block">
                      Pillar 02
                    </span>
                    <h4 className="text-2xl font-bold font-serif text-slate-900">
                      {language === 'am' ? 'ተልዕኮ (Mission)' : 'Mission (ተልዕኮ)'}
                    </h4>
                  </div>
                </div>

                <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
                  {language === 'am' ? aboutData?.missionAm : aboutData?.missionEn}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-blue-800">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Equipping Faithful Stewards through Orthodox Education</span>
              </div>
            </div>

            {/* Pillar 03 - Core Values (ዋና እሴቶች) */}
            <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border-t-4 border-amber-500 flex flex-col justify-between text-slate-800 transition-all duration-300 hover:-translate-y-1">
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <Heart className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs uppercase font-black tracking-widest text-amber-700 block">
                      Pillar 03
                    </span>
                    <h4 className="text-2xl font-bold font-serif text-slate-900">
                      {language === 'am' ? 'ዋና እሴቶች (Core Values)' : 'Core Values (ዋና እሴቶች)'}
                    </h4>
                  </div>
                </div>

                <ul className="space-y-3 text-slate-700 text-xs sm:text-sm">
                  {(aboutData?.coreValues || []).map((val, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="text-amber-500 font-bold mt-0.5">✝</span>
                      <span className="leading-snug">
                        {language === 'am' ? val.am : val.en}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 text-xs font-semibold text-slate-500">
                Devotion, holiness, mutual brotherly love, modesty, and church order
              </div>
            </div>

            {/* Pillar 04 - Objectives (ዋና ዓላማዎች) */}
            <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border-t-4 border-amber-500 flex flex-col justify-between text-slate-800 transition-all duration-300 hover:-translate-y-1">
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <Target className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs uppercase font-black tracking-widest text-emerald-800 block">
                      Pillar 04
                    </span>
                    <h4 className="text-2xl font-bold font-serif text-slate-900">
                      {language === 'am' ? 'ዋና ዓላማዎች (Objectives)' : 'Objectives (ዋና ዓላማዎች)'}
                    </h4>
                  </div>
                </div>

                <ul className="space-y-3 text-slate-700 text-xs sm:text-sm">
                  {(aboutData?.objectives || []).map((obj, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                      <span className="leading-snug">
                        {language === 'am' ? obj.am : obj.en}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 text-xs font-semibold text-slate-500">
                Biblical literacy, Saint Yared liturgical chant, Ge'ez study, and charity
              </div>
            </div>

          </div>
        </div>

        {/* 4. The Motto Banner */}
        <div className="w-full bg-gradient-to-r from-[#0b1b3d] via-[#122856] to-[#0b1b3d] border-2 border-amber-400/60 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden text-center">
          <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
            <span className="inline-block px-4 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs uppercase tracking-widest mb-4">
              ✝ OUR MOTTO • መሪ ቃል ✝
            </span>

            <blockquote className="text-2xl sm:text-4xl font-serif font-extrabold text-amber-300 tracking-wide leading-relaxed italic drop-shadow">
              &ldquo;{aboutData?.mottoEn || 'United in faith, growing in spiritual wisdom, devoted to selfless service.'}&rdquo;
            </blockquote>

            <p className="mt-4 text-lg sm:text-2xl font-serif text-slate-200 font-semibold tracking-wider">
              &ldquo;{aboutData?.mottoAm || 'በሃይማኖት ጸንተን፤ በዕውቀት አድገን፤ በአገልግሎት እንተጋለን!'}&rdquo;
            </p>

            <div className="h-0.5 w-16 bg-amber-500 mt-6 mb-2 rounded-full" />
            <span className="text-xs uppercase tracking-widest text-slate-400">
              Welude Birhan • Holy Trinity Sunday School Dire Dawa
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}
