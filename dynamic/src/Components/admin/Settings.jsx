import React from "react";
import { User, Lock, Globe, Settings as SettingsIcon } from 'lucide-react';
import { useNavigate, useOutletContext } from "react-router-dom";
import profile from "../../assets/account.png";
import { useLanguage } from "../../Contexts/LanguageContext";

export default function Settings() {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { isDarkMode } = useOutletContext();

    const buttonClass = `flex items-center justify-start gap-4 px-6 py-4 rounded-2xl mb-3 transition-colors ${
        isDarkMode 
            ? 'hover:bg-white/5 border border-transparent hover:border-white/10' 
            : 'hover:bg-slate-100 border border-transparent hover:border-slate-200'
    }`;
    
    const iconClass = `w-6 h-6 ${isDarkMode ? 'text-amber-500' : 'text-slate-500'}`;
    const textClass = `font-medium capitalize ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`;

    return (
        <div className={`min-h-screen flex items-start justify-center p-6 lg:p-10 transition-colors duration-300 ${isDarkMode ? 'bg-[#081226]' : 'bg-slate-50'}`}>
            <div className={`w-full max-w-2xl rounded-3xl shadow-xl transition-colors duration-300 border ${isDarkMode ? 'bg-[#0b1b3d] border-white/10' : 'bg-white border-slate-200'}`}>
                
                <div className={`flex flex-col items-center justify-center p-8 border-b ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
                    <img src={profile} alt="profile picture" className={`w-24 h-24 rounded-full shadow-lg border-4 ${isDarkMode ? 'border-white/10' : 'border-slate-100'}`} />
                    <h2 className={`mt-4 text-xl font-bold font-serif ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Admin Settings</h2>
                </div>
                
                <div className="flex flex-col p-6">
                    <button onClick={() => navigate('/dashboard/settings/profile')} className={buttonClass}>
                        <User className={iconClass} />
                        <p className={textClass}>{t.setting.profile}</p>
                    </button>
                    <button onClick={() => navigate('/dashboard/settings/credentialsChanger')} className={buttonClass}>
                        <Lock className={iconClass} />
                        <p className={textClass}>{t.setting.changer}</p>
                    </button>
                    <button onClick={() => navigate('/dashboard/settings/')} className={buttonClass}>
                        <Globe className={iconClass} />
                        <p className={textClass}>{t.setting.language}</p>
                    </button>
                    <button onClick={() => navigate('/dashboard/settings/profile')} className={buttonClass}>
                        <SettingsIcon className={iconClass} />
                        <p className={textClass}>Account Setup</p>
                    </button>
                    
                    <div className={`my-8 border-t ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`} />
                    
                    <div className={`flex flex-col font-serif text-sm justify-center items-center opacity-70 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        <p className="text-center mb-2 italic">"{t.setting.moto}"</p>
                        <p>© {t.setting.copyright}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}