import { useState, useEffect, useCallback } from "react";
import { useOutletContext, Link } from "react-router-dom";
import {
  BookOpen,
  GraduationCap,
  Users,
  ArrowRight,
  School,
  ShieldCheck,
  Layers,
  RefreshCw
} from "lucide-react";
import ClassOverview from "../../Components/SundaySchool/ClassOverview";
import { sundaySchoolService } from "../../services/sundaySchoolService";
import { teacherService } from "../../services/teacherService";
import { courseService } from "../../services/courseService";
import { useLanguage } from "@/Contexts/LanguageContext";

export function EducationHub() {
  const { t } = useLanguage();
  const context = useOutletContext();
  const isDarkMode = context?.isDarkMode ?? true;

  // Role verification for access control
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  })();
  const userRole = user?.role || "";
  const isAuthorized = ["ADMIN", "EDUCATION_LEADER"].includes(userRole);

  const [stats, setStats] = useState({
    totalClasses: 0,
    totalEnrollments: 0,
    totalTeachers: 0,
    totalCourses: 0,
    loading: true,
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const loadStats = useCallback(async () => {
    setStats((prev) => ({ ...prev, loading: true }));
    try {
      const [classes, enrollments, teachers, courses] = await Promise.all([
        sundaySchoolService.getClasses().catch((err) => {
          console.error("Failed to load classes in stats:", err);
          return [];
        }),
        sundaySchoolService.getEnrollments().catch((err) => {
          console.error("Failed to load enrollments in stats:", err);
          return [];
        }),
        teacherService.getTeachers().catch((err) => {
          console.error("Failed to load teachers in stats:", err);
          return [];
        }),
        courseService.getCourses().catch((err) => {
          console.error("Failed to load courses in stats:", err);
          return [];
        }),
      ]);
      setStats({
        totalClasses: Array.isArray(classes) ? classes.length : 0,
        totalEnrollments: Array.isArray(enrollments) ? enrollments.length : 0,
        totalTeachers: Array.isArray(teachers) ? teachers.length : 0,
        totalCourses: Array.isArray(courses) ? courses.length : 0,
        loading: false,
      });
    } catch (err) {
      console.error("EducationHub loadStats error:", err);
      setStats((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadStats();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadStats]);

  const handleGlobalRefresh = () => {
    loadStats();
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className={`p-6 sm:p-8 lg:p-10 space-y-10 sm:space-y-12 min-h-full transition-colors duration-300 ${isDarkMode ? "text-slate-100" : "text-slate-900"
      }`}>
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-slate-200 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-500 font-semibold mb-2">
            <span>Sunday School Platform</span>
            <span>/</span>
            <span>Education Hub</span>
            {isAuthorized && (
              <>
                <span>/</span>
                <span className="text-emerald-500 dark:text-emerald-400 font-normal flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Administrative Overview</span>
                </span>
              </>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {t.educationHub?.title || "Education Hub Overview"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-2xl leading-relaxed">
            {t.educationHub?.subtitle || "Centralized academic command center: monitor active classes, assign certified faculty instructors, track real-time student rosters, and oversee curriculum standards."}
          </p>
        </div>

        {/* Header Action Buttons to Dedicated Management Hubs */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleGlobalRefresh}
            disabled={stats.loading}
            className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${isDarkMode
              ? "bg-white/5 border-white/10 hover:bg-white/10 text-slate-200"
              : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm"
              }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${stats.loading ? "animate-spin text-amber-500" : ""}`} />
            <span>Sync Live Data</span>
          </button>

          {isAuthorized && (
            <Link
              to="/dashboard/teachers"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-md active:scale-[0.99]"
            >
              <Users className="w-4 h-4" />
              <span>{t.educationHub?.manageFaculty || "Teacher Management"}</span>
            </Link>
          )}

          <Link
            to="/dashboard/courses"
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all ${isDarkMode
              ? "bg-white/5 border-white/10 hover:bg-white/10 text-slate-200"
              : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm"
              }`}
          >
            <Layers className="w-4 h-4 text-amber-500" />
            <span>{t.educationHub?.courseCatalog || "Courses"}</span>
          </Link>

          <Link
            to="/dashboard/student-enrollment"
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all ${isDarkMode
              ? "bg-white/5 border-white/10 hover:bg-white/10 text-slate-200"
              : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm"
              }`}
          >
            <GraduationCap className="w-4 h-4 text-amber-500" />
            <span>{t.educationHub?.enrollStudents || "Enroll Student"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Top Metric Cards (4 Real Live API Metrics with De-compacted Breathing Room) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Active Classes */}
        <div className={`p-6 sm:p-7 rounded-2xl border transition-all duration-200 hover:shadow-lg ${isDarkMode
          ? "bg-[#0b1b3d]/60 border-white/10"
          : "bg-white border-slate-200 shadow-sm"
          }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t.educationHub?.totalClasses || "Active Classes"}
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <School className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-serif text-amber-500">
              {stats.loading ? "—" : stats.totalClasses}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Configured sections</span>
          </div>
        </div>

        {/* Total Enrolled Students */}
        <div className={`p-6 sm:p-7 rounded-2xl border transition-all duration-200 hover:shadow-lg ${isDarkMode
          ? "bg-[#0b1b3d]/60 border-white/10"
          : "bg-white border-slate-200 shadow-sm"
          }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t.educationHub?.enrolledStudents || "Enrolled Students"}
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-serif text-emerald-500 dark:text-emerald-400">
              {stats.loading ? "—" : stats.totalEnrollments}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Verified learners</span>
          </div>
        </div>

        {/* Total Registered Teachers */}
        <div className={`p-6 sm:p-7 rounded-2xl border transition-all duration-200 hover:shadow-lg ${isDarkMode
          ? "bg-[#0b1b3d]/60 border-white/10"
          : "bg-white border-slate-200 shadow-sm"
          }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t.educationHub?.facultyTeachers || "Faculty Teachers"}
            </span>
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-500 dark:text-sky-400 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-serif text-sky-500 dark:text-sky-400">
              {stats.loading ? "—" : stats.totalTeachers}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Registered instructors</span>
          </div>
        </div>

        {/* Total Courses in Catalog */}
        <div className={`p-6 sm:p-7 rounded-2xl border transition-all duration-200 hover:shadow-lg ${isDarkMode
          ? "bg-[#0b1b3d]/60 border-white/10"
          : "bg-white border-slate-200 shadow-sm"
          }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t.educationHub?.activeCourses || "Curriculum Courses"}
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 dark:text-purple-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-serif text-purple-500 dark:text-purple-400">
              {stats.loading ? "—" : stats.totalCourses}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Catalog offerings</span>
          </div>
        </div>
      </div>

      {/* Main Classroom & Roster Explorer */}
      <div>
        <ClassOverview isDarkMode={isDarkMode} isAuthorized={isAuthorized} refreshTrigger={refreshTrigger} />
      </div>
    </div>
  );
}

export default EducationHub;

