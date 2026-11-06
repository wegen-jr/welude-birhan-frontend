
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  Download,
  RefreshCw,
  Save,
  Users,
} from "lucide-react";

import { useLanguage } from "../../Contexts/LanguageContext";
import TeacherService from "../../services/teacher/TeacherService";
import StudentResultService from "../../services/teacher/StudentResultService";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const COMPONENTS = [
  { key: "quiz", label: "Quiz", max: 10 },
  { key: "assignment", label: "Assignment", max: 10 },
  { key: "midterm", label: "Midterm Exam", max: 30 },
  { key: "finalExam", label: "Final Exam", max: 50 },
];

function getRecords(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.records)) return response.records;
  if (Array.isArray(response?.data?.records)) return response.data.records;
  return [];
}

function getTeacherId() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null")?.tid;
  } catch {
    return null;
  }
}

function getExistingResult(records, student, selectedClass) {
  return records.find((record) => {
    const recordCourseId = record.courceId ?? record.courseId;

    return (
      String(record.studentId) === String(student.studentId) &&
      String(recordCourseId) === String(selectedClass.courseId) &&
      String(record.gradeLevel || "").toUpperCase() ===
        String(selectedClass.gradeLevel || "").toUpperCase()
    );
  });
}

function calculateTotal(scores) {
  const values = COMPONENTS.map((component) => {
    const value = scores?.[component.key];

    if (value === "" || value === undefined || value === null) return null;

    const number = Number(value);
    if (!Number.isFinite(number) || number < 0 || number > component.max) {
      return null;
    }

    return number;
  });

  if (values.some((value) => value === null)) return null;
  return values.reduce((sum, value) => sum + value, 0);
}

function validateScores(scores) {
  for (const component of COMPONENTS) {
    const rawValue = scores?.[component.key];

    if (rawValue === "" || rawValue === undefined || rawValue === null) {
      return `${component.label} mark is required.`;
    }

    const value = Number(rawValue);

    if (
      !Number.isFinite(value) ||
      value < 0 ||
      value > component.max
    ) {
      return `${component.label} must be between 0 and ${component.max}.`;
    }
  }

  return "";
}

