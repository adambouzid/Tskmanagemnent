import React, { useEffect, useState } from "react";
import { Box, Typography, List, ListItem, ListItemText, CircularProgress, TextField, Button, Paper } from "@mui/material";
import authService from "../services/auth";

const API_BASE = "http://localhost:8080/api/comments";

export default function TaskComments({ taskId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const token = authService.getToken();

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/task/${taskId}?page=0&size=20`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setComments(data.content || []);
      } else {
        setError("Erreur lors du chargement des commentaires");
      }
    } catch {
      setError("Erreur réseau");
    }
    setLoading(false);
  };

  useEffect(() => { if (taskId) fetchComments(); /*eslint-disable-next-line*/ }, [taskId, refresh]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ content: newComment, taskId })
      });
      if (res.ok) {
        setNewComment("");
        setRefresh(r => r + 1);
      } else {
        setError("Erreur lors de l'ajout du commentaire");
      }
    } catch {
      setError("Erreur réseau");
    }
  };

  return (
    <Paper sx={{ mt: 2, p: 2 }}>
      <Typography variant="h6">Commentaires</Typography>
      {loading ? <CircularProgress /> : (
        <List>
          {comments.length === 0 ? (
            <ListItem><ListItemText primary="Aucun commentaire" /></ListItem>
          ) : comments.map(c => (
            <ListItem key={c.id} alignItems="flex-start">
              <ListItemText
                primary={c.content}
                secondary={c.createdAt ? new Date(c.createdAt).toLocaleString() : ""}
              />
            </ListItem>
          ))}
        </List>
      )}
      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
        <TextField
          label="Ajouter un commentaire"
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          fullWidth
          size="small"
        />
        <Button variant="contained" onClick={handleAddComment}>Envoyer</Button>
      </Box>
      {error && <Typography color="error">{error}</Typography>}
    </Paper>
  );
}
