import { apiClient } from './api';

const ASSIGNMENTS_STORAGE_KEY = 'welude_teacher_class_assignments';

/**
 * Local storage helper to manage teacher-class assignments
 * Provides persistence and synchronization alongside the backend API
 */
function getStoredAssignments() {
  try {
    const raw = localStorage.getItem(ASSIGNMENTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.warn('Failed to parse teacher assignments from storage:', e);
    return {};
  }
}

function saveStoredAssignments(map) {
  try {
    localStorage.setItem(ASSIGNMENTS_STORAGE_KEY, JSON.stringify(map));
  } catch (e) {
    console.warn('Failed to persist teacher assignments to storage:', e);
  }
}

/**
 * Normalizes teacher entity with standard properties and assigned classes
 */
function formatTeacherRecord(teacher) {
  if (!teacher) return null;
  const id = Number(teacher.id) || teacher.id;
  const allAssignments = getStoredAssignments();
  const localAssigned = allAssignments[String(id)] || [];

  // Merge any backend assignedClasses if provided with local storage
  const backendAssigned = Array.isArray(teacher.assignedClasses)
    ? teacher.assignedClasses
    : Array.isArray(teacher.classes)
      ? teacher.classes
      : [];

  const combinedClasses = [...backendAssigned];
  localAssigned.forEach((loc) => {
    if (!combinedClasses.some((c) => String(c.id || c.classId) === String(loc.id || loc.classId))) {
      combinedClasses.push(loc);
    }
  });

  return {
    id,
    name: teacher.name || '',
    email: teacher.email || '',
    phone: teacher.phone || '',
    department: teacher.department || 'General Spiritual Education',
    assignedClasses: combinedClasses,
    createdAt: teacher.createdAt || teacher.cratedAt || null,
    updatedAt: teacher.updatedAt || null,
    raw: teacher,
  };
}

/**
 * Formats API errors into user-friendly error messages
 */
function parseTeacherError(err, fallbackMessage) {
  if (err?.status === 409) {
    return new Error('A teacher with this email or phone number already exists in the system.');
  }
  if (err?.status === 400) {
    const detail = err.data?.message || err.message;
    return new Error(`Validation failed: ${Array.isArray(detail) ? detail.join(', ') : detail}`);
  }
  if (err?.status === 401) {
    return new Error('Your session has expired. Please sign in again.');
  }
  if (err?.status === 403) {
    return new Error('Access denied. Only Education Hub leaders and administrators can perform this action.');
  }
  if (err?.status === 404) {
    return new Error('Teacher record not found.');
  }
  if (err?.status === 500) {
    return new Error('The server experienced a temporary internal error (likely a backend cold-start or database sync on Render). Please retry in a few moments.');
  }
  return new Error(err?.message || fallbackMessage);
}

export const teacherService = {
  /**
   * Fetch all teachers (GET /teachers)
   * Swagger Operation: TeacherController_findAll
   */
  getTeachers: async () => {
    try {
      const data = await apiClient('/teachers');
      let list = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (Array.isArray(data?.data)) {
        list = data.data;
      } else if (Array.isArray(data?.teachers)) {
        list = data.teachers;
      } else if (Array.isArray(data?.items)) {
        list = data.items;
      }

      return list.map(formatTeacherRecord).filter(Boolean);
    } catch (err) {
      console.error('Failed to fetch teachers:', err);
      throw parseTeacherError(err, 'Failed to fetch teachers directory. Please try again.');
    }
  },

  /**
   * Fetch a teacher by numeric ID (GET /teachers/{id})
   * Swagger Operation: TeacherController_findOne
   */
  getTeacherById: async (id) => {
    try {
      const data = await apiClient(`/teachers/${id}`);
      return formatTeacherRecord(data?.data || data);
    } catch (err) {
      console.error(`Failed to fetch teacher #${id}:`, err);
      throw parseTeacherError(err, `Failed to fetch teacher #${id}.`);
    }
  },

  /**
   * Create a new teacher (POST /teachers)
   * Swagger Operation: TeacherController_create
   * DTO: UpdateTeacherDto { name, email, phone, department }
   */
  createTeacher: async (teacherData) => {
    // Sanitize phone number (strip whitespace, ensure string)
    const rawPhone = String(teacherData.phone || '').trim().replace(/\s+/g, '');
    const payload = {
      name: String(teacherData.name || '').trim(),
      email: String(teacherData.email || '').trim().toLowerCase(),
      phone: rawPhone,
      department: String(teacherData.department || 'General Spiritual Education').trim(),
    };

    if (!payload.name) {
      throw new Error('Teacher full name is required.');
    }
    if (!payload.email) {
      throw new Error('Email address is required.');
    }
    if (!payload.phone) {
      throw new Error('Phone number is required.');
    }

    try {
      const result = await apiClient('/teachers', {
        method: 'POST',
        body: payload,
      });

      const created = formatTeacherRecord(result?.data || result);

      // If initial class assignment was provided in creation form
      if (teacherData.initialClass && created?.id) {
        teacherService.assignClassToTeacher(created.id, teacherData.initialClass);
        created.assignedClasses = [teacherData.initialClass];
      }

      return created;
    } catch (err) {
      console.warn('Initial POST /teachers request encountered an error:', err);

      // Graceful Recovery for transient 500 / Network drops on Render free tier
      if (err?.status === 500 || !err?.status) {
        // Step 1: Check if record was already committed to database despite dropped connection
        try {
          const list = await teacherService.getTeachers();
          const existing = list.find((t) => 
            (t.email && t.email.toLowerCase() === payload.email) ||
            (t.phone && t.phone === payload.phone)
          );
          if (existing) {
            console.log('Teacher record was verified in database despite transient 500:', existing);
            if (teacherData.initialClass && existing.id) {
              teacherService.assignClassToTeacher(existing.id, teacherData.initialClass);
              existing.assignedClasses = [teacherData.initialClass];
            }
            return existing;
          }
        } catch (lookupErr) {
          console.warn('Post-500 directory verification lookup failed:', lookupErr);
        }

        // Step 2: Retry once after a short delay (gives Render / DB connection time to warm up)
        try {
          console.log('Retrying POST /teachers after cold-start pause...');
          await new Promise((resolve) => setTimeout(resolve, 1500));
          const retryResult = await apiClient('/teachers', {
            method: 'POST',
            body: payload,
          });

          const created = formatTeacherRecord(retryResult?.data || retryResult);
          if (teacherData.initialClass && created?.id) {
            teacherService.assignClassToTeacher(created.id, teacherData.initialClass);
            created.assignedClasses = [teacherData.initialClass];
          }
          return created;
        } catch (retryErr) {
          // If retry returns 409 because the initial attempt eventually succeeded
          if (retryErr?.status === 409) {
            const list = await teacherService.getTeachers().catch(() => []);
            const found = list.find((t) => t.email.toLowerCase() === payload.email);
            if (found) return found;
          }
          console.error('Retry failed:', retryErr);
          throw parseTeacherError(retryErr, 'Failed to create teacher. Please check the inputs.');
        }
      }

      throw parseTeacherError(err, 'Failed to create teacher. Please check the inputs.');
    }
  },

  /**
   * Update an existing teacher (PATCH /teachers/{id})
   * Swagger Operation: TeacherController_update
   * DTO: UpdateTeacherDto { name, email, phone, department }
   */
  updateTeacher: async (id, teacherData) => {
    const payload = {};
    if (teacherData.name !== undefined) payload.name = String(teacherData.name).trim();
    if (teacherData.email !== undefined) payload.email = String(teacherData.email).trim().toLowerCase();
    if (teacherData.phone !== undefined) payload.phone = String(teacherData.phone).trim();
    if (teacherData.department !== undefined) payload.department = String(teacherData.department).trim();

    try {
      const result = await apiClient(`/teachers/${id}`, {
        method: 'PATCH',
        body: payload,
      });

      return formatTeacherRecord(result?.data || result);
    } catch (err) {
      console.error(`Failed to update teacher #${id}:`, err);
      throw parseTeacherError(err, `Failed to update teacher #${id}.`);
    }
  },

  /**
   * Delete a teacher by numeric ID (DELETE /teachers/{id})
   * Swagger Operation: TeacherController_remove
   */
  deleteTeacher: async (id) => {
    try {
      await apiClient(`/teachers/${id}`, {
        method: 'DELETE',
      });

      // Clean up assigned classes mapping
      const allAssignments = getStoredAssignments();
      delete allAssignments[String(id)];
      saveStoredAssignments(allAssignments);

      return true;
    } catch (err) {
      console.error(`Failed to delete teacher #${id}:`, err);
      throw parseTeacherError(err, `Failed to delete teacher #${id}.`);
    }
  },

  /**
   * Fetch all teacher-class-course assignments from backend
   * (GET /assign-teacher-for-class)
   * Swagger Operation: AssignTeacherForClassController_findAll
   */
  getTeacherAssignments: async () => {
    try {
      const data = await apiClient('/assign-teacher-for-class');
      let list = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (Array.isArray(data?.data)) {
        list = data.data;
      } else if (Array.isArray(data?.assignments)) {
        list = data.assignments;
      } else if (Array.isArray(data?.items)) {
        list = data.items;
      }

      return list.map((item) => {
        if (!item) return null;
        const id = Number(item.id) || item.id;
        const teacherId = Number(item.teacherId ?? item.teacher_id);
        const courseId = Number(item.courseId ?? item.course_id);
        return {
          id,
          teacherId,
          teacherName: item.teacherName || item.teacher_name || '',
          courseId,
          courseName: item.courseName || item.course_name || '',
          gradeLevel: item.gradeLevel || item.grade_level || '',
          createdAt: item.createdAt || null,
          raw: item,
        };
      }).filter(Boolean);
    } catch (err) {
      console.warn('GET /assign-teacher-for-class warning:', err);
      return [];
    }
  },

  /**
   * Assign a teacher to a class/course on backend
   * (POST /assign-teacher-for-class)
   * Swagger Operation: AssignTeacherForClassController_create
   * DTO: CreateAssignTeacherForClassDto { teacherId, teacherName, courseId, courseName, gradeLevel }
   */
  assignTeacherToClass: async ({
    teacherId,
    teacherName,
    courseId,
    courseName,
    gradeLevel,
    section,
    classId,
  }) => {
    const tId = Number(teacherId);
    const tName = String(teacherName || '').trim();
    const cId = Number(courseId);
    const cName = String(courseName || '').trim();
    const gLevel = String(gradeLevel || '').trim();

    if (!tId || isNaN(tId)) {
      throw new Error('Valid Teacher ID is required.');
    }
    if (!tName) {
      throw new Error('Teacher name is required.');
    }
    if (!cId || isNaN(cId)) {
      throw new Error('Valid Course ID is required.');
    }
    if (!cName) {
      throw new Error('Course name is required.');
    }
    if (!gLevel) {
      throw new Error('Grade level is required.');
    }

    const payload = {
      teacherId: tId,
      teacherName: tName,
      courseId: cId,
      courseName: cName,
      gradeLevel: gLevel,
    };

    try {
      const result = await apiClient('/assign-teacher-for-class', {
        method: 'POST',
        body: payload,
      });

      // Synchronize in local multi-class manager as well
      teacherService.assignClassToTeacher(tId, {
        id: classId || `${gLevel}-${section || 'A'}`,
        classId: classId || `${gLevel}-${section || 'A'}`,
        gradeLevel: gLevel,
        section: section || 'General',
      });

      return result?.data || result;
    } catch (err) {
      console.error('Failed to assign teacher to class:', err);
      if (err?.status === 400) {
        throw new Error('Validation failed or this teacher is already assigned to this course and grade level.', { cause: err });
      }
      if (err?.status === 404) {
        throw new Error('Teacher, Course, or Grade Level was not found on the backend.', { cause: err });
      }
      throw parseTeacherError(err, 'Failed to assign teacher to class.');
    }
  },

  /**
   * Remove a teacher assignment by assignment ID
   * (DELETE /assign-teacher-for-class/{id})
   * Swagger Operation: AssignTeacherForClassController_remove
   */
  unassignTeacherAssignment: async (assignmentId, teacherId, classId) => {
    const numericId = Number(assignmentId);
    if (!numericId || isNaN(numericId)) {
      throw new Error('Valid assignment ID is required to remove.');
    }

    try {
      await apiClient(`/assign-teacher-for-class/${numericId}`, {
        method: 'DELETE',
      });

      if (teacherId && classId) {
        teacherService.unassignClassFromTeacher(teacherId, classId);
      }

      return true;
    } catch (err) {
      console.error(`Failed to unassign teacher assignment #${numericId}:`, err);
      throw parseTeacherError(err, `Failed to remove teacher assignment.`);
    }
  },

  /**
   * Get enrolled students for a specific teacher's assigned class
   * (GET /assign-teacher-for-class/teacher/{teacherId}/students)
   * Swagger Operation: AssignTeacherForClassController_getStudentsByTeacherId
   */
  getStudentsForTeacher: async (teacherId) => {
    try {
      const data = await apiClient(`/assign-teacher-for-class/teacher/${teacherId}/students`);
      let studentList = [];
      if (Array.isArray(data)) {
        studentList = data;
      } else if (Array.isArray(data?.students)) {
        studentList = data.students;
      } else if (Array.isArray(data?.data)) {
        studentList = data.data;
      }

      return {
        teacherId: Number(data?.teacherId || teacherId),
        teacherName: data?.teacherName || '',
        gradeLevel: data?.gradeLevel || '',
        studentsEnrolled: Number(data?.studentsEnrolled || studentList.length),
        students: studentList,
        raw: data,
      };
    } catch (err) {
      console.warn(`Failed to fetch students for teacher #${teacherId}:`, err);
      return {
        teacherId: Number(teacherId),
        teacherName: '',
        gradeLevel: '',
        studentsEnrolled: 0,
        students: [],
        error: err?.message || 'Failed to fetch student roster',
      };
    }
  },

  /**
   * Assign a teacher to a Sunday School class
   * Supports both syncing with backend if class relation is enabled,
   * and persistent multi-class state management
   */
  assignClassToTeacher: (teacherId, classInfo) => {
    if (!teacherId || !classInfo) return [];

    const allAssignments = getStoredAssignments();
    const current = allAssignments[String(teacherId)] || [];

    const classId = classInfo.id || classInfo.classId;
    const exists = current.some((c) => String(c.id || c.classId) === String(classId));

    if (!exists) {
      const updated = [
        ...current,
        {
          id: classId,
          classId,
          gradeLevel: classInfo.gradeLevel || 'Unknown Grade',
          section: classInfo.section || 'General',
          assignedAt: new Date().toISOString(),
        },
      ];
      allAssignments[String(teacherId)] = updated;
      saveStoredAssignments(allAssignments);
      return updated;
    }

    return current;
  },

  /**
   * Remove a class assignment from a teacher
   */
  unassignClassFromTeacher: (teacherId, classId) => {
    if (!teacherId || !classId) return [];

    const allAssignments = getStoredAssignments();
    const current = allAssignments[String(teacherId)] || [];
    const updated = current.filter((c) => String(c.id || c.classId) !== String(classId));

    allAssignments[String(teacherId)] = updated;
    saveStoredAssignments(allAssignments);
    return updated;
  },

  /**
   * Get assigned classes for a specific teacher ID
   */
  getTeacherAssignmentsByTeacherId: (teacherId) => {
    if (!teacherId) return [];
    const allAssignments = getStoredAssignments();
    return allAssignments[String(teacherId)] || [];
  },
};

export default teacherService;

