import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  RefreshCw,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useLanguage } from "../../Contexts/LanguageContext";
import TeacherService from "../../services/teacher/TeacherService";
import AttendanceService from "../../services/teacher/AttendanceService";

function getRecords(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.records)) return response.records;
  if (Array.isArray(response?.data?.records)) return response.data.records;
  return [];
}

function getToday() {
  const date = new Date();
  const offset = date.getTimezoneOffset();

  return new Date(date.getTime() - offset * 60000)
    .toISOString()
    .slice(0, 10);
}

function normalizeStatus(status) {
  const value = String(status || "").toUpperCase();

  if (value === "PRESENT") return "Present";
  if (value === "ABSENT") return "Absent";
  if (value === "LATE") return "Late";

  return "";
}

function getRecordDate(date) {
  return date ? String(date).slice(0, 10) : "";
}

export default function Attendance() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [students, setStudents] = useState([]);
  const [existingRecords, setExistingRecords] = useState([]);
  const [statuses, setStatuses] = useState({});
  const [today, setToday] = useState(getToday);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const selectedClass = useMemo(
    () =>
      classes.find(
        (item) => String(item.assignmentId) === String(selectedClassId)
      ),
    [classes, selectedClassId]
  );
    const loadScanner=()=>{
      navigate("/teacherDashboard/scanner", { replace: true });
    }

  const loadAttendancePage = useCallback(async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      const tid = user?.tid;

      if (!tid) {
        throw new Error("Teacher ID not found. Please log in again.");
      }

      const [classResponse, attendanceResponse] = await Promise.all([
        TeacherService.getTeacherStudents(tid),
        AttendanceService.getAll(),
      ]);

      const teacherClasses = Array.isArray(classResponse?.classes)
        ? classResponse.classes
        : [];

      setClasses(teacherClasses);
      setExistingRecords(getRecords(attendanceResponse));

      setSelectedClassId((current) => {
        if (
          current &&
          teacherClasses.some(
            (item) => String(item.assignmentId) === String(current)
          )
        ) {
          return current;
        }

        return teacherClasses[0]
          ? String(teacherClasses[0].assignmentId)
          : "";
      });
    } catch (err) {
      setError(err.message || "Unable to load attendance.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAttendancePage();
  }, [loadAttendancePage]);

  useEffect(() => {
    setStudents(selectedClass?.students || []);
  }, [selectedClass]);

  const classRecords = useMemo(() => {
    if (!selectedClass) return [];

    return existingRecords.filter((record) => {
      const recordCourseId = record.courseId ?? record.courceId;
      const recordTeacherId = record.teacherid ?? record.teacherId;

      return (
        String(recordTeacherId) ===
          String(JSON.parse(localStorage.getItem("user") || "null")?.tid) &&
        String(recordCourseId) === String(selectedClass.courseId) &&
        String(record.gradeLevel || "").toUpperCase() ===
          String(selectedClass.gradeLevel || "").toUpperCase() &&
        getRecordDate(record.date) === today
      );
    });
  }, [existingRecords, selectedClass, today]);

  const recordedByStudent = useMemo(() => {
    const result = {};

    classRecords.forEach((record) => {
      result[String(record.studentId)] = normalizeStatus(record.status);
    });

    return result;
  }, [classRecords]);

  useEffect(() => {
    const nextStatuses = {};

    students.forEach((student) => {
      const studentId = String(student.studentId);
      nextStatuses[studentId] =
        recordedByStudent[studentId] || "";
    });

    setStatuses(nextStatuses);
  }, [students, recordedByStudent]);

  const setStudentStatus = (studentId, status) => {
    setStatuses((current) => ({
      ...current,
      [String(studentId)]: status,
    }));
  };

  const saveAttendance = async () => {
    setError("");
    setMessage("");

    if (!selectedClass || !students.length) {
      setError("Select an assigned class with enrolled students.");
      return;
    }

    const unmarked = students.filter(
      (student) =>
        !recordedByStudent[String(student.studentId)] &&
        !statuses[String(student.studentId)]
    );

    if (unmarked.length > 0) {
      setError(`Mark attendance for all students first. ${unmarked.length} student(s) remain unmarked.`);
      return;
    }

    const pendingStudents = students.filter(
      (student) => !recordedByStudent[String(student.studentId)]
    );

    if (!pendingStudents.length) {
      setMessage("Attendance has already been recorded for this class today.");
      return;
    }

    const user = JSON.parse(localStorage.getItem("user") || "null");

    setSaving(true);

    let savedCount = 0;

    try {
      // The documented endpoint creates one attendance record per request.
      for (const student of pendingStudents) {
        await AttendanceService.create({
          studentId: student.studentId,
          fullname: student.fullname,
          courseId: selectedClass.courseId,
          courseName: selectedClass.courseName,
          gradeLevel: selectedClass.gradeLevel,
          teacherid: Number(user.tid),
          date: `${today}T00:00:00.000Z`,
          status: statuses[String(student.studentId)],
        });

        savedCount += 1;
      }

      setMessage(
        `Successfully saved attendance for ${savedCount} student(s).`
      );

      await loadAttendancePage();
    } catch (err) {
      setError(
        `${err.message || "Unable to save attendance."} Saved ${savedCount} of ${pendingStudents.length} records. Refresh before retrying to avoid duplicates.`
      );

      // Refresh the saved records before any retry.
      try {
        const response = await AttendanceService.getAll();
        setExistingRecords(getRecords(response));
      } catch {
        // Preserve the original save error if refreshing also fails.
      }
    } finally {
      setSaving(false);
    }
  };

  const presentCount = students.filter(
    (student) =>
      (recordedByStudent[String(student.studentId)] ||
        statuses[String(student.studentId)]) === "Present"
  ).length;

  const absentCount = students.filter(
    (student) =>
      (recordedByStudent[String(student.studentId)] ||
        statuses[String(student.studentId)]) === "Absent"
  ).length;

  const lateCount = students.filter(
    (student) =>
      (recordedByStudent[String(student.studentId)] ||
        statuses[String(student.studentId)]) === "Late"
  ).length;

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center text-slate-400">
        {t.teacher.common.loading}
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-amber-500">
            Teacher workspace
          </p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
            Take Attendance
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Select one assigned class and record its attendance.
          </p>
        </div>
        <button
          type="button"
          onClick={loadScanner}
          disabled={saving}
          className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm transition hover:bg-white/5 disabled:opacity-50"
        >
          <RefreshCw className="h-4 w-4" />
          take with scanner
        </button>
        <button
          type="button"
          onClick={loadAttendancePage}
          disabled={saving}
          className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm transition hover:bg-white/5 disabled:opacity-50"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </section>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400"
        >
          {error}
        </div>
      )}

      {message && (
        <div
          role="status"
          className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-400"
        >
          {message}
        </div>
      )}

      <section className="rounded-2xl border border-white/10 bg-[#101e36] p-5">
        <label
          htmlFor="attendance-class"
          className="mb-2 block text-sm font-medium text-slate-300"
        >
          Select assigned class
        </label>

        <select
          id="attendance-class"
          value={selectedClassId}
          disabled={!classes.length || saving}
          onChange={(event) => {
            setSelectedClassId(event.target.value);
            setMessage("");
            setError("");
          }}
          className="w-full rounded-xl border border-white/10 bg-[#081226] px-4 py-3 text-white outline-none focus:border-amber-500"
        >
          {classes.length === 0 && (
            <option value="">No assigned classes found</option>
          )}

          {classes.map((item) => (
            <option
              key={item.assignmentId}
              value={String(item.assignmentId)}
            >
              {item.gradeLevel} — {item.courseName}
            </option>
          ))}
        </select>

        {selectedClass && (
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-400">
            <span>Grade: {selectedClass.gradeLevel}</span>
            <span>Subject: {selectedClass.courseName}</span>
            <span>
              Enrolled: {selectedClass.students?.length || 0}
            </span>
          </div>
        )}
      </section>

      {!classes.length ? (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 text-amber-500">
          You do not have any assigned classes.
        </div>
      ) : (
        <>
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total students", value: students.length },
              { label: "Present", value: presentCount },
              { label: "Absent", value: absentCount },
              { label: "Late", value: lateCount },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-white/10 bg-[#101e36] p-4"
              >
                <p className="text-sm text-slate-400">{item.label}</p>
                <p className="mt-2 text-2xl font-bold">{item.value}</p>
              </div>
            ))}
          </section>

          <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#101e36]">
            <div className="flex flex-col justify-between gap-3 border-b border-white/10 p-5 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-lg font-bold">
                  {selectedClass?.gradeLevel} — Student Attendance
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  <CalendarDays className="mr-2 inline h-4 w-4" />
                  {today}
                </p>
              </div>

              <span className="w-fit rounded-full bg-amber-500/10 px-3 py-1.5 text-sm text-amber-500">
                <Users className="mr-2 inline h-4 w-4" />
                {students.length} students
              </span>
            </div>

            {students.length === 0 ? (
              <p className="p-8 text-center text-sm text-slate-400">
                No students are enrolled in this class.
              </p>
            ) : (
              <div className="overflow-x-auto w-full">
                <table className="w-full min-w-[720px] text-left">
                  <thead className="bg-white/5 text-xs uppercase tracking-wide text-slate-400">
                    <tr>
                      <th className="px-5 py-4">No.</th>
                      <th className="px-5 py-4">Student</th>
                      <th className="px-5 py-4">Student ID</th>
                      <th className="px-5 py-4">Section</th>
                      <th className="px-5 py-4">Attendance</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/5">
                    {students.map((student, index) => {
                      const id = String(student.studentId);
                      const savedStatus = recordedByStudent[id];
                      const status = savedStatus || statuses[id] || "";

                      return (
                        <tr
                          key={student.id || id}
                          className="hover:bg-white/[0.03]"
                        >
                          <td className="px-5 py-4 text-slate-400">
                            {index + 1}
                          </td>
                          <td className="px-5 py-4 font-medium">
                            {student.fullname}
                          </td>
                          <td className="px-5 py-4 text-slate-400">
                            {student.studentId}
                          </td>
                          <td className="px-5 py-4 text-slate-400">
                            {student.section || "—"}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex flex-wrap gap-2">
                              {["Present", "Absent", "Late"].map((option) => {
                                const active = status === option;

                                return (
                                  <button
                                    key={option}
                                    type="button"
                                    disabled={Boolean(savedStatus) || saving}
                                    onClick={() =>
                                      setStudentStatus(id, option)
                                    }
                                    className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                                      active
                                        ? "border-amber-500 bg-amber-500 text-[#081226]"
                                        : "border-white/10 text-slate-300 hover:bg-white/5"
                                    } disabled:cursor-not-allowed disabled:opacity-80`}
                                  >
                                    {option}
                                  </button>
                                );
                              })}
                            </div>

                            {savedStatus && (
                              <p className="mt-2 text-xs text-emerald-400">
                                <CheckCircle2 className="mr-1 inline h-3.5 w-3.5" />
                                Already recorded
                              </p>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex flex-col justify-between gap-3 border-t border-white/10 p-5 sm:flex-row sm:items-center">
              <p className="text-sm text-slate-400">
                {Object.values(statuses).filter(Boolean).length} of{" "}
                {students.length} students marked
              </p>

              <button
                type="button"
                disabled={
                  saving ||
                  students.length === 0 ||
                  students.every(
                    (student) =>
                      Boolean(recordedByStudent[String(student.studentId)]) ||
                      Boolean(statuses[String(student.studentId)])
                  ) === false ||
                  students.every(
                    (student) =>
                      Boolean(recordedByStudent[String(student.studentId)])
                  )
                }
                onClick={saveAttendance}
                className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3 font-semibold text-[#081226] transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ClipboardCheck className="h-4 w-4" />
                {saving ? "Saving attendance..." : "Save attendance"}
              </button>
            </div>
          </section>
        </>
      )}

      <button
        type="button"
        onClick={() => navigate("/teacherDashboard")}
        className="text-sm text-amber-500 transition hover:text-amber-400"
      >
        ← Back to dashboard
      </button>
    </div>
  );
}