import React, { useState, useRef } from 'react';
import { useCms } from '../../../context/CmsContext';
import {
  Upload, Image as ImageIcon, Save, Check, RotateCcw,
  Sparkles, Church, AlertCircle, FileText
} from 'lucide-react';

export default function AboutTab() {
  const { aboutData, updateAboutData, language } = useCms();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({ ...aboutData });
  const [imagePreview, setImagePreview] = useState(aboutData.sanctuaryImage);
  const [toastMessage, setToastMessage] = useState(null);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Local File Upload with URL.createObjectURL & FileReader for instant persistence
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Instant local preview via URL.createObjectURL
    const localUrl = URL.createObjectURL(file);
    setImagePreview(localUrl);
    setFormData((prev) => ({ ...prev, sanctuaryImage: localUrl }));
    updateAboutData({ sanctuaryImage: localUrl });

    // Also convert to data URL so it persists across refreshes
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        setFormData((prev) => ({ ...prev, sanctuaryImage: reader.result }));
        updateAboutData({ sanctuaryImage: reader.result });
      }
    };
    reader.readAsDataURL(file);

    setToastMessage('Church sanctuary photo replaced and bound to public view!');
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveText = (e) => {
    e.preventDefault();
    updateAboutData(formData);
    setToastMessage('Church history narrative and captions updated successfully!');
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Tab Header */}
      <div className="bg-[#0b1b3d] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-xl flex items-center justify-between">
        <div>
          <h3 className="font-serif font-bold text-2xl text-white">
            About & Church Image Manager
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Replace the featured cathedral showcase photo via local file upload and edit historical text in real time.
          </p>
        </div>

        {toastMessage && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold animate-fadeIn">
            <Check className="w-3.5 h-3.5" />
            <span>{toastMessage}</span>
          </span>
        )}
      </div>

      {/* Featured Church Image Uploader */}
      <section className="bg-[#0b1b3d] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <h4 className="font-serif font-bold text-lg text-white border-b border-slate-800 pb-2 flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-amber-400" />
          <span>Featured Sanctuary Photo Uploader</span>
        </h4>

        <div className="grid md:grid-cols-12 gap-8 items-center">
          
          {/* Current Live Preview */}
          <div className="md:col-span-5">
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 border-2 border-amber-500/40 shadow-xl h-64 sm:h-72 group">
              <img
                src={imagePreview || aboutData.sanctuaryImage}
                alt="Church Showcase Preview"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#081226] via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-[#081226]/90 backdrop-blur-md border border-amber-500/30">
                <span className="text-[10px] uppercase font-bold text-amber-400 block">
                  Public Live Showcase
                </span>
                <span className="text-xs text-white font-serif font-bold truncate block">
                  {formData.title}
                </span>
              </div>
            </div>
          </div>

          {/* Upload Controls */}
          <div className="md:col-span-7 space-y-4">
            <div className="p-6 rounded-2xl bg-[#081226] border-2 border-dashed border-amber-500/40 hover:border-amber-400 transition-colors text-center">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
                id="church-image-upload"
              />
              
              <label
                htmlFor="church-image-upload"
                className="flex flex-col items-center justify-center cursor-pointer group"
              >
                <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="w-7 h-7" />
                </div>
                <span className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                  Click to Browse or Drag New Sanctuary Photo
                </span>
                <span className="text-xs text-slate-400 mt-1">
                  Supports PNG, JPG, WEBP, or high-res photography (Local file upload via client-side bridge)
                </span>
              </label>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Sanctuary Card Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#081226] border border-slate-700 rounded-xl text-white text-sm focus:border-amber-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Sanctuary Card Caption / Historical Note
                </label>
                <input
                  type="text"
                  value={formData.caption}
                  onChange={(e) => handleFieldChange('caption', e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#081226] border border-slate-700 rounded-xl text-white text-sm focus:border-amber-400 outline-none"
                />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Church History Narrative & Heritage Editor */}
      <section className="bg-[#0b1b3d] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <h4 className="font-serif font-bold text-lg text-white border-b border-slate-800 pb-2 mb-6 flex items-center gap-2">
          <FileText className="w-5 h-5 text-amber-400" />
          <span>Church History & Sunday School Narrative</span>
        </h4>

        <form onSubmit={handleSaveText} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Historical Narrative (English) *
              </label>
              <textarea
                rows={6}
                value={formData.historyTextEn}
                onChange={(e) => handleFieldChange('historyTextEn', e.target.value)}
                className="w-full px-4 py-3 bg-[#081226] border border-slate-700 rounded-xl text-white text-sm focus:border-amber-400 outline-none leading-relaxed"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Historical Narrative (Amharic - የታሪክ ማስታወሻ)
              </label>
              <textarea
                rows={6}
                value={formData.historyTextAm}
                onChange={(e) => handleFieldChange('historyTextAm', e.target.value)}
                className="w-full px-4 py-3 bg-[#081226] border border-slate-700 rounded-xl text-white text-sm focus:border-amber-400 outline-none leading-relaxed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Established Year
              </label>
              <input
                type="text"
                value={formData.establishedYear}
                onChange={(e) => handleFieldChange('establishedYear', e.target.value)}
                className="w-full px-4 py-2.5 bg-[#081226] border border-slate-700 rounded-xl text-amber-300 font-bold text-sm outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Students Count
              </label>
              <input
                type="text"
                value={formData.studentsCount}
                onChange={(e) => handleFieldChange('studentsCount', e.target.value)}
                className="w-full px-4 py-2.5 bg-[#081226] border border-slate-700 rounded-xl text-amber-300 font-bold text-sm outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Teachers Count
              </label>
              <input
                type="text"
                value={formData.teachersCount}
                onChange={(e) => handleFieldChange('teachersCount', e.target.value)}
                className="w-full px-4 py-2.5 bg-[#081226] border border-slate-700 rounded-xl text-amber-300 font-bold text-sm outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Years of Service
              </label>
              <input
                type="text"
                value={formData.yearsOfService}
                onChange={(e) => handleFieldChange('yearsOfService', e.target.value)}
                className="w-full px-4 py-2.5 bg-[#081226] border border-slate-700 rounded-xl text-amber-300 font-bold text-sm outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="submit"
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 flex items-center gap-2 cursor-pointer transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save & Publish Updates</span>
            </button>
          </div>
        </form>
      </section>

    </div>
  );
}
