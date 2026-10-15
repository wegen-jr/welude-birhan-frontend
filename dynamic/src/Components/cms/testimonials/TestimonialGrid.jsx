import React from "react";
import TestimonialCard from "./TestimonialCard";
import { useLanguage } from "../../../Contexts/LanguageContext";

export default function TestimonialGrid({
  testimonials,
  loading,
  onEdit,
  onDelete,
  isDarkMode,
}) {
  const { t } = useLanguage();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p
          className={
            isDarkMode
              ? "text-slate-500 text-sm"
              : "text-slate-400 text-sm"
          }
        >
          {t.cmsTestimonials.loading}
        </p>
      </div>
    );
  }

  if (!testimonials.length) {
    return (
      <div
        className={`
          py-20
          text-center
          rounded-xl
          border
          ${
            isDarkMode
              ? "border-white/10 bg-[#0b1b3d]"
              : "border-slate-200 bg-white"
          }
        `}
      >
        <p
          className={`
            text-sm
            font-medium
            ${
              isDarkMode
                ? "text-slate-300"
                : "text-slate-600"
            }
          `}
        >
          {t.cmsTestimonials.empty.title}
        </p>

        <p
          className={`
            mt-1
            text-xs
            ${
              isDarkMode
                ? "text-slate-500"
                : "text-slate-400"
            }
          `}
        >
          {t.cmsTestimonials.empty.description}
        </p>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
      {testimonials.map((testimonial) => (
        <TestimonialCard
          key={testimonial.id}
          testimonial={testimonial}
          onEdit={onEdit}
          onDelete={onDelete}
          isDarkMode={isDarkMode}
        />
      ))}
    </div>
  );
}
