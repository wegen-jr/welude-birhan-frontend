import teacherApiClient from "./teacherApiClient";

const StudentResultService = {
  // Retrieve all results
  async getAll() {
    return teacherApiClient.get("/student-results");
  },

  // Retrieve results for a specific student ID
  async getByStudent(studentId) {
    return teacherApiClient.get(
      `/student-results/student/${encodeURIComponent(studentId)}`
    );
  },

  // Retrieve single result by record ID
  async getById(id) {
    return teacherApiClient.get(`/student-results/${encodeURIComponent(id)}`);
  },

  // Record a student assessment score
  async create(payload) {
    return teacherApiClient.post("/student-results", payload);
  },

  // Update an existing student assessment score
  async update(id, payload) {
    return teacherApiClient.patch(
      `/student-results/${encodeURIComponent(id)}`,
      payload
    );
  },

  // Remove a result record
  async remove(id) {
    return teacherApiClient.delete(`/student-results/${encodeURIComponent(id)}`);
  },
};

export default StudentResultService;
