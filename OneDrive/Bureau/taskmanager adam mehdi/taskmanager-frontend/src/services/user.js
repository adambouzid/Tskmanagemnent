import authService from "./auth";
const API_USERS = "http://localhost:8080/api/admin/users";

const fetchWithAuth = (url, options = {}) => {
  const token = authService.getToken();
  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
  });
};

const userService = {
  getAll: async () => {
    const res = await fetchWithAuth(`${API_USERS}?page=0&size=1000`);
    if (!res.ok) throw new Error("Erreur chargement utilisateurs");
    const data = await res.json();
    return data.content || data;
  },
  getById: async (id) => {
    const res = await fetchWithAuth(`${API_USERS}/${id}`);
    if (!res.ok) throw new Error("Erreur chargement utilisateur");
    return await res.json();
  }
};

export default userService;
