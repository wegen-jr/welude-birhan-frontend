import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Make sure react-router-dom is installed
import logo from "../assets/logo.png";
import { useLanguage } from "../Contexts/LanguageContext";
export default function HomeNavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const {t, language, toggleLanguage } = useLanguage();

  const nextLanguage = language === 'en' ? 'am' : 'en';

  // Function to toggle the mobile menu
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Reusable styling for links to keep code clean
  const navLinkStyles = "hover:bg-yellow-300 transition-colors duration-300 rounded-full px-4 py-2 md:px-2 md:py-1 hover:text-white";

  return (
    // 'relative z-50' ensures the mobile menu drops down over your page content
    <nav className='w-full relative z-50 bg-blue-950 shadow-sm '>
      <div className='max-w-7xl mx-auto px-4 py-3 flex justify-between items-center text-yellow-500'>
        
        {/* Logo Section */}
        <div className='flex items-center'>
          <Link to="/">
            <img src={logo} alt="cross section" className='w-10 h-10 rounded-full' />
          </Link>
        </div>

        {/* Desktop Menu (Hidden on Mobile) */}
        <div className='hidden md:flex items-center justify-end gap-4 mr-10'>
          <Link to="/" className={navLinkStyles}>{t.Navbar.home}</Link>
          <Link to="/about" className={navLinkStyles}>{t.Navbar.about}</Link>
          <Link to="/programs" className={navLinkStyles}>{t.Navbar.programs}</Link>
          <Link to="/events" className={navLinkStyles}>{t.Navbar.Events}</Link>
          <Link to="/gallery" className={navLinkStyles}>{t.Navbar.Gallary}</Link>
          <Link to="/contacts" className={navLinkStyles}>{t.Navbar.contact}</Link>

          <button className='bg-gray-600 border border-yellow-400  px-2 hover:cursor-pointer'
          onClick={()=>toggleLanguage(nextLanguage)}>{nextLanguage==='am'?t.Navbar.Amh:t.Navbar.Eng}</button>
        </div>

        {/* Mobile Hamburger Icon (Hidden on Desktop) */}
        <div className='md:hidden flex items-center'>
          <button 
            onClick={toggleMenu} 
            className='text-yellow-500 focus:outline-none'
          >
            {isOpen ? (
              // Close "X" Icon
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              // Hamburger Menu Icon
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

      </div>

      {/* Mobile Menu Dropdown */}
      <div 
        className={`${
          isOpen ? 'flex' : 'hidden'
        } md:hidden absolute top-full left-0 w-full bg-blue-950 shadow-lg flex-col items-center gap-2 py-4 text-yellow-500`}
      >
        {/* Added onClick={toggleMenu} so the menu closes when a link is clicked */}
        <Link to="/" onClick={toggleMenu} className={navLinkStyles}>{t.Navbar.home}</Link>
        <Link to="/about" onClick={toggleMenu} className={navLinkStyles}>{t.Navbar.about}</Link>
        <Link to="/programs" onClick={toggleMenu} className={navLinkStyles}>{t.Navbar.programs}</Link>
        <Link to="/events" onClick={toggleMenu} className={navLinkStyles}>{t.Navbar.Events}</Link>
        <Link to="/gallery" onClick={toggleMenu} className={navLinkStyles}>{t.Navbar.Gallary}</Link>
        <Link to="/contacts" onClick={toggleMenu} className={navLinkStyles}>{t.Navbar.contact}</Link>

        <Link 
          to="/signIn" 
          onClick={toggleMenu}
          className='bg-yellow-500 text-white py-2 px-6 mt-2 rounded-2xl font-bold hover:bg-yellow-600 transition-colors duration-300'
        >
          {t.Navbar.JoinUs}
        </Link>
          <button className='bg-gray-600 border border-yellow-400  px-2 hover:cursor-pointer'
          onClick={()=>toggleLanguage(nextLanguage)}>{nextLanguage==='am'?t.Navbar.Amh:t.Navbar.Eng}</button>
      </div>
    </nav>
  )
}