import React from "react";
import { CalendarX } from "lucide-react";
import { useLanguage } from "../../../Contexts/LanguageContext";
import EventCard from "./EventCard";

export default function EventGrid({
  events = [],
  onEdit,
  onDelete,
}) {
  const { t } = useLanguage();

  if (!events.length) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-6 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-slate-500">
          <CalendarX size={24} />
        </div>

        <h3 className="text-base font-semibold text-slate-200">
          {t.cmsEvents.empty.title}
        </h3>

        <p className="mt-1 max-w-sm text-sm text-slate-500">
          {t.cmsEvents.empty.description}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}