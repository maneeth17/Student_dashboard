import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

const API = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// AUTH
export const warmupBackend = () => API.get("/health");
export const loginUser = (data) => API.post("/auth/login", data);
export const registerUser = (data) => API.post("/auth/register", data);

// STUDENTS
export const addStudent = (data) => API.post("/api/students", data);
export const getStudents = () => API.get("/api/students");

export const updateStudent = (id, data) =>
  API.put(`/api/students/${id}`, data);

export const deleteStudent = (id) =>
  API.delete(`/api/students/${id}`);

export const importStudentsCsv = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return API.post("/api/students/import", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
};

// ATTENDANCE
export const createAttendance = (data) => API.post("/api/attendance", data);
export const updateAttendanceRecord = (id, data) => API.put(`/api/attendance/${id}`, data);
export const deleteAttendanceRecord = (id) => API.delete(`/api/attendance/${id}`);
export const getAttendanceSummary = (studentId) => API.get(`/api/attendance/student/${studentId}/summary`);
export const getAttendanceForMonth = (studentId, year, month) =>
  API.get(`/api/attendance/student/${studentId}/month`, { params: { year, month } });
export const getAttendanceForDate = (attendanceDate) => API.get(`/api/attendance/date/${attendanceDate}`);
export const saveAttendanceForDate = (data) => API.post("/api/attendance/date", data);

export default API;
