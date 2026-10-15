import React from "react";
import { ImageIcon } from "lucide-react";
import { useLanguage } from "../../../Contexts/LanguageContext";
import GalleryCard from "./GalleryCard";

export default function GalleryGrid({
  items = [],
  onEdit,
  onDelete,
}) {
  const { t } = useLanguage();

  if (!items.length) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-6 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-slate-500">
          <ImageIcon size={24} />
        </div>

        <h3 className="text-base font-semibold text-slate-200">
          {t.cmsGallery.empty.title}
        </h3>

        <p className="mt-1 max-w-sm text-sm text-slate-500">
          {t.cmsGallery.empty.description}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <GalleryCard
          key={item.id}
          item={item}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}