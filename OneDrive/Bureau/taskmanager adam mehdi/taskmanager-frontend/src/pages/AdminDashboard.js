import React from "react";
import Typography from "@mui/material/Typography";
import SpaceDashboardRoundedIcon from "@mui/icons-material/SpaceDashboardRounded";
import ViewKanbanRoundedIcon from "@mui/icons-material/ViewKanbanRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import DashboardLayout from "../components/DashboardLayout";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import AddTaskIcon from "@mui/icons-material/AddTask";
import GroupIcon from "@mui/icons-material/Group";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import TimelineIcon from "@mui/icons-material/Timeline";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CircleIcon from "@mui/icons-material/Circle";
import { styled, alpha } from "@mui/material/styles";
import { useEffect, useState } from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Divider from "@mui/material/Divider";

// Navigation items now defined in DashboardLayout component

// Styled components for dashboard cards
const StatsCard = styled(Paper)(({ theme }) => ({
  padding: 24,
  height: '100%',
  borderRadius: 12,
  boxShadow: '0 6px 18px rgba(0,0,0,0.06)',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#fff',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 24px rgba(0,0,0,0.08)'
  }
}));

const StatsHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 16
}));

const StatsValue = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: 28,
  marginBottom: 4
}));

const TrendIndicator = styled(Box)(({ theme, positive }) => ({
  display: 'flex',
  alignItems: 'center',
  color: positive ? '#4caf50' : '#f44336',
  fontSize: 14
}));

const SectionCard = styled(Paper)(({ theme }) => ({
  padding: 24,
  borderRadius: 12,
  boxShadow: '0 6px 18px rgba(0,0,0,0.06)',
  backgroundColor: '#fff',
  marginBottom: 24,
  height: '100%'
}));

const ActivityItem = styled(ListItem)(({ theme }) => ({
  padding: '12px 0',
  '&:not(:last-child)': {
    borderBottom: '1px solid #f5f5f5'
  }
}));

const DeadlineItem = styled(ListItem)(({ theme }) => ({
  padding: '12px 0',
  display: 'flex',
  justifyContent: 'space-between',
  '&:not(:last-child)': {
    borderBottom: '1px solid #f5f5f5'
  }
}));

const PriorityDot = styled(CircleIcon)(({ theme, color }) => ({
  color: color,
  fontSize: 12,
  marginRight: 8
}));

