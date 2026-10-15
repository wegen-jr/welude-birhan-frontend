import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  ShieldAlert, 
  ChevronUp
} from "lucide-react";
import { teacherService } from "../../services/teacherService";
import TeacherRegistrationForm from "./TeacherRegistrationForm";
import TeacherDirectoryTable from "./TeacherDirectoryTable";
import AssignClassModal from "./AssignClassModal";
import EditTeacherModal from "./EditTeacherModal";

export default function TeacherManagement({ isDarkMode = true, initialShowForm = false }) {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(initialShowForm);
  const [assigningTeacher, setAssigningTeacher] = useState(null);
  const [editingTeacher, setEditingTeacher] = useState(null);

  // Check role authorization from localStorage
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  })();
  const userRole = user?.role || "";
  const isAuthorized = ["ADMIN", "EDUCATION_LEADER"].includes(userRole);

  const fetchTeachers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await teacherService.getTeachers();
      setTeachers(data || []);
    } catch (err) {
      console.error("Failed to fetch teachers:", err);
      toast.error(err.message || "Failed to load teachers directory.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function init() {
      setLoading(true);
      try {
        const data = await teacherService.getTeachers();
        if (isMounted) setTeachers(data || []);
      } catch (err) {
        console.error("Failed to fetch teachers:", err);
        toast.error(err.message || "Failed to load teachers directory.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    init();
    return () => {
      isMounted = false;
    };
  }, []);

  // Handle teacher newly created
  const handleTeacherCreated = (newTeacher) => {
    setTeachers((prev) => [newTeacher, ...prev]);
  };

  // Handle teacher deleted
  const handleTeacherDeleted = (deletedId) => {
    setTeachers((prev) => prev.filter((t) => Number(t.id) !== Number(deletedId)));
  };

  // Handle teacher updated
  const handleTeacherUpdated = (updatedTeacher) => {
    setTeachers((prev) =>
      prev.map((t) => (Number(t.id) === Number(updatedTeacher.id) ? updatedTeacher : t))
    );
  };

  // Quick stats
  const totalCount = teachers.length;
  const assignedCount = teachers.filter(
    (t) => Array.isArray(t.assignedClasses) && t.assignedClasses.length > 0
  ).length;
  const unassignedCount = totalCount - assignedCount;
  const uniqueDepts = new Set(teachers.map((t) => t.department).filter(Boolean)).size;

  return (
    <div className="space-y-6">
      {/* Top Banner / Section Header */}
      <div className={`p-6 sm:p-7 rounded-2xl border transition-all ${
        isDarkMode ? "bg-[#0b1b3d]/60 border-white/10" : "bg-white border-slate-200 shadow-sm"
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  Teacher Management
                </h2>
                {isAuthorized ? (
                  <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${
                    isDarkMode ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-emerald-50 border-emerald-200 text-emerald-700"
                  }`}>
                    <ShieldCheck className="w-3 h-3" />
                    <span>Authorized (Leader/Admin)</span>
                  </span>
                ) : (
                  <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${
                    isDarkMode ? "bg-slate-500/10 border-slate-500/20 text-slate-400" : "bg-slate-100 border-slate-200 text-slate-600"
                  }`}>
                    <ShieldAlert className="w-3 h-3" />
                    <span>Read-Only</span>
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                Onboard teachers, assign Sunday School classrooms, and monitor departmental faculty.
              </p>
            </div>
          </div>

          {isAuthorized && (
            <button
              onClick={() => setShowForm((prev) => !prev)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-[0.99] cursor-pointer ${
                showForm 
                  ? (isDarkMode ? "bg-white/10 text-slate-200 hover:bg-white/15" : "bg-slate-100 border border-slate-300 text-slate-800 hover:bg-slate-200")
                  : "bg-amber-500 hover:bg-amber-400 text-slate-950"
              }`}
            >
              {showForm ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  <span>Hide Registration Form</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>+ Register New Teacher</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Metric Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-inherit">
          <div className={`p-4 sm:p-5 rounded-xl border ${
            isDarkMode ? "bg-white/[0.02] border-white/5" : "bg-slate-50 border-slate-100"
          }`}>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Total Instructors
            </span>
            <span className="text-2xl font-bold font-serif text-amber-500 mt-1.5 block">
              {loading ? "—" : totalCount}
            </span>
          </div>

          <div className={`p-4 sm:p-5 rounded-xl border ${
            isDarkMode ? "bg-white/[0.02] border-white/5" : "bg-slate-50 border-slate-100"
          }`}>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Class Assigned
            </span>
            <span className="text-2xl font-bold font-serif text-emerald-500 dark:text-emerald-400 mt-1.5 block">
              {loading ? "—" : assignedCount}
            </span>
          </div>

          <div className={`p-4 sm:p-5 rounded-xl border ${
            isDarkMode ? "bg-white/[0.02] border-white/5" : "bg-slate-50 border-slate-100"
          }`}>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Unassigned
            </span>
            <span className="text-2xl font-bold font-serif text-sky-500 dark:text-sky-400 mt-1.5 block">
              {loading ? "—" : unassignedCount}
            </span>
          </div>

          <div className={`p-4 sm:p-5 rounded-xl border ${
            isDarkMode ? "bg-white/[0.02] border-white/5" : "bg-slate-50 border-slate-100"
          }`}>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Departments
            </span>
            <span className="text-2xl font-bold font-serif text-amber-500 mt-1.5 block">
              {loading ? "—" : uniqueDepts}
            </span>
          </div>
        </div>
      </div>


      {/* Collapsible / Toggleable Registration Form */}
      {showForm && isAuthorized && (
        <div className="animate-fadeIn">
          <TeacherRegistrationForm
            isDarkMode={isDarkMode}
            isAuthorized={isAuthorized}
            onTeacherCreated={handleTeacherCreated}
            onClose={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Teacher Directory Table */}
      <TeacherDirectoryTable
        teachers={teachers}
        loading={loading}
        onRefresh={fetchTeachers}
        onAssignClass={(teacher) => setAssigningTeacher(teacher)}
        onEditTeacher={(teacher) => setEditingTeacher(teacher)}
        onTeacherDeleted={handleTeacherDeleted}
        isDarkMode={isDarkMode}
        isAuthorized={isAuthorized}
      />

      {/* Modals */}
      {assigningTeacher && (
        <AssignClassModal
          key={assigningTeacher.id}
          teacher={assigningTeacher}
          isOpen={Boolean(assigningTeacher)}
          onClose={() => setAssigningTeacher(null)}
          onAssignmentUpdated={handleTeacherUpdated}
          isDarkMode={isDarkMode}
          isAuthorized={isAuthorized}
        />
      )}

      {editingTeacher && (
        <EditTeacherModal
          key={editingTeacher.id}
          teacher={editingTeacher}
          isOpen={Boolean(editingTeacher)}
          onClose={() => setEditingTeacher(null)}
          onTeacherUpdated={handleTeacherUpdated}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
}
