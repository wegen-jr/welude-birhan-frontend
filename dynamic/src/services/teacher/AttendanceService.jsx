const API_BASE_URL = (import.meta.env.VITE_BASE_URL || "").replace(
  /\/+$/,
  ""
);

async function request(endpoint, options = {}) {
  if (!API_BASE_URL) {
    throw new Error("VITE_BASE_URL is not configured.");
  }

  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...(options.body
        ? { "Content-Type": "application/json" }
        : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.error ||
        `Request failed: ${response.status}`
    );
  }

  return data;
}

const AttendanceService = {
  getAll() {
    return request("/student-attendance");
  },

  create(payload) {
    return request("/student-attendance", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};

export default AttendanceService;