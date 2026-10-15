import React from 'react'
import Logo from "../../assets/logo.png"; 
import { UserPlus, HomeIcon, BadgeCheck, Settings, Globe, Moon, Sun, LogOut } from 'lucide-react'; 
import { useLanguage } from "../../Contexts/LanguageContext";
import { useNavigate, useLocation } from "react-router-dom";

export default function SideBar({ isDarkMode, toggleTheme }) {
    const { t, language, toggleLanguage } = useLanguage();
    const navigate = useNavigate();
    const location = useLocation();
    const nextLanguage = language === 'en' ? 'am' : 'en';

    const menuItems = [
      { path: '/dashboard', icon: HomeIcon, label: t.adminSide.dashboard },
      { path: '/dashboard/registration', icon: UserPlus, label: t.adminSide.registration },
      { path: '/dashboard/roleAssignemet', icon: BadgeCheck, label: t.adminSide.roleAssigned },
      { path: '/dashboard/settings', icon: Settings, label: t.adminSide.setting },
    ];

    const handleLogout = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/signIn");
    };

    return (
    <div className="flex flex-col h-full py-6 px-4">
        <div className='flex flex-col items-center mb-8'>
            <img 
              src={Logo} 
              alt="logo" 
              className={`w-20 h-20 rounded-xl shadow-lg p-2 mb-4 border transition-colors duration-300 ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`} 
            />
            <h1 className='text-amber-500 font-serif font-bold text-lg tracking-wide capitalize text-center'>
                {t.adminSide.title}
            </h1>
        </div>

        <nav className='flex-1 space-y-2 mt-4'>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
              return (
                <button 
                  key={item.path}
                  onClick={() => navigate(item.path)} 
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 ${
                    isActive 
                      ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-sm' 
                      : (isDarkMode ? 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800 border border-transparent')
                  }`}
                >
                    <item.icon className={`w-5 h-5 ${isActive ? 'text-amber-500' : (isDarkMode ? 'text-slate-400' : 'text-slate-500')}`} />
                    <span className='font-medium capitalize text-sm'>{item.label}</span>
                </button>
              );
            })}
        </nav>

        <div className={`pt-6 mt-6 border-t flex flex-col gap-3 transition-colors duration-300 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
            <div className="grid grid-cols-2 gap-3">
              <button 
                className={`flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-colors text-sm border ${isDarkMode ? 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'}`}
                onClick={() => toggleLanguage(nextLanguage)}
              >
                  <Globe className="w-4 h-4 text-amber-500" />
                  <span>{nextLanguage === 'am' ? 'አማርኛ' : 'Eng'}</span>
              </button>

              <button 
                className={`flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-colors text-sm border ${isDarkMode ? 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'}`}
                onClick={toggleTheme}
              >
                  {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-slate-700" />}
                  <span>{isDarkMode ? 'Light' : 'Dark'}</span>
              </button>
            </div>
            
            <button 
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-colors text-sm border hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 ${isDarkMode ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'}`}
              onClick={handleLogout}
            >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
            </button>
        </div>
    </div>
  )
}
