import React, { useState, useRef } from 'react';
import { useCms } from '../../../Contexts/CmsContext';
import {
  Image, Video, Upload, Link as LinkIcon, Trash2, Eye,
  Play, PlusCircle, Check, AlertCircle, FileVideo, FileImage
} from 'lucide-react';
import selassieImg from '../../../assets/selassieChurch.png';

export default function MediaTab() {
  const { galleryItems, addMediaItem, deleteMediaItem } = useCms();
  const fileInputRef = useRef(null);

  // Uploader Mode: 'file' | 'url'
  const [uploadMode, setUploadMode] = useState('file');

  // Form State
  const [title, setTitle] = useState('');
  const [mediaType, setMediaType] = useState('image'); // 'image' | 'video'
  const [category, setCategory] = useState('Feasts & Celebrations');
  const [description, setDescription] = useState('');
  const [externalUrl, setExternalUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // UI feedback
  const [formError, setFormError] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  const categories = [
    'Feasts & Celebrations',
    'Choral & Zema',
    'Liturgy',
    'Youth Service',
  ];

  // Handle local file selection
  const handleLocalFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setFilePreviewUrl(objectUrl);

    // Auto-detect media type
    if (file.type.startsWith('video/')) {
      setMediaType('video');
    } else {
      setMediaType('image');
    }

    if (!title) {
      // Suggest title from file name
      const cleanName = file.name.split('.')[0].replace(/[-_]/g, ' ');
      setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!title.trim()) {
      setFormError('Please enter a title for the media item.');
      return;
    }

    let finalUrl = '';

    if (uploadMode === 'file') {
      if (!selectedFile && !filePreviewUrl) {
        setFormError('Please select an image or video file to upload.');
        return;
      }
      finalUrl = filePreviewUrl;
    } else {
      if (!externalUrl.trim()) {
        setFormError('Please provide an image URL or YouTube embed link.');
        return;
      }
      finalUrl = externalUrl.trim();
    }

    const created = addMediaItem({
      title,
      type: mediaType,
      url: finalUrl,
      category,
      date,
      description,
    });

    // Reset Form
    setTitle('');
    setDescription('');
    setExternalUrl('');
    setSelectedFile(null);
    setFilePreviewUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';

    setToastMessage(`"${created.title}" added to the public gallery!`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="space-y-8 animate-fadeIn">

      {/* Header */}
      <div className="bg-[#0b1b3d] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-xl flex items-center justify-between">
        <div>
          <h3 className="font-serif font-bold text-2xl text-white">
            Media & Gallery Uploader
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Upload local photographs or video clips with zero-delay client binding, or embed YouTube video links.
          </p>
        </div>

        {toastMessage && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold animate-fadeIn">
            <Check className="w-3.5 h-3.5" />
            <span>{toastMessage}</span>
          </span>
        )}
      </div>

      {/* Dual-Mode Uploader Form */}
      <section className="bg-[#0b1b3d] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-6">
          <h4 className="font-serif font-bold text-lg text-white">
            Upload New Photo or Video
          </h4>

          {/* Mode Switcher Tabs */}
          <div className="inline-flex rounded-xl bg-[#081226] p-1 border border-slate-700">
            <button
              type="button"
              onClick={() => setUploadMode('file')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${uploadMode === 'file'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
                }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Local File Upload</span>
            </button>
            <button
              type="button"
              onClick={() => setUploadMode('url')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${uploadMode === 'url'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
                }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>External URL / YouTube</span>
            </button>
          </div>
        </div>

        {formError && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Uploader Input depending on mode */}
          {uploadMode === 'file' ? (
            <div className="p-8 rounded-2xl bg-[#081226] border-2 border-dashed border-amber-500/40 hover:border-amber-400 transition-colors text-center">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleLocalFileChange}
                accept="image/*,video/*"
                className="hidden"
                id="gallery-file-input"
              />

              {filePreviewUrl ? (
                <div className="flex flex-col items-center">
                  <div className="relative rounded-2xl overflow-hidden max-h-56 max-w-md bg-black mb-3 border border-amber-500/30">
                    {mediaType === 'video' ? (
                      <video src={filePreviewUrl} controls className="max-h-56 w-auto" />
                    ) : (
                      <img src={filePreviewUrl} alt="Preview" className="max-h-56 w-auto object-cover" />
                    )}
                  </div>
                  <p className="text-xs text-amber-300 font-semibold mb-2">
                    Selected: {selectedFile?.name} ({(selectedFile?.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                  <label
                    htmlFor="gallery-file-input"
                    className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
                  >
                    Change Selected File
                  </label>
                </div>
              ) : (
                <label
                  htmlFor="gallery-file-input"
                  className="flex flex-col items-center justify-center cursor-pointer group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Upload className="w-7 h-7" />
                  </div>
                  <span className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                    Click to Choose or Drag Image / Video File
                  </span>
                  <span className="text-xs text-slate-400 mt-1">
                    Supports PNG, JPG, MP4, WEBM, MOV (Stored via client-side object URL bridge)
                  </span>
                </label>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Image Link or YouTube Video URL *
              </label>
              <input
                type="text"
                value={externalUrl}
                onChange={(e) => {
                  setExternalUrl(e.target.value);
                  if (e.target.value.includes('youtube.com') || e.target.value.includes('youtu.be')) {
                    setMediaType('video');
                  }
                }}
                placeholder="https://images.unsplash.com/... or https://www.youtube.com/watch?v=..."
                className="w-full px-4 py-3 bg-[#081226] border border-slate-700 rounded-xl text-white text-sm focus:border-amber-400 outline-none"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                YouTube links automatically convert to responsive embedded players.
              </span>
            </div>
          )}

          {/* Form Fields: Title, Type, Category, Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Media Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Saint Yared Choral Chant in Kebele 02"
                className="w-full px-4 py-2.5 bg-[#081226] border border-slate-700 rounded-xl text-white text-sm focus:border-amber-400 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Media Type *
              </label>
              <select
                value={mediaType}
                onChange={(e) => setMediaType(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#081226] border border-slate-700 rounded-xl text-white text-sm outline-none"
              >
                <option value="image">Still Photograph (Image)</option>
                <option value="video">Motion Recording (Video Player)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Category Tag *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#081226] border border-slate-700 rounded-xl text-white text-sm outline-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Date Recorded / Event Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#081226] border border-slate-700 rounded-xl text-white text-sm outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Short Description / Caption
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contextual details about the liturgical celebration or choir singers..."
              className="w-full px-4 py-2.5 bg-[#081226] border border-slate-700 rounded-xl text-white text-sm focus:border-amber-400 outline-none"
            />
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-800">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/25"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add to Live Public Gallery</span>
            </button>
          </div>

        </form>
      </section>

      {/* Live Media Inventory Table */}
      <section className="bg-[#0b1b3d] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <h4 className="font-serif font-bold text-lg text-white border-b border-slate-800 pb-2 mb-6">
          Live Media Inventory ({galleryItems.length} Items)
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Preview</th>
                <th className="py-3 px-4">Title & Details</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {galleryItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">

                  {/* Thumbnail Preview */}
                  <td className="py-3 px-4">
                    <div className="w-16 h-12 rounded-xl bg-slate-950 overflow-hidden border border-slate-700 relative">
                      {item.type === 'video' ? (
                        <div className="w-full h-full flex items-center justify-center bg-slate-900 text-red-500">
                          <Play className="w-5 h-5 fill-current" />
                        </div>
                      ) : (
                        <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                      )}
                    </div>
                  </td>

                  {/* Title */}
                  <td className="py-3 px-4 max-w-xs">
                    <strong className="text-white block font-semibold">{item.title}</strong>
                    <span className="text-xs text-slate-400 line-clamp-1">{item.description}</span>
                  </td>

                  {/* Type Badge */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className={`text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full ${item.type === 'video'
                        ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}>
                      {item.type}
                    </span>
                  </td>

                  {/* Category Pill */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="text-xs bg-slate-800 text-amber-300 border border-slate-700 px-2.5 py-1 rounded-full">
                      {item.category}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="py-3 px-4 whitespace-nowrap text-xs text-slate-300">
                    {item.date}
                  </td>

                  {/* Delete Action */}
                  <td className="py-3 px-4 whitespace-nowrap text-right">
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Delete "${item.title}" from gallery?`)) {
                          deleteMediaItem(item.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 cursor-pointer"
                      title="Delete media"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
}
