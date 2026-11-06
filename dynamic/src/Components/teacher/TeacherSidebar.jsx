import Logo from "../../assets/logo.png";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardCheck,
  LogOut,
  X,
  GraduationCap,
  ClipboardList,
  Globe,
  Moon,
  Sun,
} from "lucide-react";
import { useLanguage } from "../../Contexts/LanguageContext";

export default function TeacherSidebar({
  onClose,
  isDarkMode = true,
  toggleTheme,
}) {
  const { t, language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();
  const nextLanguage = language === "en" ? "am" : "en";

  const links = [
    {
      to: "/teacherDashboard",
      label: t.teacher?.sidebar?.dashboard || "Dashboard",
      icon: LayoutDashboard,
      end: true,
    },
    {
      to: "/teacherDashboard/attendance",
      label: t.teacher?.sidebar?.attendance || "Attendance",
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

  const handleNavClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div
      className={`flex h-full flex-col p-4 sm:p-5 transition-colors duration-300 ${
        isDarkMode
          ? "bg-[#081226] text-white"
          : "bg-white text-slate-800"
      }`}
    >
      {/* Brand Header */}
      <div
        className={`flex items-center justify-between pb-5 border-b transition-colors ${
          isDarkMode ? "border-white/10" : "border-slate-200"
        }`}
      >
        <div className="flex items-center gap-3">
          <img
            src={Logo}
            alt="logo"
            className={`h-10 w-10 rounded-xl p-1 border shadow-sm ${
              isDarkMode
                ? "bg-white/5 border-white/10"
                : "bg-slate-50 border-slate-200"
            }`}
          />
          <div>
            <h2 className="text-sm sm:text-base font-bold font-serif text-amber-500 tracking-wide">
              {t.teacher?.sidebar?.title || "Welude Birhan"}
            </h2>
            <p className="text-xs text-slate-400">
              {t.teacher?.sidebar?.subtitle || "Instructor Portal"}
            </p>
          </div>
        </div>

        {/* Mobile Close Button */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className={`p-2 rounded-xl border transition-colors md:hidden ${
              isDarkMode
                ? "border-white/10 text-slate-400 hover:text-white hover:bg-white/5"
                : "border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Nav Menu Links */}
      <nav className="flex-1 space-y-1.5 py-4 overflow-y-auto">
        <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          {t.teacher?.sidebar?.workspace || "Teacher Workspace"}
        </p>

        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={handleNavClick}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3.5 py-3 text-xs sm:text-sm font-medium transition-all ${
                isActive
                  ? "bg-amber-500 font-bold text-[#081226] shadow-sm"
                  : isDarkMode
                  ? "text-slate-300 hover:bg-white/5 hover:text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`
            }
          >
            <Icon className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer Controls: Language, Theme, Logout */}
      <div
        className={`pt-4 border-t flex flex-col gap-2.5 transition-colors ${
          isDarkMode ? "border-white/10" : "border-slate-200"
        }`}
      >
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => toggleLanguage(nextLanguage)}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium transition-colors text-xs border ${
              isDarkMode
                ? "bg-white/5 hover:bg-white/10 border-white/10 text-slate-300"
                : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700"
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>{nextLanguage === "am" ? "አማርኛ" : "Eng"}</span>
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium transition-colors text-xs border ${
              isDarkMode
                ? "bg-white/5 hover:bg-white/10 border-white/10 text-slate-300"
                : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700"
            }`}
          >
            {isDarkMode ? (
              <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-slate-700 shrink-0" />
            )}
            <span>{isDarkMode ? "Light" : "Dark"}</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium transition-colors text-xs border hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/30 ${
            isDarkMode
              ? "bg-white/5 border-white/10 text-slate-300"
              : "bg-slate-100 border-slate-200 text-slate-700"
          }`}
        >
          <LogOut className="w-3.5 h-3.5 shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
