
import { Users, UserCheck, UserX, Clock } from "lucide-react";

const icons = {
  students: Users,
  present: UserCheck,
  absent: UserX,
  late: Clock,
};

export default function TeacherStatCard({
  title,
  value,
  type = "students",
}) {
  const Icon = icons[type] || Users;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#101e36] p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{title}</p>
        <div className="rounded-xl bg-amber-500/10 p-3">
          <Icon className="h-5 w-5 text-amber-400" />
        </div>
      </div>

      <p className="mt-4 text-3xl font-bold text-white">
        {value}
      </p>
    </div>
  );
}
