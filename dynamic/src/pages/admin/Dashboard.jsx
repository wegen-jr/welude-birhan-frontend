import React from 'react';
import { UserPlus, Users, Activity } from 'lucide-react';
import { useLanguage } from "../../Contexts/LanguageContext";
import { useOutletContext } from "react-router-dom";
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';

export default function Dashboard() {
  const { isDarkMode } = useOutletContext();
  const { t } = useLanguage();

  const genderData = [
    { name: 'Male', value: 300 },
    { name: 'Female', value: 200 },
  ];
  const PIE_COLORS = ['#3b82f6', '#f59e0b'];

  const ageData = [
    { name: '0-18 yrs', members: 45 },
    { name: '19-30 yrs', members: 150 },
    { name: '31-45 yrs', members: 200 },
    { name: '46+ yrs', members: 105 },
  ];

  return (
    <div className={`p-6 lg:p-10 w-full min-h-screen font-sans transition-colors duration-300 ${isDarkMode ? 'bg-[#081226] text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className={`text-3xl font-bold font-serif capitalize ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{t.dashboard.title}</h2>
          <p className={`mt-1 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Overview and statistics for Welude Birhan members</p>
        </div>
      </div>

      {/* --- TOP ROW: SUMMARY CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Total Members Card */}
        <div className={`p-6 rounded-3xl shadow-xl flex items-center gap-6 group hover:border-amber-500/50 transition-colors border ${isDarkMode ? 'bg-[#0b1b3d] border-white/10' : 'bg-white border-slate-200'}`}>
          <div className="bg-amber-500/20 p-4 rounded-2xl text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-colors">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <p className={`text-sm font-medium capitalize mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{t.dashboard.totalMembers}</p>
            <p className={`font-extrabold text-3xl ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>500</p>
          </div>
        </div>

        {/* Total Male Card */}
        <div className={`p-6 rounded-3xl shadow-xl flex items-center gap-6 group hover:border-blue-500/50 transition-colors border ${isDarkMode ? 'bg-[#0b1b3d] border-white/10' : 'bg-white border-slate-200'}`}>
          <div className="bg-blue-500/20 p-4 rounded-2xl text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
            <Activity className="w-8 h-8" />
          </div>
          <div>
            <p className={`text-sm font-medium capitalize mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{t.dashboard.totalMale}</p>
            <p className={`font-extrabold text-3xl ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>300</p>
          </div>
        </div>

        {/* Total Female Card */}
        <div className={`p-6 rounded-3xl shadow-xl flex items-center gap-6 group hover:border-amber-500/50 transition-colors border ${isDarkMode ? 'bg-[#0b1b3d] border-white/10' : 'bg-white border-slate-200'}`}>
          <div className="bg-amber-500/20 p-4 rounded-2xl text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-colors">
            <UserPlus className="w-8 h-8" />
          </div>
          <div>
            <p className={`text-sm font-medium capitalize mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{t.dashboard.totalFemale}</p>
            <p className={`font-extrabold text-3xl ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>200</p>
          </div>
        </div>

      </div>

      {/* --- BOTTOM ROW: CHARTS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* PIE CHART CONTAINER */}
        <div className={`p-6 rounded-3xl shadow-xl flex flex-col h-[400px] border ${isDarkMode ? 'bg-[#0b1b3d] border-white/10' : 'bg-white border-slate-200'}`}>
          <h3 className={`text-lg font-bold mb-6 capitalize ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{t.dashboard.genderDistribution}</h3>
          <div className="w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke={isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: isDarkMode ? '#081226' : '#ffffff', borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', color: isDarkMode ? '#f8fafc' : '#0f172a', borderRadius: '12px' }}
                  itemStyle={{ color: isDarkMode ? '#f8fafc' : '#0f172a' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ color: isDarkMode ? '#f8fafc' : '#0f172a' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* BAR CHART CONTAINER */}
        <div className={`p-6 rounded-3xl shadow-xl flex flex-col h-[400px] border ${isDarkMode ? 'bg-[#0b1b3d] border-white/10' : 'bg-white border-slate-200'}`}>
          <h3 className={`text-lg font-bold mb-6 capitalize ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{t.dashboard.membersAge}</h3>
          <div className="w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
                  contentStyle={{ backgroundColor: isDarkMode ? '#081226' : '#ffffff', borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', color: isDarkMode ? '#f8fafc' : '#0f172a', borderRadius: '12px' }}
                />
                <Bar dataKey="members" fill="#f59e0b" radius={[6, 6, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}