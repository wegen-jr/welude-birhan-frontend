import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Users, FileText, CheckSquare, Upload, GraduationCap, RefreshCw, AlertCircle, ArrowRight } from 'lucide-react';
import { sundaySchoolService } from '../../services/sundaySchoolService';
import { teacherService } from '../../services/teacherService';

export function TeacherDashboard() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  })();

  const fetchAssignedClasses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [allClasses, enrollments, teachers] = await Promise.all([
        sundaySchoolService.getClasses().catch(() => []),
        sundaySchoolService.getEnrollments().catch(() => []),
        teacherService.getTeachers().catch(() => []),
      ]);

      const classList = Array.isArray(allClasses) ? allClasses : [];
      const enrollmentList = Array.isArray(enrollments) ? enrollments : [];
      const teacherList = Array.isArray(teachers) ? teachers : [];

      // Check if logged-in user matches any teacher record by email or name
      const currentTeacher = teacherList.find(
        (t) => 
          (t.email && user.email && t.email.toLowerCase() === user.email.toLowerCase()) ||
          (t.name && user.name && t.name.toLowerCase() === user.name.toLowerCase())
      );

      let relevantClasses = classList;
      if (currentTeacher?.assignedClasses?.length > 0) {
        // Filter to teacher's assigned classes
        const assigned = classList.filter((cls) =>
          currentTeacher.assignedClasses.some(
            (ac) =>
              (ac.id && cls.id && String(ac.id) === String(cls.id)) ||
              (ac.gradeLevel && ac.section &&
               String(ac.gradeLevel).toLowerCase() === String(cls.gradeLevel).toLowerCase() &&
               String(ac.section).toLowerCase() === String(cls.section).toLowerCase())
          )
        );
        if (assigned.length > 0) {
          relevantClasses = assigned;
        }
      }

      // Enrich each class with its enrolled students count
      const enriched = relevantClasses.map((cls) => {
        const studentCount = enrollmentList.filter(
          (e) =>
            e.gradeLevel &&
            e.section &&
            String(e.gradeLevel).toLowerCase() === String(cls.gradeLevel).toLowerCase() &&
            String(e.section).toLowerCase() === String(cls.section).toLowerCase()
        ).length;

        return {
          id: cls.id || `${cls.gradeLevel}-${cls.section}`,
          grade: cls.gradeLevel,
          section: cls.section,
          students: studentCount,
        };
      });

      setClasses(enriched);
    } catch (err) {
      console.error('Failed to load teacher dashboard data:', err);
      setError('Unable to load assigned classrooms.');
    } finally {
      setLoading(false);
    }
  }, [user.email, user.name]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAssignedClasses();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchAssignedClasses]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Teacher Portal</h1>
          <p className="text-sm text-slate-400 mt-1">
            Sunday School classroom supervision and student attendance management
          </p>
        </div>

        <button
          onClick={fetchAssignedClasses}
          disabled={loading}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border border-white/10 hover:bg-white/5 text-slate-300 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-500' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Real Assigned Classes Section */}
        <div className="bg-surface rounded-3xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-accent" /> Assigned Classes
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
              {classes.length} Active
            </span>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
              <span className="text-xs">Loading classes...</span>
            </div>
          ) : error ? (
            <div className="p-6 rounded-2xl border border-rose-500/20 bg-rose-500/10 text-rose-300 text-center">
              <AlertCircle className="w-6 h-6 mx-auto mb-2 text-rose-400" />
              <p className="text-xs font-semibold">{error}</p>
            </div>
          ) : classes.length === 0 ? (
            <div className="p-8 rounded-2xl border border-slate-800 text-center text-slate-400">
              <GraduationCap className="w-8 h-8 mx-auto text-slate-500 mb-2" />
              <p className="text-sm font-semibold text-slate-300">No classes assigned yet</p>
              <p className="text-xs text-slate-500 mt-1">
                Classroom assignments will appear here once allocated by Education Hub leadership.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {classes.map((c) => (
                <div 
                  key={c.id} 
                  className="p-4 rounded-2xl bg-background border border-slate-800 flex justify-between items-center transition hover:border-slate-700"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">{c.grade}</h3>
                      <p className="text-xs text-slate-400">Section {c.section}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-accent">{c.students}</span>
                    <p className="text-xs text-slate-400">Students</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-surface rounded-3xl p-6 border border-slate-800">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-green-500" /> Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <Link 
              to="/dashboard/education"
              className="p-4 rounded-2xl bg-background border border-slate-800 hover:border-accent transition group text-left block"
            >
              <CheckSquare className="w-6 h-6 text-slate-400 group-hover:text-accent mb-3" />
              <h3 className="font-medium text-white">Class Roster</h3>
              <p className="text-xs text-slate-500 mt-1">Inspect student rosters</p>
            </Link>

            <Link 
              to="/dashboard/courses"
              className="p-4 rounded-2xl bg-background border border-slate-800 hover:border-accent transition group text-left block"
            >
              <FileText className="w-6 h-6 text-slate-400 group-hover:text-accent mb-3" />
              <h3 className="font-medium text-white">Curriculum</h3>
              <p className="text-xs text-slate-500 mt-1">View active course subjects</p>
            </Link>

            <div className="p-4 rounded-2xl bg-background border border-slate-800 hover:border-accent transition group text-left col-span-2 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-xl">
                  <Upload className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-medium text-white">Teaching Resources</h3>
                  <p className="text-xs text-slate-500">Curriculum guides & hymn material</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-accent transition" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherDashboard;
