import { Users } from "lucide-react";

export default function StudentTable({
  students = [],
  labels,
  renderActions,
}) {
  if (!students.length) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center">
        <Users className="mx-auto mb-3 h-8 w-8 text-slate-500" />
        <p className="font-medium text-slate-300">
          {labels.empty}
        </p>
        <p className="mt-1 text-sm text-slate-500">
          {labels.emptyDescription}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10">
      <table className="w-full min-w-[540px] text-left">
        <thead className="bg-white/5 text-xs uppercase tracking-wide text-slate-400">
          <tr>
            <th className="px-5 py-4">{labels.number}</th>
            <th className="px-5 py-4">{labels.name}</th>
            <th className="px-5 py-4">{labels.studentId}</th>
            <th className="px-5 py-4">{labels.gradeLevel}</th>
            {renderActions && (
              <th className="px-5 py-4">{labels.actions}</th>
            )}
          </tr>
        </thead>

        <tbody className="divide-y divide-white/5">
          {students.map((student, index) => (
            <tr
              key={student.id || student.studentId || index}
              className="transition hover:bg-white/[0.03]"
            >
              <td className="px-5 py-4 text-slate-400">
                {index + 1}
              </td>

              <td className="px-5 py-4 font-medium text-white">
                {student.fullname || "—"}
              </td>

              <td className="px-5 py-4 text-slate-400">
                {student.studentId || "—"}
              </td>

              <td className="px-5 py-4 text-slate-400">
                {student.gradeLevel || "—"}
              </td>

              {renderActions && (
                <td className="px-5 py-4">
                  {renderActions(student)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
