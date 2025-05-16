import React, { useEffect, useState } from "react";
import {
  Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Button, IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, MenuItem, Select, InputLabel, FormControl, Snackbar, Alert, CircularProgress
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import DashboardLayout from "../components/DashboardLayout";
import authService from "../services/auth";
// Navigation items are now defined in DashboardLayout component

const API_BASE = "http://localhost:8080/api/admin/users";

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

const roles = ["ADMIN", "EMPLOYEE"];

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", userRole: "EMPLOYEE" });
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");

  const loadUsers = async (params = {}) => {
    setLoading(true);
    const query = new URLSearchParams({
      page,
      size,
      search,
      role,
      ...params
    });
    const res = await fetchWithAuth(`${API_BASE}?${query.toString()}`);
    if (res.ok) {
      const data = await res.json();
      setUsers(data.content);
      setTotalPages(data.totalPages);
    } else {
      setSnackbar({ open: true, message: "Failed to load users", severity: "error" });
    }
    setLoading(false);
  };

  useEffect(() => { loadUsers(); }, [page, size, search, role]);

  const handleOpenAdd = () => {
    setForm({ name: "", email: "", password: "", userRole: "EMPLOYEE" });
    setOpenAdd(true);
  };

  const handleAdd = async () => {
    const res = await fetchWithAuth(API_BASE, {
      method: "POST",
      body: JSON.stringify(form)
    });
    if (res.ok) {
      setOpenAdd(false);
      setSnackbar({ open: true, message: "User added", severity: "success" });
      loadUsers();
    } else {
      setSnackbar({ open: true, message: "Failed to add user", severity: "error" });
    }
  };

  const handleOpenEdit = (user) => {
    setSelectedUser(user);
    setForm({ name: user.name, email: user.email, password: "", userRole: user.userRole });
    setOpenEdit(true);
  };

  const handleEdit = async () => {
    const res = await fetchWithAuth(`${API_BASE}/${selectedUser.id}`, {
      method: "PUT",
      body: JSON.stringify(form)
    });
    if (res.ok) {
      setOpenEdit(false);
      setSnackbar({ open: true, message: "User updated", severity: "success" });
      loadUsers();
    } else {
      setSnackbar({ open: true, message: "Failed to update user", severity: "error" });
    }
  };

  const handleOpenDelete = (user) => {
    setSelectedUser(user);
    setOpenDelete(true);
  };

  const handleDelete = async () => {
    const res = await fetchWithAuth(`${API_BASE}/${selectedUser.id}`, {
      method: "DELETE" });
    if (res.ok) {
      setOpenDelete(false);
      setSnackbar({ open: true, message: "User deleted", severity: "success" });
      loadUsers();
    } else {
      setSnackbar({ open: true, message: "Failed to delete user", severity: "error" });
    }
  };

  const handleRoleChange = async (user, newRole) => {
    const res = await fetchWithAuth(`${API_BASE}/${user.id}/role`, {
      method: "PUT",
      body: JSON.stringify(newRole)
    });
    if (res.ok) {
      setSnackbar({ open: true, message: "Role updated", severity: "success" });
      loadUsers();
    } else {
      setSnackbar({ open: true, message: "Failed to update role", severity: "error" });
    }
  };

  return (
    <DashboardLayout>
      <Typography variant="h4" sx={{ mb: 2 }}>User Management</Typography>
      <Paper sx={{ mb: 2, p: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          label="Recherche nom/email"
          value={search}
          onChange={e => { setPage(0); setSearch(e.target.value); }}
          size="small"
        />
        <FormControl sx={{ minWidth: 120 }} size="small">
          <InputLabel>Rôle</InputLabel>
          <Select
            value={role}
            label="Rôle"
            onChange={e => { setPage(0); setRole(e.target.value); }}
          >
            <MenuItem value="">Tous</MenuItem>
            <MenuItem value="ADMIN">ADMIN</MenuItem>
            <MenuItem value="EMPLOYEE">EMPLOYEE</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAdd}>Ajouter</Button>
      </Paper>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  {loading ? <CircularProgress size={20} /> : "Aucun utilisateur trouvé"}
                </TableCell>
              </TableRow>
            )}
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name || '-'}</TableCell>
                <TableCell>{user.email || '-'}</TableCell>
                <TableCell>
                  <FormControl size="small">
                    <Select
                      value={user.userRole}
                      onChange={(e) => handleRoleChange(user, e.target.value)}
                      disabled={user.id === 1}
                    >
                      {roles.map((role) => (
                        <MenuItem key={role} value={role}>{role}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleOpenEdit(user)}><EditIcon /></IconButton>
                  <IconButton onClick={() => handleOpenDelete(user)} disabled={user.id === 1}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add User Dialog */}
      <Dialog open={openAdd} onClose={() => setOpenAdd(false)}>
        <DialogTitle>Add User</DialogTitle>
        <DialogContent>
          <DialogContentText>Fill out the form to add a new employee.</DialogContentText>
          <TextField autoFocus margin="dense" label="Name" fullWidth value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <TextField margin="dense" label="Email" fullWidth value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          <TextField margin="dense" label="Password" type="password" fullWidth value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAdd(false)}>Cancel</Button>
          <Button onClick={handleAdd} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <DialogContentText>Update user info. Leave password blank to keep unchanged.</DialogContentText>
          <TextField autoFocus margin="dense" label="Name" fullWidth value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <TextField margin="dense" label="Email" fullWidth value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          <TextField margin="dense" label="Password" type="password" fullWidth value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
          <Button onClick={handleEdit} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to delete this user?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDelete(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </DashboardLayout>
  );
}
