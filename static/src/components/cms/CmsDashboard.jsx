import React from 'react';
import { useCms } from '../../context/CmsContext';
import logo from '../../assets/logo.png';
import OverviewTab from './tabs/OverviewTab';
import AboutTab from './tabs/AboutTab';
import MediaTab from './tabs/MediaTab';
import EventsTab from './tabs/EventsTab';
import TestimonialsTab from './tabs/TestimonialsTab';
import {
  LayoutDashboard, Church, Image, Calendar, MessageSquareQuote,
  ArrowLeft, LogOut, ExternalLink, RotateCcw, ShieldCheck, Sparkles
} from 'lucide-react';

export default function CmsDashboard() {
  const {
    activeCmsTab,
    setActiveCmsTab,
    setCurrentView,
    user,
    logout,
    resetAllData,
    language,
    stats,
  } = useCms();

  const tabs = [
    {
      id: 'overview',
      labelEn: 'System Overview',
      labelAm: 'አጠቃላይ ማጠቃለያ',
      icon: LayoutDashboard,
    },
    {
      id: 'about',
      labelEn: 'About & Church Photo',
      labelAm: 'የቤተክርስቲያን ፎቶና ታሪክ',
      icon: Church,
    },
    {
      id: 'media',
      labelEn: 'Media & Gallery Uploader',
      labelAm: 'ፎቶና ቪዲዮ መጫኛ',
      icon: Image,
      badge: stats.totalMedia,
    },
    {
      id: 'events',
      labelEn: 'Events & Notices',
      labelAm: 'በዓላትና ማስታወቂያዎች',
      icon: Calendar,
      badge: stats.totalEvents,
    },
    {
      id: 'testimonials',
      labelEn: 'Testimonials Manager',
      labelAm: 'የተማሪዎች ምስክርነት',
      icon: MessageSquareQuote,
      badge: stats.totalTestimonials,
    },
  ];

  const handleResetData = () => {
    if (window.confirm('Reset all CMS data to pristine church defaults?')) {
      resetAllData();
      alert('Mock store reset to initial church state.');
    }
  };

  return (
    <div className="min-h-screen bg-[#081226] text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* ========================================================
          CMS HEADER (Logged-in Status, Stats Pills, Live Site Toggle)
         ======================================================== */}
      <header className="sticky top-0 z-40 bg-[#0b1b3d]/95 backdrop-blur-md border-b border-amber-500/30 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
          
          {/* Left: "← View Live Public Site" Button & Branding */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setCurrentView('public')}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-amber-500/40 text-amber-300 hover:text-white hover:bg-amber-500/10 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm hover:scale-[1.02]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>← View Live Public Site</span>
            </button>

            <div className="h-6 w-px bg-slate-700 hidden sm:block" />

            <div className="flex items-center gap-3">
              <img
                src={logo}
                alt="Logo"
                className="w-9 h-9 rounded-full ring-2 ring-amber-400"
              />
              <div className="hidden md:flex flex-col">
                <span className="font-serif font-bold text-sm text-white">
                  Welude Birhan CMS
                </span>
                <span className="text-[10px] text-amber-400 uppercase tracking-widest font-semibold">
                  Dire Dawa Cathedral Desk
                </span>
              </div>
            </div>
          </div>

          {/* Center/Right: Quick Stats Pills & Logged-in Status */}
          <div className="flex items-center gap-3">
            
            {/* Quick Stats Pills */}
            <div className="hidden lg:flex items-center gap-2 text-xs">
              <span className="px-3 py-1 rounded-full bg-slate-800 text-emerald-400 border border-slate-700 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{stats.publishedEventsCount} Events</span>
              </span>

              <span className="px-3 py-1 rounded-full bg-slate-800 text-amber-300 border border-slate-700 font-semibold">
                {stats.totalMedia} Media
              </span>

              <span className="px-3 py-1 rounded-full bg-slate-800 text-blue-300 border border-slate-700 font-semibold">
                {stats.totalTestimonials} Quotes
              </span>
            </div>

            {/* Logged-in Status Pill */}
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>
                <strong className="text-white">Senior Content Coordinator</strong>
              </span>
            </div>

            <button
              type="button"
              onClick={handleResetData}
              className="hidden xl:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs border border-slate-700 cursor-pointer"
              title="Reset Mock Data"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Reset</span>
            </button>

            {/* Logout Action */}
            <button
              type="button"
              onClick={logout}
              className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
              title="Logout from CMS"
            >
              <LogOut className="w-4 h-4" />
            </button>

          </div>

        </div>
      </header>

      {/* ========================================================
          SIDEBAR DRIVEN INTERNAL OPERATIONS DECK
         ======================================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Tabs Deck */}
        <aside className="w-full md:w-64 shrink-0 space-y-4">
          <div className="bg-[#0b1b3d] border border-amber-500/30 rounded-3xl p-4 shadow-xl">
            <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">
              Operations Deck
            </div>

            <nav className="space-y-1.5" aria-label="CMS Tabs">
              {tabs.map((tab) => {
                const TabIcon = tab.icon;
                const isActive = activeCmsTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveCmsTab(tab.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold tracking-wide transition-all cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/25'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <TabIcon className="w-4 h-4" />
                      <span>{language === 'am' ? tab.labelAm : tab.labelEn}</span>
                    </div>

                    {tab.badge !== undefined && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                          isActive
                            ? 'bg-slate-950 text-amber-300'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Real-time State Bridge Indicator Box */}
          <div className="bg-[#0b1b3d]/70 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Real-Time State Bridge</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Every file upload, event post, or church narrative edit immediately propagates across all public views with zero page refresh.
            </p>
          </div>
        </aside>

        {/* Tab Content Display */}
        <main className="flex-1 min-w-0">
          {activeCmsTab === 'overview' && <OverviewTab />}
          {activeCmsTab === 'about' && <AboutTab />}
          {activeCmsTab === 'media' && <MediaTab />}
          {activeCmsTab === 'events' && <EventsTab />}
          {activeCmsTab === 'testimonials' && <TestimonialsTab />}
        </main>

      </div>

    </div>
  );
}
