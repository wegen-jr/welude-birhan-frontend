import { useState, useEffect, useCallback } from "react";
import { useOutletContext, Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  BookOpen,
  BookPlus,
  Layers,
  Clock,
  ShieldCheck,
  ChevronUp,
  ArrowRight,
  School,
  FileDown,
  Loader2
} from "lucide-react";
import { courseService } from "../../services/courseService";
import { teacherService } from "../../services/teacherService";
import { sundaySchoolService } from "../../services/sundaySchoolService";
import { generateAllCoursesReportCsv, triggerCsvDownload } from "../../utils/csvExport";
import CourseRegistrationForm from "../../Components/Course/CourseRegistrationForm";
import CourseDataTable from "../../Components/Course/CourseDataTable";
import EditCourseModal from "../../Components/Course/EditCourseModal";
import { useLanguage } from "@/Contexts/LanguageContext";

export default function CourseManagementPage() {
  const { t } = useLanguage();
  const context = useOutletContext();
  const isDarkMode = context?.isDarkMode ?? true;

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [generatingCsv, setGeneratingCsv] = useState(false);

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  })();
  const userRole = user?.role || "";
  const isAuthorized = ["ADMIN", "EDUCATION_LEADER"].includes(userRole);

  const handleGenerateAllCsv = async () => {
    if (courses.length === 0) {
      toast.info("No courses available to generate report.");
      return;
    }
    setGeneratingCsv(true);
    try {
      const [classAssignments, teachers, enrollments] = await Promise.all([
        courseService.getClassCourseAssignments().catch(() => []),
        teacherService.getTeachers().catch(() => []),
        sundaySchoolService.getEnrollments({ limit: "500" }).catch(() => []),
      ]);

      const csv = generateAllCoursesReportCsv(courses, {
        classAssignments: Array.isArray(classAssignments) ? classAssignments : [],
        teachers: Array.isArray(teachers) ? teachers : [],
        enrollments: Array.isArray(enrollments) ? enrollments : [],
      });

      const dateStr = new Date().toISOString().slice(0, 10);
      triggerCsvDownload(csv, `course_catalog_report_${dateStr}.csv`);
      toast.success("Curriculum catalog CSV report generated and downloaded!");
    } catch (err) {
      console.error("Failed to generate CSV report:", err);
      toast.error(err.message || "Failed to generate CSV report.");
    } finally {
      setGeneratingCsv(false);
    }
  };

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await courseService.getCourses();
      setCourses(data || []);
    } catch (err) {
      console.error("Failed to fetch courses:", err);
      toast.error(err.message || "Failed to load courses catalog.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function init() {
      setLoading(true);
      try {
        const data = await courseService.getCourses();
        if (isMounted) setCourses(data || []);
      } catch (err) {
        console.error("Failed to fetch courses on mount:", err);
        toast.error(err.message || "Failed to load courses catalog.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    init();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleCourseCreated = (newCourse) => {
    setCourses((prev) => [newCourse, ...prev]);
  };

  const handleCourseUpdated = (updatedCourse) => {
    setCourses((prev) =>
      prev.map((c) => (Number(c.id) === Number(updatedCourse.id) ? updatedCourse : c))
    );
  };

  const handleCourseDeleted = (deletedId) => {
    setCourses((prev) => prev.filter((c) => Number(c.id) !== Number(deletedId)));
  };

  // Metrics
  const totalCourses = courses.length;
  const totalCredits = courses.reduce((sum, c) => sum + (Number(c.creditHours) || 0), 0);
  const avgCredits = totalCourses > 0 ? (totalCredits / totalCourses).toFixed(1) : 0;

  return (
    <div className={`p-6 sm:p-8 space-y-8 min-h-full transition-colors duration-300 ${isDarkMode ? "text-slate-100" : "text-slate-800"
      }`}>
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-inherit">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-500 font-semibold mb-1">
            <span>Sunday School Platform</span>
            <span>/</span>
            <span>Academic Curriculum</span>
            {isAuthorized && (
              <>
                <span>/</span>
                <span className="text-emerald-400 font-normal flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Curriculum Manager</span>
                </span>
              </>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight">
            {t.courseManagement?.title || "Course Management"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            {t.courseManagement?.subtitle || "Design and oversee the Sunday School curriculum catalog: register subjects, allocate credit hours, and maintain academic offerings."}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Generate CSV Report (Slip Generation) Button */}
          <button
            type="button"
            onClick={handleGenerateAllCsv}
            disabled={generatingCsv || loading}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all shadow-sm active:scale-[0.99] cursor-pointer disabled:opacity-50 ${isDarkMode
              ? "bg-white/5 border-white/10 hover:bg-white/10 text-amber-400"
              : "bg-white border-slate-200 hover:bg-slate-50 text-amber-700 shadow-sm"
              }`}
            title="Generate and download complete curriculum catalog and student enrollment CSV slip report"
          >
            {generatingCsv ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                <span>Generating Report...</span>
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4 text-amber-500" />
                <span>Generate CSV Report</span>
                <span className={`text-[10px] font-normal px-1.5 py-0.2 rounded border ${isDarkMode ? "bg-amber-500/10 border-amber-500/20 text-amber-400" : "bg-amber-50 border-amber-200 text-amber-800"
                  }`}>
                  Slip
                </span>
              </>
            )}
          </button>

          {isAuthorized && (
            <button
              onClick={() => setShowForm((prev) => !prev)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-[0.99] ${showForm
                ? (isDarkMode ? "bg-white/10 text-slate-200 hover:bg-white/15" : "bg-slate-200 text-slate-800 hover:bg-slate-300")
                : "bg-amber-500 hover:bg-amber-400 text-slate-950"
                }`}
            >
              {showForm ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  <span>Hide Form</span>
                </>
              ) : (
                <>
                  <BookPlus className="w-4 h-4" />
                  <span>+ Add New Course</span>
                </>
              )}
            </button>
          )}

          <Link
            to="/dashboard/education"
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all ${isDarkMode
              ? "bg-white/5 border-white/10 hover:bg-white/10 text-slate-200"
              : "bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-800"
              }`}
          >
            <School className="w-4 h-4 text-amber-500" />
            <span>{t.adminSide?.educationHub || "Education Hub"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`p-5 rounded-2xl border transition-all ${isDarkMode ? "bg-[#0b1b3d]/60 border-white/10" : "bg-white border-slate-200"
          }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {t.educationHub?.activeCourses || "Active Courses"}
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-serif text-amber-500">
              {loading ? "—" : totalCourses}
            </span>
            <span className="text-xs text-slate-400">Registered catalog subjects</span>
          </div>
        </div>

        <div className={`p-5 rounded-2xl border transition-all ${isDarkMode ? "bg-[#0b1b3d]/60 border-white/10" : "bg-white border-slate-200"
          }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Credit Hours
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-serif text-emerald-400">
              {loading ? "—" : totalCredits}
            </span>
            <span className="text-xs text-slate-400">Accumulated workload</span>
          </div>
        </div>

        <div className={`p-5 rounded-2xl border transition-all ${isDarkMode ? "bg-[#0b1b3d]/60 border-white/10" : "bg-white border-slate-200"
          }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Average Credits / Course
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-serif text-sky-400">
              {loading ? "—" : avgCredits}
            </span>
            <span className="text-xs text-slate-400">Hours per subject</span>
          </div>
        </div>
      </div>

      {/* Registration Form (Collapsible) */}
      {showForm && isAuthorized && (
        <div className="animate-fadeIn">
          <CourseRegistrationForm
            isDarkMode={isDarkMode}
            isAuthorized={isAuthorized}
            onCourseCreated={handleCourseCreated}
            onClose={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Data Table */}
      <CourseDataTable
        courses={courses}
        loading={loading}
        onRefresh={fetchCourses}
        onEditCourse={(course) => setEditingCourse(course)}
        onCourseDeleted={handleCourseDeleted}
        isDarkMode={isDarkMode}
        isAuthorized={isAuthorized}
      />

      {/* Edit Modal */}
      {editingCourse && (
        <EditCourseModal
          key={editingCourse.id}
          course={editingCourse}
          isOpen={Boolean(editingCourse)}
          onClose={() => setEditingCourse(null)}
          onCourseUpdated={handleCourseUpdated}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
}
