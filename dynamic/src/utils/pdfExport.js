import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Helper to draw a standard header & brand banner on the first page
 */
function drawDocumentHeader(doc, { title, subtitle, metaPairs = [] }) {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Top brand band
  doc.setFillColor(11, 27, 61); // Brand Navy (#0b1b3d)
  doc.rect(0, 0, pageWidth, 24, "F");

  // Church Name in Banner
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(245, 158, 11); // Amber-500
  doc.text("WELUDE BIRHAN SUNDAY SCHOOL", 14, 11);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(226, 232, 240); // Slate-200
  doc.text("Education Hub & Academic Administration", 14, 18);

  // Document Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42); // Slate-900
  doc.text(title, 14, 34);

  // Subtitle / Scope
  if (subtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.text(subtitle, 14, 40);
  }

  // Meta grid (2 columns)
  let currentY = subtitle ? 48 : 42;
  const leftColX = 14;
  const rightColX = pageWidth / 2 + 5;

  doc.setFontSize(8.5);
  metaPairs.forEach((pair, index) => {
    const isRight = index % 2 === 1;
    const x = isRight ? rightColX : leftColX;
    const y = currentY + Math.floor(index / 2) * 6;

    // Render bold label and measure accurately with bold font
    doc.setFont("helvetica", "bold");
    doc.setTextColor(71, 85, 105); // Slate-600
    const labelText = `${pair.label}:`;
    doc.text(labelText, x, y);
    const labelWidth = doc.getTextWidth(labelText);

    // Render dynamic value cleanly to the right of the label with +3mm offset
    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42); // Slate-900
    const valText = pair.value !== undefined && pair.value !== null ? String(pair.value) : "N/A";
    doc.text(valText, x + labelWidth + 3, y);
  });

  const totalMetaRows = Math.ceil(metaPairs.length / 2);
  const endY = currentY + totalMetaRows * 6 + 4;

  // Thin separator rule
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(14, endY, pageWidth - 14, endY);

  return endY + 4;
}

/**
 * Standard footer hook for page numbers and audit date
 */
function attachPageFooters(doc) {
  const pageCount = doc.internal.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // Slate-400

    // Footer divider line
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);

    doc.text(
      "Holy Trinity Sunday School - Welude Birhan Education Hub Official Record",
      14,
      pageHeight - 7
    );

    const pageStr = `Page ${i} of ${pageCount}`;
    const pageStrWidth = doc.getTextWidth(pageStr);
    doc.text(pageStr, pageWidth - 14 - pageStrWidth, pageHeight - 7);
  }
}

/**
 * 1. Generate Teacher Student Roster Slip (PDF)
 */
export function generateTeacherStudentsSlipPdf(teacher, students = [], teacherMeta = {}) {
  const doc = new jsPDF("p", "mm", "a4");
  const teacherName = teacher?.name || teacherMeta?.teacherName || "Instructor";
  const safeName = teacherName.replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase();
  const timestamp = new Date().toLocaleString();

  const startY = drawDocumentHeader(doc, {
    title: `Student Roster - ${teacherName}`,
    subtitle: "Official Sunday School classroom roster and student enrollment record",
    metaPairs: [
      { label: "Teacher Name", value: `${teacherName} (ID: #${teacher?.id || "N/A"})` },
      { label: "Generated Date", value: timestamp },
      { label: "Department", value: teacher?.department || "General Spiritual Education" },
      { label: "Total Enrolled Students", value: students.length },
      { label: "Assigned Classroom(s)", value: teacherMeta?.gradeLevel || teacher?.assignedClasses?.map((c) => c.gradeLevel).filter(Boolean).join(", ") || "General" },
      { label: "Contact Phone", value: teacher?.phone || "N/A" },
    ],
  });

  const tableHead = [["#", "Student ID", "Full Name", "Grade Level", "Section", "Enrollment Date", "Status"]];
  const tableBody = students.map((s, idx) => [
    idx + 1,
    s.studentId || "N/A",
    s.fullname || s.name || "Unknown",
    s.gradeLevel || "N/A",
    s.section || "A",
    s.enrollmentDate ? new Date(s.enrollmentDate).toLocaleDateString() : "Active",
    s.status || "ACTIVE",
  ]);

  if (tableBody.length === 0) {
    tableBody.push(["—", "—", "No students currently assigned to this teacher", "—", "—", "—", "—"]);
  }

  autoTable(doc, {
    startY,
    head: tableHead,
    body: tableBody,
    theme: "striped",
    headStyles: {
      fillColor: [11, 27, 61], // Brand Navy
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8.5,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 26, fontStyle: "bold", textColor: [180, 83, 9] },
      2: { cellWidth: 50 },
      3: { cellWidth: 32 },
      4: { cellWidth: 18, halign: "center" },
      5: { cellWidth: 26 },
      6: { cellWidth: 20, halign: "center" },
    },
    margin: { left: 14, right: 14, bottom: 16 },
  });

  attachPageFooters(doc);
  const filename = `student_roster_${safeName}_${teacher?.id || "doc"}.pdf`;
  doc.save(filename);
  return filename;
}

