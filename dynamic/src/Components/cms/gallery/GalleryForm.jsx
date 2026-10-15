import React, { useEffect, useState } from "react";
import {
  X,
  Save,
  Image as ImageIcon,
  CalendarDays,
  Upload,
} from "lucide-react";
import { useLanguage } from "../../../Contexts/LanguageContext";

export default function GalleryForm({
  item = null,
  onClose,
  onSubmit,
}) {
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    image: null,
    mediaTitle: "",
    category: "",
    eventDate: "",
    description: "",
  });

  const [preview, setPreview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        image: null,
        mediaTitle: item.mediaTitle || "",
        category: item.category || "",
        eventDate: item.eventDate
          ? item.eventDate.slice(0, 16)
          : "",
        description: item.description || "",
      });

      setPreview(item.imageUrl || "");
    } else {
      setFormData({
        image: null,
        mediaTitle: "",
        category: "",
        eventDate: "",
        description: "",
      });

      setPreview("");
    }
  }, [item]);

  // Clean up object URL when component unmounts
  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Only allow images
    if (!file.type.startsWith("image/")) {
      return;
    }

    // Clean previous local preview
    if (preview?.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }

    const imagePreview = URL.createObjectURL(file);

    setFormData((prev) => ({
      ...prev,
      image: file,
    }));

    setPreview(imagePreview);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    // Image is required when creating a new gallery item
    if (!item && !formData.image) {
      return;
    }

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
                ? t.cmsGallery.form.editTitle
                : t.cmsGallery.form.addTitle}
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              {t.cmsGallery.form.description}
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

        <form
          onSubmit={handleSubmit}
          className="space-y-5 overflow-y-auto p-6"
        >
          {/* Image Upload */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              {t.cmsGallery.form.imageUrl}
            </label>

            <label
              className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.03] px-6 py-8 transition hover:border-amber-400/50 hover:bg-white/[0.05] ${
                isSubmitting
                  ? "cursor-not-allowed opacity-60"
                  : ""
              }`}
            >
              <Upload
                size={28}
                className="mb-2 text-slate-500"
              />

              <span className="text-sm font-medium text-slate-300">
                Choose an image
              </span>

              <span className="mt-1 text-xs text-slate-500">
                JPG, PNG, WEBP
              </span>

              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={isSubmitting}
                className="hidden"
              />
            </label>

            {/* Image Preview */}
            <div className="mt-3 overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
              {preview ? (
                <img
                  src={preview}
                  alt={formData.mediaTitle || "Gallery preview"}
                  className="h-56 w-full object-cover"
                  onError={() => setPreview("")}
                />
              ) : (
                <div className="flex h-40 flex-col items-center justify-center text-slate-500">
                  <ImageIcon size={28} />

                  <p className="mt-2 text-xs">
                    {t.cmsGallery.form.imagePreview}
                  </p>
                </div>
              )}
            </div>

            {/* Selected file name */}
            {formData.image && (
              <p className="mt-2 truncate text-xs text-slate-500">
                {formData.image.name}
              </p>
            )}

            {/* When editing */}
            {item && !formData.image && (
              <p className="mt-2 text-xs text-slate-500">
                Leave the image unchanged to keep the current image.
              </p>
            )}
          </div>

          {/* Media Title */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              {t.cmsGallery.form.mediaTitle}
            </label>

            <input
              type="text"
              name="mediaTitle"
              value={formData.mediaTitle}
              onChange={handleChange}
              placeholder={t.cmsGallery.form.mediaTitlePlaceholder}
              required
              disabled={isSubmitting}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/30 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          {/* Category + Date */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            {/* Category */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                {t.cmsGallery.form.category}
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
                  {t.cmsGallery.form.selectCategory}
                </option>

                <option value="Conferences">
                  {t.cmsGallery.categories.conferences}
                </option>

                <option value="Worship">
                  {t.cmsGallery.categories.worship}
                </option>

                <option value="Church">
                  {t.cmsGallery.categories.church}
                </option>

                <option value="Community">
                  {t.cmsGallery.categories.community}
                </option>

                <option value="Youth">
                  {t.cmsGallery.categories.youth}
                </option>
              </select>
            </div>

            {/* Event Date */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                {t.cmsGallery.form.eventDate}
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

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              {t.cmsGallery.form.descriptionLabel}
            </label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder={t.cmsGallery.form.descriptionPlaceholder}
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
              {t.cmsGallery.form.cancel}
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex min-w-[125px] items-center justify-center gap-2 rounded-lg bg-amber-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={17} />

              {isSubmitting
                ? item
                  ? t.cmsGallery.form.updating
                  : t.cmsGallery.form.creating
                : item
                  ? t.cmsGallery.form.update
                  : t.cmsGallery.form.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}