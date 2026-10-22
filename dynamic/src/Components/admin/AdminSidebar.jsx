import Logo from "../../assets/logo.png";
import { UserPlus, HomeIcon, BadgeCheck, Settings, Globe, Moon, Sun, LogOut, Activity, BookOpen, Users, Music, Book, DollarSign, FileText, GraduationCap, Layers } from 'lucide-react';
import { useLanguage } from "@/Contexts/LanguageContext";
import { useNavigate, useLocation } from "react-router-dom";

export default function SideBar({ isDarkMode, toggleTheme }) {
  const { t, language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const nextLanguage = language === 'en' ? 'am' : 'en';

  let user = null;
  try {
    const raw = localStorage.getItem("user");
    if (raw && raw !== "undefined") {
      user = JSON.parse(raw);
    }
  } catch {
    user = null;
  }
  const role = user?.role || '';

  const allItems = {
    dashboard: { path: '/dashboard/admin', icon: HomeIcon, label: t.adminSide?.dashboard || 'Dashboard' },
    registration: { path: '/dashboard/registration', icon: UserPlus, label: t.adminSide?.registration || 'Registration' },
    roleAssigned: { path: '/dashboard/roleAssignemet', icon: BadgeCheck, label: t.adminSide?.roleAssigned || 'Role Assignment' },
    education: { path: '/dashboard/education', icon: Book, label: t.adminSide?.education || 'Education Hub' },
    teacherManagement: { path: '/dashboard/teachers', icon: Users, label: t.adminSide?.teacherManagement || 'Teacher Management' },
    courses: { path: '/dashboard/courses', icon: Layers, label: t.adminSide?.courses || 'Courses' },
    studentEnrollment: { path: '/dashboard/student-enrollment', icon: GraduationCap, label: t.adminSide?.studentEnrollment || 'Student Enrollment' },
    settings: { path: '/dashboard/settings', icon: Settings, label: t.adminSide?.setting || 'Settings' },
  };

  const normalizedRole = role.toUpperCase();
  let menuItems;
  if (normalizedRole === 'ADMIN') {
    menuItems = [
      allItems.dashboard,
      allItems.registration,
      allItems.roleAssigned,
      allItems.education,
      allItems.teacherManagement,
      allItems.courses,
      allItems.studentEnrollment,
      allItems.settings,
    ];
  } else if (normalizedRole === 'EDUCATION_LEADER' || role === 'EducationHub') {
    menuItems = [
      allItems.education,
      allItems.teacherManagement,
      allItems.courses,
      allItems.studentEnrollment,
      allItems.settings,
    ];
  } else {
    menuItems = [allItems.settings];
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/signin");
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
          {t.adminSide?.title || 'Welude Birhan'}
        </h1>
      </div>

      <nav className='flex-1 space-y-2 mt-4 overflow-y-auto pr-2'>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 ${isActive
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm font-semibold'
                : (isDarkMode ? 'text-slate-300 hover:bg-white/10 hover:text-white border border-transparent' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent')
                }`}
            >
              <item.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-amber-500' : (isDarkMode ? 'text-slate-400 group-hover:text-white' : 'text-slate-500')}`} />
              <span className='font-medium capitalize text-sm text-left'>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className={`pt-4 mt-4 border-t flex flex-col gap-3 transition-colors duration-300 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
        <div className="grid grid-cols-2 gap-3">
          <button
            className={`flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-colors text-sm border ${isDarkMode ? 'bg-white/5 hover:bg-white/10 border-white/15 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'}`}
            onClick={() => toggleLanguage(nextLanguage)}
          >
            <Globe className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="font-semibold">{nextLanguage === 'am' ? 'አማርኛ' : 'Eng'}</span>
          </button>

          <button
            className={`flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-colors text-sm border ${isDarkMode ? 'bg-white/5 hover:bg-white/10 border-white/15 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'}`}
            onClick={toggleTheme}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-500 shrink-0" /> : <Moon className="w-4 h-4 text-slate-700 shrink-0" />}
            <span className="font-semibold">{isDarkMode ? (t.adminSide?.light || 'Light') : (t.adminSide?.dark || 'Dark')}</span>
          </button>
        </div>

        <button
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-colors text-sm border hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 ${isDarkMode ? 'bg-white/5 border-white/15 text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-700'}`}
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span className="font-semibold">{t.adminSide?.logout || 'Logout'}</span>
        </button>
      </div>
    </div>
  );
}
