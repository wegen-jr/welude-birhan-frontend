import { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  BookOpen,
  Plus,
  Trash2,
  Search,
  RefreshCw,
  Loader2,
  Clock,
  AlertCircle,
  X,
  Check,
  ExternalLink,
  School
} from "lucide-react";
import { courseService } from "../../services/educationhub/courseService";

/**
 * ClassCourseManager Component
 * 
 * Manages curriculum course assignments for a selected class/grade.
 * Provides a responsive dark-theme panel, live real-data fetching,
 * an interactive modal to assign courses from the curriculum catalog,
 * and immediate dynamic refresh upon assignment/unassignment.
 */
export default function ClassCourseManager({
  selectedClass,
  isDarkMode = true,
  isAuthorized = true,
  onAssignmentChange,
}) {
  const [assignedList, setAssignedList] = useState([]);
  const [catalogCourses, setCatalogCourses] = useState([]);
  const [loadingAssigned, setLoadingAssigned] = useState(false);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");
  const [unassigningId, setUnassigningId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Load catalog courses once or when modal opens
  const fetchCatalogCourses = useCallback(async () => {
    setLoadingCatalog(true);
    try {
      const courses = await courseService.getCourses();
      setCatalogCourses(Array.isArray(courses) ? courses : []);
    } catch (err) {
      console.error("Failed to fetch curriculum catalog:", err);
      toast.error("Failed to load curriculum course catalog.");
    } finally {
      setLoadingCatalog(false);
    }
  }, []);

  // Fetch all assignments and catalog
  const loadClassCourses = useCallback(async () => {
    if (!selectedClass) return;
    setLoadingAssigned(true);
    try {
      const [assignments, catalog] = await Promise.all([
        courseService.getClassCourseAssignments().catch((err) => {
          console.warn("Could not fetch course assignments:", err);
          return [];
        }),
        catalogCourses.length > 0
          ? Promise.resolve(catalogCourses)
          : courseService.getCourses().catch(() => []),
      ]);

      if (catalog && catalog.length > 0) {
        setCatalogCourses(catalog);
      }

      setAssignedList(Array.isArray(assignments) ? assignments : []);
    } catch (err) {
      console.error("Error loading assigned courses:", err);
      toast.error("Failed to load assigned courses for this class.");
      setAssignedList([]);
    } finally {
      setLoadingAssigned(false);
    }
  }, [selectedClass, catalogCourses]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadClassCourses();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadClassCourses]);

  // Filter assignments matching the currently selected class
  const classAssignments = useMemo(() => {
    if (!selectedClass || !Array.isArray(assignedList)) return [];

    const targetGrade = String(selectedClass.gradeLevel || "").trim().toLowerCase();
    const targetSection = String(selectedClass.section || "").trim().toLowerCase();
    const targetCompound = `${targetGrade} - section ${targetSection}`.toLowerCase();
    const targetClassId = selectedClass.id ? String(selectedClass.id) : null;

    return assignedList
      .filter((assignment) => {
        if (!assignment) return false;

        const assignLevel = String(assignment.classLevel || assignment.gradeLevel || "").trim().toLowerCase();
        const assignClassId = assignment.classId || assignment.class_id ? String(assignment.classId || assignment.class_id) : null;

        // Match by class ID if available
        if (targetClassId && assignClassId && targetClassId === assignClassId) {
          return true;
        }

        // Match by gradeLevel (e.g. "Grade 10" === "Grade 10")
        if (assignLevel && assignLevel === targetGrade) {
          return true;
        }

        // Match by compound string if assignment stored grade & section
        if (assignLevel && (assignLevel === targetCompound || assignLevel.startsWith(targetGrade))) {
          return true;
        }

        return false;
      })
      .map((assignment) => {
        // Enrich with course catalog metadata (e.g. creditHours)
        const matchedCourse = catalogCourses.find(
          (c) => Number(c.id) === Number(assignment.courseId) ||
            (c.courseName && assignment.courseName && c.courseName.toLowerCase() === assignment.courseName.toLowerCase())
        );

        return {
          ...assignment,
          creditHours: matchedCourse?.creditHours ?? matchedCourse?.craditHours ?? assignment.creditHours ?? null,
          courseName: assignment.courseName || matchedCourse?.courseName || "Unnamed Course",
        };
      });
  }, [assignedList, catalogCourses, selectedClass]);

  // Filter assigned courses by search query
  const filteredAssignments = useMemo(() => {
    if (!searchQuery.trim()) return classAssignments;
    const q = searchQuery.toLowerCase().trim();
    return classAssignments.filter((item) => {
      const name = String(item.courseName || "").toLowerCase();
      const id = String(item.courseId || item.id || "").toLowerCase();
      const level = String(item.classLevel || "").toLowerCase();
      return name.includes(q) || id.includes(q) || level.includes(q);
    });
  }, [classAssignments, searchQuery]);

  // Courses already assigned to this class
  const assignedCourseIds = useMemo(() => {
    return new Set(
      classAssignments.map((a) => Number(a.courseId)).filter(Boolean)
    );
  }, [classAssignments]);

  // Handle open modal
  const handleOpenModal = () => {
    setSelectedCourseId("");
    setModalError("");
    setIsModalOpen(true);
    if (catalogCourses.length === 0) {
      fetchCatalogCourses();
    }
  };

  // Submit course assignment
  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCourseId) {
      setModalError("Please select a course to assign.");
      return;
    }

    const courseToAssign = catalogCourses.find(
      (c) => String(c.id) === String(selectedCourseId)
    );

    if (!courseToAssign) {
      setModalError("Selected course could not be found in curriculum catalog.");
      return;
    }

    if (assignedCourseIds.has(Number(courseToAssign.id))) {
      setModalError(`"${courseToAssign.courseName}" is already assigned to ${selectedClass.gradeLevel}.`);
      return;
    }

    setIsSubmitting(true);
    setModalError("");

    try {
      // Strictly adheres to Swagger CreateAssignCourseForClassDto:
      // { courseId: number, courseName: string, classLevel: string }
      const payload = {
        courseId: Number(courseToAssign.id),
        courseName: String(courseToAssign.courseName).trim(),
        classLevel: String(selectedClass.gradeLevel).trim(),
      };

      const newAssignment = await courseService.assignCourseToClass(payload);

      toast.success(
        `Successfully assigned "${courseToAssign.courseName}" to ${selectedClass.gradeLevel}!`
      );

      // Dynamically add to state immediately
      setAssignedList((prev) => [newAssignment, ...prev]);

      if (onAssignmentChange) {
        onAssignmentChange();
      }

      setIsModalOpen(false);
      setSelectedCourseId("");

      // Trigger background sync to ensure latest state from backend
      loadClassCourses();
    } catch (err) {
      console.error("Course assignment failed:", err);
      const msg = err.message || "Failed to assign course to class. Please try again.";
      setModalError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Unassign course handler
  const handleUnassignCourse = async (assignment) => {
    if (!isAuthorized) {
      toast.error("Unauthorized: Only administrators can unassign courses.");
      return;
    }

    const confirmMsg = `Are you sure you want to unassign "${assignment.courseName}" from ${selectedClass.gradeLevel}?`;
    if (!window.confirm(confirmMsg)) return;

    setUnassigningId(assignment.id);
    try {
      await courseService.unassignCourseFromClass(assignment.id);
      toast.info(`Removed "${assignment.courseName}" from ${selectedClass.gradeLevel}.`);

      // Optimistic update
      setAssignedList((prev) => prev.filter((a) => a.id !== assignment.id));

      if (onAssignmentChange) {
        onAssignmentChange();
      }
    } catch (err) {
      console.error("Failed to unassign course:", err);
      toast.error(err.message || "Failed to remove course assignment.");
      loadClassCourses();
    } finally {
      setUnassigningId(null);
    }
  };

  return (
    <>
      <div
        className={`rounded-2xl border p-6 sm:p-7 transition-all shadow-sm ${isDarkMode
            ? "bg-[#0b1b3d]/60 border-white/10 text-slate-100"
            : "bg-white border-slate-200 text-slate-900"
          }`}
      >
        {/* Panel Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-inherit mb-6">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-base sm:text-lg font-serif font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  Assigned Course(s)
                </h3>
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${classAssignments.length > 0
                      ? (isDarkMode
                        ? "bg-purple-500/10 border-purple-500/20 text-purple-400"
                        : "bg-purple-50 border-purple-200 text-purple-700")
                      : (isDarkMode
                        ? "bg-slate-500/10 border-slate-500/20 text-slate-400"
                        : "bg-slate-100 border-slate-200 text-slate-600")
                    }`}
                >
                  {classAssignments.length} {classAssignments.length === 1 ? "Course" : "Courses"}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                Curriculum courses allocated to{" "}
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {selectedClass.gradeLevel} (Section {selectedClass.section})
                </span>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={loadClassCourses}
              disabled={loadingAssigned}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${isDarkMode
                  ? "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
                }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingAssigned ? "animate-spin text-amber-500" : ""}`} />
              <span>Refresh</span>
            </button>

            {isAuthorized && (
              <button
                type="button"
                onClick={handleOpenModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-md active:scale-[0.99] cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Assign Course</span>
              </button>
            )}
          </div>
        </div>

        {/* Content Body: Loading / Empty / Data Table */}
        {loadingAssigned ? (
          <div className="py-8 flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
            <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
            <span>Loading assigned curriculum courses...</span>
          </div>
        ) : classAssignments.length === 0 ? (
          /* Clean Empty State */
          <div
            className={`p-6 sm:p-8 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 ${isDarkMode ? "bg-white/[0.02] border-white/5" : "bg-slate-50 border-slate-200"
              }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  No courses assigned to this class yet.
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Establish the academic syllabus for {selectedClass.gradeLevel} (Section {selectedClass.section}) by assigning courses from the curriculum catalog.
                </p>
              </div>
            </div>

            {isAuthorized && (
              <button
                type="button"
                onClick={handleOpenModal}
                className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-md active:scale-[0.99] cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Assign Course</span>
              </button>
            )}
          </div>
        ) : (
          /* Populated State with Roster-Matched Table */
          <div className="space-y-4">
            {/* Search Filter for Assigned Courses */}
            {classAssignments.length > 3 && (
              <div className="relative max-w-sm mb-3">
                <Search className="w-3.5 h-3.5 absolute left-3.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter courses assigned to this class..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-amber-500/50 ${isDarkMode
                      ? "bg-white/5 border-white/10 text-slate-100 placeholder:text-slate-500"
                      : "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400"
                    }`}
                />
              </div>
            )}

            <div className="overflow-x-auto rounded-xl border border-inherit">
              <table className="w-full text-left text-xs border-collapse">
                <thead
                  className={`text-[11px] font-semibold uppercase tracking-wider border-b ${isDarkMode
                      ? "bg-white/[0.02] border-white/10 text-slate-400"
                      : "bg-slate-100/80 border-slate-200 text-slate-600"
                    }`}
                >
                  <tr>
                    <th className="py-4 px-6 font-semibold">Course ID</th>
                    <th className="py-4 px-6 font-semibold">Course Title</th>
                    <th className="py-4 px-6 font-semibold">Target Class</th>
                    <th className="py-4 px-6 font-semibold">Credit Hours</th>
                    <th className="py-4 px-6 font-semibold">Curriculum Status</th>
                    <th className="py-4 px-6 font-semibold">Assigned On</th>
                    {isAuthorized && (
                      <th className="py-4 px-6 text-right font-semibold">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-inherit">
                  {filteredAssignments.length === 0 ? (
                    <tr>
                      <td colSpan={isAuthorized ? 7 : 6} className="py-8 text-center text-slate-500 dark:text-slate-400">
                        No courses match your filter.
                      </td>
                    </tr>
                  ) : (
                    filteredAssignments.map((assignment) => (
                      <tr
                        key={assignment.id || `${assignment.courseId}-${assignment.classLevel}`}
                        className={`transition-colors ${isDarkMode ? "hover:bg-white/[0.02]" : "hover:bg-slate-50/80"
                          }`}
                      >
                        {/* Course ID */}
                        <td className="py-4 px-6 font-mono font-semibold">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold border ${isDarkMode
                              ? "text-purple-400 bg-purple-500/10 border-purple-500/20"
                              : "text-purple-700 bg-purple-50 border-purple-200"
                            }`}>
                            #{assignment.courseId || assignment.id}
                          </span>
                        </td>

                        {/* Course Title */}
                        <td className="py-4 px-6 font-semibold text-slate-900 dark:text-slate-100">
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-amber-500 shrink-0" />
                            <span>{assignment.courseName}</span>
                          </div>
                        </td>

                        {/* Target Class */}
                        <td className="py-4 px-6">
                          <span className="text-slate-700 dark:text-slate-300 font-medium">
                            {assignment.classLevel || selectedClass.gradeLevel}
                          </span>
                        </td>

                        {/* Credit Hours */}
                        <td className="py-4 px-6 font-mono text-slate-700 dark:text-slate-300">
                          {assignment.creditHours !== null ? (
                            <span className="inline-flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>{assignment.creditHours} hrs</span>
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-4 px-6">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${isDarkMode
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                            }`}>
                            ACTIVE SYLLABUS
                          </span>
                        </td>

                        {/* Assigned Date */}
                        <td className="py-4 px-6 text-slate-600 dark:text-slate-400 text-xs">
                          {assignment.createdAt
                            ? new Date(assignment.createdAt).toLocaleDateString()
                            : new Date().toLocaleDateString()}
                        </td>

                        {/* Actions */}
                        {isAuthorized && (
                          <td className="py-4 px-6 text-right">
                            <button
                              type="button"
                              onClick={() => handleUnassignCourse(assignment)}
                              disabled={unassigningId === assignment.id}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition border border-transparent hover:border-rose-200 dark:hover:border-rose-500/20 text-xs font-medium cursor-pointer disabled:opacity-50"
                              title="Unassign course from class"
                            >
                              {unassigningId === assignment.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                              <span>Remove</span>
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>


      {/* Course Assignment Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isSubmitting) {
              setIsModalOpen(false);
            }
          }}
        >
          <div
            className={`w-full max-w-lg rounded-2xl border p-6 shadow-2xl transition-all relative ${isDarkMode
                ? "bg-[#0b1b3d] border-white/10 text-slate-100"
                : "bg-white border-slate-200 text-slate-800"
              }`}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-inherit">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold tracking-tight">
                    Assign Course to Classroom
                  </h3>
                  <p className="text-xs text-slate-400">
                    Allocating curriculum course to{" "}
                    <span className="font-semibold text-amber-500">
                      {selectedClass.gradeLevel} (Section {selectedClass.section})
                    </span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => !isSubmitting && setIsModalOpen(false)}
                disabled={isSubmitting}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${isDarkMode
                    ? "border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/5"
                    : "border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                  }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Target Class Pill */}
            <div
              className={`mt-4 p-3 rounded-xl border flex items-center justify-between text-xs ${isDarkMode ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-200"
                }`}
            >
              <div className="flex items-center gap-2">
                <School className="w-4 h-4 text-amber-500" />
                <span className="text-slate-300 font-semibold">
                  {selectedClass.gradeLevel} — Section {selectedClass.section}
                </span>
              </div>
              <span className="text-[11px] font-mono font-medium text-slate-400">
                {classAssignments.length} Courses currently assigned
              </span>
            </div>

            {/* Error Notification */}
            {modalError && (
              <div
                className={`mt-4 p-3 rounded-xl border flex items-start gap-2 text-xs ${isDarkMode
                    ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                    : "bg-rose-50 border-rose-200 text-rose-700"
                  }`}
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{modalError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleAssignSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Select Curriculum Course <span className="text-amber-500">*</span>
                </label>

                {loadingCatalog ? (
                  <div className="flex items-center gap-2 text-xs text-slate-400 py-3">
                    <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                    <span>Loading available curriculum courses...</span>
                  </div>
                ) : catalogCourses.length === 0 ? (
                  <div
                    className={`p-4 rounded-xl border text-xs text-center space-y-2 ${isDarkMode ? "bg-[#081226] border-white/10" : "bg-slate-50 border-slate-200"
                      }`}
                  >
                    <p className="text-slate-400">No courses found in the curriculum catalog.</p>
                    <Link
                      to="/dashboard/courses"
                      className="inline-flex items-center gap-1.5 text-amber-400 hover:underline font-semibold"
                    >
                      <span>Create courses in Course Management</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                ) : (
                  <div className="relative">
                    <select
                      value={selectedCourseId}
                      onChange={(e) => {
                        setSelectedCourseId(e.target.value);
                        if (modalError) setModalError("");
                      }}
                      required
                      disabled={isSubmitting}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition cursor-pointer ${isDarkMode
                          ? "bg-[#081226] border-white/10 text-slate-100"
                          : "bg-slate-50 border-slate-200 text-slate-800"
                        }`}
                    >
                      <option value="">-- Choose a Course from Curriculum --</option>
                      {catalogCourses.map((course) => {
                        const isAlreadyAssigned = assignedCourseIds.has(Number(course.id));
                        return (
                          <option
                            key={course.id}
                            value={course.id}
                            disabled={isAlreadyAssigned}
                          >
                            {course.courseName} ({course.creditHours || course.craditHours || 0} Credits)
                            {isAlreadyAssigned ? " — [Already Assigned]" : ""}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Select an approved course from the academic catalog to register it in this classroom's active syllabus.
                </p>
              </div>

              {/* Modal Footer Controls */}
              <div className="pt-4 border-t border-inherit flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${isDarkMode
                      ? "bg-white/5 border-white/10 hover:bg-white/10 text-slate-300"
                      : "bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700"
                    }`}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || !selectedCourseId || catalogCourses.length === 0}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Assigning Course...</span>
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
          </div>
        </div>
      )}
    </>
  );
}
