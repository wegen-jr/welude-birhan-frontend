import React from "react";
import {
  Quote,
  GraduationCap,
} from "lucide-react";

export default function TestimonialCard({ testimonial }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl">

      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[#081226]">

        {testimonial.imageUrl ? (
          <img
            src={testimonial.imageUrl}
            alt={testimonial.name || ""}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <GraduationCap
              size={42}
              className="text-[#c9a44c]"
              strokeWidth={1.2}
            />
          </div>
        )}

        <div className="absolute right-4 top-4 rounded-full bg-[#c9a44c] px-3 py-1.5 text-xs font-semibold text-white">
          {testimonial.year}
        </div>

      </div>

      {/* Content */}
      <div className="p-6">

        <div className="flex items-start gap-3">

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f5eddd]">
            <GraduationCap
              size={19}
              className="text-[#c9a44c]"
            />
          </div>

          <div>
            <h2 className="text-lg font-semibold">
              {testimonial.name}
            </h2>

            {testimonial.baptismalName && (
              <p className="mt-0.5 text-xs text-slate-400">
                {testimonial.baptismalName}
              </p>
            )}
          </div>

        </div>

        {testimonial.graduateTitle && (
          <p className="mt-5 text-sm font-medium text-[#8d702b]">
            {testimonial.graduateTitle}
          </p>
        )}

        {testimonial.inspirationQuote && (
          <div className="relative mt-5 border-t border-slate-100 pt-5">

            <Quote
              size={22}
              className="mb-2 text-[#c9a44c]/60"
            />

            <blockquote className="text-sm leading-7 text-slate-500">
              {testimonial.inspirationQuote}
            </blockquote>

          </div>
        )}

      </div>
    </article>
  );
}