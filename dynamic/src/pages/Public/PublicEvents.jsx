import React from "react";
import {
  CalendarDays,
  Clock,
  MapPin,
  Church,
} from "lucide-react";
import { useLanguage } from "../../Contexts/LanguageContext";
import useEvents from "../../hooks/public/useEvents";
import EventCard from "../../Components/public/events/EventCard";

export default function PublicEvents() {
  const { t } = useLanguage();
  const content = t.eventsPage;

  const {
    events = [],
    loading,
    error,
  } = useEvents();

  return (
    <main className="min-h-screen bg-[#faf9f6] text-[#1d2940]">

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#081226] px-6 py-24 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(201,164,76,0.16),transparent_35%)]" />

        <div className="relative mx-auto max-w-6xl text-center">

          <div className="mb-5 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#c9a44c]/50">
              <CalendarDays
                size={25}
                strokeWidth={1.4}
                className="text-[#c9a44c]"
              />
            </div>
          </div>

          <p className="text-xs uppercase tracking-[0.3em] text-[#c9a44c]">
            {content.hero.label}
          </p>

          <h1 className="mt-4 text-4xl font-semibold md:text-5xl">
            {content.hero.title}
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-400 md:text-base">
            {content.hero.subtitle}
          </p>

        </div>
      </section>

      {/* Events */}
      <section className="px-6 py-16 md:py-20 bg-[#081226]">
        <div className="mx-auto max-w-6xl">

          {loading && (
            <LoadingState text={content.loading} />
          )}

          {!loading && error && (
            <ErrorState text={content.error} />
          )}

          {!loading && !error && events.length === 0 && (
            <EmptyState
              icon={CalendarDays}
              title={content.empty.title}
              description={content.empty.description}
            />
          )}

          {!loading && !error && events.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  content={content}
                />
              ))}
            </div>
          )}

        </div>
      </section>
    </main>
  );
}

function LoadingState({ text }) {
  return (
    <div className="flex min-h-[300px] items-center justify-center">
      <div className="flex items-center gap-3 text-sm text-slate-500">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-[#c9a44c]" />
        {text}
      </div>
    </div>
  );
}

function ErrorState({ text }) {
  return (
    <div className="flex min-h-[300px] items-center justify-center">
      <div className="rounded-2xl border border-red-100 bg-red-50 px-6 py-5 text-center text-sm text-red-600">
        {text}
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex min-h-[350px] flex-col items-center justify-center text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f5eddd]">
        <Icon size={25} className="text-[#c9a44c]" />
      </div>

      <h2 className="mt-5 text-xl font-semibold">
        {title}
      </h2>

      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}