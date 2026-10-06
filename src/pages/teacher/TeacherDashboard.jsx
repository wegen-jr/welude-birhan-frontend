import React from 'react';
import { Users, FileText, CheckSquare, Upload } from 'lucide-react';

export function TeacherDashboard() {
  const classes = [
    { id: 1, grade: 'Grade 4', room: 'Hall A', students: 35 },
    { id: 2, grade: 'Grade 5', room: 'Hall B', students: 42 },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white">Teacher Portal</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-surface rounded-3xl p-6 border border-slate-800">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-accent" /> Assigned Classes
          </h2>
          <div className="space-y-4">
            {classes.map(c => (
              <div key={c.id} className="p-4 rounded-2xl bg-background border border-slate-800 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-white">{c.grade}</h3>
                  <p className="text-sm text-slate-400">Room: {c.room}</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-accent">{c.students}</span>
                  <p className="text-xs text-slate-400">Students</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface rounded-3xl p-6 border border-slate-800">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-green-500" /> Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 rounded-2xl bg-background border border-slate-800 hover:border-accent transition group text-left">
              <CheckSquare className="w-6 h-6 text-slate-400 group-hover:text-accent mb-3" />
              <h3 className="font-medium text-white">Take Attendance</h3>
              <p className="text-xs text-slate-500 mt-1">Record weekly presence</p>
            </button>
            <button className="p-4 rounded-2xl bg-background border border-slate-800 hover:border-accent transition group text-left">
              <FileText className="w-6 h-6 text-slate-400 group-hover:text-accent mb-3" />
              <h3 className="font-medium text-white">Enter Grades</h3>
              <p className="text-xs text-slate-500 mt-1">Spiritual exams & recitation</p>
            </button>
            <button className="p-4 rounded-2xl bg-background border border-slate-800 hover:border-accent transition group text-left col-span-2 flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <Upload className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h3 className="font-medium text-white">Upload Material</h3>
                <p className="text-xs text-slate-500">Share PDF notes or audio hymns</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