/**
 * 2. Generate Single Course Slip (PDF)
 */
export function generateSingleCourseSlipPdf(course, { classAssignments = [], teachers = [], enrollments = [] } = {}) {
  const doc = new jsPDF("p", "mm", "a4");
  const courseId = course?.id || "N/A";
  const courseName = course?.courseName || course?.name || "Untitled Course";
  const creditHours = course?.creditHours ?? course?.craditHours ?? 0;
  const timestamp = new Date().toLocaleString();

  // Find assigned classes for this course
  const relevantAssignments = classAssignments.filter(
    (a) => Number(a.courseId) === Number(courseId) || (a.courseName && a.courseName.toLowerCase() === courseName.toLowerCase())
  );

  const assignedClassesStr = relevantAssignments.length > 0
    ? relevantAssignments.map((a) => a.classLevel || a.gradeLevel || "Class").join(", ")
    : "Unassigned";

  // Find teachers assigned to this course
  const assignedTeachersList = teachers.filter(
    (t) => (t.assignedCourseId && Number(t.assignedCourseId) === Number(courseId)) ||
           (t.assignedCourseName && t.assignedCourseName.toLowerCase() === courseName.toLowerCase()) ||
           (t.courseId && Number(t.courseId) === Number(courseId))
  );

  const assignedTeachersStr = assignedTeachersList.length > 0
    ? assignedTeachersList.map((t) => t.name || t.teacherName).join(", ")
    : "None";

  // Find students enrolled in the grades assigned to this course
  const assignedGradeSet = new Set(
    relevantAssignments.map((a) => String(a.classLevel || a.gradeLevel || "").trim().toLowerCase()).filter(Boolean)
  );

  const studentRows = enrollments.filter((student) => {
    if (assignedGradeSet.size === 0) return false;
    const studentGrade = String(student.gradeLevel || "").trim().toLowerCase();
    return assignedGradeSet.has(studentGrade);
  });

  const startY = drawDocumentHeader(doc, {
    title: `Course Slip - ${courseName}`,
    subtitle: "Official course curriculum slip, faculty assignments, and enrolled student roster",
    metaPairs: [
      { label: "Course Name", value: `${courseName} (ID: #${courseId})` },
      { label: "Generated Date", value: timestamp },
      { label: "Credit Hours", value: `${creditHours} Cr. Hrs` },
      { label: "Enrolled Students", value: studentRows.length },
      { label: "Assigned Grade Levels", value: assignedClassesStr },
      { label: "Course Instructors", value: assignedTeachersStr },
    ],
  });

  const tableHead = [["#", "Student ID", "Full Name", "Grade Level", "Section", "Academic Year", "Enrollment Date", "Status"]];
  const tableBody = studentRows.map((s, idx) => [
    idx + 1,
    s.studentId || "N/A",
    s.fullname || s.name || "Unknown",
    s.gradeLevel || "N/A",
    s.section || "A",
    s.year || new Date().getFullYear(),
    s.enrolledAt ? new Date(s.enrolledAt).toLocaleDateString() : "Active",
    s.status || "ACTIVE",
  ]);

  if (tableBody.length === 0) {
    tableBody.push(["—", "—", "No students currently enrolled in the assigned grade sections for this course", "—", "—", "—", "—", "—"]);
  }

  autoTable(doc, {
    startY,
    head: tableHead,
    body: tableBody,
    theme: "striped",
    headStyles: {
      fillColor: [11, 27, 61],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8.5,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 26, fontStyle: "bold", textColor: [180, 83, 9] },
      2: { cellWidth: 46 },
      3: { cellWidth: 28 },
      4: { cellWidth: 16, halign: "center" },
      5: { cellWidth: 20, halign: "center" },
      6: { cellWidth: 24 },
      7: { cellWidth: 18, halign: "center" },
    },
    margin: { left: 14, right: 14, bottom: 16 },
  });

  attachPageFooters(doc);
  const safeName = courseName.replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase();
  const filename = `course_slip_${safeName}_${courseId}.pdf`;
  doc.save(filename);
  return filename;
}

/**
 * 3. Generate Complete Curriculum Catalog & Course Slip Report (PDF)
 */
