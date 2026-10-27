import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Helper to draw a standard header & brand banner on the first page
 */
function drawDocumentHeader(doc, {
  title,
  subtitle = "Education Hub & Academic Administration",
  description = null,
  metaPairs = [],
  rightColX = 130,
  leftColX = 14,
}) {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Top brand band
  doc.setFillColor(11, 27, 61); // Brand Navy (#0b1b3d)
  doc.rect(0, 0, pageWidth, 24, "F");

  // Church Name in Banner
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(245, 158, 11); // Amber-500
  doc.text("WELUDE BIRHAN SUNDAY SCHOOL", 14, 11);

  // Dynamic Department / Header Subtitle in Banner
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(226, 232, 240); // Slate-200
  doc.text(subtitle || "Education Hub & Academic Administration", 14, 18);

  // Document Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42); // Slate-900
  doc.text(title, 14, 34);

  // Subtitle / Scope / Description
  if (description) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.text(description, 14, 40);
  }

  // Meta grid (2 columns)
  let currentY = description ? 48 : 42;

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

    // Text Collision Protection:
    // Ensure column 1 value NEVER extends into column 2, and column 2 value stays within page margins
    const availableWidth = isRight
      ? (pageWidth - 14) - (x + labelWidth + 3)
      : (rightColX - 5) - (x + labelWidth + 3);

    // Render dynamic value cleanly to the right of the label with +3mm offset
    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42); // Slate-900
    let valText = pair.value !== undefined && pair.value !== null ? String(pair.value) : "N/A";

    // Truncate cleanly with ellipsis if value exceeds available column width
    if (doc.getTextWidth(valText) > availableWidth && availableWidth > 12) {
      while (valText.length > 3 && doc.getTextWidth(valText + "...") > availableWidth) {
        valText = valText.slice(0, -1);
      }
      valText += "...";
    }

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
function attachPageFooters(doc, subtitle = "Education Hub & Academic Administration") {
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
      `Holy Trinity Sunday School - Welude Birhan ${subtitle} Official Record`,
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
export function generateTeacherStudentsSlipPdf(teacher, students = [], teacherMeta = {}, options = {}) {
  const doc = new jsPDF("p", "mm", "a4");
  const teacherName = teacher?.name || teacherMeta?.teacherName || "Instructor";
  const safeName = teacherName.replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase();
  const timestamp = new Date().toLocaleString();
  const subtitle = options.subtitle || "Education Hub & Academic Administration";

  const startY = drawDocumentHeader(doc, {
    title: `Student Roster - ${teacherName}`,
    subtitle,
    description: "Official Sunday School classroom roster and student enrollment record",
    rightColX: 130, // Large X-offset so second column (Generated Date, Total Enrolled, Contact Phone) never collides
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

  attachPageFooters(doc, subtitle);
  const filename = `student_roster_${safeName}_${teacher?.id || "doc"}.pdf`;
  doc.save(filename);
  return filename;
}

/**
 * 2. Generate Single Course Slip (PDF)
 */
export function generateSingleCourseSlipPdf(course, { classAssignments = [], teachers = [], enrollments = [] } = {}, options = {}) {
  const doc = new jsPDF("p", "mm", "a4");
  const courseId = course?.id || "N/A";
  const courseName = course?.courseName || course?.name || "Untitled Course";
  const creditHours = course?.creditHours ?? course?.craditHours ?? 0;
  const timestamp = new Date().toLocaleString();
  const subtitle = options.subtitle || "Education Hub & Academic Administration";

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
    subtitle,
    description: "Official course curriculum slip, faculty assignments, and enrolled student roster",
    rightColX: 130,
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

  attachPageFooters(doc, subtitle);
  const safeName = courseName.replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase();
  const filename = `course_slip_${safeName}_${courseId}.pdf`;
  doc.save(filename);
  return filename;
}

/**
 * 3. Generate Complete Curriculum Catalog & Course Slip Report (PDF)
 */
export function generateAllCoursesCatalogPdf(courses = [], { classAssignments = [], teachers = [], enrollments = [] } = {}, options = {}) {
  const doc = new jsPDF("p", "mm", "a4");
  const timestamp = new Date().toLocaleString();
  const subtitle = options.subtitle || "Education Hub & Academic Administration";

  const startY = drawDocumentHeader(doc, {
    title: "Curriculum Catalog & Course Slip Report",
    subtitle,
    description: "Comprehensive curriculum directory, classroom allocations, and faculty assignments",
    rightColX: 130,
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

  attachPageFooters(doc, subtitle);
  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = `curriculum_catalog_report_${dateStr}.pdf`;
  doc.save(filename);
  return filename;
}

/**
 * 4. Generate Class Roster Slip (PDF)
 */
export function generateClassRosterSlipPdf(selectedClass, roster = [], options = {}) {
  const doc = new jsPDF("p", "mm", "a4");
  const gradeLevel = selectedClass?.gradeLevel || "General";
  const section = selectedClass?.section || "A";
  const timestamp = new Date().toLocaleString();
  const subtitle = options.subtitle || "Education Hub & Academic Administration";

  const startY = drawDocumentHeader(doc, {
    title: `Class Roster Slip - ${gradeLevel} (Section ${section})`,
    subtitle,
    description: "Official student attendance roster and classroom enrollment record",
    rightColX: 130,
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

  attachPageFooters(doc, subtitle);
  const safeGrade = gradeLevel.replace(/\s+/g, "_").toLowerCase();
  const filename = `class_roster_${safeGrade}_sec_${section}.pdf`;
  doc.save(filename);
  return filename;
}

/**
 * 5. Generate Inventory Stock Report (PDF)
 * Exports the comprehensive property and asset inventory list
 */
export function generateInventoryReportPdf(products = [], options = {}) {
  const doc = new jsPDF("p", "mm", "a4");
  const timestamp = new Date().toLocaleString();
  const subtitle = options.subtitle || "Property & Asset Management";

  const totalQuantity = products.reduce((acc, p) => acc + (Number(p.quantity) || 0), 0);
  const totalPurchaseValue = products.reduce(
    (acc, p) => acc + (Number(p.quantity) || 0) * (Number(p.purchasePrice) || 0),
    0
  );
  const totalRetailValue = products.reduce(
    (acc, p) => acc + (Number(p.quantity) || 0) * (Number(p.price) || 0),
    0
  );
  const lowStockCount = products.filter((p) => Number(p.quantity) <= 5).length;

  const startY = drawDocumentHeader(doc, {
    title: "Property & Asset Inventory Report",
    subtitle,
    description: "Official organizational inventory audit, stock balances, and asset valuation",
    rightColX: 130,
    metaPairs: [
      { label: "Total Asset Types", value: products.length },
      { label: "Generated Date", value: timestamp },
      { label: "Total In-Stock Units", value: totalQuantity.toLocaleString() },
      { label: "Low Stock Items (<= 5)", value: lowStockCount },
      { label: "Total Cost Valuation", value: `${totalPurchaseValue.toLocaleString("en-US", { minimumFractionDigits: 2 })} ETB` },
      { label: "Total Retail Valuation", value: `${totalRetailValue.toLocaleString("en-US", { minimumFractionDigits: 2 })} ETB` },
    ],
  });

  const tableHead = [["#", "ID", "Product / Asset Name", "Qty", "Cost Price", "Selling Price", "Total Cost", "Supplier / Source", "Purchaser"]];
  const tableBody = products.map((p, idx) => {
    const qty = Number(p.quantity) || 0;
    const cost = Number(p.purchasePrice) || 0;
    const price = Number(p.price) || 0;
    const totalCost = qty * cost;

    return [
      idx + 1,
      `PRD-${p.id || "N/A"}`,
      p.productName || "Unnamed Asset",
      qty,
      `${cost.toFixed(2)} ETB`,
      `${price.toFixed(2)} ETB`,
      `${totalCost.toFixed(2)} ETB`,
      p.purchaseFrom || "N/A",
      p.purchaseBy || "N/A",
    ];
  });

  if (tableBody.length === 0) {
    tableBody.push(["—", "—", "No products or assets currently recorded in inventory", "—", "—", "—", "—", "—", "—"]);
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
      fontSize: 8,
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 8, halign: "center" },
      1: { cellWidth: 18, fontStyle: "bold", textColor: [180, 83, 9] },
      2: { cellWidth: 38 },
      3: { cellWidth: 14, halign: "center" },
      4: { cellWidth: 22, halign: "right" },
      5: { cellWidth: 22, halign: "right" },
      6: { cellWidth: 24, halign: "right", fontStyle: "bold" },
      7: { cellWidth: 24 },
      8: { cellWidth: 20 },
    },
    margin: { left: 10, right: 10, bottom: 16 },
  });

  attachPageFooters(doc, subtitle);
  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = `inventory_report_${dateStr}.pdf`;
  doc.save(filename);
  return filename;
}

/**
 * 6. Generate Single Product / Asset Slip (PDF)
 */
export function generateSingleProductSlipPdf(product, options = {}) {
  const doc = new jsPDF("p", "mm", "a4");
  const timestamp = new Date().toLocaleString();
  const subtitle = options.subtitle || "Property & Asset Management";
  const prodName = product?.productName || "Asset";
  const qty = Number(product?.quantity) || 0;
  const cost = Number(product?.purchasePrice) || 0;
  const price = Number(product?.price) || 0;
  const totalCost = qty * cost;
  const totalRetail = qty * price;
  const margin = price > 0 ? (((price - cost) / price) * 100).toFixed(1) : 0;

  const startY = drawDocumentHeader(doc, {
    title: `Asset Registration Slip - ${prodName}`,
    subtitle,
    description: "Official property registration verification and asset specifications",
    rightColX: 130,
    metaPairs: [
      { label: "Product / Asset ID", value: `#${product?.id || "N/A"}` },
      { label: "Generated Date", value: timestamp },
      { label: "Current In-Stock", value: `${qty} units` },
      { label: "Purchase Date", value: product?.purchaseDate ? new Date(product.purchaseDate).toLocaleDateString() : "N/A" },
      { label: "Unit Cost (ETB)", value: `${cost.toFixed(2)} ETB` },
      { label: "Selling Price (ETB)", value: `${price.toFixed(2)} ETB` },
      { label: "Supplier / Store", value: product?.purchaseFrom || "N/A" },
      { label: "Registered By (Phone)", value: product?.purchaseBy || "N/A" },
      { label: "Total Cost Valuation", value: `${totalCost.toFixed(2)} ETB` },
      { label: "Estimated Gross Margin", value: `${margin}%` },
    ],
  });

  // Table summary for verification
  autoTable(doc, {
    startY,
    head: [["Specification", "Property Detail", "Audit Note"]],
    body: [
      ["Product / Item Name", prodName, "Official Registered Nomenclature"],
      ["Available Stock", `${qty} Units`, qty <= 5 ? "LOW STOCK WARNING" : "Optimal Stock Level"],
      ["Cost Per Unit", `${cost.toFixed(2)} ETB`, "Acquisition Unit Value"],
      ["Retail / Sale Unit Price", `${price.toFixed(2)} ETB`, "Standard Offering Price"],
      ["Gross Inventory Cost", `${totalCost.toFixed(2)} ETB`, "Current Asset Balance"],
      ["Expected Gross Revenue", `${totalRetail.toFixed(2)} ETB`, "At Full Realization"],
      ["Vendor / Source", product?.purchaseFrom || "N/A", "Procurement Origin"],
      ["Purchaser / Custodian", product?.purchaseBy || "N/A", "Authorized Contact Phone"],
      ["System Record Created", product?.createdAt ? new Date(product.createdAt).toLocaleString() : timestamp, "Database Log"],
    ],
    theme: "striped",
    headStyles: {
      fillColor: [11, 27, 61],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { cellWidth: 50, fontStyle: "bold" },
      1: { cellWidth: 70 },
      2: { cellWidth: 60, textColor: [100, 116, 139] },
    },
    margin: { left: 14, right: 14, bottom: 20 },
  });

  // Verification Sign-off Box
  const pageHeight = doc.internal.pageSize.getHeight();
  const signY = pageHeight - 40;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text("Verified by Property Custodian: ____________________", 14, signY);
  doc.text("Authorized Department Signature: ____________________", 110, signY);

  attachPageFooters(doc, subtitle);
  const safeName = prodName.replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase();
  const filename = `asset_slip_${safeName}_${product?.id || "doc"}.pdf`;
  doc.save(filename);
  return filename;
}

/**
 * 7. Generate Sales Summary & Financial Report (PDF)
 */
export function generateSalesSummaryPdf(sales = [], options = {}) {
  const doc = new jsPDF("p", "mm", "a4");
  const timestamp = new Date().toLocaleString();
  const subtitle = options.subtitle || "Finance & Sales Administration";

  const totalQuantity = sales.reduce((acc, s) => acc + (Number(s.quantity) || 0), 0);
  const totalRevenue = sales.reduce((acc, s) => {
    const qty = Number(s.quantity) || 0;
    const price = Number(s.unitPrice ?? s.salesPrice ?? 0);
    return acc + (s.totalPrice !== undefined && s.totalPrice !== null ? Number(s.totalPrice) : qty * price);
  }, 0);
  const totalCost = sales.reduce((acc, s) => {
    const qty = Number(s.quantity) || 0;
    const cost = Number(s.purchaseProduct?.unitPrice ?? s.price ?? s.costPrice ?? 0);
    return acc + (qty * cost);
  }, 0);
  const netProfit = totalCost > 0 ? (totalRevenue - totalCost) : totalRevenue;

  // Balanced 2-column layout (leftColX: 14, rightColX: 110) guarantees no text overlap
  const startY = drawDocumentHeader(doc, {
    title: "Finance & Product Sales Audit Report",
    subtitle,
    description: "Official point of sale summary, gross revenue realization, and live financial transactions",
    leftColX: 14,
    rightColX: 110,
    metaPairs: [
      { label: "Total Transactions", value: `${sales.length} slip(s)` },
      { label: "Generated Date", value: timestamp },
      { label: "Total Units Sold", value: `${totalQuantity.toLocaleString()} items` },
      { label: "Gross Sales Revenue", value: `${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB` },
      { label: "Department Scope", value: subtitle },
      { label: "Net Profit Realization", value: `${netProfit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB` },
    ],
  });

  const tableHead = [["#", "Sale ID", "Date", "Product Item", "Batch #", "Qty", "Unit Price", "Total (ETB)", "Contact / Phone"]];
  const tableBody = sales.map((s, idx) => {
    const qty = Number(s.quantity) || 0;
    const unitPrice = Number(s.unitPrice ?? s.salesPrice ?? 0);
    const total = s.totalPrice !== undefined && s.totalPrice !== null
      ? Number(s.totalPrice)
      : qty * unitPrice;
    const rawDate = s.createdAt || s.salesDate || s.date;
    const dateStr = rawDate ? new Date(rawDate).toLocaleDateString() : "N/A";
    const prodName = s.product?.name || s.productName || (s.productId ? `Product #${s.productId}` : "Item");
    const batchStr = s.purchaseProductId ? `Batch #${s.purchaseProductId}` : "—";
    const contactInfo = s.customerPhone || s.phone || s.phoneNumber || s.purchaseProduct?.supplier?.phone || s.salesTo || s.customer || "—";

    return [
      idx + 1,
      `SLS-${s.id || "N/A"}`,
      dateStr,
      prodName,
      batchStr,
      qty,
      `${unitPrice.toFixed(2)}`,
      `${total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      contactInfo,
    ];
  });

  if (tableBody.length === 0) {
    tableBody.push(["—", "—", "—", "No sales transactions recorded in system", "—", "—", "—", "—", "—"]);
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
      fontSize: 8,
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 8, halign: "center" },
      1: { cellWidth: 18, fontStyle: "bold", textColor: [180, 83, 9] },
      2: { cellWidth: 20 },
      3: { cellWidth: 42 },
      4: { cellWidth: 18, halign: "center" },
      5: { cellWidth: 12, halign: "center" },
      6: { cellWidth: 22, halign: "right" },
      7: { cellWidth: 24, halign: "right", fontStyle: "bold" },
      8: { cellWidth: 26 },
    },
    margin: { left: 10, right: 10, bottom: 16 },
  });

  attachPageFooters(doc, subtitle);
  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = `sales_financial_report_${dateStr}.pdf`;
  doc.save(filename);
  return filename;
}

/**
 * 8. Generate Point of Sale Receipt Slip (PDF)
 */
export function generateSaleReceiptPdf(sale, options = {}) {
  const doc = new jsPDF("p", "mm", [100, 165]); // Compact receipt format with height padding
  const rawDate = sale?.createdAt || sale?.salesDate || sale?.date;
  const timestamp = rawDate ? new Date(rawDate).toLocaleString() : new Date().toLocaleString();
  const subtitle = options.subtitle || "Finance & Sales Administration";
  const qty = Number(sale?.quantity) || 1;
  const unitPrice = Number(sale?.unitPrice ?? sale?.salesPrice ?? 0);
  const total = sale?.totalPrice !== undefined && sale?.totalPrice !== null
    ? Number(sale.totalPrice)
    : qty * unitPrice;
  const prodName = sale?.product?.name || sale?.productName || (sale?.productId ? `Product #${sale.productId}` : "Item");
  const batchStr = sale?.purchaseProductId ? `Batch #${sale.purchaseProductId}` : "Standard";

  // Header band
  doc.setFillColor(11, 27, 61);
  doc.rect(0, 0, 100, 20, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(245, 158, 11); // Amber
  doc.text("WELUDE BIRHAN SUNDAY SCHOOL", 50, 8, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(226, 232, 240);
  doc.text(`${subtitle} • Official Receipt`, 50, 14, { align: "center" });

  // Receipt meta
  let curY = 28;
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Receipt #: SLS-${sale?.id || "REC"}`, 10, curY);
  curY += 5;
  doc.text(`Date & Time: ${timestamp}`, 10, curY);
  curY += 5;
  doc.text(`Batch Ref: ${batchStr}`, 10, curY);
  curY += 5;
  doc.text(`Customer / Buyer: ${sale?.salesTo || sale?.customer || "General Public"}`, 10, curY);
  curY += 5;

  // Add Contact Phone if present without overlap
  const contactPhone = sale?.customerPhone || sale?.phone || sale?.phoneNumber || sale?.contactPhone || sale?.purchaseProduct?.supplier?.phone || null;
  if (contactPhone) {
    doc.text(`Contact Phone: ${contactPhone}`, 10, curY);
    curY += 5;
  }
  curY += 2;

  // Divider line
  doc.setDrawColor(203, 213, 225);
  doc.line(10, curY, 90, curY);
  curY += 3;

  // Item Table
  autoTable(doc, {
    startY: curY,
    head: [["Item Description", "Qty", "Price", "Total"]],
    body: [
      [
        prodName,
        qty,
        `${unitPrice.toFixed(2)}`,
        `${total.toFixed(2)} ETB`,
      ],
    ],
    theme: "plain",
    headStyles: {
      fontStyle: "bold",
      fontSize: 8,
      textColor: [15, 23, 42],
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [51, 65, 85],
    },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 10, halign: "center" },
      2: { cellWidth: 15, halign: "right" },
      3: { cellWidth: 20, halign: "right", fontStyle: "bold" },
    },
    margin: { left: 8, right: 8 },
  });

  const finalY = doc.lastAutoTable.finalY + 6;

  // Summary box
  doc.setDrawColor(203, 213, 225);
  doc.line(10, finalY, 90, finalY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("TOTAL AMOUNT PAID:", 10, finalY + 7);
  doc.setTextColor(180, 83, 9); // Amber-700
  doc.text(`${total.toFixed(2)} ETB`, 90, finalY + 7, { align: "right" });

  // Thank you note
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("May God bless your offering and support!", 50, finalY + 18, { align: "center" });
  doc.text("Holy Trinity Welude Birhan Sunday School", 50, finalY + 23, { align: "center" });

  const filename = `receipt_sls_${sale?.id || "doc"}.pdf`;
  doc.save(filename);
  return filename;
}

/**
 * 9. Generate Official Vendor & Supplier Directory Report (PDF)
 */
export function generateSuppliersReportPdf(suppliers = [], options = {}) {
  const doc = new jsPDF("p", "mm", "a4");
  const timestamp = new Date().toLocaleString();
  const subtitle = options.subtitle || "Finance & Procurement Administration";

  const totalWithPhone = suppliers.filter(
    (s) => s.phone || s.phoneNumber || s.contactPhone
  ).length;

  const startY = drawDocumentHeader(doc, {
    title: "Vendor & Supplier Directory Report",
    subtitle,
    description: "Official authorized suppliers, vendor contact directory, and procurement profiles",
    leftColX: 14,
    rightColX: 110,
    metaPairs: [
      { label: "Total Registered Vendors", value: `${suppliers.length} vendor(s)` },
      { label: "Generated Date", value: timestamp },
      { label: "Active Contact Phones", value: `${totalWithPhone} on file` },
      { label: "Procurement Scope", value: "Sunday School & Church Inventory" },
    ],
  });

  const tableHead = [["#", "Supplier ID", "Vendor Name", "Contact Phone", "Recorded By", "Physical Address", "Date Registered"]];
  const tableBody = suppliers.map((s, idx) => {
    const rawDate = s.createdAt || s.date;
    const dateStr = rawDate ? new Date(rawDate).toLocaleDateString() : "Active";
    const phone = s.phone || s.phoneNumber || s.contactPhone || s.phone_number || "—";
    const recordedBy = s.purchaseBy || s.recordedBy || s.registeredBy || s.memberPhone || s.member?.phone || s.member?.name || "—";
    const address = s.address || "—";

    return [
      idx + 1,
      `SUP-${s.id || "N/A"}`,
      s.name || "Unnamed Vendor",
      phone,
      recordedBy,
      address,
      dateStr,
    ];
  });

  if (tableBody.length === 0) {
    tableBody.push(["—", "—", "No suppliers or vendors currently registered in system", "—", "—", "—", "—"]);
  }

  // A4 printable width: 190mm (210 - 20)
  // Columns: 8 + 18 + 40 + 32 + 30 + 42 + 20 = 190mm
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
      0: { cellWidth: 8, halign: "center" },
      1: { cellWidth: 18, fontStyle: "bold", textColor: [180, 83, 9] },
      2: { cellWidth: 40, fontStyle: "bold" },
      3: { cellWidth: 32, fontStyle: "bold", textColor: [30, 41, 59] },
      4: { cellWidth: 30, textColor: [30, 41, 59] },
      5: { cellWidth: 42 },
      6: { cellWidth: 20, halign: "center" },
    },
    margin: { left: 10, right: 10, bottom: 16 },
  });

  attachPageFooters(doc, subtitle);
  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = `suppliers_directory_${dateStr}.pdf`;
  doc.save(filename);
  return filename;
}

/**
 * 10. Generate Formal Office Financial Report for a Purchase Batch (PDF)
 * Suitable for formal office submission and physical archiving.
 * Strictly binds to backend returned metrics (profit, net income, remaining stock).
 *
 * @param {Object} reportData - Direct backend response from GET /product-sales/report/{purchaseProductId}
 * @param {Object} batch - Purchase batch details object
 * @param {Object} [options] - Optional metadata (e.g. adminUser)
 * @returns {string} Downloaded filename
 */
export function generateBatchFinancialReportPdf(reportData = {}, batch = {}, options = {}) {
  const doc = new jsPDF("p", "mm", "a4");
  const timestamp = new Date().toLocaleString();
  const subtitle = "Purchase Batch Financial Performance Report";

  // Admin / User metadata for audit trail
  const adminUser = options.adminUser || (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  })();
  const adminIdentifier =
    adminUser?.fullname ||
    adminUser?.name ||
    adminUser?.email ||
    adminUser?.phone ||
    adminUser?.phoneNumber ||
    (adminUser?.id ? `Admin #${adminUser.id}` : "Authorized Finance Officer");

  const batchId = batch?.id || reportData?.purchaseProductId || reportData?.batchId || "N/A";
  const prodName =
    batch?.product?.name ||
    reportData?.productName ||
    (batch?.productId ? `Product #${batch.productId}` : "Catalog Item");
  const supName =
    batch?.supplier?.name ||
    (batch?.supplierId ? `Supplier #${batch.supplierId}` : "Direct Vendor");
  const purchaser = batch?.purchaseBy || batch?.purchasedBy || "Internal Member";
  const purchaseDate = batch?.purchaseDate
    ? new Date(batch.purchaseDate).toLocaleDateString()
    : "Recorded";

  // Strict backend metrics (zero frontend calculations)
  const rawProfit = reportData?.profit ?? reportData?.totalProfit ?? reportData?.grossProfit ?? 0;
  const rawNetIncome = reportData?.netIncome ?? reportData?.net_income ?? reportData?.netProfit ?? 0;
  const rawRemainingStock =
    reportData?.remainingStock ??
    reportData?.remainingQuantity ??
    reportData?.remaining_stock ??
    reportData?.stock ??
    0;

  const profitFormatted = Number(rawProfit).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const netIncomeFormatted = Number(rawNetIncome).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const remainingStockFormatted = Number(rawRemainingStock).toLocaleString("en-US");

  const startY = drawDocumentHeader(doc, {
    title: "Purchase Batch Financial Performance Report",
    subtitle: "Purchase Batch Financial Performance Report",
    description:
      "Official financial reconciliation, net profitability, and inventory stock audit for formal office submission",
    leftColX: 14,
    rightColX: 110,
    metaPairs: [
      { label: "Purchase Batch ID", value: `#BAT-${batchId}` },
      { label: "Generated Date", value: timestamp },
      { label: "Target Product", value: prodName },
      { label: "Vendor / Supplier", value: supName },
      { label: "Procurement Date", value: purchaseDate },
      { label: "Purchased / Recorded By", value: purchaser },
      { label: "Audited / Submitted By", value: adminIdentifier },
      { label: "Document Purpose", value: "Formal Parish Council & Office Submission" },
    ],
  });

  // Table 1: Core Performance Metrics Summary (Live API Backend Metrics)
  const metricsHead = [
    ["#", "Core Financial Metric", "Backend Reconciled Figure", "Accounting Audit & Performance Classification"],
  ];
  const metricsBody = [
    [
      "1",
      "Net Income",
      `${netIncomeFormatted} ETB`,
      Number(rawNetIncome) >= 0
        ? "Positive Net Yield (Realized sales revenue exceeds cumulative procurement outlay & expenses)"
        : "Deficit / Unrecovered Investment (Sales revenue has not yet fully recouped procurement capital)",
    ],
    [
      "2",
      "Gross / Realized Profit",
      `${profitFormatted} ETB`,
      "Cumulative profit generated from completed Point of Sale (POS) retail transactions for this batch",
    ],
    [
      "3",
      "Remaining Physical Stock",
      `${remainingStockFormatted} Units`,
      "Remaining units in storage pool verified available for future sales fulfillment",
    ],
  ];

  // If backend returned additional dynamic keys, append them cleanly to the table
  const knownKeys = new Set([
    "profit",
    "totalProfit",
    "grossProfit",
    "netIncome",
    "net_income",
    "netProfit",
    "remainingStock",
    "remainingQuantity",
    "remaining_stock",
    "stock",
    "purchaseProductId",
    "batchId",
    "productId",
    "productName",
  ]);
  let metricIndex = 4;
  Object.entries(reportData).forEach(([key, val]) => {
    if (!knownKeys.has(key) && val !== null && val !== undefined && typeof val !== "object") {
      const cleanLabel = key
        .replace(/([A-Z])/g, " $1")
        .replace(/_/g, " ")
        .replace(/^\w/, (c) => c.toUpperCase());
      const displayVal = typeof val === "number" ? val.toLocaleString("en-US") : String(val);
      metricsBody.push([
        String(metricIndex++),
        cleanLabel,
        displayVal,
        "System Reconciled Secondary Performance Indicator",
      ]);
    }
  });

  autoTable(doc, {
    startY: startY + 2,
    head: metricsHead,
    body: metricsBody,
    theme: "grid",
    headStyles: {
      fillColor: [11, 27, 61], // Brand Navy
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8.5,
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [30, 41, 59],
      cellPadding: 3.5,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 50, fontStyle: "bold" },
      2: { cellWidth: 45, fontStyle: "bold", textColor: [180, 83, 9], halign: "right" },
      3: { cellWidth: 85, textColor: [71, 85, 105], fontSize: 8 },
    },
    margin: { left: 10, right: 10 },
  });

  // Table 2: Procurement Baseline Reference
  const nextY = doc.lastAutoTable.finalY + 6;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("Batch Procurement & Baseline Specifications", 10, nextY);

  const baselineHead = [["Specification Parameter", "Baseline Reconciled Value", "System Reference Notes"]];
  const unitCostNum = Number(batch?.unitPrice || 0);
  const salePriceNum = Number(batch?.salePrice || 0);
  const qtyNum = Number(batch?.quantity || 0);
  const totalCostNum = Number(batch?.totalPrice ?? qtyNum * unitCostNum);

  const baselineBody = [
    ["Catalog Product Item", prodName, `Product Catalog Master ID #${batch?.productId || "N/A"}`],
    [
      "Procurement Vendor / Supplier",
      supName,
      batch?.supplier?.phone ? `Vendor Contact: ${batch.supplier.phone}` : "Authorized Commercial Supplier",
    ],
    ["Intake Batch Volume", `${qtyNum.toLocaleString()} Units`, "Initial procured physical quantity"],
    ["Unit Acquisition Cost (COGS)", `${unitCostNum.toFixed(2)} ETB`, "Base cost per unit from vendor"],
    ["Target Retail Sale Price", `${salePriceNum.toFixed(2)} ETB`, "Official designated Sunday School selling price"],
    [
      "Total Initial Batch Outlay",
      `${totalCostNum.toLocaleString("en-US", { minimumFractionDigits: 2 })} ETB`,
      "Total procurement capital expenditure",
    ],
    ["Purchased / Logged By (Staff)", purchaser, "Sunday School verified custodian"],
  ];

  autoTable(doc, {
    startY: nextY + 3,
    head: baselineHead,
    body: baselineBody,
    theme: "striped",
    headStyles: {
      fillColor: [51, 65, 85], // Slate-700
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
      cellPadding: 2.5,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 60, fontStyle: "bold" },
      1: { cellWidth: 60, fontStyle: "bold", textColor: [15, 23, 42] },
      2: { cellWidth: 70, textColor: [100, 116, 139] },
    },
    margin: { left: 10, right: 10 },
  });

  // Table 3: Formal Office Verification & Endorsement Sign-off Block
  let signY = doc.lastAutoTable.finalY + 8;
  const pageHeight = doc.internal.pageSize.getHeight();

  if (signY + 35 > pageHeight - 16) {
    doc.addPage();
    signY = 20;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text("Official Parish Administration Verification & Endorsement", 10, signY);

  const signHead = [["Role / Authority", "Designated Officer Name", "Signature / Stamp", "Action Date"]];
  const signBody = [
    ["Prepared By (Finance Officer)", adminIdentifier, "", timestamp.slice(0, 10)],
    ["Audited By (Internal Auditor)", "___________________________", "", ""],
    ["Approved By (Parish Priest / Chair)", "___________________________", "", ""],
  ];

  autoTable(doc, {
    startY: signY + 3,
    head: signHead,
    body: signBody,
    theme: "grid",
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontStyle: "bold",
      fontSize: 8,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [51, 65, 85],
      cellPadding: 4,
    },
    columnStyles: {
      0: { cellWidth: 60, fontStyle: "bold" },
      1: { cellWidth: 55 },
      2: { cellWidth: 45 },
      3: { cellWidth: 30, halign: "center" },
    },
    margin: { left: 10, right: 10 },
  });

  attachPageFooters(doc, subtitle);
  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = `financial_report_batch_${batchId}_${dateStr}.pdf`;
  doc.save(filename);
  return filename;
}
