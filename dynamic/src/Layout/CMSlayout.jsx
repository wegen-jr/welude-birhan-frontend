import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Sidebar from "../Components/cms/Sidebar";

export default function CMSlayout() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const themeClasses = isDarkMode
    ? "bg-[#081226] text-slate-100"
    : "bg-slate-50 text-slate-800";

  const sidebarClasses = isDarkMode
    ? "border-white/10 bg-[#0b1b3d]"
    : "border-slate-200 bg-white shadow-[4px_0_24px_rgba(0,0,0,0.02)]";

  return (
    <div
      className={`flex h-screen overflow-hidden font-sans transition-colors duration-300 ${themeClasses}`}
    >

      {/* Desktop Sidebar */}
      <aside
        className={`
          hidden md:block
          w-72 shrink-0
          border-r
          overflow-y-auto
          ${sidebarClasses}
        `}
      >
        <Sidebar
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
        />
      </aside>


      {/* Main Area */}
      <div className="flex min-w-0 flex-1 flex-col">

        {/* Mobile Header */}
        <header
          className={`
            flex h-14 shrink-0 items-center
            border-b
            px-4
            md:hidden
            ${sidebarClasses}
          `}
        >
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="
              flex h-9 w-9
              items-center justify-center
              rounded-lg
              text-slate-300
              transition
              hover:bg-white/10
              hover:text-amber-400
            "
          >
            <Menu size={21} />
          </button>

          <span className="ml-3 text-sm text-slate-300 font-bold">
            CMS
          </span>
        </header>


        {/* Page Content */}
        <main className="min-w-0 flex-1 overflow-y-auto">
          <Outlet context={{ isDarkMode }} />
        </main>

      </div>


      {/* Mobile Sidebar Overlay */}
      <div
        className={`
          fixed inset-0 z-50 md:hidden
          transition-opacity duration-300
          ${isSidebarOpen
            ? "visible opacity-100"
            : "invisible opacity-0"
          }
        `}
      >

        {/* Backdrop */}
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        />

        {/* Drawer */}
        <aside
          className={`
            absolute left-0 top-0
            h-full w-72
            overflow-y-auto
            border-r
            ${sidebarClasses}
            transform
            transition-transform duration-300 ease-out
            ${isSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
            }
          `}
        >

          <Sidebar
            isDarkMode={isDarkMode}
            toggleTheme={toggleTheme}
          />

          {/* Close Button */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="
              absolute right-3 top-4
              flex h-9 w-9
              items-center justify-center
              rounded-lg
              text-slate-300
              transition
              hover:bg-white/10
              hover:text-amber-400
            "
          >
            <X size={19} />
          </button>

        </aside>

      </div>

    </div>
  );
}