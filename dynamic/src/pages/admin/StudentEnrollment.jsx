import { useState } from "react";
import { useOutletContext, Link } from "react-router-dom";
import { BookOpen, ArrowRight } from "lucide-react";
import StudentIdGeneration from "../../components/SundaySchool/StudentIdGeneration";
import ClassEnrollment from "../../components/SundaySchool/ClassEnrollment";
import EnrolledStudentTable from "../../components/SundaySchool/EnrolledStudentTable";

export default function StudentEnrollment() {
  const context = useOutletContext();
  const isDarkMode = context?.isDarkMode ?? true;

  const [generatedStudent, setGeneratedStudent] = useState(null);
  const [newlyEnrolledStudent, setNewlyEnrolledStudent] = useState(null);

  const handleStudentGenerated = (data) => {
    setGeneratedStudent(data);
  };

  const handleEnrollmentSuccess = (enrolledData) => {
    setNewlyEnrolledStudent(enrolledData);
  };

  return (
    <div className={`p-6 sm:p-8 space-y-8 min-h-full transition-colors duration-300 ${
      isDarkMode ? "text-slate-100" : "text-slate-800"
    }`}>
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-inherit">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-500 font-semibold mb-1">
            <span>Sunday School Platform</span>
            <span>/</span>
            <span>Administration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight">
            Student Enrollment
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Register church members into the Sunday School program: generate official student IDs, assign students to grade levels & sections, and monitor enrolled rosters.
          </p>
        </div>

        <Link
          to="/dashboard/education"
          className={`self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
            isDarkMode 
              ? "bg-white/5 border-white/10 hover:bg-white/10 text-amber-400" 
              : "bg-slate-100 border-slate-200 hover:bg-slate-200 text-amber-600"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>View Education Hub Overview</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Two-Column Enrollment Workflow Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Step 1: Generate Student ID Form */}
        <StudentIdGeneration 
          onStudentGenerated={handleStudentGenerated} 
          isDarkMode={isDarkMode} 
        />

        {/* Step 2 & Enrollment: Class Setup & Student Enrollment */}
        <ClassEnrollment 
          studentData={generatedStudent} 
          onEnrollmentSuccess={handleEnrollmentSuccess} 
          isDarkMode={isDarkMode} 
        />
      </div>

      {/* Immediately Below: Enrolled Student Table */}
      <div>
        <EnrolledStudentTable 
          newlyEnrolledStudent={newlyEnrolledStudent} 
          isDarkMode={isDarkMode} 
        />
      </div>
    </div>
  );
}
