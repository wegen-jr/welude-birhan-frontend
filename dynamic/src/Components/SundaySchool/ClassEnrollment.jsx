import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import {
  GraduationCap,
  BookOpen,
  PlusCircle,
  ListFilter,
  CheckCircle,
  Loader2,
  User,
  Calendar,
  Tag,
  ShieldCheck
} from "lucide-react";
import { sundaySchoolService } from "../../services/educationhub/sundaySchoolService";

export default function ClassEnrollment({
  studentData,
  onEnrollmentSuccess,
  isDarkMode = true
}) {
  const [classes, setClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(false);

  // Selection mode: 'select' (existing class) or 'create' (new class)
  const [classMode, setClassMode] = useState("select");
  const [selectedClassId, setSelectedClassId] = useState("");

  // New class creation fields
  const [newGradeLevel, setNewGradeLevel] = useState("");
  const [newSection, setNewSection] = useState("");
  const [creatingClass, setCreatingClass] = useState(false);

  // Enrollment fields
  const [formData, setFormData] = useState({
    gradeLevel: "",
    section: "",
    fullname: "",
    year: new Date().getFullYear().toString(),
    status: "ACTIVE"
  });

  const [submitting, setSubmitting] = useState(false);
  const [lastEnrolled, setLastEnrolled] = useState(null);

  const fetchClasses = useCallback(async () => {
    setLoadingClasses(true);
    try {
      const data = await sundaySchoolService.getClasses();
      setClasses(data || []);
      // If we already have classes and none selected, auto-select first one if in select mode
      if (data && data.length > 0 && !selectedClassId) {
        const first = data[0];
        setSelectedClassId(first.id);
        setFormData(prev => ({
          ...prev,
          gradeLevel: first.gradeLevel,
          section: first.section,
        }));
      }
    } catch (err) {
      console.error("Failed to load classes:", err);
    } finally {
      setLoadingClasses(false);
    }
  }, [selectedClassId]);

  // Fetch classes on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchClasses();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchClasses]);

  // When studentData changes, pre-fill fullname if available
  useEffect(() => {
    if (!studentData) return;
    const timer = setTimeout(() => {
      const name = studentData.fullname || studentData.full_name || studentData.name || "";
      setFormData(prev => ({
        ...prev,
        fullname: name || prev.fullname,
      }));
    }, 0);
    return () => clearTimeout(timer);
  }, [studentData]);

  const handleSelectClass = (e) => {
    const classId = e.target.value;
    setSelectedClassId(classId);
    const found = classes.find(c => String(c.id) === String(classId));
    if (found) {
      setFormData(prev => ({
        ...prev,
        gradeLevel: found.gradeLevel,
        section: found.section,
      }));
    }
  };

  const handleCreateNewClass = async (e) => {
    e.preventDefault();
    if (!newGradeLevel.trim() || !newSection.trim()) {
      toast.error("Please enter both Grade Level and Section for the new class.");
      return;
    }

    setCreatingClass(true);
    try {
      const created = await sundaySchoolService.createClass({
        gradeLevel: newGradeLevel.trim(),
        section: newSection.trim(),
      });
      toast.success(`Class ${newGradeLevel} - Section ${newSection} created successfully!`);

      // Refresh class list and select the new one
      await fetchClasses();
      if (created?.id) {
        setSelectedClassId(created.id);
      }
      setFormData(prev => ({
        ...prev,
        gradeLevel: newGradeLevel.trim(),
        section: newSection.trim(),
      }));
      setClassMode("select");
      setNewGradeLevel("");
      setNewSection("");
    } catch (err) {
      toast.error(err.message || "Failed to create class.");
    } finally {
      setCreatingClass(false);
    }
  };

  const handleEnrollSubmit = async (e) => {
    e.preventDefault();

    if (!studentData) {
      toast.error("Please generate or select a Student ID in Step 1 first.");
      return;
    }

    const studentId = studentData.studentId || studentData.student_id;
    const memberId = studentData.memberId || studentData.member_id;

    if (!studentId || !memberId) {
      toast.error("Invalid student profile data. Please re-run Step 1.");
      return;
    }

    const gradeLevel = formData.gradeLevel?.trim();
    const section = formData.section?.trim();
    const fullname = formData.fullname?.trim();
    const year = Number(formData.year);

    if (!gradeLevel || !section) {
      toast.error("Please select or specify a valid class (Grade Level and Section).");
      return;
    }

    if (!fullname) {
      toast.error("Please provide the student's full name.");
      return;
    }

    if (!year || isNaN(year)) {
      toast.error("Please enter a valid academic year (e.g. 2026).");
      return;
    }

    setSubmitting(true);
    try {
      // Strictly adhere to CreateClassEnrollmentDto: do NOT send classId or class_id
      const payload = {
        gradeLevel,
        section,
        memberId: Number(memberId),
        studentId,
        fullname,
        year,
        status: formData.status || "ACTIVE"
      };

      // Temporary verification log of exact payload object right before API request
      console.log("[ClassEnrollment Component] Exact student enrollment payload being submitted:", payload);

      const result = await sundaySchoolService.enrollStudent(payload);

      const enrolledObj = {
        id: result?.id || `enr-${Date.now()}`,
        classId: result?.classId || selectedClassId,
        studentId,
        memberId: Number(memberId),
        fullname,
        gradeLevel,
        section,
        year,
        status: formData.status || "ACTIVE",
        enrolledAt: result?.enrolledAt || new Date().toISOString()
      };

      setLastEnrolled(enrolledObj);
      toast.success(`Successfully enrolled ${fullname} into ${gradeLevel} (${section})!`);

      if (onEnrollmentSuccess) {
        onEnrollmentSuccess(enrolledObj);
      }
    } catch (err) {
      toast.error(err.message || "Failed to enroll student.");
    } finally {
      setSubmitting(false);
    }
  };

  const studentIdVal = studentData?.studentId || studentData?.student_id;
  const memberIdVal = studentData?.memberId || studentData?.member_id;

  if (!studentData) {
    return (
      <div className={`rounded-2xl border p-6 flex flex-col items-center justify-center text-center transition-all min-h-[380px] ${isDarkMode
          ? "bg-[#0b1b3d]/30 border-dashed border-white/10 text-slate-400"
          : "bg-slate-50 border-dashed border-slate-300 text-slate-500"
        }`}>
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4">
          <GraduationCap className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
          Step 2: Class Setup & Enrollment Locked
        </h3>
        <p className="text-xs max-w-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
          Please complete <span className="text-amber-500 dark:text-amber-400 font-semibold">Step 1: Generate Student ID</span> on the left to unlock class selection and finalize enrollment.
        </p>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          <span>Awaiting Student ID</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border p-6 transition-all shadow-sm ${isDarkMode
        ? "bg-[#0b1b3d]/60 border-white/10 text-slate-100"
        : "bg-white border-slate-200 text-slate-800"
      }`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-inherit">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-sm">
            2
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Step 2: Class Selection & Enrollment</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Assign the student to an existing class or create a new class
            </p>
          </div>
        </div>
        <GraduationCap className="w-5 h-5 text-amber-500/70" />
      </div>

      {/* Target Student Identity Banner */}
      <div className={`p-3 rounded-xl mb-5 flex flex-wrap items-center justify-between gap-3 text-xs border ${isDarkMode
          ? "bg-white/5 border-white/10"
          : "bg-slate-50 border-slate-200"
        }`}>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span className="text-slate-600 dark:text-slate-400">Enrolling:</span>
          <span className="font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
            {studentIdVal}
          </span>
        </div>
        <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400">
          <span>Member ID: <strong className="text-slate-800 dark:text-slate-200">{memberIdVal}</strong></span>
          {studentData.phoneNumber && (
            <span>Phone: <strong className="text-slate-800 dark:text-slate-200">{studentData.phoneNumber}</strong></span>
          )}
        </div>
      </div>

      {/* Class Selection or Creation Tabs */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Class Assignment Mode
          </label>
          <div className="flex rounded-lg p-0.5 border border-inherit bg-slate-100 dark:bg-white/5 text-xs">
            <button
              type="button"
              onClick={() => setClassMode("select")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all font-medium ${classMode === "select"
                  ? "bg-amber-500 text-slate-950 font-bold shadow"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Select Class</span>
            </button>
            <button
              type="button"
              onClick={() => setClassMode("create")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all font-medium ${classMode === "create"
                  ? "bg-amber-500 text-slate-950 font-bold shadow"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Create New Class</span>
            </button>
          </div>
        </div>

        {/* Existing Class Select */}
        {classMode === "select" && (
          <div>
            <div className="relative">
              <select
                disabled={loadingClasses || classes.length === 0}
                value={selectedClassId}
                onChange={handleSelectClass}
                className={`w-full px-4 py-2.5 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/50 border appearance-none font-medium ${isDarkMode
                    ? "bg-[#081226] border-white/10 text-slate-100"
                    : "bg-white border-slate-300 text-slate-900"
                  }`}
              >
                {classes.length === 0 ? (
                  <option value="">No classes found (Create one using tab above)</option>
                ) : (
                  classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.gradeLevel} — Section {cls.section}
                    </option>
                  ))
                )}
              </select>
            </div>
            {classes.length === 0 && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1.5 font-medium">
                No active classes yet. Switch to "Create New Class" to set one up.
              </p>
            )}
          </div>
        )}

        {/* Create New Class Inline Form */}
        {classMode === "create" && (
          <div className={`p-4 rounded-xl border space-y-3 ${isDarkMode ? "bg-amber-500/5 border-amber-500/20" : "bg-amber-50/70 border-amber-200"
            }`}>
            <div className="flex items-center justify-between text-xs text-amber-600 dark:text-amber-400 font-semibold">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" /> New Class Details
              </span>
              <span className="font-mono text-[10px]">POST /class</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1 font-medium">Grade Level</label>
                <input
                  type="text"
                  placeholder="e.g. Grade 1 or Grade 10"
                  value={newGradeLevel}
                  onChange={(e) => setNewGradeLevel(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg text-xs border focus:outline-none focus:ring-1 focus:ring-amber-500 ${isDarkMode ? "bg-white/5 border-white/10 text-white placeholder:text-slate-500" : "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400"
                    }`}
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1 font-medium">Section</label>
                <input
                  type="text"
                  placeholder="e.g. A or B"
                  value={newSection}
                  onChange={(e) => setNewSection(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg text-xs border focus:outline-none focus:ring-1 focus:ring-amber-500 ${isDarkMode ? "bg-white/5 border-white/10 text-white placeholder:text-slate-500" : "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400"
                    }`}
                />
              </div>
            </div>
            <button
              type="button"
              disabled={creatingClass || !newGradeLevel.trim() || !newSection.trim()}
              onClick={handleCreateNewClass}
              className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
            >
              {creatingClass ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Creating Class...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Save & Select Class</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Main Enrollment Form */}
      <form onSubmit={handleEnrollSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Full Name */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-slate-400">
              Student Full Name <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={formData.fullname}
                onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                placeholder="Full Legal Name"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/50 border ${isDarkMode
                    ? "bg-white/5 border-white/10 text-slate-100 placeholder:text-slate-500 focus:bg-white/10"
                    : "bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:bg-white"
                  }`}
              />
            </div>
          </div>

          {/* Academic Year */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-slate-400">
              Academic Year <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Calendar className="w-4 h-4" />
              </div>
              <input
                type="number"
                required
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/50 border ${isDarkMode
                    ? "bg-white/5 border-white/10 text-slate-100 placeholder:text-slate-500"
                    : "bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400"
                  }`}
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-slate-400">
              Enrollment Status <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Tag className="w-4 h-4" />
              </div>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/50 border font-medium ${isDarkMode
                    ? "bg-[#081226] border-white/10 text-slate-100"
                    : "bg-white border-slate-300 text-slate-900"
                  }`}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="GRADUATED">GRADUATED</option>
                <option value="SUSPENDED">SUSPENDED</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting || !formData.fullname.trim() || !formData.gradeLevel}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm text-slate-950 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-amber-500/10 active:scale-[0.99] mt-2"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Enrolling Student in Class...</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              <span>Complete Student Enrollment</span>
            </>
          )}
        </button>
      </form>

      {/* Confirmation feedback */}
      {lastEnrolled && (
        <div className={`mt-4 p-3 rounded-xl border flex items-center justify-between text-xs ${isDarkMode ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-emerald-50 border-emerald-200 text-emerald-700"
          }`}>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              Enrolled <strong>{lastEnrolled.fullname}</strong> ({lastEnrolled.studentId}) in <strong>{lastEnrolled.gradeLevel} - {lastEnrolled.section}</strong>.
            </span>
          </div>
          <span className="text-[10px] opacity-75">
            {new Date(lastEnrolled.enrolledAt).toLocaleTimeString()}
          </span>
        </div>
      )}
    </div>
  );
}
