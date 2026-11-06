import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import QRCode from "qrcode";
import { jsPDF } from "jspdf";
import { IdCard, Download, Loader2, RefreshCw } from "lucide-react";
import { getAllEnrollments } from "../../services/educationhub/studentService";
import StudentIDCardModal from "./StudentIDCardModal";
import churchLogoBase64 from "../../assets/churchLogoBase64";

/**
 * Helper to draw our official, clean blue-and-gold ID card layout on a jsPDF document page.
 * Strictly maps live student attributes (Zero Mock Data).
 */
async function drawStudentCardPage(pdf, student, isFirstPage = false) {
  if (!isFirstPage) {
    pdf.addPage([85, 135], "portrait");
  }

  // 1. Clean White Card Background
  pdf.setFillColor(255, 255, 255);
  pdf.rect(0, 0, 85, 135, "F");

  // 2. Official Church Logo (Royal blue bell, cross, book, and golden sunburst)
  // Embed once via alias 'CHURCH_LOGO' for super-fast batch rendering and tiny file sizes
  pdf.addImage(churchLogoBase64, "PNG", 29.5, 7, 26, 26, "CHURCH_LOGO", "FAST");

  // 3. Header School Name in Royal Blue
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10.5);
  pdf.setTextColor(26, 102, 206); // #1A66CE
  pdf.text("WELUDE BIRHAN SUNDAY SCHOOL", 42.5, 38, { align: "center" });

  // 4. Subtle, Thin Golden Divider Line
  pdf.setDrawColor(250, 204, 21); // #FACC15
  pdf.setLineWidth(0.5);
  pdf.line(21.25, 42, 63.75, 42);

  // 5. Centered Floating QR Code Container
  const studentId = student.studentId || student.id || "";
  const qrImage = await QRCode.toDataURL(studentId, {
    errorCorrectionLevel: "H",
    width: 500,
    margin: 1,
    color: {
      dark: "#081226",
      light: "#FFFFFF",
    },
  });

  // Gentle padding & soft border box
  pdf.setFillColor(255, 255, 255);
  pdf.setDrawColor(243, 244, 246); // border-gray-100
  pdf.setLineWidth(0.3);
  pdf.roundedRect(22.5, 47, 40, 40, 3, 3, "FD");
  pdf.addImage(qrImage, "PNG", 25, 49.5, 35, 35, undefined, "FAST");

  // 6. Student Typography (Live API Data)
  // Full Name in bold dark gray
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(13);
  pdf.setTextColor(31, 41, 55); // text-gray-800
  const studentName = student.fullname || student.name || "Student";
  pdf.text(studentName, 42.5, 96, { align: "center", maxWidth: 72 });

  // Student ID in soft blue pill badge
  const idText = studentId || "ID PENDING";
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8.5);
  const textWidth = pdf.getTextWidth(idText);
  const pillWidth = Math.max(textWidth + 8, 30);
  const pillX = 42.5 - pillWidth / 2;

  pdf.setFillColor(239, 246, 255); // bg-blue-50
  pdf.setDrawColor(219, 234, 254); // border-blue-100
  pdf.setLineWidth(0.2);
  pdf.roundedRect(pillX, 101, pillWidth, 6.5, 3.25, 3.25, "FD");
  pdf.setTextColor(26, 102, 206); // text-[#1A66CE]
  pdf.text(idText, 42.5, 105.5, { align: "center" });

  // Class Details: Grade & Section in muted gray
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(107, 114, 128); // text-gray-500
  const gradeText = student.gradeLevel ? `Grade: ${student.gradeLevel}` : "Grade: -";
  const secText = student.section ? `Section: ${student.section}` : "Section: -";
  pdf.text(`${gradeText}   •   ${secText}`, 42.5, 114, { align: "center" });

  // 7. Footer Anchor: Edge-to-edge Royal Blue and Gold blocks
  pdf.setFillColor(26, 102, 206); // #1A66CE
  pdf.rect(0, 132, 65, 3, "F");
  pdf.setFillColor(250, 204, 21); // #FACC15
  pdf.rect(65, 132, 20, 3, "F");
}

