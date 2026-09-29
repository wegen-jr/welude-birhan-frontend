import React, { useState } from 'react';
import { useCms } from '../../context/CmsContext';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, Church } from 'lucide-react';

export default function ContactSection() {
  const { language } = useCms();

  const [fullName, setFullName] = useState('');
  const [christianName, setChristianName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Registration Inquiry');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setFullName('');
      setChristianName('');
      setPhone('');
      setEmail('');
      setMessage('');
    }, 400);
  };

  return (
    <section id="contact" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#081226] text-slate-100">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest mb-3">
            <span>✝</span>
            <span>{language === 'am' ? 'ያግኙን' : 'Get In Touch'}</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold font-serif text-white tracking-tight">
            {language === 'am' ? 'የካቴድራሉ አድራሻ እና መልዕክት መላኪያ' : 'Contact & Cathedral Location'}
          </h2>
          <div className="h-1 w-20 bg-amber-500 mx-auto my-4 rounded-full" />
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {language === 'am'
              ? 'ስለ ተማሪዎች ምዝገባ፣ የበዓላት መርሃ ግብሮች ወይም የበጎ አድራጎት አገልግሎት ጥያቄ ካለዎት በቀጥታ ይላኩልን።'
              : 'Inquire about student enrollment, sacramental services, choir admissions, or visit our cathedral sanctuary in Dire Dawa.'}
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-10 items-start">
          
          {/* Column 1: Dire Dawa Location Details & Map Preview */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-[#0b1b3d] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-xl">
              <h3 className="font-serif font-bold text-xl text-white mb-6 flex items-center gap-3">
                <Church className="w-6 h-6 text-amber-400" />
                <span>
                  {language === 'am'
                    ? 'የቅድስት ሥላሴ ካቴድራል ቢሮ'
                    : 'Holy Trinity Cathedral Office'}
                </span>
              </h3>

              <div className="space-y-4 text-xs sm:text-sm text-slate-300">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-semibold">Physical Location:</strong>
                    <span>Kebele 02, Holy Trinity Cathedral Road, Dire Dawa, Ethiopia (በዲሬዳዋ ቅድስት ሥላሴ ካቴድራል)</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-semibold">Sunday School Hotline:</strong>
                    <span>+251 25 111 2345 / +251 91 555 6789</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-semibold">Email Desk:</strong>
                    <span>info@weludebirhan-diredawa.org</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-semibold">Office Hours:</strong>
                    <span>Tuesday – Sunday: 8:30 AM – 5:30 PM (Closed Mondays)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Location Card with Dire Dawa Coordinates */}
            <div className="bg-[#0b1b3d] border border-amber-500/30 rounded-3xl p-6 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Dire Dawa Geographical Coordinates
                </span>
                <span className="text-xs text-slate-400">9.5931° N, 41.8661° E</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Located near the historic Dire Dawa railway corridor and cathedral roundabout. Pilgrims and visitors are welcome daily for morning prayers and divine liturgy.
              </p>
              <div className="p-3 rounded-2xl bg-[#081226] border border-slate-700/60 flex items-center justify-between text-xs text-amber-300">
                <span>Diocese: Dire Dawa & Eastern Hararghe</span>
                <span className="font-bold">ሃገረ ስብከት</span>
              </div>
            </div>

          </div>

          {/* Column 2: Functional Inquiry Form */}
          <div className="lg:col-span-7 bg-[#0b1b3d] border border-amber-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl">
            
            <h3 className="font-serif font-bold text-2xl text-white mb-2">
              {language === 'am' ? 'መልዕክት ይላኩልን' : 'Send an Inquiry or Registration Request'}
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Our Sunday school coordinators review submitted inquiries daily.
            </p>

            {isSubmitted ? (
              <div className="p-8 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-center animate-fadeIn">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <h4 className="font-serif font-bold text-xl text-white mb-1">
                  {language === 'am' ? 'መልዕክትዎ በተሳካ ሁኔታ ደርሷል!' : 'Message Submitted Successfully!'}
                </h4>
                <p className="text-xs text-slate-300 max-w-md mx-auto mb-6">
                  {language === 'am'
                    ? 'እናመሰግናለን። የሰንበት ት/ቤቱ አስተባባሪዎች በቅርቡ ያነጋግሩዎታል። እግዚአብሔር ይስጥልን!'
                    : 'Thank you. A Sunday school coordinator will contact you shortly. God bless your spiritual journey!'}
                </p>
                <button
                  type="button"
                  onClick={() => setIsSubmitted(false)}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Full Legal Name (የሙሉ ስም) *
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Solomon Hailu"
                      className="w-full px-4 py-2.5 bg-[#081226] border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:border-amber-400 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Christian/Baptismal Name (የክርስትና ስም)
                    </label>
                    <input
                      type="text"
                      value={christianName}
                      onChange={(e) => setChristianName(e.target.value)}
                      placeholder="e.g. Wolde Trinity / ወልደ ሥላሴ"
                      className="w-full px-4 py-2.5 bg-[#081226] border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Phone Number (ስልክ ቁጥር) *
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +251 91 234 5678"
                      className="w-full px-4 py-2.5 bg-[#081226] border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:border-amber-400 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Email Address (ኢሜይል)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. solomon@gmail.com"
                      className="w-full px-4 py-2.5 bg-[#081226] border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Inquiry Topic / Purpose *
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#081226] border border-slate-700 rounded-xl text-white text-sm focus:border-amber-400 focus:outline-none"
                  >
                    <option value="Student Registration">New Student Sunday School Registration</option>
                    <option value="Choir Admission">Youth Choir (Mezmur) Auditions</option>
                    <option value="Geez Language">Classical Ge'ez Literacy Program</option>
                    <option value="Charity & Outreach">Charity Outreach / Donation</option>
                    <option value="General Inquiry">General Pastoral & Cathedral Inquiry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Your Message / Questions *
                  </label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Specify student age, division interest, or any specific questions..."
                    className="w-full px-4 py-2.5 bg-[#081226] border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:border-amber-400 focus:outline-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm uppercase tracking-wider shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>{language === 'am' ? 'መልዕክቱን ላክ' : 'Transmit Message to Coordinator Desk'}</span>
                </button>

              </form>
            )}

          </div>

        </div>

      </div>
    </section>
  );
}
