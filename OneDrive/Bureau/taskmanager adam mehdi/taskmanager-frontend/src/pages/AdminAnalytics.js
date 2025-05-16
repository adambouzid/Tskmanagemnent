import React, { useEffect, useState } from "react";
import { Typography, Paper, CircularProgress, Box } from "@mui/material";
import DashboardLayout from "../components/DashboardLayout";
import authService from "../services/auth";
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import AssignmentIcon from "@mui/icons-material/Assignment";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";

const API_ANALYTICS = "http://localhost:8080/api/tasks/analytics";
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#B8860B", "#8A2BE2"];

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

export default function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [selectedTimeFrame, setSelectedTimeFrame] = useState('all');
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    fetchWithAuth(`${API_ANALYTICS}?timeFrame=${selectedTimeFrame}`)
      .then(async res => {
        if (res.ok) {
          setStats(await res.json());
        } else {
          setError("Impossible de charger les statistiques");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Erreur réseau");
        setLoading(false);
      });
  }, [selectedTimeFrame]);

  return (
    <DashboardLayout navItems={[
      { label: "Dashboard", path: "/admin", icon: <DashboardIcon /> },
      { label: "Manage Tasks", path: "/admin/tasks", icon: <AssignmentIcon /> },
      { label: "Users", path: "/admin/users", icon: <PeopleIcon /> },
      { label: "Analytics", path: "/admin/analytics", icon: <AssignmentIcon /> }
    ]}>
      <Typography variant="h4" sx={{ mb: 2 }}>Statistiques des tâches</Typography>
      {/* Sélecteur de période */}
      <Box sx={{ mb: 2 }}>
        <label>Période : </label>
        <select value={selectedTimeFrame} onChange={e => setSelectedTimeFrame(e.target.value)}>
          <option value="all">Tout</option>
          <option value="week">Semaine</option>
          <option value="month">Mois</option>
          <option value="quarter">Trimestre</option>
        </select>
      </Box>
      {/* Affichage du nombre total de tâches */}
      {stats && (
        <Typography variant="h6" sx={{ mb: 2 }}>
          Nombre total de tâches : {stats.totalTasks}
        </Typography>
      )}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Paper sx={{ p: 3, color: 'error.main' }}>{error}</Paper>
      ) : stats ? (
        <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {/* Répartition par statut */}
          {stats.tasksByStatus && (
            <Paper sx={{ p: 2, flex: 1 }}>
              <Typography variant="h6">Par statut</Typography>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={Object.entries(stats.tasksByStatus).map(([status, count]) => ({ status, count }))} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={80} label>
                    {Object.keys(stats.tasksByStatus).map((_, idx) => (
                      <Cell key={`cell-status-${idx}`} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          )}
          {/* Répartition par priorité */}
          {stats.tasksByPriority && (
            <Paper sx={{ p: 2, flex: 1 }}>
              <Typography variant="h6">Par priorité</Typography>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={Object.entries(stats.tasksByPriority).map(([priority, count]) => ({ priority, count }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="priority" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#0088FE" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          )}
        </Box>
      ) : null}
    </DashboardLayout>
  );
}
