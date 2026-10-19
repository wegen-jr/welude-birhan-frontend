import { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { 
  School, 
  X, 
  Check, 
  AlertCircle, 
  Loader2, 
  GraduationCap, 
  Search, 
  ExternalLink
} from "lucide-react";
import { teacherService } from "../../services/teacherService";
import { courseService } from "../../services/courseService";

/**
 * AssignTeacherModal Component
 * 
 * Modular modal allowing administrators to assign a registered teacher
 * to a selected Sunday School class and designated curriculum course.
 * Adheres strictly to the backend Swagger schema for POST /assign-teacher-for-class:
 * { teacherId, teacherName, courseId, courseName, gradeLevel }
 */
export default function AssignTeacherModal({
  isOpen,
  onClose,
  selectedClass,
  onAssigned,
  isDarkMode = true,
  currentlyAssignedTeacherIds = [],
}) {
  const [teachers, setTeachers] = useState([]);
  const [classCourses, setClassCourses] = useState([]);
  const [catalogCourses, setCatalogCourses] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [teacherSearch, setTeacherSearch] = useState("");

  // Fetch registered teachers and course catalog when modal opens
  const loadModalData = useCallback(async () => {
    if (!selectedClass) return;
    setLoadingData(true);
    setError("");

    try {
      const [allTeachers, assignedCourses, allCourses] = await Promise.all([
        teacherService.getTeachers().catch((err) => {
          console.warn("Failed to load teachers for assignment modal:", err);
          return [];
        }),
        courseService.getCoursesByClassLevel(selectedClass.gradeLevel).catch(() => []),
        courseService.getCourses().catch(() => []),
      ]);

      const teacherList = Array.isArray(allTeachers) ? allTeachers : [];
      const assignedList = Array.isArray(assignedCourses) ? assignedCourses : [];
      const catalogList = Array.isArray(allCourses) ? allCourses : [];

      setTeachers(teacherList);
      setClassCourses(assignedList);
      setCatalogCourses(catalogList);

      // Pre-select first class course if available, or first catalog course
      if (assignedList.length > 0 && assignedList[0]?.courseId) {
        setSelectedCourseId(String(assignedList[0].courseId));
      } else if (catalogList.length > 0 && catalogList[0]?.id) {
        setSelectedCourseId(String(catalogList[0].id));
      }
    } catch (err) {
      console.error("Error loading modal data:", err);
      setError("Failed to load teachers or curriculum courses. Please try again.");
    } finally {
      setLoadingData(false);
    }
  }, [selectedClass]);

  useEffect(() => {
    if (isOpen && selectedClass) {
      const timer = setTimeout(() => {
        setSelectedTeacherId("");
        setTeacherSearch("");
        setError("");
        loadModalData();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen, selectedClass, loadModalData]);

  // Combine and deduplicate courses for selection
  const availableCourses = useMemo(() => {
    const courseMap = new Map();

    // Prioritize courses specifically assigned to this class
    classCourses.forEach((ac) => {
      const id = Number(ac.courseId || ac.id);
      if (id && !courseMap.has(id)) {
        courseMap.set(id, {
          id,
          courseName: ac.courseName,
          isClassAssigned: true,
        });
      }
    });

    // Add remaining courses from general curriculum catalog
    catalogCourses.forEach((c) => {
      const id = Number(c.id);
      if (id && !courseMap.has(id)) {
        courseMap.set(id, {
          id,
          courseName: c.courseName || c.name,
          isClassAssigned: false,
        });
      }
    });

    return Array.from(courseMap.values());
  }, [classCourses, catalogCourses]);

  // Filter teachers by search input
  const filteredTeachers = useMemo(() => {
    if (!teacherSearch.trim()) return teachers;
    const q = teacherSearch.toLowerCase().trim();
    return teachers.filter((t) => {
      const name = String(t.name || "").toLowerCase();
      const dept = String(t.department || "").toLowerCase();
      const email = String(t.email || "").toLowerCase();
      const phone = String(t.phone || "").toLowerCase();
      return name.includes(q) || dept.includes(q) || email.includes(q) || phone.includes(q);
    });
  }, [teachers, teacherSearch]);

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTeacherId) {
      setError("Please select an instructor to assign.");
      return;
    }
    if (!selectedCourseId) {
      setError("Please select a course for this instructor to teach.");
      return;
    }
    if (!selectedClass?.gradeLevel) {
      setError("Invalid class configuration.");
      return;
    }

    const teacherObj = teachers.find((t) => String(t.id) === String(selectedTeacherId));
    if (!teacherObj) {
      setError("Selected instructor was not found in the directory.");
      return;
    }

    const courseObj = availableCourses.find((c) => String(c.id) === String(selectedCourseId));
    if (!courseObj) {
      setError("Selected course was not found in the catalog.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      // Strictly follows Swagger CreateAssignTeacherForClassDto:
      // { teacherId, teacherName, courseId, courseName, gradeLevel }
      const payload = {
        teacherId: Number(teacherObj.id),
        teacherName: String(teacherObj.name).trim(),
        courseId: Number(courseObj.id),
        courseName: String(courseObj.courseName).trim(),
        gradeLevel: String(selectedClass.gradeLevel).trim(),
        section: selectedClass.section || "A",
        classId: selectedClass.id,
      };

      await teacherService.assignTeacherToClass(payload);

      toast.success(
        `Successfully assigned ${teacherObj.name} to ${selectedClass.gradeLevel} (Section ${selectedClass.section || "A"})!`
      );

      // Re-fetch class details immediately in parent dashboard
      if (onAssigned) {
        await onAssigned();
      }

      onClose();
    } catch (err) {
      console.error("Teacher assignment failed:", err);
      const msg = err.message || "Failed to assign teacher to class. Please check inputs and retry.";
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !selectedClass) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) {
          onClose();
        }
      }}
    >
      <div 
        className={`w-full max-w-xl rounded-2xl border p-6 sm:p-7 shadow-2xl transition-all relative ${
          isDarkMode 
            ? "bg-[#0b1b3d] border-white/10 text-slate-100" 
            : "bg-white border-slate-200 text-slate-900"
        }`}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-5 border-b border-inherit">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Assign Instructor to Class
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Allocate faculty to lead{" "}
                <span className="font-semibold text-amber-600 dark:text-amber-400">
                  {selectedClass.gradeLevel} (Section {selectedClass.section})
                </span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => !submitting && onClose()}
            disabled={submitting}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              isDarkMode 
                ? "border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/5" 
                : "border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Selected Class Target Context Banner */}
        <div 
          className={`mt-5 p-3.5 rounded-xl border flex items-center justify-between text-xs ${
            isDarkMode ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-200"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <School className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="text-slate-800 dark:text-slate-200 font-semibold">
              {selectedClass.gradeLevel} — Section {selectedClass.section}
            </span>
          </div>
          <span className="text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400">
            {classCourses.length} active syllabus courses
          </span>
        </div>

        {/* Error Notification Alert */}
        {error && (
          <div 
            className={`mt-4 p-3.5 rounded-xl border flex items-start gap-2.5 text-xs ${
              isDarkMode 
                ? "bg-rose-500/10 border-rose-500/30 text-rose-300" 
                : "bg-rose-50 border-rose-200 text-rose-700"
            }`}
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
            <span className="font-medium leading-relaxed">{error}</span>
          </div>
        )}

        {/* Form Body */}
        {loadingData ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
            <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
            <span>Loading registered instructors and curriculum courses...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-5">
            {/* 1. Teacher Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Select Instructor <span className="text-amber-500">*</span>
                </label>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {teachers.length} available
                </span>
              </div>

              {teachers.length === 0 ? (
                <div 
                  className={`p-4 rounded-xl border text-xs text-center space-y-2 ${
                    isDarkMode ? "bg-[#081226] border-white/10" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <p className="text-slate-600 dark:text-slate-400">
                    No registered teachers found in the directory.
                  </p>
                  <Link
                    to="/dashboard/teachers"
                    className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400 hover:underline font-semibold"
                  >
                    <span>Register instructors in Teacher Management</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Quick Teacher Filter */}
                  {teachers.length > 5 && (
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search instructors by name or department..."
                        value={teacherSearch}
                        onChange={(e) => setTeacherSearch(e.target.value)}
                        className={`w-full pl-8 pr-3 py-1.5 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-amber-500 transition ${
                          isDarkMode 
                            ? "bg-[#081226] border-white/10 text-slate-100 placeholder:text-slate-500" 
                            : "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400"
                        }`}
                      />
                    </div>
                  )}

                  <select
                    value={selectedTeacherId}
                    onChange={(e) => {
                      setSelectedTeacherId(e.target.value);
                      if (error) setError("");
                    }}
                    required
                    disabled={submitting}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition cursor-pointer font-medium ${
                      isDarkMode 
                        ? "bg-[#081226] border-white/10 text-slate-100" 
                        : "bg-white border-slate-300 text-slate-900"
                    }`}
                  >
                    <option value="">-- Choose an Instructor from Faculty --</option>
                    {filteredTeachers.map((t) => {
                      const isAlreadyAssigned = currentlyAssignedTeacherIds.some(
                        (id) => String(id) === String(t.id)
                      );
                      return (
                        <option 
                          key={t.id} 
                          value={t.id}
                        >
                          {t.name} — {t.department || "General Spiritual Education"}
                          {isAlreadyAssigned ? " [Currently Assigned]" : ""}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}
            </div>

            {/* 2. Course Allocation Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Instruction Course <span className="text-amber-500">*</span>
                </label>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {availableCourses.length} offerings
                </span>
              </div>

              {availableCourses.length === 0 ? (
                <div 
                  className={`p-4 rounded-xl border text-xs text-center space-y-2 ${
                    isDarkMode ? "bg-[#081226] border-white/10" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <p className="text-slate-600 dark:text-slate-400">
                    No curriculum courses available to assign.
                  </p>
                  <Link
                    to="/dashboard/courses"
                    className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400 hover:underline font-semibold"
                  >
                    <span>Create courses in Course Management</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              ) : (
                <div>
                  <select
                    value={selectedCourseId}
                    onChange={(e) => {
                      setSelectedCourseId(e.target.value);
                      if (error) setError("");
                    }}
                    required
                    disabled={submitting}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition cursor-pointer font-medium ${
                      isDarkMode 
                        ? "bg-[#081226] border-white/10 text-slate-100" 
                        : "bg-white border-slate-300 text-slate-900"
                    }`}
                  >
                    <option value="">-- Choose Subject to Teach --</option>
                    {availableCourses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.courseName} {c.isClassAssigned ? " [Class Active Syllabus]" : " [Catalog Subject]"}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                    Select the curriculum subject or theology course this instructor is appointed to teach for this section.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="pt-5 border-t border-inherit flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                  isDarkMode 
                    ? "bg-white/5 border-white/10 hover:bg-white/10 text-slate-300" 
                    : "bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700"
                }`}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={
                  submitting || 
                  !selectedTeacherId || 
                  !selectedCourseId || 
                  teachers.length === 0 || 
                  availableCourses.length === 0
                }
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.99]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Assigning Instructor...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Confirm Assignment</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
