import { Users, UserCheck, UserX, Clock, GraduationCap, BookOpen, Calendar } from "lucide-react";

const icons = {
  classes: GraduationCap,
  students: Users,
  present: UserCheck,
  absent: UserX,
  late: Clock,
  courses: BookOpen,
  schedule: Calendar,
};

export default function TeacherStatCard({
  title,
  value,
  type = "students",
  isDarkMode = true,
  description,
}) {
  const Icon = icons[type] || Users;

  return (
    <div
      className={`rounded-2xl border p-5 transition-all duration-200 shadow-sm ${
        isDarkMode
          ? "border-white/10 bg-[#101e36] text-white"
          : "border-slate-200 bg-white text-slate-800"
      }`}
    >
      <div className="flex items-center justify-between">
        <p
          className={`text-xs sm:text-sm font-medium ${
            isDarkMode ? "text-slate-400" : "text-slate-500"
          }`}
        >
          {title}
        </p>
        <div className="rounded-xl bg-amber-500/10 p-2.5 sm:p-3 text-amber-500 dark:text-amber-400">
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <p
          className={`text-2xl sm:text-3xl font-bold tracking-tight ${
            isDarkMode ? "text-white" : "text-slate-900"
          }`}
        >
          {value}
        </p>
      </div>

      {description && (
        <p
          className={`mt-1.5 text-xs ${
            isDarkMode ? "text-slate-400" : "text-slate-500"
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
}
