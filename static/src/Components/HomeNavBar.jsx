import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import { useLanguage } from '../Contexts/LanguageContext';
import { useContent } from '../Contexts/ContentContext';
import { Lock, LogIn, LayoutDashboard, Globe, Menu, X, Church } from 'lucide-react';

export default function HomeNavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const { t, language, toggleLanguage } = useLanguage();
  const { openLoginModal, isAuthenticated, user } = useContent();
  const navigate = useNavigate();

  const nextLanguage = language === 'en' ? 'am' : 'en';

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handlePortalClick = (e) => {
    e.preventDefault();
    if (isOpen) setIsOpen(false);

    if (isAuthenticated) {
      navigate('/portal/cms');
    } else {
      openLoginModal();
    }
  };

  // Reusable styling for links
  const navLinkStyles =
    'px-3 py-2 text-sm font-medium text-slate-200 hover:text-amber-400 hover:bg-white/5 rounded-lg transition-colors duration-200';

  return (
    <nav className="w-full relative z-50 bg-[#081226]/95 backdrop-blur-md border-b border-amber-500/20 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Logo & Church Branding */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <img
                src={logo}
                alt="Welude Birhan Logo"
                className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-400/60 group-hover:ring-amber-400 transition-all shadow-md"
              />
              <div className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 p-0.5 rounded-full text-[10px]">
                ✝
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-lg text-white group-hover:text-amber-300 transition-colors tracking-wide leading-tight">
                {language === 'am' ? 'ወሉደ ብርሃን' : 'Welude Birhan'}
              </span>
              <span className="text-[11px] font-sans font-medium text-amber-400 tracking-wider uppercase">
                {language === 'am' ? 'ቅድስት ሥላሴ ሰንበት ት/ቤት' : 'Holy Trinity Sunday School'}
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center space-x-1">
            <a href="#home" className={navLinkStyles}>{t.Navbar.home}</a>
            <a href="#about" className={navLinkStyles}>{t.Navbar.about}</a>
            <a href="#programs" className={navLinkStyles}>{t.Navbar.programs}</a>
            <a href="#events" className={navLinkStyles}>{t.Navbar.Events}</a>
            <a href="#gallery" className={navLinkStyles}>{t.Navbar.Gallery || 'Gallery'}</a>
            <a href="#contact" className={navLinkStyles}>{t.Navbar.contact}</a>
          </div>

          {/* Right Action Area (Language Toggle & Prominent Portal Login) */}
          <div className="hidden sm:flex items-center space-x-3">
            {/* Language Toggle Button */}
            <button
              onClick={() => toggleLanguage(nextLanguage)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-amber-500/40 text-amber-300 hover:text-white hover:border-amber-400 hover:bg-amber-500/10 text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer"
              title="Toggle Amharic / English"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{nextLanguage === 'am' ? 'Amh' : 'Eng'}</span>
            </button>

            {/* Prominent Portal Login Button */}
            <button
              onClick={handlePortalClick}
              className="relative inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-md shadow-amber-500/25 hover:shadow-amber-500/40 transition-all duration-200 cursor-pointer active:scale-95"
            >
              {isAuthenticated ? (
                <>
                  <LayoutDashboard className="w-4 h-4" />
                  <span>CMS Portal</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>{t.Navbar.portalLogin || 'Portal Login'}</span>
                </>
              )}
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={() => toggleLanguage(nextLanguage)}
              className="p-1.5 rounded-lg border border-amber-500/40 text-amber-300 text-xs font-bold uppercase"
            >
              {nextLanguage === 'am' ? 'Amh' : 'Eng'}
            </button>
            <button
              onClick={toggleMenu}
              className="p-2 rounded-lg text-amber-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="sm:hidden bg-[#0b1b3d] border-b border-amber-500/30 px-4 pt-3 pb-6 space-y-2 shadow-2xl animate-fadeIn">
          <a
            href="#home"
            onClick={toggleMenu}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:text-amber-400 hover:bg-white/5"
          >
            {t.Navbar.home}
          </a>
          <a
            href="#about"
            onClick={toggleMenu}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:text-amber-400 hover:bg-white/5"
          >
            {t.Navbar.about}
          </a>
          <a
            href="#programs"
            onClick={toggleMenu}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:text-amber-400 hover:bg-white/5"
          >
            {t.Navbar.programs}
          </a>
          <a
            href="#events"
            onClick={toggleMenu}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:text-amber-400 hover:bg-white/5"
          >
            {t.Navbar.Events}
          </a>
          <a
            href="#gallery"
            onClick={toggleMenu}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:text-amber-400 hover:bg-white/5"
          >
            {t.Navbar.Gallery || 'Gallery'}
          </a>
          <a
            href="#contact"
            onClick={toggleMenu}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:text-amber-400 hover:bg-white/5"
          >
            {t.Navbar.contact}
          </a>

          <div className="pt-4 border-t border-slate-700/60">
            <button
              onClick={handlePortalClick}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm tracking-wide shadow-md shadow-amber-500/30 transition-all cursor-pointer"
            >
              {isAuthenticated ? (
                <>
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Go to CMS Portal</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>{t.Navbar.portalLogin || 'Portal Login'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}