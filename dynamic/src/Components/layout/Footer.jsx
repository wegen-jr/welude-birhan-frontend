import React from 'react';
import { useCms } from '../../Contexts/CmsContext.jsx';
import logo from '../../assets/logo.png';
import { MapPin, Phone, Mail, Clock, Church, Heart, Shield, ArrowUp } from 'lucide-react';

export default function Footer() {
  const { language, aboutData, openLoginModal } = useCms();
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-[#050c1a] border-t-2 border-amber-500/40 text-slate-300 relative overflow-hidden">

      {/* Decorative Golden Top Line */}
      <div className="h-1.5 w-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600" />

      {/* Main Footer Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Column 1: Church Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={logo}
                alt="Welude Birhan"
                className="w-12 h-12 rounded-full p-0.5 bg-amber-400 ring-2 ring-amber-400/40"
              />
              <div>
                <h3 className="font-serif font-bold text-lg text-white leading-tight">
                  {language === 'am' ? 'ወሉደ ብርሃን' : 'Welude Birhan'}
                </h3>
                <p className="text-xs text-amber-400 font-medium">
                  {language === 'am' ? 'ቅድስት ሥላሴ ሰንበት ት/ቤት' : 'Holy Trinity Sunday School'}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {language === 'am'
                ? 'በድሬዳዋና ምስራቅ ሐረርጌ ሀገረ ስብከት ስር በድሬዳዋ ቅድስት ሥላሴ ካቴድራል የተመሰረተ፤ ቀጣዩን ትውልድ በኦርቶዶክሳዊት ተዋሕዶ እምነትና ምግባር የሚያንፅ የተቀደሰ ማዕከል።'
                : 'Established under the Holy Trinity Cathedral in Dire Dawa, dedicated to cultivating spiritually enlightened, disciplined, and faithful Orthodox youth.'}
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
              <span>✝</span>
              <span className="font-serif italic font-semibold">
                {language === 'am'
                  ? (aboutData?.mottoAm || 'በሃይማኖት ጸንተን፤ በዕውቀት አድገን፤ በአገልግሎት እንተጋለን!')
                  : (aboutData?.mottoEn || 'United in faith, growing in spiritual wisdom, devoted to selfless service.')}
              </span>
            </div>
          </div>

          {/* Column 2: Dire Dawa Cathedral Location & Contact */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-sm text-white uppercase tracking-wider border-b border-amber-500/30 pb-2">
              {language === 'am' ? 'የካቴድራሉ አድራሻ' : 'Cathedral Location'}
            </h4>

            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  {language === 'am'
                    ? 'ድሬዳዋ ከተማ፣ ቀበሌ 02፣ የቅድስት ሥላሴ ካቴድራል አደባባይ፣ ኢትዮጵያ'
                    : 'Dire Dawa, Kebele 02, Holy Trinity Cathedral Square, Ethiopia'}
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>+251 25 111 2345 / +251 91 555 6789</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span>info@weludebirhan-diredawa.org</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Church className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  {language === 'am'
                    ? 'የድሬዳዋና ምስራቅ ሐረርጌ ሀገረ ስብከት'
                    : 'Dire Dawa & Eastern Hararghe Diocese'}
                </span>
              </li>
            </ul>
          </div>

          {/* Column 3: Liturgical & Sunday School Schedule */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-sm text-white uppercase tracking-wider border-b border-amber-500/30 pb-2">
              {language === 'am' ? 'የአገልግሎት ሰዓታት' : 'Service & School Hours'}
            </h4>

            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Sunday Divine Liturgy:</strong>
                  <span>6:00 AM – 10:30 AM (ቅዳሴ)</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Children & Youth Classes:</strong>
                  <span>Sunday 10:45 AM – 1:30 PM</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Saturday Dogma & Ge'ez:</strong>
                  <span>Saturday 3:00 PM – 6:30 PM</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Friday Choral Mezmur:</strong>
                  <span>Friday 5:30 PM – 7:30 PM</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Column 4: Quick Navigation & Admin Access */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-sm text-white uppercase tracking-wider border-b border-amber-500/30 pb-2">
              {language === 'am' ? 'ፈጣን ማገናኛዎች' : 'Navigation & Portal'}
            </h4>

            <ul className="space-y-2 text-xs">
              <li>
                <a href="#home" className="hover:text-amber-400 transition-colors">
                  {language === 'am' ? '→ መነሻ ገጽ' : '→ Home & Overview'}
                </a>
              </li>
              <li>
                <a href="#about-pillars" className="hover:text-amber-400 transition-colors">
                  {language === 'am' ? '→ ራዕይ፣ ተልዕኮና እሴቶች' : '→ Vision, Mission & 4 Pillars'}
                </a>
              </li>
              <li>
                <a href="#programs" className="hover:text-amber-400 transition-colors">
                  {language === 'am' ? '→ ሳምንታዊ የትምህርት ሰሌዳ' : '→ Weekly Curriculum'}
                </a>
              </li>
              <li>
                <a href="#events" className="hover:text-amber-400 transition-colors">
                  {language === 'am' ? '→ መጪ በዓላትና ክስተቶች' : '→ Upcoming Feasts & Events'}
                </a>
              </li>
              <li>
                <a href="#gallery-testimonials" className="hover:text-amber-400 transition-colors">
                  {language === 'am' ? '→ የፎቶ ጋለሪና ምስክርነቶች' : '→ Media Gallery & Testimonials'}
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-amber-400 transition-colors">
                  {language === 'am' ? '→ የካቴድራሉ አድራሻና ካርታ' : '→ Cathedral Map & Inquiry'}
                </a>
              </li>
            </ul>

            <div className="pt-2">
              <button
                type="button"
                onClick={openLoginModal}
                className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-500/40 text-amber-300 hover:text-white text-xs font-bold transition-all text-center cursor-pointer"
              >
                {language === 'am' ? 'የአስተዳዳሪ ዴስክ ግባ (CMS)' : 'Coordinator CMS Login'}
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Back to Top */}
        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © {currentYear} Welude Birhan • Holy Trinity Sunday School (በድሬዳዋ ቅድስት ሥላሴ ካቴድራል የብርሃን ልጆች ሰንበት ት/ቤት). All rights reserved.
          </p>

          <button
            type="button"
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
          >
            <span>Back to Top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </footer>
  );
}
