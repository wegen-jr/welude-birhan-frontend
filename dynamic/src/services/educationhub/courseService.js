import { apiClient } from '../api';

/**
 * Normalizes course object from backend response
 * Handles spelling variations (craditHours / creditHours, cratedAt / createdAt)
 */
function formatCourseRecord(course) {
  if (!course) return null;
  const id = Number(course.id) || course.id;
  const creditHours = Number(course.craditHours ?? course.creditHours ?? 0);

  return {
    id,
    courseName: course.courseName || '',
    name: course.courseName || '', // alias for convenience
    creditHours,
    craditHours: creditHours, // preserve Swagger property
    createdAt: course.createdAt || course.cratedAt || null,
    updatedAt: course.updatedAt || null,
    raw: course,
  };
}

function parseCourseError(err, fallbackMessage) {
  if (err?.status === 409) {
    return new Error('A course with this name already exists.');
  }
  if (err?.status === 400) {
    const detail = err.data?.message || err.message;
    return new Error(`Validation error: ${Array.isArray(detail) ? detail.join(', ') : detail}`);
  }
  if (err?.status === 401) {
    return new Error('Your session has expired. Please sign in again.');
  }
  if (err?.status === 403) {
    return new Error('Access denied. Only Education Hub leaders and administrators can manage courses.');
  }
  if (err?.status === 404) {
    return new Error('Course not found.');
  }
  if (err?.status === 500) {
    return new Error('Temporary server error (Render cold-start / database sync). Please try again in a moment.');
  }
  return new Error(err?.message || fallbackMessage);
}