const API_STATS = "http://localhost:8080/api/tasks/analytics";
const API_USERS = "http://localhost:8080/api/users?page=0&size=1";
const API_RECENT = "http://localhost:8080/api/tasks/recent";
const API_UPCOMING = "http://localhost:8080/api/tasks/upcoming";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [userCount, setUserCount] = useState(0);
  const [recentActivity, setRecentActivity] = useState([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);

  const getPriorityColor = (priority) => {
    switch(priority.toLowerCase()) {
      case 'high': return '#f44336';
      case 'medium': return '#ff9800';
      case 'low': return '#4caf50';
      default: return '#757575';
    }
  };

  const fetchWithAuth = (url) => {
    const token = localStorage.getItem('token');
    return fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  };

  useEffect(() => {
    // Fetch task statistics
    fetchWithAuth(API_STATS)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          setStats(data);
        }
      })
      .catch(err => console.error('Error fetching task statistics:', err));
    
    // Fetch user count
    fetchWithAuth(API_USERS)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.totalElements) {
          setUserCount(data.totalElements);
        }
      })
      .catch(err => console.error('Error fetching user count:', err));

    // Fetch recent activity
    fetchWithAuth(API_RECENT)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          setRecentActivity(data);
        }
      })
      .catch(err => console.error('Error fetching recent activity:', err));

    // Fetch upcoming deadlines
    fetchWithAuth(API_UPCOMING)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          setUpcomingDeadlines(data);
        }
      })
      .catch(err => console.error('Error fetching upcoming deadlines:', err));
  }, []);

  return (
    <DashboardLayout>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>Dashboard</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Welcome back to your task management dashboard.
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard>
            <StatsHeader>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Total Tasks</Typography>
                <StatsValue>{stats?.totalTasks || '-'}</StatsValue>
              </Box>
              <Avatar sx={{ bgcolor: alpha('#5e72e4', 0.1), color: '#5e72e4' }}>
                <AssignmentRoundedIcon />
              </Avatar>
            </StatsHeader>
            <TrendIndicator positive={true}>
              <ArrowUpwardIcon fontSize="small" sx={{ mr: 0.5 }} />
              <Typography variant="caption">+4 from last week</Typography>
            </TrendIndicator>
          </StatsCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatsCard>
            <StatsHeader>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">In Progress</Typography>
                <StatsValue>{stats?.tasksByStatus?.['EN COURS'] || '-'}</StatsValue>
              </Box>
              <Avatar sx={{ bgcolor: alpha('#ffb300', 0.1), color: '#ffb300' }}>
                <TimelineIcon />
              </Avatar>
            </StatsHeader>
            <TrendIndicator positive={false}>
              <ArrowDownwardIcon fontSize="small" sx={{ mr: 0.5 }} />
              <Typography variant="caption">-2 from last week</Typography>
            </TrendIndicator>
          </StatsCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatsCard>
            <StatsHeader>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Completed</Typography>
                <StatsValue>{stats?.tasksByStatus?.['TERMINÉ'] || '-'}</StatsValue>
              </Box>
              <Avatar sx={{ bgcolor: alpha('#4caf50', 0.1), color: '#4caf50' }}>
                <TaskAltIcon />
              </Avatar>
            </StatsHeader>
            <TrendIndicator positive={true}>
              <ArrowUpwardIcon fontSize="small" sx={{ mr: 0.5 }} />
              <Typography variant="caption">+6 from last week</Typography>
            </TrendIndicator>
          </StatsCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatsCard>
            <StatsHeader>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Team Members</Typography>
                <StatsValue>{userCount || '-'}</StatsValue>
              </Box>
              <Avatar sx={{ bgcolor: alpha('#825ee4', 0.1), color: '#825ee4' }}>
                <GroupIcon />
              </Avatar>
            </StatsHeader>
            <TrendIndicator positive={true}>
              <ArrowUpwardIcon fontSize="small" sx={{ mr: 0.5 }} />
              <Typography variant="caption">+1 new this month</Typography>
            </TrendIndicator>
          </StatsCard>
        </Grid>
      </Grid>

      {/* Recent Activity and Upcoming Deadlines */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <SectionCard>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Recent Activity
            </Typography>
            <List sx={{ pt: 0 }}>
              {recentActivity && recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <ActivityItem key={activity.id}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: alpha('#5e72e4', 0.1), color: '#5e72e4', width: 36, height: 36 }}>
                        <AssignmentRoundedIcon fontSize="small" />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={activity.title || activity.description}
                      secondary={activity.updatedAt ? new Date(activity.updatedAt).toLocaleString() : 'Recently'}
                      primaryTypographyProps={{
                        fontWeight: 500,
                        variant: 'body2',
                      }}
                      secondaryTypographyProps={{
                        variant: 'caption',
                        color: 'text.secondary'
                      }}
                    />
                  </ActivityItem>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                  No recent activity found
                </Typography>
              )}
            </List>
          </SectionCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <SectionCard>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Upcoming Deadlines
            </Typography>
            <List sx={{ pt: 0 }}>
              {upcomingDeadlines && upcomingDeadlines.length > 0 ? (
                upcomingDeadlines.map((task) => (
                  <DeadlineItem key={task.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PriorityDot color={getPriorityColor(task.priority)} />
                      <Typography variant="body2" fontWeight={500}>{task.title}</Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                    </Typography>
                  </DeadlineItem>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                  No upcoming deadlines found
                </Typography>
              )}
            </List>
          </SectionCard>
        </Grid>
      </Grid>
      
      {/* Quick Access Buttons (Footer) */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Quick Access
        </Typography>
        <Grid container spacing={2}>
          <Grid item>
            <Button variant="contained" 
              sx={{ 
                bgcolor: '#5e72e4', 
                '&:hover': { bgcolor: '#4e5fcb' } 
              }} 
              startIcon={<ViewKanbanRoundedIcon />} 
              href="/admin/tasks"
            >
              Manage Tasks
            </Button>
          </Grid>
          <Grid item>
            <Button variant="contained" 
              sx={{ 
                bgcolor: '#825ee4', 
                '&:hover': { bgcolor: '#7150d8' } 
              }} 
              startIcon={<GroupIcon />} 
              href="/admin/users"
            >
              Manage Users
            </Button>
          </Grid>
          <Grid item>
            <Button variant="outlined" 
              sx={{ 
                color: '#5e72e4', 
                borderColor: '#5e72e4',
                '&:hover': { borderColor: '#4e5fcb', bgcolor: 'rgba(94, 114, 228, 0.04)' } 
              }} 
              startIcon={<AnalyticsIcon />} 
              href="/admin/analytics"
            >
              View Analytics
            </Button>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
};

export default AdminDashboard;
