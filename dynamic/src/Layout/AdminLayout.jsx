import React, { useState } from 'react'
import { Outlet } from "react-router-dom";
import SideBar from "../pages/admin/SideBar";

export default function AdminLayout() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const themeClasses = isDarkMode ? 'bg-[#081226] text-slate-100' : 'bg-slate-50 text-slate-800';
  const sidebarClasses = isDarkMode ? 'border-white/10 bg-[#0b1b3d]' : 'border-slate-200 bg-white shadow-[4px_0_24px_rgba(0,0,0,0.02)]';

  return (
    <div className={`flex h-screen overflow-hidden font-sans transition-colors duration-300 ${themeClasses}`}>
      <aside className={`w-72 border-r overflow-y-auto hidden md:block transition-colors duration-300 ${sidebarClasses}`}>
        <SideBar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      </aside>
      <div className='flex-1 overflow-y-auto relative'> 
        <Outlet context={{ isDarkMode }} />
      </div>
    </div>
  )
}
