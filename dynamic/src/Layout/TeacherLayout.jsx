import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";

import TeacherSidebar from "../Components/teacher/TeacherSidebar";
import { useLanguage } from "../Contexts/LanguageContext";

export default function TeacherLayout() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { t } = useLanguage();

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const themeClasses = isDarkMode
    ? "bg-[#081226] text-slate-100"
    : "bg-slate-50 text-slate-900";

  const sidebarClasses = isDarkMode
    ? "border-white/10 bg-[#0b1b3d]"
    : "border-slate-200 bg-white shadow-[4px_0_24px_rgba(0,0,0,0.02)] text-slate-800";

  return (
    <div
      className={`flex h-screen overflow-hidden font-sans transition-colors duration-300 ${themeClasses}`}
    >
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:block w-72 shrink-0 border-r overflow-y-auto ${sidebarClasses}`}
      >
        <TeacherSidebar
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          mobileOpen={false}
          setMobileOpen={() => {}}
        />
      </aside>

      {/* Main Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile Header */}
        <header
          className={`flex h-14 shrink-0 items-center border-b px-4 md:hidden ${sidebarClasses}`}
        >
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            aria-label={t.teacher.sidebar.open}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-black/5 hover:text-amber-500 dark:text-slate-300"
          >
            <Menu size={21} />
          </button>

          <span className="ml-3 text-sm font-bold">
            {t.teacher.sidebar.title}
          </span>
        </header>

        {/* Page Content */}
        <main className="min-w-0 flex-1 overflow-y-auto">
          <Outlet context={{ isDarkMode }} />
        </main>
      </div>

      {/* Mobile Sidebar Drawer */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <button
            type="button"
            aria-label={t.teacher.sidebar.close}
            onClick={() => setIsSidebarOpen(false)}
            className="absolute inset-0 h-full w-full bg-black/60 backdrop-blur-[2px]"
          />

          {/* Drawer */}
          <aside
            className={`absolute inset-y-0 left-0 z-10 w-72 overflow-y-auto border-r ${sidebarClasses}`}
          >
            <TeacherSidebar
              mobileOpen={true}
              setMobileOpen={setIsSidebarOpen}
              isDarkMode={isDarkMode}
              toggleTheme={toggleTheme}
            />
          </aside>
        </div>
      )}
    </div>
  );
}
