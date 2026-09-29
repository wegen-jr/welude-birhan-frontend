import React, { useState } from 'react';
import { useCms } from '../../context/CmsContext';
import logo from '../../assets/logo.png';
import { Globe, Menu, X, LogIn, User } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const {
    activeNavSection,
    setActiveNavSection,
    language,
    toggleLanguage,
    isAuthenticated,
    openLoginModal,
    setCurrentView,
    currentView,
  } = useCms();

  const navLinks = [
    { id: 'home', labelEn: 'Home', labelAm: 'መነሻ' },
    { id: 'about-pillars', labelEn: 'About & Pillars', labelAm: 'ስለ እኛ እና 4ቱ ምሰሶዎች' },
    { id: 'programs', labelEn: 'Programs', labelAm: 'መርሃ ግብሮች' },
    { id: 'gallery-testimonials', labelEn: 'Gallery & Testimonials', labelAm: 'ጋለሪና ምስክርነት' },
    { id: 'contact', labelEn: 'Contact', labelAm: 'አድራሻ' },
  ];

  const handleLinkClick = (sectionId) => {
    setActiveNavSection(sectionId);
    setMobileMenuOpen(false);

    if (currentView === 'cms') {
      setCurrentView('public');
    }

    const element = document.getElementById(sectionId);
    if (element) {
      const navOffset = 80;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementPosition - navOffset,
        behavior: 'smooth',
      });
    }
  };

  const handlePortalAction = () => {
    setMobileMenuOpen(false);
    if (isAuthenticated) {
      setCurrentView('cms');
    } else {
      openLoginModal();
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-20 bg-[#081226]/95 backdrop-blur-md border-b border-amber-500/20 shadow-xl transition-all">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-full">
          
          {/* Brand Cluster (Left) */}
          <button
            type="button"
            onClick={() => handleLinkClick('home')}
            className="flex items-center gap-3.5 group cursor-pointer text-left"
          >
            <div className="relative">
              <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-amber-500 via-amber-300 to-amber-600 shadow-md group-hover:scale-105 transition-transform duration-300 ring-2 ring-amber-400/40">
                <img
                  src={logo}
                  alt="Welude Birhan Emblem"
                  className="w-full h-full object-cover rounded-full bg-[#0b1b3d]"
                />
              </div>
              <span className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 p-0.5 rounded-full text-[10px] font-bold shadow">
                ✝
              </span>
            </div>

            <div className="flex flex-col">
              <span className="font-serif font-black text-xl text-white tracking-wide group-hover:text-amber-400 transition-colors leading-tight">
                {language === 'am' ? 'ወሉደ ብርሃን' : 'Welude Birhan'}
              </span>
              <span className="text-[11px] font-sans font-semibold tracking-wider text-amber-400 uppercase">
                {language === 'am'
                  ? 'የቅድስት ሥላሴ ሰንበት ት/ቤት • ዲሬዳዋ'
                  : 'HOLY TRINITY SUNDAY SCHOOL • ዲሬዳዋ'}
              </span>
            </div>
          </button>

          {/* Navigation Links (Center) */}
          <nav className="hidden lg:flex items-center space-x-1" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const isActive = activeNavSection === link.id;

              return (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => handleLinkClick(link.id)}
                  className={`relative px-4 py-2 text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'text-amber-400'
                      : 'text-slate-300 hover:text-white hover:bg-white/5 rounded-lg'
                  }`}
                >
                  <span>{language === 'am' ? link.labelAm : link.labelEn}</span>
                  
                  {/* Warm Gold Underline Indicator */}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500 rounded-full animate-fadeIn" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Utility Actions (Right - Desktop) */}
          <div className="hidden sm:flex items-center gap-3">
            
            {/* Language Toggle Capsule: AMH | ENG */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/30 bg-[#0b172d]/80 text-xs font-semibold tracking-wider hover:border-amber-400/60 hover:bg-amber-500/10 transition-all duration-200 cursor-pointer shadow-sm"
              title="Toggle Amharic / English (ቋንቋ ቀይር)"
              aria-label="Toggle language"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span className="flex items-center gap-1 font-bold text-xs">
                <span className={language === 'am' ? 'text-amber-400 font-extrabold' : 'text-slate-400'}>AMH</span>
                <span className="text-amber-500/30 text-[10px]">|</span>
                <span className={language === 'en' ? 'text-amber-400 font-extrabold' : 'text-slate-400'}>ENG</span>
              </span>
            </button>

            {/* Public-Appropriate Sign-In Capsule Icon */}
            <button
              type="button"
              onClick={handlePortalAction}
              className="relative w-10 h-10 rounded-full flex items-center justify-center bg-[#0b172d]/90 border border-amber-500/30 text-amber-400/90 hover:text-amber-300 hover:border-amber-400/70 hover:bg-amber-500/15 hover:shadow-[0_0_12px_rgba(245,158,11,0.2)] transition-all duration-200 cursor-pointer active:scale-95 shadow-sm group"
              title={isAuthenticated ? (language === 'am' ? 'የተጠቃሚ መለያ' : 'User Account') : (language === 'am' ? 'ይግቡ' : 'Sign In')}
              aria-label={isAuthenticated ? (language === 'am' ? 'የተጠቃሚ መለያ' : 'User Account') : (language === 'am' ? 'ይግቡ' : 'Sign In')}
            >
              {isAuthenticated ? (
                <User className="w-4 h-4 text-amber-300 transition-transform group-hover:scale-110" />
              ) : (
                <LogIn className="w-4 h-4 text-amber-400 transition-transform group-hover:scale-110 ml-0.5" />
              )}
              {isAuthenticated && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#081226] animate-pulse" />
              )}
            </button>

          </div>

          {/* Mobile Actions & Menu Toggle */}
          <div className="flex sm:hidden items-center gap-2">
            {/* Mobile Language Toggle */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-amber-500/30 bg-[#0b172d]/80 text-xs font-bold"
              aria-label="Toggle language"
            >
              <span className={language === 'am' ? 'text-amber-400' : 'text-slate-400'}>AMH</span>
              <span className="text-amber-500/30 text-[10px]">|</span>
              <span className={language === 'en' ? 'text-amber-400' : 'text-slate-400'}>ENG</span>
            </button>

            {/* Mobile User Icon */}
            <button
              type="button"
              onClick={handlePortalAction}
              className="relative w-9 h-9 rounded-full flex items-center justify-center bg-[#0b172d]/90 border border-amber-500/30 text-amber-400 hover:text-amber-300 hover:border-amber-400/60 hover:bg-amber-500/10 transition-all duration-200 cursor-pointer shadow-sm active:scale-95"
              title={isAuthenticated ? (language === 'am' ? 'የተጠቃሚ መለያ' : 'User Account') : (language === 'am' ? 'ይግቡ' : 'Sign In')}
              aria-label={isAuthenticated ? (language === 'am' ? 'የተጠቃሚ መለያ' : 'User Account') : (language === 'am' ? 'ይግቡ' : 'Sign In')}
            >
              {isAuthenticated ? (
                <User className="w-4 h-4 text-amber-300" />
              ) : (
                <LogIn className="w-4 h-4 text-amber-400 ml-0.5" />
              )}
              {isAuthenticated && (
                <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#081226] animate-pulse" />
              )}
            </button>

            {/* Mobile Hamburger Drawer Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-amber-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Toggle navigation drawer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Smooth Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-[#081226]/98 border-b border-amber-500/30 px-4 pt-3 pb-6 space-y-2 shadow-2xl animate-fadeIn backdrop-blur-lg">
          {navLinks.map((link) => {
            const isActive = activeNavSection === link.id;

            return (
              <button
                key={link.id}
                type="button"
                onClick={() => handleLinkClick(link.id)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-base font-semibold transition-colors flex items-center justify-between ${
                  isActive
                    ? 'text-amber-400 bg-amber-500/10 border-l-4 border-amber-400 pl-3'
                    : 'text-slate-200 hover:text-amber-400 hover:bg-white/5'
                }`}
              >
                <span>{language === 'am' ? link.labelAm : link.labelEn}</span>
                {isActive && <span className="text-amber-400">●</span>}
              </button>
            );
          })}

          <div className="pt-3 border-t border-amber-500/20">
            <button
              type="button"
              onClick={handlePortalAction}
              className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-[#0b172d]/90 border border-amber-500/30 text-amber-300 hover:text-white hover:bg-amber-500/15 hover:border-amber-400/60 transition-all font-semibold text-sm cursor-pointer shadow-sm"
            >
              {isAuthenticated ? <User className="w-4 h-4 text-amber-400" /> : <LogIn className="w-4 h-4 text-amber-400" />}
              <span>{isAuthenticated ? (language === 'am' ? 'የተጠቃሚ መለያ' : 'User Account') : (language === 'am' ? 'ይግቡ' : 'Sign In')}</span>
              {isAuthenticated && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-1" />
              )}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
