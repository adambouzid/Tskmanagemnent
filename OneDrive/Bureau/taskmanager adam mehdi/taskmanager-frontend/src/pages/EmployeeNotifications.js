import React, { useEffect, useState } from "react";
import { Typography, Box, Paper, CircularProgress, Alert, Pagination } from "@mui/material";
import EmployeeNavbar from "../components/EmployeeNavbar";
import authService from "../services/auth";

const API_BASE = "http://localhost:8080/api/notifications";

export default function EmployeeNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const userId = authService.getUserId();
  const token = authService.getToken();

  const fetchNotifications = async (pageNum = 1) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/user/${userId}?page=${pageNum-1}&size=10`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Erreur lors du chargement des notifications");
      const data = await res.json();
      setNotifications(data.content || []);
      setTotalPages(data.totalPages || 1);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  useEffect(() => { fetchNotifications(page); /*eslint-disable-next-line*/ }, [page]);

  return (
    <EmployeeNavbar>
      <Typography variant="h4" gutterBottom>Notifications</Typography>
      <Box sx={{ mt: 2 }}>
        {loading ? <CircularProgress /> : error ? (
          <Alert severity="error">{error}</Alert>
        ) : notifications.length === 0 ? (
          <Typography>Aucune notification.</Typography>
        ) : (
          <>
            {notifications.map(n => {
              // Déduire le type de notification depuis le message (simple heuristique)
              let notifType = "";
              if (n.message?.includes("admin a commenté")) notifType = "Commentaire admin";
              else if (n.message?.includes("Réponse à votre commentaire")) notifType = "Réponse à votre commentaire";
              else if (n.message?.includes("modifiée") || n.message?.includes("Modification")) notifType = "Modification tâche";
              else if (n.message?.includes("assignée")) notifType = "Nouvelle tâche assignée";
              else if (n.message?.includes("label")) notifType = "Label";
              else if (n.message?.includes("supprimée")) notifType = "Tâche supprimée";
              else notifType = "Notification";
              return (
                <Paper key={n.id} sx={{ p: 2, mb: 2, bgcolor: n.read === false ? '#e3f2fd' : undefined }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle2">{notifType}</Typography>
                    {n.read === false && <Typography color="primary" sx={{ fontWeight: 700, ml: 2 }}>Non lu</Typography>}
                  </Box>
                  <Typography sx={{ mt: 1 }}>
                    {n.task && n.task.id ? (
                      <span style={{ cursor: 'pointer', color: '#1976d2', textDecoration: 'underline' }}
                        onClick={async () => {
                          // Marquer comme lu
                          try {
                            await fetch(`${API_BASE}/mark-as-read/${n.id}`, {
                              method: 'POST',
                              headers: { Authorization: `Bearer ${token}` }
                            });
                          } catch {}
                          window.location.href = `/employee/task/${n.task.id}`;
                        }}
                      >
                        {n.message}
                      </span>
                    ) : (
                      <span style={{ color: n.message?.includes('supprimée') ? 'red' : undefined }}>{n.message}</span>
                    )}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">{n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}</Typography>
                </Paper>
              );
            })}
            {totalPages > 1 && (
              <Pagination count={totalPages} page={page} onChange={(_, val) => setPage(val)} sx={{ mt: 2 }} />
            )}
          </>
        )}
      </Box>
    </EmployeeNavbar>
  );
}

