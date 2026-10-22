import { useState, useEffect, useMemo, useCallback } from "react";
import {
  X,
  Users,
  GraduationCap,
  Search,
  RefreshCw,
  FileText,
  Building2,
  Phone,
  Mail,
  CheckCircle2,
  Calendar
} from "lucide-react";
import { toast } from "react-toastify";
import { teacherService } from "../../services/educationhub/teacherService";
import { sundaySchoolService } from "../../services/educationhub/sundaySchoolService";
import { generateTeacherStudentsSlipPdf } from "../../utils/pdfExport";

/**
 * TeacherStudentsModal Component
 * 
 * Displays nested student information for a selected teacher:
 * - Aggregates students across all classes assigned to this teacher
 * - Checks live API data from GET /assign-teacher-for-class/teacher/{teacherId}/students
 * - Cross-references student profile names from class enrollments
 * - Includes search filter, live refresh, and professional PDF Slip export
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
  const [exportingPdf, setExportingPdf] = useState(false);

  const loadTeacherStudents = useCallback(async () => {
    if (!teacher?.id) return;
    setLoading(true);

    try {
      // 1. Fetch in parallel:
      // a) Direct teacher-student endpoint: /assign-teacher-for-class/teacher/{id}/students
      // b) Assigned classes for this teacher from backend /assign-teacher-for-class & local storage
      // c) All classes from /class (to map class_ids and section info)
      // d) All Sunday School enrollments
      const [teacherStudentData, assignedClasses, classesData, allEnrollments] = await Promise.all([
        teacherService.getStudentsForTeacher(teacher.id).catch((err) => {
          console.warn("Failed to fetch students from teacher direct endpoint:", err);
          return null;
        }),
        teacherService.getAssignedClassesForTeacher(teacher.id).catch((err) => {
          console.warn("Failed to fetch assigned classes for teacher:", err);
          return [];
        }),
        sundaySchoolService.getClasses().catch(() => []),
        sundaySchoolService.getEnrollments({ limit: "500" }).catch((err) => {
          console.warn("Failed to fetch enrollments:", err);
          return [];
        }),
      ]);

      const teacherIdStr = String(teacher.id);
      const classesList = Array.isArray(classesData) ? classesData : [];
      const enrollmentList = Array.isArray(allEnrollments) ? allEnrollments : [];

      // Consolidate all assigned classes and their class_ids for this teacher
      const teacherClassMap = new Map();

      const registerClass = (cls) => {
        if (!cls) return;
        const classId = String(cls.classId || cls.class_id || cls.id || "").trim();
        const gradeLevel = String(cls.gradeLevel || cls.classLevel || "").trim();
        const section = String(cls.section || "").trim().replace(/^section\s+/i, "");
        const key = classId || `${gradeLevel.toLowerCase()}::${section.toLowerCase()}`;
        if (key && !teacherClassMap.has(key)) {
          teacherClassMap.set(key, {
            id: classId,
            classId,
            class_id: classId,
            gradeLevel: gradeLevel || "Class",
            section: section || "A",
            courseName: cls.courseName || cls.course || "",
          });
        }
      };

      // 1) From teacher prop
      if (Array.isArray(teacher.assignedClasses)) teacher.assignedClasses.forEach(registerClass);
      if (Array.isArray(teacher.classes)) teacher.classes.forEach(registerClass);

      // 2) From assignedClasses helper
      if (Array.isArray(assignedClasses)) assignedClasses.forEach(registerClass);

      // 3) From classes with direct teacher_id
      classesList.forEach((cls) => {
        const cTeacherId = String(cls.teacher_id ?? cls.teacherId ?? cls.instructorId ?? "");
        if (cTeacherId && cTeacherId === teacherIdStr) {
          registerClass(cls);
        }
      });

      const assignedClassList = Array.from(teacherClassMap.values());
      const assignedClassIds = new Set(
        assignedClassList.map((c) => String(c.class_id || c.classId || c.id || "")).filter(Boolean)
      );

      // Build enrollment lookup map
      const enrollmentMap = new Map();
      enrollmentList.forEach((e) => {
        if (e.studentId) enrollmentMap.set(String(e.studentId).toLowerCase(), e);
        if (e.id) enrollmentMap.set(String(e.id), e);
        if (e.fullname) enrollmentMap.set(String(e.fullname).toLowerCase(), e);
      });

      const uniqueMap = new Map();

      const addStudentIfValid = (s, fallbackCls = null) => {
        if (!s || typeof s !== 'object') return;
        const rawName = String(s.fullname || s.studentName || s.name || "").trim();
        const rawStudentId = String(s.studentId || "").trim();

        // If it doesn't have a real student name or studentId, reject it immediately
        if (!rawName && !rawStudentId) return;

        // Reject synthetic placeholders like "Student #1" or "Unknown" without a real studentId
        if (
          (!rawName || rawName.toLowerCase() === "unknown" || /^student\s*#?\d+$/i.test(rawName)) &&
          (!rawStudentId || rawStudentId === "—")
        ) {
          return;
        }

        const enriched = (rawStudentId && enrollmentMap.get(rawStudentId.toLowerCase())) ||
                         (rawName && enrollmentMap.get(rawName.toLowerCase()));

        const finalName = rawName && rawName.toLowerCase() !== "unknown"
          ? rawName
          : (enriched?.fullname || enriched?.name || "");

        const finalId = rawStudentId && rawStudentId !== "—"
          ? rawStudentId
          : (enriched?.studentId || s.id || "—");

        // If after enrichment we still have no name and no valid studentId, discard
        if (!finalName && (!finalId || finalId === "—")) return;

        const dedupKey = finalId && finalId !== "—"
          ? `id:${String(finalId).toLowerCase()}`
          : `name:${String(finalName).toLowerCase()}`;

        if (!uniqueMap.has(dedupKey)) {
          uniqueMap.set(dedupKey, {
            id: s.id || finalId || `st-${uniqueMap.size + 1}`,
            studentId: finalId,
            fullname: finalName,
            gradeLevel: s.gradeLevel || fallbackCls?.gradeLevel || enriched?.gradeLevel || "General",
            section: s.section || fallbackCls?.section || enriched?.section || "A",
            enrollmentDate: s.enrolledAt || s.enrollmentDate || s.createdAt || enriched?.enrolledAt || null,
            status: s.status || enriched?.status || "ACTIVE",
          });
        }
      };

      // 1. Fetch enrolled students directly by assigned class_ids in parallel
      if (assignedClassIds.size > 0) {
        const classIdPromises = Array.from(assignedClassIds).map(async (classId) => {
          try {
            return await sundaySchoolService.getEnrollmentsByClassId(classId);
          } catch {
            return [];
          }
        });
        const classIdResults = await Promise.all(classIdPromises);
        classIdResults.flat().forEach((e) => addStudentIfValid(e));

        // Match from allEnrollments by classId / class_id
        enrollmentList.forEach((e) => {
          const sClassId = String(e.classId || e.class_id || "");
          if (sClassId && assignedClassIds.has(sClassId)) {
            addStudentIfValid(e);
          }
        });
      }

      // 2. Aggregate students from section rosters for each assigned class
      if (assignedClassList.length > 0) {
        const rosterPromises = assignedClassList.map(async (cls) => {
          try {
            return await sundaySchoolService.getClassRoster(
              cls.gradeLevel,
              cls.section !== "General" ? cls.section : undefined
            );
          } catch {
            return [];
          }
        });
        const rosterResults = await Promise.all(rosterPromises);
        rosterResults.forEach((roster, idx) => {
          const cls = assignedClassList[idx];
          if (Array.isArray(roster)) {
            roster.forEach((r) => addStudentIfValid(r, cls));
          }
        });

        // Match from allEnrollments by gradeLevel & section
        assignedClassList.forEach((cls) => {
          const normGrade = cls.gradeLevel.toLowerCase();
          const normSec = cls.section.toLowerCase();
          const isGeneral = !normSec || normSec === "general" || normSec === "all";

          const matchingEnrollments = enrollmentList.filter((e) => {
            const eGrade = String(e.gradeLevel || "").trim().toLowerCase();
            const eSec = String(e.section || "").trim().replace(/^section\s+/i, "").toLowerCase();
            if (eGrade !== normGrade) return false;
            if (isGeneral) return true;
            return eSec === normSec;
          });

          matchingEnrollments.forEach((e) => addStudentIfValid(e, cls));
        });
      }

      // 3. Incorporate students from direct endpoint if returned (with strict student validation)
      if (teacherStudentData && Array.isArray(teacherStudentData.students) && teacherStudentData.students.length > 0) {
        teacherStudentData.students.forEach((s) => addStudentIfValid(s));
      }

      const uniqueList = Array.from(uniqueMap.values());

      // Format assigned grades string
      const gradeLabels = assignedClassList.map((c) =>
        c.section && c.section !== "General" ? `${c.gradeLevel} (Sec ${c.section})` : c.gradeLevel
      );
      const gradeStr = gradeLabels.length > 0 ? Array.from(new Set(gradeLabels)).join(", ") : (teacherStudentData?.gradeLevel || "General");

      setStudents(uniqueList);
      setTeacherMeta({
        teacherName: teacherStudentData?.teacherName || teacher.name || "Instructor",
        gradeLevel: gradeStr,
        totalEnrolled: uniqueList.length,
      });
    } catch (err) {
      console.error("Error loading teacher students:", err);
      toast.error("Failed to load students for this teacher.");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [teacher]);

  // Automatically fetch student roster whenever the modal opens or teacher changes
  useEffect(() => {
    if (isOpen && teacher?.id) {
      loadTeacherStudents();
    } else if (!isOpen) {
      setStudents([]);
      setTeacherMeta(null);
    }
  }, [isOpen, teacher?.id, loadTeacherStudents]);

  // Derived filtered students list based on search query
  const filteredStudents = useMemo(() => {
    if (!Array.isArray(students)) return [];
    const q = searchQuery.toLowerCase().trim();
    if (!q) return students;

    return students.filter((s) => {
      const name = String(s.fullname || s.name || "").toLowerCase();
      const id = String(s.studentId || s.id || "").toLowerCase();
      const grade = String(s.gradeLevel || "").toLowerCase();
      const section = String(s.section || "").toLowerCase();
      return name.includes(q) || id.includes(q) || grade.includes(q) || section.includes(q);
    });
  }, [students, searchQuery]);

  // Export roster to PDF Slip
  const handleExportPdf = () => {
    const listToExport = filteredStudents && filteredStudents.length > 0 ? filteredStudents : students;
    if (!listToExport || listToExport.length === 0) {
      toast.warning("No students available to export.");
      return;
    }

    setExportingPdf(true);
    try {
      const teacherName = teacher?.name || teacherMeta?.teacherName || "Instructor";
      const filename = generateTeacherStudentsSlipPdf(teacher, listToExport, teacherMeta);
      toast.success(`Generated and downloaded student roster PDF: ${filename}`);
    } catch (err) {
      console.error("Failed to export PDF:", err);
      toast.error("Failed to generate PDF slip.");
    } finally {
      setExportingPdf(false);
    }
  };

  if (!isOpen || !teacher) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className={`w-full max-w-4xl max-h-[90vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden transition-all duration-200 ${isDarkMode
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
                  <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${isDarkMode ? "bg-white/5 border-white/10 text-slate-300" : "bg-slate-100 border-slate-200 text-slate-700"
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
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${isDarkMode
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
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${isDarkMode
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
        <div className={`p-4 sm:px-7 border-b border-inherit flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isDarkMode ? "bg-white/[0.02]" : "bg-slate-50/80"
          }`}>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Assigned Students:
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${students.length > 0
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
                className={`w-full pl-8 pr-3 py-1.5 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition ${isDarkMode
                    ? "bg-[#081226] border-white/10 text-slate-100 placeholder:text-slate-500"
                    : "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400"
                  }`}
              />
            </div>

            {/* Export PDF Button */}
            <button
              type="button"
              onClick={handleExportPdf}
              disabled={students.length === 0 || exportingPdf}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow disabled:opacity-50 cursor-pointer"
              title="Generate and download student roster PDF slip"
            >
              {exportingPdf ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span className="hidden sm:inline">Exporting PDF...</span>
                </>
              ) : (
                <>
                  <FileText className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Export PDF</span>
                </>
              )}
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
          ) : !filteredStudents || filteredStudents.length === 0 ? (
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
              <thead className={`text-[11px] font-semibold uppercase tracking-wider border-b sticky top-0 z-10 ${isDarkMode ? "bg-[#081226] border-white/10 text-slate-400" : "bg-slate-100 border-slate-200 text-slate-600"
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
                {filteredStudents?.map((student, idx) => (
                  <tr
                    key={student.id || `${student.studentId}-${idx}`}
                    className={`transition-colors ${isDarkMode ? "hover:bg-white/[0.02]" : "hover:bg-slate-50"
                      }`}
                  >
                    <td className="py-3.5 px-6 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                      {idx + 1}
                    </td>
                    <td className="py-3.5 px-6 font-mono font-semibold">
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold border ${isDarkMode
                          ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
                          : "text-amber-700 bg-amber-50 border-amber-200"
                        }`}>
                        {student.studentId || "—"}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 font-semibold text-slate-900 dark:text-slate-100">
                      {student.fullname || student.name || "Unknown"}
                    </td>
                    <td className="py-3.5 px-6">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${isDarkMode ? "bg-sky-500/10 border-sky-500/20 text-sky-400" : "bg-sky-50 border-sky-200 text-sky-700"
                        }`}>
                        <GraduationCap className="w-3 h-3" />
                        <span>{student.gradeLevel || "General"} (Sec {student.section || "A"})</span>
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
        <div className={`p-4 sm:px-7 border-t border-inherit flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2 ${isDarkMode ? "bg-white/[0.01]" : "bg-slate-50"
          }`}>
          <div>
            Showing <span className="font-semibold text-slate-200 dark:text-slate-100">{filteredStudents?.length || 0}</span> of{" "}
            <span className="font-semibold text-slate-200 dark:text-slate-100">{students?.length || 0}</span> students
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${isDarkMode
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
