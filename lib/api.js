import axios from "axios";

// All requests are same-origin (proxied by next.config.js rewrites in dev,
// served from the API domain in prod). withCredentials keeps the admin
// session cookie attached.
const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  timeout: 30_000,
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Centralized 401 handling: bounce back to login. Skip for the login
    // call itself so wrong-password just shows an inline error.
    const url = err?.config?.url || "";
    if (err?.response?.status === 401 && !url.includes("/admin/login")) {
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export default api;

export const fetcher = (url) => api.get(url).then((r) => r.data);
