import { api } from './api';

export const classService = {
  getClasses: () => api.get('/classes'),
  getAssignedClasses: () => api.get('/classes/assigned'),
  recordAttendance: (classId, data) => api.post(`/classes/${classId}/attendance`, data),
  submitGrades: (classId, data) => api.post(`/classes/${classId}/grades`, data),
};
