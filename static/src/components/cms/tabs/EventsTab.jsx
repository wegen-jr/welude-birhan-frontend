import React, { useState } from 'react';
import { useCms } from '../../../context/CmsContext';
import {
  Calendar, Clock, MapPin, PlusCircle, CheckCircle, Sparkles, Tag,
  Eye, EyeOff, Trash2, Edit3, AlertCircle, BellRing, Search, Check,
  GraduationCap, Music, BookOpen, Layers
} from 'lucide-react';

export default function EventsTab() {
  const {
    events,
    stats,
    addEvent,
    updateEvent,
    deleteEvent,
    toggleEventStatus,
    language,
  } = useCms();

  // Form State
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [titleAm, setTitleAm] = useState('');
  const [category, setCategory] = useState('Spiritual Feast');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('Holy Trinity Cathedral, Dire Dawa');
  const [placement, setPlacement] = useState('Upcoming Events Grid');
  const [description, setDescription] = useState('');
  const [descriptionAm, setDescriptionAm] = useState('');

  // UI state
  const [formError, setFormError] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleEditClick = (evt) => {
    setEditingId(evt.id);
    setTitle(evt.title);
    setTitleAm(evt.titleAm || '');
    setCategory(evt.category);
    setDate(evt.date);
    setTime(evt.time || '');
    setLocation(evt.location || '');
    setPlacement(evt.placement || 'Upcoming Events Grid');
    setDescription(evt.description || '');
    setDescriptionAm(evt.descriptionAm || '');
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleClearForm = () => {
    setEditingId(null);
    setTitle('');
    setTitleAm('');
    setTime('');
    setDescription('');
    setDescriptionAm('');
    setFormError('');
  };

  const handleSave = (statusToSet) => {
    setFormError('');

    if (!title.trim()) {
      setFormError('Please enter an event / announcement title.');
      return;
    }
    if (!description.trim()) {
      setFormError('Please enter a description for the event.');
      return;
    }

    if (editingId) {
      updateEvent(editingId, {
        title,
        titleAm: titleAm.trim() || title,
        category,
        date,
        time,
        location,
        placement,
        description,
        descriptionAm: descriptionAm.trim() || description,
        status: statusToSet,
      });
      triggerToast(`Updated "${title}" successfully.`);
      handleClearForm();
    } else {
      const created = addEvent({
        title,
        titleAm: titleAm.trim() || title,
        category,
        date,
        time,
        location,
        placement,
        description,
        descriptionAm: descriptionAm.trim() || description,
        status: statusToSet,
      });
      triggerToast(
        statusToSet === 'published'
          ? `"${created.title}" published immediately to public site!`
          : `"${created.title}" saved as draft.`
      );
      handleClearForm();
    }
  };

  const renderCategoryBadge = (cat) => {
    switch (cat) {
      case 'Spiritual Feast':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
            <Sparkles className="w-3 h-3" />
            Spiritual Feast
          </span>
        );
      case 'Academic':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-900 border border-blue-300">
            <GraduationCap className="w-3 h-3" />
            Academic
          </span>
        );
      case 'Mezmur':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300">
            <Music className="w-3 h-3" />
            Mezmur
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-900 border border-purple-300">
            <BookOpen className="w-3 h-3" />
            General
          </span>
        );
    }
  };

  const filteredEvents = events.filter((evt) => {
    const matchesStatus = statusFilter === 'ALL' ? true : evt.status === statusFilter;
    const matchesSearch =
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (evt.titleAm && evt.titleAm.includes(searchQuery)) ||
      evt.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#0b1b3d] border border-amber-500/30 rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Published</p>
            <p className="text-3xl font-extrabold font-serif text-white mt-1">{stats.publishedEventsCount}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#0b1b3d] border border-amber-500/30 rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Drafts</p>
            <p className="text-3xl font-extrabold font-serif text-amber-400 mt-1">{stats.draftEventsCount}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#0b1b3d] border border-amber-500/30 rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Urgent Banners</p>
            <p className="text-3xl font-extrabold font-serif text-white mt-1">{stats.urgentCount}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
            <BellRing className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#0b1b3d] border border-amber-500/30 rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Categories</p>
            <p className="text-3xl font-extrabold font-serif text-white mt-1">{stats.activeCategoriesCount}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center">
            <Tag className="w-6 h-6" />
          </div>
        </div>
      </div>

      {toastMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-sm flex items-center gap-2 shadow-lg">
          <Check className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Creation / Edit Form */}
      <section className="bg-[#0b1b3d] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-xl text-white">
                {editingId ? 'Edit Existing Announcement' : 'Create New Announcement or Event'}
              </h3>
              <p className="text-xs text-slate-400">
                Immediately updates the dynamic drop zone or urgent banner on public pages.
              </p>
            </div>
          </div>

          {editingId && (
            <button
              type="button"
              onClick={handleClearForm}
              className="text-xs text-amber-400 hover:underline"
            >
              Cancel Edit Mode
            </button>
          )}
        </div>

        {formError && (
          <div className="mb-6 p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <div className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Title (English) *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Annual Feast of the Holy Trinity"
                className="w-full px-4 py-3 bg-[#081226] border border-slate-700 rounded-xl text-white text-sm focus:border-amber-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Title (Amharic - አማርኛ)
              </label>
              <input
                type="text"
                value={titleAm}
                onChange={(e) => setTitleAm(e.target.value)}
                placeholder="e.g. የቅድስት ሥላሴ ዓመታዊ ክብረ በዓል"
                className="w-full px-4 py-3 bg-[#081226] border border-slate-700 rounded-xl text-white text-sm focus:border-amber-400 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 bg-[#081226] border border-slate-700 rounded-xl text-white text-sm outline-none"
              >
                <option value="Spiritual Feast">Spiritual Feast (መንፈሳዊ በዓል)</option>
                <option value="Academic">Academic (አካዳሚክ)</option>
                <option value="Mezmur">Mezmur (የዝማሬ)</option>
                <option value="General">General (አጠቃላይ)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Event Date *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 bg-[#081226] border border-slate-700 rounded-xl text-white text-sm outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Target Placement *
              </label>
              <select
                value={placement}
                onChange={(e) => setPlacement(e.target.value)}
                className="w-full px-4 py-3 bg-[#081226] border border-slate-700 rounded-xl text-white text-sm outline-none"
              >
                <option value="Upcoming Events Grid">Upcoming Events Grid (3-Card Zone)</option>
                <option value="Urgent Notice Banner">Urgent Notice Banner (Top Alert)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Time / Duration
              </label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="e.g. 6:00 AM - 1:00 PM"
                className="w-full px-4 py-2.5 bg-[#081226] border border-slate-700 rounded-xl text-white text-sm focus:border-amber-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Venue / Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Holy Trinity Cathedral Sanctuary"
                className="w-full px-4 py-2.5 bg-[#081226] border border-slate-700 rounded-xl text-white text-sm focus:border-amber-400 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Short Description (English) *
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Liturgical details, program highlights, attendee guidelines..."
                className="w-full px-4 py-2.5 bg-[#081226] border border-slate-700 rounded-xl text-white text-sm focus:border-amber-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Short Description (Amharic - አማርኛ)
              </label>
              <textarea
                rows={3}
                value={descriptionAm}
                onChange={(e) => setDescriptionAm(e.target.value)}
                placeholder="የበዓሉ አከባበር፣ መርሃ ግብሩና የተሳታፊዎች ዝርዝር..."
                className="w-full px-4 py-2.5 bg-[#081226] border border-slate-700 rounded-xl text-white text-sm focus:border-amber-400 outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={handleClearForm}
              className="px-4 py-2 rounded-xl border border-slate-700 text-slate-400 hover:text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => handleSave('draft')}
              className="px-6 py-2.5 rounded-xl border-2 border-amber-400/80 text-amber-300 hover:text-white hover:bg-amber-500/10 text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              Save as Draft
            </button>
            <button
              type="button"
              onClick={() => handleSave('published')}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{editingId ? 'Update & Publish' : 'Publish Immediately'}</span>
            </button>
          </div>

        </div>
      </section>

      {/* Live Inventory Table */}
      <section className="bg-[#0b1b3d] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
          <div>
            <h3 className="font-serif font-bold text-xl text-white">Live Inventory Table</h3>
            <p className="text-xs text-slate-400">
              Manage live status. Changes reflect instantaneously across the landing page.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events..."
                className="pl-9 pr-3 py-1.5 bg-[#081226] border border-slate-700 rounded-xl text-xs text-white outline-none w-48 sm:w-56"
              />
            </div>

            <div className="inline-flex rounded-xl bg-[#081226] p-1 border border-slate-700">
              {['ALL', 'published', 'draft'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize cursor-pointer ${
                    statusFilter === s ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Title & Placement</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredEvents.map((evt) => (
                <tr key={evt.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-4 max-w-xs">
                    <strong className="text-white block font-semibold">{evt.title}</strong>
                    <span className="text-[11px] text-amber-400/80 block mt-0.5">{evt.titleAm}</span>
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded mt-1 inline-block">
                      {evt.placement}
                    </span>
                  </td>

                  <td className="py-4 px-4 whitespace-nowrap">
                    {renderCategoryBadge(evt.category)}
                  </td>

                  <td className="py-4 px-4 whitespace-nowrap text-xs text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      <span>{evt.date}</span>
                    </div>
                  </td>

                  <td className="py-4 px-4 whitespace-nowrap">
                    {evt.status === 'published' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        Draft
                      </span>
                    )}
                  </td>

                  <td className="py-4 px-4 whitespace-nowrap text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        toggleEventStatus(evt.id);
                        triggerToast(`Status changed for "${evt.title}".`);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        evt.status === 'published'
                          ? 'bg-slate-800 text-slate-300 border border-slate-700'
                          : 'bg-emerald-500 text-slate-950 font-bold'
                      }`}
                      title={evt.status === 'published' ? 'Unpublish' : 'Publish'}
                    >
                      {evt.status === 'published' ? 'Unpublish' : 'Publish'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleEditClick(evt)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-white/5"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Delete "${evt.title}"?`)) {
                          deleteEvent(evt.id);
                          triggerToast(`Deleted "${evt.title}".`);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                      title="Delete"
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
