import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, Grid, Chip, CircularProgress } from "@mui/material";
import EmployeeNavbar from "../components/EmployeeNavbar";
import TaskComments from "../components/TaskComments";
import LabelSelector from "../components/LabelSelector";
import authService from "../services/auth";
import EmployeeAddTask from "../components/EmployeeAddTask";

const API_BASE = "http://localhost:8080/api/tasks";
const STATUSES = ["À FAIRE", "EN COURS", "EN REVUE", "TERMINÉ"];
const STATUS_COLORS = {
  "À FAIRE": "default",
  "EN COURS": "primary",
  "EN REVUE": "warning",
  "TERMINÉ": "success"
};

export default function EmployeeKanban() {
  const [kanban, setKanban] = useState({});
  const [loading, setLoading] = useState(true);
  const userId = authService.getUserId();

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

  const loadKanban = async () => {
    setLoading(true);
    const res = await fetchWithAuth(`${API_BASE}/kanban`);
    if (res.ok) {
      const data = await res.json();
      // Filtrer les tâches pour ne garder que celles assignées à l'employé connecté
      const filtered = {};
      Object.keys(data).forEach(status => {
        filtered[status] = (data[status] || []).filter(task => String(task.assignedToId) === String(userId));
      });
      setKanban(filtered);
    }
    setLoading(false);
  };

  useEffect(() => { loadKanban(); }, []);

  return (
    <>
      <EmployeeAddTask onTaskAdded={loadKanban} />
      <EmployeeNavbar>
        <Typography variant="h4" sx={{ mb: 2 }}>Mes tâches (Kanban)</Typography>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}><CircularProgress /></Box>
        ) : (
          <Grid container spacing={2}>
            {STATUSES.map((status) => (
              <Grid item xs={12} md={3} key={status}>
                <Paper sx={{ p: 2, minHeight: 400, bgcolor: "#f7f7f7" }}>
                  <Typography variant="h6">
                    <Chip label={status} color={STATUS_COLORS[status]} />
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    {(kanban[status] || []).map((task) => (
                      <Paper key={task.id} sx={{ mb: 2, p: 2, borderLeft: `5px solid #1976d2`, '&:hover': { boxShadow: 3 } }}>
                        <Typography variant="subtitle1" fontWeight={600}>{task.title}</Typography>
                        <Typography variant="body2" color="text.secondary">{task.description}</Typography>
                        <Typography variant="caption" color="text.secondary">Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "-"}</Typography>
                        {/* Gestion des labels */}
                        {/* Affichage des labels */}
                        {task.labels && task.labels.length > 0 ? (
                          task.labels.map(label => (
                            <Chip key={label.id} size="small" label={label.name} sx={{ mr: 1, bgcolor: label.color }} />
                          ))
                        ) : (
                          <Typography variant="caption" color="text.secondary">Aucun label</Typography>
                        )}
                        {/* Commentaires threadés */}
                        <TaskComments taskId={task.id} />
                        {/* Bouton terminer si la tâche n'est pas terminée */}
                        {status !== "TERMINÉ" && (
                          <Box sx={{ mt: 1 }}>
                            <Chip
                              label="Marquer comme terminée"
                              color="success"
                              clickable
                              onClick={async () => {
                                await fetchWithAuth(`${API_BASE}/${task.id}`, {
                                  method: "PUT",
                                  body: JSON.stringify({ ...task, status: "TERMINÉ" }),
                                });
                                loadKanban();
                              }}
                              sx={{ fontWeight: 600 }}
                            />
                          </Box>
                        )}
                      </Paper>
                    ))}
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </EmployeeNavbar>
    </>
  );
}
