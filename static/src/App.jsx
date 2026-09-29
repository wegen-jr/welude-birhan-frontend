import React, { useEffect } from 'react';
import { CmsProvider, useCms } from './context/CmsContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import LoginModal from './components/auth/LoginModal';
import HomeSection from './components/public/HomeSection';
import AboutPillarsSection from './components/public/AboutPillarsSection';
import ProgramsSection from './components/public/ProgramsSection';
import GallerySection from './components/public/GallerySection';
import ContactSection from './components/public/ContactSection';
import CmsDashboard from './components/cms/CmsDashboard';

function AppContent() {
  const { currentView, setCurrentView, setActiveNavSection } = useCms();

  // Synchronize browser history and path with currentView
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      if (path.includes('/portal') || path.includes('/cms')) {
        setCurrentView('cms');
      } else {
        setCurrentView('public');
      }
    };

    // Check initial path on load
    const initialPath = window.location.pathname;
    if (initialPath.includes('/portal') || initialPath.includes('/cms')) {
      setCurrentView('cms');
    }

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, [setCurrentView]);

  // Sync window URL when currentView changes
  useEffect(() => {
    const currentPath = window.location.pathname;
    if (currentView === 'cms' && !currentPath.includes('/portal')) {
      window.history.pushState({ view: 'cms' }, '', '/portal/cms');
    } else if (currentView === 'public' && currentPath.includes('/portal')) {
      window.history.pushState({ view: 'public' }, '', '/');
    }
  }, [currentView]);

  // Scrollspy to automatically synchronize activeNavSection during scroll
  useEffect(() => {
    if (currentView !== 'public') return;

    const sectionIds = [
      'home',
      'about-pillars',
      'programs',
      'gallery-testimonials',
      'contact',
    ];

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 120; // 120px offset for h-20 header
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i]);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveNavSection(sectionIds[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentView, setActiveNavSection]);

  if (currentView === 'cms') {
    return <CmsDashboard />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#081226] text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950">
      <Navbar />
      <main className="flex-1">
        <HomeSection />
        <AboutPillarsSection />
        <ProgramsSection />
        <GallerySection />
        <ContactSection />
      </main>
      <Footer />
      <LoginModal />
    </div>
  );
}

export default function App() {
  return (
    <CmsProvider>
      <AppContent />
    </CmsProvider>
  );
}