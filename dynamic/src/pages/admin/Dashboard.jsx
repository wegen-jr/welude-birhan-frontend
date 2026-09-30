import React from 'react';
import { UserPlus, Users, Activity } from 'lucide-react';
import {useLanguage} from "../../Contexts/LanguageContext";
import { 
  PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer 
} from 'recharts';

export default function Dashboard() {
  // --- MOCK DATA (Replace with your actual backend data) ---
  
  // Data for Pie Chart (Gender Distribution)
  const genderData = [
    { name: 'Male', value: 300 },
    { name: 'Female', value: 200 },
  ];
  const PIE_COLORS = ['#4A1010', '#d97706']; // Dark Red & Amber-600

  // Data for Bar Chart (Age Distribution)
  const ageData = [
    { name: '0-18 yrs', members: 45 },
    { name: '19-30 yrs', members: 150 },
    { name: '31-45 yrs', members: 200 },
    { name: '46+ yrs', members: 105 },
  ];
  const {t}=useLanguage();
  return (
    <div className="bg-amber-200 p-4 w-full h-screen max-w-6xl  ">
      <h2 className="text-[#4A1010] text-2xl font-bold mb-6 px-2">{t.dashboard.title}</h2>

      {/* --- TOP ROW: SUMMARY CARDS --- */}
      <div className="bg-[#4A1010] grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 p-5 rounded-2xl">
        
        {/* Total Members Card */}
        <div className="flex flex-col justify-center items-center bg-amber-100 text-[#4A1010] h-32 rounded-2xl shadow-lg transition-transform hover:scale-105">
          <Users className="w-8 h-8 mb-2" />
          <p className="capitalize font-bold text-sm">{t.dashboard.totalMembers}</p>
          <p className="font-extrabold text-2xl">500</p>
        </div>

        {/* Total Male Card */}
        <div className="flex flex-col justify-center items-center bg-amber-100 text-[#4A1010] h-32 rounded-2xl shadow-lg transition-transform hover:scale-105">
          <Activity className="w-8 h-8 mb-2" />
          <p className="capitalize font-bold text-sm">{t.dashboard.totalMale}</p>
          <p className="font-extrabold text-2xl">300</p>
        </div>

        {/* Total Female Card (Your Original Design) */}
        <div className="flex flex-col justify-center items-center bg-amber-100 text-[#4A1010] h-32 rounded-2xl shadow-lg transition-transform hover:scale-105">
          <UserPlus className="w-8 h-8 mb-2" />
          <p className="capitalize font-bold text-sm">{t.dashboard.totalFemale}</p>
          <p className="font-extrabold text-2xl">200</p>
        </div>

      </div>

      {/* --- BOTTOM ROW: CHARTS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* PIE CHART CONTAINER */}
        <div className="bg-amber-100 p-4 rounded-2xl shadow-lg flex flex-col items-center h-80">
          <h3 className="text-[#4A1010] font-bold mb-2 capitalize">{t.dashboard.genderDistribution}</h3>
          <div className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#4A1010', color: '#fef3c7', borderRadius: '8px' }} 
                  itemStyle={{ color: '#fef3c7' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* BAR CHART CONTAINER */}
        <div className="bg-amber-100 p-4 rounded-2xl shadow-lg flex flex-col items-center h-80">
          <h3 className="text-[#4A1010] font-bold mb-2 capitalize">{t.dashboard.membersAge}</h3>
          <div className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
                <XAxis dataKey="name" tick={{ fill: '#4A1010', fontSize: 12 }} />
                <YAxis tick={{ fill: '#4A1010' }} />
                <Tooltip 
                  cursor={{ fill: 'rgba(74, 16, 16, 0.1)' }}
                  contentStyle={{ backgroundColor: '#4A1010', color: '#fef3c7', borderRadius: '8px' }}
                />
                <Legend />
                <Bar dataKey="members" fill="#4A1010" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}