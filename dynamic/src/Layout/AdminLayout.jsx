import { useState, useEffect } from 'react';
import { Outlet } from "react-router-dom";
import SideBar from "../Components/admin/AdminSidebar";

export default function AdminLayout() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('welude_theme');
    return saved !== null ? saved === 'dark' : true;
  });

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem('welude_theme', next ? 'dark' : 'light');
      return next;
    });
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const themeClasses = isDarkMode ? 'dark bg-[#081226] text-slate-100' : 'bg-slate-50 text-slate-900';
  const sidebarClasses = isDarkMode ? 'border-white/10 bg-[#0b1b3d]' : 'border-slate-200 bg-white shadow-[4px_0_24px_rgba(0,0,0,0.02)]';

  return (
    <div className={`flex h-screen overflow-hidden font-sans transition-colors duration-300 ${themeClasses}`}>
      <aside className={`w-72 border-r overflow-y-auto hidden md:block transition-colors duration-300 ${sidebarClasses}`}>
        <SideBar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      </aside>
      <div className='flex-1 overflow-y-auto relative'>
        <Outlet context={{ isDarkMode, toggleTheme }} />
      </div>
    </div>
  );
}

