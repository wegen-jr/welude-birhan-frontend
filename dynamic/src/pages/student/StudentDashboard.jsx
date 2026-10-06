import React from 'react';
import { Calendar, BookOpen, Download, MapPin } from 'lucide-react';

export function StudentDashboard() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white">Student Portal</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface rounded-3xl p-6 border border-slate-800 col-span-2">
          <h2 className="text-xl font-bold text-white mb-6">Personal Progress</h2>
          <div className="flex items-center gap-6">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="56" className="stroke-slate-800" strokeWidth="12" fill="none" />
                <circle cx="64" cy="64" r="56" className="stroke-accent" strokeWidth="12" fill="none" strokeDasharray="351" strokeDashoffset="70" strokeLinecap="round" />
              </svg>
              <div className="absolute text-center">
                <span className="text-2xl font-bold text-white">80%</span>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Attendance</p>
              </div>
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-300">Lessons Completed</span>
                  <span className="text-white font-medium">12 / 15</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '80%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-300">Recitation Score</span>
                  <span className="text-white font-medium">95%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: '95%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-3xl p-6 border border-slate-800">
          <h2 className="text-xl font-bold text-white mb-6">Next Class</h2>
          <div className="bg-background rounded-2xl p-4 border border-slate-800 text-center space-y-3">
            <Calendar className="w-8 h-8 text-accent mx-auto mb-2" />
            <div>
              <h3 className="font-bold text-white">Sunday, 9:00 AM</h3>
              <p className="text-sm text-slate-400">Catechism Part 3</p>
            </div>
            <div className="flex items-center justify-center gap-1 text-xs text-slate-500 bg-surface py-2 rounded-lg mt-4">
              <MapPin className="w-3 h-3" /> Hall A (Main Building)
            </div>
          </div>
        </div>
      </div>

      <div className="bg-surface rounded-3xl p-6 border border-slate-800">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-500" /> Study Resources
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-center gap-4 p-4 bg-background rounded-2xl border border-slate-800 hover:border-slate-600 transition group cursor-pointer">
            <div className="p-3 bg-red-500/10 rounded-xl text-red-500">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-medium text-white group-hover:text-accent transition">Hymn Lyrics PDF</h4>
              <p className="text-xs text-slate-500">2.4 MB</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-background rounded-2xl border border-slate-800 hover:border-slate-600 transition group cursor-pointer">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-medium text-white group-hover:text-accent transition">Study Notes - Week 3</h4>
              <p className="text-xs text-slate-500">1.1 MB</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
