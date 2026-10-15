import React from "react";
import { Edit3, Trash2, GraduationCap } from "lucide-react";
import { useLanguage } from "../../../Contexts/LanguageContext";

export default function TestimonialCard({
  testimonial,
  onEdit,
  onDelete,
  isDarkMode,
}) {
  const { t } = useLanguage();

  return (
    <article
      className={`
        overflow-hidden
        rounded-xl
        border
        transition-all duration-300
        ${
          isDarkMode
            ? "bg-[#0b1b3d] border-white/10"
            : "bg-white border-slate-200"
        }
      `}
    >
      {/* Image */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={testimonial.imageUrl}
          alt={testimonial.name}
          className="w-full h-full object-cover"
        />

        <div
          className="
            absolute
            top-3
            left-3
            w-9 h-9
            rounded-full
            bg-black/40
            backdrop-blur-sm
            flex
            items-center
            justify-center
          "
        >
          <GraduationCap
            size={18}
            className="text-white"
            strokeWidth={1.5}
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3
              className={`
                text-base
                font-semibold
                ${
                  isDarkMode
                    ? "text-white"
                    : "text-[#1d2940]"
                }
              `}
            >
              {testimonial.name}
            </h3>

            <p
              className={`
                mt-0.5
                text-xs
                ${
                  isDarkMode
                    ? "text-slate-500"
                    : "text-slate-400"
                }
              `}
            >
              {testimonial.baptismalName}
            </p>
          </div>

          <span
            className="
              shrink-0
              px-2.5 py-1
              rounded-full
              text-[10px]
              font-medium
              bg-[#c9a44c]/10
              text-[#c9a44c]
            "
          >
            {testimonial.year}
          </span>
        </div>

        <p
          className={`
            mt-4
            text-xs
            font-medium
            ${
              isDarkMode
                ? "text-slate-300"
                : "text-slate-600"
            }
          `}
        >
          {testimonial.graduateTitle}
        </p>

        <div
          className={`
            mt-4
            pl-3
            border-l-2
            border-[#c9a44c]
          `}
        >
          <p
            className={`
              text-xs
              leading-6
              italic
              ${
                isDarkMode
                  ? "text-slate-400"
                  : "text-slate-500"
              }
            `}
          >
            “{testimonial.inspirationQuote}”
          </p>
        </div>

        {/* Actions */}
        <div
          className={`
            mt-5
            pt-4
            border-t
            flex
            items-center
            justify-end
            gap-2
            ${
              isDarkMode
                ? "border-white/10"
                : "border-slate-100"
            }
          `}
        >
          <button
            type="button"
            onClick={() => onEdit(testimonial)}
            className={`
              p-2
              rounded-lg
              transition-colors
              ${
                isDarkMode
                  ? "text-slate-400 hover:text-white hover:bg-white/5"
                  : "text-slate-400 hover:text-[#1d2940] hover:bg-slate-50"
              }
            `}
            title={t.cmsTestimonials.actions.edit}
          >
            <Edit3 size={15} strokeWidth={1.5} />
          </button>

          <button
            type="button"
            onClick={() => onDelete(testimonial)}
            className={`
              p-2
              rounded-lg
              transition-colors
              ${
                isDarkMode
                  ? "text-slate-400 hover:text-red-400 hover:bg-red-400/5"
                  : "text-slate-400 hover:text-red-500 hover:bg-red-50"
              }
            `}
            title={t.cmsTestimonials.actions.delete}
          >
            <Trash2 size={15} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </article>
  );
}
