import React, { useState, useRef } from 'react';
import { useCms } from '../../../context/CmsContext';
import {
  Quote, PlusCircle, Trash2, CheckCircle, Clock, Eye, EyeOff,
  Check, Upload, User, Image
} from 'lucide-react';

export default function TestimonialsTab() {
  const {
    testimonials,
    addTestimonial,
    deleteTestimonial,
    toggleTestimonialStatus,
  } = useCms();

  const fileInputRef = useRef(null);

  const [name, setName] = useState('');
  const [christianName, setChristianName] = useState('');
  const [role, setRole] = useState('');
  const [yearJoined, setYearJoined] = useState('2021');
  const [quote, setQuote] = useState('');
  const [quoteAm, setQuoteAm] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const handleAvatarFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);

    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        setAvatarPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !quote.trim()) return;

    addTestimonial({
      name,
      christianName,
      role: role.trim() || 'Sunday School Alumnus',
      yearJoined,
      quote,
      quoteAm: quoteAm.trim() || quote,
      avatarUrl: avatarPreview,
      status: 'published',
    });

    setName('');
    setChristianName('');
    setRole('');
    setQuote('');
    setQuoteAm('');
    setAvatarPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    setToastMessage(`Testimonial from "${name}" published to public site!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div className="bg-[#0b1b3d] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-xl flex items-center justify-between">
        <div>
          <h3 className="font-serif font-bold text-2xl text-white">
            Older Students' Testimonials Manager
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Publish verified alumni and student quotes with local avatar photo upload support.
          </p>
        </div>

        {toastMessage && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold animate-fadeIn">
            <Check className="w-3.5 h-3.5" />
            <span>{toastMessage}</span>
          </span>
        )}
      </div>

      {/* Add Testimonial Form */}
      <section className="bg-[#0b1b3d] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <h4 className="font-serif font-bold text-lg text-white border-b border-slate-800 pb-2 mb-6">
          Add New Graduate / Alumnus Quote
        </h4>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* Avatar Uploader (Left) */}
            <div className="md:col-span-4 flex flex-col items-center justify-center p-6 rounded-2xl bg-[#081226] border-2 border-dashed border-amber-500/40 text-center">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarFile}
                accept="image/*"
                className="hidden"
                id="testimonial-avatar"
              />

              <div className="w-20 h-20 rounded-full bg-amber-500/15 border-2 border-amber-500/40 overflow-hidden flex items-center justify-center mb-3">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-amber-400" />
                )}
              </div>

              <label
                htmlFor="testimonial-avatar"
                className="text-xs font-bold text-amber-300 hover:text-white uppercase tracking-wider cursor-pointer underline"
              >
                {avatarPreview ? 'Change Avatar Photo' : 'Upload Student Photo'}
              </label>
              <span className="text-[10px] text-slate-400 mt-1 block">Local photo preview bridge</span>
            </div>

            {/* Inputs (Right) */}
            <div className="md:col-span-8 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Secular Name (ስም) *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Deacon Yared Tadesse"
                    className="w-full px-4 py-2.5 bg-[#081226] border border-slate-700 rounded-xl text-white text-sm focus:border-amber-400 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Baptismal Name (የክርስትና ስም)
                  </label>
                  <input
                    type="text"
                    value={christianName}
                    onChange={(e) => setChristianName(e.target.value)}
                    placeholder="e.g. ወልደ ያሬድ (Wolde Yared)"
                    className="w-full px-4 py-2.5 bg-[#081226] border border-slate-700 rounded-xl text-white text-sm focus:border-amber-400 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Role / Graduation Title
                  </label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Cathedral Deacon & Class of 2021"
                    className="w-full px-4 py-2.5 bg-[#081226] border border-slate-700 rounded-xl text-white text-sm focus:border-amber-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Year Joined Sunday School
                  </label>
                  <input
                    type="text"
                    value={yearJoined}
                    onChange={(e) => setYearJoined(e.target.value)}
                    placeholder="e.g. 2016"
                    className="w-full px-4 py-2.5 bg-[#081226] border border-slate-700 rounded-xl text-white text-sm outline-none"
                  />
                </div>
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Inspirational Quote (English) *
              </label>
              <textarea
                rows={3}
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                placeholder="How Welude Birhan shaped their spiritual path, discipline, and identity..."
                className="w-full px-4 py-2.5 bg-[#081226] border border-slate-700 rounded-xl text-white text-sm focus:border-amber-400 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Inspirational Quote (Amharic - አማርኛ)
              </label>
              <textarea
                rows={3}
                value={quoteAm}
                onChange={(e) => setQuoteAm(e.target.value)}
                placeholder="ስለ ወሉደ ብርሃን ሰንበት ት/ቤት የሕይወት ምስክርነት..."
                className="w-full px-4 py-2.5 bg-[#081226] border border-slate-700 rounded-xl text-white text-sm focus:border-amber-400 outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-800">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/25"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Publish Testimonial</span>
            </button>
          </div>

        </form>
      </section>

      {/* Testimonials List */}
      <section className="bg-[#0b1b3d] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <h4 className="font-serif font-bold text-lg text-white border-b border-slate-800 pb-2 mb-6">
          Testimonials Inventory ({testimonials.length} Total)
        </h4>

        <div className="space-y-4">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="bg-[#081226] border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5 max-w-2xl">
                {t.avatarUrl ? (
                  <img
                    src={t.avatarUrl}
                    alt={t.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-amber-400 shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center font-bold text-base shrink-0">
                    {t.avatarInitial || '✝'}
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-white text-sm font-semibold">{t.name}</strong>
                    {t.christianName && (
                      <span className="text-xs text-amber-400">({t.christianName})</span>
                    )}
                    <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                      Joined: {t.yearJoined}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 block mt-0.5">{t.role}</span>
                  <p className="text-xs text-slate-300 italic line-clamp-2 mt-1.5">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                    t.status === 'published'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {t.status === 'published' ? 'Published' : 'Draft'}
                </span>

                <button
                  type="button"
                  onClick={() => toggleTestimonialStatus(t.id)}
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 cursor-pointer"
                >
                  {t.status === 'published' ? 'Unpublish' : 'Publish'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Delete quote from "${t.name}"?`)) {
                      deleteTestimonial(t.id);
                    }
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 cursor-pointer"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
