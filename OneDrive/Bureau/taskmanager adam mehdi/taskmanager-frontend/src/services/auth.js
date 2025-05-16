const API_BASE = "http://localhost:8080/api/auth";

const login = async (email, password) => {
  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error("Login failed");
  const data = await res.json();
  // Store correct fields from backend response
  localStorage.setItem("token", data.jwt);
  localStorage.setItem("role", data.userRole); // "ADMIN" or "EMPLOYEE"
  localStorage.setItem("userId", data.userId);
  return data;
};

const signup = async ({ email, password, name }) => {
  const res = await fetch(`${API_BASE}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Signup failed");
  }
  return await res.json();
};

// Returns 'ADMIN' or 'EMPLOYEE' as set by backend
const getRole = () => localStorage.getItem("role");
const getToken = () => localStorage.getItem("token");
const getUserId = () => localStorage.getItem("userId");
const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("userId");
};

const authService = { login, signup, getRole, getToken, getUserId, logout };
export default authService;
