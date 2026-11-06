import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import TeacherSidebar from "../Components/teacher/TeacherSidebar";
import { useLanguage } from "../Contexts/LanguageContext";

export default function TeacherLayout() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("welude_theme");
    return saved !== null ? saved === "dark" : true;
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { t } = useLanguage();

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem("welude_theme", next ? "dark" : "light");
      return next;
    });
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const themeClasses = isDarkMode
    ? "dark bg-[#081226] text-slate-100"
    : "bg-slate-50 text-slate-900";

  const sidebarClasses = isDarkMode
    ? "border-white/10 bg-[#081226]"
    : "border-slate-200 bg-white shadow-[4px_0_24px_rgba(0,0,0,0.02)] text-slate-800";

  return (
    <div
      className={`flex h-screen overflow-hidden font-sans transition-colors duration-300 ${themeClasses}`}
    >
      {/* Desktop Sidebar (hidden on < md, visible on md+) */}
      <aside
        className={`hidden md:block w-72 shrink-0 border-r overflow-y-auto transition-colors duration-300 ${sidebarClasses}`}
      >
        <TeacherSidebar
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
        />
      </aside>

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Mobile Header (< md) with Hamburger Menu Toggle */}
        <header
          className={`flex h-14 shrink-0 items-center justify-between border-b px-4 md:hidden z-20 ${sidebarClasses}`}
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              aria-label={t.teacher?.sidebar?.open || "Open navigation menu"}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-inherit text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 transition cursor-pointer"
            >
              <Menu size={20} />
            </button>

            <span className="text-sm font-bold font-serif text-amber-500">
              {t.teacher?.sidebar?.title || "Welude Birhan"}
            </span>
          </div>

          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
            Instructor
          </span>
        </header>

        {/* Page Content */}
        <main className="min-w-0 flex-1 overflow-y-auto">
          <Outlet context={{ isDarkMode, toggleTheme }} />
        </main>
      </div>

      {/* Mobile Sidebar Slide-out Drawer Overlay (< md) */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${
          isSidebarOpen
            ? "visible opacity-100"
            : "invisible opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="absolute inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity"
          aria-label={t.teacher?.sidebar?.close || "Close navigation menu"}
        />

        {/* Slide-out Drawer */}
        <aside
          className={`absolute inset-y-0 left-0 w-72 max-w-[85vw] border-r shadow-2xl transition-transform duration-300 ease-in-out ${sidebarClasses} ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <TeacherSidebar
            isDarkMode={isDarkMode}
            toggleTheme={toggleTheme}
            onClose={() => setIsSidebarOpen(false)}
          />
        </aside>
      </div>
    </div>
  );
}
