import { useState, useEffect, useMemo, useCallback } from "react";
import { 
  X, 
  Users, 
  GraduationCap, 
  Search, 
  RefreshCw, 
  Download, 
  Building2, 
  Phone, 
  Mail, 
  CheckCircle2,
  Calendar
} from "lucide-react";
import { toast } from "react-toastify";
import { teacherService } from "../../services/teacherService";
import { sundaySchoolService } from "../../services/sundaySchoolService";
import { triggerCsvDownload } from "../../utils/csvExport";

/**
 * TeacherStudentsModal Component
 * 
 * Displays nested student information for a selected teacher:
 * - Real API data from GET /assign-teacher-for-class/teacher/{teacherId}/students
 * - Cross-references student profile names from class enrollments
 * - Includes search filter, live refresh, and CSV roster export
 */
export default function TeacherStudentsModal({
  isOpen = false,
  teacher = null,
  onClose,
  isDarkMode = true,
}) {
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [teacherMeta, setTeacherMeta] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const loadTeacherStudents = useCallback(async () => {
    if (!teacher?.id) return;
    setLoading(true);

    try {
      // 1. Fetch from backend teacher-student mapping endpoint
      const [teacherStudentData, allEnrollments] = await Promise.all([
        teacherService.getStudentsForTeacher(teacher.id).catch((err) => {
          console.warn("Failed to fetch students from teacher endpoint:", err);
          return null;
        }),
        sundaySchoolService.getEnrollments({ limit: "300" }).catch((err) => {
          console.warn("Failed to fetch enrollments for cross-referencing:", err);
          return [];
        }),
      ]);

      const enrollmentMap = new Map();
      if (Array.isArray(allEnrollments)) {
        allEnrollments.forEach((e) => {
          if (e.studentId) enrollmentMap.set(String(e.studentId), e);
          if (e.id) enrollmentMap.set(String(e.id), e);
        });
      }

      let studentList = [];
      let grade = teacherStudentData?.gradeLevel || "";
      const tName = teacherStudentData?.teacherName || teacher.name || "";

      if (teacherStudentData && Array.isArray(teacherStudentData.students) && teacherStudentData.students.length > 0) {
        studentList = teacherStudentData.students.map((s, idx) => {
          const sId = String(s.studentId || s.id || "");
          const enriched = enrollmentMap.get(sId);
          return {
            id: s.id || `st-${idx}`,
            studentId: s.studentId || s.id || sId,
            fullname: s.fullname || s.studentName || s.name || enriched?.fullname || enriched?.name || `Student #${sId || idx + 1}`,
            gradeLevel: s.gradeLevel || grade || enriched?.gradeLevel || "General",
            section: s.section || enriched?.section || "A",
            enrollmentDate: s.enrollmentDate || s.enrolledAt || enriched?.enrolledAt || null,
            status: s.status || enriched?.status || "ACTIVE",
          };
        });
      }

      // Fallback: If primary endpoint returned empty, check teacher's assigned classes from local or backend state
      if (studentList.length === 0 && Array.isArray(teacher.assignedClasses) && teacher.assignedClasses.length > 0) {
        for (const cls of teacher.assignedClasses) {
          if (cls.gradeLevel) {
            grade = grade ? `${grade}, ${cls.gradeLevel}` : cls.gradeLevel;
            try {
              const roster = await sundaySchoolService.getClassRoster(cls.gradeLevel, cls.section);
              if (Array.isArray(roster) && roster.length > 0) {
                roster.forEach((r, idx) => {
                  studentList.push({
                    id: r.id || `${cls.gradeLevel}-${idx}`,
                    studentId: r.studentId || r.id,
                    fullname: r.fullname || r.name || "Unknown",
                    gradeLevel: r.gradeLevel || cls.gradeLevel,
                    section: r.section || cls.section || "A",
                    enrollmentDate: r.enrolledAt || null,
                    status: r.status || "ACTIVE",
                  });
                });
              }
            } catch (rErr) {
              console.warn(`Fallback roster fetch for ${cls.gradeLevel} failed:`, rErr);
            }
          }
        }
      }

      // Deduplicate by studentId
      const uniqueMap = new Map();
      studentList.forEach((st) => {
        const key = String(st.studentId || st.id);
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, st);
        }
      });

      const uniqueList = Array.from(uniqueMap.values());

      setStudents(uniqueList);
      setTeacherMeta({
        teacherName: tName,
        gradeLevel: grade,
        totalEnrolled: uniqueList.length,
      });
    } catch (err) {
      console.error("Error loading teacher students:", err);
      toast.error("Failed to load students for this teacher.");
    } finally {
      setLoading(false);
    }
  }, [teacher]);

  useEffect(() => {
    if (isOpen && teacher?.id) {
      const timer = setTimeout(() => {
        setSearchQuery("");
        loadTeacherStudents();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen, teacher, loadTeacherStudents]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Filter students by search
  const filteredStudents = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return students;
    return students.filter((s) => {
      const name = (s.fullname || "").toLowerCase();
      const sId = String(s.studentId || "").toLowerCase();
      const grade = (s.gradeLevel || "").toLowerCase();
      const sec = (s.section || "").toLowerCase();
      return name.includes(q) || sId.includes(q) || grade.includes(q) || sec.includes(q);
    });
  }, [students, searchQuery]);

  // Export roster to CSV
  const handleExportCsv = () => {
    if (students.length === 0) {
      toast.warning("No students available to export.");
      return;
    }

    const teacherName = teacher?.name || teacherMeta?.teacherName || "Instructor";
    const timestamp = new Date().toLocaleString();

    const lines = [
      `"WELUDE BIRHAN SUNDAY SCHOOL - TEACHER STUDENT ROSTER"`,
      `"Teacher / Instructor","${teacherName.replace(/"/g, '""')} (ID: #${teacher?.id})"`,
      `"Department","${(teacher?.department || "General Spiritual Education").replace(/"/g, '""')}"`,
      `"Assigned Grade(s)","${(teacherMeta?.gradeLevel || "General").replace(/"/g, '""')}"`,
      `"Generated At","${timestamp}"`,
      `"Total Students Enrolled","${students.length}"`,
      "",
      `"#","Student ID","Full Name","Grade Level","Section","Enrollment Date","Status"`
    ];

    students.forEach((s, idx) => {
      const eDate = s.enrollmentDate ? new Date(s.enrollmentDate).toLocaleDateString() : "N/A";
      lines.push(
        `"${idx + 1}","${s.studentId || "N/A"}","${(s.fullname || "").replace(/"/g, '""')}","${s.gradeLevel || "N/A"}","${s.section || "A"}","${eDate}","${s.status || "ACTIVE"}"`
      );
    });

    const csvContent = lines.join("\r\n");
    const safeName = teacherName.replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase();
    triggerCsvDownload(csvContent, `teacher_${safeName}_students.csv`);
    toast.success(`Exported ${students.length} students for ${teacherName}!`);
  };

  if (!isOpen || !teacher) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className={`w-full max-w-4xl max-h-[90vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden transition-all duration-200 ${
          isDarkMode 
            ? "bg-[#0b1b3d] border-white/10 text-slate-100" 
            : "bg-white border-slate-200 text-slate-900"
        }`}
      >
        {/* Header */}
        <div className="p-6 sm:p-7 border-b border-inherit flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 text-amber-500 flex items-center justify-center font-bold text-lg shrink-0">
              {teacher.name ? teacher.name.charAt(0).toUpperCase() : "T"}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h3 className="text-xl font-serif font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  {teacher.name}
                </h3>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-500">
                  ID: #{teacher.id}
                </span>
                {teacher.department && (
                  <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${
                    isDarkMode ? "bg-white/5 border-white/10 text-slate-300" : "bg-slate-100 border-slate-200 text-slate-700"
                  }`}>
                    <Building2 className="w-3 h-3 text-amber-500" />
                    <span>{teacher.department}</span>
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-slate-600 dark:text-slate-400">
                {teacher.phone && (
                  <span className="flex items-center gap-1 font-mono">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{teacher.phone}</span>
                  </span>
                )}
                {teacher.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{teacher.email}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              type="button"
              onClick={loadTeacherStudents}
              disabled={loading}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isDarkMode 
                  ? "border-white/10 text-slate-300 hover:text-amber-400 hover:bg-white/5" 
                  : "border-slate-200 text-slate-600 hover:text-amber-600 hover:bg-slate-100"
              }`}
              title="Refresh Student Roster"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-amber-500" : ""}`} />
            </button>

            <button
              type="button"
              onClick={onClose}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isDarkMode 
                  ? "border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/5" 
                  : "border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100"
              }`}
              title="Close modal (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sub-Header / Controls & Stats */}
        <div className={`p-4 sm:px-7 border-b border-inherit flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          isDarkMode ? "bg-white/[0.02]" : "bg-slate-50/80"
        }`}>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Assigned Students:
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                students.length > 0
                  ? (isDarkMode ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-emerald-50 border-emerald-200 text-emerald-700")
                  : (isDarkMode ? "bg-slate-500/10 border-slate-500/20 text-slate-400" : "bg-slate-100 border-slate-200 text-slate-600")
              }`}>
                {students.length} Total Enrolled
              </span>
            </div>

            {teacherMeta?.gradeLevel && (
              <div className="flex items-center gap-1.5 text-xs text-amber-500 font-medium">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Classroom(s): {teacherMeta.gradeLevel}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search students by name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-8 pr-3 py-1.5 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition ${
                  isDarkMode 
                    ? "bg-[#081226] border-white/10 text-slate-100 placeholder:text-slate-500" 
                    : "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400"
                }`}
              />
            </div>

            {/* CSV Download Button */}
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={students.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          </div>
        </div>

        {/* Content Body: Student Information Table */}
        <div className="flex-1 overflow-y-auto min-h-[260px] max-h-[500px]">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
              <RefreshCw className="w-7 h-7 animate-spin text-amber-500" />
              <span className="text-xs font-medium">Fetching students assigned to this teacher...</span>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="py-16 px-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {searchQuery ? "No matching students found" : "No students currently assigned to this teacher"}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
                {searchQuery 
                  ? `No students matching "${searchQuery}" in this teacher's classes.`
                  : "Students will appear here once allocated to this instructor's grade level and sections in the Education Hub."}
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead className={`text-[11px] font-semibold uppercase tracking-wider border-b sticky top-0 z-10 ${
                isDarkMode ? "bg-[#081226] border-white/10 text-slate-400" : "bg-slate-100 border-slate-200 text-slate-600"
              }`}>
                <tr>
                  <th className="py-3.5 px-6 font-semibold">#</th>
                  <th className="py-3.5 px-6 font-semibold">Student ID</th>
                  <th className="py-3.5 px-6 font-semibold">Full Name</th>
                  <th className="py-3.5 px-6 font-semibold">Grade & Section</th>
                  <th className="py-3.5 px-6 font-semibold">Enrollment Date</th>
                  <th className="py-3.5 px-6 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-inherit">
                {filteredStudents.map((student, idx) => (
                  <tr 
                    key={student.id || `${student.studentId}-${idx}`}
                    className={`transition-colors ${
                      isDarkMode ? "hover:bg-white/[0.02]" : "hover:bg-slate-50"
                    }`}
                  >
                    <td className="py-3.5 px-6 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                      {idx + 1}
                    </td>
                    <td className="py-3.5 px-6 font-mono font-semibold">
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold border ${
                        isDarkMode 
                          ? "text-amber-400 bg-amber-500/10 border-amber-500/20" 
                          : "text-amber-700 bg-amber-50 border-amber-200"
                      }`}>
                        {student.studentId || "—"}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 font-semibold text-slate-900 dark:text-slate-100">
                      {student.fullname}
                    </td>
                    <td className="py-3.5 px-6">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${
                        isDarkMode ? "bg-sky-500/10 border-sky-500/20 text-sky-400" : "bg-sky-50 border-sky-200 text-sky-700"
                      }`}>
                        <GraduationCap className="w-3 h-3" />
                        <span>{student.gradeLevel} (Sec {student.section})</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{student.enrollmentDate ? new Date(student.enrollmentDate).toLocaleDateString() : "Active Session"}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border text-emerald-500 bg-emerald-500/10 border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{student.status || "ACTIVE"}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className={`p-4 sm:px-7 border-t border-inherit flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2 ${
          isDarkMode ? "bg-white/[0.01]" : "bg-slate-50"
        }`}>
          <div>
            Showing <span className="font-semibold text-slate-200 dark:text-slate-100">{filteredStudents.length}</span> of{" "}
            <span className="font-semibold text-slate-200 dark:text-slate-100">{students.length}</span> students
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
              isDarkMode 
                ? "bg-white/5 border-white/10 hover:bg-white/10 text-slate-300" 
                : "bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700"
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
