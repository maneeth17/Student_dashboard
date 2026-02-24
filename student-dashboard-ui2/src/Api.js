import axios from "axios";

const BASE_URL = "http://localhost:8080";

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
export const loginUser = (data) => API.post("/auth/login", data);
export const registerUser = (data) => API.post("/auth/register", data);

// STUDENTS
export const addStudent = (data) => API.post("/api/students", data);
export const getStudents = () => API.get("/api/students");

export const updateStudent = (id, data) =>
  API.put(`/api/students/${id}`, data);

export const deleteStudent = (id) =>
  API.delete(`/api/students/${id}`);

export default API;
