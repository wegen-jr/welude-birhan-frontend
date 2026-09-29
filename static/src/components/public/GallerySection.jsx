import React, { useState } from 'react';
import { useCms } from '../../context/CmsContext';
import {
  Image, Video, Sparkles, Filter, Calendar, Eye, X, Quote,
  Play, ExternalLink, User, PlusCircle, Church
} from 'lucide-react';

export default function GallerySection() {
  const {
    galleryItems,
    publishedTestimonials,
    language,
    openLoginModal,
  } = useCms();

  const [activeCategoryFilter, setActiveCategoryFilter] = useState('All');
  const [activeMediaModal, setActiveMediaModal] = useState(null);

  const categories = [
    'All',
    'Feasts & Celebrations',
    'Choral & Zema',
    'Liturgy',
    'Youth Service',
  ];

  const filteredMedia =
    activeCategoryFilter === 'All'
      ? galleryItems
      : galleryItems.filter(
          (item) => item.category.toLowerCase() === activeCategoryFilter.toLowerCase()
        );

  const formatYoutubeEmbedUrl = (url) => {
    if (!url) return '';
    if (url.includes('youtube.com/embed/')) return url;
    if (url.includes('watch?v=')) {
      const videoId = url.split('watch?v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  const isYoutube = (url) => {
    return url && (url.includes('youtube.com') || url.includes('youtu.be'));
  };

  return (
    <section id="gallery-testimonials" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#0b1b3d]/60 border-t border-slate-800">
      <div className="max-w-7xl mx-auto space-y-20">
        
        {/* ========================================================
            PART 1: DYNAMIC MEDIA GALLERY GRID (Photos & Videos)
           ======================================================== */}
        <div>
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs uppercase tracking-widest mb-2">
                <Image className="w-4 h-4" />
                <span>{language === 'am' ? 'የሚዲያ ማህደር' : 'Media Gallery'}</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-extrabold font-serif text-white tracking-tight">
                {language === 'am'
                  ? 'የካቴድራሉ ሕይወት በፎቶና በቪዲዮ'
                  : 'Cathedral Life & Sacred Media'}
              </h2>
              <p className="text-slate-400 text-sm mt-2 max-w-xl">
                {language === 'am'
                  ? 'በድሬዳዋ ቅድስት ሥላሴ ካቴድራል የተከበሩ በዓላት፣ የዝማሬ መድረኮችና የወጣቶች አገልግሎት ምስሎችና ቪዲዮዎች።'
                  : 'Photographs, liturgical recordings, and choir video chant sessions from Holy Trinity Cathedral, Dire Dawa.'}
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategoryFilter(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    activeCategoryFilter.toLowerCase() === cat.toLowerCase()
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25'
                      : 'bg-[#081226] text-slate-300 hover:text-white border border-slate-700'
                  }`}
                >
                  {cat === 'All'
                    ? language === 'am'
                      ? 'ሁሉም (All)'
                      : 'All'
                    : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Media Grid or Empty State Fallback */}
          {filteredMedia.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMedia.map((media) => (
                <article
                  key={media.id}
                  className="group relative rounded-3xl overflow-hidden bg-[#081226] border border-slate-800 shadow-xl hover:border-amber-400/50 transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Media Frame (Image or Video) */}
                  <div className="relative h-60 w-full overflow-hidden bg-slate-950">
                    {media.type === 'video' ? (
                      isYoutube(media.url) ? (
                        <div className="w-full h-full relative">
                          <iframe
                            src={formatYoutubeEmbedUrl(media.url)}
                            title={media.title}
                            className="w-full h-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      ) : (
                        <video
                          src={media.url}
                          controls
                          className="w-full h-full object-cover bg-black"
                          preload="metadata"
                        />
                      )
                    ) : (
                      <div
                        className="w-full h-full cursor-pointer relative"
                        onClick={() => setActiveMediaModal(media)}
                      >
                        <img
                          src={media.url}
                          alt={media.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#081226] via-transparent to-transparent opacity-80" />
                        <button
                          type="button"
                          className="absolute bottom-4 right-4 p-2 rounded-full bg-amber-500 text-slate-950 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
                          aria-label="Enlarge image"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {/* Top Badges */}
                    <div className="absolute top-4 left-4 flex items-center gap-2 pointer-events-none">
                      <span className="text-[11px] font-bold uppercase tracking-wider bg-slate-950/85 text-amber-400 border border-amber-500/40 px-3 py-1 rounded-full backdrop-blur-md">
                        {media.category}
                      </span>
                      {media.type === 'video' && (
                        <span className="text-[10px] font-bold uppercase bg-red-600 text-white px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
                          <Play className="w-2.5 h-2.5 fill-current" />
                          <span>Video</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Metadata and Description */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-serif font-bold text-base text-white group-hover:text-amber-300 transition-colors mb-1.5">
                        {language === 'am' && media.titleAm ? media.titleAm : media.title}
                      </h3>
                      {media.description && (
                        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                          {media.description}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                      <span>Holy Trinity Dire Dawa</span>
                      <span>{media.date}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            /* Empty State Fallback if all items in category are deleted */
            <div className="bg-[#081226]/80 border-2 border-dashed border-slate-700 rounded-3xl p-12 text-center max-w-md mx-auto shadow-2xl">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-4 text-amber-400">
                <Image className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold font-serif text-white mb-2">
                No Media Found in &ldquo;{activeCategoryFilter}&rdquo;
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                All media items in this category were deleted or none have been uploaded yet. Coordinators can upload new photos or videos through the portal.
              </p>
              <button
                type="button"
                onClick={openLoginModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Upload Media via CMS</span>
              </button>
            </div>
          )}
        </div>

        {/* ========================================================
            PART 2: OLDER STUDENTS' TESTIMONIALS (4-Column Card Grid)
           ======================================================== */}
        <div className="pt-8 border-t border-slate-800">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest mb-3">
              <span>✝</span>
              <span>{language === 'am' ? 'የነባር ተማሪዎች ድምፅ' : 'Student & Alumni Voices'}</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold font-serif text-white tracking-tight">
              {language === 'am'
                ? 'የነባርና የተመራቂ ተማሪዎች ምስክርነት'
                : 'Older Students\' Testimonials'}
            </h2>
            <div className="h-1 w-20 bg-amber-500 mx-auto my-4 rounded-full" />
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              {language === 'am'
                ? 'በወሉደ ብርሃን ሰንበት ትምህርት ቤት ውስጥ አድገው ዛሬም ለቤተክርስቲያንና ለሀገር ብርሃን የሆኑ ወጣቶች የሕይወት ምስክርነት።'
                : 'How growing up under the bells of Holy Trinity Cathedral in Dire Dawa nurtured faith, wisdom, and selfless service.'}
            </p>
          </div>

          {/* 4-Column Card Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {publishedTestimonials.map((t) => (
              <div
                key={t.id}
                className="bg-white rounded-3xl p-6 shadow-2xl border-t-4 border-amber-500 flex flex-col justify-between text-slate-800 relative hover:-translate-y-1.5 transition-all duration-300 group"
              >
                <div>
                  {/* Top Avatar Cluster */}
                  <div className="flex items-center gap-3.5 mb-5">
                    {t.avatarUrl ? (
                      <img
                        src={t.avatarUrl}
                        alt={t.name}
                        className="w-13 h-13 rounded-full object-cover ring-2 ring-amber-400 shadow-md shrink-0"
                      />
                    ) : (
                      <div className="w-13 h-13 rounded-full bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                        {t.avatarInitial || '✝'}
                      </div>
                    )}

                    <div className="min-w-0">
                      <h4 className="font-serif font-bold text-base text-slate-900 leading-tight truncate">
                        {t.name}
                      </h4>
                      {t.christianName && (
                        <span className="text-[11px] text-amber-700 font-semibold block truncate">
                          {t.christianName}
                        </span>
                      )}
                      <span className="text-[11px] text-slate-500 block truncate mt-0.5">
                        {language === 'am' && t.roleAm ? t.roleAm : t.role}
                      </span>
                    </div>
                  </div>

                  {/* Inspirational Quote */}
                  <div className="relative mb-6">
                    <span className="text-amber-500/30 text-3xl font-serif absolute -top-3 -left-1">“</span>
                    <p className="text-slate-700 text-xs sm:text-sm leading-relaxed italic pl-3">
                      &ldquo;{language === 'am' && t.quoteAm ? t.quoteAm : t.quote}&rdquo;
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Joined Sunday School:</span>
                  <strong className="text-slate-800 font-semibold">{t.yearJoined}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Enlarged Image Lightbox Modal */}
      {activeMediaModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          onClick={() => setActiveMediaModal(null)}
        >
          <div
            className="max-w-3xl w-full bg-[#081226] border border-amber-500/40 rounded-3xl overflow-hidden shadow-2xl text-white relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveMediaModal(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <img
              src={activeMediaModal.url}
              alt={activeMediaModal.title}
              className="w-full max-h-[500px] object-cover"
            />

            <div className="p-6">
              <span className="text-xs uppercase font-bold text-amber-400 block mb-1">
                {activeMediaModal.category} • {activeMediaModal.date}
              </span>
              <h3 className="font-serif font-bold text-xl text-white mb-2">
                {language === 'am' && activeMediaModal.titleAm ? activeMediaModal.titleAm : activeMediaModal.title}
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {activeMediaModal.description}
              </p>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}
