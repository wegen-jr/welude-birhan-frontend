// src/contexts/LanguageContext.jsx
import React, { createContext, useState, useContext } from 'react';
import { translations } from '@/dectionary'; // Adjust the path as necessary

// 1. Create the Context
export const LanguageContext = createContext(null);

// 2. Create the Provider Component
export function LanguageProvider({ children }) {
    // Set default language to saved language or 'en'
    const [language, setLanguage] = useState(() => {
        try {
            const saved = localStorage.getItem('welude_language');
            return saved === 'am' || saved === 'en' ? saved : 'en';
        } catch {
            return 'en';
        }
    });

    // A helper function to change the language safely (supports both toggleLanguage() and toggleLanguage('am'))
    const toggleLanguage = (lang) => {
        setLanguage((prev) => {
            const next = typeof lang === 'string' ? lang : (prev === 'en' ? 'am' : 'en');
            try {
                localStorage.setItem('welude_language', next);
            } catch {
                // ignore local storage errors
            }
            return next;
        });
    };

    // Proxy to safely fall back to English if a key is missing in the chosen language
    const currentDict = translations[language] || translations['en'] || {};
    const t = new Proxy(currentDict, {
        get(target, prop) {
            if (prop in target) return target[prop];
            return translations['en']?.[prop];
        }
    });

    return (
        <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

// 3. Create a custom hook so components can easily use it
export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        const fallbackDict = translations['en'] || {};
        return {
            language: 'en',
            setLanguage: () => { },
            toggleLanguage: () => { },
            t: fallbackDict,
        };
    }
    return context;
}

export default LanguageProvider;