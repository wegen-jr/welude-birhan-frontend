import teacherApiClient from "./teacherApiClient";

const AttendanceService = {
  // Retrieve all attendance records
  async getAll() {
    return teacherApiClient.get("/student-attendance");
  },

  // Record new attendance entry
  async create(payload) {
    return teacherApiClient.post("/student-attendance", payload);
  },

  // Filter attendance records
  async filter(payload) {
    return teacherApiClient.post("/student-attendance/filter", payload);
  },
};

export default AttendanceService;