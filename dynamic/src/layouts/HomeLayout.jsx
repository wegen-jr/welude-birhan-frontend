import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { isAdmin } from '../Utils/Authorization';
import { ArrowLeft, LayoutDashboard } from 'lucide-react';

export default function HomeLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));
  const returnTo = location.state?.from;
  const showAdminButton = isAdmin(user) && Boolean(returnTo);

  return (
    <div className="min-h-screen flex flex-col bg-[#081226] text-slate-100 selection:bg-amber-500 selection:text-slate-950">
      <header className="sticky top-0 z-50">
        <Navbar />
        {showAdminButton && (
          <div className="fixed top-24 right-6 z-[9999]">
            <button
              onClick={() => navigate(returnTo)}
              className="
                group
                flex items-center gap-2
                rounded-full
                border border-amber-500/30
                bg-[#081226]/90
                px-4 py-2.5
                text-sm font-medium
                text-amber-400
                shadow-lg shadow-black/20
                backdrop-blur-md
                transition-all duration-200
                hover:border-amber-400/60
                hover:bg-[#0b1b3d]
                hover:text-amber-300
              "
            >
              <ArrowLeft
                size={16}
                className="transition-transform duration-200 group-hover:-translate-x-1"
              />
              <span>Dashboard</span>
              <LayoutDashboard
                size={15}
                className="opacity-60"
              />
            </button>
          </div>
        )}
      </header>
      
      <main className="flex-1 pt-20">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
