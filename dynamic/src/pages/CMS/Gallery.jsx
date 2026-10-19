import React, { useState } from "react";
import {
  Plus,
  Search,
  Image as ImageIcon,
  CalendarDays,
  Layers3,
} from "lucide-react";
import { useLanguage } from "../../Contexts/LanguageContext";
import useGallery from "../../hooks/cms/useGallery";
import GalleryForm from "../../Components/cms/gallery/GalleryForm";
import GalleryGrid from "../../Components/cms/gallery/GalleryGrid";
import { toast } from "react-toastify";
export default function Gallery() {
  const { t } = useLanguage();

  const {
    gallery,
    loading,
    error,
    createGalleryItem,
    updateGalleryItem,
    deleteGalleryItem,
  } = useGallery();

  const [showForm, setShowForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const filteredGallery = gallery.filter((item) => {
    const searchTerm = search.toLowerCase();

    const matchesSearch =
      item.mediaTitle
        ?.toLowerCase()
        .includes(searchTerm) ||
      item.description
        ?.toLowerCase()
        .includes(searchTerm);

    const matchesCategory =
      !category || item.category === category;

    return matchesSearch && matchesCategory;
  });

  const handleAdd = () => {
    setSelectedItem(null);
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setShowForm(true);
  };

  const handleDelete = async (item) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${item.mediaTitle}"?`
    );

    if (!confirmed) return;

    try {
      await deleteGalleryItem(item.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (data) => {
    try {
      if (selectedItem) {
        await updateGalleryItem(
          selectedItem.id,
          data
        );

        toast.success("Gallery image updated successfully.");
      } else {
        await createGalleryItem(data);

        toast.success("Gallery image created successfully.");
      }

      setShowForm(false);
      setSelectedItem(null);
    } catch (err) {
      console.error(err);

      toast.error(
        err?.message || "Something went wrong."
      );
    }
  };

  const categoriesCount = new Set(
    gallery
      .map((item) => item.category)
      .filter(Boolean)
  ).size;

  const datedItemsCount = gallery.filter(
    (item) => item.eventDate
  ).length;

  return (
    <div className="min-h-screen p-5">

      {/* Header */}
      <div className="mb-5 flex flex-col gap-4 rounded-xl bg-gray-100/10 p-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="text-lg font-bold text-white">
            {t.cmsGallery.title}
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            {t.cmsGallery.subtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center justify-center gap-2 self-start rounded-lg bg-amber-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 sm:self-auto"
        >
          <Plus size={18} />
          {t.cmsGallery.addImage}
        </button>

      </div>

      {/* Statistics */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3">

        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">
              {t.cmsGallery.stats.totalImages}
            </p>

            <ImageIcon
              size={19}
              className="text-amber-400"
            />
          </div>

          <p className="mt-2 text-2xl font-bold text-white">
            {gallery.length}
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">
              {t.cmsGallery.stats.categories}
            </p>

            <Layers3
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
              {t.cmsGallery.stats.dated}
            </p>

            <CalendarDays
              size={19}
              className="text-amber-400"
            />
          </div>

          <p className="mt-2 text-2xl font-bold text-white">
            {datedItemsCount}
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
              t.cmsGallery.filters.searchPlaceholder
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
            {t.cmsGallery.filters.all}
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

      {/* Loading */}
      {loading && (
        <div className="flex min-h-64 items-center justify-center text-sm text-slate-400">
          Loading gallery...
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-red-400/10 bg-red-400/5 px-6 text-center">
          <p className="text-sm font-medium text-red-400">
            Failed to load gallery
          </p>

          <p className="mt-1 text-sm text-slate-500">
            {error}
          </p>
        </div>
      )}

      {/* Gallery */}
      {!loading && !error && (
        <GalleryGrid
          items={filteredGallery}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Form */}
      {showForm && (
        <GalleryForm
          item={selectedItem}
          onClose={() => {
            setShowForm(false);
            setSelectedItem(null);
          }}
          onSubmit={handleSubmit}
        />
      )}

    </div>
  );
}