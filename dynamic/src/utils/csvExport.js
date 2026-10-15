/**
 * Utility for generating and downloading CSV reports (course slips, student rosters, curriculum summaries)
 * Includes UTF-8 BOM encoding for complete Excel and Unicode compatibility (Amharic & English).
 */

function escapeCsvCell(value) {
  if (value === null || value === undefined) return '""';
  const str = String(value).trim();
  return `"${str.replace(/"/g, '""')}"`;
}

function formatRow(cells) {
  return cells.map(escapeCsvCell).join(',');
}

export function triggerCsvDownload(csvString, filename) {
  const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates an official downloadable CSV slip for a single course and its enrolled students / sections
 */
export function generateSingleCourseSlipCsv(course, { classAssignments = [], teachers = [], enrollments = [] } = {}) {
  const courseId = course?.id || 'N/A';
  const courseName = course?.courseName || course?.name || 'Untitled Course';
  const creditHours = course?.creditHours ?? course?.craditHours ?? 0;
  const timestamp = new Date().toLocaleString();

  // Find assigned classes for this course
  const relevantAssignments = classAssignments.filter(
    (a) => Number(a.courseId) === Number(courseId) || (a.courseName && a.courseName.toLowerCase() === courseName.toLowerCase())
  );

  const assignedClassesStr = relevantAssignments.length > 0
    ? relevantAssignments.map((a) => a.classLevel || a.gradeLevel || 'Class').join('; ')
    : 'None';

  // Find teachers assigned to this course
  const assignedTeachersList = teachers.filter(
    (t) => (t.assignedCourseId && Number(t.assignedCourseId) === Number(courseId)) ||
           (t.assignedCourseName && t.assignedCourseName.toLowerCase() === courseName.toLowerCase()) ||
           (t.courseId && Number(t.courseId) === Number(courseId))
  );

  const assignedTeachersStr = assignedTeachersList.length > 0
    ? assignedTeachersList.map((t) => t.name || t.teacherName).join('; ')
    : 'None';

  // Find students enrolled in the grades assigned to this course
  const assignedGradeSet = new Set(
    relevantAssignments.map((a) => String(a.classLevel || a.gradeLevel || '').trim().toLowerCase()).filter(Boolean)
  );

  const studentRows = enrollments.filter((student) => {
    if (assignedGradeSet.size === 0) return false;
    const studentGrade = String(student.gradeLevel || '').trim().toLowerCase();
    return assignedGradeSet.has(studentGrade);
  });

  const lines = [
    formatRow(['WELUDE BIRHAN SUNDAY SCHOOL - COURSE ROSTER SLIP']),
    formatRow(['Generated At', timestamp]),
    formatRow(['Course ID', courseId]),
    formatRow(['Course Name', courseName]),
    formatRow(['Credit Hours', creditHours]),
    formatRow(['Assigned Grade Levels', assignedClassesStr]),
    formatRow(['Instructors', assignedTeachersStr]),
    formatRow(['Total Students Enrolled', studentRows.length]),
    '',
    formatRow([
      '#',
      'Student ID',
      'Full Name',
      'Grade Level',
      'Section',
      'Academic Year',
      'Enrollment Status',
      'Enrolled Date'
    ])
  ];

  if (studentRows.length === 0) {
    lines.push(formatRow(['—', '—', 'No students currently enrolled in the assigned grade sections for this course', '—', '—', '—', '—', '—']));
  } else {
    studentRows.forEach((s, idx) => {
      lines.push(
        formatRow([
          idx + 1,
          s.studentId || 'N/A',
          s.fullname || s.name || 'Unknown',
          s.gradeLevel || 'N/A',
          s.section || 'A',
          s.year || new Date().getFullYear(),
          s.status || 'ACTIVE',
          s.enrolledAt ? new Date(s.enrolledAt).toLocaleDateString() : 'N/A'
        ])
      );
    });
  }

  return lines.join('\r\n');
}

/**
 * Generates an aggregated curriculum catalog CSV report for all courses
 */
export function generateAllCoursesReportCsv(courses = [], { classAssignments = [], teachers = [], enrollments = [] } = {}) {
  const timestamp = new Date().toLocaleString();

  const lines = [
    formatRow(['WELUDE BIRHAN SUNDAY SCHOOL - ACADEMIC CURRICULUM CATALOG & ENROLLMENT REPORT']),
    formatRow(['Generated At', timestamp]),
    formatRow(['Total Courses in Catalog', courses.length]),
    formatRow(['Total Class Course Assignments', classAssignments.length]),
    formatRow(['Total Verified Enrolled Students', enrollments.length]),
    '',
    formatRow([
      'Course ID',
      'Course Name',
      'Credit Hours',
      'Assigned Grade Levels',
      'Assigned Faculty Teachers',
      'Estimated Enrolled Students',
      'Catalog Created Date'
    ])
  ];

  courses.forEach((c) => {
    const courseId = c.id;
    const courseName = c.courseName || c.name || '';
    const credits = c.creditHours ?? c.craditHours ?? 0;

    // Assigned class levels
    const cAssignments = classAssignments.filter(
      (a) => Number(a.courseId) === Number(courseId) || (a.courseName && a.courseName.toLowerCase() === courseName.toLowerCase())
    );
    const assignedClasses = cAssignments.map((a) => a.classLevel || a.gradeLevel).filter(Boolean);
    const assignedClassesStr = assignedClasses.length > 0 ? assignedClasses.join('; ') : 'Unassigned';

    // Assigned teachers
    const cTeachers = teachers.filter(
      (t) => (t.assignedCourseId && Number(t.assignedCourseId) === Number(courseId)) ||
             (t.assignedCourseName && t.assignedCourseName.toLowerCase() === courseName.toLowerCase()) ||
             (t.courseId && Number(t.courseId) === Number(courseId))
    );
    const assignedTeachersStr = cTeachers.length > 0 ? cTeachers.map((t) => t.name || t.teacherName).join('; ') : 'None';

    // Students
    const gradeSet = new Set(assignedClasses.map((g) => String(g).trim().toLowerCase()));
    const matchingStudents = enrollments.filter((s) => gradeSet.has(String(s.gradeLevel || '').trim().toLowerCase()));

    lines.push(
      formatRow([
        courseId,
        courseName,
        credits,
        assignedClassesStr,
        assignedTeachersStr,
        matchingStudents.length,
        c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'N/A'
      ])
    );
  });

  return lines.join('\r\n');
}
