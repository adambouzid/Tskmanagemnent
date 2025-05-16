import React, { useEffect, useState } from "react";
import { Typography, Box, Paper, CircularProgress, Alert, Pagination } from "@mui/material";
import DashboardLayout from "../components/DashboardLayout";
import authService from "../services/auth";

const API_BASE = "http://localhost:8080/api/notifications";

export default function AdminNotifications() {
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
    <DashboardLayout navItems={[]}>
      <Typography variant="h4" gutterBottom>Notifications Admin</Typography>
      <Box sx={{ mt: 2 }}>
        {loading ? <CircularProgress /> : error ? (
          <Alert severity="error">{error}</Alert>
        ) : notifications.length === 0 ? (
          <Typography>Aucune notification.</Typography>
        ) : (
          <>
            {notifications.map(n => (
              <Paper key={n.id} sx={{ p: 2, mb: 2 }}>
                <Typography>{n.message}</Typography>
                <Typography variant="caption" color="text.secondary">{n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}</Typography>
              </Paper>
            ))}
            {totalPages > 1 && (
              <Pagination count={totalPages} page={page} onChange={(_, val) => setPage(val)} sx={{ mt: 2 }} />
            )}
          </>
        )}
      </Box>
    </DashboardLayout>
  );
}
