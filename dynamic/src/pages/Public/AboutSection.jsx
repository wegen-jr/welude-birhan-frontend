import React from 'react';
import { useCms } from '../../context/CmsContext';
import { Church, Users, BookOpen, Award, Sparkles, CheckCircle2 } from 'lucide-react';

export default function AboutSection() {
  const { language, aboutInfo } = useCms();

  const ageDivisions = [
    {
      titleEn: '1. Nursery Division (የህፃናት ክፍል)',
      ageEn: 'Ages 4 – 8 Years',
      descEn: 'Early spiritual catechism, memorization of prayers (Our Father, Hail Mary), bible story coloring, and basic church reverence.',
      descAm: 'የመሠረታዊ ጸሎታት (አቡነ ዘበሰማያት፣ ይዌድስዋ መላእክት) ንባብ፣ የመጽሐፍ ቅዱስ ታሪኮች በስዕል እና የቤተክርስቲያን ሥርዓት ማወቅ።',
    },
    {
      titleEn: '2. Junior Division (የታዳጊዎች ክፍል)',
      ageEn: 'Ages 9 – 13 Years',
      descEn: 'Foundational Orthodox Dogma, church history, introduction to Saint Yared melodies, and deacon service training for young boys.',
      descAm: 'የመሠረተ ሃይማኖት ትምህርት፣ የቤተክርስቲያን ታሪክ፣ የመዝሙር ዜማ መነሻና ለወንዶች ልጆች የዲቁና አገልግሎት ዝግጅት።',
    },
    {
      titleEn: '3. Youth Division (የወጣቶች ክፍል)',
      ageEn: 'Ages 14 – 20 Years',
      descEn: 'Advanced Patristics, introductory Ge\'ez grammar, choral mastery (Mezmur with Kebero & Tsenatsil), and spiritual defense against modern moral decay.',
      descAm: 'ጥልቅ የነገረ መለኮት ትምህርት፣ የመጀመሪያ ደረጃ የግዕዝ ሰዋስው፣ የከበሮና የጸናጽል ዝማሬ እንዲሁም ወጣቶችን ከዓለም ፈተና መጠበቅ።',
    },
    {
      titleEn: '4. Senior & Alumni Division (ነባርና ተመራቂዎች)',
      ageEn: 'Ages 21+ Years & Graduates',
      descEn: 'Teacher training, charity leadership, manuscript reading, cathedral service coordination, and mentoring junior Sunday school students.',
      descAm: 'የመምህራን ማሰልጠኛ፣ የበጎ አድራጎት አመራር፣ የብራና መጻሕፍት ንባብ፣ የካቴድራሉ አገልግሎት አስተባባሪነትና ታዳጊዎችን ማነፅ።',
    },
  ];

  return (
    <section id="about" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#0b1b3d]/60 border-t border-slate-800">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 block mb-2">
            {language === 'am' ? 'የታሪክ ማስታወሻ' : 'Heritage & History'}
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold font-serif text-white tracking-tight">
            {language === 'am'
              ? 'የድሬዳዋ ቅድስት ሥላሴ ካቴድራልና ወሉደ ብርሃን'
              : 'Holy Trinity Cathedral & Welude Birhan'}
          </h2>
          <div className="h-1 w-20 bg-amber-500 mx-auto my-4 rounded-full" />
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {language === 'am' ? aboutInfo.historySummaryAm : aboutInfo.historySummaryEn}
          </p>
        </div>

        {/* CMS-Driven Church Image and Historical Narrative */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          
          <div className="relative group">
            <div className="rounded-3xl overflow-hidden border-2 border-amber-500/40 shadow-2xl relative">
              <img
                src={aboutInfo.churchImage}
                alt="Holy Trinity Cathedral Dire Dawa"
                className="w-full h-[400px] object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#081226] via-transparent to-transparent opacity-85" />
              <div className="absolute bottom-6 left-6 right-6 p-6 rounded-2xl bg-[#081226]/90 backdrop-blur-md border border-amber-500/30">
                <span className="text-xs font-bold uppercase text-amber-400 block mb-1">
                  Dire Dawa Cathedral Landmark
                </span>
                <h3 className="font-serif font-bold text-white text-lg">
                  {language === 'am'
                    ? 'በድሬዳዋ ከተማ የቀደመው የቅድስት ሥላሴ ካቴድራል'
                    : 'The Historic Holy Trinity Cathedral in Dire Dawa'}
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  A sanctuary of prayer, peace, and spiritual illumination for the Horn of Africa.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-[#081226] border border-amber-500/30 shadow-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                  <Church className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-lg text-white">
                  {language === 'am' ? 'ሥርዓተ ቤተክርስቲያንና እሴቶቿ' : 'Ecclesiastical Authority & Canon'}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Operating under the direct guidance of the Diocesan Archbishop and cathedral administrators, Welude Birhan ensures all curriculum complies strictly with the Holy Synod canons and ancient liturgical statutes.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#081226] border border-amber-500/30 shadow-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-lg text-white">
                  {language === 'am' ? 'የግዕዝ ቋንቋና የዜማ ጥበብ' : 'Ge\'ez Literacy & Choral Art'}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                We are dedicated to preserving ancient Ge\'ez manuscripts, teaching youth classical grammar, rhythmic hymns of Saint Yared, and church etiquette so the sacred torch remains unextinguished.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#081226] border border-amber-500/30 shadow-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-lg text-white">
                  {language === 'am' ? 'የአገልግሎት ቁርጠኝነት' : 'Devoted Community Stewardship'}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Beyond classroom catechism, Sunday school members actively clean the sanctuary, bake Eucharistic bread (ቅዱስ ኅብስት), support elderly pilgrims, and engage in charity across Dire Dawa.
              </p>
            </div>
          </div>

        </div>

        {/* 4 Age Divisions Structure */}
        <div className="mt-16">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400 block mb-1">
              {language === 'am' ? 'የተማሪዎች ክፍፍል' : 'Student Body Structure'}
            </span>
            <h3 className="font-serif font-bold text-2xl sm:text-3xl text-white">
              {language === 'am' ? 'አራቱ የዕድሜ ክፍሎች' : 'The Four Age Divisions'}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {ageDivisions.map((div, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl p-6 shadow-xl border-t-4 border-amber-500 text-slate-800 flex flex-col justify-between hover:-translate-y-1 transition-transform duration-200"
              >
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full inline-block mb-3">
                    {div.ageEn}
                  </span>
                  <h4 className="font-serif font-bold text-lg text-slate-900 mb-2">
                    {div.titleEn}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {language === 'am' ? div.descAm : div.descEn}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-semibold text-amber-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Sunday Class & Activity</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