export function generateAllCoursesCatalogPdf(courses = [], { classAssignments = [], teachers = [], enrollments = [] } = {}) {
  const doc = new jsPDF("p", "mm", "a4");
  const timestamp = new Date().toLocaleString();

  const startY = drawDocumentHeader(doc, {
    title: "Curriculum Catalog & Course Slip Report",
    subtitle: "Comprehensive curriculum directory, classroom allocations, and faculty assignments",
    metaPairs: [
      { label: "Total Courses in Catalog", value: courses.length },
      { label: "Generated Date", value: timestamp },
      { label: "Total Class Assignments", value: classAssignments.length },
      { label: "Total Enrolled Students", value: enrollments.length },
      { label: "Active Faculty Teachers", value: teachers.length },
      { label: "Academic Department", value: "Sunday School Education Hub" },
    ],
  });

  const tableHead = [["#", "Course Code / ID", "Course Name", "Credits", "Assigned Grades", "Assigned Faculty", "Enrolled Students"]];
  const tableBody = courses.map((c, idx) => {
    const courseId = c.id;
    const courseName = c.courseName || c.name || "";
    const credits = c.creditHours ?? c.craditHours ?? 0;

    // Assigned classes
    const cAssignments = classAssignments.filter(
      (a) => Number(a.courseId) === Number(courseId) || (a.courseName && a.courseName.toLowerCase() === courseName.toLowerCase())
    );
    const assignedClasses = cAssignments.map((a) => a.classLevel || a.gradeLevel).filter(Boolean);
    const assignedClassesStr = assignedClasses.length > 0 ? assignedClasses.join(", ") : "Unassigned";

    // Assigned teachers
    const cTeachers = teachers.filter(
      (t) => (t.assignedCourseId && Number(t.assignedCourseId) === Number(courseId)) ||
             (t.assignedCourseName && t.assignedCourseName.toLowerCase() === courseName.toLowerCase()) ||
             (t.courseId && Number(t.courseId) === Number(courseId))
    );
    const assignedTeachersStr = cTeachers.length > 0 ? cTeachers.map((t) => t.name || t.teacherName).join(", ") : "None";

    // Enrolled students count in assigned grades
    const gradeSet = new Set(assignedClasses.map((g) => String(g).trim().toLowerCase()));
    const matchingStudents = enrollments.filter((s) => gradeSet.has(String(s.gradeLevel || "").trim().toLowerCase()));

    return [
      idx + 1,
      `CRS-${courseId}`,
      courseName,
      `${credits} Cr.`,
      assignedClassesStr,
      assignedTeachersStr,
      matchingStudents.length,
    ];
  });

  if (tableBody.length === 0) {
    tableBody.push(["—", "—", "No courses registered in the academic catalog", "—", "—", "—", "—"]);
  }

  autoTable(doc, {
    startY,
    head: tableHead,
    body: tableBody,
    theme: "striped",
    headStyles: {
      fillColor: [11, 27, 61],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8.5,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 26, fontStyle: "bold", textColor: [180, 83, 9] },
      2: { cellWidth: 46 },
      3: { cellWidth: 18, halign: "center" },
      4: { cellWidth: 34 },
      5: { cellWidth: 32 },
      6: { cellWidth: 18, halign: "center" },
    },
    margin: { left: 14, right: 14, bottom: 16 },
  });

  attachPageFooters(doc);
  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = `curriculum_catalog_report_${dateStr}.pdf`;
  doc.save(filename);
  return filename;
}

/**
 * 4. Generate Class Roster Slip (PDF)
 */
export function generateClassRosterSlipPdf(selectedClass, roster = []) {
  const doc = new jsPDF("p", "mm", "a4");
  const gradeLevel = selectedClass?.gradeLevel || "General";
  const section = selectedClass?.section || "A";
  const timestamp = new Date().toLocaleString();

  const startY = drawDocumentHeader(doc, {
    title: `Class Roster Slip - ${gradeLevel} (Section ${section})`,
    subtitle: "Official student attendance roster and classroom enrollment record",
    metaPairs: [
      { label: "Grade Level", value: gradeLevel },
      { label: "Generated Date", value: timestamp },
      { label: "Section", value: section },
      { label: "Total Enrolled Students", value: roster.length },
      { label: "Academic Department", value: "Sunday School Education Hub" },
      { label: "Classroom Status", value: "Active Session" },
    ],
  });

  const tableHead = [["#", "Student ID", "Full Name", "Academic Year", "Enrollment Date", "Status"]];
  const tableBody = roster.map((s, idx) => [
    idx + 1,
    s.studentId || s.id || "N/A",
    s.fullname || s.name || "Unknown",
    s.year || new Date().getFullYear(),
    s.enrolledAt ? new Date(s.enrolledAt).toLocaleDateString() : "Active",
    s.status || "ACTIVE",
  ]);

  if (tableBody.length === 0) {
    tableBody.push(["—", "—", "No students currently enrolled in this classroom section", "—", "—", "—"]);
  }

  autoTable(doc, {
    startY,
    head: tableHead,
    body: tableBody,
    theme: "striped",
    headStyles: {
      fillColor: [11, 27, 61],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8.5,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 28, fontStyle: "bold", textColor: [180, 83, 9] },
      2: { cellWidth: 62 },
      3: { cellWidth: 24, halign: "center" },
      4: { cellWidth: 32 },
      5: { cellWidth: 22, halign: "center" },
    },
    margin: { left: 14, right: 14, bottom: 16 },
  });

  attachPageFooters(doc);
  const safeGrade = gradeLevel.replace(/\s+/g, "_").toLowerCase();
  const filename = `class_roster_${safeGrade}_sec_${section}.pdf`;
  doc.save(filename);
  return filename;
}
