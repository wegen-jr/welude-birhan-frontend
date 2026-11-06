import PropTypes from "prop-types";
import { X, IdCard } from "lucide-react";
import StudentIDCard from "./StudentIDCard";

export default function StudentIDCardModal({
  isOpen,
  onClose,
  student,
  logoSrc,
}) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      data-theme="light"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fadeIn"
    >
      <div
        data-theme="light"
        className="relative bg-white dark:bg-[#0b1b3d] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 w-full max-w-[92vw] sm:max-w-md max-h-[92vh] overflow-y-auto flex flex-col items-center p-6 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="w-full flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
            <IdCard className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold">Official Student ID Card</h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* The Card Component */}
        <div className="py-2">
          <StudentIDCard
            student={student}
            logoSrc={logoSrc}
            showActions={true}
          />
        </div>
      </div>
    </div>
  );
}

StudentIDCardModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  student: PropTypes.object,
  logoSrc: PropTypes.string,
};
