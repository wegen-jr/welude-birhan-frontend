import { useState } from "react";
import { toast } from "react-toastify";
import {
  BookPlus,
  BookOpen,
  Clock,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  RefreshCw,
  X,
  Sparkles
} from "lucide-react";
import { courseService } from "../../services/educationhub/courseService";

const SUGGESTED_COURSES = [
  "Orthodox Dogma & Canon",
  "Church History & Tradition",
  "Old & New Testament Survey",
  "Ge'ez Language & Grammar",
  "Liturgical Hymns (Zema)",
  "Christian Ethics & Morality",
  "Patristics & Church Fathers",
];

export default function CourseRegistrationForm({
  onCourseCreated,
  isDarkMode = true,
  isAuthorized = true,
  onClose = null,
}) {
  const [formData, setFormData] = useState({
    courseName: "",
    creditHours: 3,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorBanner, setErrorBanner] = useState("");
  const [lastCreatedCourse, setLastCreatedCourse] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "creditHours" ? Number(value) : value,
    }));
    if (errorBanner) setErrorBanner("");
  };

  const handleSelectSuggested = (title) => {
    setFormData((prev) => ({ ...prev, courseName: title }));
    if (errorBanner) setErrorBanner("");
  };

  const validate = () => {
    if (!formData.courseName.trim()) {
      return "Course name is required.";
    }
    if (formData.courseName.trim().length < 3) {
      return "Course name must be at least 3 characters long.";
    }
    const ch = Number(formData.creditHours);
    if (isNaN(ch) || ch < 1 || ch > 12) {
      return "Credit hours must be between 1 and 12.";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorBanner("");

    if (!isAuthorized) {
      const msg = "Unauthorized: Only Education Hub Leaders and Admins can create courses.";
      setErrorBanner(msg);
      toast.error(msg);
      return;
    }

    const validationErr = validate();
    if (validationErr) {
      setErrorBanner(validationErr);
      toast.error(validationErr);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        courseName: formData.courseName.trim(),
        craditHours: Number(formData.creditHours),
      };

      const created = await courseService.createCourse(payload);
      setLastCreatedCourse(created);
      toast.success(`Course "${created.courseName}" created successfully!`);

      // Reset form
      setFormData({
        courseName: "",
        creditHours: 3,
      });

      if (onCourseCreated) {
        onCourseCreated(created);
      }
    } catch (err) {
      console.error("Course creation error:", err);
      const msg = err.message || "Failed to create course. Please try again.";
      setErrorBanner(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthorized) {
    return (
      <div className={`p-6 rounded-2xl border ${isDarkMode ? "bg-rose-500/10 border-rose-500/20 text-rose-300" : "bg-rose-50 border-rose-200 text-rose-700"
        }`}>
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0" />
          <div>
            <h4 className="font-semibold text-sm">Restricted Access</h4>
            <p className="text-xs opacity-90 mt-0.5">
              Only Education Hub leaders and administrators can register new courses.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border p-6 transition-all shadow-sm relative ${isDarkMode
        ? "bg-[#0b1b3d]/60 border-white/10 text-slate-100"
        : "bg-white border-slate-200 text-slate-800"
      }`}>
      {/* Header */}
      <div className="flex items-start justify-between pb-4 mb-5 border-b border-inherit">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
            <BookPlus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-serif font-bold tracking-tight">Register New Course</h2>
            <p className="text-xs text-slate-400">
              Add a curriculum subject to the Sunday School course catalog
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg border transition-colors ${isDarkMode
                ? "border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/5"
                : "border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100"
              }`}
            title="Close form"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Success Banner */}
      {lastCreatedCourse && (
        <div className={`mb-6 p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${isDarkMode ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" : "bg-emerald-50 border-emerald-200 text-emerald-800"
          }`}>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <p className="text-xs font-semibold">Course successfully created!</p>
              <p className="text-xs opacity-90">
                <span className="font-bold">{lastCreatedCourse.courseName}</span> (#{lastCreatedCourse.id}) — {lastCreatedCourse.creditHours} Credit Hours
              </p>
            </div>
          </div>
          <button
            onClick={() => setLastCreatedCourse(null)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition"
          >
            Add Another
          </button>
        </div>
      )}

      {/* Error Banner with Retry */}
      {errorBanner && (
        <div className={`mb-6 p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${isDarkMode ? "bg-rose-500/10 border-rose-500/30 text-rose-300" : "bg-rose-50 border-rose-200 text-rose-700"
          }`}>
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-semibold">Creation Issue: </span>
              <span>{errorBanner}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="self-end sm:self-auto shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-200 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSubmitting ? "animate-spin" : ""}`} />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* Quick Suggested Course Chips */}
      <div className="mb-4">
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>Quick Curriculum Suggestions:</span>
        </label>
        <div className="flex flex-wrap gap-1.5">
          {SUGGESTED_COURSES.map((title) => (
            <button
              key={title}
              type="button"
              onClick={() => handleSelectSuggested(title)}
              className={`text-[11px] px-2.5 py-1 rounded-lg border transition ${formData.courseName === title
                  ? "bg-amber-500 text-slate-950 border-amber-500 font-bold"
                  : (isDarkMode
                    ? "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100")
                }`}
            >
              {title}
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Course Name */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Course Name <span className="text-amber-500">*</span>
            </label>
            <div className="relative">
              <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                name="courseName"
                value={formData.courseName}
                onChange={handleChange}
                placeholder="e.g. Orthodox Dogma & Canon I"
                required
                disabled={isSubmitting}
                className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition font-medium ${isDarkMode
                    ? "bg-[#081226] border-white/10 text-slate-100 placeholder-slate-500"
                    : "bg-white border-slate-300 text-slate-900 placeholder-slate-400"
                  }`}
              />
            </div>
          </div>

          {/* Credit Hours */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Credit Hours <span className="text-amber-500">*</span>
            </label>
            <div className="relative">
              <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="number"
                name="creditHours"
                value={formData.creditHours}
                onChange={handleChange}
                min={1}
                max={12}
                required
                disabled={isSubmitting}
                className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition font-medium ${isDarkMode
                    ? "bg-[#081226] border-white/10 text-slate-100 placeholder-slate-500"
                    : "bg-white border-slate-300 text-slate-900 placeholder-slate-400"
                  }`}
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2 flex items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-md active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Registering Course...</span>
              </>
            ) : (
              <>
                <BookPlus className="w-4 h-4" />
                <span>Create & Add Course</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
