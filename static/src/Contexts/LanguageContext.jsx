// src/context/LanguageContext.jsx
import React, { createContext, useState, useContext } from 'react';
import { translations } from '../dectionary'; // Import the dictionary you made in Task 1

// 1. Create the Context
const LanguageContext = createContext();

// 2. Create the Provider Component
export function LanguageProvider({ children }) {
  // Set default language to 'en'
  const [language, setLanguage] = useState('en'); 

  // A helper function to change the language safely
  const toggleLanguage = (lang) => {
    setLanguage(lang);
  };

  // The 't' variable holds the exact dictionary for the current language
  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// 3. Create a custom hook so components can easily use it
export function useLanguage() {
  return useContext(LanguageContext);
}