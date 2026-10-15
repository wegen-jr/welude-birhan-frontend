import { useState, useMemo } from "react";
import { toast } from "react-toastify";
import { 
  Search, 
  Filter, 
  RefreshCw, 
  BookOpen, 
  Clock, 
  Trash2, 
  Edit3, 
  AlertTriangle,
  GraduationCap,
  FileDown,
  Loader2
} from "lucide-react";
import { courseService } from "../../services/courseService";
import { teacherService } from "../../services/teacherService";
import { sundaySchoolService } from "../../services/sundaySchoolService";
import { generateSingleCourseSlipCsv, triggerCsvDownload } from "../../utils/csvExport";

export default function CourseDataTable({
  courses = [],
  loading = false,
  onRefresh,
  onEditCourse,
  onCourseDeleted,
  isDarkMode = true,
  isAuthorized = true,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [creditFilter, setCreditFilter] = useState("ALL");
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [generatingSlipCourseId, setGeneratingSlipCourseId] = useState(null);

  const handleGenerateCourseSlip = async (course) => {
    if (!course?.id) return;
    setGeneratingSlipCourseId(course.id);
    try {
      const [classAssignments, teachers, enrollments] = await Promise.all([
        courseService.getClassCourseAssignments().catch(() => []),
        teacherService.getTeachers().catch(() => []),
        sundaySchoolService.getEnrollments({ limit: "500" }).catch(() => []),
      ]);

      const csv = generateSingleCourseSlipCsv(course, {
        classAssignments: Array.isArray(classAssignments) ? classAssignments : [],
        teachers: Array.isArray(teachers) ? teachers : [],
        enrollments: Array.isArray(enrollments) ? enrollments : [],
      });

      const sanitizedName = (course.courseName || `course_${course.id}`).replace(/[^a-zA-Z0-9_-]/g, "_");
      triggerCsvDownload(csv, `course_slip_${sanitizedName}_${course.id}.csv`);
      toast.success(`Course slip for "${course.courseName}" downloaded!`);
    } catch (err) {
      console.error("Failed to generate course slip:", err);
      toast.error(err.message || "Failed to generate course slip.");
    } finally {
      setGeneratingSlipCourseId(null);
    }
  };

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || (
        (c.courseName && c.courseName.toLowerCase().includes(q)) ||
        String(c.id).includes(q)
      );

      const ch = Number(c.creditHours);
      let matchesCredits = true;
      if (creditFilter === "1-2") {
        matchesCredits = ch >= 1 && ch <= 2;
      } else if (creditFilter === "3-4") {
        matchesCredits = ch >= 3 && ch <= 4;
      } else if (creditFilter === "5+") {
        matchesCredits = ch >= 5;
      }

      return matchesSearch && matchesCredits;
    });
  }, [courses, searchQuery, creditFilter]);

  const confirmDelete = async () => {
    if (!deleteCandidate) return;
    setIsDeleting(true);
    try {
      await courseService.deleteCourse(deleteCandidate.id);
      toast.success(`Course "${deleteCandidate.courseName}" deleted successfully.`);
      if (onCourseDeleted) {
        onCourseDeleted(deleteCandidate.id);
      }
      setDeleteCandidate(null);
    } catch (err) {
      console.error("Failed to delete course:", err);
      toast.error(err.message || "Failed to delete course.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={`rounded-2xl border transition-all shadow-sm overflow-hidden ${
      isDarkMode 
        ? "bg-[#0b1b3d]/60 border-white/10 text-slate-100" 
        : "bg-white border-slate-200 text-slate-800"
    }`}>
      {/* Top Header & Search/Filter Controls */}
      <div className="p-5 border-b border-inherit space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-serif font-bold tracking-tight">Curriculum Course Catalog</h3>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                isDarkMode 
                  ? "bg-amber-500/10 border-amber-500/20 text-amber-400" 
                  : "bg-amber-50 border-amber-200 text-amber-700"
              }`}>
                {courses.length} Total
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Sunday School academic subjects, theology courses, and credit hours
            </p>
          </div>

          <button
            onClick={onRefresh}
            disabled={loading}
            className={`self-start sm:self-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
              isDarkMode 
                ? "bg-white/5 border-white/10 hover:bg-white/10 text-slate-300" 
                : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-amber-500" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
          <div className="sm:col-span-8 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by course name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition ${
                isDarkMode 
                  ? "bg-[#081226] border-white/10 text-slate-100 placeholder-slate-500" 
                  : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400"
              }`}
            />
          </div>

          <div className="sm:col-span-4 relative">
            <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <select
              value={creditFilter}
              onChange={(e) => setCreditFilter(e.target.value)}
              className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition ${
                isDarkMode 
                  ? "bg-[#081226] border-white/10 text-slate-100" 
                  : "bg-slate-50 border-slate-200 text-slate-800"
              }`}
            >
              <option value="ALL">All Credit Hours</option>
              <option value="1-2">1 - 2 Credit Hours</option>
              <option value="3-4">3 - 4 Credit Hours</option>
              <option value="5+">5+ Credit Hours</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className={`border-b uppercase tracking-wider text-[11px] font-semibold ${
              isDarkMode 
                ? "bg-white/[0.02] border-white/10 text-slate-400" 
                : "bg-slate-100/80 border-slate-200 text-slate-600"
            }`}>
              <th className="py-4 px-6 font-semibold">Course Title</th>
              <th className="py-4 px-6 font-semibold">Credit Hours</th>
              <th className="py-4 px-6 font-semibold">Created Date</th>
              <th className="py-4 px-6 font-semibold text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-inherit">
            {loading ? (
              <tr>
                <td colSpan="4" className="py-12 text-center text-slate-500 dark:text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
                    <span className="text-xs">Loading course catalog...</span>
                  </div>
                </td>
              </tr>
            ) : filteredCourses.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-12 text-center text-slate-500 dark:text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <BookOpen className="w-8 h-8 text-slate-400" />
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">No courses found</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {courses.length === 0 
                        ? "Register your first Sunday School course using the form above." 
                        : "Try adjusting your search query or credit filter."}
                    </span>
                    {(searchQuery || creditFilter !== "ALL") && (
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setCreditFilter("ALL");
                        }}
                        className="mt-2 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredCourses.map((course) => (
                <tr 
                  key={course.id}
                  className={`transition-colors group ${
                    isDarkMode ? "hover:bg-white/[0.02]" : "hover:bg-slate-50/80"
                  }`}
                >
                  {/* Course Title Column */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center font-bold text-xs shrink-0">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                          {course.courseName}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                          ID: #{course.id}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Credit Hours Badge */}
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${
                      isDarkMode 
                        ? "bg-amber-500/10 border-amber-500/20 text-amber-400" 
                        : "bg-amber-50 border-amber-200 text-amber-700"
                    }`}>
                      <Clock className="w-3.5 h-3.5" />
                      <span>{course.creditHours} Credits</span>
                    </span>
                  </td>

                  {/* Created Date */}
                  <td className="py-4 px-6 text-slate-600 dark:text-slate-400 text-xs">
                    {course.createdAt 
                      ? new Date(course.createdAt).toLocaleDateString()
                      : "—"}
                  </td>

                  {/* Actions Column */}
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Download Course Slip (CSV) Button */}
                      <button
                        type="button"
                        onClick={() => handleGenerateCourseSlip(course)}
                        disabled={generatingSlipCourseId === course.id}
                        className={`p-2 rounded-xl border transition cursor-pointer disabled:opacity-50 ${
                          isDarkMode 
                            ? "border-white/10 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/20" 
                            : "border-slate-200 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50"
                        }`}
                        title="Download Course Slip Report (CSV)"
                      >
                        {generatingSlipCourseId === course.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                        ) : (
                          <FileDown className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {isAuthorized ? (
                        <>
                          <button
                            type="button"
                            onClick={() => onEditCourse && onEditCourse(course)}
                            className={`p-2 rounded-xl border transition cursor-pointer ${
                              isDarkMode 
                                ? "border-white/10 text-slate-400 hover:text-sky-400 hover:bg-sky-500/10 hover:border-sky-500/20" 
                                : "border-slate-200 text-slate-600 hover:text-sky-600 hover:bg-sky-50"
                            }`}
                            title="Edit Course"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteCandidate(course)}
                            className={`p-2 rounded-xl border transition cursor-pointer ${
                              isDarkMode 
                                ? "border-white/10 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20" 
                                : "border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50"
                            }`}
                            title="Delete Course"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic ml-1">Read-only</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

      </div>

      {/* Footer Summary */}
      <div className={`p-4 border-t border-inherit flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2 ${
        isDarkMode ? "bg-white/[0.01]" : "bg-slate-50"
      }`}>
        <div>
          Showing <span className="font-semibold text-slate-200">{filteredCourses.length}</span> of{" "}
          <span className="font-semibold text-slate-200">{courses.length}</span> courses
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl transition-all ${
            isDarkMode 
              ? "bg-[#0b1b3d] border-white/10 text-slate-100" 
              : "bg-white border-slate-200 text-slate-800"
          }`}>
            <div className="flex items-center gap-3 text-rose-500 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-base">Delete Course</h4>
                <p className="text-xs text-slate-400">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              Are you sure you want to delete <span className="font-bold text-amber-500">{deleteCandidate.courseName}</span> (#{deleteCandidate.id})? This will permanently remove the course from the catalog.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                disabled={isDeleting}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border transition ${
                  isDarkMode 
                    ? "bg-white/5 border-white/10 hover:bg-white/10 text-slate-300" 
                    : "bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700"
                }`}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white transition shadow disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
