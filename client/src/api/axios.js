import axios from "axios";
import { getToken } from "../auth/auth";

const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

const API = axios.create({
  baseURL: apiBaseUrl,
});

API.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
