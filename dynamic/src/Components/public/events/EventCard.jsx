import React from "react";
import {
  CalendarDays,
  Clock,
  MapPin,
} from "lucide-react";

export default function EventCard({ event, content }) {
  const eventDate = event.eventDate
    ? new Date(event.eventDate)
    : null;

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl">

      {/* Date */}
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <CalendarDays size={17} className="text-[#c9a44c]" />

          {eventDate
            ? eventDate.toLocaleDateString()
            : "—"}
        </div>

        {event.category && (
          <span className="rounded-full bg-[#f5eddd] px-3 py-1 text-[11px] font-medium text-[#8d702b]">
            {event.category}
          </span>
        )}
      </div>

      <div className="p-6">

        <h2 className="text-xl font-semibold leading-snug text-[#1d2940]">
          {event.title}
        </h2>

        {event.description && (
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">
            {event.description}
          </p>
        )}

        <div className="mt-6 space-y-3 border-t border-slate-100 pt-5">

          {event.location && (
            <div className="flex items-start gap-3 text-sm text-slate-500">
              <MapPin
                size={17}
                className="mt-0.5 shrink-0 text-[#c9a44c]"
              />
              <span>{event.location}</span>
            </div>
          )}

          {event.timeDuration && (
            <div className="flex items-start gap-3 text-sm text-slate-500">
              <Clock
                size={17}
                className="mt-0.5 shrink-0 text-[#c9a44c]"
              />
              <span>{event.timeDuration}</span>
            </div>
          )}

          {event.targetPlace && (
            <div className="flex items-start gap-3 text-sm text-slate-500">
              <MapPin
                size={17}
                className="mt-0.5 shrink-0 text-[#c9a44c]"
              />
              <span>{event.targetPlace}</span>
            </div>
          )}

        </div>

      </div>
    </article>
  );
}