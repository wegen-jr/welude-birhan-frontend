import { useState } from "react";
import { toast } from "react-toastify";
import {
  IdCard,
  Phone,
  CheckCircle2,
  Copy,
  Loader2,
  UserCheck,
  Calendar,
  Hash,
  ArrowRight,
  Sparkles,
  Info,
  Clock
} from "lucide-react";
import { sundaySchoolService } from "../../services/educationhub/sundaySchoolService";

export default function StudentIdGeneration({ onStudentGenerated, isDarkMode = true }) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [studentData, setStudentData] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    const cleanPhone = phoneNumber.trim();
    if (!cleanPhone) {
      toast.error("Please enter a valid member phone number.");
      return;
    }

    setLoading(true);
    try {
      // Calls sundaySchoolService.generateStudentId, which automatically handles
      // existing profiles in "limbo" via graceful fallback lookup
      const data = await sundaySchoolService.generateStudentId(cleanPhone);
      setStudentData(data);

      if (data.isExisting) {
        toast.info(
          `Existing Student ID found (${data.studentId || data.student_id}). Step 2 unlocked for class assignment!`
        );
      } else {
        toast.success(
          `New Student ID generated: ${data.studentId || data.student_id}`
        );
      }

      // Automatically unlock Step 2 (Class Selection & Enrollment)
      if (onStudentGenerated) {
        onStudentGenerated(data);
      }
    } catch (error) {
      console.error("Student ID generation / lookup error:", error);
      const msg = error.message || "Failed to find or generate Student ID. Please ensure the phone number belongs to a registered member.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const copyStudentId = () => {
    const idToCopy = studentData?.studentId || studentData?.student_id;
    if (idToCopy) {
      navigator.clipboard.writeText(idToCopy);
      setCopied(true);
      toast.info("Student ID copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const studentIdDisplay = studentData?.studentId || studentData?.student_id;
  const memberIdDisplay = studentData?.memberId || studentData?.member_id;
  const phoneDisplay = studentData?.phoneNumber || studentData?.phone_number || phoneNumber;
  const fullnameDisplay = studentData?.fullname || studentData?.full_name || studentData?.name;
  const createdAtDisplay = studentData?.createdAt || studentData?.created_at;
  const isExisting = Boolean(studentData?.isExisting);

  return (
    <div className={`rounded-2xl border p-6 transition-all shadow-sm ${isDarkMode
        ? "bg-[#0b1b3d]/60 border-white/10 text-slate-100"
        : "bg-white border-slate-200 text-slate-800"
      }`}>
      {/* Step Header */}
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-inherit">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-sm">
            1
          </div>
          <div>
            <h2 className="text-lg font-bold">Step 1: Generate Student ID Form</h2>
            <p className="text-xs text-slate-400">
              Verify an existing church member and generate or retrieve their student ID
            </p>
          </div>
        </div>
        <IdCard className="w-5 h-5 text-amber-500/70" />
      </div>

      {/* Form */}
      <form onSubmit={handleGenerate} className="space-y-4">
        <div>
          <label
            htmlFor="member-phone"
            className="block text-xs font-semibold uppercase tracking-wider mb-2 text-slate-400"
          >
            Member Phone Number <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Phone className="w-4 h-4" />
            </div>
            <input
              id="member-phone"
              type="tel"
              disabled={loading}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="e.g. 0911223344 or +251911223344"
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/50 border ${isDarkMode
                  ? "bg-white/5 border-white/10 text-slate-100 placeholder:text-slate-500 focus:bg-white/10"
                  : "bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:bg-white"
                }`}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5">
            Enter the registered phone number. If already registered but not yet enrolled in a class, their existing profile will be automatically loaded.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || !phoneNumber.trim()}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm text-slate-950 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-amber-500/10 active:scale-[0.99]"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying & Generating ID...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate Student ID</span>
            </>
          )}
        </button>
      </form>

      {/* Response Display Details */}
      {studentData && (
        <div className={`mt-5 p-4 rounded-xl border animate-fadeIn transition-all ${isExisting
            ? (isDarkMode ? "bg-sky-500/10 border-sky-500/30" : "bg-sky-50 border-sky-200")
            : (isDarkMode ? "bg-emerald-500/5 border-emerald-500/20" : "bg-emerald-50 border-emerald-200")
          }`}>
          {/* Status Header Badge */}
          <div className={`flex items-center justify-between mb-3 pb-2 border-b ${isExisting ? "border-sky-500/20" : "border-emerald-500/20"
            }`}>
            <div className={`flex items-center gap-2 ${isExisting ? "text-sky-400" : "text-emerald-500"
              }`}>
              {isExisting ? (
                <Info className="w-4 h-4" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <span className="text-xs font-bold uppercase tracking-wider">
                {isExisting ? "Existing Student Profile Found" : "Student Profile Ready"}
              </span>
            </div>
            <button
              type="button"
              onClick={copyStudentId}
              className={`flex items-center gap-1.5 text-xs transition-colors ${isExisting ? "text-sky-300 hover:text-sky-100" : "text-slate-400 hover:text-emerald-400"
                }`}
              title="Copy Student ID"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? "Copied!" : "Copy ID"}</span>
            </button>
          </div>

          {/* Limbo info notice if student was already registered */}
          {isExisting && (
            <div className="mb-3 p-2.5 rounded-lg text-xs bg-sky-500/10 border border-sky-500/20 text-sky-300 flex items-start gap-2">
              <Clock className="w-4 h-4 mt-0.5 shrink-0 text-sky-400" />
              <span>
                <strong>Limbo Status Resolved:</strong> This member already possessed a generated student ID but was not enrolled in a class. Their profile was retrieved and <strong>Step 2 has been automatically unlocked</strong> below.
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1 font-medium">
                <Hash className="w-3.5 h-3.5" /> Student ID:
              </span>
              <span className="font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                {studentIdDisplay || "N/A"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1 font-medium">
                <UserCheck className="w-3.5 h-3.5" /> Member ID:
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{memberIdDisplay || "N/A"}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1 font-medium">
                <Phone className="w-3.5 h-3.5" /> Phone:
              </span>
              <span className="font-mono text-slate-800 dark:text-slate-200">{phoneDisplay}</span>
            </div>

            {fullnameDisplay && (
              <div className="flex items-center gap-2">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Full Name:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{fullnameDisplay}</span>
              </div>
            )}

            {createdAtDisplay && (
              <div className="flex items-center gap-2 sm:col-span-2">
                <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1 font-medium">
                  <Calendar className="w-3.5 h-3.5" /> Registered:
                </span>
                <span className="text-slate-700 dark:text-slate-300">
                  {new Date(createdAtDisplay).toLocaleString()}
                </span>
              </div>
            )}
          </div>

          <div className="mt-3 pt-2 text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1 font-medium">
            <ArrowRight className="w-3.5 h-3.5" />
            <span>Step 2 is unlocked. Select or create a class to complete enrollment.</span>
          </div>
        </div>
      )}
    </div>
  );
}
