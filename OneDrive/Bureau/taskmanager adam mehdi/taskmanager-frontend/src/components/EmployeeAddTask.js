import React, { useState } from "react";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Select, InputLabel, FormControl, Snackbar, Alert } from "@mui/material";
import LabelSelector from "./LabelSelector";
import authService from "../services/auth";

const API_BASE = "http://localhost:8080/api/tasks";
const STATUSES = ["À FAIRE", "EN COURS", "EN REVUE", "TERMINÉ"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];

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

export default function EmployeeAddTask({ onTaskAdded }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: STATUSES[0],
    priority: PRIORITIES[0],
    dueDate: "",
    labels: []
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLabelsChange = (labels) => {
    setForm({ ...form, labels });
  };

  const handleSubmit = async () => {
    const userId = authService.getUserId();
    const payload = {
      ...form,
      assignedToId: userId,
      labelIds: form.labels.map(l => l.id),
    };
    try {
      const res = await fetchWithAuth(API_BASE, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Erreur lors de la création de la tâche");
      setSnackbar({ open: true, message: "Tâche créée avec succès", severity: "success" });
      setOpen(false);
      setForm({ title: "", description: "", status: STATUSES[0], priority: PRIORITIES[0], dueDate: "", labels: [] });
      if (onTaskAdded) onTaskAdded();
    } catch (e) {
      setSnackbar({ open: true, message: e.message, severity: "error" });
    }
  };

  return (
    <>
      <Button variant="contained" color="primary" sx={{ mb: 2 }} onClick={() => setOpen(true)}>
        Ajouter une tâche
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Nouvelle tâche</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Titre"
            name="title"
            fullWidth
            value={form.title}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            label="Description"
            name="description"
            fullWidth
            multiline
            value={form.description}
            onChange={handleChange}
          />
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Statut</InputLabel>
            <Select
              name="status"
              value={form.status}
              label="Statut"
              onChange={handleChange}
            >
              {STATUSES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Priorité</InputLabel>
            <Select
              name="priority"
              value={form.priority}
              label="Priorité"
              onChange={handleChange}
            >
              {PRIORITIES.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Date limite"
            name="dueDate"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={form.dueDate}
            onChange={handleChange}
          />
          <LabelSelector selectedLabels={form.labels} onChange={handleLabelsChange} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Annuler</Button>
          <Button onClick={handleSubmit} variant="contained">Créer</Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </>
  );
}