export const courseService = {
  /**
   * Fetch all courses (GET /cources)
   * Swagger Operation: CourcesController_findAll
   */
  getCourses: async () => {
    try {
      const data = await apiClient('/cources');
      let list = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (Array.isArray(data?.data)) {
        list = data.data;
      } else if (Array.isArray(data?.courses)) {
        list = data.courses;
      } else if (Array.isArray(data?.cources)) {
        list = data.cources;
      } else if (Array.isArray(data?.items)) {
        list = data.items;
      }
      return list.map(formatCourseRecord).filter(Boolean);
    } catch (err) {
      console.warn('GET /cources failed, trying /courses fallback:', err);
      try {
        const fallback = await apiClient('/courses');
        let list = [];
        if (Array.isArray(fallback)) list = fallback;
        else if (Array.isArray(fallback?.data)) list = fallback.data;
        else if (Array.isArray(fallback?.courses)) list = fallback.courses;
        else if (Array.isArray(fallback?.items)) list = fallback.items;
        return list.map(formatCourseRecord).filter(Boolean);
      } catch (fallbackErr) {
        console.error('Failed to fetch courses:', fallbackErr);
        throw parseCourseError(err, 'Failed to fetch courses. Please try again.');
      }
    }
  },

  /**
   * Fetch a single course by numeric ID (GET /cources/{id})
   * Swagger Operation: CourcesController_findOne
   */
  /**
   * Fetch a single course by numeric ID (GET /cources/{id})
   * Swagger Operation: CourcesController_findOne
   */
  getCourseById: async (id) => {
    const numericId = parseInt(id, 10);
    if (!numericId || isNaN(numericId)) {
      throw new Error('Valid numeric Course ID is required.');
    }
    try {
      const data = await apiClient(`/cources/${numericId}`);
      return formatCourseRecord(data?.data || data);
    } catch (err) {
      console.error(`Failed to fetch course #${numericId}:`, err);
      throw parseCourseError(err, `Failed to fetch course #${numericId}.`);
    }
  },

  /**
   * Create a new course (POST /cources)
   * Swagger Operation: CourcesController_create
   * DTO: CreateCourceDto { courseName, craditHours }
   */
  createCourse: async (courseData) => {
    const courseName = String(courseData.courseName || courseData.name || '').trim();
    const craditHours = parseInt(courseData.craditHours ?? courseData.creditHours ?? 1, 10);

    if (!courseName) {
      throw new Error('Course name is required.');
    }
    if (isNaN(craditHours) || craditHours < 1) {
      throw new Error('Credit hours must be at least 1.');
    }

    const payload = {
      courseName,
      craditHours,
    };

    try {
      const result = await apiClient('/cources', {
        method: 'POST',
        body: payload,
      });

      return formatCourseRecord(result?.data || result);
    } catch (err) {
      console.warn('Initial POST /cources request encountered error:', err);

      // Graceful retry on transient Render cold-start / 500 error
      if (err?.status === 500 || !err?.status) {
        try {
          // Check if record was already committed
          const list = await courseService.getCourses();
          const existing = list.find((c) => c.courseName.toLowerCase() === payload.courseName.toLowerCase());
          if (existing) {
            console.log('Course verified in database despite transient 500:', existing);
            return existing;
          }
        } catch (lookupErr) {
          console.warn('Directory verification lookup failed:', lookupErr);
        }

        // Retry once after 1.5s delay
        try {
          await new Promise((r) => setTimeout(r, 1500));
          const retryResult = await apiClient('/cources', {
            method: 'POST',
            body: payload,
          });
          return formatCourseRecord(retryResult?.data || retryResult);
        } catch (retryErr) {
          console.error('Retry course creation failed:', retryErr);
          throw parseCourseError(retryErr, 'Failed to create course. Please try again.');
        }
      }

      throw parseCourseError(err, 'Failed to create course.');
    }
  },

  /**
   * Update an existing course (PATCH /cources/{id})
   * Swagger Operation: CourcesController_update
   * DTO: UpdateCourceDto { courseName, craditHours }
   */
  updateCourse: async (id, courseData) => {
    const numericId = parseInt(id, 10);
    if (!numericId || isNaN(numericId)) {
      throw new Error('Valid numeric Course ID is required.');
    }
    const payload = {};
    if (courseData.courseName !== undefined || courseData.name !== undefined) {
      payload.courseName = String(courseData.courseName || courseData.name).trim();
    }
    if (courseData.craditHours !== undefined || courseData.creditHours !== undefined) {
      const ch = parseInt(courseData.craditHours ?? courseData.creditHours, 10);
      if (!isNaN(ch) && ch >= 1) payload.craditHours = ch;
    }

    try {
      const result = await apiClient(`/cources/${numericId}`, {
        method: 'PATCH',
        body: payload,
      });

      return formatCourseRecord(result?.data || result);
    } catch (err) {
      console.error(`Failed to update course #${numericId}:`, err);
      throw parseCourseError(err, `Failed to update course #${numericId}.`);
    }
  },

  /**
   * Delete a course by numeric ID (DELETE /cources/{id})
   * Swagger Operation: CourcesController_remove
   */
  deleteCourse: async (id) => {
    const numericId = parseInt(id, 10);
    if (!numericId || isNaN(numericId)) {
      throw new Error('Valid numeric Course ID is required.');
    }
    try {
      await apiClient(`/cources/${numericId}`, {
        method: 'DELETE',
      });
      return true;
    } catch (err) {
      console.error(`Failed to delete course #${numericId}:`, err);
      throw parseCourseError(err, `Failed to delete course #${numericId}.`);
    }
  },

  /**
   * Fetch all course assignments (GET /assign-course-for-class)
   * Swagger Operation: AssignCourseForClassController_findAll
   */
  getClassCourseAssignments: async () => {
    try {
      const data = await apiClient('/assign-course-for-class');
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
        const courseId = Number(item.courseId ?? item.course_id ?? 0);
        return {
          id,
          courseId,
          courseName: item.courseName || item.course_name || '',
          classLevel: item.classLevel || item.class_level || item.gradeLevel || '',
          createdAt: item.createdAt || null,
          updatedAt: item.updatedAt || null,
          raw: item,
        };
      }).filter(Boolean);
    } catch (err) {
      console.error('Failed to fetch class course assignments:', err);
      throw parseCourseError(err, 'Failed to fetch class course assignments.');
    }
  },

  /**
   * Fetch courses assigned to a specific class level (e.g. "Grade 10")
   */
  getCoursesByClassLevel: async (classLevel) => {
    const assignments = await courseService.getClassCourseAssignments();
    if (!classLevel) return assignments;
    const target = String(classLevel).trim().toLowerCase();
    return assignments.filter((a) => {
      const lvl = String(a.classLevel).trim().toLowerCase();
      return lvl === target || lvl.includes(target) || target.includes(lvl);
    });
  },

  /**
   * Assign a course to a class (POST /assign-course-for-class)
   * Swagger Operation: AssignCourseForClassController_create
   * DTO: CreateAssignCourseForClassDto { courseId, courseName, classLevel }
   */
  assignCourseToClass: async ({ courseId, courseName, classLevel }) => {
    const cId = parseInt(courseId, 10);
    const cName = String(courseName || '').trim();
    const cLevel = String(classLevel || '').trim();

    if (!cId || isNaN(cId)) {
      throw new Error('Valid Course ID is required.');
    }
    if (!cName) {
      throw new Error('Course name is required.');
    }
    if (!cLevel) {
      throw new Error('Class level is required.');
    }

    // Strictly match CreateAssignCourseForClassDto schema
    const payload = {
      courseId: cId,
      courseName: cName,
      classLevel: cLevel,
    };

    try {
      const result = await apiClient('/assign-course-for-class', {
        method: 'POST',
        body: payload,
      });

      const resData = result?.data || result;
      return {
        id: parseInt(resData?.id || 0, 10) || resData?.id,
        courseId: parseInt(resData?.courseId || cId, 10),
        courseName: resData?.courseName || cName,
        classLevel: resData?.classLevel || cLevel,
        createdAt: resData?.createdAt || new Date().toISOString(),
        raw: resData,
      };
    } catch (err) {
      console.error('Failed to assign course to class:', err);
      throw parseCourseError(err, 'Failed to assign course to class.');
    }
  },

  /**
   * Unassign / remove a course from a class (DELETE /assign-course-for-class/{id})
   * Swagger Operation: AssignCourseForClassController_remove
   */
  unassignCourseFromClass: async (id) => {
    const numericId = parseInt(id, 10);
    if (!numericId || isNaN(numericId)) {
      throw new Error('Valid numeric assignment ID is required.');
    }

    try {
      await apiClient(`/assign-course-for-class/${numericId}`, {
        method: 'DELETE',
      });
      return true;
    } catch (err) {
      console.error(`Failed to unassign course assignment #${numericId}:`, err);
      throw parseCourseError(err, `Failed to remove course assignment #${numericId}.`);
    }
  },
};

export default courseService;

