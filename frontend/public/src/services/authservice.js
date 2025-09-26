// src/services/authService.js
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
export const axiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 120000,
  headers: { "Content-Type": "application/json" },
});

const TOKEN_KEY = "xshare_token";

/** Helpers */
const setAuthHeader = (token) => {
  if (token) {
    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axiosInstance.defaults.headers.common["Authorization"];
  }
};

export const saveToken = (token) => {
  if (!token) return;
  localStorage.setItem(TOKEN_KEY, token);
  setAuthHeader(token);
};

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  setAuthHeader(null);
};

/** Parse JWT payload (safe, no deps) */
export const parseJwt = (token) => {
  if (!token) return null;
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

/** Init: if token exists, set header */
const init = () => {
  const t = getToken();
  if (t) setAuthHeader(t);
};
init();

/** Broadcast logout for app to react (optional) */
const broadcastLogout = () => {
  try {
    window.dispatchEvent(new CustomEvent("xshare:logout"));
  } catch (err) {
    // ignore
  }
};

/** Axios response interceptor: handle 401 globally */
axiosInstance.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      // token expired or unauthorized: remove and notify app
      removeToken();
      broadcastLogout();
    }
    return Promise.reject(err);
  }
);

/** API: register */
export const register = async ({ name, email, password }) => {
  const res = await axiosInstance.post("/auth/register", { name, email, password });
  if (res?.data?.token) saveToken(res.data.token);
  return res.data;
};

/** API: login */
export const login = async ({ email, password }) => {
  const res = await axiosInstance.post("/auth/login", { email, password });
  if (res?.data?.token) saveToken(res.data.token);
  return res.data;
};

/** Logout */
export const logout = () => {
  removeToken();
  broadcastLogout();
};

/** Get current user info from JWT payload (if present) */
export const getCurrentUser = () => {
  const token = getToken();
  if (!token) return null;
  return parseJwt(token);
};

/** Is authenticated */
export const isAuthenticated = () => {
  return Boolean(getToken());
};

const authService = {
  axiosInstance,
  register,
  login,
  logout,
  getToken,
  saveToken,
  removeToken,
  getCurrentUser,
  isAuthenticated,
};

export default authService;
