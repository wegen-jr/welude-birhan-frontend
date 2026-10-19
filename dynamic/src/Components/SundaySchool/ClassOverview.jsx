import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { 
  GraduationCap, 
  Layers, 
  AlertCircle, 
  UserPlus, 
  Plus, 
  RefreshCw, 
  X, 
  Loader2, 
  Eye, 
  ArrowRight,
  School,
  Check
} from "lucide-react";
import { sundaySchoolService } from "../../services/sundaySchoolService";
import { teacherService } from "../../services/teacherService";
import SelectedClassDetails from "./SelectedClassDetails";

/**
 * ClassOverview Component
 * 
 * Interactive academic command center for Sunday School:
 * - Active Classes strictly rendered as compact summary cards
 * - "Detail" action button on each card
 * - Dynamically reveals dedicated SelectedClassDetails section only for the selected class
 * - Eliminates cluttered vertical stacking
 */
export default function ClassOverview({ 
  isDarkMode = true, 
  refreshTrigger = 0, 
  isAuthorized: propIsAuthorized 
}) {
  // Role verification for administrative actions
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  })();
  const userRole = user?.role || "";
  const isAuthorized = propIsAuthorized ?? ["ADMIN", "EDUCATION_LEADER"].includes(userRole);

  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [teacherAssignments, setTeacherAssignments] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);

  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [loadError, setLoadError] = useState(null);

  // New class modal state
  const [isCreateClassOpen, setIsCreateClassOpen] = useState(false);
  const [newGradeLevel, setNewGradeLevel] = useState("");
  const [newSection, setNewSection] = useState("");
  const [creatingClass, setCreatingClass] = useState(false);

  // Fetch classes, teachers, and teacher assignments
  const fetchInitialData = useCallback(async () => {
    setLoadingClasses(true);
    setLoadingTeachers(true);
    let classErr = null;

    try {
      const [classData, teacherData, backendAssignmentsData] = await Promise.all([
        sundaySchoolService.getClasses().catch((err) => {
          classErr = err;
          console.error("GET /class error:", err);
          return [];
        }),
        teacherService.getTeachers().catch((err) => {
          console.error("GET /teachers error:", err);
          return [];
        }),
        teacherService.getTeacherAssignments().catch((err) => {
          console.error("GET /assign-teacher-for-class error:", err);
          return [];
        }),
      ]);

      const classList = Array.isArray(classData) ? classData : [];
      const teacherList = Array.isArray(teacherData) ? teacherData : [];
      const assignmentsList = Array.isArray(backendAssignmentsData) ? backendAssignmentsData : [];

      setClasses(classList);
      setTeachers(teacherList);
      setTeacherAssignments(assignmentsList);

      if (classErr && classList.length === 0) {
        setLoadError(classErr.message || "Failed to connect to backend server.");
      } else {
        setLoadError(null);
      }

      // Preserve currently selected class if it still exists in the refreshed list
      setSelectedClass((current) => {
        if (!current) return null;
        const cGrade = current?.gradeLevel || current?.grade_level;
        const cSec = current?.section;
        const match = classList.find(
          (c) => (c.id && c.id === current.id) || 
                 ((c.gradeLevel || c.grade_level) === cGrade && c.section === cSec)
        );
        return match || null;
      });
    } catch (error) {
      console.error("Failed to load classes or teachers:", error);
      setLoadError(error.message || "Failed to load active classes.");
      toast.error("Failed to load active classes.");
    } finally {
      setLoadingClasses(false);
      setLoadingTeachers(false);
    }
  }, []);

  const handleCreateClassSubmit = async (e) => {
    e.preventDefault();
    if (!newGradeLevel.trim() || !newSection.trim()) {
      toast.error("Please enter both Grade Level and Section.");
      return;
    }

    setCreatingClass(true);
    try {
      const created = await sundaySchoolService.createClass({
        gradeLevel: newGradeLevel.trim(),
        section: newSection.trim(),
      });

      toast.success(`Class ${newGradeLevel} - Section ${newSection} created!`);
      setNewGradeLevel("");
      setNewSection("");
      setIsCreateClassOpen(false);

      await fetchInitialData();
      if (created) {
        setSelectedClass(created);
      }
    } catch (err) {
      toast.error(err.message || "Failed to create class.");
    } finally {
      setCreatingClass(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInitialData();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchInitialData, refreshTrigger]);

  // Click-to-reveal toggle for compact class cards
  const handleToggleDetail = (cls) => {
    if (!cls) return;
    if (
      selectedClass &&
      ((selectedClass.id && cls.id && selectedClass.id === cls.id) ||
        (selectedClass.gradeLevel === cls.gradeLevel && selectedClass.section === cls.section))
    ) {
      // Toggle closed if user clicks the already selected card's detail button
      setSelectedClass(null);
    } else {
      setSelectedClass(cls);
      setTimeout(() => {
        const el = document.getElementById("class-detail-reveal-view");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 50);
    }
  };

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* ------------------------------------------------------------- */}
      {/* Active Classes Interactive Compact Cards Section              */}
      {/* ------------------------------------------------------------- */}
      <div>
        {/* Backend Connection Error Notice Banner */}
        {loadError && (
          <div className={`mb-6 p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
            isDarkMode ? "bg-amber-500/10 border-amber-500/30 text-amber-300" : "bg-amber-50 border-amber-200 text-amber-900"
          }`}>
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs sm:text-sm font-semibold">
                  Backend Database Connection Notice
                </p>
                <p className="text-xs opacity-90 mt-0.5">
                  {loadError}. If the backend server on Render was idle, it may take 30–50 seconds to wake up (cold-start). Please retry in a moment.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={fetchInitialData}
              disabled={loadingClasses}
              className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition shadow cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingClasses ? "animate-spin" : ""}`} />
              <span>Retry Connection</span>
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                <Layers className="w-4 h-4" />
              </div>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-slate-900 dark:text-slate-100">
                Active Classes Directory
              </h2>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                isDarkMode 
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20" 
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}>
                {classes.length} Classes
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Select any class card and click <span className="font-semibold text-amber-500">"Detail"</span> to reveal its enrolled roster, assigned courses, and instructors
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isAuthorized && (
              <button
                type="button"
                onClick={() => setIsCreateClassOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-md active:scale-[0.99] cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Class</span>
              </button>
            )}

            <button
              type="button"
              onClick={fetchInitialData}
              disabled={loadingClasses || loadingTeachers}
              className={`self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                isDarkMode 
                  ? "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10" 
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingClasses || loadingTeachers ? "animate-spin text-amber-500" : ""}`} />
              <span>Refresh Classes</span>
            </button>
          </div>
        </div>

        {/* Classes Cards Carousel / Grid: Rendered strictly as COMPACT summary cards */}
        {loadingClasses && classes.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div 
                key={i} 
                className={`h-32 rounded-2xl border ${
                  isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-100 border-slate-200"
                }`} 
              />
            ))}
          </div>
        ) : classes.length === 0 ? (
          <div className={`p-8 sm:p-10 rounded-2xl border text-center ${
            isDarkMode ? "bg-white/5 border-white/10 text-slate-400" : "bg-white border-slate-200 text-slate-600 shadow-sm"
          }`}>
            <GraduationCap className="w-10 h-10 mx-auto text-slate-400 mb-3" />
            <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {loadError ? "Could not connect to database" : "No active classes found in the database"}
            </p>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 mb-5">
              {loadError 
                ? "The backend database may be temporarily waking up or synchronizing. Click 'Retry Connection' below."
                : "Create your first Sunday School class to configure grade levels, assign teachers, and enroll students."}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {loadError ? (
                <button
                  type="button"
                  onClick={fetchInitialData}
                  disabled={loadingClasses}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-md cursor-pointer active:scale-[0.99]"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingClasses ? "animate-spin" : ""}`} />
                  <span>Retry Connection</span>
                </button>
              ) : (
                <>
                  {isAuthorized && (
                    <button
                      type="button"
                      onClick={() => setIsCreateClassOpen(true)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-md cursor-pointer active:scale-[0.99]"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Create First Class</span>
                    </button>
                  )}
                  <Link
                    to="/dashboard/student-enrollment"
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                      isDarkMode 
                        ? "bg-white/5 border-white/10 text-slate-200 hover:bg-white/10" 
                        : "bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200"
                    }`}
                  >
                    <UserPlus className="w-4 h-4 text-amber-500" />
                    <span>Go to Student Enrollment</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {classes.map((cls) => {
              const isSelected = Boolean(
                selectedClass && (
                  (selectedClass.id && cls.id && selectedClass.id === cls.id) ||
                  (selectedClass.gradeLevel === cls.gradeLevel && selectedClass.section === cls.section)
                )
              );

              // Count teachers assigned to this specific class card
              const classTeachersCount = teachers.filter((t) => {
                const targetGrade = String(cls.gradeLevel || "").trim().toLowerCase();
                const targetSection = String(cls.section || "").trim().toLowerCase();
                const targetId = cls.id ? String(cls.id) : null;

                // Backend assignments match
                const baMatch = teacherAssignments.some((ba) => {
                  const baTeacherId = String(ba.teacherId || ba.teacher_id || "");
                  const baGrade = String(ba.gradeLevel || ba.grade_level || "").trim().toLowerCase();
                  return baTeacherId === String(t.id) && (baGrade === targetGrade || baGrade.includes(targetGrade));
                });
                if (baMatch) return true;

                // Local assignments match
                return t.assignedClasses?.some((ac) => 
                  (ac.id && targetId && String(ac.id) === targetId) ||
                  (ac.classId && targetId && String(ac.classId) === targetId) ||
                  (ac.gradeLevel && String(ac.gradeLevel).toLowerCase() === targetGrade &&
                   (!ac.section || !targetSection || String(ac.section).toLowerCase() === targetSection))
                );
              }).length;

              return (
                <div
                  key={cls.id || `${cls.gradeLevel}-${cls.section}`}
                  onClick={() => handleToggleDetail(cls)}
                  className={`group relative text-left p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? (isDarkMode 
                          ? "bg-amber-500/10 border-amber-500 shadow-lg shadow-amber-500/10 ring-2 ring-amber-500/40" 
                          : "bg-amber-50/90 border-amber-500 shadow-md ring-2 ring-amber-500/30")
                      : (isDarkMode 
                          ? "bg-[#0b1b3d]/60 border-white/10 hover:border-amber-500/40 hover:bg-white/5" 
                          : "bg-white border-slate-200 hover:border-amber-300 hover:bg-slate-50 shadow-sm")
                  }`}
                >
                  <div>
                    {/* Top Header: Grade Icon & Section Pill */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors shrink-0 ${
                        isSelected 
                          ? "bg-amber-500 text-slate-950 font-bold" 
                          : (isDarkMode ? "bg-white/5 text-amber-400" : "bg-slate-100 text-slate-700")
                      }`}>
                        <GraduationCap className="w-4 h-4" />
                      </div>

                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        isSelected
                          ? "bg-amber-500 text-slate-950 border-amber-500 font-bold"
                          : (isDarkMode ? "bg-white/5 border-white/10 text-slate-400" : "bg-slate-100 border-slate-200 text-slate-600")
                      }`}>
                        Sec {cls.section || "A"}
                      </span>
                    </div>

                    {/* Grade Level Title */}
                    <h3 className={`font-bold text-sm sm:text-base tracking-tight truncate ${
                      isSelected 
                        ? "text-amber-500 font-extrabold" 
                        : "text-slate-900 dark:text-slate-100 group-hover:text-amber-400 transition-colors"
                    }`}>
                      {cls.gradeLevel}
                    </h3>

                    {/* Teacher count pill */}
                    <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                      {classTeachersCount > 0 ? (
                        <span className="text-sky-400 font-medium">
                          {classTeachersCount} {classTeachersCount === 1 ? "Instructor" : "Instructors"}
                        </span>
                      ) : (
                        <span className="text-slate-500 italic">No instructor</span>
                      )}
                    </div>
                  </div>

                  {/* Distinct "Detail" Link / Button */}
                  <div className="mt-4 pt-3 border-t border-inherit flex items-center justify-between">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleDetail(cls);
                      }}
                      className={`w-full py-1.5 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? "bg-amber-500 text-slate-950 shadow-sm"
                          : (isDarkMode 
                              ? "bg-white/5 hover:bg-amber-500/20 text-slate-300 hover:text-amber-400 border border-white/10" 
                              : "bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-800 border border-slate-200")
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Close Detail</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5 text-amber-500" />
                          <span>Detail</span>
                          <ArrowRight className="w-3 h-3 opacity-60 group-hover:translate-x-0.5 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Click-to-Reveal: Dedicated Selected Class Details Section      */}
      {/* ------------------------------------------------------------- */}
      {selectedClass ? (
        <div id="class-detail-reveal-view" className="animate-fadeIn transition-all">
          <SelectedClassDetails
            selectedClass={selectedClass}
            isDarkMode={isDarkMode}
            isAuthorized={isAuthorized}
            onClose={() => setSelectedClass(null)}
            allTeachers={teachers}
            teacherAssignments={teacherAssignments}
            onRefreshParent={fetchInitialData}
          />
        </div>
      ) : (
        /* Empty / Hint prompt when no class card has been clicked for detail */
        <div className={`p-8 sm:p-10 rounded-2xl border text-center transition-all ${
          isDarkMode 
            ? "bg-[#0b1b3d]/30 border-white/5 text-slate-400" 
            : "bg-slate-50/70 border-slate-200 text-slate-600 shadow-sm"
        }`}>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-3">
            <School className="w-6 h-6" />
          </div>
          <h3 className="text-base font-serif font-bold text-slate-900 dark:text-slate-100">
            Select a Class to Reveal Dedicated Details
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto mt-1">
            Click the <span className="font-semibold text-amber-500">"Detail"</span> button on any active class card above to inspect its verified student roster, curriculum course assignments, and classroom instructors without vertical clutter.
          </p>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: Create New Class                                       */}
      {/* ------------------------------------------------------------- */}
      {isCreateClassOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl transition-all ${
            isDarkMode 
              ? "bg-[#0b1b3d] border-white/10 text-slate-100" 
              : "bg-white border-slate-200 text-slate-900"
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-inherit">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold tracking-tight text-slate-900 dark:text-slate-100">
                    Create Sunday School Class
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    Define a grade level and section in the database
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => !creatingClass && setIsCreateClassOpen(false)}
                disabled={creatingClass}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  isDarkMode 
                    ? "border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/5" 
                    : "border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateClassSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Grade Level <span className="text-amber-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Grade 1 or Grade 10"
                  value={newGradeLevel}
                  onChange={(e) => setNewGradeLevel(e.target.value)}
                  required
                  disabled={creatingClass}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition font-medium ${
                    isDarkMode 
                      ? "bg-[#081226] border-white/10 text-slate-100 placeholder:text-slate-500" 
                      : "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400"
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Section <span className="text-amber-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. A or B"
                  value={newSection}
                  onChange={(e) => setNewSection(e.target.value)}
                  required
                  disabled={creatingClass}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition font-medium ${
                    isDarkMode 
                      ? "bg-[#081226] border-white/10 text-slate-100 placeholder:text-slate-500" 
                      : "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400"
                  }`}
                />
              </div>

              <div className="pt-4 border-t border-inherit flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateClassOpen(false)}
                  disabled={creatingClass}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                    isDarkMode 
                      ? "bg-white/5 border-white/10 hover:bg-white/10 text-slate-300" 
                      : "bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creatingClass || !newGradeLevel.trim() || !newSection.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow disabled:opacity-50 cursor-pointer"
                >
                  {creatingClass ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Save & Create Class</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
