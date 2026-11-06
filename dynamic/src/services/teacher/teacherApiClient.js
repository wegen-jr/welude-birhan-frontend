import axios from "axios";

const BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_BASE_URL ||
  "https://welude-birhan-1.onrender.com"
).replace(/\/+$/, "");

export const teacherApiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Automatically inject JWT authentication token on every request
teacherApiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && token !== "undefined" && token !== "null" && token.trim()) {
    config.headers.Authorization = `Bearer ${token.trim()}`;
  }
  return config;
});

// Unwrap response data and sanitize API errors
teacherApiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const data = error.response?.data;
    const message =
      (Array.isArray(data?.message) ? data.message[0] : data?.message) ||
      data?.error ||
      error.message ||
      "Request failed";
    const err = new Error(message);
    err.status = error.response?.status;
    err.data = data;
    return Promise.reject(err);
  }
);

export default teacherApiClient;
