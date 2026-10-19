import React, { useState } from "react";
import {
  Plus,
  Search,
  CalendarDays,
  Clock3,
  CheckCircle2,
} from "lucide-react";
import { useLanguage } from "../../Contexts/LanguageContext";
import useEvents from "../../hooks/cms/useEvents";
import EventForm from "../../Components/cms/events/EventForm";
import EventGrid from "../../Components/cms/events/EventGrid";
import { toast } from "react-toastify";
export default function Events() {
  const { t } = useLanguage();

  const {
    events,
    loading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
  } = useEvents();

  const [showForm, setShowForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const filteredEvents = events.filter((event) => {
    const searchTerm = search.toLowerCase();

    const matchesSearch =
      event.title?.toLowerCase().includes(searchTerm) ||
      event.description?.toLowerCase().includes(searchTerm);

    const matchesCategory =
      !category || event.category === category;

    return matchesSearch && matchesCategory;
  });

  const handleAdd = () => {
    setSelectedEvent(null);
    setShowForm(true);
  };

  const handleEdit = (event) => {
    setSelectedEvent(event);
    setShowForm(true);
  };

  const handleDelete = async (event) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${event.title}"?`
    );

    if (!confirmed) return;

    try {
      await deleteEvent(event.id);
    } catch (err) {
      // Error is already stored by useEvents
      console.error(err);
    }
  };


  const handleSubmit = async (data) => {
    try {
      if (selectedEvent) {
        await updateEvent(selectedEvent.id, data);

        toast.success("Event updated successfully.");
      } else {
        await createEvent(data);

        toast.success("Event created successfully.");
      }

      setShowForm(false);
      setSelectedEvent(null);
    } catch (err) {
      console.error(err);

      toast.error(
        err?.message || "Something went wrong."
      );
    }
  };


  const upcomingCount = events.filter(
    (event) =>
      event.eventDate &&
      new Date(event.eventDate) > new Date()
  ).length;

  const categoriesCount = new Set(
    events.map((event) => event.category).filter(Boolean)
  ).size;

  return (
    <div className="min-h-screen p-5">

      {/* Header */}
      <div className="mb-5 flex flex-col gap-4 rounded-xl bg-gray-100/10 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-bold text-white">
            {t.cmsEvents.title}
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            {t.cmsEvents.subtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center justify-center gap-2 self-start rounded-lg bg-amber-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 sm:self-auto"
        >
          <Plus size={18} />
          {t.cmsEvents.addEvent}
        </button>
      </div>

      {/* Statistics */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">

        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">
              {t.cmsEvents.stats.totalEvents}
            </p>

            <CalendarDays
              size={19}
              className="text-amber-400"
            />
          </div>

          <p className="mt-2 text-2xl font-bold text-white">
            {events.length}
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">
              {t.cmsEvents.stats.upcoming}
            </p>

            <Clock3
              size={19}
              className="text-amber-400"
            />
          </div>

          <p className="mt-2 text-2xl font-bold text-white">
            {upcomingCount}
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">
              {t.cmsEvents.stats.categories}
            </p>

            <CalendarDays
              size={19}
              className="text-amber-400"
            />
          </div>

          <p className="mt-2 text-2xl font-bold text-white">
            {categoriesCount}
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">
              {t.cmsEvents.stats.active}
            </p>

            <CheckCircle2
              size={19}
              className="text-amber-400"
            />
          </div>

          <p className="mt-2 text-2xl font-bold text-white">
            {upcomingCount}
          </p>
        </div>

      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 md:flex-row">

        <div className="relative flex-1">
          <Search
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              t.cmsEvents.filters.searchPlaceholder
            }
            className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-amber-400/60"
          />
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-white/10 bg-[#101f40] px-4 py-2.5 text-sm text-white outline-none focus:border-amber-400/60"
        >
          <option value="">
            {t.cmsEvents.filters.allCategories}
          </option>

          <option value="Conference">
            {t.cmsEvents.categories.conference}
          </option>

          <option value="Worship">
            {t.cmsEvents.categories.worship}
          </option>

          <option value="Youth">
            {t.cmsEvents.categories.youth}
          </option>

          <option value="Academic">
            {t.cmsEvents.categories.academic}
          </option>

          <option value="Community">
            {t.cmsEvents.categories.community}
          </option>
        </select>

      </div>

      {/* Loading */}
      {loading && (
        <div className="flex min-h-64 items-center justify-center text-sm text-slate-400">
          Loading events...
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-red-400/10 bg-red-400/5 px-6 text-center">
          <p className="text-sm font-medium text-red-400">
            Failed to load events
          </p>

          <p className="mt-1 text-sm text-slate-500">
            {error}
          </p>
        </div>
      )}

      {/* Events */}
      {!loading && !error && (
        <EventGrid
          events={filteredEvents}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Form */}
      {showForm && (
        <EventForm
          item={selectedEvent}
          onClose={() => {
            setShowForm(false);
            setSelectedEvent(null);
          }}
          onSubmit={handleSubmit}
        />
      )}

    </div>
  );
}
