
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Search,
  Users,
  XCircle,
  RefreshCw,
} from "lucide-react";

import { useLanguage } from "../../Contexts/LanguageContext";
import TeacherService from "../../services/teacher/TeacherService";
import AttendanceService from "../../services/teacher/AttendanceService";

function getRecords(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.records)) return response.records;
  if (Array.isArray(response?.data?.records)) {
    return response.data.records;
  }
  return [];
}

function normalizeStatus(status) {
  const value = String(status || "").trim().toUpperCase();

  if (value === "PRESENT") return "Present";
  if (value === "ABSENT") return "Absent";
  if (value === "LATE") return "Late";

  return "Unknown";
}

function getDateKey(value) {
  if (!value) return "";

  // The API stores attendance dates as ISO date strings.
  // Keep the date portion to avoid timezone shifting the calendar day.
  return String(value).slice(0, 10);
}

function getTeacherId() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null")?.tid;
  } catch {
    return null;
  }
}

function getMonthLabel(year, month) {
  return new Date(year, month, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

function getStatusClasses(status) {
  switch (status) {
    case "Present":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
    case "Absent":
      return "border-red-500/30 bg-red-500/10 text-red-400";
    case "Late":
      return "border-amber-500/30 bg-amber-500/10 text-amber-400";
    default:
      return "border-white/10 bg-white/5 text-slate-400";
  }
}

function StatusIcon({ status }) {
  if (status === "Present") {
    return <CheckCircle2 className="h-4 w-4" />;
  }

  if (status === "Absent") {
    return <XCircle className="h-4 w-4" />;
  }

  if (status === "Late") {
    return <Clock3 className="h-4 w-4" />;
  }

  return <CalendarDays className="h-4 w-4" />;
}

export default function AttendanceList() {
  const { t } = useLanguage();

  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [records, setRecords] = useState([]);

  const [searchId, setSearchId] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [selectedStudentId, setSelectedStudentId] = useState("");

  const now = new Date();
  const [calendarYear, setCalendarYear] = useState(now.getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(now.getMonth());

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const tid = getTeacherId();

      if (tid === null || tid === undefined || tid === "") {
        throw new Error("Teacher ID not found. Please sign in again.");
      }

      const [classResponse, attendanceResponse] = await Promise.all([
        TeacherService.getTeacherStudents(tid),
        AttendanceService.getAll(),
      ]);

      const teacherClasses = Array.isArray(classResponse?.classes)
        ? classResponse.classes
        : [];

      // Only show students from classes assigned to this teacher.
      const studentMap = new Map();

      teacherClasses.forEach((classItem) => {
        (classItem.students || []).forEach((student) => {
          const id = String(student.studentId || "");
          if (!id) return;

          if (!studentMap.has(id)) {
            studentMap.set(id, {
              ...student,
              studentId: id,
              gradeLevel: student.gradeLevel || classItem.gradeLevel || "",
              section: student.section || "",
              classes: [],
            });
          }

          const existingStudent = studentMap.get(id);

          existingStudent.classes.push({
            assignmentId: classItem.assignmentId,
            courseId: classItem.courseId,
            courseName: classItem.courseName,
            gradeLevel: classItem.gradeLevel,
          });
        });
      });

      const allRecords = getRecords(attendanceResponse);
      const teacherRecords = allRecords.filter((record) => {
        const recordTeacherId = record.teacherid ?? record.teacherId;
        return String(recordTeacherId) === String(tid);
      });

      setClasses(teacherClasses);
      setStudents(Array.from(studentMap.values()));
      setRecords(teacherRecords);

      // Clear a selection if that student is no longer in the teacher's roster.
      setSelectedStudentId((current) =>
        studentMap.has(String(current)) ? current : ""
      );
    } catch (err) {
      setError(err.message || "Unable to load attendance history.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const gradeOptions = useMemo(() => {
    return [
      ...new Set(
        classes
          .map((item) => String(item.gradeLevel || "").trim())
          .filter(Boolean)
      ),
    ].sort((a, b) => a.localeCompare(b));
  }, [classes]);

  const filteredStudents = useMemo(() => {
    const query = searchId.trim().toLowerCase();

    return students.filter((student) => {
      const matchesId =
        !query ||
        String(student.studentId || "").toLowerCase().includes(query);

      const matchesGrade =
        selectedGrade === "all" ||
        String(student.gradeLevel || "").toLowerCase() ===
          selectedGrade.toLowerCase();

      return matchesId && matchesGrade;
    });
  }, [students, searchId, selectedGrade]);

  const selectedStudent = useMemo(
    () =>
      students.find(
        (student) => String(student.studentId) === String(selectedStudentId)
      ) || null,
    [students, selectedStudentId]
  );

  const studentRecords = useMemo(() => {
    if (!selectedStudent) return [];

    const assignedCourseIds = new Set(
      (selectedStudent.classes || []).map((item) => String(item.courseId))
    );

    const assignedGrades = new Set(
      (selectedStudent.classes || [])
        .map((item) => String(item.gradeLevel || "").toUpperCase())
        .filter(Boolean)
    );

    return records
      .filter((record) => {
        const matchesStudent =
          String(record.studentId || "") ===
          String(selectedStudent.studentId);

        const recordCourseId = record.courseId ?? record.courceId;
        const recordGrade = String(record.gradeLevel || "").toUpperCase();

        // Limit the history to this teacher's assigned courses/grades when
        // those fields are available in the saved record.
        const matchesCourse =
          recordCourseId === undefined ||
          recordCourseId === null ||
          assignedCourseIds.has(String(recordCourseId));

        const matchesGrade =
          !recordGrade ||
          assignedGrades.size === 0 ||
          assignedGrades.has(recordGrade);

        return matchesStudent && matchesCourse && matchesGrade;
      })
      .sort((a, b) => getDateKey(b.date).localeCompare(getDateKey(a.date)));
  }, [records, selectedStudent]);

  const monthlyRecords = useMemo(() => {
    return studentRecords.filter((record) => {
      const date = getDateKey(record.date);
      if (!date) return false;

      const [year, month] = date.split("-").map(Number);

      return year === calendarYear && month === calendarMonth + 1;
    });
  }, [studentRecords, calendarYear, calendarMonth]);

  const recordsByDate = useMemo(() => {
    const grouped = {};

    monthlyRecords.forEach((record) => {
      const date = getDateKey(record.date);
      if (!date) return;

      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(record);
    });

    return grouped;
  }, [monthlyRecords]);

  const calendarDays = useMemo(() => {
    const firstWeekday = new Date(
      calendarYear,
      calendarMonth,
      1
    ).getDay();

    const daysInMonth = new Date(
      calendarYear,
      calendarMonth + 1,
      0
    ).getDate();

    const days = [];

    for (let i = 0; i < firstWeekday; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  }, [calendarYear, calendarMonth]);

  const monthSummary = useMemo(() => {
    const summary = {
      Present: 0,
      Absent: 0,
      Late: 0,
      Unknown: 0,
    };

    monthlyRecords.forEach((record) => {
      const status = normalizeStatus(record.status);
      summary[status] = (summary[status] || 0) + 1;
    });

    return summary;
  }, [monthlyRecords]);

  const changeMonth = (amount) => {
    const nextDate = new Date(calendarYear, calendarMonth + amount, 1);
    setCalendarYear(nextDate.getFullYear());
    setCalendarMonth(nextDate.getMonth());
  };

  const openStudent = (student) => {
    setSelectedStudentId(String(student.studentId));
  };

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center text-slate-400">
        {t.teacher.common.loading}
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Page heading */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-amber-500">
            Teacher workspace
          </p>

          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
            Attendance History
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Search students and review their attendance month by month.
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm transition hover:bg-white/5 disabled:opacity-50"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh records
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

      {/* Search and grade filters */}
      <section className="grid gap-4 rounded-2xl border border-white/10 bg-[#101e36] p-5 md:grid-cols-2">
        <div>
          <label
            htmlFor="student-search"
            className="mb-2 block text-sm font-medium text-slate-300"
          >
            Search by Student ID
          </label>

          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#081226] px-3">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />

            <input
              id="student-search"
              type="text"
              value={searchId}
              onChange={(event) => setSearchId(event.target.value)}
              placeholder="Enter student ID..."
              className="w-full bg-transparent py-3 text-sm text-white outline-none placeholder:text-slate-500"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="grade-filter"
            className="mb-2 block text-sm font-medium text-slate-300"
          >
            Filter by Grade Level
          </label>

          <select
            id="grade-filter"
            value={selectedGrade}
            onChange={(event) => setSelectedGrade(event.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#081226] px-4 py-3 text-sm text-white outline-none focus:border-amber-500"
          >
            <option value="all">All assigned grades</option>

            {gradeOptions.map((grade) => (
              <option key={grade} value={grade}>
                {grade}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Student list */}
      <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#101e36]">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 p-5">
          <div>
            <h2 className="text-lg font-bold">Students</h2>
            <p className="mt-1 text-sm text-slate-400">
              Select a row to view the student's monthly attendance checklist.
            </p>
          </div>

          <span className="rounded-full bg-amber-500/10 px-3 py-1.5 text-sm text-amber-500">
            <Users className="mr-1 inline h-4 w-4" />
            {filteredStudents.length}
          </span>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">
            No students match the current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left">
              <thead className="bg-white/5 text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-5 py-4">Student ID</th>
                  <th className="px-5 py-4">Student Name</th>
                  <th className="px-5 py-4">Grade</th>
                  <th className="px-5 py-4">Section</th>
                  <th className="px-5 py-4">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5">
                {filteredStudents.map((student) => {
                  const isSelected =
                    String(student.studentId) === String(selectedStudentId);

                  return (
                    <tr
                      key={student.studentId}
                      onClick={() => openStudent(student)}
                      className={`cursor-pointer transition hover:bg-white/[0.04] ${
                        isSelected ? "bg-amber-500/10" : ""
                      }`}
                    >
                      <td className="px-5 py-4 text-sm text-slate-300">
                        {student.studentId}
                      </td>

                      <td className="px-5 py-4 text-sm font-medium">
                        {student.fullname || "—"}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-400">
                        {student.gradeLevel || "—"}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-400">
                        {student.section || "—"}
                      </td>

                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            openStudent(student);
                          }}
                          className="rounded-lg border border-amber-500/30 px-3 py-2 text-xs font-semibold text-amber-500 transition hover:bg-amber-500/10"
                        >
                          View history
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Selected student attendance history */}
      {selectedStudent && (
        <section className="space-y-5 rounded-2xl border border-white/10 bg-[#101e36] p-4 sm:p-6">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div>
              <p className="text-sm text-amber-500">Selected student</p>

              <h2 className="mt-1 text-xl font-bold">
                {selectedStudent.fullname}
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                ID: {selectedStudent.studentId} · Grade:{" "}
                {selectedStudent.gradeLevel || "—"} · Section:{" "}
                {selectedStudent.section || "—"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSelectedStudentId("")}
              className="flex items-center gap-2 self-start rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 transition hover:bg-white/5"
            >
              <XCircle className="h-4 w-4" />
              Close details
            </button>
          </div>

          {/* Monthly summary */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              {
                label: "Present",
                value: monthSummary.Present,
                status: "Present",
              },
              {
                label: "Absent",
                value: monthSummary.Absent,
                status: "Absent",
              },
              {
                label: "Late",
                value: monthSummary.Late,
                status: "Late",
              },
              {
                label: "Attendance records",
                value: monthlyRecords.length,
                status: "Unknown",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-white/10 bg-[#081226]/70 p-4"
              >
                <p className="text-sm text-slate-400">{item.label}</p>
                <p className="mt-2 text-2xl font-bold">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Month navigation */}
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-lg font-bold">Monthly checklist</h3>
              <p className="mt-1 text-sm text-slate-400">
                Each date shows the saved attendance records for that day.
              </p>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#081226] p-2 sm:justify-start">
              <button
                type="button"
                onClick={() => changeMonth(-1)}
                aria-label="Previous month"
                className="rounded-lg p-2 transition hover:bg-white/10"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <span className="min-w-36 text-center text-sm font-semibold">
                {getMonthLabel(calendarYear, calendarMonth)}
              </span>

              <button
                type="button"
                onClick={() => changeMonth(1)}
                aria-label="Next month"
                className="rounded-lg p-2 transition hover:bg-white/10"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Calendar */}
          <div className="overflow-hidden rounded-xl border border-white/10">
            <div className="grid grid-cols-7 border-b border-white/10 bg-white/5">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                (day) => (
                  <div
                    key={day}
                    className="px-1 py-3 text-center text-xs font-semibold text-slate-400 sm:px-3"
                  >
                    {day}
                  </div>
                )
              )}
            </div>

            <div className="grid grid-cols-7">
              {calendarDays.map((day, index) => {
                if (day === null) {
                  return (
                    <div
                      key={`empty-${index}`}
                      className="min-h-20 border-b border-r border-white/5 bg-black/10 sm:min-h-28"
                    />
                  );
                }

                const dateKey = [
                  calendarYear,
                  String(calendarMonth + 1).padStart(2, "0"),
                  String(day).padStart(2, "0"),
                ].join("-");

                const dayRecords = recordsByDate[dateKey] || [];
                const hasRecords = dayRecords.length > 0;
                const isToday =
                  dateKey ===
                  [
                    now.getFullYear(),
                    String(now.getMonth() + 1).padStart(2, "0"),
                    String(now.getDate()).padStart(2, "0"),
                  ].join("-");

                const uniqueStatuses = [
                  ...new Set(dayRecords.map((record) => normalizeStatus(record.status))),
                ];

                return (
                  <div
                    key={dateKey}
                    className={`min-h-20 border-b border-r border-white/5 p-1.5 sm:min-h-28 sm:p-2 ${
                      isToday ? "bg-amber-500/[0.07]" : ""
                    }`}
                  >
                    <div
                      className={`mb-2 flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                        isToday
                          ? "bg-amber-500 text-[#081226]"
                          : "text-slate-300"
                      }`}
                    >
                      {day}
                    </div>

                    {hasRecords ? (
                      <div className="space-y-1">
                        {uniqueStatuses.map((status) => (
                          <div
                            key={status}
                            className={`flex items-center justify-center gap-1 rounded-md border px-1 py-1 text-[10px] sm:justify-start sm:text-xs ${getStatusClasses(status)}`}
                            title={`${status}: ${dayRecords.filter((record) => normalizeStatus(record.status) === status).length} record(s)`}
                          >
                            <StatusIcon status={status} />
                            <span className="hidden sm:inline">{status}</span>
                          </div>
                        ))}

                        {dayRecords.length > 1 && (
                          <p className="text-center text-[10px] text-slate-500 sm:text-left">
                            {dayRecords.length} records
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="mt-1 text-center text-[10px] text-slate-600 sm:text-left sm:text-xs">
                        —
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Monthly records checklist */}
          <div className="space-y-3">
            <h3 className="font-semibold">
              Daily attendance details — {getMonthLabel(calendarYear, calendarMonth)}
            </h3>

            {monthlyRecords.length === 0 ? (
              <div className="rounded-xl border border-white/10 p-6 text-center text-sm text-slate-400">
                No saved attendance records for this student in this month.
              </div>
            ) : (
              Object.entries(recordsByDate)
                .sort(([a], [b]) => b.localeCompare(a))
                .map(([date, dayRecords]) => (
                  <div
                    key={date}
                    className="rounded-xl border border-white/10 bg-[#081226]/60 p-4"
                  >
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                      <CalendarDays className="h-4 w-4 text-amber-500" />
                      {date}
                    </div>

                    <div className="space-y-2">
                      {dayRecords.map((record, index) => {
                        const status = normalizeStatus(record.status);

                        return (
                          <div
                            key={record.id || `${date}-${index}`}
                            className="flex flex-col justify-between gap-2 rounded-lg border border-white/5 bg-white/[0.02] p-3 sm:flex-row sm:items-center"
                          >
                            <div>
                              <p className="text-sm font-medium">
                                {record.courseName || "Attendance"}
                              </p>
                              <p className="mt-1 text-xs text-slate-400">
                                {record.gradeLevel || selectedStudent.gradeLevel || "Grade not specified"}
                              </p>
                            </div>

                            <span
                              className={`flex w-fit items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold ${getStatusClasses(status)}`}
                            >
                              <StatusIcon status={status} />
                              {status}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
            )}
          </div>
        </section>
      )}

      {!selectedStudent && (
        <div className="rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-slate-400">
          Select a student above to view their attendance calendar and daily checklist.
        </div>
      )}
    </div>
  );
}
