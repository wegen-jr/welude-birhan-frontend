import { api } from './api';
import { courseService } from './courseService';
import { teacherService } from './teacherService';

export const classService = {
  // Live Swagger class endpoints (/class)
  getClasses: async () => {
    try {
      const data = await api.get('/class');
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      if (Array.isArray(data?.classes)) return data.classes;
      return [];
    } catch {
      // Fallback in case backend routing accepts /classes
      const fallback = await api.get('/classes').catch(() => []);
      return Array.isArray(fallback) ? fallback : fallback?.data || [];
    }
  },
  getClassById: (id) => api.get(`/class/${id}`),
  createClass: (classData) => api.post('/class', classData),
  updateClass: (id, classData) => api.patch(`/class/${id}`, classData),
  deleteClass: (id) => api.delete(`/class/${id}`),

  getAssignedClasses: () => api.get('/classes/assigned'),
  recordAttendance: (classId, data) => api.post(`/classes/${classId}/attendance`, data),
  submitGrades: (classId, data) => api.post(`/classes/${classId}/grades`, data),

  // Course Assignment mappings
  assignCourse: (assignmentData) => courseService.assignCourseToClass(assignmentData),
  getClassCourseAssignments: () => courseService.getClassCourseAssignments(),
  getCoursesForClass: (classLevel) => courseService.getCoursesByClassLevel(classLevel),
  unassignCourse: (assignmentId) => courseService.unassignCourseFromClass(assignmentId),

  // Teacher Assignment mappings (POST /assign-teacher-for-class & GET /assign-teacher-for-class)
  assignTeacherToClass: (assignmentData) => teacherService.assignTeacherToClass(assignmentData),
  getTeacherAssignments: () => teacherService.getTeacherAssignments(),
  unassignTeacherAssignment: (assignmentId, teacherId, classId) =>
    teacherService.unassignTeacherAssignment(assignmentId, teacherId, classId),
  getStudentsForTeacher: (teacherId) => teacherService.getStudentsForTeacher(teacherId),
};

export default classService;


