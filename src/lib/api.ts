import axios from "axios";

const rawUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const API_URL = rawUrl.replace(/\/+$/, "").endsWith("/api")
  ? rawUrl.replace(/\/+$/, "")
  : `${rawUrl.replace(/\/+$/, "")}/api`;

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("admin_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
