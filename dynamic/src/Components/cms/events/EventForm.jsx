import React, { useEffect, useState } from "react";
import {
  X,
  Save,
  CalendarDays,
  MapPin,
  Clock3,
  Building2,
} from "lucide-react";
import { useLanguage } from "../../../Contexts/LanguageContext";

export default function EventForm({
  item = null,
  onClose,
  onSubmit,
}) {
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    eventDate: "",
    targetPlace: "",
    timeDuration: "",
    location: "",
    description: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title || "",
        category: item.category || "",
        eventDate: item.eventDate
          ? item.eventDate.slice(0, 16)
          : "",
        targetPlace: item.targetPlace || "",
        timeDuration: item.timeDuration || "",
        location: item.location || "",
        description: item.description || "",
      });
    } else {
      setFormData({
        title: "",
        category: "",
        eventDate: "",
        targetPlace: "",
        timeDuration: "",
        location: "",
        description: "",
      });
    }
  }, [item]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      await onSubmit?.({
        ...formData,
        eventDate: formData.eventDate
          ? new Date(formData.eventDate).toISOString()
          : "",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0b1b3d] shadow-2xl">

        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-white">
              {item
                ? t.cmsEvents.form.editTitle
                : t.cmsEvents.form.addTitle}
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              {t.cmsEvents.form.description}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5 overflow-y-auto p-6"
        >
          {/* Title */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              {t.cmsEvents.form.title}
            </label>

            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder={t.cmsEvents.form.titlePlaceholder}
              required
              disabled={isSubmitting}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/30 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          {/* Category + Date */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                {t.cmsEvents.form.category}
              </label>

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                className="w-full rounded-lg border border-white/10 bg-[#101f40] px-4 py-3 text-sm text-white outline-none focus:border-amber-400/60 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="">
                  {t.cmsEvents.form.selectCategory}
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

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                {t.cmsEvents.form.eventDate}
              </label>

              <div className="relative">
                <CalendarDays
                  size={17}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  type="datetime-local"
                  name="eventDate"
                  value={formData.eventDate}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-10 pr-3 text-sm text-white outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/30 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
            </div>
          </div>

          {/* Target Place + Duration */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                {t.cmsEvents.form.targetPlace}
              </label>

              <div className="relative">
                <Building2
                  size={17}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  type="text"
                  name="targetPlace"
                  value={formData.targetPlace}
                  onChange={handleChange}
                  placeholder={
                    t.cmsEvents.form.targetPlacePlaceholder
                  }
                  required
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/30 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                {t.cmsEvents.form.timeDuration}
              </label>

              <div className="relative">
                <Clock3
                  size={17}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  type="text"
                  name="timeDuration"
                  value={formData.timeDuration}
                  onChange={handleChange}
                  placeholder={
                    t.cmsEvents.form.timeDurationPlaceholder
                  }
                  required
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/30 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              {t.cmsEvents.form.location}
            </label>

            <div className="relative">
              <MapPin
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder={
                  t.cmsEvents.form.locationPlaceholder
                }
                required
                disabled={isSubmitting}
                className="w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/30 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              {t.cmsEvents.form.descriptionLabel}
            </label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder={
                t.cmsEvents.form.descriptionPlaceholder
              }
              required
              disabled={isSubmitting}
              className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/30 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-white/10 pt-5">

            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t.cmsEvents.form.cancel}
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex min-w-[125px] items-center justify-center gap-2 rounded-lg bg-amber-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={17} />

              {isSubmitting
                ? item
                  ? t.cmsEvents.form.updating
                  : t.cmsEvents.form.creating
                : item
                  ? t.cmsEvents.form.update
                  : t.cmsEvents.form.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}