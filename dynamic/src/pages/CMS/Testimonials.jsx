import React, { useState } from "react";
import { Plus, GraduationCap } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { toast } from "react-toastify";

import { useLanguage } from "../../Contexts/LanguageContext";
import useTestimonials from "../../hooks/cms/useTestimonials";

import TestimonialForm from "../../Components/cms/testimonials/TestimonialForm";
import TestimonialGrid from "../../Components/cms/testimonials/TestimonialGrid";

export default function Testimonials() {
  const { isDarkMode } = useOutletContext();
  const { t } = useLanguage();

  const {
    testimonials,
    loading,
    error,
    createTestimonial,
    updateTestimonial,
    deleteTestimonial,
  } = useTestimonials();

  const [showForm, setShowForm] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] =
    useState(null);

  const handleAdd = () => {
    setSelectedTestimonial(null);
    setShowForm(true);
  };

  const handleEdit = (testimonial) => {
    setSelectedTestimonial(testimonial);
    setShowForm(true);
  };

  const handleSubmit = async (data) => {
    try {
      if (selectedTestimonial) {
        await updateTestimonial(
          selectedTestimonial.id,
          data
        );

        toast.success(
          t.cmsTestimonials.toast.updated
        );
      } else {
        await createTestimonial(data);

        toast.success(
          t.cmsTestimonials.toast.created
        );
      }

      setShowForm(false);
      setSelectedTestimonial(null);
    } catch (error) {
      console.error(error);

      toast.error(
        error.message ||
        t.cmsTestimonials.toast.error
      );
    }
  };

  const handleDelete = async (testimonial) => {
    const confirmed = window.confirm(
      t.cmsTestimonials.confirmDelete
    );

    if (!confirmed) return;

    try {
      await deleteTestimonial(testimonial.id);

      toast.success(
        t.cmsTestimonials.toast.deleted
      );
    } catch (error) {
      console.error(error);

      toast.error(
        error.message ||
        t.cmsTestimonials.toast.error
      );
    }
  };

  return (
    <main
      className={`
        min-h-screen
        px-6 md:px-10 lg:px-12
        py-8
        ${isDarkMode
          ? "bg-[#081226] text-slate-100"
          : "bg-[#faf9f6] text-[#1d2940]"
        }
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <GraduationCap
              size={18}
              className="text-[#c9a44c]"
              strokeWidth={1.5}
            />

            <span
              className={`
                text-[11px]
                uppercase
                tracking-[0.2em]
                ${isDarkMode
                  ? "text-slate-500"
                  : "text-slate-400"
                }
              `}
            >
              {t.cmsTestimonials.label}
            </span>
          </div>

          <h1
            className={`
              text-2xl md:text-3xl
              font-semibold
              ${isDarkMode
                ? "text-white"
                : "text-[#1d2940]"
              }
            `}
          >
            {t.cmsTestimonials.title}
          </h1>

          <p
            className={`
              mt-2
              text-sm
              ${isDarkMode
                ? "text-slate-400"
                : "text-slate-500"
              }
            `}
          >
            {t.cmsTestimonials.subtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="
            flex
            items-center
            gap-2
            px-4 py-2.5
            rounded-lg
            bg-[#c9a44c]
            hover:bg-[#b8943e]
            text-white
            text-xs
            font-medium
          "
        >
          <Plus size={16} />
          {t.cmsTestimonials.addTestimonial}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div
          className={`
            mb-6
            rounded-lg
            border
            px-4 py-3
            text-sm
            ${isDarkMode
              ? "border-red-400/20 bg-red-400/5 text-red-300"
              : "border-red-200 bg-red-50 text-red-600"
            }
          `}
        >
          {error}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div
          className={`
            mb-8
            rounded-xl
            border
            p-6
            ${isDarkMode
              ? "bg-[#0b1b3d] border-white/10"
              : "bg-white border-slate-200"
            }
          `}
        >
          <h2 className="text-base font-semibold mb-6">
            {selectedTestimonial
              ? t.cmsTestimonials.form.editTitle
              : t.cmsTestimonials.form.addTitle}
          </h2>

          <TestimonialForm
            item={selectedTestimonial}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setSelectedTestimonial(null);
            }}
          />
        </div>
      )}

      {/* Grid */}
      <TestimonialGrid
        testimonials={testimonials}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isDarkMode={isDarkMode}
      />
    </main>
  );
}
