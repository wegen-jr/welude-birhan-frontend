
import { useCallback, useEffect, useState } from "react";
import {
  Users,
  CalendarDays,
  RefreshCw,
} from "lucide-react";
import { useNavigate, useOutletContext } from "react-router-dom";
import AttendanceService from "../../services/teacher/AttendanceService";
import { useLanguage } from "../../Contexts/LanguageContext";
import TeacherService from "../../services/teacher/TeacherService";
import TeacherStatCard from "../../Components/teacher/TeacherStatCard";
import StudentTable from "../../Components/teacher/StudentTable";

function getRecords(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.assignments)) return response.assignments;
  if (Array.isArray(response?.data?.assignments)) {
    return response.data.assignments;
  }
  return [];
}

function localDateString() {
  const date = new Date();
  const offset = date.getTimezoneOffset();

  return new Date(date.getTime() - offset * 60000)
    .toISOString()
    .slice(0, 10);
}

export default function TeacherDashboard() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const outletContext = useOutletContext() || {};
  const isDarkMode = outletContext.isDarkMode ?? true;

  const [assignments, setAssignments] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fullname,setFullname]=useState("");
  const today = localDateString();

const loadDashboard = useCallback(async () => {
  setLoading(true);
  setError("");

  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const tid = user?.tid;
    const name=user?.fullname;
    setFullname(name);
    if (!tid) {
      throw new Error("Teacher ID not found. Please log in again.");
    }
const [assignmentResponse, studentResponse, attendanceResponse] =
  await Promise.all([
    TeacherService.getTeacherAssignments(),
    TeacherService.getTeacherStudents(tid),
    AttendanceService.getAll(),
  ]);

const allAssignments = getRecords(assignmentResponse);

const teacherStudents = (studentResponse?.classes || []).flatMap(
  (classItem) => classItem.students || []
);

const allAttendance = getRecords(attendanceResponse);

const todayAttendance = allAttendance.filter((record) => {
  const recordTeacherId = record.teacherid ?? record.teacherId;

  return (
    String(recordTeacherId) === String(tid) &&
    String(record.date || "").slice(0, 10) === today
  );
});

setAssignments(
  allAssignments.filter(
    (assignment) => String(assignment.teacherId) === String(tid)
  )
);

setStudents(teacherStudents);
setAttendance(todayAttendance);
    // Attendance must be fetched and scoped separately.
    setAttendance([]);
  } catch (err) {
    setError(err.message || t.teacher.common.loadError);
  } finally {
    setLoading(false);
  }
}, [t.teacher.common.loadError]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const labels = t.teacher.students.table;

  const mutedText = isDarkMode
    ? "text-slate-400"
    : "text-slate-500";

  const panelClass = isDarkMode
    ? "border-white/10 bg-[#101e36]"
    : "border-slate-200 bg-white shadow-sm";

  if (loading) {
    return (
      <div className={`flex min-h-64 items-center justify-center ${mutedText}`}>
        {t.teacher.common.loading}
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-lg text-amber-300 font-sans capitalize">
            {fullname}
          </p>
          <p className="text-sm text-amber-500">
             {t.teacher.dashboard.welcome}
          </p>

          <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
            {assignments.length > 0
              ? assignments[0].classLevel ||
                assignments[0].gradeLevel ||
                assignments[0].courseName ||
                t.teacher.dashboard.noClass
              : t.teacher.dashboard.noClass}
          </h2>

          <p className={`mt-2 text-sm ${mutedText}`}>
            {assignments.length > 0
              ? assignments[0].courseName ||
                t.teacher.dashboard.noSubject
              : t.teacher.dashboard.noSubject}
          </p>
        </div>

        <button
          type="button"
          onClick={loadDashboard}
          className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm transition ${
            isDarkMode
              ? "border-white/10 hover:bg-white/5"
              : "border-slate-200 hover:bg-slate-100"
          }`}
        >
          <RefreshCw className="h-4 w-4" />
          {t.teacher.common.refresh}
        </button>
      </section>

     

      {!error && assignments.length === 0 && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5 text-amber-600">
          {t.teacher.dashboard.noAssignment}
        </div>
      )}

      {assignments.length > 1 && (
        <section className="space-y-3">
          <h3 className="text-lg font-bold">
            {t.teacher.dashboard.assignedClasses}
          </h3>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {assignments.map((assignment, index) => (
              <div
                key={`${assignment.courseId}-${assignment.gradeLevel}-${index}`}
                className={`rounded-xl border p-4 ${panelClass}`}
              >
                <p className="font-semibold">
                  {assignment.classLevel ||
                    assignment.gradeLevel ||
                    t.teacher.dashboard.noClass}
                </p>
                <p className={`mt-1 text-sm ${mutedText}`}>
                  {assignment.courseName}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className={`rounded-2xl border p-5 sm:p-6 ${panelClass}`}>
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-lg font-bold">
              {t.teacher.dashboard.studentList}
            </h3>
            <p className={`mt-1 text-sm ${mutedText}`}>
              {t.teacher.dashboard.studentListDescription}
            </p>
          </div>

          <span className="w-fit rounded-full bg-amber-500/10 px-3 py-1.5 text-sm text-amber-500">
            <Users className="mr-2 inline h-4 w-4" />
            {students.length}
          </span>
        </div>

        {students.length > 0 ? (
          <StudentTable students={students} labels={labels} />
        ) : (
          <p className={`py-6 text-center text-sm ${mutedText}`}>
            {t.teacher.dashboard.studentsPending}
          </p>
        )}

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className={`text-sm ${mutedText}`}>
            <CalendarDays className="mr-2 inline h-4 w-4" />
            {t.teacher.dashboard.attendanceDate}: {today}
          </p>

          <button
            type="button"
            disabled={assignments.length === 0}
            onClick={() => navigate("/teacherDashboard/attendance")}
            className="rounded-xl bg-amber-500 px-5 py-3 font-semibold text-[#081226] transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t.teacher.dashboard.takeAttendance}
          </button>
        </div>
      </section>
    </div>
  );
}
