const API_BASE_URL = (import.meta.env.VITE_BASE_URL || "").replace(/\/+$/, "");

async function request(endpoint, options = {}) {
  if (!API_BASE_URL) {
    throw new Error(
      "VITE_BASE_URL is not configured. Check your .env file and restart Vite."
    );
  }

  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.error ||
        `Request failed: ${response.status} ${response.statusText}`
    );
  }

  return data;
}

const TeacherService = {
  // Retrieve students assigned to a specific teacher using tid.
  getTeacherStudents(tid) {
    
    if (!tid) {
      throw new Error("Teacher ID (tid) is required.");
    }

    return request(
      `/assign-teacher-for-class/teacher/${encodeURIComponent(String(tid))}/students`
    );
  },

  // Retrieve teacher-to-class assignments.
  getTeacherAssignments() {
    return request("/assign-teacher-for-class");
  },

  // Retrieve course-to-class assignments.
  getCourseAssignments() {
    return request("/assign-course-for-class");
  },

  // Create a teacher-to-class assignment.
  assignTeacherForClass(payload) {
    return request("/assign-teacher-for-class", {
      method: "POST",
      body: JSON.stringify({
        teacherId: String(payload.teacherId),
        teacherName: payload.teacherName,
        courseId: payload.courseId,
        courseName: payload.courseName,
        gradeLevel: payload.gradeLevel,
      }),
    });
  },

  // Create a course-to-class assignment.
  assignCourseForClass(payload) {
    return request("/assign-course-for-class", {
      method: "POST",
      body: JSON.stringify({
        courseId: payload.courseId,
        courseName: payload.courseName,
        classLevel: payload.classLevel,
      }),
    });
  },
};

export default TeacherService;