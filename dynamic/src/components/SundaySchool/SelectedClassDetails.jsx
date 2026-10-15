import { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { 
  X, 
  Users, 
  BookOpen, 
  GraduationCap, 
  Search, 
  RefreshCw, 
  Plus, 
  Trash2, 
  Phone, 
  Mail, 
  Check, 
  Copy, 
  AlertCircle, 
  UserPlus, 
  Clock, 
  Building2, 
  UserCheck, 
  Layers,
  FileDown,
  Loader2
} from "lucide-react";
import { sundaySchoolService } from "../../services/sundaySchoolService";
import { courseService } from "../../services/courseService";
import { teacherService } from "../../services/teacherService";
import AssignTeacherModal from "./AssignTeacherModal";
import { triggerCsvDownload } from "../../utils/csvExport";

/**
 * SelectedClassDetails Component
 * 
 * Modular detail view rendered dynamically when a class summary card is clicked.
 * Displays three distinct, cleanly formatted data tables:
 * 1. Class Roster: Verified enrolled students
 * 2. Course Assignment: Curriculum courses allocated to this class
 * 3. Assigned Teachers: Faculty instructors managing this class
 */
export default function SelectedClassDetails({
  selectedClass,
  isDarkMode = true,
  isAuthorized = true,
  onClose,
  allTeachers = [],
  teacherAssignments = [],
  onRefreshParent,
}) {
  // Navigation Tabs for the 3 tables: 'ALL', 'ROSTER', 'COURSES', 'TEACHERS'
  const [activeTab, setActiveTab] = useState("ALL");

  // 1. Roster State
  const [roster, setRoster] = useState([]);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [rosterSearch, setRosterSearch] = useState("");

  // 2. Course Assignments State
  const [classCourses, setClassCourses] = useState([]);
  const [catalogCourses, setCatalogCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [courseSearch, setCourseSearch] = useState("");
  const [isAssignCourseOpen, setIsAssignCourseOpen] = useState(false);
  const [selectedCourseToAssign, setSelectedCourseToAssign] = useState("");
  const [isAssigningCourse, setIsAssigningCourse] = useState(false);
  const [unassigningCourseId, setUnassigningCourseId] = useState(null);

  // 3. Teachers State
  const [fetchedTeachers, setFetchedTeachers] = useState([]);
  const [fetchedAssignments, setFetchedAssignments] = useState([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [teacherSearch, setTeacherSearch] = useState("");
  const [isAssignTeacherOpen, setIsAssignTeacherOpen] = useState(false);
  const [unassigningTeacherId, setUnassigningTeacherId] = useState(null);

  // Clipboard copy tracker
  const [copiedKey, setCopiedKey] = useState(null);

  // Derive active teachers and assignments from fetched state or parent props
  const teachers = useMemo(() => {
    if (fetchedTeachers.length > 0) return fetchedTeachers;
    return allTeachers || [];
  }, [fetchedTeachers, allTeachers]);

  const assignments = useMemo(() => {
    if (fetchedAssignments.length > 0) return fetchedAssignments;
    return teacherAssignments || [];
  }, [fetchedAssignments, teacherAssignments]);

  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(String(text));
    setCopiedKey(key);
    toast.info(`Copied "${text}" to clipboard.`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // -------------------------------------------------------------
  // Data Fetching: 1. Roster
  // -------------------------------------------------------------
  const fetchRoster = useCallback(async () => {
    if (!selectedClass?.gradeLevel) return;
    setLoadingRoster(true);
    try {
      const data = await sundaySchoolService.getClassRoster(
        selectedClass.gradeLevel,
        selectedClass.section
      );
      setRoster(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn("Failed to fetch class roster:", err);
      toast.error(`Could not load roster for ${selectedClass.gradeLevel}`);
      setRoster([]);
    } finally {
      setLoadingRoster(false);
    }
  }, [selectedClass]);

  // -------------------------------------------------------------
  // Data Fetching: 2. Course Assignments & Catalog
  // -------------------------------------------------------------
  const fetchCourseData = useCallback(async () => {
    if (!selectedClass) return;
    setLoadingCourses(true);
    try {
      const [assignments, catalog] = await Promise.all([
        courseService.getClassCourseAssignments().catch((err) => {
          console.warn("GET /assign-course-for-class warning:", err);
          return [];
        }),
        courseService.getCourses().catch((err) => {
          console.warn("GET /cources warning:", err);
          return [];
        }),
      ]);

      const assignmentList = Array.isArray(assignments) ? assignments : [];
      const catalogList = Array.isArray(catalog) ? catalog : [];
      setCatalogCourses(catalogList);

      const targetGrade = String(selectedClass.gradeLevel || "").trim().toLowerCase();
      const targetSection = String(selectedClass.section || "").trim().toLowerCase();
      const targetId = selectedClass.id ? String(selectedClass.id) : null;

      const filtered = assignmentList.filter((a) => {
        const aGrade = String(a.classLevel || a.gradeLevel || "").trim().toLowerCase();
        if (targetId && (String(a.classId) === targetId || String(a.id) === targetId)) return true;
        if (aGrade === targetGrade) return true;
        if (aGrade.includes(targetGrade) || targetGrade.includes(aGrade)) {
          if (!targetSection || !a.section || String(a.section).toLowerCase() === targetSection) {
            return true;
          }
        }
        return false;
      });

      setClassCourses(filtered);
    } catch (err) {
      console.error("Failed to load class courses:", err);
      toast.error("Failed to load assigned curriculum courses.");
      setClassCourses([]);
    } finally {
      setLoadingCourses(false);
    }
  }, [selectedClass]);

  // -------------------------------------------------------------
  // Data Fetching: 3. Teachers & Teacher Assignments
  // -------------------------------------------------------------
  const fetchTeacherData = useCallback(async () => {
    setLoadingTeachers(true);
    try {
      const [tData, aData] = await Promise.all([
        teacherService.getTeachers().catch(() => []),
        teacherService.getTeacherAssignments().catch(() => []),
      ]);
      setFetchedTeachers(Array.isArray(tData) ? tData : []);
      setFetchedAssignments(Array.isArray(aData) ? aData : []);
    } catch (err) {
      console.warn("Failed to refresh teacher data:", err);
    } finally {
      setLoadingTeachers(false);
    }
  }, []);

  // Run initial fetches on class change
  useEffect(() => {
    if (!selectedClass) return;
    const timer = setTimeout(() => {
      fetchRoster();
      fetchCourseData();
      fetchTeacherData();
    }, 0);
    return () => clearTimeout(timer);
  }, [selectedClass, fetchRoster, fetchCourseData, fetchTeacherData]);

  // -------------------------------------------------------------
  // Filtered Roster
  // -------------------------------------------------------------
  const filteredRoster = useMemo(() => {
    const q = rosterSearch.toLowerCase().trim();
    if (!q) return roster;
    return roster.filter((student) => {
      const name = String(student.fullname || student.name || "").toLowerCase();
      const sId = String(student.studentId || student.id || "").toLowerCase();
      const st = String(student.status || "").toLowerCase();
      return name.includes(q) || sId.includes(q) || st.includes(q);
    });
  }, [roster, rosterSearch]);

  // -------------------------------------------------------------
  // Filtered Courses
  // -------------------------------------------------------------
  const filteredCourses = useMemo(() => {
    const q = courseSearch.toLowerCase().trim();
    if (!q) return classCourses;
    return classCourses.filter((course) => {
      const name = String(course.courseName || "").toLowerCase();
      const cId = String(course.courseId || course.id || "").toLowerCase();
      return name.includes(q) || cId.includes(q);
    });
  }, [classCourses, courseSearch]);

  // -------------------------------------------------------------
  // Assigned Teachers for this Class
  // -------------------------------------------------------------
  const assignedTeachers = useMemo(() => {
    if (!selectedClass || !Array.isArray(teachers)) return [];
    const targetGrade = String(selectedClass.gradeLevel || "").trim().toLowerCase();
    const targetSection = String(selectedClass.section || "").trim().toLowerCase();
    const targetId = selectedClass.id ? String(selectedClass.id) : null;

    return teachers.filter((teacher) => {
      const teacherId = String(teacher.id);

      // Check backend assignments
      const hasBackendMatch = assignments.some((ba) => {
        const baTeacherId = String(ba.teacherId || ba.teacher_id || "");
        const baGrade = String(ba.gradeLevel || ba.grade_level || "").trim().toLowerCase();
        return baTeacherId === teacherId && (baGrade === targetGrade || baGrade.includes(targetGrade));
      });
      if (hasBackendMatch) return true;

      // Check local stored assignments
      if (Array.isArray(teacher.assignedClasses)) {
        return teacher.assignedClasses.some((ac) => {
          if (targetId && (String(ac.id) === targetId || String(ac.classId) === targetId)) return true;
          const g = String(ac.gradeLevel || "").trim().toLowerCase();
          const s = String(ac.section || "").trim().toLowerCase();
          return g === targetGrade && (!targetSection || !s || s === targetSection);
        });
      }
      return false;
    });
  }, [selectedClass, teachers, assignments]);

  const filteredTeachers = useMemo(() => {
    const q = teacherSearch.toLowerCase().trim();
    if (!q) return assignedTeachers;
    return assignedTeachers.filter((t) => {
      const name = String(t.name || "").toLowerCase();
      const email = String(t.email || "").toLowerCase();
      const phone = String(t.phone || "").toLowerCase();
      const dept = String(t.department || "").toLowerCase();
      return name.includes(q) || email.includes(q) || phone.includes(q) || dept.includes(q);
    });
  }, [assignedTeachers, teacherSearch]);

  // -------------------------------------------------------------
  // Course Action: Assign Course
  // -------------------------------------------------------------
  const handleAssignCourseSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCourseToAssign) {
      toast.error("Please select a course to assign.");
      return;
    }
    setIsAssigningCourse(true);
    try {
      await courseService.assignCourseToClass({
        courseId: Number(selectedCourseToAssign),
        classLevel: selectedClass.gradeLevel,
      });
      toast.success(`Course successfully assigned to ${selectedClass.gradeLevel}!`);
      setIsAssignCourseOpen(false);
      setSelectedCourseToAssign("");
      await fetchCourseData();
      if (onRefreshParent) onRefreshParent();
    } catch (err) {
      console.error("Assign course failed:", err);
      toast.error(err.message || "Failed to assign course.");
    } finally {
      setIsAssigningCourse(false);
    }
  };

  // -------------------------------------------------------------
  // Course Action: Unassign Course
  // -------------------------------------------------------------
  const handleUnassignCourse = async (courseAssignment) => {
    if (!window.confirm(`Unassign "${courseAssignment.courseName}" from ${selectedClass.gradeLevel}?`)) {
      return;
    }
    setUnassigningCourseId(courseAssignment.id);
    try {
      await courseService.unassignCourseFromClass(courseAssignment.id);
      toast.success(`Course "${courseAssignment.courseName}" removed.`);
      setClassCourses((prev) => prev.filter((c) => c.id !== courseAssignment.id));
      if (onRefreshParent) onRefreshParent();
    } catch (err) {
      console.error("Unassign course failed:", err);
      toast.error(err.message || "Failed to unassign course.");
    } finally {
      setUnassigningCourseId(null);
    }
  };

  // -------------------------------------------------------------
  // Teacher Action: Unassign Teacher
  // -------------------------------------------------------------
  const handleUnassignTeacher = async (teacher) => {
    if (!window.confirm(`Unassign teacher "${teacher.name}" from ${selectedClass.gradeLevel} (Section ${selectedClass.section})?`)) {
      return;
    }
    setUnassigningTeacherId(teacher.id);
    try {
      const targetGrade = String(selectedClass.gradeLevel || "").trim().toLowerCase();
      const assignmentRecord = assignments.find((ba) => {
        const baTeacherId = String(ba.teacherId || ba.teacher_id || "");
        const baGrade = String(ba.gradeLevel || ba.grade_level || "").trim().toLowerCase();
        return baTeacherId === String(teacher.id) && (baGrade === targetGrade || baGrade.includes(targetGrade));
      });

      if (assignmentRecord?.id) {
        await teacherService.unassignTeacherAssignment(assignmentRecord.id, teacher.id, selectedClass.id);
      } else {
        teacherService.unassignClassFromTeacher(teacher.id, selectedClass.id || `${selectedClass.gradeLevel}-${selectedClass.section}`);
      }

      toast.success(`Instructor "${teacher.name}" unassigned successfully.`);
      await fetchTeacherData();
      if (onRefreshParent) onRefreshParent();
    } catch (err) {
      console.error("Failed to unassign teacher:", err);
      toast.error(err.message || "Failed to unassign instructor.");
    } finally {
      setUnassigningTeacherId(null);
    }
  };

  // -------------------------------------------------------------
  // CSV Export for This Class Roster
  // -------------------------------------------------------------
  const handleExportClassCsv = () => {
    if (roster.length === 0) {
      toast.info("No enrolled students in this class roster to export.");
      return;
    }
    const lines = [
      `"WELUDE BIRHAN SUNDAY SCHOOL - CLASS ROSTER SLIP"`,
      `"Class","${selectedClass.gradeLevel} - Section ${selectedClass.section}"`,
      `"Generated At","${new Date().toLocaleString()}"`,
      `"Total Enrolled","${roster.length}"`,
      "",
      `"#","Student ID","Full Name","Grade Level","Section","Academic Year","Status","Enrollment Date"`
    ];

    roster.forEach((s, idx) => {
      const cells = [
        idx + 1,
        `"${s.studentId || s.id || 'N/A'}"`,
        `"${s.fullname || s.name || 'Unknown'}"`,
        `"${s.gradeLevel || selectedClass.gradeLevel}"`,
        `"${s.section || selectedClass.section || 'A'}"`,
        `"${s.year || new Date().getFullYear()}"`,
        `"${s.status || 'ACTIVE'}"`,
        `"${s.enrolledAt ? new Date(s.enrolledAt).toLocaleDateString() : 'N/A'}"`
      ];
      lines.push(cells.join(","));
    });

    const csvContent = lines.join("\r\n");
    const filename = `class_roster_${selectedClass.gradeLevel.replace(/\s+/g, "_")}_sec_${selectedClass.section}.csv`;
    triggerCsvDownload(csvContent, filename);
    toast.success(`Exported ${roster.length} student records to ${filename}`);
  };

  const getStatusBadge = (status = "ACTIVE") => {
    const s = String(status).toUpperCase();
    switch (s) {
      case "ACTIVE":
        return isDarkMode 
          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
          : "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "GRADUATED":
        return isDarkMode 
          ? "bg-sky-500/10 text-sky-400 border-sky-500/20" 
          : "bg-sky-50 text-sky-700 border-sky-200";
      case "INACTIVE":
        return isDarkMode 
          ? "bg-slate-500/10 text-slate-400 border-slate-500/20" 
          : "bg-slate-100 text-slate-600 border-slate-200";
      case "SUSPENDED":
        return isDarkMode 
          ? "bg-rose-500/10 text-rose-400 border-rose-500/20" 
          : "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return isDarkMode 
          ? "bg-amber-500/10 text-amber-400 border-amber-500/20" 
          : "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  if (!selectedClass) return null;

  return (
    <section 
      aria-label="Selected Class Dedicated Details Section"
      className={`rounded-2xl border transition-all duration-300 shadow-xl overflow-hidden ${
        isDarkMode 
          ? "bg-[#081329] border-amber-500/30 text-slate-100 ring-1 ring-amber-500/20" 
          : "bg-white border-amber-300 text-slate-900 shadow-md ring-1 ring-amber-400/20"
      }`}
    >
      {/* ------------------------------------------------------------- */}
      {/* Header Banner: Title, Metadata, Close Button, & Tab Switcher */}
      {/* ------------------------------------------------------------- */}
      <div className={`p-6 sm:p-7 border-b transition-colors ${
        isDarkMode ? "bg-white/[0.02] border-white/10" : "bg-gradient-to-r from-amber-50/70 to-slate-50/80 border-slate-200"
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center font-bold shrink-0 mt-0.5 shadow-inner">
              <GraduationCap className="w-6 h-6" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-500 font-mono">
                  Dedicated Class Detail View
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                  isDarkMode ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-emerald-50 text-emerald-700 border-emerald-200"
                }`}>
                  Section {selectedClass.section || "A"}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-slate-900 dark:text-slate-100 mt-1">
                {selectedClass.gradeLevel}
              </h2>

              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Comprehensive academic inspection: Enrolled Roster, Curriculum Courses, and Faculty Instructors.
              </p>
            </div>
          </div>

          {/* Quick Metrics Badges & Close Button */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
              isDarkMode ? "bg-white/5 border-white/10 text-slate-300" : "bg-white border-slate-200 text-slate-700 shadow-sm"
            }`}>
              <Users className="w-3.5 h-3.5 text-amber-500" />
              <span>{roster.length} Enrolled</span>
            </div>

            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
              isDarkMode ? "bg-white/5 border-white/10 text-slate-300" : "bg-white border-slate-200 text-slate-700 shadow-sm"
            }`}>
              <BookOpen className="w-3.5 h-3.5 text-purple-400" />
              <span>{classCourses.length} Courses</span>
            </div>

            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
              isDarkMode ? "bg-white/5 border-white/10 text-slate-300" : "bg-white border-slate-200 text-slate-700 shadow-sm"
            }`}>
              <UserCheck className="w-3.5 h-3.5 text-sky-400" />
              <span>{assignedTeachers.length} Instructors</span>
            </div>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  isDarkMode 
                    ? "border-white/10 text-slate-400 hover:text-slate-100 hover:bg-white/10" 
                    : "border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
                title="Collapse detail view"
                aria-label="Collapse detail view"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-5 border-t border-inherit">
          <button
            type="button"
            onClick={() => setActiveTab("ALL")}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "ALL"
                ? "bg-amber-500 text-slate-950 shadow-md font-bold"
                : (isDarkMode ? "text-slate-400 hover:text-slate-200 hover:bg-white/5" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100")
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All 3 Tables</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("ROSTER")}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "ROSTER"
                ? "bg-amber-500 text-slate-950 shadow-md font-bold"
                : (isDarkMode ? "text-slate-400 hover:text-slate-200 hover:bg-white/5" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100")
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>1. Class Roster</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeTab === "ROSTER" ? "bg-slate-950/20 text-slate-950" : "bg-amber-500/10 text-amber-500"
            }`}>
              {roster.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("COURSES")}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "COURSES"
                ? "bg-amber-500 text-slate-950 shadow-md font-bold"
                : (isDarkMode ? "text-slate-400 hover:text-slate-200 hover:bg-white/5" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100")
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>2. Course Assignment</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeTab === "COURSES" ? "bg-slate-950/20 text-slate-950" : "bg-purple-500/10 text-purple-400"
            }`}>
              {classCourses.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("TEACHERS")}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "TEACHERS"
                ? "bg-amber-500 text-slate-950 shadow-md font-bold"
                : (isDarkMode ? "text-slate-400 hover:text-slate-200 hover:bg-white/5" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100")
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>3. Assigned Teachers</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeTab === "TEACHERS" ? "bg-slate-950/20 text-slate-950" : "bg-sky-500/10 text-sky-400"
            }`}>
              {assignedTeachers.length}
            </span>
          </button>
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-10">
        {/* ============================================================= */}
        {/* TABLE 1: CLASS ROSTER (Verified Enrolled Students)             */}
        {/* ============================================================= */}
        {(activeTab === "ALL" || activeTab === "ROSTER") && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-serif font-bold text-slate-900 dark:text-slate-100">
                    1. Class Roster — Verified Enrolled Students
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Official student roster enrolled in {selectedClass.gradeLevel} (Section {selectedClass.section})
                  </p>
                </div>
              </div>

              {/* Roster Controls */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleExportClassCsv}
                  disabled={roster.length === 0}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition disabled:opacity-40 cursor-pointer ${
                    isDarkMode 
                      ? "border-white/10 text-slate-300 hover:bg-white/5 hover:text-amber-400" 
                      : "border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                  title="Export this class roster to CSV"
                >
                  <FileDown className="w-3.5 h-3.5 text-amber-500" />
                  <span>Download Slip</span>
                </button>

                <button
                  type="button"
                  onClick={fetchRoster}
                  disabled={loadingRoster}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                    isDarkMode 
                      ? "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10" 
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
                  }`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingRoster ? "animate-spin text-amber-500" : ""}`} />
                  <span>Refresh Roster</span>
                </button>

                {isAuthorized && (
                  <Link
                    to="/dashboard/student-enrollment"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition shadow"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>+ Enroll Student</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Roster Search Bar */}
            <div className="relative max-w-sm">
              <Search className="w-3.5 h-3.5 absolute left-3.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search students by name, ID or status..."
                value={rosterSearch}
                onChange={(e) => setRosterSearch(e.target.value)}
                className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition ${
                  isDarkMode 
                    ? "bg-white/5 border-white/10 text-slate-100 placeholder:text-slate-500" 
                    : "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400"
                }`}
              />
            </div>

            {/* Table Container */}
            <div className={`overflow-x-auto rounded-xl border ${
              isDarkMode ? "border-white/10 bg-[#060e20]" : "border-slate-200 bg-white"
            }`}>
              <table className="w-full text-left text-xs border-collapse">
                <thead className={`text-[11px] font-semibold uppercase tracking-wider border-b ${
                  isDarkMode ? "bg-white/[0.03] border-white/10 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-600"
                }`}>
                  <tr>
                    <th className="py-3.5 px-4 font-semibold">#</th>
                    <th className="py-3.5 px-4 font-semibold">Student ID</th>
                    <th className="py-3.5 px-4 font-semibold">Full Name</th>
                    <th className="py-3.5 px-4 font-semibold">Grade & Sec</th>
                    <th className="py-3.5 px-4 font-semibold">Academic Year</th>
                    <th className="py-3.5 px-4 font-semibold">Status</th>
                    <th className="py-3.5 px-4 font-semibold">Enrolled Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-inherit">
                  {loadingRoster ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-500">
                        <div className="flex items-center justify-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
                          <span>Fetching class roster records...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredRoster.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-500 dark:text-slate-400">
                        <Users className="w-8 h-8 mx-auto text-slate-400 mb-2 opacity-50" />
                        <p className="font-semibold text-slate-300">
                          {rosterSearch ? "No students match your search filter." : "No verified students enrolled in this class yet."}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {rosterSearch ? "Try clearing your search query" : "Enroll students via the Student Enrollment dashboard"}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredRoster.map((student, idx) => {
                      const sId = student.studentId || student.id || "N/A";
                      return (
                        <tr 
                          key={student.id || sId || idx}
                          className={`transition-colors ${
                            isDarkMode ? "hover:bg-white/[0.02]" : "hover:bg-slate-50"
                          }`}
                        >
                          <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                            {idx + 1}
                          </td>

                          <td className="py-3.5 px-4 font-mono font-medium text-slate-700 dark:text-slate-300">
                            <div className="flex items-center gap-1.5">
                              <span>#{sId}</span>
                              <button
                                type="button"
                                onClick={() => handleCopy(sId, `st-${sId}`)}
                                className="text-slate-400 hover:text-amber-500 transition cursor-pointer"
                                title="Copy Student ID"
                              >
                                {copiedKey === `st-${sId}` ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 font-bold text-xs flex items-center justify-center shrink-0">
                                {student.fullname ? student.fullname.charAt(0).toUpperCase() : "S"}
                              </div>
                              <span className="font-semibold text-slate-900 dark:text-slate-100">
                                {student.fullname || student.name || "Unknown"}
                              </span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                            {student.gradeLevel || selectedClass.gradeLevel} (Sec {student.section || selectedClass.section || "A"})
                          </td>

                          <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                            {student.year || new Date().getFullYear()}
                          </td>

                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(student.status)}`}>
                              {student.status || "ACTIVE"}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                            {student.enrolledAt ? new Date(student.enrolledAt).toLocaleDateString() : "—"}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================= */}
        {/* TABLE 2: COURSE ASSIGNMENT (Curriculum Courses for this Class) */}
        {/* ============================================================= */}
        {(activeTab === "ALL" || activeTab === "COURSES") && (
          <div className="space-y-4 pt-4 border-t border-inherit">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-serif font-bold text-slate-900 dark:text-slate-100">
                    2. Course Assignment — Class Curriculum
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Theology and spiritual education subjects assigned to {selectedClass.gradeLevel}
                  </p>
                </div>
              </div>

              {/* Course Assignment Actions */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={fetchCourseData}
                  disabled={loadingCourses}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                    isDarkMode 
                      ? "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10" 
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
                  }`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingCourses ? "animate-spin text-purple-400" : ""}`} />
                  <span>Refresh Courses</span>
                </button>

                {isAuthorized && (
                  <button
                    type="button"
                    onClick={() => setIsAssignCourseOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition shadow cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Assign Course</span>
                  </button>
                )}
              </div>
            </div>

            {/* Course Search Bar if more than 2 courses */}
            {classCourses.length > 2 && (
              <div className="relative max-w-sm">
                <Search className="w-3.5 h-3.5 absolute left-3.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter courses for this class..."
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition ${
                    isDarkMode 
                      ? "bg-white/5 border-white/10 text-slate-100 placeholder:text-slate-500" 
                      : "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400"
                  }`}
                />
              </div>
            )}

            {/* Courses Table Container */}
            <div className={`overflow-x-auto rounded-xl border ${
              isDarkMode ? "border-white/10 bg-[#060e20]" : "border-slate-200 bg-white"
            }`}>
              <table className="w-full text-left text-xs border-collapse">
                <thead className={`text-[11px] font-semibold uppercase tracking-wider border-b ${
                  isDarkMode ? "bg-white/[0.03] border-white/10 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-600"
                }`}>
                  <tr>
                    <th className="py-3.5 px-4 font-semibold">Course ID</th>
                    <th className="py-3.5 px-4 font-semibold">Course Title</th>
                    <th className="py-3.5 px-4 font-semibold">Target Level</th>
                    <th className="py-3.5 px-4 font-semibold">Credit Hours</th>
                    <th className="py-3.5 px-4 font-semibold">Status</th>
                    <th className="py-3.5 px-4 font-semibold">Assigned On</th>
                    {isAuthorized && (
                      <th className="py-3.5 px-4 text-right font-semibold">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-inherit">
                  {loadingCourses ? (
                    <tr>
                      <td colSpan={isAuthorized ? 7 : 6} className="py-10 text-center text-slate-500">
                        <div className="flex items-center justify-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
                          <span>Loading course curriculum assignments...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredCourses.length === 0 ? (
                    <tr>
                      <td colSpan={isAuthorized ? 7 : 6} className="py-10 text-center text-slate-500 dark:text-slate-400">
                        <BookOpen className="w-8 h-8 mx-auto text-slate-400 mb-2 opacity-50" />
                        <p className="font-semibold text-slate-300">
                          {courseSearch ? "No courses match your filter." : "No courses assigned to this class yet."}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Allocate subjects from the curriculum catalog using the "Assign Course" button
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredCourses.map((c) => (
                      <tr 
                        key={c.id || `${c.courseId}-${c.classLevel}`}
                        className={`transition-colors ${
                          isDarkMode ? "hover:bg-white/[0.02]" : "hover:bg-slate-50"
                        }`}
                      >
                        <td className="py-3.5 px-4 font-mono font-medium text-slate-700 dark:text-slate-300">
                          #{c.courseId || c.id}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-xs shrink-0">
                              <BookOpen className="w-3.5 h-3.5" />
                            </div>
                            <span className="font-semibold text-slate-900 dark:text-slate-100">
                              {c.courseName || `Course #${c.courseId}`}
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                          {c.classLevel || selectedClass.gradeLevel}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold border ${
                            isDarkMode ? "bg-purple-500/10 border-purple-500/20 text-purple-400" : "bg-purple-50 border-purple-200 text-purple-700"
                          }`}>
                            <Clock className="w-3 h-3" />
                            <span>{c.creditHours || 3} Credits</span>
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            isDarkMode ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-emerald-50 border-emerald-200 text-emerald-700"
                          }`}>
                            ACTIVE SYLLABUS
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                          {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}
                        </td>

                        {isAuthorized && (
                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleUnassignCourse(c)}
                              disabled={unassigningCourseId === c.id}
                              className="text-rose-500 hover:text-rose-600 font-semibold inline-flex items-center gap-1 cursor-pointer disabled:opacity-50 text-[11px]"
                              title="Unassign this course"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>{unassigningCourseId === c.id ? "Removing..." : "Unassign"}</span>
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

        {/* ============================================================= */}
        {/* TABLE 3: ASSIGNED TEACHERS (Instructors Managing this Class)   */}
        {/* ============================================================= */}
        {(activeTab === "ALL" || activeTab === "TEACHERS") && (
          <div className="space-y-4 pt-4 border-t border-inherit">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-serif font-bold text-slate-900 dark:text-slate-100">
                    3. Assigned Teachers — Classroom Instructors
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Faculty instructors assigned to teach and manage {selectedClass.gradeLevel} (Section {selectedClass.section})
                  </p>
                </div>
              </div>

              {/* Teacher Actions */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={fetchTeacherData}
                  disabled={loadingTeachers}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                    isDarkMode 
                      ? "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10" 
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
                  }`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingTeachers ? "animate-spin text-sky-400" : ""}`} />
                  <span>Refresh Teachers</span>
                </button>

                {isAuthorized && (
                  <button
                    type="button"
                    onClick={() => setIsAssignTeacherOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition shadow cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Assign Instructor</span>
                  </button>
                )}
              </div>
            </div>

            {/* Teacher Search Bar if more than 2 teachers */}
            {assignedTeachers.length > 2 && (
              <div className="relative max-w-sm">
                <Search className="w-3.5 h-3.5 absolute left-3.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter instructors by name, department, phone..."
                  value={teacherSearch}
                  onChange={(e) => setTeacherSearch(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition ${
                    isDarkMode 
                      ? "bg-white/5 border-white/10 text-slate-100 placeholder:text-slate-500" 
                      : "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400"
                  }`}
                />
              </div>
            )}

            {/* Teachers Table Container */}
            <div className={`overflow-x-auto rounded-xl border ${
              isDarkMode ? "border-white/10 bg-[#060e20]" : "border-slate-200 bg-white"
            }`}>
              <table className="w-full text-left text-xs border-collapse">
                <thead className={`text-[11px] font-semibold uppercase tracking-wider border-b ${
                  isDarkMode ? "bg-white/[0.03] border-white/10 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-600"
                }`}>
                  <tr>
                    <th className="py-3.5 px-4 font-semibold">Instructor</th>
                    <th className="py-3.5 px-4 font-semibold">Teacher ID</th>
                    <th className="py-3.5 px-4 font-semibold">Department</th>
                    <th className="py-3.5 px-4 font-semibold">Phone</th>
                    <th className="py-3.5 px-4 font-semibold">Email</th>
                    <th className="py-3.5 px-4 font-semibold">Role / Subject</th>
                    {isAuthorized && (
                      <th className="py-3.5 px-4 text-right font-semibold">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-inherit">
                  {loadingTeachers ? (
                    <tr>
                      <td colSpan={isAuthorized ? 7 : 6} className="py-10 text-center text-slate-500">
                        <div className="flex items-center justify-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin text-sky-400" />
                          <span>Checking faculty instructor records...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredTeachers.length === 0 ? (
                    <tr>
                      <td colSpan={isAuthorized ? 7 : 6} className="py-10 text-center text-slate-500 dark:text-slate-400">
                        <UserCheck className="w-8 h-8 mx-auto text-slate-400 mb-2 opacity-50" />
                        <p className="font-semibold text-slate-300">
                          {teacherSearch ? "No instructors match your search." : "No instructors assigned to this class yet."}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Assign faculty instructors using the "+ Assign Instructor" button
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredTeachers.map((teacher) => (
                      <tr 
                        key={teacher.id}
                        className={`transition-colors ${
                          isDarkMode ? "hover:bg-white/[0.02]" : "hover:bg-slate-50"
                        }`}
                      >
                        {/* Teacher Name & Avatar */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 font-bold flex items-center justify-center text-xs shrink-0">
                              {teacher.name ? teacher.name.charAt(0).toUpperCase() : "T"}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 dark:text-slate-100">
                                {teacher.name}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* ID */}
                        <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400 text-[11px]">
                          #{teacher.id}
                        </td>

                        {/* Department */}
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium border ${
                            isDarkMode ? "bg-amber-500/10 border-amber-500/20 text-amber-400" : "bg-amber-50 border-amber-200 text-amber-700"
                          }`}>
                            <Building2 className="w-3 h-3" />
                            <span>{teacher.department || "General Spiritual Education"}</span>
                          </span>
                        </td>

                        {/* Phone with Copy */}
                        <td className="py-3.5 px-4">
                          {teacher.phone ? (
                            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                              <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{teacher.phone}</span>
                              <button
                                type="button"
                                onClick={() => handleCopy(teacher.phone, `tp-${teacher.id}`)}
                                className="text-slate-400 hover:text-amber-500 transition cursor-pointer"
                                title="Copy Phone"
                              >
                                {copiedKey === `tp-${teacher.id}` ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-500">—</span>
                          )}
                        </td>

                        {/* Email with Copy */}
                        <td className="py-3.5 px-4">
                          {teacher.email ? (
                            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 text-[11px]">
                              <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate max-w-[150px]">{teacher.email}</span>
                              <button
                                type="button"
                                onClick={() => handleCopy(teacher.email, `te-${teacher.id}`)}
                                className="text-slate-400 hover:text-amber-500 transition cursor-pointer"
                                title="Copy Email"
                              >
                                {copiedKey === `te-${teacher.id}` ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-500">—</span>
                          )}
                        </td>

                        {/* Role / Subject Badge */}
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            isDarkMode ? "bg-sky-500/10 border-sky-500/20 text-sky-400" : "bg-sky-50 border-sky-200 text-sky-700"
                          }`}>
                            <UserCheck className="w-3 h-3" />
                            <span>Lead Instructor</span>
                          </span>
                        </td>

                        {/* Actions */}
                        {isAuthorized && (
                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleUnassignTeacher(teacher)}
                              disabled={unassigningTeacherId === teacher.id}
                              className="text-rose-500 hover:text-rose-600 font-semibold inline-flex items-center gap-1 cursor-pointer disabled:opacity-50 text-[11px]"
                              title="Unassign this instructor from this class"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>{unassigningTeacherId === teacher.id ? "Unassigning..." : "Unassign"}</span>
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

      {/* ------------------------------------------------------------- */}
      {/* MODAL: Assign Course to this Class                            */}
      {/* ------------------------------------------------------------- */}
      {isAssignCourseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl transition-all ${
            isDarkMode ? "bg-[#0b1b3d] border-white/10 text-slate-100" : "bg-white border-slate-200 text-slate-800"
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-inherit mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-base">Assign Course to Class</h4>
                  <p className="text-xs text-slate-400">{selectedClass.gradeLevel} (Section {selectedClass.section})</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAssignCourseOpen(false);
                  setSelectedCourseToAssign("");
                }}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAssignCourseSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Select Course from Curriculum Catalog
                </label>
                <select
                  value={selectedCourseToAssign}
                  onChange={(e) => setSelectedCourseToAssign(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${
                    isDarkMode 
                      ? "bg-white/5 border-white/10 text-slate-100" 
                      : "bg-slate-50 border-slate-200 text-slate-900"
                  }`}
                  required
                >
                  <option value="" disabled>-- Select a curriculum course --</option>
                  {catalogCourses.map((c) => (
                    <option key={c.id} value={c.id} className="text-slate-900 bg-white dark:bg-slate-900 dark:text-slate-100">
                      {c.courseName} ({c.creditHours || 3} Credits)
                    </option>
                  ))}
                </select>
                {catalogCourses.length === 0 && (
                  <p className="text-[11px] text-amber-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>No catalog courses loaded. Please register courses first.</span>
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-inherit">
                <button
                  type="button"
                  onClick={() => {
                    setIsAssignCourseOpen(false);
                    setSelectedCourseToAssign("");
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-medium border transition ${
                    isDarkMode ? "border-white/10 text-slate-300 hover:bg-white/5" : "border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAssigningCourse || !selectedCourseToAssign}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition shadow disabled:opacity-50 cursor-pointer"
                >
                  {isAssigningCourse ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Assigning...</span>
                    </>
                  ) : (
                    <span>Assign Course</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: Assign Instructor to this Class (Using AssignTeacherModal) */}
      {/* ------------------------------------------------------------- */}
      {isAssignTeacherOpen && (
        <AssignTeacherModal
          isOpen={isAssignTeacherOpen}
          onClose={() => setIsAssignTeacherOpen(false)}
          selectedClass={selectedClass}
          isDarkMode={isDarkMode}
          currentlyAssignedTeacherIds={assignedTeachers.map((t) => t.id)}
          onAssigned={async () => {
            setIsAssignTeacherOpen(false);
            await fetchTeacherData();
            if (onRefreshParent) onRefreshParent();
          }}
        />
      )}
    </section>
  );
}
