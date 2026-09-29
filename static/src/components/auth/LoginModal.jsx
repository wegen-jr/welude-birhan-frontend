import React, { useState } from 'react';
import { useCms } from '../../context/CmsContext';
import logo from '../../assets/logo.png';
import { Lock, Mail, Key, ShieldCheck, X, ArrowLeft, Church } from 'lucide-react';

export default function LoginModal() {
  const { isLoginModalOpen, closeLoginModal, login, language } = useCms();

  const [email, setEmail] = useState('coordinator@weludebirhan.org');
  const [password, setPassword] = useState('••••••••');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isLoginModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    setTimeout(() => {
      if (!email.trim()) {
        setError('Please enter your coordinator email.');
        setIsSubmitting(false);
        return;
      }
      login({ email, name: 'Deacon Kidanewold' });
      setIsSubmitting(false);
    }, 350);
  };

  const handleQuickDemoLogin = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      login({ email: 'coordinator@weludebirhan.org', name: 'Deacon Kidanewold' });
      setIsSubmitting(false);
    }, 250);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeLoginModal();
      }}
    >
      <div className="relative w-full max-w-md bg-[#081226] border border-amber-500/40 rounded-3xl shadow-2xl shadow-black/90 overflow-hidden text-slate-100">
        
        {/* Top Gold Ornament Bar */}
        <div className="h-2 w-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600" />

        {/* Close Button */}
        <button
          type="button"
          onClick={closeLoginModal}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          
          {/* Church Branding Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="relative mb-3">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 via-amber-300 to-amber-600 p-0.5 shadow-lg shadow-amber-500/20">
                <img
                  src={logo}
                  alt="Welude Birhan"
                  className="w-full h-full object-cover rounded-full bg-[#0b1b3d]"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 p-1 rounded-full text-xs font-bold shadow">
                <Church className="w-3.5 h-3.5" />
              </div>
            </div>

            <h2 className="text-2xl font-bold font-serif text-white tracking-wide">
              {language === 'am' ? 'የአስተዳዳሪ መግቢያ' : 'Coordinator Portal'}
            </h2>
            <p className="text-xs uppercase tracking-widest text-amber-400 font-bold mt-1">
              {language === 'am' ? 'ድሬዳዋ ቅድስት ሥላሴ ሰንበት ት/ቤት' : 'Dire Dawa Holy Trinity Sunday School'}
            </p>
            <p className="text-xs text-slate-300 mt-2">
              {language === 'am'
                ? 'የካቴድራሉን ማስታወቂያዎች፣ በዓላት፣ ጋለሪና መረጃዎችን ለማስተዳደር ይግቡ።'
                : 'Sign in to manage cathedral announcements, liturgical feasts, media, and pillars.'}
            </p>
          </div>

          {/* Quick 1-Click Demo Access Box */}
          <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-200/90 leading-relaxed">
                <strong className="font-bold text-amber-300 block mb-0.5">
                  1-Click Coordinator Evaluation Access
                </strong>
                Instant bypass for administrative inspection without typing credentials.
              </div>
            </div>

            <button
              type="button"
              onClick={handleQuickDemoLogin}
              disabled={isSubmitting}
              className="mt-3 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Authenticating...' : '⚡ Quick Demo Login (Deacon Kidanewold)'}</span>
            </button>
          </div>

          <div className="relative flex py-2 items-center mb-6">
            <div className="flex-grow border-t border-slate-700"></div>
            <span className="flex-shrink mx-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Or Sign In With Email
            </span>
            <div className="flex-grow border-t border-slate-700"></div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="coordinator@weludebirhan.org"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0b1b3d] border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Key className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0b1b3d] border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm tracking-wide transition-all duration-200 shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>{isSubmitting ? 'Signing in...' : 'Sign In to Portal'}</span>
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={closeLoginModal}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Public Website</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
