import React from "react";
import {
  CalendarDays,
  Clock3,
  MapPin,
  Pencil,
  Trash2,
} from "lucide-react";
import { useLanguage } from "../../../Contexts/LanguageContext";

export default function EventCard({
  event,
  onEdit,
  onDelete,
}) {
  const { t } = useLanguage();

  const formattedDate = event.eventDate
    ? new Date(event.eventDate).toLocaleDateString()
    : "";

  const formattedTime = event.eventDate
    ? new Date(event.eventDate).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <article className="group overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] transition hover:border-amber-400/20 hover:bg-white/[0.05]">

      {/* Top */}
      <div className="flex items-start justify-between border-b border-white/10 p-5">
        <div className="min-w-0">
          <span className="inline-flex rounded-full bg-amber-400/10 px-2.5 py-1 text-xs font-medium text-amber-400">
            {event.category}
          </span>

          <h3 className="mt-3 text-lg font-semibold text-white">
            {event.title}
          </h3>
        </div>

        <div className="ml-4 flex shrink-0 gap-1">
          <button
            type="button"
            onClick={() => onEdit?.(event)}
            title={t.cmsEvents.actions.edit}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-amber-400"
          >
            <Pencil size={16} />
          </button>

          <button
            type="button"
            onClick={() => onDelete?.(event)}
            title={t.cmsEvents.actions.delete}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-3 p-5">
        <div className="flex items-center gap-3 text-sm text-slate-300">
          <CalendarDays size={17} className="shrink-0 text-amber-400" />
          <span>{formattedDate}</span>
        </div>

        <div className="flex items-center gap-3 text-sm text-slate-300">
          <Clock3 size={17} className="shrink-0 text-amber-400" />
          <span>
            {formattedTime}
            {event.timeDuration && ` · ${event.timeDuration}`}
          </span>
        </div>

        <div className="flex items-start gap-3 text-sm text-slate-300">
          <MapPin size={17} className="mt-0.5 shrink-0 text-amber-400" />

          <div>
            <p>{event.targetPlace}</p>

            {event.location && (
              <p className="mt-1 text-xs text-slate-500">
                {event.location}
              </p>
            )}
          </div>
        </div>

        {event.description && (
          <p className="border-t border-white/10 pt-3 text-sm leading-6 text-slate-400">
            {event.description}
          </p>
        )}
      </div>
    </article>
  );
}
