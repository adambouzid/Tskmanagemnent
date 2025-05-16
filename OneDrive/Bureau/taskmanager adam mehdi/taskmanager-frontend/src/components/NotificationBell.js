import React, { useEffect, useState } from "react";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemText from "@mui/material/ListItemText";
import CircularProgress from "@mui/material/CircularProgress";
import authService from "../services/auth";

const API_BASE = "http://localhost:8080/api/notifications";

export default function NotificationBell({ onNotificationClick }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState("");

  const userId = authService.getUserId();
  const token = authService.getToken();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/user/${userId}?page=0&size=10`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.content || []);
      } else {
        setError("Erreur lors du chargement des notifications");
      }
    } catch {
      setError("Erreur réseau");
    }
    setLoading(false);
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch(`${API_BASE}/user/${userId}/count-unread`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setUnreadCount(await res.json());
      }
    } catch {}
  };

  useEffect(() => {
    if (userId) {
      fetchNotifications();
      fetchUnreadCount();
    }
    // eslint-disable-next-line
  }, [userId]);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
    fetchNotifications();
    fetchUnreadCount();
  };
  const handleClose = () => setAnchorEl(null);

  const handleMarkAsRead = async (notifId) => {
    await fetch(`${API_BASE}/${notifId}/mark-read`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchNotifications();
    fetchUnreadCount();
    if (onNotificationClick) onNotificationClick(notifId);
  };

  return (
    <>
      <IconButton color="inherit" onClick={handleOpen} size="large">
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        {loading ? (
          <MenuItem><CircularProgress size={24} /></MenuItem>
        ) : notifications.length === 0 ? (
          <MenuItem>Aucune notification</MenuItem>
        ) : notifications.map((notif) => (
          <MenuItem key={notif.id} onClick={() => handleMarkAsRead(notif.id)} selected={!notif.read}>
            <ListItemText
              primary={notif.message || notif.title || "Notification"}
              secondary={notif.createdAt ? new Date(notif.createdAt).toLocaleString() : ""}
              style={{ fontWeight: notif.read ? "normal" : "bold" }}
            />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
