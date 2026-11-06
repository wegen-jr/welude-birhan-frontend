
import { useEffect, useMemo, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

import TeacherService from "../../services/teacher/TeacherService";
import AttendanceService from "../../services/teacher/AttendanceService";

// Get logged-in teacher information
function getSavedTeacher() {
  try {
    const savedUser = localStorage.getItem("user");

    return savedUser ? JSON.parse(savedUser) : null;
  } catch {
    return null;
  }
}

function TeacherAttendanceScanner() {
  const [teacher] = useState(getSavedTeacher);

  const [classes, setClasses] = useState([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [scanError, setScanError] = useState("");

  const [attendanceRecords, setAttendanceRecords] = useState([]);

  const [scannerStatus, setScannerStatus] = useState(
    "Camera not started"
  );

  // Prevent simultaneous scan processing
  const processingRef = useRef(false);

  // Keep the latest scan handler available to the camera callback
  const handleScanRef = useRef(null);

  // Track successfully submitted attendance records
  const recordedKeysRef = useRef(new Set());

  // Selected class
  const selectedClass = useMemo(() => {
    return (
      classes.find(
        (item) =>
          String(item.assignmentId) === selectedAssignmentId
      ) || null
    );
  }, [classes, selectedAssignmentId]);

  // Active students in selected class
  const students = useMemo(() => {
    if (!selectedClass) return [];

    return (selectedClass.students || []).filter(
      (student) => student.status === "ACTIVE"
    );
  }, [selectedClass]);

  // Fetch teacher's assigned classes
  useEffect(() => {
    let cancelled = false;

    const fetchClasses = async () => {
      try {
        setLoading(true);
        setError("");

        if (teacher?.tid == null) {
          throw new Error(
            "Teacher information or teacher ID is missing."
          );
        }

        // Use the existing TeacherService method
        const response = await TeacherService.getTeacherStudents(
          teacher.tid
        );

        if (!cancelled) {
          setClasses(
            Array.isArray(response?.classes)
              ? response.classes
              : []
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message || "Failed to load assigned classes."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchClasses();

    return () => {
      cancelled = true;
    };
  }, [teacher]);

  // Process scanned QR code
  handleScanRef.current = async (scannedStudentId) => {
    if (!selectedClass || !teacher?.tid) return;

    const studentId = scannedStudentId.trim();

    setScanError("");

    // Find student in the selected class
    const student = students.find(
      (item) => item.studentId === studentId
    );

    // Reject students who don't belong to this class
    if (!student) {
      setScanError(
        `Student ID "${studentId}" does not belong to ${selectedClass.courseName}.`
      );
      return;
    }

    // Create a unique key for this attendance record
    const attendanceKey =
      `${selectedClass.assignmentId}-${student.studentId}`;

    // Prevent duplicate submissions
    if (recordedKeysRef.current.has(attendanceKey)) {
      setScanError(
        `${student.fullname} has already been marked present in this session.`
      );
      return;
    }

    try {
      const payload = {
        studentId: student.studentId,
        fullname: student.fullname,
        courseId: selectedClass.courseId,
        courseName: selectedClass.courseName,
        gradeLevel: student.gradeLevel,
        teacherid: teacher.tid,
        date: new Date().toISOString(),
        status: "Present",
      };

      // Submit attendance to backend
      await AttendanceService.create(payload);

      // Mark as recorded only after successful API response
      recordedKeysRef.current.add(attendanceKey);

      // Update attendance table
      setAttendanceRecords((previous) => [
        ...previous,
        {
          assignmentId: selectedClass.assignmentId,
          studentId: student.studentId,
          fullname: student.fullname,
          courseName: selectedClass.courseName,
          time: new Date().toLocaleTimeString(),
        },
      ]);

      setScanError("");
    } catch (err) {
      setScanError(
        err.message || "Failed to submit attendance."
      );
    }
  };

  // Start and stop camera when selected class changes
  useEffect(() => {
    if (!selectedAssignmentId || !selectedClass) {
      setScannerStatus("Select a class to start scanning.");
      return;
    }

    let cancelled = false;
    let scannerStarted = false;

    const scanner = new Html5Qrcode("student-qr-reader");

    const startScanner = async () => {
      try {
        setScanError("");
        setScannerStatus("Starting camera...");

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: {
              width: 250,
              height: 250,
            },
          },
          async (decodedText) => {
            // Avoid processing multiple camera callbacks simultaneously
            if (processingRef.current) return;

            processingRef.current = true;

            try {
              await handleScanRef.current?.(decodedText);
            } finally {
              processingRef.current = false;
            }
          },
          () => {
            // Ignore continuous QR detection failures
          }
        );

        scannerStarted = true;

        // Handle class changes while camera was starting
        if (cancelled) {
          await scanner.stop();
          scannerStarted = false;
          await scanner.clear();
          return;
        }

        setScannerStatus(
          "Camera is ready. Scan a student QR code."
        );
      } catch (err) {
        if (!cancelled) {
          setScannerStatus("Camera unavailable");

          setScanError(
            err.message ||
              "Unable to start camera. Check camera permissions."
          );
        }

        if (!scannerStarted) {
          try {
            await scanner.clear();
          } catch {
            // Scanner may not have initialized.
          }
        }
      }
    };

    startScanner();

    return () => {
      cancelled = true;

      // Stop the camera before clearing its resources
      if (scannerStarted) {
        scanner
          .stop()
          .then(() => scanner.clear())
          .catch(() => {});
      }
    };
  }, [selectedAssignmentId, selectedClass]);

  // Attendance records for currently selected class
  const currentAttendance = attendanceRecords.filter(
    (record) =>
      record.assignmentId === selectedClass?.assignmentId
  );

  // Loading state
  if (loading) {
    return (
      <div className="p-6 text-center">
        Loading your assigned classes...
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-4 rounded-lg bg-red-50 text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">
          Student Attendance
        </h2>

        <p className="text-gray-500 mt-1">
          Welcome, {teacher?.fullname}
        </p>
      </div>

      {/* Class selection */}
      <div className=" border rounded-xl p-5 space-y-3">

        <label className="block font-semibold">
          Select Class / Course
        </label>

        <select
          value={selectedAssignmentId}
          onChange={(e) => {
            setSelectedAssignmentId(e.target.value);
            setScanError("");
            setScannerStatus("Starting camera...");
          }}
          className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">
            Select a class
          </option>

          {classes.map((item) => (
            <option
              key={item.assignmentId}
              value={item.assignmentId}
            >
              {item.courseName} - {item.gradeLevel}
            </option>
          ))}
        </select>

        {classes.length === 0 && (
          <p className="text-amber-600 text-sm">
            No classes have been assigned to you.
          </p>
        )}

      </div>

      {selectedClass && (
        <>

          {/* Class information */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            <div className="bg-blue-50 p-4 rounded-xl">
              <p className="text-sm text-gray-500">
                Course
              </p>

              <p className="font-semibold">
                {selectedClass.courseName}
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl">
              <p className="text-sm text-gray-500">
                Grade
              </p>

              <p className="font-semibold">
                {selectedClass.gradeLevel}
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl">
              <p className="text-sm text-gray-500">
                Enrolled Students
              </p>

              <p className="font-semibold">
                {students.length}
              </p>
            </div>

          </div>

          {/* QR Scanner */}
          <div className="border rounded-xl p-5 space-y-4">

            <div>
              <h3 className="text-lg font-bold">
                QR Code Scanner
              </h3>

              <p className="text-sm text-gray-500">
                Position the student's QR code inside the camera frame.
              </p>
            </div>

            <div className="max-w-md mx-auto">

              <div
                id="student-qr-reader"
                className="w-full overflow-hidden rounded-lg"
              />

            </div>

            <p className="text-center text-sm text-gray-500">
              {scannerStatus}
            </p>

            {scanError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {scanError}
              </div>
            )}

          </div>

          {/* Attendance summary */}
          <div className="border rounded-xl overflow-hidden">

            <div className="flex justify-between items-center p-4 bg-gray-50 border-b">

              <div>
                <h3 className="font-bold">
                  Attendance Records
                </h3>

                <p className="text-sm text-gray-500">
                  Students marked present during this session
                </p>
              </div>

              <div className="bg-green-100 text-green-700 px-3 py-2 rounded-lg">
                {currentAttendance.length} Present
              </div>

            </div>

            {currentAttendance.length === 0 ? (

              <p className="p-6 text-center text-gray-500">
                No students have been scanned yet.
              </p>

            ) : (

              <div className="overflow-x-auto">

                <table className="w-full text-left">

                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-3">No.</th>
                      <th className="p-3">Student Name</th>
                      <th className="p-3">Student ID</th>
                      <th className="p-3">Time</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {currentAttendance.map((record, index) => (

                      <tr
                        key={`${record.assignmentId}-${record.studentId}`}
                        className="border-t"
                      >

                        <td className="p-3">
                          {index + 1}
                        </td>

                        <td className="p-3 font-medium">
                          {record.fullname}
                        </td>

                        <td className="p-3">
                          {record.studentId}
                        </td>

                        <td className="p-3">
                          {record.time}
                        </td>

                        <td className="p-3">
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                            Present
                          </span>
                        </td>

                      </tr>

                    ))}
                  </tbody>

                </table>

              </div>

            )}

          </div>

        </>
      )}

    </div>
  );
}

export default TeacherAttendanceScanner;
