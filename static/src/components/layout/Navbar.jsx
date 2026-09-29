import React, { useState } from 'react';
import { useCms } from '../../context/CmsContext';
import logo from '../../assets/logo.png';
import { Globe, Menu, X, ExternalLink, ShieldCheck } from 'lucide-react';

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

          {/* Utility Actions (Right) */}
          <div className="hidden sm:flex items-center space-x-3">
            
            {/* Language Toggle Capsule: AMH | ENG */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-300 hover:text-white hover:border-amber-400 hover:bg-amber-500/20 text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-sm"
              title="Toggle Amharic / English"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'am' ? 'ENG' : 'አማርኛ'}</span>
            </button>

            {/* Primary Action Button: "CMS PORTAL ⎘" */}
            <button
              type="button"
              onClick={handlePortalAction}
              className="relative inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-md transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-98"
            >
              <span>{language === 'am' ? 'የአስተዳዳሪ ፖርታል ⎘' : 'CMS PORTAL ⎘'}</span>
              {isAuthenticated && (
                <span className="w-2 h-2 rounded-full bg-emerald-950 animate-pulse ml-0.5" />
              )}
            </button>

          </div>

          {/* Mobile Hamburger Menu Toggle */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              type="button"
              onClick={toggleLanguage}
              className="px-2 py-1 rounded-lg border border-amber-500/40 text-amber-300 text-xs font-bold"
            >
              {language === 'am' ? 'ENG' : 'አማ'}
            </button>

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

          <div className="pt-4 border-t border-slate-700/80">
            <button
              type="button"
              onClick={handlePortalAction}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-sm tracking-wide shadow-md cursor-pointer"
            >
              <span>{language === 'am' ? 'የአስተዳዳሪ ፖርታል ⎘' : 'CMS PORTAL ⎘'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
