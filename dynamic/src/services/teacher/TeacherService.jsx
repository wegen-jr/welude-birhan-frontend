import teacherApiClient from "./teacherApiClient";

const TeacherService = {
  // Retrieve students assigned to a specific teacher using tid
  async getTeacherStudents(tid) {
    if (!tid) {
      throw new Error("Teacher ID (tid) is required.");
    }
    return teacherApiClient.get(
      `/assign-teacher-for-class/teacher/${encodeURIComponent(String(tid))}/students`
    );
  },

  // Retrieve teacher-to-class assignments
  async getTeacherAssignments() {
    return teacherApiClient.get("/assign-teacher-for-class");
  },

  // Retrieve course-to-class assignments
  async getCourseAssignments() {
    return teacherApiClient.get("/assign-course-for-class");
  },

  // Retrieve teacher details by ID
  async getTeacherById(id) {
    if (!id) return null;
    return teacherApiClient.get(`/teachers/${encodeURIComponent(String(id))}`);
  },

  // Retrieve announcements
  async getAnnouncements() {
    return teacherApiClient.get("/announcements");
  },

  // Create a teacher-to-class assignment
  async assignTeacherForClass(payload) {
    return teacherApiClient.post("/assign-teacher-for-class", {
      teacherId: String(payload.teacherId),
      teacherName: payload.teacherName,
      courseId: payload.courseId,
      courseName: payload.courseName,
      gradeLevel: payload.gradeLevel,
    });
  },

  // Create a course-to-class assignment
  async assignCourseForClass(payload) {
    return teacherApiClient.post("/assign-course-for-class", {
      courseId: payload.courseId,
      courseName: payload.courseName,
      classLevel: payload.classLevel,
    });
  },
};

export default TeacherService;