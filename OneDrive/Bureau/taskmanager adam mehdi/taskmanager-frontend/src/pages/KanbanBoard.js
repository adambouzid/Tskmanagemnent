import React, { useEffect, useState } from "react";
import {
  Box, Typography, Paper, Grid, Chip, CircularProgress, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Select, InputLabel, FormControl, Snackbar, Alert
} from "@mui/material";
import DashboardLayout from "../components/DashboardLayout";
import authService from "../services/auth";
import AddIcon from "@mui/icons-material/Add";
import TaskComments from "../components/TaskComments";
import LabelSelector from "../components/LabelSelector";
import UserSelector from "../components/UserSelector";
import labelService from "../services/label";

const API_BASE = "http://localhost:8080/api/tasks";
const STATUSES = ["À FAIRE", "EN COURS", "EN REVUE", "TERMINÉ"];
const STATUS_COLORS = {
  "À FAIRE": "default",
  "EN COURS": "primary",
  "EN REVUE": "warning",
  "TERMINÉ": "success"
};
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const PRIORITY_COLORS = {
  LOW: "default",
  MEDIUM: "info",
  HIGH: "warning",
  URGENT: "error"
};

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

export default function KanbanBoard() {
  const [kanban, setKanban] = useState({});
  const [loading, setLoading] = useState(true);
  const [openAdd, setOpenAdd] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", status: STATUSES[0], priority: "", dueDate: "", assignedToId: "", labels: [] });
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [openEdit, setOpenEdit] = useState(false);
  const [editForm, setEditForm] = useState(null);
  // Pour garder les labels sélectionnés lors de l'édition (ids)
  const [editLabels, setEditLabels] = useState([]);
  const [openDelete, setOpenDelete] = useState(false);

  // Helper to format dueDate as 'YYYY-MM-DDTHH:mm:ss' (local time, no Z)
  const toLocalISOString = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const pad = n => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
  };

  const loadKanban = async () => {
    setLoading(true);
    const res = await fetchWithAuth(`${API_BASE}/kanban`);
    if (res.ok) {
      setKanban(await res.json());
    } else {
      setSnackbar({ open: true, message: "Failed to load tasks", severity: "error" });
    }
    setLoading(false);
  };

  useEffect(() => { loadKanban(); }, []);

  const handleOpenAdd = () => {
    setForm({ title: "", description: "", status: STATUSES[0], priority: "", dueDate: "", assignedToId: "", labels: [] });
    setOpenAdd(true);
  };

  const handleAdd = async () => {
    if (!form.title || !form.description || !form.dueDate || !form.priority) {
      setSnackbar({ open: true, message: "All fields are required", severity: "error" });
      return;
    }
    // Si employé, on force l'assignation à soi-même
    let payload = { ...form, dueDate: toLocalISOString(form.dueDate) };
    if (authService.getRole() === 'EMPLOYEE') {
      payload.assignedToId = authService.getUserId();
    }
    // On crée la tâche sans labels (backend d'abord)
    const res = await fetchWithAuth(API_BASE, {
      method: "POST",
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      // Puis on ajoute les labels sélectionnés
      const task = await res.json();
      if (form.labels && form.labels.length > 0) {
        await Promise.all(form.labels.map(labelId => labelService.addToTask(task.id, labelId)));
      }

      setOpenAdd(false);
      setSnackbar({ open: true, message: "Task created", severity: "success" });
      loadKanban();
    } else {
      let msg = "Failed to create task";
      if (res.status === 403) {
        msg = "Vous n’avez pas les droits nécessaires ou l’utilisateur assigné n’existe pas.";
      } else {
        try {
          const error = await res.json();
          msg = error.message || JSON.stringify(error);
        } catch {}
      }
      setSnackbar({ open: true, message: msg, severity: "error" });
    }
  };

  // Fonction pour éditer une tâche
  const handleEdit = async () => {
    if (!editForm.title || !editForm.description || !editForm.dueDate || !editForm.priority) {
      setSnackbar({ open: true, message: "All fields are required", severity: "error" });
      return;
    }
    const payload = { ...editForm, dueDate: toLocalISOString(editForm.dueDate) };
    const res = await fetchWithAuth(`${API_BASE}/${editForm.id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      // Synchronisation des labels (on retire puis on ajoute)
      const oldLabelIds = (editForm.labels || []).map(l => l.id ? l.id : l); // selon structure
      // Labels à ajouter
      const toAdd = editLabels.filter(id => !oldLabelIds.includes(id));
      // Labels à retirer
      const toRemove = oldLabelIds.filter(id => !editLabels.includes(id));
      await Promise.all([
        ...toAdd.map(id => labelService.addToTask(editForm.id, id)),
        ...toRemove.map(id => labelService.removeFromTask(editForm.id, id)),
      ]);
      setOpenEdit(false);
      setSnackbar({ open: true, message: "Task updated", severity: "success" });
      loadKanban();
    } else {
      let msg = "Failed to update task";
      if (res.status === 403) {
        msg = "Vous n’avez pas les droits nécessaires ou l’utilisateur assigné n’existe pas.";
      } else {
        try {
          const error = await res.json();
          msg = error.message || JSON.stringify(error);
        } catch {}
      }
      setSnackbar({ open: true, message: msg, severity: "error" });
    }
  };


  // Fonction pour supprimer une tâche
  const handleDelete = async () => {
    const res = await fetchWithAuth(`${API_BASE}/${editForm.id}`, { method: "DELETE" });
    if (res.ok) {
      setOpenDelete(false);
      setSnackbar({ open: true, message: "Task deleted", severity: "success" });
      loadKanban();
    } else {
      let msg = "Failed to delete task";
    if (res.status === 403) {
      msg = "Vous n’avez pas les droits nécessaires pour supprimer cette tâche.";
    }
    setSnackbar({ open: true, message: msg, severity: "error" });
    }
  };

  // Synchroniser editLabels quand on ouvre le dialog d'édition
  useEffect(() => {
    if (openEdit && editForm) {
      setEditLabels((editForm.labels || []).map(l => l.id ? l.id : l));
    }
  }, [openEdit, editForm]);

  // Récupérer l'utilisateur connecté (id) depuis le JWT
  // === RESTORE ORIGINAL ADMIN LOGIC ===
  // No employee-specific filtering here. Admin sees all tasks and admin nav.
  return (
    <DashboardLayout>

      {/* TODO: Masquer/retirer tout bouton d'ajout, édition et suppression de tâche pour l'employé */}

      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>Kanban Board</Typography>
        {authService.getRole() === 'ADMIN' && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAdd}>Add Task</Button>
        )}
      </Box>
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
                    <Paper key={task.id} sx={{ mb: 2, p: 2, borderLeft: `5px solid #1976d2`, cursor: 'pointer' }} onClick={() => { setEditForm({ ...task }); setOpenEdit(true); }}>
                      <Typography variant="subtitle1" fontWeight={600}>{task.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {task.description}
                      </Typography>
                      {/* Commentaires pour cette tâche */}
                      <TaskComments taskId={task.id} />
                      <Typography variant="caption" color="text.secondary">Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "-"}</Typography>
                      <Box sx={{ mt: 1 }}>
                        {task.priority && <Chip size="small" label={task.priority} color={PRIORITY_COLORS[task.priority]} sx={{ mr: 1 }} />}
                        {task.labels && task.labels.map(label => (
                          <Chip key={label.id} size="small" label={label.name} sx={{ mr: 1, bgcolor: label.color }} />
                        ))}
                        <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                          <Button size="small" variant="outlined" color="primary" onClick={e => { e.stopPropagation(); setEditForm({ ...task }); setOpenEdit(true); }}>Edit</Button>
                          <Button size="small" variant="outlined" color="error" onClick={e => { e.stopPropagation(); setEditForm({ ...task }); setOpenDelete(true); }}>Delete</Button>
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
      {/* Add Task Dialog */}
      <Dialog open={openAdd} onClose={() => setOpenAdd(false)}>
        <DialogTitle>Add Task</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" label="Title" fullWidth value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <TextField margin="dense" label="Description" fullWidth value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select value={form.status} label="Status" onChange={e => setForm({ ...form, status: e.target.value })}>
              {STATUSES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mt: 2 }} required>
            <InputLabel>Priority</InputLabel>
            <Select value={form.priority} label="Priority" onChange={e => setForm({ ...form, priority: e.target.value })}>
              {PRIORITIES.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
            </Select>
          </FormControl>
          <LabelSelector value={form.labels} onChange={labels => setForm({ ...form, labels })} />
          <TextField margin="dense" type="date" label="Due Date" InputLabelProps={{ shrink: true }} fullWidth required value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
          {/* Champ d'assignation visible seulement pour les admins */}
          {authService.getRole() === 'ADMIN' ? (
            <UserSelector
              value={form.assignedToId}
              onChange={val => setForm({ ...form, assignedToId: val })}
              disabled={false}
            />
          ) : null}

        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAdd(false)}>Cancel</Button>
          <Button onClick={handleAdd} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    {/* Edit Task Dialog */}
<Dialog open={openEdit} onClose={() => setOpenEdit(false)}>
  <DialogTitle>Edit Task</DialogTitle>
  <DialogContent>
    {editForm && (
      <>
        <TextField autoFocus margin="dense" label="Title" fullWidth value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} />
        <TextField margin="dense" label="Description" fullWidth value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} />
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Status</InputLabel>
          <Select value={editForm.status} label="Status" onChange={e => setEditForm({ ...editForm, status: e.target.value })}>
            {STATUSES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl fullWidth sx={{ mt: 2 }} required>
          <InputLabel>Priority</InputLabel>
          <Select value={editForm.priority} label="Priority" onChange={e => setEditForm({ ...editForm, priority: e.target.value })}>
            {PRIORITIES.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
          </Select>
        </FormControl>
        <LabelSelector value={editLabels} onChange={setEditLabels} />
        <TextField margin="dense" type="date" label="Due Date" InputLabelProps={{ shrink: true }} fullWidth required value={editForm.dueDate} onChange={e => setEditForm({ ...editForm, dueDate: e.target.value })} />
        <TextField margin="dense" label="Assigned To (User ID)" fullWidth value={editForm.assignedToId || ''} onChange={e => setEditForm({ ...editForm, assignedToId: e.target.value })} />
      </>
    )}
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
    <Button onClick={handleEdit} variant="contained">Save</Button>
  </DialogActions>
</Dialog>
{/* Delete Confirmation Dialog */}
<Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
  <DialogTitle>Delete Task</DialogTitle>
  <DialogContent>
    <Typography>Are you sure you want to delete this task?</Typography>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setOpenDelete(false)}>Cancel</Button>
    <Button onClick={handleDelete} variant="contained" color="error">Delete</Button>
  </DialogActions>
</Dialog>
</DashboardLayout>
  );
}
