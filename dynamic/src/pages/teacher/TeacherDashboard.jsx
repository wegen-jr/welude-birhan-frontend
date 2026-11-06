import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Users,
  CalendarDays,
  RefreshCw,
  GraduationCap,
  BookOpen,
  ClipboardCheck,
  Award,
  Search,
  Clock,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { useNavigate, useOutletContext } from "react-router-dom";
import AttendanceService from "../../services/teacher/AttendanceService";
import TeacherService from "../../services/teacher/TeacherService";
import TeacherStatCard from "../../Components/teacher/TeacherStatCard";
import StudentTable from "../../Components/teacher/StudentTable";
import { useLanguage } from "../../Contexts/LanguageContext";

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
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10);
}

export default function TeacherDashboard() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const outletContext = useOutletContext() || {};
  const isDarkMode = outletContext.isDarkMode ?? true;

  const [teacherProfile, setTeacherProfile] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [classesWithStudents, setClassesWithStudents] = useState([]);
  const [courseAssignments, setCourseAssignments] = useState([]);
  const [todayAttendanceRecords, setTodayAttendanceRecords] = useState([]);
  const [selectedClassIndex, setSelectedClassIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const today = useMemo(() => localDateString(), []);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      const tid = user?.tid || user?.id;

      if (!tid) {
        throw new Error(
          t.teacher?.common?.noTeacherId ||
            "Teacher ID not found in session. Please sign in again."
        );
      }

      setTeacherProfile(user);

      // Concurrent Axios queries strictly bound to backend API
      const [
        assignmentResponse,
        studentRosterResponse,
        attendanceResponse,
        courseAssignmentResponse,
      ] = await Promise.all([
        TeacherService.getTeacherAssignments().catch(() => []),
        TeacherService.getTeacherStudents(tid).catch(() => ({ classes: [] })),
        AttendanceService.getAll().catch(() => []),
        TeacherService.getCourseAssignments().catch(() => []),
      ]);

      // 1. Process assignments for this specific logged-in teacher
      const allAssignments = getRecords(assignmentResponse);
      const myAssignments = allAssignments.filter(
        (assignment) => String(assignment.teacherId) === String(tid)
      );
      setAssignments(myAssignments);

      // 2. Process classes and student rosters for this specific teacher
      const fetchedClasses = Array.isArray(studentRosterResponse?.classes)
        ? studentRosterResponse.classes
        : [];
      setClassesWithStudents(fetchedClasses);

      // 3. Process today's attendance records for this teacher
      const allAttendance = getRecords(attendanceResponse);
      const myTodayAttendance = allAttendance.filter((record) => {
        const recordTeacherId = record.teacherid ?? record.teacherId;
        const recordDate = String(record.date || "").slice(0, 10);
        return (
          String(recordTeacherId) === String(tid) && recordDate === today
        );
      });
      setTodayAttendanceRecords(myTodayAttendance);

      // 4. Process course curriculum assignments
      const allCourseAssignments = getRecords(courseAssignmentResponse);
      setCourseAssignments(allCourseAssignments);
    } catch (err) {
      console.error("Teacher Dashboard loading error:", err);
      setError(
        err.message ||
          t.teacher?.common?.loadError ||
          "Failed to load teacher dashboard data."
      );
    } finally {
      setLoading(false);
    }
  }, [t.teacher, today]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Compute all distinct students across all assigned classes (zero mock data)
  const allStudents = useMemo(() => {
    const list = classesWithStudents.flatMap((cls) => cls.students || []);
    // Deduplicate students by studentId
    const seen = new Set();
    const unique = [];
    for (const student of list) {
      const key = student.studentId || student.id;
      if (key && !seen.has(String(key))) {
        seen.add(String(key));
        unique.push(student);
      }
    }
    return unique;
  }, [classesWithStudents]);

  // Selected class data
  const currentClass = useMemo(() => {
    if (selectedClassIndex === -1) return null; // "All Classes"
    return classesWithStudents[selectedClassIndex] || null;
  }, [classesWithStudents, selectedClassIndex]);

  // Students to display in table based on class tab and search filter
  const displayedStudents = useMemo(() => {
    const baseList = currentClass ? currentClass.students || [] : allStudents;
    if (!searchQuery.trim()) return baseList;

    const query = searchQuery.toLowerCase().trim();
    return baseList.filter((s) => {
      const name = (s.fullname || s.name || "").toLowerCase();
      const id = String(s.studentId || s.id || "").toLowerCase();
      const grade = (s.gradeLevel || "").toLowerCase();
      return name.includes(query) || id.includes(query) || grade.includes(query);
    });
  }, [currentClass, allStudents, searchQuery]);

  // Real Attendance metrics strictly computed from live backend records
  const attendanceMetrics = useMemo(() => {
    let presentCount = 0;
    let absentCount = 0;
    let lateCount = 0;

    todayAttendanceRecords.forEach((rec) => {
      const status = String(rec.status || "").toUpperCase();
      if (status === "PRESENT") presentCount++;
      else if (status === "ABSENT") absentCount++;
      else if (status === "LATE") lateCount++;
    });

    return {
      present: presentCount,
      absent: absentCount,
      late: lateCount,
      totalRecorded: todayAttendanceRecords.length,
    };
  }, [todayAttendanceRecords]);

  // Schedule sessions bound to this teacher's assigned courses & classes
  const teacherSchedule = useMemo(() => {
    return assignments.map((assign) => {
      const matchingCourse = courseAssignments.find(
        (c) =>
          String(c.courseId) === String(assign.courseId) &&
          String(c.classLevel || c.gradeLevel).toLowerCase() ===
            String(assign.gradeLevel).toLowerCase()
      );

      return {
        id: assign.id || `${assign.courseId}-${assign.gradeLevel}`,
        gradeLevel: assign.gradeLevel,
        courseName: assign.courseName,
        courseId: assign.courseId,
        classLevel: matchingCourse?.classLevel || assign.gradeLevel,
      };
    });
  }, [assignments, courseAssignments]);

  const panelClass = isDarkMode
    ? "border-white/10 bg-[#101e36]"
    : "border-slate-200 bg-white shadow-sm";

  const mutedText = isDarkMode ? "text-slate-400" : "text-slate-500";

  if (loading) {
    return (
      <div
        className={`flex min-h-[60vh] flex-col items-center justify-center gap-3 p-6 ${mutedText}`}
      >
        <RefreshCw className="h-8 w-8 animate-spin text-amber-500" />
        <p className="text-sm font-medium">
          {t.teacher?.common?.loading || "Loading your instructor portal..."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-8">
      {/* 1. Header Banner & Profile */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-500 border border-amber-500/20">
              <GraduationCap className="h-3.5 w-3.5" />
              <span>Sunday School Instructor</span>
            </span>
            <span className={`text-xs ${mutedText}`}>
              ID: #{teacherProfile?.tid || teacherProfile?.id || "N/A"}
            </span>
          </div>

          <h1 className="mt-2 text-xl font-bold tracking-tight sm:text-2xl lg:text-3xl capitalize">
            {teacherProfile?.fullname || teacherProfile?.name || "Instructor"}
          </h1>

          <p className={`mt-1 text-xs sm:text-sm ${mutedText}`}>
            {t.teacher?.dashboard?.welcome ||
              "Welcome to your classroom dashboard. View active assignments, rosters, and daily attendance."}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadDashboard}
            title="Refresh Data"
            className={`flex items-center justify-center gap-2 rounded-xl border px-3.5 sm:px-4 py-2.5 text-xs sm:text-sm font-medium transition cursor-pointer ${
              isDarkMode
                ? "border-white/10 hover:bg-white/5 text-slate-200"
                : "border-slate-200 hover:bg-slate-100 text-slate-700"
            }`}
          >
            <RefreshCw className="h-4 w-4" />
            <span>{t.teacher?.common?.refresh || "Refresh"}</span>
          </button>

          <button
            type="button"
            disabled={assignments.length === 0}
            onClick={() => navigate("/teacherDashboard/attendance")}
            className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-bold text-[#081226] transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer shadow-sm"
          >
            <ClipboardCheck className="h-4 w-4" />
            <span>{t.teacher?.dashboard?.takeAttendance || "Take Attendance"}</span>
          </button>
        </div>
      </section>

      {/* Error Alert */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs sm:text-sm text-rose-400">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Unable to load all classroom data</p>
            <p className="mt-0.5">{error}</p>
          </div>
          <button
            type="button"
            onClick={loadDashboard}
            className="text-xs font-bold underline hover:text-rose-300"
          >
            Retry
          </button>
        </div>
      )}

      {/* 2. Top Statistic Cards - Perfect Responsive Grid: grid-cols-1, sm:grid-cols-2, lg:grid-cols-4 */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <TeacherStatCard
          title={t.teacher?.dashboard?.statClasses || "Assigned Classes"}
          value={assignments.length}
          type="classes"
          isDarkMode={isDarkMode}
          description={
            assignments.length === 0
              ? "No classes assigned yet"
              : `${assignments.length} active classroom sections`
          }
        />

        <TeacherStatCard
          title={t.teacher?.dashboard?.statStudents || "Enrolled Students"}
          value={allStudents.length}
          type="students"
          isDarkMode={isDarkMode}
          description={
            allStudents.length === 0
              ? "No students enrolled yet"
              : `Across ${classesWithStudents.length} class roster(s)`
          }
        />

        <TeacherStatCard
          title={t.teacher?.dashboard?.statPresent || "Present Today"}
          value={attendanceMetrics.present}
          type="present"
          isDarkMode={isDarkMode}
          description={`Date: ${today}`}
        />

        <TeacherStatCard
          title={t.teacher?.dashboard?.statAbsent || "Absent / Pending"}
          value={
            attendanceMetrics.totalRecorded > 0
              ? attendanceMetrics.absent + attendanceMetrics.late
              : allStudents.length > 0
              ? allStudents.length - attendanceMetrics.present
              : 0
          }
          type="absent"
          isDarkMode={isDarkMode}
          description={
            attendanceMetrics.totalRecorded > 0
              ? `${attendanceMetrics.absent} Absent · ${attendanceMetrics.late} Late`
              : "Attendance not taken yet"
          }
        />
      </section>

      {/* 3. Assigned Classes & Schedules Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight">
              {t.teacher?.dashboard?.assignedClasses || "Assigned Classes & Subjects"}
            </h2>
            <p className={`text-xs sm:text-sm ${mutedText}`}>
              Active curriculum courses and Sunday School sections assigned to you
            </p>
          </div>
        </div>

        {assignments.length === 0 ? (
          /* Empty State: Zero classes assigned */
          <div
            className={`rounded-2xl border border-dashed p-8 text-center transition-colors ${
              isDarkMode
                ? "border-amber-500/20 bg-amber-500/5 text-slate-300"
                : "border-amber-200 bg-amber-50 text-slate-700"
            }`}
          >
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
              <GraduationCap className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-amber-500">
              No classes assigned yet.
            </h3>
            <p className="mx-auto mt-1 max-w-md text-xs sm:text-sm text-slate-400">
              You are not currently assigned to any Sunday School classes. Contact
              your Education Hub department lead to assign curriculum sections.
            </p>
          </div>
        ) : (
          /* Responsive Class Cards Grid: grid-cols-1, sm:grid-cols-2, lg:grid-cols-3, xl:grid-cols-4 */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {assignments.map((assignment, index) => {
              const classRoster = classesWithStudents.find(
                (c) =>
                  String(c.gradeLevel).toLowerCase() ===
                    String(assignment.gradeLevel).toLowerCase() ||
                  String(c.courseId) === String(assignment.courseId)
              );
              const studentCount = classRoster?.students?.length || 0;

              return (
                <div
                  key={`${assignment.courseId}-${assignment.gradeLevel}-${index}`}
                  className={`group relative flex flex-col justify-between rounded-2xl border p-5 transition-all duration-200 hover:border-amber-500/50 ${panelClass}`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="inline-block rounded-lg bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-500 border border-amber-500/20">
                        {assignment.gradeLevel || "General Class"}
                      </span>
                      <span className={`text-xs font-mono ${mutedText}`}>
                        #C-{assignment.courseId}
                      </span>
                    </div>

                    <h3 className="mt-3 text-base font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-amber-400 transition-colors">
                      {assignment.courseName || "Curriculum Course"}
                    </h3>

                    <p className={`mt-1 text-xs ${mutedText} flex items-center gap-1.5`}>
                      <Users className="h-3.5 w-3.5 text-amber-500" />
                      <span>{studentCount} enrolled student(s)</span>
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-inherit flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => navigate("/teacherDashboard/attendance")}
                      className="font-semibold text-amber-500 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Attendance</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate("/teacherDashboard/results")}
                      className={`font-medium hover:underline flex items-center gap-1 cursor-pointer ${
                        isDarkMode ? "text-slate-300" : "text-slate-600"
                      }`}
                    >
                      <Award className="h-3.5 w-3.5 text-amber-500" />
                      <span>Results</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. Student Roster Module */}
      <section className={`rounded-2xl border p-4 sm:p-6 ${panelClass}`}>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold tracking-tight">
                {t.teacher?.dashboard?.studentList || "Student Rosters"}
              </h2>
              <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-500">
                {displayedStudents.length}
              </span>
            </div>
            <p className={`mt-0.5 text-xs sm:text-sm ${mutedText}`}>
              {t.teacher?.dashboard?.studentListDescription ||
                "View and manage registered students in your assigned classroom rosters."}
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search student or ID..."
              className={`w-full rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm border outline-none focus:ring-2 focus:ring-amber-500/50 transition-all ${
                isDarkMode
                  ? "bg-white/5 border-white/10 text-white placeholder-slate-500"
                  : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
              }`}
            />
          </div>
        </div>

        {/* Class Filter Tabs if multiple classes exist */}
        {classesWithStudents.length > 1 && (
          <div className="mt-4 flex flex-wrap gap-2 border-b border-inherit pb-3">
            <button
              type="button"
              onClick={() => setSelectedClassIndex(-1)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                selectedClassIndex === -1
                  ? "bg-amber-500 text-[#081226]"
                  : isDarkMode
                  ? "bg-white/5 text-slate-300 hover:bg-white/10"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              All Sections ({allStudents.length})
            </button>

            {classesWithStudents.map((cls, idx) => (
              <button
                key={`${cls.gradeLevel}-${idx}`}
                type="button"
                onClick={() => setSelectedClassIndex(idx)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                  selectedClassIndex === idx
                    ? "bg-amber-500 text-[#081226]"
                    : isDarkMode
                    ? "bg-white/5 text-slate-300 hover:bg-white/10"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {cls.gradeLevel} ({cls.students?.length || 0})
              </button>
            ))}
          </div>
        )}

        {/* Student Table or Empty State */}
        <div className="mt-4">
          {displayedStudents.length > 0 ? (
            <StudentTable
              students={displayedStudents}
              labels={{
                empty: "No students match your filter.",
                emptyDescription: "Try searching with a different student name or ID.",
                number: "No.",
                name: "Full Name",
                studentId: "Student ID",
                gradeLevel: "Grade / Section",
                actions: "Actions",
              }}
              isDarkMode={isDarkMode}
              renderActions={(student) => (
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/teacherDashboard/attendance-list?search=${encodeURIComponent(
                        student.studentId || ""
                      )}`
                    )
                  }
                  className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-500 hover:bg-amber-500/20 transition cursor-pointer"
                >
                  History
                </button>
              )}
            />
          ) : (
            /* Empty State for Students */
            <div
              className={`rounded-2xl border border-dashed p-8 text-center transition-colors ${
                isDarkMode ? "border-white/10 text-slate-400" : "border-slate-200 text-slate-500"
              }`}
            >
              <Users className="mx-auto mb-3 h-8 w-8 text-amber-500/60" />
              <h3
                className={`text-sm sm:text-base font-bold ${
                  isDarkMode ? "text-slate-200" : "text-slate-800"
                }`}
              >
                {searchQuery
                  ? "No matching students found"
                  : "No students enrolled in this section yet."}
              </h3>
              <p className="mt-1 text-xs sm:text-sm">
                {searchQuery
                  ? `No students match "${searchQuery}". Clear your search query to see all enrolled students.`
                  : "Enrolled students will appear here automatically once registered in the Education Hub."}
              </p>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="mt-3 text-xs font-semibold text-amber-500 hover:underline"
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer Info & Quick Action */}
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-inherit pt-4">
          <p className={`text-xs sm:text-sm ${mutedText} flex items-center gap-1.5`}>
            <CalendarDays className="h-4 w-4 text-amber-500" />
            <span>
              {t.teacher?.dashboard?.attendanceDate || "Today's Date"}: {today}
            </span>
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate("/teacherDashboard/attendance-list")}
              className={`rounded-xl border px-4 py-2 text-xs sm:text-sm font-medium transition cursor-pointer ${
                isDarkMode
                  ? "border-white/10 hover:bg-white/5 text-slate-300"
                  : "border-slate-200 hover:bg-slate-100 text-slate-700"
              }`}
            >
              Attendance History
            </button>

            <button
              type="button"
              disabled={assignments.length === 0}
              onClick={() => navigate("/teacherDashboard/attendance")}
              className="rounded-xl bg-amber-500 px-4 py-2 text-xs sm:text-sm font-bold text-[#081226] transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            >
              {t.teacher?.dashboard?.takeAttendance || "Take Attendance"}
            </button>
          </div>
        </div>
      </section>

      {/* 5. Schedule & Curriculum Overview */}
      <section className={`rounded-2xl border p-4 sm:p-6 ${panelClass}`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight">
              Class Schedule & Teaching Program
            </h2>
            <p className={`text-xs sm:text-sm ${mutedText}`}>
              Curriculum breakdown for your assigned instructional sessions
            </p>
          </div>
        </div>

        {teacherSchedule.length === 0 ? (
          <div
            className={`rounded-2xl border border-dashed p-6 text-center text-xs sm:text-sm ${
              isDarkMode ? "border-white/10 text-slate-400" : "border-slate-200 text-slate-500"
            }`}
          >
            <Clock className="mx-auto mb-2 h-6 w-6 text-slate-500" />
            <p className="font-medium">No teaching schedule recorded yet.</p>
            <p className="mt-0.5 text-xs">
              Assignments will be listed here once assigned by the Education Hub.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {teacherSchedule.map((item, idx) => (
              <div
                key={`${item.id}-${idx}`}
                className={`p-4 rounded-xl border flex items-start gap-3 transition-colors ${
                  isDarkMode
                    ? "bg-white/[0.02] border-white/10"
                    : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {item.courseName}
                  </h4>
                  <p className={`text-xs ${mutedText} mt-0.5`}>
                    Class: <span className="font-semibold text-amber-500">{item.gradeLevel}</span>
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Sunday School Academic Program
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
