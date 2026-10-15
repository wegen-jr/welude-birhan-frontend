import { useState, useMemo } from "react";
import { toast } from "react-toastify";
import { 
  Search, 
  Filter, 
  RefreshCw, 
  Users, 
  Mail, 
  Phone, 
  School, 
  Trash2, 
  Edit3, 
  Plus, 
  Copy, 
  Check, 
  AlertTriangle, 
  GraduationCap, 
  Building2
} from "lucide-react";
import { teacherService } from "../../services/teacherService";
import TeacherStudentsModal from "./TeacherStudentsModal";

export default function TeacherDirectoryTable({
  teachers = [],
  loading = false,
  onRefresh,
  onAssignClass,
  onEditTeacher,
  onTeacherDeleted,
  isDarkMode = true,
  isAuthorized = true,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [assignmentFilter, setAssignmentFilter] = useState("ALL"); // ALL, ASSIGNED, UNASSIGNED
  const [copiedId, setCopiedId] = useState(null);
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewingTeacherStudents, setViewingTeacherStudents] = useState(null);

  // Derive unique departments from existing teachers
  const departments = useMemo(() => {
    const set = new Set();
    teachers.forEach((t) => {
      if (t.department) set.add(t.department);
    });
    return Array.from(set).sort();
  }, [teachers]);

  // Filtered teachers list
  const filteredTeachers = useMemo(() => {
    return teachers.filter((t) => {
      // 1. Search Query
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || (
        (t.name && t.name.toLowerCase().includes(q)) ||
        (t.email && t.email.toLowerCase().includes(q)) ||
        (t.phone && t.phone.toLowerCase().includes(q)) ||
        (String(t.id).includes(q)) ||
        (t.department && t.department.toLowerCase().includes(q))
      );

      // 2. Department Filter
      const matchesDept = selectedDept === "ALL" || t.department === selectedDept;

      // 3. Assignment Filter
      const assignedCount = Array.isArray(t.assignedClasses) ? t.assignedClasses.length : 0;
      const matchesAssignment = 
        assignmentFilter === "ALL" ||
        (assignmentFilter === "ASSIGNED" && assignedCount > 0) ||
        (assignmentFilter === "UNASSIGNED" && assignedCount === 0);

      return matchesSearch && matchesDept && matchesAssignment;
    });
  }, [teachers, searchQuery, selectedDept, assignmentFilter]);

  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(key);
    toast.info(`Copied "${text}" to clipboard.`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const confirmDelete = async () => {
    if (!deleteCandidate) return;
    setIsDeleting(true);
    try {
      await teacherService.deleteTeacher(deleteCandidate.id);
      toast.success(`Teacher "${deleteCandidate.name}" removed successfully.`);
      if (onTeacherDeleted) {
        onTeacherDeleted(deleteCandidate.id);
      }
      setDeleteCandidate(null);
    } catch (err) {
      console.error("Failed to delete teacher:", err);
      toast.error(err.message || "Failed to delete teacher.");
    } finally {
      setIsDeleting(false);
    }
  };

  const getInitials = (name = "") => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase() || "TC";
  };

  return (
    <div className={`rounded-2xl border transition-all shadow-sm overflow-hidden ${
      isDarkMode 
        ? "bg-[#0b1b3d]/60 border-white/10 text-slate-100" 
        : "bg-white border-slate-200 text-slate-800"
    }`}>
      {/* Top Header & Search/Filter Bar */}
      <div className="p-5 border-b border-inherit space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-serif font-bold tracking-tight">Teacher Directory</h3>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                isDarkMode 
                  ? "bg-amber-500/10 border-amber-500/20 text-amber-400" 
                  : "bg-amber-50 border-amber-200 text-amber-700"
              }`}>
                {teachers.length} Total
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Verified Sunday School instructors, departmental assignments, and active classroom links
            </p>
          </div>

          <button
            onClick={onRefresh}
            disabled={loading}
            className={`self-start sm:self-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
              isDarkMode 
                ? "bg-white/5 border-white/10 hover:bg-white/10 text-slate-300" 
                : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-amber-500" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
          {/* Search Input */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name, email, phone, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition ${
                isDarkMode 
                  ? "bg-[#081226] border-white/10 text-slate-100 placeholder-slate-500" 
                  : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400"
              }`}
            />
          </div>

          {/* Department Filter */}
          <div className="sm:col-span-4 relative">
            <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition ${
                isDarkMode 
                  ? "bg-[#081226] border-white/10 text-slate-100" 
                  : "bg-slate-50 border-slate-200 text-slate-800"
              }`}
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Class Assignment Filter */}
          <div className="sm:col-span-3 relative">
            <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <select
              value={assignmentFilter}
              onChange={(e) => setAssignmentFilter(e.target.value)}
              className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition ${
                isDarkMode 
                  ? "bg-[#081226] border-white/10 text-slate-100" 
                  : "bg-slate-50 border-slate-200 text-slate-800"
              }`}
            >
              <option value="ALL">All Statuses</option>
              <option value="ASSIGNED">Assigned to Class</option>
              <option value="UNASSIGNED">Unassigned</option>
            </select>
          </div>
        </div>
      </div>

      {/* Directory Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className={`border-b transition-colors uppercase tracking-wider text-[11px] font-semibold ${
              isDarkMode 
                ? "bg-white/[0.02] border-white/10 text-slate-400" 
                : "bg-slate-100/80 border-slate-200 text-slate-600"
            }`}>
              <th className="py-4 px-6 font-semibold">Teacher</th>
              <th className="py-4 px-6 font-semibold">Contact Info</th>
              <th className="py-4 px-6 font-semibold">Department</th>
              <th className="py-4 px-6 font-semibold">Assigned Classes</th>
              <th className="py-4 px-6 font-semibold text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-inherit">
            {loading ? (
              <tr>
                <td colSpan="5" className="py-12 text-center text-slate-500 dark:text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
                    <span className="text-xs">Loading teachers directory...</span>
                  </div>
                </td>
              </tr>
            ) : filteredTeachers.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-12 text-center text-slate-500 dark:text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Users className="w-8 h-8 text-slate-400" />
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">No teachers found</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {teachers.length === 0 
                        ? "Register your first Sunday School teacher using the form above." 
                        : "Try adjusting your search query or filter settings."}
                    </span>
                    {(searchQuery || selectedDept !== "ALL" || assignmentFilter !== "ALL") && (
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setSelectedDept("ALL");
                          setAssignmentFilter("ALL");
                        }}
                        className="mt-2 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
                      >
                        Clear All Filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredTeachers.map((teacher) => {
                const assignedList = Array.isArray(teacher.assignedClasses) ? teacher.assignedClasses : [];
                return (
                  <tr 
                    key={teacher.id}
                    onClick={() => setViewingTeacherStudents(teacher)}
                    className={`transition-colors group cursor-pointer ${
                      isDarkMode 
                        ? "hover:bg-white/[0.04]" 
                        : "hover:bg-amber-50/50"
                    }`}
                    title={`Click to view students assigned to ${teacher.name}`}
                  >
                    {/* Teacher Column (Avatar, Name, ID) */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 text-amber-500 flex items-center justify-center font-bold text-xs shrink-0">
                          {getInitials(teacher.name)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                            <span>{teacher.name}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                            ID: #{teacher.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Contact Info (Phone & Email with Quick Copy) */}
                    <td className="py-4 px-6 space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-mono text-[11px]">{teacher.phone || "—"}</span>
                        {teacher.phone && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(teacher.phone, `phone-${teacher.id}`);
                            }}
                            className="text-slate-400 hover:text-amber-500 transition ml-1 cursor-pointer"
                            title="Copy phone number"
                          >
                            {copiedId === `phone-${teacher.id}` ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-[11px] truncate max-w-[180px]">{teacher.email || "—"}</span>
                        {teacher.email && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(teacher.email, `email-${teacher.id}`);
                            }}
                            className="text-slate-400 hover:text-amber-500 transition ml-1 cursor-pointer"
                            title="Copy email"
                          >
                            {copiedId === `email-${teacher.id}` ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Department Badge */}
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border ${
                        isDarkMode 
                          ? "bg-amber-500/10 border-amber-500/20 text-amber-400" 
                          : "bg-amber-50 border-amber-200 text-amber-700"
                      }`}>
                        <Building2 className="w-3 h-3" />
                        <span>{teacher.department || "General"}</span>
                      </span>
                    </td>

                    {/* Assigned Classes */}
                    <td className="py-4 px-6">
                      {assignedList.length === 0 ? (
                        <div className="flex items-center gap-2">
                          <span className={`text-[11px] px-2.5 py-0.5 rounded-full border ${
                            isDarkMode 
                              ? "bg-slate-500/10 border-slate-500/20 text-slate-400" 
                              : "bg-slate-100 border-slate-200 text-slate-600"
                          }`}>
                            Unassigned
                          </span>

                          {isAuthorized && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onAssignClass && onAssignClass(teacher);
                              }}
                              className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                            >
                              <span>+ Assign</span>
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-wrap items-center gap-1.5 max-w-xs">
                          {assignedList.map((c) => (
                            <span
                              key={c.id || c.classId || Math.random()}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${
                                isDarkMode 
                                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                                  : "bg-emerald-50 border-emerald-200 text-emerald-700"
                              }`}
                            >
                              <GraduationCap className="w-3 h-3" />
                              <span>{c.gradeLevel} - Sec {c.section}</span>
                            </span>
                          ))}

                          {isAuthorized && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onAssignClass && onAssignClass(teacher);
                              }}
                              className="p-1 text-slate-400 hover:text-amber-500 transition cursor-pointer"
                              title="Manage class assignments"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Actions Column */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View Students Action Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewingTeacherStudents(teacher);
                          }}
                          className={`p-2 rounded-xl border transition cursor-pointer ${
                            isDarkMode 
                              ? "border-white/10 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/20" 
                              : "border-slate-200 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50"
                          }`}
                          title="View Enrolled Students (Class Roster)"
                        >
                          <Users className="w-3.5 h-3.5" />
                        </button>

                        {isAuthorized ? (
                          <>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onAssignClass && onAssignClass(teacher);
                              }}
                              className={`p-2 rounded-xl border transition cursor-pointer ${
                                isDarkMode 
                                  ? "border-white/10 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/20" 
                                  : "border-slate-200 text-slate-600 hover:text-amber-600 hover:bg-amber-50"
                              }`}
                              title="Assign to Sunday School Class"
                            >
                              <School className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditTeacher && onEditTeacher(teacher);
                              }}
                              className={`p-2 rounded-xl border transition cursor-pointer ${
                                isDarkMode 
                                  ? "border-white/10 text-slate-400 hover:text-sky-400 hover:bg-sky-500/10 hover:border-sky-500/20" 
                                  : "border-slate-200 text-slate-600 hover:text-sky-600 hover:bg-sky-50"
                              }`}
                              title="Edit Teacher Profile"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteCandidate(teacher);
                              }}
                              className={`p-2 rounded-xl border transition cursor-pointer ${
                                isDarkMode 
                                  ? "border-white/10 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20" 
                                  : "border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50"
                              }`}
                              title="Delete Teacher"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <span className="text-[11px] text-slate-500 italic ml-1">Read-only</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Directory Footer / Counter Summary */}
      <div className={`p-4 border-t border-inherit flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2 ${
        isDarkMode ? "bg-white/[0.01]" : "bg-slate-50"
      }`}>
        <div>
          Showing <span className="font-semibold text-slate-200">{filteredTeachers.length}</span> of{" "}
          <span className="font-semibold text-slate-200">{teachers.length}</span> registered instructors
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Assigned</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            <span>Unassigned</span>
          </span>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl transition-all ${
            isDarkMode 
              ? "bg-[#0b1b3d] border-white/10 text-slate-100" 
              : "bg-white border-slate-200 text-slate-800"
          }`}>
            <div className="flex items-center gap-3 text-rose-500 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-base">Delete Teacher Profile</h4>
                <p className="text-xs text-slate-400">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              Are you sure you want to delete <span className="font-bold text-amber-500">{deleteCandidate.name}</span> (ID: #{deleteCandidate.id})? This will permanently remove the teacher record and clear any linked classroom assignments.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                disabled={isDeleting}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border transition ${
                  isDarkMode 
                    ? "bg-white/5 border-white/10 hover:bg-white/10 text-slate-300" 
                    : "bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700"
                }`}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white transition shadow disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Nested Student Information Modal */}
      {viewingTeacherStudents && (
        <TeacherStudentsModal
          isOpen={Boolean(viewingTeacherStudents)}
          teacher={viewingTeacherStudents}
          onClose={() => setViewingTeacherStudents(null)}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
}
