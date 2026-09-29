import React, { useState } from 'react';
import { useCms } from '../../context/CmsContext';
import { Calendar, Clock, MapPin, Users, BookOpen, Music, Check, ChevronRight } from 'lucide-react';

export default function ProgramsSection() {
  const { language } = useCms();
  const [selectedDayTab, setSelectedDayTab] = useState('ALL');

  const weeklySchedule = [
    {
      id: 'sch-1',
      day: 'Friday',
      dayAm: 'አርብ',
      time: '5:30 PM – 7:30 PM',
      title: 'Saint Yared Choral Chant & Choral Study (የዝማሬ ጥናት)',
      titleAm: 'የቅዱስ ያሬድ ዜማና የመዝሙር ጥናት',
      division: 'Junior & Youth Divisions',
      divisionAm: 'የታዳጊዎችና የወጣቶች ክፍል',
      instructor: 'Deacon Amanuel (Choir Master)',
      location: 'Cathedral Hall A',
      focus: 'Vocal warmups, Saint Yared Deggwa notation, Kebero (drum) synchronization.',
    },
    {
      id: 'sch-2',
      day: 'Saturday',
      dayAm: 'ቅዳሜ',
      time: '3:00 PM – 5:15 PM',
      title: 'Orthodox Dogma & Bible Commentary (የመጽሐፍ ቅዱስ እና የዶግማ ጥናት)',
      titleAm: 'የመጽሐፍ ቅዱስ እና የነገረ መለኮት ጥናት',
      division: 'All Age Divisions',
      divisionAm: 'ለሁሉም የዕድሜ ክፍሎች',
      instructor: 'Teacher Mengistu & Scholars',
      location: 'Cathedral Main Sanctuary',
      focus: 'Exegetical study of the Holy Gospels, Seven Sacraments, and Patristic writings.',
    },
    {
      id: 'sch-3',
      day: 'Saturday',
      dayAm: 'ቅዳሜ',
      time: '5:30 PM – 7:30 PM',
      title: 'Classical Ge\'ez Grammar & Manuscript Literacy (የግዕዝ ቋንቋ ጥናት)',
      titleAm: 'የግዕዝ ሰዋስው እና የብራና ንባብ',
      division: 'Youth, Deacons & Alumni',
      divisionAm: 'ወጣቶች፣ ዲያቆናትና ተመራቂዎች',
      instructor: 'Merigeta Kidanemariam',
      location: 'Classroom Wing B',
      focus: 'Noun declensions, verb conjugations (Wds), and reading ancient Geez hymnaries.',
    },
    {
      id: 'sch-4',
      day: 'Sunday',
      dayAm: 'እሁድ',
      time: '6:00 AM – 10:30 AM',
      title: 'Divine Liturgy & Holy Eucharist (የቅዳሴ ጸሎትና ምስጢረ ቁርባን)',
      titleAm: 'የቅዳሴ ጸሎት እና ምስጢረ ቁርባን',
      division: 'Entire Sunday School Body',
      divisionAm: 'መላው የሰንበት ት/ቤት ማኅበረሰብ',
      instructor: 'Cathedral Clergy & Deacons',
      location: 'Holy Trinity Main Sanctuary',
      focus: 'Full liturgical participation, singing sacred Anaphora responses, and receiving Holy Communion.',
    },
    {
      id: 'sch-5',
      day: 'Sunday',
      dayAm: 'እሁድ',
      time: '10:45 AM – 1:30 PM',
      title: 'Sunday School Catechism Classes (የሰንበት ትምህርት መደበኛ ክፍለ ጊዜ)',
      titleAm: 'የሰንበት ትምህርት መደበኛ ክፍለ ጊዜ',
      division: 'Divisions 1 through 4 (Separated by Classroom)',
      divisionAm: 'ክፍል 1 እስከ 4 (በየክፍላቸው)',
      instructor: 'Assigned Divisional Teachers',
      location: 'Educational Building, Halls 1 – 6',
      focus: 'Age-appropriate curriculum: moral lessons, lives of Orthodox saints, quizzes.',
    },
    {
      id: 'sch-6',
      day: 'Sunday',
      dayAm: 'እሁድ',
      time: '2:30 PM – 5:00 PM',
      title: 'Youth Fellowship & Spiritual Symposium (የወጣቶች መንፈሳዊ ውይይት)',
      titleAm: 'የወጣቶች መንፈሳዊ ጉባኤ እና ማኅበራዊ አገልግሎት',
      division: 'Youth & Senior Members',
      divisionAm: 'ወጣቶችና ነባር አባላት',
      instructor: 'Coordinating Committee',
      location: 'Cathedral Conference Room',
      focus: 'Spiritual debate, counseling, planning charity outreach, and hospital visitations.',
    },
  ];

  const filteredSchedule =
    selectedDayTab === 'ALL'
      ? weeklySchedule
      : weeklySchedule.filter((item) => item.day.toLowerCase() === selectedDayTab.toLowerCase());

  return (
    <section id="programs" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#081226] text-slate-100">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div>
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs uppercase tracking-widest mb-2">
              <Calendar className="w-4 h-4" />
              <span>{language === 'am' ? 'የትምህርት ሰሌዳ' : 'Weekly Curriculum'}</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold font-serif text-white tracking-tight">
              {language === 'am'
                ? 'ሳምንታዊ የትምህርትና የአገልግሎት መርሃ ግብር'
                : 'Weekly Curriculum & Gathering Schedule'}
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-xl">
              {language === 'am'
                ? 'በድሬዳዋ ቅድስት ሥላሴ ካቴድራል በየሳምንቱ አርብ፣ ቅዳሜና እሁድ የሚሰጡ የተዋቀሩ የትምህርት ክፍለ ጊዜያት።'
                : 'Structured weekly sessions covering Dogma, classical Ge\'ez language, liturgical chant, and catechism across all four divisions.'}
            </p>
          </div>

          {/* Day Filters */}
          <div className="flex items-center gap-2 bg-[#0b1b3d] p-1.5 rounded-2xl border border-slate-700/80">
            {['ALL', 'Friday', 'Saturday', 'Sunday'].map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDayTab(day)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedDayTab === day
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {day === 'ALL'
                  ? language === 'am'
                    ? 'ሁሉም (All)'
                    : 'All Days'
                  : day}
              </button>
            ))}
          </div>
        </div>

        {/* Schedule Table / Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchedule.map((prog) => (
            <div
              key={prog.id}
              className="bg-[#0b1b3d] border border-amber-500/30 rounded-3xl p-6 shadow-xl flex flex-col justify-between hover:border-amber-400/60 transition-all duration-300 group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-black uppercase tracking-wider">
                    {language === 'am' ? prog.dayAm : prog.day}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>{prog.time}</span>
                  </div>
                </div>

                <h3 className="font-serif font-bold text-lg text-white group-hover:text-amber-300 transition-colors leading-snug mb-2">
                  {language === 'am' ? prog.titleAm : prog.title}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {prog.focus}
                </p>

                <div className="space-y-1.5 text-xs text-slate-400 border-t border-slate-700/60 pt-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="text-slate-300 font-medium">
                      {language === 'am' ? prog.divisionAm : prog.division}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{prog.location}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800 text-[11px] text-amber-400/90 font-medium">
                Instructor: {prog.instructor}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
