import { useOutletContext, Link } from "react-router-dom";
import { 
  ArrowRight,
  School,
  ShieldCheck
} from "lucide-react";
import TeacherManagement from "../../components/SundaySchool/TeacherManagement";

export default function TeacherManagementPage() {
  const context = useOutletContext();
  const isDarkMode = context?.isDarkMode ?? true;

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  })();
  const userRole = user?.role || "";
  const isAuthorized = ["ADMIN", "EDUCATION_LEADER"].includes(userRole);

  return (
    <div className={`p-6 sm:p-8 space-y-8 min-h-full transition-colors duration-300 ${
      isDarkMode ? "text-slate-100" : "text-slate-800"
    }`}>
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-inherit">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-500 font-semibold mb-1">
            <span>Sunday School Platform</span>
            <span>/</span>
            <span>Faculty & Teachers</span>
            {isAuthorized && (
              <>
                <span>/</span>
                <span className="text-emerald-400 font-normal flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Faculty Administration</span>
                </span>
              </>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight">
            Teacher Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Register and coordinate Sunday School instructors, assign teachers to classroom sections, and maintain academic staff records.
          </p>
        </div>

        <Link
          to="/dashboard/education"
          className={`self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
            isDarkMode 
              ? "bg-white/5 border-white/10 hover:bg-white/10 text-slate-200" 
              : "bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-800"
          }`}
        >
          <School className="w-4 h-4 text-amber-500" />
          <span>Education Hub</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Main Teacher Management Container */}
      <TeacherManagement isDarkMode={isDarkMode} />
    </div>
  );
}
