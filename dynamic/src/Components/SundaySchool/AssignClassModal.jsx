import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  X,
  Plus,
  Trash2,
  Loader2,
  School,
  GraduationCap,
  BookOpen
} from "lucide-react";
import { teacherService } from "../../services/educationhub/teacherService";
import { sundaySchoolService } from "../../services/educationhub/sundaySchoolService";
import { courseService } from "../../services/educationhub/courseService";

export default function AssignClassModal({
  teacher,
  isOpen,
  onClose,
  onAssignmentUpdated,
  isDarkMode = true,
  isAuthorized = true,
}) {
  const [availableClasses, setAvailableClasses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [backendAssignments, setBackendAssignments] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [loadingData, setLoadingData] = useState(false);
  const [assignedClasses, setAssignedClasses] = useState(() => teacher?.assignedClasses || []);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    async function fetchData() {
      setLoadingData(true);
      try {
        const [classList, courseList, assignmentList] = await Promise.all([
          sundaySchoolService.getClasses().catch(() => []),
          courseService.getCourses().catch(() => []),
          teacherService.getTeacherAssignments().catch(() => []),
        ]);
        if (isMounted) {
          setAvailableClasses(Array.isArray(classList) ? classList : []);
          const courses = Array.isArray(courseList) ? courseList : [];
          setAvailableCourses(courses);
          if (courses.length > 0 && !selectedCourseId) {
            setSelectedCourseId(String(courses[0].id));
          }
          setBackendAssignments(Array.isArray(assignmentList) ? assignmentList : []);
        }
      } catch {
        toast.error("Could not load Sunday School classes or curriculum courses.");
      } finally {
        if (isMounted) setLoadingData(false);
      }
    }

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen || !teacher) return null;

  const assignedIds = new Set(assignedClasses.map((c) => String(c.id || c.classId)));
  const unassignedOptions = availableClasses.filter(
    (c) => !assignedIds.has(String(c.id))
  );

  const handleAssign = async () => {
    if (!isAuthorized) {
      toast.error("Unauthorized: Only Education Hub Leaders or Admins can assign classes.");
      return;
    }

    if (!selectedClassId) {
      toast.error("Please select a class to assign.");
      return;
    }

    if (!selectedCourseId) {
      toast.error("Please select a course for this class assignment.");
      return;
    }

    const classObj = availableClasses.find((c) => String(c.id) === String(selectedClassId));
    if (!classObj) return;

    const courseObj = availableCourses.find((c) => String(c.id) === String(selectedCourseId));
    if (!courseObj) {
      toast.error("Selected course could not be found.");
      return;
    }

    setActionLoading(true);
    try {
      // 1. Post assignment to live backend
      await teacherService.assignTeacherToClass({
        teacherId: parseInt(teacher.id, 10),
        teacherName: String(teacher.name).trim(),
        courseId: parseInt(courseObj.id, 10),
        courseName: String(courseObj.courseName || courseObj.name || "").trim(),
        gradeLevel: String(classObj.gradeLevel).trim(),
        section: classObj.section || "A",
        classId: classObj.id,
      });

      // 2. Synchronize local representation
      const updated = teacherService.assignClassToTeacher(teacher.id, classObj);
      setAssignedClasses(updated);
      setSelectedClassId("");
      toast.success(`Assigned ${teacher.name} to ${classObj.gradeLevel} - Section ${classObj.section} (${courseObj.courseName})`);

      // Refresh assignments
      const freshAssignments = await teacherService.getTeacherAssignments().catch(() => []);
      setBackendAssignments(freshAssignments);

      if (onAssignmentUpdated) {
        onAssignmentUpdated({
          ...teacher,
          assignedClasses: updated,
        });
      }
    } catch (err) {
      console.error("Assign class error:", err);
      toast.error(err.message || "Failed to assign class.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnassign = async (classId, className, gradeLevel) => {
    if (!isAuthorized) {
      toast.error("Unauthorized to modify class assignments.");
      return;
    }

    setActionLoading(true);
    try {
      // Find matching backend assignment if exists
      const targetGrade = String(gradeLevel || className || "").toLowerCase();
      const match = backendAssignments.find((ba) => {
        const baTeacherId = String(ba.teacherId || ba.teacher_id || "");
        const baGrade = String(ba.gradeLevel || ba.grade_level || "").toLowerCase();
        return baTeacherId === String(teacher.id) && (baGrade === targetGrade || targetGrade.includes(baGrade));
      });

      if (match?.id) {
        await teacherService.unassignTeacherAssignment(match.id, teacher.id, classId);
      } else {
        teacherService.unassignClassFromTeacher(teacher.id, classId);
      }

      const updated = teacherService.unassignClassFromTeacher(teacher.id, classId);
      setAssignedClasses(updated);
      toast.info(`Removed assignment for ${className || 'class'}.`);

      if (onAssignmentUpdated) {
        onAssignmentUpdated({
          ...teacher,
          assignedClasses: updated,
        });
      }
    } catch (err) {
      console.error("Unassign class error:", err);
      toast.error(err.message || "Failed to unassign class.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className={`w-full max-w-lg rounded-2xl border p-6 shadow-2xl transition-all relative ${isDarkMode
            ? "bg-[#0b1b3d] border-white/10 text-slate-100"
            : "bg-white border-slate-200 text-slate-800"
          }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-inherit">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
              <School className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold tracking-tight text-slate-900 dark:text-slate-100">Class Assignments</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Manage assigned Sunday School classrooms for <span className="font-semibold text-amber-500">{teacher.name}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${isDarkMode
                ? "border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/5"
                : "border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100"
              }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Teacher Info Pill */}
        <div className={`mt-4 p-3 rounded-xl border flex items-center justify-between text-xs ${isDarkMode ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-200"
          }`}>
          <div>
            <span className="text-slate-600 dark:text-slate-400 font-medium">Department: </span>
            <span className="font-semibold text-amber-600 dark:text-amber-400">{teacher.department}</span>
          </div>
          <div>
            <span className="text-slate-600 dark:text-slate-400 font-medium">Teacher ID: </span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">#{teacher.id}</span>
          </div>
        </div>

        {/* Currently Assigned Classes List */}
        <div className="mt-5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
            Currently Assigned Classes ({assignedClasses.length})
          </label>

          {assignedClasses.length === 0 ? (
            <div className={`p-4 rounded-xl border text-center text-xs ${isDarkMode ? "bg-[#081226] border-white/5 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-600"
              }`}>
              No classes assigned yet. Use the selector below to link this teacher to a classroom.
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {assignedClasses.map((cls) => {
                const id = cls.id || cls.classId;
                const label = `${cls.gradeLevel} - Section ${cls.section}`;
                return (
                  <div
                    key={id}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs transition ${isDarkMode
                        ? "bg-[#081226] border-white/10 hover:border-amber-500/30"
                        : "bg-slate-50 border-slate-200 hover:border-amber-500/30"
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-amber-500" />
                      <span className="font-semibold">{label}</span>
                    </div>

                    <button
                      onClick={() => handleUnassign(id, label, cls.gradeLevel)}
                      disabled={actionLoading || !isAuthorized}
                      className="p-1 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition"
                      title="Remove class assignment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Assign New Class Section */}
        {isAuthorized && (
          <div className="mt-6 pt-5 border-t border-inherit">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
              Assign to New Sunday School Class
            </label>

            {loadingData ? (
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 py-2">
                <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                <span>Loading available classes and courses...</span>
              </div>
            ) : unassignedOptions.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 py-1">
                {availableClasses.length === 0
                  ? "No Sunday School classes exist yet. Create classes in Education Hub first."
                  : "All existing classes are already assigned to this teacher."}
              </p>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      Target Classroom Section
                    </label>
                    <select
                      value={selectedClassId}
                      onChange={(e) => setSelectedClassId(e.target.value)}
                      disabled={actionLoading}
                      className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition font-medium ${isDarkMode
                          ? "bg-[#081226] border-white/10 text-slate-100"
                          : "bg-white border-slate-300 text-slate-900"
                        }`}
                    >
                      <option value="">-- Select Class --</option>
                      {unassignedOptions.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.gradeLevel} - Section {cls.section}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      Curriculum Course to Teach
                    </label>
                    <select
                      value={selectedCourseId}
                      onChange={(e) => setSelectedCourseId(e.target.value)}
                      disabled={actionLoading}
                      className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition font-medium ${isDarkMode
                          ? "bg-[#081226] border-white/10 text-slate-100"
                          : "bg-white border-slate-300 text-slate-900"
                        }`}
                    >
                      <option value="">-- Select Subject/Course --</option>
                      {availableCourses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.courseName || c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleAssign}
                    disabled={!selectedClassId || !selectedCourseId || actionLoading}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {actionLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Assigning...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Assign to Class</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-inherit flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition ${isDarkMode
                ? "bg-white/5 border-white/10 hover:bg-white/10 text-slate-200"
                : "bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700"
              }`}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
