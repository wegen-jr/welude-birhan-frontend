import React from 'react';
import { Users, UserCheck, BookOpen, Clock } from 'lucide-react';

export function Dashboard() {
  const stats = [
    { label: 'Total Members', value: '1,240', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Active Teachers', value: '45', icon: UserCheck, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Enrolled Students', value: '850', icon: BookOpen, color: 'text-accent', bg: 'bg-accent/10' },
    { label: 'Pending Reg.', value: '12', icon: Clock, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-surface rounded-3xl p-6 border border-slate-800 flex items-center gap-4">
            <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">{stat.label}</p>
              <h3 className="text-2xl font-bold text-white mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-surface rounded-3xl p-6 border border-slate-800 h-96">
        <h2 className="text-xl font-bold text-white mb-4">Audit Activity Feed</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4 text-sm">
            <div className="w-2 h-2 rounded-full bg-accent"></div>
            <p className="text-slate-300"><span className="font-semibold text-white">Abebe</span> approved registration for <span className="text-white">Kebede</span></p>
            <span className="text-slate-500 ml-auto">2 mins ago</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <p className="text-slate-300"><span className="font-semibold text-white">Sara</span> added new material to <span className="text-white">Grade 4 Class</span></p>
            <span className="text-slate-500 ml-auto">1 hour ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}
