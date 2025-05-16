import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminNotifications from "./pages/AdminNotifications";
import KanbanBoard from "./pages/KanbanBoard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import EmployeeKanban from "./pages/EmployeeKanban";
import EmployeeTaskDetail from "./pages/EmployeeTaskDetail";
import EmployeeNotifications from "./pages/EmployeeNotifications";
import authService from "./services/auth";

function PrivateRoute({ children }) {
  const token = authService.getToken();
  if (!token) return <Navigate to="/auth" />;
  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/user"
          element={
            <PrivateRoute>
              <UserDashboard />
            </PrivateRoute>
          }
        />
        {/* Nouvelle route employé */}
        <Route
          path="/employee"
          element={
            <PrivateRoute>
              <EmployeeDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/employee/tasks"
          element={
            <PrivateRoute>
              <EmployeeKanban />
            </PrivateRoute>
          }
        />
        <Route
          path="/employee/task/:id"
          element={
            <PrivateRoute>
              <EmployeeTaskDetail />
            </PrivateRoute>
          }
        />
        {/* Redirection pour compatibilité ancienne URL */}
        <Route path="/user/tasks" element={<Navigate to="/employee/tasks" replace />} />
        <Route
          path="/employee/notifications"
          element={
            <PrivateRoute>
              <EmployeeNotifications />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/notifications"
          element={
            <PrivateRoute>
              <AdminNotifications />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <PrivateRoute>
              <AdminUsers />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/tasks"
          element={
            <PrivateRoute>
              <KanbanBoard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <PrivateRoute>
              <AdminAnalytics />
            </PrivateRoute>
          }
        />
        <Route path="/" element={<Navigate to="/auth" />} />
      </Routes>
    </Router>
  );
}

export default App;
