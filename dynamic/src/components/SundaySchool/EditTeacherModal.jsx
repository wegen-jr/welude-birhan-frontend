import { useState } from "react";
import { toast } from "react-toastify";
import { 
  Edit3, 
  X, 
  User, 
  Mail, 
  Phone, 
  Building2, 
  Loader2, 
  AlertCircle 
} from "lucide-react";
import { teacherService } from "../../services/teacherService";

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

export default function EditTeacherModal({
  teacher,
  isOpen,
  onClose,
  onTeacherUpdated,
  isDarkMode = true,
}) {
  const isStandardDept = COMMON_DEPARTMENTS.includes(teacher?.department);
  const [formData, setFormData] = useState(() => ({
    name: teacher?.name || "",
    email: teacher?.email || "",
    phone: teacher?.phone || "",
    department: isStandardDept ? (teacher?.department || "Spiritual Education") : "OTHER",
    customDepartment: isStandardDept ? "" : teacher?.department || "",
  }));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen || !teacher) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMsg) setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMsg("Teacher name is required.");
      return;
    }
    if (!formData.email.trim()) {
      setErrorMsg("Email address is required.");
      return;
    }
    if (!formData.phone.trim()) {
      setErrorMsg("Phone number is required.");
      return;
    }

    const selectedDept = formData.department === "OTHER" 
      ? formData.customDepartment.trim() 
      : formData.department;

    if (!selectedDept) {
      setErrorMsg("Please specify a department.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        department: selectedDept,
      };

      const updated = await teacherService.updateTeacher(teacher.id, payload);
      toast.success(`Teacher profile for "${updated.name}" updated successfully!`);

      if (onTeacherUpdated) {
        onTeacherUpdated({
          ...updated,
          assignedClasses: teacher.assignedClasses, // preserve class links
        });
      }
      onClose();
    } catch (err) {
      const msg = err.message || "Failed to update teacher profile.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className={`w-full max-w-lg rounded-2xl border p-6 shadow-2xl transition-all relative ${
          isDarkMode 
            ? "bg-[#0b1b3d] border-white/10 text-slate-100" 
            : "bg-white border-slate-200 text-slate-800"
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-inherit">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold tracking-tight text-slate-900 dark:text-slate-100">Edit Teacher Profile</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Updating profile for <span className="font-semibold text-amber-500">Teacher #{teacher.id}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isDarkMode 
                ? "border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/5" 
                : "border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className={`mt-4 p-3 rounded-xl border flex items-start gap-2 text-xs ${
            isDarkMode ? "bg-rose-500/10 border-rose-500/30 text-rose-300" : "bg-rose-50 border-rose-200 text-rose-700"
          }`}>
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
              Full Name <span className="text-amber-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition font-medium ${
                  isDarkMode 
                    ? "bg-[#081226] border-white/10 text-slate-100" 
                    : "bg-white border-slate-300 text-slate-900"
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Email Address <span className="text-amber-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition font-medium ${
                    isDarkMode 
                      ? "bg-[#081226] border-white/10 text-slate-100" 
                      : "bg-white border-slate-300 text-slate-900"
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Phone Number <span className="text-amber-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition font-medium ${
                    isDarkMode 
                      ? "bg-[#081226] border-white/10 text-slate-100" 
                    : "bg-white border-slate-300 text-slate-900"
                  }`}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
              Department <span className="text-amber-500">*</span>
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

          {formData.department === "OTHER" && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Custom Department Name <span className="text-amber-500">*</span>
              </label>
              <input
                type="text"
                name="customDepartment"
                value={formData.customDepartment}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                className={`w-full px-3 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition font-medium ${
                  isDarkMode 
                    ? "bg-[#081226] border-white/10 text-slate-100" 
                    : "bg-white border-slate-300 text-slate-900"
                }`}
              />
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-4 border-t border-inherit flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition ${
                isDarkMode 
                  ? "bg-white/5 border-white/10 hover:bg-white/10 text-slate-300" 
                  : "bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700"
              }`}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
