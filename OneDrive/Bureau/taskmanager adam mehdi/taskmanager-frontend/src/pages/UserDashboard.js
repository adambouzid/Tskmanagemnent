import React from "react";
import Typography from "@mui/material/Typography";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AssignmentIcon from "@mui/icons-material/Assignment";
import DashboardLayout from "../components/DashboardLayout";

const navItems = [
  { label: "Dashboard", path: "/user", icon: <DashboardIcon /> },
  { label: "My Tasks", path: "/user/tasks", icon: <AssignmentIcon /> },
  // Add more user features here
];

const UserDashboard = () => (
  <DashboardLayout navItems={navItems}>
    <Typography variant="h4" gutterBottom>User Dashboard</Typography>
    <Typography>Welcome, EMPLOYEE! Here are your tasks and projects.</Typography>
    {/* Add user dashboard widgets/features here */}
  </DashboardLayout>
);

export default UserDashboard;
