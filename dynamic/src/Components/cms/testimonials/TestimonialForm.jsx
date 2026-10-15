import React, { useEffect, useState } from "react";
import { ImagePlus, Upload, X } from "lucide-react";
import { useLanguage } from "../../../Contexts/LanguageContext";

export default function TestimonialForm({
  item,
  onSubmit,
  onCancel,
}) {
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    image: null,
    name: "",
    baptismalName: "",
    graduateTitle: "",
    year: "",
    inspirationQuote: "",
  });

  const [preview, setPreview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        image: null,
        name: item.name || "",
        baptismalName: item.baptismalName || "",
        graduateTitle: item.graduateTitle || "",
        year: item.year || "",
        inspirationQuote: item.inspirationQuote || "",
      });

      setPreview(item.imageUrl || "");
    } else {
      setFormData({
        image: null,
        name: "",
        baptismalName: "",
        graduateTitle: "",
        year: "",
        inspirationQuote: "",
      });

      setPreview("");
    }
  }, [item]);

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

    if (!file.type.startsWith("image/")) {
      return;
    }

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

    if (!item && !formData.image) {
      return;
    }

    try {
      setIsSubmitting(true);

      await onSubmit({
        ...formData,
        year: Number(formData.year),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Image */}
      <div>
        <label className="block text-xs font-medium mb-2">
          {t.cmsTestimonials.form.image}
        </label>

        <label
          className="
            relative
            flex
            flex-col
            items-center
            justify-center
            min-h-56
            rounded-xl
            border-2
            border-dashed
            border-slate-300
            dark:border-white/10
            overflow-hidden
            cursor-pointer
          "
        >
          {preview ? (
            <>
              <img
                src={preview}
                alt={t.cmsTestimonials.form.imagePreview}
                className="absolute inset-0 w-full h-full object-cover"
              />

              <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
                <div
                  className="
                    px-4 py-2
                    rounded-lg
                    bg-black/50
                    backdrop-blur-sm
                    text-white
                    text-xs
                    flex
                    items-center
                    gap-2
                  "
                >
                  <Upload size={14} />
                  {t.cmsTestimonials.form.changeImage}
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3 text-center">
              <div
                className="
                  w-12 h-12
                  rounded-full
                  bg-[#c9a44c]/10
                  flex items-center justify-center
                "
              >
                <ImagePlus
                  size={21}
                  className="text-[#c9a44c]"
                />
              </div>

              <div>
                <p className="text-sm font-medium">
                  {t.cmsTestimonials.form.chooseImage}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {t.cmsTestimonials.form.imageHint}
                </p>
              </div>
            </div>
          )}

          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </label>
      </div>

      {/* Name */}
      <div>
        <label className="block text-xs font-medium mb-2">
          {t.cmsTestimonials.form.name}
        </label>

        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder={t.cmsTestimonials.form.namePlaceholder}
          required
          className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-white/10 bg-transparent text-sm outline-none focus:border-[#c9a44c]"
        />
      </div>

      {/* Baptismal name */}
      <div>
        <label className="block text-xs font-medium mb-2">
          {t.cmsTestimonials.form.baptismalName}
        </label>

        <input
          type="text"
          name="baptismalName"
          value={formData.baptismalName}
          onChange={handleChange}
          placeholder={
            t.cmsTestimonials.form.baptismalNamePlaceholder
          }
          required
          className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-white/10 bg-transparent text-sm outline-none focus:border-[#c9a44c]"
        />
      </div>

      {/* Graduate title */}
      <div>
        <label className="block text-xs font-medium mb-2">
          {t.cmsTestimonials.form.graduateTitle}
        </label>

        <input
          type="text"
          name="graduateTitle"
          value={formData.graduateTitle}
          onChange={handleChange}
          placeholder={
            t.cmsTestimonials.form.graduateTitlePlaceholder
          }
          required
          className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-white/10 bg-transparent text-sm outline-none focus:border-[#c9a44c]"
        />
      </div>

      {/* Year */}
      <div>
        <label className="block text-xs font-medium mb-2">
          {t.cmsTestimonials.form.year}
        </label>

        <input
          type="number"
          name="year"
          value={formData.year}
          onChange={handleChange}
          placeholder={t.cmsTestimonials.form.yearPlaceholder}
          min="1900"
          max="2100"
          required
          className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-white/10 bg-transparent text-sm outline-none focus:border-[#c9a44c]"
        />
      </div>

      {/* Quote */}
      <div>
        <label className="block text-xs font-medium mb-2">
          {t.cmsTestimonials.form.inspirationQuote}
        </label>

        <textarea
          name="inspirationQuote"
          value={formData.inspirationQuote}
          onChange={handleChange}
          placeholder={
            t.cmsTestimonials.form.inspirationQuotePlaceholder
          }
          rows={5}
          required
          className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-white/10 bg-transparent text-sm outline-none focus:border-[#c9a44c] resize-none"
        />
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="
            px-4 py-2.5
            rounded-lg
            border
            border-slate-200
            dark:border-white/10
            text-xs
            font-medium
          "
        >
          {t.cmsTestimonials.form.cancel}
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="
            px-5 py-2.5
            rounded-lg
            bg-[#c9a44c]
            hover:bg-[#b8943e]
            text-white
            text-xs
            font-medium
            disabled:opacity-50
          "
        >
          {isSubmitting
            ? item
              ? t.cmsTestimonials.form.updating
              : t.cmsTestimonials.form.creating
            : item
              ? t.cmsTestimonials.form.update
              : t.cmsTestimonials.form.save}
        </button>
      </div>
    </form>
  );
}