export default function StudentResults() {
  const { t } = useLanguage();

  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [records, setRecords] = useState([]);
  const [scoresByStudent, setScoresByStudent] = useState({});

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const teacherId = getTeacherId();

  const selectedClass = useMemo(
    () =>
      classes.find(
        (item) => String(item.assignmentId) === String(selectedClassId)
      ) || null,
    [classes, selectedClassId]
  );

  const students = useMemo(
    () => selectedClass?.students || [],
    [selectedClass]
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const tid = getTeacherId();

      if (tid === null || tid === undefined || tid === "") {
        throw new Error("Teacher ID not found. Please sign in again.");
      }

      const [classResponse, resultResponse] = await Promise.all([
        TeacherService.getTeacherStudents(tid),
        StudentResultService.getAll(),
      ]);

      const teacherClasses = Array.isArray(classResponse?.classes)
        ? classResponse.classes
        : [];

      setClasses(teacherClasses);
      setRecords(getRecords(resultResponse));

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
      setError(err.message || "Unable to load student results.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reset draft marks when the teacher changes classes.
  useEffect(() => {
    setScoresByStudent({});
    setError("");
    setMessage("");
  }, [selectedClassId]);

  const resultByStudent = useMemo(() => {
    if (!selectedClass) return {};

    const result = {};

    students.forEach((student) => {
      const existing = getExistingResult(records, student, selectedClass);

      if (existing) {
        result[String(student.studentId)] = existing;
      }
    });

    return result;
  }, [records, students, selectedClass, teacherId]);

  const setStudentScore = (studentId, componentKey, value) => {
    setScoresByStudent((current) => ({
      ...current,
      [String(studentId)]: {
        ...(current[String(studentId)] || {}),
        [componentKey]: value,
      },
    }));

    setError("");
    setMessage("");
  };

  const getScores = (studentId) =>
    scoresByStudent[String(studentId)] || {};

  const getTotal = (studentId) =>
    calculateTotal(getScores(studentId));

  const exportGradeReport = () => {
    if (!selectedClass) {
      setError("Please select an assigned class before exporting.");
      return;
    }

    if (students.length === 0) {
      setError("There are no students in this class to include in the report.");
      return;
    }

    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const courseName = selectedClass.courseName || "Course";
      const gradeLevel = selectedClass.gradeLevel || "Grade not specified";

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("STUDENT GRADE REPORT", 14, 18);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.text(`Course: ${courseName}`, 14, 27);
      doc.text(`Grade Level: ${gradeLevel}`, 14, 34);
      doc.setFontSize(9);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 41);

      const rows = students.map((student) => {
        const studentId = String(student.studentId ?? "");
        const savedResult = resultByStudent[studentId];
        const draftTotal = calculateTotal(getScores(studentId));
        const total = savedResult?.result ?? (draftTotal !== null ? draftTotal : null);

        return [
          student.fullname || "—",
          student.studentId || "—",
          student.gradeLevel || selectedClass.gradeLevel || "—",
          total === null || total === undefined || total === ""
            ? "Not submitted"
            : `${Number(total).toFixed(2)} / 100`,
        ];
      });

      autoTable(doc, {
        startY: 47,
        head: [["Full Name", "Student ID", "Grade Level", "Total Marks"]],
        body: rows,
        theme: "grid",
        styles: { font: "helvetica", fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [8, 18, 38], textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [245, 247, 250] },
        margin: { left: 14, right: 14 },
      });

      const safeCourseName = courseName
        .replace(/[^a-z0-9-_ ]/gi, "")
        .trim()
        .replace(/\s+/g, "_");
      const safeGradeLevel = String(gradeLevel).replace(/\s+/g, "_");

      doc.save(`Grade_Report_${safeCourseName || "Course"}_${safeGradeLevel}.pdf`);
      setError("");
      setMessage("Grade report PDF generated.");
    } catch (err) {
      setError(err.message || "Unable to generate the PDF report.");
    }
  };

  const submitResults = async () => {
    setError("");
    setMessage("");

    if (!selectedClass) {
      setError("Please select an assigned class.");
      return;
    }

    if (students.length === 0) {
      setError("There are no students enrolled in this class.");
      return;
    }

    if (teacherId === null || teacherId === undefined || teacherId === "") {
      setError("Teacher ID not found. Please sign in again.");
      return;
    }

    // Validate every row before sending anything to the backend.
    for (const student of students) {
      const studentScores = getScores(student.studentId);
      const validationError = validateScores(studentScores);

      if (validationError) {
        setError(`${student.fullname || student.studentId}: ${validationError}`);
        return;
      }
    }

    setSaving(true);

    let created = 0;
    let updated = 0;
    let processed = 0;

    try {
      for (const student of students) {
        const total = calculateTotal(getScores(student.studentId));

        if (total === null || total < 0 || total > 100) {
          throw new Error(
            `Invalid total mark for ${student.fullname || student.studentId}.`
          );
        }

        const existing = getExistingResult(records, student, selectedClass);

        if (existing) {
          await StudentResultService.update(existing.id, {
            result: total,
          });

          updated += 1;
        } else {
          await StudentResultService.create({
            studentId: student.studentId,

            // The backend documentation spells this field "courceId".
            courceId: selectedClass.courseId,

            gradeLevel: selectedClass.gradeLevel,
            teacherId: Number(teacherId),
            date: new Date().toISOString(),
            result: total,
          });

          created += 1;
        }

        processed += 1;
      }

      setMessage(
        `Results submitted successfully. Created: ${created}; updated: ${updated}.`
      );

      // Refresh saved records so future submissions use the latest IDs.
      const refreshedResponse = await StudentResultService.getAll();
      setRecords(getRecords(refreshedResponse));

      // Keep the entered marks visible until the teacher changes class.
    } catch (err) {
      setError(
        `${err.message || "Unable to submit results."} Processed ${processed} of ${students.length} students. Refresh records before retrying.`
      );

      // Some requests may have succeeded before a later request failed.
      try {
        const refreshedResponse = await StudentResultService.getAll();
        setRecords(getRecords(refreshedResponse));
      } catch {
        // Keep the original error.
      }
    } finally {
      setSaving(false);
    }
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
            Student Results
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Enter assessment marks and submit the final total out of 100.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={exportGradeReport}
            disabled={!selectedClass || students.length === 0 || saving}
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Export Grade Report PDF
          </button>

          <button
            type="button"
            onClick={loadData}
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm transition hover:bg-white/5 disabled:opacity-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
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
          <CheckCircle2 className="mr-2 inline h-4 w-4" />
          {message}
        </div>
      )}

      {/* Assigned class selection */}
      <section className="rounded-2xl border border-white/10 bg-[#101e36] p-5">
        <label
          htmlFor="results-class"
          className="mb-2 block text-sm font-medium text-slate-300"
        >
          Select assigned grade / class
        </label>

        <select
          id="results-class"
          value={selectedClassId}
          disabled={!classes.length || saving}
          onChange={(event) => setSelectedClassId(event.target.value)}
          className="w-full rounded-xl border border-white/10 bg-[#081226] px-4 py-3 text-white outline-none focus:border-amber-500"
        >
          {!classes.length && (
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
            <span>
              <BookOpen className="mr-1 inline h-4 w-4" />
              {selectedClass.courseName}
            </span>
            <span>Grade: {selectedClass.gradeLevel}</span>
            <span>
              <Users className="mr-1 inline h-4 w-4" />
              {students.length} students
            </span>
          </div>
        )}
      </section>

      {/* Grading rules */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {COMPONENTS.map((component) => (
          <div
            key={component.key}
            className="rounded-xl border border-white/10 bg-[#101e36] p-4"
          >
            <p className="text-sm text-slate-400">{component.label}</p>
            <p className="mt-2 text-2xl font-bold">
              {component.max}
              <span className="ml-1 text-sm font-normal text-slate-500">
                marks
              </span>
            </p>
          </div>
        ))}
      </section>

      {/* Students and assessment marks */}
      {!classes.length ? (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 text-amber-500">
          You do not have any assigned classes.
        </div>
      ) : students.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#101e36] p-8 text-center text-slate-400">
          No students are enrolled in this class.
        </div>
      ) : (
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#101e36]">
          <div className="border-b border-white/10 p-5">
            <p className="mb-1 text-sm font-medium text-amber-500">
              {selectedClass?.courseName}
            </p>
            <h2 className="text-lg font-bold">
              {selectedClass?.gradeLevel} — Assessment marks
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Enter each component mark. The total is calculated automatically.
              Previously saved results can be updated.
            </p>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[1050px] text-left">
              <thead className="bg-white/5 text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-4 py-4">Student</th>
                  <th className="px-4 py-4">Student ID</th>
                  <th className="px-3 py-4">Quiz /10</th>
                  <th className="px-3 py-4">Assignment /10</th>
                  <th className="px-3 py-4">Midterm /30</th>
                  <th className="px-3 py-4">Final /50</th>
                  <th className="px-4 py-4">Total /100</th>
                  <th className="px-4 py-4">Saved result</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5">
                {students.map((student) => {
                  const studentId = String(student.studentId);
                  const studentScores = getScores(studentId);
                  const total = calculateTotal(studentScores);
                  const existing = resultByStudent[studentId];

                  return (
                    <tr
                      key={student.id || studentId}
                      className="hover:bg-white/[0.03]"
                    >
                      <td className="px-4 py-4 font-medium">
                        {student.fullname || "—"}
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-400">
                        {student.studentId}
                      </td>

                      {COMPONENTS.map((component) => (
                        <td key={component.key} className="px-3 py-4">
                          <input
                            type="number"
                            min="0"
                            max={component.max}
                            step="0.01"
                            value={studentScores[component.key] ?? ""}
                            disabled={saving}
                            onChange={(event) => {
                              const value = event.target.value;

                              if (
                                value !== "" &&
                                Number(value) > component.max
                              ) {
                                return;
                              }

                              setStudentScore(
                                studentId,
                                component.key,
                                value
                              );
                            }}
                            aria-label={`${component.label} mark for ${student.fullname || studentId}`}
                            className="w-24 rounded-lg border border-white/10 bg-[#081226] px-3 py-2 text-sm text-white outline-none focus:border-amber-500 disabled:opacity-50"
                            placeholder={`0-${component.max}`}
                          />
                        </td>
                      ))}

                      <td className="px-4 py-4">
                        <span className="rounded-lg bg-amber-500/10 px-3 py-2 font-bold text-amber-500">
                          {total === null ? "—" : total.toFixed(2)}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        {existing ? (
                          <div>
                            <span className="font-semibold text-emerald-400">
                              {Number(existing.result).toFixed(2)}/100
                            </span>
                            <p className="mt-1 text-xs text-slate-500">
                              Saved · will update on submit
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500">
                            Not submitted
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col justify-between gap-4 border-t border-white/10 p-5 sm:flex-row sm:items-center">
            <div>
              <p className="font-semibold">
                {students.length} students
              </p>
              <p className="mt-1 text-sm text-slate-400">
                Check all component marks before submitting this class.
              </p>
            </div>

            <button
              type="button"
              onClick={submitResults}
              disabled={saving || students.length === 0}
              className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3 font-semibold text-[#081226] transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? "Submitting results..." : "Submit class results"}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}