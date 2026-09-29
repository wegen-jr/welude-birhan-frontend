import React from 'react';
import { useCms } from '../../../context/CmsContext';
import {
  Calendar, Image, MessageSquareQuote, Church, CheckCircle,
  Clock, BellRing, ArrowRight, ShieldCheck, Sparkles, RefreshCw
} from 'lucide-react';

export default function OverviewTab() {
  const {
    stats,
    setActiveCmsTab,
    setCurrentView,
    aboutData,
    events,
    galleryItems,
    testimonials,
  } = useCms();

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#0b1b3d] via-[#122856] to-[#0b1b3d] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-widest mb-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Coordinator Console • Dire Dawa</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-serif text-white">
              System Operations & State Bridge Overview
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              All modifications made across these administrative modules instantly synchronize with the public website in real time using local client-side memory and file bridges.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setCurrentView('public')}
            className="self-start md:self-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 flex items-center gap-2 cursor-pointer transition-all"
          >
            <span>Preview Live Site</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Summary Counters Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div
          onClick={() => setActiveCmsTab('events')}
          className="bg-[#0b1b3d] border border-amber-500/30 rounded-2xl p-5 shadow-lg flex items-center justify-between cursor-pointer hover:border-amber-400/60 transition-colors group"
        >
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold group-hover:text-amber-300 transition-colors">
              Active Events
            </p>
            <p className="text-3xl font-extrabold font-serif text-white mt-1">
              {stats.publishedEventsCount}
            </p>
            <span className="text-[10px] text-slate-400 block mt-1">
              {stats.draftEventsCount} draft(s)
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div
          onClick={() => setActiveCmsTab('media')}
          className="bg-[#0b1b3d] border border-amber-500/30 rounded-2xl p-5 shadow-lg flex items-center justify-between cursor-pointer hover:border-amber-400/60 transition-colors group"
        >
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold group-hover:text-amber-300 transition-colors">
              Uploaded Media
            </p>
            <p className="text-3xl font-extrabold font-serif text-white mt-1">
              {stats.totalMedia}
            </p>
            <span className="text-[10px] text-slate-400 block mt-1">
              Photos & Videos
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
            <Image className="w-6 h-6" />
          </div>
        </div>

        <div
          onClick={() => setActiveCmsTab('testimonials')}
          className="bg-[#0b1b3d] border border-amber-500/30 rounded-2xl p-5 shadow-lg flex items-center justify-between cursor-pointer hover:border-amber-400/60 transition-colors group"
        >
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold group-hover:text-amber-300 transition-colors">
              Testimonials
            </p>
            <p className="text-3xl font-extrabold font-serif text-white mt-1">
              {stats.totalTestimonials}
            </p>
            <span className="text-[10px] text-slate-400 block mt-1">
              Student Quotes
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center">
            <MessageSquareQuote className="w-6 h-6" />
          </div>
        </div>

        <div
          onClick={() => setActiveCmsTab('about')}
          className="bg-[#0b1b3d] border border-amber-500/30 rounded-2xl p-5 shadow-lg flex items-center justify-between cursor-pointer hover:border-amber-400/60 transition-colors group"
        >
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold group-hover:text-amber-300 transition-colors">
              Sanctuary Status
            </p>
            <p className="text-lg font-bold font-serif text-amber-300 mt-2 truncate">
              {aboutData.establishedYear}
            </p>
            <span className="text-[10px] text-emerald-400 block mt-0.5">
              Active Showcase
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center">
            <Church className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Quick Action Shortcuts & Health */}
      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* Quick Shortcuts */}
        <div className="bg-[#0b1b3d] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
          <h3 className="font-serif font-bold text-lg text-white border-b border-slate-800 pb-2">
            Rapid Operations Shortcuts
          </h3>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setActiveCmsTab('events')}
              className="w-full p-4 rounded-2xl bg-[#081226] border border-slate-700/80 hover:border-amber-400/60 text-left flex items-center justify-between transition-colors cursor-pointer group"
            >
              <div>
                <strong className="text-white text-sm block group-hover:text-amber-400 transition-colors">
                  Create Announcement or Feast
                </strong>
                <span className="text-xs text-slate-400">
                  Publish notices to the 3-card drop zone or top urgent notice banner.
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
            </button>

            <button
              type="button"
              onClick={() => setActiveCmsTab('about')}
              className="w-full p-4 rounded-2xl bg-[#081226] border border-slate-700/80 hover:border-amber-400/60 text-left flex items-center justify-between transition-colors cursor-pointer group"
            >
              <div>
                <strong className="text-white text-sm block group-hover:text-amber-400 transition-colors">
                  Update Featured Church Photo
                </strong>
                <span className="text-xs text-slate-400">
                  Upload a new high-resolution church image using local file picker.
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
            </button>

            <button
              type="button"
              onClick={() => setActiveCmsTab('media')}
              className="w-full p-4 rounded-2xl bg-[#081226] border border-slate-700/80 hover:border-amber-400/60 text-left flex items-center justify-between transition-colors cursor-pointer group"
            >
              <div>
                <strong className="text-white text-sm block group-hover:text-amber-400 transition-colors">
                  Upload Gallery Photos or Video Clips
                </strong>
                <span className="text-xs text-slate-400">
                  Add local files or YouTube videos with categories and descriptions.
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
            </button>
          </div>
        </div>

        {/* Current Church Showcase Preview */}
        <div className="bg-[#0b1b3d] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="font-serif font-bold text-lg text-white border-b border-slate-800 pb-2 mb-4">
              Current Live Church Showcase
            </h3>

            <div className="relative rounded-2xl overflow-hidden h-44 bg-slate-950 border border-slate-700/80 mb-3">
              <img
                src={aboutData.sanctuaryImage}
                alt="Church Showcase"
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-2 left-2 bg-slate-950/85 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-500/30">
                Active Sanctuary Photo
              </span>
            </div>

            <h4 className="font-serif font-bold text-sm text-white mb-1">
              {aboutData.title}
            </h4>
            <p className="text-xs text-slate-400 line-clamp-2">
              {aboutData.caption}
            </p>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Client-side File Storage</span>
            <span className="text-emerald-400 font-bold">100% Synchronous</span>
          </div>
        </div>

      </div>

    </div>
  );
}
