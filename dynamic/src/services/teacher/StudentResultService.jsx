
const API_BASE_URL = (import.meta.env.VITE_BASE_URL || "").replace(/\/+$/, "");

async function request(endpoint, options = {}) {
  if (!API_BASE_URL) {
    throw new Error("VITE_BASE_URL is not configured.");
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

  const text = await response.text();
  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null
        ? data.message || data.error
        : data;

    throw new Error(
      message || `Request failed with status ${response.status}`
    );
  }

  return data;
}

const StudentResultService = {
  getAll() {
    return request("/student-results");
  },

  getByStudent(studentId) {
    return request(
      `/student-results/student/${encodeURIComponent(studentId)}`
    );
  },

  getById(id) {
    return request(`/student-results/${encodeURIComponent(id)}`);
  },

  create(payload) {
    return request("/student-results", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  update(id, payload) {
    return request(`/student-results/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  remove(id) {
    return request(`/student-results/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  },
};

export default StudentResultService;
