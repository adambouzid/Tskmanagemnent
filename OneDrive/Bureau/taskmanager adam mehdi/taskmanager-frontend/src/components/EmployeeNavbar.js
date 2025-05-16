import React from "react";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AssignmentIcon from "@mui/icons-material/Assignment";
import NotificationsIcon from "@mui/icons-material/Notifications";
import DashboardLayout from "./DashboardLayout";

const navItems = [
  { label: "Dashboard", path: "/employee", icon: <DashboardIcon /> },
  { label: "Mes tâches", path: "/employee/tasks", icon: <AssignmentIcon /> },
  { label: "Notifications", path: "/employee/notifications", icon: <NotificationsIcon /> },
];

export default function EmployeeNavbar({ children }) {
  return (
    <DashboardLayout navItems={navItems}>
      {children}
    </DashboardLayout>
  );
}
