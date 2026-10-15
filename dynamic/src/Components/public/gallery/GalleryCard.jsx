
import React from "react";
import {
  CalendarDays,
  ImageOff,
  ArrowUpRight,
} from "lucide-react";

export default function GalleryCard({ item }) {
  const date = item.eventDate
    ? new Date(item.eventDate)
    : null;

  return (
    <article className="group overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition-all duration-500 hover:-translate-y-2 hover:border-[#c9a44c]/40 hover:shadow-2xl">

      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[#081226]">

        {item.imageUrl ? (
          <>
            <img
              src={item.imageUrl}
              alt={item.mediaTitle || "Gallery image"}
              className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-110"
            />

            {/* Dark cinematic overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#081226]/80 via-[#081226]/10 to-transparent opacity-70 transition duration-500 group-hover:opacity-90" />

            {/* Gold glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(201,164,76,0.18),transparent_45%)] opacity-0 transition duration-500 group-hover:opacity-100" />
          </>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-slate-500">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-slate-700 bg-[#0d1b33]">
                <ImageOff size={25} />
              </div>
              <span className="text-xs tracking-wide">
                No image available
              </span>
            </div>
          </div>
        )}

        {/* Category */}
        {item.category && (
          <span className="absolute left-5 top-5 rounded-full border border-[#c9a44c]/40 bg-[#081226]/75 px-3.5 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-[#e3c875] shadow-lg backdrop-blur-md">
            {item.category}
          </span>
        )}

        {/* View indicator */}
        <div className="absolute right-5 top-5 flex h-9 w-9 translate-y-2 items-center justify-center rounded-full border border-white/20 bg-black/20 text-white opacity-0 backdrop-blur-md transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRight size={17} />
        </div>

        {/* Title over image */}
        {item.mediaTitle && (
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h2 className="text-xl font-semibold leading-tight text-white drop-shadow-lg">
              {item.mediaTitle}
            </h2>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">

        {item.description && (
          <p className="line-clamp-3 text-sm leading-6 text-slate-500">
            {item.description}
          </p>
        )}

        {/* Date */}
        {date && (
          <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4 text-xs text-slate-400">
            <CalendarDays
              size={15}
              strokeWidth={1.7}
              className="text-[#c9a44c]"
            />

            <span>
              {date.toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        )}

        {/* Bottom accent */}
        <div className="mt-4 h-px w-0 bg-gradient-to-r from-[#c9a44c] to-transparent transition-all duration-500 group-hover:w-full" />
      </div>
    </article>
  );
}
