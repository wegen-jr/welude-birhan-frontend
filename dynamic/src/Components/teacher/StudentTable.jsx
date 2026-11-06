import { Users } from "lucide-react";

export default function StudentTable({
  students = [],
  labels = {},
  renderActions,
  isDarkMode = true,
}) {
  const emptyLabel = labels?.empty || "No students found";
  const emptyDesc = labels?.emptyDescription || "No students enrolled in this section.";

  if (!students.length) {
    return (
      <div
        className={`rounded-2xl border border-dashed p-8 text-center transition-colors ${
          isDarkMode
            ? "border-white/10 text-slate-400"
            : "border-slate-200 text-slate-500"
        }`}
      >
        <Users className="mx-auto mb-3 h-8 w-8 text-amber-500/70" />
        <p
          className={`font-medium ${
            isDarkMode ? "text-slate-200" : "text-slate-800"
          }`}
        >
          {emptyLabel}
        </p>
        <p className="mt-1 text-xs sm:text-sm">{emptyDesc}</p>
      </div>
    );
  }

  return (
    <div
      className={`overflow-x-auto w-full rounded-2xl border transition-colors ${
        isDarkMode
          ? "border-white/10 bg-[#0b1b3d]/40"
          : "border-slate-200 bg-white"
      }`}
    >
      <table className="w-full min-w-[540px] text-left">
        <thead
          className={`text-xs uppercase tracking-wider font-semibold border-b ${
            isDarkMode
              ? "bg-white/5 text-slate-400 border-white/10"
              : "bg-slate-50 text-slate-600 border-slate-200"
          }`}
        >
          <tr>
            <th className="px-4 sm:px-5 py-3.5 sm:py-4">
              {labels?.number || "#"}
            </th>
            <th className="px-4 sm:px-5 py-3.5 sm:py-4">
              {labels?.name || "Student Name"}
            </th>
            <th className="px-4 sm:px-5 py-3.5 sm:py-4">
              {labels?.studentId || "Student ID"}
            </th>
            <th className="px-4 sm:px-5 py-3.5 sm:py-4">
              {labels?.gradeLevel || "Grade Level"}
            </th>
            {renderActions && (
              <th className="px-4 sm:px-5 py-3.5 sm:py-4 text-right">
                {labels?.actions || "Actions"}
              </th>
            )}
          </tr>
        </thead>

        <tbody
          className={`divide-y text-xs sm:text-sm ${
            isDarkMode ? "divide-white/5" : "divide-slate-100"
          }`}
        >
          {students.map((student, index) => (
            <tr
              key={student.id || student.studentId || index}
              className={`transition-colors ${
                isDarkMode
                  ? "hover:bg-white/[0.03] text-slate-300"
                  : "hover:bg-slate-50 text-slate-700"
              }`}
            >
              <td
                className={`px-4 sm:px-5 py-3.5 sm:py-4 ${
                  isDarkMode ? "text-slate-500" : "text-slate-400"
                }`}
              >
                {index + 1}
              </td>

              <td
                className={`px-4 sm:px-5 py-3.5 sm:py-4 font-medium ${
                  isDarkMode ? "text-white" : "text-slate-900"
                }`}
              >
                {student.fullname || student.name || "—"}
              </td>

              <td className="px-4 sm:px-5 py-3.5 sm:py-4 font-mono text-xs">
                {student.studentId || "—"}
              </td>

              <td className="px-4 sm:px-5 py-3.5 sm:py-4">
                <span
                  className={`inline-block rounded-md px-2 py-0.5 text-xs font-semibold ${
                    isDarkMode
                      ? "bg-white/5 text-amber-400 border border-amber-500/20"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  {student.gradeLevel || student.classLevel || "—"}
                </span>
              </td>

              {renderActions && (
                <td className="px-4 sm:px-5 py-3.5 sm:py-4 text-right">
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
