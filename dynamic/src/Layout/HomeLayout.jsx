import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Components/layout/Navbar';
import Footer from '../Components/layout/Footer';
export default function HomeLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#081226] text-slate-100 selection:bg-amber-500 selection:text-slate-950">
      <header className="sticky top-0 z-50">
        <Navbar />
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
