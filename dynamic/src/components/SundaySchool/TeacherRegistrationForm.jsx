import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { 
  UserPlus, 
  Mail, 
  Phone, 
  User, 
  Building2, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  BookOpen, 
  ShieldAlert, 
  X,
  RefreshCw
} from "lucide-react";
import { teacherService } from "../../services/teacherService";
import { sundaySchoolService } from "../../services/sundaySchoolService";

const COMMON_DEPARTMENTS = [
  "Spiritual Education",
  "Bible Study & Dogma",
  "Church History & Liturgy",
  "Geez Language & Zema",
  "Junior Sunday School",
  "Youth Fellowship Education",
  "Senior Bible Fellowship",
  "General Education",
];

export default function TeacherRegistrationForm({ 
  onTeacherCreated, 
  isDarkMode = true, 
  isAuthorized = true,
  onClose = null 
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "Spiritual Education",
    customDepartment: "",
    initialClassId: "",
  });

  const [availableClasses, setAvailableClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorBanner, setErrorBanner] = useState("");
  const [lastCreatedTeacher, setLastCreatedTeacher] = useState(null);

  // Load active classes for optional initial assignment
  useEffect(() => {
    let isMounted = true;
    async function loadClasses() {
      setLoadingClasses(true);
      try {
        const classes = await sundaySchoolService.getClasses();
        if (isMounted) {
          setAvailableClasses(Array.isArray(classes) ? classes : []);
        }
      } catch (err) {
        console.warn("Could not load classes for initial assignment dropdown:", err);
      } finally {
        if (isMounted) setLoadingClasses(false);
      }
    }
    loadClasses();
    return () => { isMounted = false; };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorBanner) setErrorBanner("");
  };

  const validate = () => {
    if (!formData.name.trim()) {
      return "Teacher full name is required.";
    }
    if (formData.name.trim().length < 3) {
      return "Full name must be at least 3 characters long.";
    }
    if (!formData.email.trim()) {
      return "Email address is required.";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      return "Please enter a valid email address (e.g., teacher@church.org).";
    }
    if (!formData.phone.trim()) {
      return "Phone number is required.";
    }
    const cleanPhone = formData.phone.trim();
    if (cleanPhone.length < 9) {
      return "Please enter a valid phone number (at least 9 digits).";
    }

    const dept = formData.department === "OTHER" 
      ? formData.customDepartment.trim() 
      : formData.department.trim();
    if (!dept) {
      return "Please specify the teacher's department.";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorBanner("");

    if (!isAuthorized) {
      const msg = "Unauthorized: Only Education Hub Leaders and Admins can register teachers.";
      setErrorBanner(msg);
      toast.error(msg);
      return;
    }

    const validationError = validate();
    if (validationError) {
      setErrorBanner(validationError);
      toast.error(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedDept = formData.department === "OTHER" 
        ? formData.customDepartment.trim() 
        : formData.department;

      // Find initial class object if selected
      const selectedClass = formData.initialClassId 
        ? availableClasses.find((c) => String(c.id) === String(formData.initialClassId))
        : null;

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        department: selectedDept,
        initialClass: selectedClass,
      };

      const newTeacher = await teacherService.createTeacher(payload);

      setLastCreatedTeacher(newTeacher);
      toast.success(`Teacher "${newTeacher.name}" successfully registered!`);

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        department: "Spiritual Education",
        customDepartment: "",
        initialClassId: "",
      });

      if (onTeacherCreated) {
        onTeacherCreated(newTeacher);
      }
    } catch (err) {
      console.error("Teacher registration error:", err);
      const errMsg = err.message || "Failed to register teacher. Please check your inputs.";
      setErrorBanner(errMsg);
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetSuccessState = () => {
    setLastCreatedTeacher(null);
  };

  if (!isAuthorized) {
    return (
      <div className={`p-6 rounded-2xl border ${
        isDarkMode ? "bg-rose-500/10 border-rose-500/20 text-rose-300" : "bg-rose-50 border-rose-200 text-rose-700"
      }`}>
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0" />
          <div>
            <h4 className="font-semibold text-sm">Restricted Access</h4>
            <p className="text-xs opacity-90 mt-0.5">
              Only Education Hub leaders and system administrators are authorized to register or modify teacher profiles.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border p-6 transition-all shadow-sm relative ${
      isDarkMode 
        ? "bg-[#0b1b3d]/60 border-white/10 text-slate-100" 
        : "bg-white border-slate-200 text-slate-800"
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between pb-4 mb-5 border-b border-inherit">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-serif font-bold tracking-tight">Register New Teacher</h2>
            <p className="text-xs text-slate-400">
              Create an official teacher profile and optionally assign an initial Sunday School class
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg border transition-colors ${
              isDarkMode 
                ? "border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/5" 
                : "border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            }`}
            title="Close form"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Success Feedback Card */}
      {lastCreatedTeacher && (
        <div className={`mb-6 p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
          isDarkMode ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" : "bg-emerald-50 border-emerald-200 text-emerald-800"
        }`}>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <p className="text-xs font-semibold">Teacher successfully registered!</p>
              <p className="text-xs opacity-90">
                <span className="font-bold">{lastCreatedTeacher.name}</span> (#{lastCreatedTeacher.id}) — {lastCreatedTeacher.department}
              </p>
            </div>
          </div>
          <button
            onClick={resetSuccessState}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition"
          >
            Register Another
          </button>
        </div>
      )}

      {/* Error Banner */}
      {errorBanner && (
        <div className={`mb-6 p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
          isDarkMode ? "bg-rose-500/10 border-rose-500/30 text-rose-300" : "bg-rose-50 border-rose-200 text-rose-700"
        }`}>
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-semibold">Registration Issue: </span>
              <span>{errorBanner}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="self-end sm:self-auto shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-200 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSubmitting ? "animate-spin" : ""}`} />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name & Phone Number (2 columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Full Name <span className="text-amber-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Teacher Dawit / መምህር ተስፋዬ"
                required
                disabled={isSubmitting}
                className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition font-medium ${
                  isDarkMode 
                    ? "bg-[#081226] border-white/10 text-slate-100 placeholder-slate-500" 
                    : "bg-white border-slate-300 text-slate-900 placeholder-slate-400"
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Phone Number <span className="text-amber-500">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. 0911223344 or +251911223344"
                required
                disabled={isSubmitting}
                className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition font-medium ${
                  isDarkMode 
                    ? "bg-[#081226] border-white/10 text-slate-100 placeholder-slate-500" 
                    : "bg-white border-slate-300 text-slate-900 placeholder-slate-400"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Email & Department (2 columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Email Address <span className="text-amber-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. teacher.smith@weludebirhan.org"
                required
                disabled={isSubmitting}
                className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition font-medium ${
                  isDarkMode 
                    ? "bg-[#081226] border-white/10 text-slate-100 placeholder-slate-500" 
                    : "bg-white border-slate-300 text-slate-900 placeholder-slate-400"
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Department / Discipline <span className="text-amber-500">*</span>
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                disabled={isSubmitting}
                className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition font-medium ${
                  isDarkMode 
                    ? "bg-[#081226] border-white/10 text-slate-100" 
                    : "bg-white border-slate-300 text-slate-900"
                }`}
              >
                {COMMON_DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
                <option value="OTHER">Other (Custom Department)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Custom Department Write-In (if "OTHER" selected) */}
        {formData.department === "OTHER" && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Custom Department Name <span className="text-amber-500">*</span>
            </label>
            <input
              type="text"
              name="customDepartment"
              value={formData.customDepartment}
              onChange={handleChange}
              placeholder="e.g. Traditional Hymnography (Deggwa)"
              required
              disabled={isSubmitting}
              className={`w-full px-3 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition font-medium ${
                isDarkMode 
                  ? "bg-[#081226] border-white/10 text-slate-100 placeholder-slate-500" 
                  : "bg-white border-slate-300 text-slate-900 placeholder-slate-400"
              }`}
            />
          </div>
        )}

        {/* Optional Initial Class Assignment */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-amber-500" />
              <span>Initial Sunday School Class Assignment (Optional)</span>
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">Can be assigned later</span>
          </label>
          <select
            name="initialClassId"
            value={formData.initialClassId}
            onChange={handleChange}
            disabled={isSubmitting || loadingClasses}
            className={`w-full px-3 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition font-medium ${
              isDarkMode 
                ? "bg-[#081226] border-white/10 text-slate-100" 
                : "bg-white border-slate-300 text-slate-900"
            }`}
          >
            <option value="">-- No Initial Class Assignment (Assign Later) --</option>
            {availableClasses.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.gradeLevel} - Section {cls.section}
              </option>
            ))}
          </select>
        </div>

        {/* Submit Button */}
        <div className="pt-2 flex items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-md active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Registering Teacher...</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Confirm & Register Teacher</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
