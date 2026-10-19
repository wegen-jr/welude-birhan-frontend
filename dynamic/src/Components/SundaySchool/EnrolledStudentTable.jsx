import { useState, useEffect, useCallback } from "react";
import { 
  Users, 
  Search, 
  RefreshCw, 
  GraduationCap, 
  AlertCircle 
} from "lucide-react";
import { sundaySchoolService } from "../../services/sundaySchoolService";

export default function EnrolledStudentTable({ 
  newlyEnrolledStudent, 
  isDarkMode = true 
}) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const fetchEnrollments = useCallback(async () => {
    await Promise.resolve();
    setLoading(true);
    try {
      const data = await sundaySchoolService.getEnrollments();
      setStudents(data || []);
    } catch (err) {
      console.warn("Could not fetch existing enrollments:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEnrollments();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchEnrollments]);

  // When a newly enrolled student comes in, dynamically prepend it to the table list!
  useEffect(() => {
    if (!newlyEnrolledStudent) return;
    const timer = setTimeout(() => {
      setStudents(prev => {
        // Prevent duplicate if already present
        const exists = prev.some(
          s => s.id === newlyEnrolledStudent.id || 
               (s.studentId === newlyEnrolledStudent.studentId && s.gradeLevel === newlyEnrolledStudent.gradeLevel && s.section === newlyEnrolledStudent.section)
        );
        if (exists) {
          return prev.map(s => 
            (s.id === newlyEnrolledStudent.id || s.studentId === newlyEnrolledStudent.studentId) 
              ? { ...s, ...newlyEnrolledStudent } 
              : s
          );
        }
        return [newlyEnrolledStudent, ...prev];
      });
    }, 0);
    return () => clearTimeout(timer);
  }, [newlyEnrolledStudent]);

  // Filter students based on search and status
  const filteredStudents = students.filter(student => {
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery = !query || (
      (student.fullname && student.fullname.toLowerCase().includes(query)) ||
      (student.studentId && student.studentId.toLowerCase().includes(query)) ||
      (student.gradeLevel && student.gradeLevel.toLowerCase().includes(query)) ||
      (student.section && student.section.toLowerCase().includes(query))
    );

    const matchesStatus = statusFilter === "ALL" || (
      (student.status || "ACTIVE").toUpperCase() === statusFilter.toUpperCase()
    );

    return matchesQuery && matchesStatus;
  });

  const getStatusBadge = (status = "ACTIVE") => {
    const s = status.toUpperCase();
    switch (s) {
      case "ACTIVE":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "GRADUATED":
        return "bg-sky-500/10 text-sky-400 border-sky-500/20";
      case "INACTIVE":
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
      case "SUSPENDED":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      default:
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    }
  };

  return (
    <div className={`rounded-2xl border transition-all shadow-sm overflow-hidden ${
      isDarkMode 
        ? "bg-[#0b1b3d]/60 border-white/10 text-slate-100" 
        : "bg-white border-slate-200 text-slate-800"
    }`}>
      {/* Table Header */}
      <div className="p-6 pb-4 border-b border-inherit">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-bold">Enrolled Students Registry</h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {students.length} Total
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Active student enrollments dynamically populated upon successful submission
            </p>
          </div>

          <button
            type="button"
            onClick={fetchEnrollments}
            disabled={loading}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              isDarkMode 
                ? "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10" 
                : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-amber-500" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student ID, full name, or grade..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                isDarkMode 
                  ? "bg-white/5 border-white/10 text-slate-100 placeholder:text-slate-500" 
                  : "bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400"
              }`}
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                isDarkMode 
                  ? "bg-white/5 border-white/10 text-slate-100" 
                  : "bg-slate-50 border-slate-200 text-slate-800"
              }`}
            >
              <option value="ALL" className="bg-slate-900 text-slate-100">All Statuses</option>
              <option value="ACTIVE" className="bg-slate-900 text-slate-100">Active</option>
              <option value="GRADUATED" className="bg-slate-900 text-slate-100">Graduated</option>
              <option value="INACTIVE" className="bg-slate-900 text-slate-100">Inactive</option>
              <option value="SUSPENDED" className="bg-slate-900 text-slate-100">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className={`text-[11px] font-semibold uppercase tracking-wider border-b ${
            isDarkMode 
              ? "bg-white/[0.02] border-white/10 text-slate-400" 
              : "bg-slate-100/80 border-slate-200 text-slate-600"
          }`}>
            <tr>
              <th className="py-4 px-6 font-semibold">Student ID</th>
              <th className="py-4 px-6 font-semibold">Full Name</th>
              <th className="py-4 px-6 font-semibold">Assigned Class</th>
              <th className="py-4 px-6 font-semibold">Member ID</th>
              <th className="py-4 px-6 font-semibold">Academic Year</th>
              <th className="py-4 px-6 font-semibold">Status</th>
              <th className="py-4 px-6 font-semibold">Enrolled Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-inherit">
            {loading && students.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-12 text-center text-slate-500 dark:text-slate-400">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin text-amber-500" />
                    <span className="text-xs">Loading enrollments registry...</span>
                  </div>
                </td>
              </tr>
            ) : filteredStudents.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-12 text-center text-slate-500 dark:text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <AlertCircle className="w-8 h-8 text-slate-400" />
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">No enrolled students found</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Complete Step 1 & 2 above to enroll students into Sunday School.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredStudents.map((student, idx) => {
                const isJustAdded = newlyEnrolledStudent && (
                  newlyEnrolledStudent.id === student.id ||
                  (newlyEnrolledStudent.studentId === student.studentId && newlyEnrolledStudent.gradeLevel === student.gradeLevel)
                );

                return (
                  <tr 
                    key={student.id || `${student.studentId}-${idx}`}
                    className={`transition-colors ${
                      isJustAdded
                        ? (isDarkMode ? "bg-amber-500/10" : "bg-amber-50/70")
                        : (isDarkMode ? "hover:bg-white/[0.02]" : "hover:bg-slate-50/80")
                    }`}
                  >
                    <td className="py-4 px-6 font-mono font-semibold">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold border ${
                        isDarkMode 
                          ? "text-amber-400 bg-amber-500/10 border-amber-500/20" 
                          : "text-amber-700 bg-amber-50 border-amber-200"
                      }`}>
                        {student.studentId || "N/A"}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-900 dark:text-slate-100">
                      {student.fullname || "Unknown"}
                    </td>
                    <td className="py-4 px-6">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${
                        isDarkMode 
                          ? "bg-white/5 border-white/10 text-slate-200" 
                          : "bg-slate-100 border-slate-200 text-slate-800"
                      }`}>
                        <GraduationCap className="w-3.5 h-3.5 text-amber-500" />
                        <span>{student.gradeLevel || "Grade N/A"}</span>
                        <span className="text-slate-500 dark:text-slate-400">• Sec {student.section || "A"}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-700 dark:text-slate-300">
                      {student.memberId ?? "N/A"}
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-700 dark:text-slate-300">
                      {student.year ?? new Date().getFullYear()}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadge(student.status)}`}>
                        {student.status || "ACTIVE"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-600 dark:text-slate-400 text-xs">
                      {student.enrolledAt 
                        ? new Date(student.enrolledAt).toLocaleDateString()
                        : new Date().toLocaleDateString()}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>

        </table>
      </div>
    </div>
  );
}
