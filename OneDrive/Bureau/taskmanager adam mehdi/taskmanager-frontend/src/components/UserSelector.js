import React, { useEffect, useState } from "react";
import { FormControl, InputLabel, Select, MenuItem, CircularProgress } from "@mui/material";
import userService from "../services/user";

export default function UserSelector({ value, onChange, disabled }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // N'appelle userService.getAll() que si admin
    if (localStorage.getItem("role") === "ADMIN") {
      setLoading(true);
      userService.getAll().then(setUsers).finally(() => setLoading(false));
    }
  }, []);

  // Si pas admin, ne rend rien
  if (localStorage.getItem("role") !== "ADMIN") return null;

  return (
    <FormControl fullWidth sx={{ mt: 2 }} disabled={disabled}>
      <InputLabel>Assigné à</InputLabel>
      <Select
        value={value}
        label="Assigné à"
        onChange={e => onChange(e.target.value)}
      >
        <MenuItem value="">Aucun</MenuItem>
        {loading ? <MenuItem disabled><CircularProgress size={20} /></MenuItem> :
          users.map(u => (
            <MenuItem key={u.id} value={u.id}>{u.name} ({u.email})</MenuItem>
          ))
        }
      </Select>
    </FormControl>
  );
}
