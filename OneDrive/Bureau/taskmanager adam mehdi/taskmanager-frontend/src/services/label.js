import authService from "./auth";
// Service pour gérer les labels côté frontend
const API_LABELS = "http://localhost:8080/api/labels";

function fetchWithAuth(url, options = {}) {
  const token = authService.getToken();
  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
  });
}

const labelService = {
  getAll: async () => {
    const res = await fetchWithAuth(`${API_LABELS}?page=0&size=100`);
    if (!res.ok) throw new Error("Erreur chargement labels");
    const data = await res.json();
    return data.content || data;
  },
  addToTask: async (taskId, labelId) => {
    const res = await fetchWithAuth(`${API_LABELS}/task/${taskId}/label/${labelId}`, { method: "POST" });
    if (!res.ok) throw new Error("Erreur ajout label à la tâche");
  },
  removeFromTask: async (taskId, labelId) => {
    const res = await fetchWithAuth(`${API_LABELS}/task/${taskId}/label/${labelId}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Erreur suppression label de la tâche");
  },
  getByTask: async (taskId) => {
    const res = await fetchWithAuth(`${API_LABELS}/task/${taskId}`);
    if (!res.ok) throw new Error("Erreur chargement labels de la tâche");
    return await res.json();
  }
};

export default labelService;
