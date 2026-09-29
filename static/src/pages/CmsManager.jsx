import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useContent } from '../Contexts/ContentContext';
import { useLanguage } from '../Contexts/LanguageContext';
import logo from '../assets/logo.png';
import {
  ArrowLeft,
  PlusCircle,
  FileText,
  Calendar,
  Sparkles,
  Tag,
  CheckCircle,
  Clock,
  Eye,
  EyeOff,
  Trash2,
  AlertCircle,
  BellRing,
  Layers,
  LayoutDashboard,
  LogOut,
  Search,
  ExternalLink,
  Church,
  GraduationCap,
  Music,
  BookOpen,
  Filter,
  Check,
} from 'lucide-react';

export default function CmsManager() {
  const {
    posts,
    stats,
    addPost,
    deletePost,
    toggleStatus,
    resetToDefault,
    user,
    logout,
    setActiveView,
  } = useContent();

  const { language } = useLanguage();
  const navigate = useNavigate();

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Spiritual Feast');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [placement, setPlacement] = useState('Upcoming Events Grid');
  const [description, setDescription] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');

  // UI feedback states
  const [formError, setFormError] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  const [inventoryFilter, setInventoryFilter] = useState('ALL'); // 'ALL' | 'published' | 'draft'
  const [searchQuery, setSearchQuery] = useState('');

  // Handle return to public site
  const handleBackToPublic = () => {
    setActiveView('public');
    navigate('/');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const showToast = (msg, type = 'success') => {
    setToastMessage({ text: msg, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Submit Handler for Form
  const handleSavePost = (statusToSet) => {
    setFormError('');

    if (!title.trim()) {
      setFormError('Please enter a title for the announcement or event.');
      return;
    }

    if (!description.trim()) {
      setFormError('Please provide a short description.');
      return;
    }

    const newPost = addPost({
      title,
      category,
      date,
      placement,
      description,
      time: time.trim() || 'TBD',
      location: location.trim() || 'Holy Trinity Sunday School',
      status: statusToSet,
    });

    // Reset Form
    setTitle('');
    setDescription('');
    setTime('');
    setLocation('');

    showToast(
      statusToSet === 'published'
        ? `"${newPost.title}" was published immediately to ${placement}!`
        : `"${newPost.title}" was saved as a draft.`
    );
  };

  // Category Badge Helper
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

  // Filtered Inventory list
  const filteredPosts = posts.filter((post) => {
    const matchesFilter =
      inventoryFilter === 'ALL' ? true : post.status === inventoryFilter;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#081226] text-slate-100 font-sans">
      
      {/* ========================================================
          PORTAL SHELL: TOP ADMINISTRATIVE BAR
         ======================================================== */}
      <header className="sticky top-0 z-40 bg-[#0b1b3d]/95 backdrop-blur-md border-b border-amber-500/30 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18">
            
            {/* Left: Back to Public Website & Branding */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleBackToPublic}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-amber-500/40 text-amber-300 hover:text-white hover:bg-amber-500/10 text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>← Back to Public Website</span>
              </button>

              <div className="h-6 w-px bg-slate-700 hidden sm:block" />

              <div className="flex items-center gap-3">
                <img
                  src={logo}
                  alt="Welude Birhan Logo"
                  className="w-8 h-8 rounded-full ring-2 ring-amber-400"
                />
                <div className="hidden md:flex flex-col">
                  <span className="font-serif font-bold text-sm text-white">
                    Welude Birhan CMS
                  </span>
                  <span className="text-[10px] text-amber-400 uppercase tracking-widest font-semibold">
                    Coordinator Desk
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Coordinator Profile & Actions */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Coordinator: <strong className="text-white">{user?.name || 'Deacon Kidanewold'}</strong></span>
              </div>

              <button
                type="button"
                onClick={handleBackToPublic}
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
                title="Preview changes on live public site"
              >
                <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                <span>View Public Site</span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                title="Sign out of CMS"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline text-xs font-medium">Logout</span>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* ========================================================
            STATUS STATS COUNTERS BAR
           ======================================================== */}
        <section aria-label="Content Statistics" className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          {/* Stat 1: Total Published Posts */}
          <div className="bg-[#0b1b3d] border border-amber-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                  Published Posts
                </p>
                <p className="text-3xl font-extrabold font-serif text-white mt-1">
                  {stats.publishedCount}
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Live on public drop zones</span>
            </div>
          </div>

          {/* Stat 2: Drafts */}
          <div className="bg-[#0b1b3d] border border-amber-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                  Drafts
                </p>
                <p className="text-3xl font-extrabold font-serif text-amber-400 mt-1">
                  {stats.draftCount}
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
            </div>
            <p className="mt-3 text-[11px] text-slate-400">
              Hidden from public site until published
            </p>
          </div>

          {/* Stat 3: Active Categories */}
          <div className="bg-[#0b1b3d] border border-amber-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                  Active Categories
                </p>
                <p className="text-3xl font-extrabold font-serif text-white mt-1">
                  {stats.categoriesCount}
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center">
                <Tag className="w-6 h-6" />
              </div>
            </div>
            <p className="mt-3 text-[11px] text-slate-400">
              Feast, Academic, Mezmur, General
            </p>
          </div>

          {/* Stat 4: Urgent Notices */}
          <div className="bg-[#0b1b3d] border border-amber-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                  Urgent Banners
                </p>
                <p className="text-3xl font-extrabold font-serif text-white mt-1">
                  {stats.urgentCount}
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                <BellRing className="w-6 h-6" />
              </div>
            </div>
            <p className="mt-3 text-[11px] text-amber-300">
              {stats.urgentCount > 0 ? 'Active top notice banner' : 'No active banner'}
            </p>
          </div>

        </section>

        {/* Real-time State Notification Toast */}
        {toastMessage && (
          <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-sm flex items-center justify-between gap-3 shadow-lg animate-fadeIn">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{toastMessage.text}</span>
            </div>
            <button
              onClick={handleBackToPublic}
              className="text-xs font-bold text-white underline hover:text-amber-300 shrink-0"
            >
              View on Website →
            </button>
          </div>
        )}

        {/* ========================================================
            CONTENT CREATION FORM
           ======================================================== */}
        <section className="bg-[#0b1b3d] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                <PlusCircle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-serif text-white">
                  Create New Announcement or Event
                </h2>
                <p className="text-xs text-slate-400">
                  Publish notices or calendar events directly into the public dynamic drop zone.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={resetToDefault}
              className="text-xs text-slate-400 hover:text-amber-400 underline transition-colors cursor-pointer"
              title="Reset mock store to original 2 published and 1 draft"
            >
              Reset Mock Data
            </button>
          </div>

          {formError && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSavePost('published');
            }}
            className="space-y-6"
          >
            {/* Row 1: Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Event / Announcement Title <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Annual Feast of the Holy Trinity (በዓለ ሥላሴ)"
                className="w-full px-4 py-3 bg-[#081226] border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
                required
              />
            </div>

            {/* Row 2: Category, Date, Placement */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Category / Tag */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Category / Tag <span className="text-amber-400">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-[#081226] border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors cursor-pointer"
                >
                  <option value="Spiritual Feast">Spiritual Feast (መንፈሳዊ በዓል)</option>
                  <option value="Academic">Academic (አካዳሚክ)</option>
                  <option value="Mezmur">Mezmur (የዝማሬ)</option>
                  <option value="General">General (አጠቃላይ)</option>
                </select>
              </div>

              {/* Event Date */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Event Date <span className="text-amber-400">*</span>
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 bg-[#081226] border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors cursor-pointer"
                  required
                />
              </div>

              {/* Target Placement */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Target Placement <span className="text-amber-400">*</span>
                </label>
                <select
                  value={placement}
                  onChange={(e) => setPlacement(e.target.value)}
                  className="w-full px-4 py-3 bg-[#081226] border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors cursor-pointer"
                >
                  <option value="Upcoming Events Grid">Upcoming Events Grid (3-Card Zone)</option>
                  <option value="Urgent Notice Banner">Urgent Notice Banner (Top Alert)</option>
                </select>
              </div>

            </div>

            {/* Optional time & location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Time / Duration (Optional)
                </label>
                <input
                  type="text"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="e.g. 6:00 AM - 1:00 PM"
                  className="w-full px-4 py-2.5 bg-[#081226] border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Location / Venue (Optional)
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Holy Trinity Cathedral Sanctuary"
                  className="w-full px-4 py-2.5 bg-[#081226] border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Short Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Short Description <span className="text-amber-400">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Provide a concise summary of the liturgical program, dress code, choir requirements, or attendee guidelines..."
                className="w-full px-4 py-3 bg-[#081226] border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
                required
              />
            </div>

            {/* Fast-Action Buttons: "Publish Immediately" and "Save as Draft" */}
            <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setTitle('');
                  setDescription('');
                  setTime('');
                  setLocation('');
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Clear
              </button>

              <button
                type="button"
                onClick={() => handleSavePost('draft')}
                className="px-6 py-2.5 rounded-xl border-2 border-amber-400/80 hover:border-amber-400 text-amber-300 hover:text-white hover:bg-amber-500/10 text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer"
              >
                Save as Draft
              </button>

              <button
                type="button"
                onClick={() => handleSavePost('published')}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-bold uppercase tracking-wider shadow-lg shadow-amber-500/25 transition-all duration-200 cursor-pointer flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Publish Immediately
              </button>
            </div>

          </form>
        </section>

        {/* ========================================================
            LIVE INVENTORY / POST TABLE
           ======================================================== */}
        <section className="bg-[#0b1b3d] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl">
          
          {/* Table Header & Search Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-xl font-bold font-serif text-white">
                Live Inventory & Post Management
              </h2>
              <p className="text-xs text-slate-400">
                Any changes made here directly reflect on the public landing page in real time.
              </p>
            </div>

            {/* Filter Tabs & Search */}
            <div className="flex flex-wrap items-center gap-3">
              
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search posts..."
                  className="pl-9 pr-3 py-1.5 bg-[#081226] border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 w-44 sm:w-56"
                />
              </div>

              {/* Status Filter Tabs */}
              <div className="inline-flex rounded-xl bg-[#081226] p-1 border border-slate-700">
                <button
                  type="button"
                  onClick={() => setInventoryFilter('ALL')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    inventoryFilter === 'ALL'
                      ? 'bg-amber-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All ({posts.length})
                </button>
                <button
                  type="button"
                  onClick={() => setInventoryFilter('published')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    inventoryFilter === 'published'
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Published ({stats.publishedCount})
                </button>
                <button
                  type="button"
                  onClick={() => setInventoryFilter('draft')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    inventoryFilter === 'draft'
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Drafts ({stats.draftCount})
                </button>
              </div>

            </div>
          </div>

          {/* TABLE DISPLAY */}
          {filteredPosts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-3 px-4">Title & Description</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Placement</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredPosts.map((post) => (
                    <tr
                      key={post.id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Title & Preview */}
                      <td className="py-4 px-4 max-w-xs">
                        <div className="font-semibold text-white group-hover:text-amber-300 transition-colors">
                          {post.title}
                        </div>
                        <div className="text-xs text-slate-400 truncate mt-0.5 max-w-sm">
                          {post.description}
                        </div>
                      </td>

                      {/* Category Badge */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {renderCategoryBadge(post.category)}
                      </td>

                      {/* Placement */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-md font-medium ${
                            post.placement === 'Urgent Notice Banner'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}
                        >
                          {post.placement === 'Urgent Notice Banner'
                            ? 'Top Notice'
                            : 'Events Grid'}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 whitespace-nowrap text-xs text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-amber-400" />
                          <span>{post.date}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {post.status === 'published' ? (
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

                      {/* Action Buttons: Toggle Status & Delete */}
                      <td className="py-4 px-4 whitespace-nowrap text-right space-x-2">
                        {/* Toggle Status */}
                        <button
                          type="button"
                          onClick={() => {
                            toggleStatus(post.id);
                            showToast(
                              `"${post.title}" is now ${
                                post.status === 'published' ? 'Draft' : 'Published'
                              }.`
                            );
                          }}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            post.status === 'published'
                              ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                              : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold'
                          }`}
                          title={
                            post.status === 'published'
                              ? 'Unpublish and move to drafts'
                              : 'Publish immediately to public site'
                          }
                        >
                          {post.status === 'published' ? (
                            <>
                              <EyeOff className="w-3.5 h-3.5" />
                              <span>Unpublish</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-3.5 h-3.5" />
                              <span>Publish</span>
                            </>
                          )}
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => {
                            if (
                              window.confirm(
                                `Are you sure you want to delete "${post.title}"?`
                              )
                            ) {
                              deletePost(post.id);
                              showToast(`Deleted "${post.title}".`, 'info');
                            }
                          }}
                          className="inline-flex items-center p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                          title="Delete Post"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400">
              <FileText className="w-10 h-10 mx-auto text-slate-600 mb-2" />
              <p className="font-semibold text-sm">No items found matching your filter.</p>
              <p className="text-xs text-slate-500 mt-1">
                Try switching the status tab or searching with different keywords.
              </p>
            </div>
          )}

        </section>

      </main>

    </div>
  );
}
