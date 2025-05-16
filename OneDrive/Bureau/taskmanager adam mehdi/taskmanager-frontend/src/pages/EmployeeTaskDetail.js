import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Typography, Box, Paper, Chip, Button, CircularProgress, Alert, Divider, TextField } from "@mui/material";
import EmployeeNavbar from "../components/EmployeeNavbar";
import authService from "../services/auth";

const API_BASE = "http://localhost:8080/api";

export default function EmployeeTaskDetail() {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [replyParentId, setReplyParentId] = useState(null);
  const [refresh, setRefresh] = useState(0);
  const userId = authService.getUserId();
  const token = authService.getToken();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTask = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/tasks/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error("Tâche introuvable ou supprimée");
        setTask(await res.json());
      } catch (e) {
        setError(e.message);
      }
      setLoading(false);
    };
    const fetchComments = async () => {
      try {
        const res = await fetch(`${API_BASE}/comments/task/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error();
        setComments(await res.json());
      } catch {
        setComments([]);
      }
    };
    fetchTask();
    fetchComments();
  }, [id, refresh]);

  const handleReply = async (parentId) => {
    if (!replyContent.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/comments`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyContent, taskId: id, parentId })
      });
      if (!res.ok) throw new Error("Erreur lors de l'envoi du commentaire");
      setReplyContent("");
      setReplyParentId(null);
      setRefresh(r => r + 1);
    } catch (e) {
      alert(e.message);
    }
  };

  const renderComments = (comments, parent = null, level = 0) => {
    return comments.filter(c => (c.parentId === parent)).map(c => (
      <Box key={c.id} sx={{ ml: level * 4, mt: 2, borderLeft: level ? '2px solid #90caf9' : 'none', pl: level ? 2 : 0 }}>
        <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>{c.createdByName || ""}</Typography>
          <Typography sx={{ mb: 1 }}>{c.content}</Typography>
          <Button size="small" onClick={() => { setReplyParentId(c.id); setReplyContent(""); }}>Répondre</Button>
        </Paper>
        {replyParentId === c.id && (
          <Box sx={{ mt: 1, mb: 2 }}>
            <TextField
              value={replyContent}
              onChange={e => setReplyContent(e.target.value)}
              label="Votre réponse"
              fullWidth
              multiline
              minRows={2}
            />
            <Button variant="contained" sx={{ mt: 1 }} onClick={() => handleReply(c.id)}>Envoyer</Button>
            <Button sx={{ mt: 1, ml: 2 }} onClick={() => setReplyParentId(null)}>Annuler</Button>
          </Box>
        )}
        {renderComments(comments, c.id, level + 1)}
      </Box>
    ));
  };

  if (loading) return <EmployeeNavbar><CircularProgress /></EmployeeNavbar>;
  if (error) return <EmployeeNavbar><Alert severity="error">{error}</Alert></EmployeeNavbar>;
  if (!task) return <EmployeeNavbar><Typography>Tâche introuvable ou supprimée.</Typography></EmployeeNavbar>;

  return (
    <EmployeeNavbar>
      <Button onClick={() => navigate(-1)} sx={{ mb: 2 }}>Retour</Button>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>{task.title}</Typography>
        <Typography sx={{ mb: 1 }}>{task.description}</Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
          <Chip label={task.status} color="primary" />
          <Chip label={task.priority} color="secondary" />
          {task.labels && task.labels.map(l => <Chip key={l.id} label={l.name} color="info" />)}
        </Box>
        <Typography variant="caption" color="text.secondary">Échéance : {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "-"}</Typography>
      </Paper>
      <Divider sx={{ mb: 2 }} />
      <Typography variant="h6">Commentaires</Typography>
      {renderComments(comments)}
      {/* Ajout d'un commentaire racine */}
      <Box sx={{ mt: 2 }}>
        <TextField
          value={replyParentId === null ? replyContent : ""}
          onChange={e => { if (replyParentId === null) setReplyContent(e.target.value); }}
          label="Ajouter un commentaire"
          fullWidth
          multiline
          minRows={2}
        />
        <Button variant="contained" sx={{ mt: 1 }} onClick={() => handleReply(null)}>Commenter</Button>
      </Box>
    </EmployeeNavbar>
  );
}
