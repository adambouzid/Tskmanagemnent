import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, Grid, Chip, CircularProgress } from "@mui/material";
import EmployeeNavbar from "../components/EmployeeNavbar";
import authService from "../services/auth";

const API_BASE = "http://localhost:8080/api/tasks/kanban";
const EmployeeDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const userId = authService.getUserId();

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const token = authService.getToken();
        const res = await fetch(API_BASE, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error();
        const data = await res.json();
        // Filtrer pour cet employé
        let total = 0, done = 0, inProgress = 0, late = 0, labels = {};
        const now = new Date();
        Object.keys(data).forEach(status => {
          (data[status] || []).forEach(task => {
            if (String(task.assignedToId) === String(userId)) {
              total++;
              if (status === "TERMINÉ") done++;
              else if (status === "EN COURS") inProgress++;
              if (task.dueDate && status !== "TERMINÉ" && new Date(task.dueDate) < now) late++;
              (task.labels || []).forEach(l => { labels[l.name] = (labels[l.name]||0)+1; });
            }
          });
        });
        setStats({ total, done, inProgress, late, labels });
      } catch { setStats(null); }
      setLoading(false);
    };
    fetchStats();
  }, [userId]);

  return (
    <EmployeeNavbar>
      <Typography variant="h4" gutterBottom>Tableau de bord Employé</Typography>
      {loading ? <CircularProgress /> : stats ? (
        <Box sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}><Paper sx={{ p:2, bgcolor:'primary.light', color:'primary.contrastText' }}><Typography>Tâches totales</Typography><Typography variant="h5">{stats.total}</Typography></Paper></Grid>
            <Grid item xs={12} md={3}><Paper sx={{ p:2, bgcolor:'success.light', color:'success.contrastText' }}><Typography>Terminées</Typography><Typography variant="h5">{stats.done}</Typography></Paper></Grid>
            <Grid item xs={12} md={3}><Paper sx={{ p:2, bgcolor:'warning.light', color:'warning.contrastText' }}><Typography>En cours</Typography><Typography variant="h5">{stats.inProgress}</Typography></Paper></Grid>
            <Grid item xs={12} md={3}><Paper sx={{ p:2, bgcolor:'error.light', color:'error.contrastText' }}><Typography>En retard</Typography><Typography variant="h5">{stats.late}</Typography></Paper></Grid>
          </Grid>
          <Box sx={{ mt:3 }}>
            <Typography variant="h6">Labels les plus utilisés</Typography>
            {Object.keys(stats.labels).length === 0 ? <Typography>Aucun label</Typography> :
              Object.entries(stats.labels).map(([name, count]) => (
                <Chip key={name} label={`${name} (${count})`} sx={{ mr:1, mb:1 }} />
              ))}
          </Box>
        </Box>
      ) : <Typography>Erreur chargement des statistiques.</Typography>}
    </EmployeeNavbar>
  );
};

export default EmployeeDashboard;
