import { apiClient } from '../api';

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
   * Fetch all teachers with assigned classes joined (GET /teachers, GET /class, GET /assign-teacher-for-class)
   * Swagger Operation: TeacherController_findAll
   */
  getTeachers: async () => {
    try {
      const [teachersRes, classesRes, assignmentsRes] = await Promise.all([
        apiClient('/teachers').catch((err) => {
          console.error('Failed to fetch teachers:', err);
          return [];
        }),
        apiClient('/class').catch(async () => {
          return await apiClient('/classes').catch(() => []);
        }),
        apiClient('/assign-teacher-for-class').catch(() => []),
      ]);

      let teacherRawList = [];
      if (Array.isArray(teachersRes)) {
        teacherRawList = teachersRes;
      } else if (Array.isArray(teachersRes?.data)) {
        teacherRawList = teachersRes.data;
      } else if (Array.isArray(teachersRes?.teachers)) {
        teacherRawList = teachersRes.teachers;
      } else if (Array.isArray(teachersRes?.items)) {
        teacherRawList = teachersRes.items;
      }

      let classesList = [];
      if (Array.isArray(classesRes)) {
        classesList = classesRes;
      } else if (Array.isArray(classesRes?.data)) {
        classesList = classesRes.data;
      } else if (Array.isArray(classesRes?.classes)) {
        classesList = classesRes.classes;
      } else if (Array.isArray(classesRes?.items)) {
        classesList = classesRes.items;
      }

      let assignmentsList = [];
      if (Array.isArray(assignmentsRes)) {
        assignmentsList = assignmentsRes;
      } else if (Array.isArray(assignmentsRes?.data)) {
        assignmentsList = assignmentsRes.data;
      } else if (Array.isArray(assignmentsRes?.assignments)) {
        assignmentsList = assignmentsRes.assignments;
      } else if (Array.isArray(assignmentsRes?.items)) {
        assignmentsList = assignmentsRes.items;
      }

      // Base normalization
      const teachers = teacherRawList.map(formatTeacherRecord).filter(Boolean);

      // Attach assigned classes using both classes and assignments
      return teachers.map((teacher) => {
        const teacherId = String(teacher.id);

        // 1. Direct class teacher_id match
        const directClasses = classesList.filter((cls) => {
          const cTeacherId = String(cls.teacher_id ?? cls.teacherId ?? cls.instructorId ?? '');
          if (cTeacherId && cTeacherId === teacherId) return true;
          if (Array.isArray(cls.teachers) && cls.teachers.some((t) => String(t?.id || t) === teacherId)) return true;
          if (Array.isArray(cls.teacherIds) && cls.teacherIds.map(String).includes(teacherId)) return true;
          return false;
        }).map((cls) => ({
          id: cls.id,
          classId: cls.id,
          class_id: cls.id,
          gradeLevel: cls.gradeLevel || cls.classLevel || 'Class',
          section: cls.section || 'A',
          courseName: cls.courseName || cls.course || '',
          source: 'class_teacher_id',
        }));

        // 2. Matches from GET /assign-teacher-for-class (assignments used in Overview dashboard)
        const matchedAssignments = assignmentsList.filter((ba) => {
          const baTeacherId = String(ba.teacherId ?? ba.teacher_id ?? '');
          return baTeacherId && baTeacherId === teacherId;
        });

        const assignedViaBackend = matchedAssignments.map((ba) => {
          const baGrade = String(ba.gradeLevel || ba.grade_level || '').trim().toLowerCase();
          const matchingClass = classesList.find((c) => {
            const cGrade = String(c.gradeLevel || c.classLevel || '').trim().toLowerCase();
            return cGrade === baGrade || cGrade.includes(baGrade) || baGrade.includes(cGrade);
          });

          const classId = matchingClass?.id || ba.classId || ba.id || `${ba.gradeLevel}-${ba.section || 'A'}`;
          return {
            id: classId,
            classId: classId,
            class_id: classId,
            gradeLevel: matchingClass?.gradeLevel || ba.gradeLevel,
            section: matchingClass?.section || ba.section || 'A',
            courseName: ba.courseName || ba.course_name || '',
            courseId: ba.courseId || ba.course_id || null,
            assignmentId: ba.id,
            source: 'assign_teacher_for_class',
          };
        });

        // 3. Existing assignedClasses (e.g. from local storage)
        const existingAssigned = Array.isArray(teacher.assignedClasses) ? teacher.assignedClasses : [];

        // Combine and deduplicate
        const combined = [...directClasses, ...assignedViaBackend, ...existingAssigned];
        const seen = new Set();
        const uniqueAssigned = [];

        combined.forEach((item) => {
          if (!item) return;
          const classKey = `${String(item.id || item.classId || '').toLowerCase()}::${String(item.gradeLevel || '').toLowerCase()}::${String(item.section || '').toLowerCase()}`;
          if (!seen.has(classKey)) {
            seen.add(classKey);
            uniqueAssigned.push({
              ...item,
              id: item.id || item.classId || item.class_id,
              classId: item.classId || item.id || item.class_id,
              class_id: item.class_id || item.classId || item.id,
            });
          }
        });

        return {
          ...teacher,
          assignedClasses: uniqueAssigned,
        };
      });
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
    const numericId = parseInt(id, 10);
    if (!numericId || isNaN(numericId)) {
      throw new Error('Valid numeric Teacher ID is required.');
    }
    try {
      const [teacherRes, assignedClasses] = await Promise.all([
        apiClient(`/teachers/${numericId}`),
        teacherService.getAssignedClassesForTeacher(numericId).catch(() => []),
      ]);
      const base = formatTeacherRecord(teacherRes?.data || teacherRes);
      if (!base) return null;
      return {
        ...base,
        assignedClasses: assignedClasses.length > 0 ? assignedClasses : base.assignedClasses,
      };
    } catch (err) {
      console.error(`Failed to fetch teacher #${numericId}:`, err);
      throw parseTeacherError(err, `Failed to fetch teacher #${numericId}.`);
    }
  },

  /**
   * Create a new teacher (POST /teachers)
   * Swagger Operation: TeacherController_create
   * DTO: CreateTeacherDto { phone, email, password, role, department, name }
   */
  createTeacher: async (teacherData) => {
    // Sanitize phone number (strip whitespace, ensure string)
    const rawPhone = String(teacherData.phone || '').trim().replace(/\s+/g, '');

    // Ensure role strictly adheres to the instructor role defined by backend ("Teacher" / "TEACHER"), never "USER"
    const rawRole = String(teacherData.role || '').trim();
    const assignedRole = (!rawRole || rawRole.toUpperCase() === 'USER')
      ? 'Teacher'
      : rawRole;

    const payload = {
      name: String(teacherData.name || '').trim(),
      email: String(teacherData.email || '').trim().toLowerCase(),
      phone: rawPhone,
      password: String(teacherData.password || 'Teacher@2026').trim(),
      role: assignedRole,
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
    if (!payload.password || payload.password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
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
   * DTO: UpdateTeacherDto { phone, email, password, role, department, name }
   */
  updateTeacher: async (id, teacherData) => {
    const numericId = parseInt(id, 10);
    if (!numericId || isNaN(numericId)) {
      throw new Error('Valid numeric Teacher ID is required.');
    }
    const payload = {};
    if (teacherData.name !== undefined) payload.name = String(teacherData.name).trim();
    if (teacherData.email !== undefined) payload.email = String(teacherData.email).trim().toLowerCase();
    if (teacherData.phone !== undefined) payload.phone = String(teacherData.phone).trim();
    if (teacherData.department !== undefined) payload.department = String(teacherData.department).trim();
    if (teacherData.role !== undefined) {
      const rawRole = String(teacherData.role).trim();
      payload.role = (!rawRole || rawRole.toUpperCase() === 'USER') ? 'Teacher' : rawRole;
    }
    if (teacherData.password !== undefined && teacherData.password) payload.password = String(teacherData.password).trim();

    try {
      const result = await apiClient(`/teachers/${numericId}`, {
        method: 'PATCH',
        body: payload,
      });

      return formatTeacherRecord(result?.data || result);
    } catch (err) {
      console.error(`Failed to update teacher #${numericId}:`, err);
      throw parseTeacherError(err, `Failed to update teacher #${numericId}.`);
    }
  },

  /**
   * Delete a teacher by numeric ID (DELETE /teachers/{id})
   * Swagger Operation: TeacherController_remove
   */
  deleteTeacher: async (id) => {
    const numericId = parseInt(id, 10);
    if (!numericId || isNaN(numericId)) {
      throw new Error('Valid numeric Teacher ID is required.');
    }
    try {
      await apiClient(`/teachers/${numericId}`, {
        method: 'DELETE',
      });

      // Clean up assigned classes mapping
      const allAssignments = getStoredAssignments();
      delete allAssignments[String(numericId)];
      saveStoredAssignments(allAssignments);

      return true;
    } catch (err) {
      console.error(`Failed to delete teacher #${numericId}:`, err);
      throw parseTeacherError(err, `Failed to delete teacher #${numericId}.`);
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
    const tId = parseInt(teacherId, 10);
    const tName = String(teacherName || '').trim();
    const cId = parseInt(courseId, 10);
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
    const numericId = parseInt(assignmentId, 10);
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
    const numericId = parseInt(teacherId, 10);
    if (!numericId || isNaN(numericId)) {
      throw new Error('Valid numeric Teacher ID is required.');
    }
    try {
      const data = await apiClient(`/assign-teacher-for-class/teacher/${numericId}/students`);
      let studentList = [];
      let detectedGrade = data?.gradeLevel || '';
      let detectedTeacherName = data?.teacherName || '';

      if (Array.isArray(data)) {
        // If data is an array of course/grade groups with a nested students array
        const hasNestedStudents = data.some((item) => Array.isArray(item?.students));
        if (hasNestedStudents) {
          studentList = data.flatMap((group) => {
            const groupGrade = group.gradeLevel || group.classLevel || '';
            const groupCourse = group.courseName || group.course || '';
            const groupSection = group.section || '';
            if (groupGrade && !detectedGrade.includes(groupGrade)) {
              detectedGrade = detectedGrade ? `${detectedGrade}, ${groupGrade}` : groupGrade;
            }
            if (group.teacherName && !detectedTeacherName) {
              detectedTeacherName = group.teacherName;
            }
            return (group.students || []).map((s) => ({
              ...s,
              gradeLevel: s.gradeLevel || groupGrade,
              courseName: s.courseName || groupCourse,
              section: s.section || groupSection,
            }));
          });
        } else {
          studentList = data.filter((item) => Boolean(item?.studentId || item?.fullname || item?.studentName));
        }
      } else if (Array.isArray(data?.students)) {
        studentList = data.students.filter((item) => Boolean(item?.studentId || item?.fullname || item?.studentName));
      } else if (Array.isArray(data?.data)) {
        if (data.data.some((item) => Array.isArray(item?.students))) {
          studentList = data.data.flatMap((g) => g.students || []).filter((item) => Boolean(item?.studentId || item?.fullname || item?.studentName));
        } else {
          studentList = data.data.filter((item) => Boolean(item?.studentId || item?.fullname || item?.studentName));
        }
      } else if (data && typeof data === 'object') {
        const values = Object.values(data);
        const arrayValues = values.filter(Array.isArray);
        if (arrayValues.length > 0) {
          studentList = arrayValues.flat().filter((item) => Boolean(item?.studentId || item?.fullname || item?.studentName));
        }
      }

      const validStudents = studentList.filter((s) => Boolean(s && (s.studentId || s.fullname || s.studentName)));

      return {
        teacherId: Number(data?.teacherId || teacherId),
        teacherName: detectedTeacherName || data?.teacherName || '',
        gradeLevel: detectedGrade || data?.gradeLevel || '',
        studentsEnrolled: Number(data?.studentsEnrolled || validStudents.length),
        students: validStudents,
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

  /**
   * Retrieves all assigned classes for a teacher by aggregating backend assignments (GET /assign-teacher-for-class)
   * and local storage state.
   */
  getAssignedClassesForTeacher: async (teacherId) => {
    const tId = Number(teacherId);
    if (!tId) return [];
    const localAssigned = teacherService.getTeacherAssignmentsByTeacherId(tId);

    try {
      const backendAssignments = await teacherService.getTeacherAssignments();
      const matched = backendAssignments.filter((a) => Number(a.teacherId) === tId).map((a) => ({
        id: a.id,
        assignmentId: a.id,
        courseId: a.courseId,
        courseName: a.courseName,
        gradeLevel: a.gradeLevel,
        section: a.section || 'General',
      }));

      const combined = [...matched];
      localAssigned.forEach((loc) => {
        const exists = combined.some(
          (c) =>
            String(c.gradeLevel || '').trim().toLowerCase() === String(loc.gradeLevel || '').trim().toLowerCase() &&
            String(c.section || '').trim().toLowerCase() === String(loc.section || '').trim().toLowerCase()
        );
        if (!exists) combined.push(loc);
      });

      return combined;
    } catch (e) {
      console.warn(`Failed to fetch backend teacher assignments for #${tId}:`, e);
      return localAssigned;
    }
  },
};

export default teacherService;

