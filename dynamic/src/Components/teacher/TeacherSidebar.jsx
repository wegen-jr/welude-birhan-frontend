import Logo from "../../assets/logo.png";
import { NavLink, useNavigate ,useLocation} from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardCheck,
  LogOut,
  X,
  GraduationCap,
  ClipboardList,
   Globe, Moon, Sun 
} from "lucide-react";

import { useLanguage } from "../../Contexts/LanguageContext";
export default function TeacherSidebar({
  mobileOpen,
  setMobileOpen,
   isDarkMode, 
   toggleTheme ,
}) {
const { t, language, toggleLanguage } = useLanguage();
    const navigate = useNavigate();
    const location = useLocation();
    const nextLanguage = language === 'en' ? 'am' : 'en';
  const links = [
    {
      to: "/teacherDashboard",
      label: t.teacher.sidebar.dashboard,
      icon: LayoutDashboard,
      end: true,
    },
    {
      to: "/teacherDashboard/attendance",
      label: t.teacher.sidebar.attendance,
      icon: ClipboardCheck,
      end: false,
    },
    {
  to: "/teacherDashboard/attendance-list",
  label: "Attendance History",
  icon: ClipboardList,
  end: false,
  },
  {
  to: "/teacherDashboard/results",
  label: "Student Results",
  icon: GraduationCap,
  end: false,
},
  ];

  const handleLogout = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/signIn");
    };

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label={t.teacher.sidebar.close}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col
            border-r transition-colors duration-300
            ${isDarkMode
              ? "border-white/10 bg-[#081226] text-white"
              : "border-slate-200 bg-white text-slate-800 shadow-[4px_0_24px_rgba(0,0,0,0.02)]"
            }
            transition-transform duration-300
            ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
            lg:translate-x-0`}
        >
        <div className={`flex items-center justify-between border-b p-6 ${
            isDarkMode ? "border-white/10" : "border-slate-200"}`}>          <div className="flex items-center gap-3">
            <div className="rounded-xl">
                <img src={Logo} alt="logo" className="h-10 w-10 rounded-xl" />
            </div>

            <div>
              <h2 className="font-bold">
                {t.teacher.sidebar.title}
              </h2>
              <p className="text-xs text-slate-400">
                {t.teacher.sidebar.subtitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="lg:hidden"
            aria-label={t.teacher.sidebar.close}
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-2 p-4">
          <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
            {t.teacher.sidebar.workspace}
          </p>

          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 transition-colors ${
                  isActive
                    ? "bg-amber-500 font-semibold text-[#081226]"
                    : isDarkMode
                      ? "text-slate-300 hover:bg-white/5 hover:text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`
              }
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </NavLink>
          ))}
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
      </aside>
    </>
  );
}
