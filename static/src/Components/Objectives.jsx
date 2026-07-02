import React from "react";
import { useLanguage } from "../Contexts/LanguageContext";

export default function Objectives() {
  const {t}= useLanguage();

  const sections = [
    {
      title: "ራዕይ (Vision)",
      content:t.objectives.vision,
    },
    {
      title: "ተልዕኮ (Mission)",
      content: t.objectives.mission,
    },
    {
      title: "ዋና እሴቶች (Core Values)",
      list: t.objectives.coreValues,
    },
    {
      title: "ስትራቴጂካዊ ግቦች (Strategic Goals)",
      list: t.objectives.goals
    },
    {
      title: "ዋና ዓላማዎች (Objectives)",
      list: t.objectives.objectives
    },
    {
      title: "መሪ ቃል (Motto)",
      content: t.objectives.moto
    },
  ];

  return (
    <div className="min-h-screen bg-blue-950 p-6">
      <h1 className="text-3xl font-bold text-center mb-8 text-yellow-500 capitalize font-bold">
        {t.objectives.title}
      </h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sections.map((section, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition"
          >
            <h2 className="text-xl font-semibold text-yellow-500 mb-4">
              {section.title}
            </h2>

            {section.content && (
              <p className="text-gray-700 leading-relaxed">
                {section.content}
              </p>
            )}

            {section.list && (
              <ul className="space-y-2 text-gray-700">
                {section.list.map((item, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="text-indigo-600 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}