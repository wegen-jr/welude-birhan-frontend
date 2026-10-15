import React from "react";
import {
  Pencil,
  Trash2,
  CalendarDays,
} from "lucide-react";
import { useLanguage } from "../../../Contexts/LanguageContext";

export default function GalleryCard({
  item,
  onEdit,
  onDelete,
}) {
  const { t } = useLanguage();

  const formattedDate = item.eventDate
    ? new Date(item.eventDate).toLocaleDateString()
    : "";

  return (
    <article className="group overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] transition hover:border-amber-400/20 hover:bg-white/[0.05]">

      {/* Image */}
      <div className="relative aspect-video overflow-hidden bg-white/5">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.mediaTitle || ""}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-500">
            No Image
          </div>
        )}

        {/* Actions */}
        <div className="absolute right-3 top-3 flex gap-1 opacity-0 transition group-hover:opacity-100">

          <button
            type="button"
            onClick={() => onEdit?.(item)}
            title={t.cmsGallery.actions.edit}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/60 text-white backdrop-blur-sm transition hover:bg-black/80 hover:text-amber-400"
          >
            <Pencil size={16} />
          </button>

          <button
            type="button"
            onClick={() => onDelete?.(item)}
            title={t.cmsGallery.actions.delete}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/60 text-white backdrop-blur-sm transition hover:bg-black/80 hover:text-red-400"
          >
            <Trash2 size={16} />
          </button>

        </div>

        {/* Category */}
        {item.category && (
          <span className="absolute bottom-3 left-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-amber-400 backdrop-blur-sm">
            {item.category}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5">

        <h3 className="text-base font-semibold text-white">
          {item.mediaTitle}
        </h3>

        {formattedDate && (
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
            <CalendarDays size={15} />
            <span>{formattedDate}</span>
          </div>
        )}

        {item.description && (
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-400">
            {item.description}
          </p>
        )}

      </div>
    </article>
  );
}