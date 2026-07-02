import React from "react";
import {  Mail, Phone } from "lucide-react";
import { useLanguage } from "../Contexts/LanguageContext";

export default function Footer() {
  const year = new Date().getFullYear();
  const { t } = useLanguage();

  return (
    <footer className="bg-[#501502] text-white border-t border-yellow-300">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-bold mb-4 capitalize">
              {t.footer.title}
            </h3>
            <p className="text-gray-300 leading-relaxed">
              {t.footer.description}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">{t.footer.links}</h3>
            <ul className="space-y-2 text-gray-300">
              <li>
                <a href="#home" className="hover:text-white">
                  {t.footer.home}
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-white">
                  {t.footer.about}
                </a>
              </li>
              <li>
                <a href="#objectives" className="hover:text-white">
                  {t.footer.mission}
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-white">
                  {t.footer.contact}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <hr className="border-yellow-500 my-8" />

        <div className="text-center text-gray-400">
          <p>
            © {year} {t.footer.copyright}
          </p>

          <p className="mt-2 text-sm">
             {t.footer.moto} 
          </p>
        </div>
      </div>
    </footer>
  );
}