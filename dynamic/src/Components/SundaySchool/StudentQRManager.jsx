
import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { jsPDF } from "jspdf";
import { getAllEnrollments } from "../../services/educationhub/studentService";

function StudentQRManager({
  token,
  schoolName = "WELUDE BIRHAN SCHOOL",
}) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(null);

  // Fetch all enrollments
  useEffect(() => {
    const fetchStudents = async () => {
  try {
    setLoading(true);
    setError("");

    const response = await getAllEnrollments(token);

    // Extract records from the actual API response
    const enrollments = Array.isArray(response)
      ? response
      : Array.isArray(response.data)
        ? response.data
        : [];

    // Keep active students and remove duplicates
    const studentMap = new Map();

    enrollments.forEach((enrollment) => {
      if (
        enrollment.status !== "ACTIVE" ||
        !enrollment.studentId
      ) {
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
    setError(err.message || "Something went wrong.");
  } finally {
    setLoading(false);
  }
};

    if (token) {
      fetchStudents();
    } else {
      setError("Authentication token is missing.");
      setLoading(false);
    }
  }, [token]);

  // Group students by grade level
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

  // Sort grade levels
  const grades = useMemo(() => {
    return Object.keys(groupedStudents).sort((a, b) =>
      a.localeCompare(b, undefined, {
        numeric: true,
        sensitivity: "base",
      })
    );
  }, [groupedStudents]);

  // Generate PDF for a specific grade
  const generateGradePDF = async (grade) => {
    try {
      setGenerating(grade);
      setError("");

      const gradeStudents = groupedStudents[grade];

      if (!gradeStudents?.length) {
        throw new Error("No students found in this grade.");
      }

      // Student identification card PDF
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [85, 120],
      });

      for (let i = 0; i < gradeStudents.length; i++) {
        const student = gradeStudents[i];

        if (!student.studentId) {
          throw new Error("A student is missing their ID.");
        }

        if (i > 0) {
          pdf.addPage([85, 120], "portrait");
        }

        // Generate QR code using student ID
        const qrImage = await QRCode.toDataURL(
          student.studentId,
          {
            errorCorrectionLevel: "H",
            width: 500,
            margin: 2,
            color: {
              dark: "#000000",
              light: "#FFFFFF",
            },
          }
        );

        // School name
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(12);

        pdf.text(
          schoolName,
          42.5,
          13,
          {
            align: "center",
            maxWidth: 75,
          }
        );

        // Divider
        pdf.setLineWidth(0.4);
        pdf.line(7, 20, 78, 20);

        // Student name
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(12);

        pdf.text(
          student.fullname || "Student",
          42.5,
          30,
          {
            align: "center",
            maxWidth: 72,
          }
        );

        // Student ID
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);

        pdf.text(
          `Student ID: ${student.studentId}`,
          42.5,
          38,
          {
            align: "center",
            maxWidth: 72,
          }
        );

        // Grade
        pdf.text(
          `Grade: ${student.gradeLevel}`,
          42.5,
          45,
          { align: "center" }
        );

        // Section
        pdf.text(
          `Section: ${student.section}`,
          42.5,
          51,
          { align: "center" }
        );

        // QR code
        pdf.addImage(
          qrImage,
          "PNG",
          17.5,
          56,
          50,
          50
        );

        // Footer
        pdf.setFontSize(7);
        pdf.text(
          "STUDENT IDENTIFICATION",
          42.5,
          114,
          { align: "center" }
        );
      }

      // Download PDF
      const safeGrade = grade.replace(
        /[^a-z0-9]/gi,
        "_"
      );

      pdf.save(`Student_QR_Codes_${safeGrade}.pdf`);

    } catch (err) {
      setError(
        err.message || "Failed to generate QR codes."
      );
    } finally {
      setGenerating(null);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center p-10">
        <p>Loading enrolled students...</p>
      </div>
    );
  }

  // Error state
  if (error && students.length === 0) {
    return (
      <div className="p-4 text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">

        <div>
          <h2 className="text-2xl font-bold">
            Student QR Management
          </h2>

          <p className="text-gray-500 mt-1">
            Manage and generate student identification QR codes.
          </p>
        </div>

        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg">
          Total Students: {students.length}
        </div>

      </div>

      {/* Error message */}
      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      {/* Grade tables */}
      {grades.length === 0 ? (
        <div className="p-8 text-center border rounded-xl">
          No active enrolled students found.
        </div>
      ) : (
        grades.map((grade) => (

          <div
            key={grade}
            className="border rounded-xl overflow-hidden"
          >

            {/* Grade header */}
            <div className="flex flex-wrap justify-between items-center gap-3 p-4  border-b">

              <div>
                <h3 className="text-lg font-semibold">
                  {grade}
                </h3>

                <p className="text-sm ">
                  {groupedStudents[grade].length} students
                </p>
              </div>

              {/* Download button */}
              <button
                onClick={() => generateGradePDF(grade)}
                disabled={generating !== null}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 transition"
              >
                {generating === grade
                  ? "Generating PDF..."
                  : "Download QR PDFs"}
              </button>

            </div>

            {/* Student table */}
            <div className="overflow-x-auto">

              <table className="w-full text-left">

                <thead>
                  <tr>
                    <th className="p-3">No.</th>
                    <th className="p-3">Full Name</th>
                    <th className="p-3">Student ID</th>
                    <th className="p-3">Grade Level</th>
                    <th className="p-3">Section</th>
                    <th className="p-3">Academic Year</th>
                  </tr>
                </thead>

                <tbody>
                  {groupedStudents[grade].map(
                    (student, index) => (

                      <tr
                        key={student.studentId}
                        className="border-t hover:bg-gray-50"
                      >

                        <td className="p-3">
                          {index + 1}
                        </td>

                        <td className="p-3 font-medium">
                          {student.fullname}
                        </td>

                        <td className="p-3">
                          {student.studentId}
                        </td>

                        <td className="p-3">
                          {student.gradeLevel}
                        </td>

                        <td className="p-3">
                          {student.section}
                        </td>

                        <td className="p-3">
                          {student.year}
                        </td>

                      </tr>

                    )
                  )}
                </tbody>

              </table>

            </div>

          </div>

        ))
      )}

    </div>
  );
}

export default StudentQRManager;