function StudentQRManager({ token, schoolName = "WELUDE BIRHAN SCHOOL" }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(null);
  const [selectedCardStudent, setSelectedCardStudent] = useState(null);

  const activeToken = token || localStorage.getItem("token") || "";

  // Fetch all active enrollments strictly from live Swagger API
  useEffect(() => {
    let cancelled = false;

    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getAllEnrollments(activeToken);

        if (cancelled) return;

        // Extract records from the live API response (strictly zero mock data)
        const enrollments = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
            ? response.data
            : [];

        // Filter active students and deduplicate by studentId
        const studentMap = new Map();

        enrollments.forEach((enrollment) => {
          if (enrollment.status !== "ACTIVE" || !enrollment.studentId) {
            return;
          }

          studentMap.set(enrollment.studentId, {
            studentId: enrollment.studentId,
            fullname: enrollment.fullname,
            gradeLevel: enrollment.gradeLevel,
            section: enrollment.section?.trim() || "-",
            memberId: enrollment.memberId,
            year: enrollment.year,
          });
        });

        setStudents([...studentMap.values()]);
      } catch (err) {
        if (!cancelled) {
          console.error("Student enrollments fetch error:", err);
          setError(err.message || "Failed to load enrolled students.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    if (activeToken) {
      fetchStudents();
    } else {
      setError("Authentication token is missing. Please sign in again.");
      setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [activeToken]);

  // Group students strictly from live API records by grade level
  const groupedStudents = useMemo(() => {
    return students.reduce((groups, student) => {
      const grade = student.gradeLevel || "Unassigned";

      if (!groups[grade]) {
        groups[grade] = [];
      }

      groups[grade].push(student);
      return groups;
    }, {});
  }, [students]);

  // Sort grade levels naturally
  const grades = useMemo(() => {
    return Object.keys(groupedStudents).sort((a, b) =>
      a.localeCompare(b, undefined, {
        numeric: true,
        sensitivity: "base",
      })
    );
  }, [groupedStudents]);

  // Generate batch PDF for a specific grade using new royal blue & gold layout
  const generateGradePDF = async (grade) => {
    try {
      setGenerating(grade);
      setError("");

      const gradeStudents = groupedStudents[grade] || [];

      if (!gradeStudents.length) {
        throw new Error("No students found in this grade.");
      }

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [85, 135],
      });

      for (let i = 0; i < gradeStudents.length; i++) {
        await drawStudentCardPage(pdf, gradeStudents[i], i === 0);
      }

      const safeGrade = String(grade).replace(/[^a-z0-9]/gi, "_");
      pdf.save(`Student_QR_Codes_${safeGrade}.pdf`);
    } catch (err) {
      console.error("Grade batch PDF error:", err);
      setError(err.message || "Failed to generate QR codes.");
    } finally {
      setGenerating(null);
    }
  };

  // Generate batch PDF for ALL enrolled students using new royal blue & gold layout
  const generateAllPDF = async () => {
    try {
      setGenerating("ALL");
      setError("");

      if (!students.length) {
        throw new Error("No students available for ID generation.");
      }

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [85, 135],
      });

      for (let i = 0; i < students.length; i++) {
        await drawStudentCardPage(pdf, students[i], i === 0);
      }

      pdf.save("All_Student_QR_IDs.pdf");
    } catch (err) {
      console.error("All batch PDF error:", err);
      setError(err.message || "Failed to generate QR codes.");
    } finally {
      setGenerating(null);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center p-12 text-center text-slate-500 dark:text-slate-400 gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-amber-500" />
        <p className="text-sm font-medium">Loading enrolled students...</p>
      </div>
    );
  }

  // Critical error with zero students loaded
  if (error && students.length === 0) {
    return (
      <div className="p-5 bg-rose-500/10 border border-rose-500/20 text-rose-500 dark:text-rose-400 rounded-xl text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Header & Global Batch Action */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold font-serif tracking-tight text-slate-900 dark:text-slate-100">
            Student QR Management
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage, preview, and generate official student identification QR ID cards.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-blue-50 dark:bg-blue-500/10 text-[#1A66CE] dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold">
            Total Active Students: {students.length}
          </div>

          {students.length > 0 && (
            <button
              type="button"
              onClick={generateAllPDF}
              disabled={generating !== null}
              className="inline-flex items-center gap-2 bg-[#1A66CE] hover:bg-[#1553a6] text-white px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {generating === "ALL" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating All IDs...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download All QR PDFs</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Error notification banner */}
      {error && (
        <div className="p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-medium">
          {error}
        </div>
      )}

      {/* Zero Mock Data: Clean Empty State if no students available */}
      {students.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3">
            <IdCard className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
            No students available for ID generation.
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
            There are currently no active students enrolled in any Sunday School grade level. Enroll students first to generate their official ID cards.
          </p>
        </div>
      ) : (
        /* Grade Roster Tables */
        grades.map((grade) => (
          <div
            key={grade}
            className="border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden bg-white dark:bg-[#0b1b3d]/60 shadow-sm transition-colors"
          >
            {/* Grade Card Header */}
            <div className="flex flex-wrap justify-between items-center gap-3 p-4 border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {grade}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {groupedStudents[grade].length} enrolled student
                  {groupedStudents[grade].length === 1 ? "" : "s"}
                </p>
              </div>

              {/* Grade-Level Batch Download button */}
              <button
                type="button"
                onClick={() => generateGradePDF(grade)}
                disabled={generating !== null}
                className="inline-flex items-center gap-1.5 bg-[#1A66CE] hover:bg-[#1553a6] text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm cursor-pointer"
              >
                {generating === grade ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Generating Grade PDF...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Download QR PDFs</span>
                  </>
                )}
              </button>
            </div>

            {/* Responsive Student Table */}
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 font-semibold uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">No.</th>
                    <th className="py-3 px-4">Full Name</th>
                    <th className="py-3 px-4">Student ID</th>
                    <th className="py-3 px-4">Grade Level</th>
                    <th className="py-3 px-4">Section</th>
                    <th className="py-3 px-4">Academic Year</th>
                    <th className="py-3 px-4 text-right">Official ID</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {groupedStudents[grade].map((student, index) => (
                    <tr
                      key={student.studentId}
                      onClick={() => setSelectedCardStudent(student)}
                      className="border-t border-slate-200 dark:border-white/10 transition-colors cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50 group"
                      title="Click to preview official ID card"
                    >
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-medium">
                        {index + 1}
                      </td>

                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100 group-hover:text-amber-500 transition-colors">
                        {student.fullname}
                      </td>

                      <td className="py-3 px-4 font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                        {student.studentId}
                      </td>

                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                        {student.gradeLevel}
                      </td>

                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                        {student.section}
                      </td>

                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {student.year}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCardStudent(student);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 text-[#1A66CE] dark:text-blue-300 font-semibold text-xs transition cursor-pointer border border-blue-200 dark:border-blue-500/30 shadow-xs"
                        >
                          <IdCard className="w-3.5 h-3.5" />
                          <span>View Card</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}

      {/* Official Student ID Card Modal Preview & Individual Export */}
      <StudentIDCardModal
        isOpen={Boolean(selectedCardStudent)}
        onClose={() => setSelectedCardStudent(null)}
        student={selectedCardStudent}
      />
    </div>
  );
}

StudentQRManager.propTypes = {
  token: PropTypes.string,
  schoolName: PropTypes.string,
};

export default StudentQRManager;
