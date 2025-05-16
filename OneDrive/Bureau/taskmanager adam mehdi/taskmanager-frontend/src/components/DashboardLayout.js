import React from "react";
import { styled, useTheme, alpha } from "@mui/material/styles";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import CssBaseline from "@mui/material/CssBaseline";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import SpaceDashboardRoundedIcon from "@mui/icons-material/SpaceDashboardRounded";
import ViewKanbanRoundedIcon from "@mui/icons-material/ViewKanbanRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import Box from "@mui/material/Box";
import authService from "../services/auth";
import { useNavigate } from "react-router-dom";
import NotificationBell from "./NotificationBell";

const drawerWidth = 240;

// Custom color palette based on the auth page gradient
const customColors = {
  gradientLight: '#5e72e4',
  gradientDark: '#825ee4',
  sidebar: '#ffffff',
  sidebarText: '#444',
  cardBg: '#ffffff',
};

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
  '& .MuiListItemText-root': {
    opacity: 1,
    visibility: 'visible',
    display: 'block'
  },
  '& .MuiListItemText-primary': {
    opacity: 1,
    visibility: 'visible',
    display: 'block'
  }
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `60px`,
  '& .MuiListItemText-root': {
    opacity: 0,
    visibility: 'hidden',
    display: 'none'
  },
  '& .MuiListItemText-primary': {
    opacity: 0,
    visibility: 'hidden',
    display: 'none'
  }
});

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== "open" })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: "nowrap",
    boxSizing: "border-box",
    ...(open && openedMixin(theme)),
    ...(!open && closedMixin(theme)),
    '& .MuiDrawer-paper': {
      borderRight: 'none',
      background: customColors.sidebar,
      boxShadow: '0 0 20px rgba(0,0,0,0.05)',
    },
    // Ensure all text is visible
    '& .MuiTypography-root': {
      position: 'relative',
      zIndex: 5,
    },
    // Remove any potential overlays
    '&::before': {
      display: 'none',
    },
    '&::after': {
      display: 'none',
    },
  })
);

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(
  ({ theme, open }) => ({
    zIndex: theme.zIndex.drawer - 1,
    background: `linear-gradient(135deg, ${customColors.gradientLight} 0%, ${customColors.gradientDark} 100%)`,
    boxShadow: '0 4px 20px 0 rgba(0,0,0,0.1)',
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
      marginLeft: drawerWidth,
      width: `calc(100% - ${drawerWidth}px)`,
      transition: theme.transitions.create(["width", "margin"], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    }),
    ...(!open && {
      marginLeft: '60px',
      width: `calc(100% - 60px)`,
      transition: theme.transitions.create(["width", "margin"], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    }),
  })
);

export default function DashboardLayout({ children }) {
  // Define navigation items internally to avoid duplication
  const adminNavItems = [
    { label: "Dashboard", path: "/admin", icon: <SpaceDashboardRoundedIcon /> },
    { label: "Kanban Board", path: "/admin/tasks", icon: <ViewKanbanRoundedIcon /> },
    { label: "User Management", path: "/admin/users", icon: <PeopleAltRoundedIcon /> },
    { label: "Analytics", path: "/admin/analytics", icon: <InsightsRoundedIcon /> }
  ];
  
  const employeeNavItems = [
    { label: "Dashboard", path: "/employee", icon: <SpaceDashboardRoundedIcon /> },
    { label: "My Tasks", path: "/employee/tasks", icon: <ViewKanbanRoundedIcon /> },
    { label: "Notifications", path: "/employee/notifications", icon: <LogoutRoundedIcon /> }
  ];
  
  // Use appropriate nav items based on user role
  const navItems = authService.getRole() === 'ADMIN' ? adminNavItems : employeeNavItems;
  const [open, setOpen] = React.useState(true);
  const navigate = useNavigate();
  const role = authService.getRole();
  const theme = useTheme();

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/auth');
  };

  return (
    <Box sx={{ position: "relative", height: "100vh", overflow: "hidden" }}>
      <CssBaseline />
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{
          width: open ? `calc(100% - ${drawerWidth}px)` : 'calc(100% - 60px)',
          left: open ? drawerWidth : 60,
          right: 0,
          transition: 'all 0.3s ease',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          background: 'linear-gradient(90deg, rgba(94,114,228,0.95) 0%, rgba(130,94,228,0.95) 100%)',
          zIndex: 1000,
        }}
      >
        <Toolbar sx={{ height: 70 }}>
          <IconButton
            color="inherit"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            onClick={handleDrawerToggle}
            edge="start"
            sx={{ 
              mr: 2,
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(5px)',
              borderRadius: '10px',
              p: 1,
              '&:hover': {
                background: 'rgba(255,255,255,0.2)'
              }
            }}
          >
            {open ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography 
              variant="h5" 
              noWrap 
              component="div" 
              sx={{ 
                fontWeight: 700,
                color: '#ffffff',
                letterSpacing: '0.5px',
                mr: 1
              }}
            >
              TaskFlow
            </Typography>

            <Box 
              component="span" 
              sx={{
                background: 'rgba(255,255,255,0.15)',
                color: '#fff',
                borderRadius: '8px',
                py: 0.5,
                px: 1.5,
                fontSize: 13,
                fontWeight: 600,
                backdropFilter: 'blur(5px)',
                ml: 1,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {role}
            </Box>
          </Box>

          <Box sx={{ flexGrow: 1 }} />
          
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 0.5
          }}>
            <NotificationBell />
            <Box 
              sx={{ 
                ml: 2, 
                p: 0.5, 
                borderRadius: '50%', 
                bgcolor: 'rgba(255,255,255,0.1)',
                width: 42,
                height: 42,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 600,
                textTransform: 'uppercase',
                fontSize: 16,
                boxShadow: '0 0 10px rgba(0,0,0,0.1)'
              }}
            >
              {role === 'ADMIN' ? 'AD' : 'EM'}
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer 
        variant="permanent" 
        open={open}
        sx={{
          width: open ? drawerWidth : 60,
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 1200,
          transition: 'width 0.3s ease',
          '& .MuiDrawer-paper': {
            position: 'static',
            width: 'inherit',
            height: '100%',
            borderRight: 'none',
            background: customColors.sidebar,
            boxShadow: '0 0 20px rgba(0,0,0,0.05)',
            transition: 'width 0.3s ease',
          }
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            pt: '70px',
          }}
        >
          {/* Main Navigation */}
          <List sx={{ px: 2 }}>
            <Typography 
              variant="overline" 
              sx={{ 
                opacity: open ? 1 : 0, 
                pl: 1.5, 
                pt: 2, 
                pb: 0.5, 
                fontSize: '11px', 
                fontWeight: 700, 
                color: 'text.secondary',
                letterSpacing: '1px',
                userSelect: 'none'
              }}
            >
              General
            </Typography>
            
            {navItems.map((item, index) => {
              // Check if current path starts with item path
              const isActive = window.location.pathname === item.path || 
                (item.path !== '/admin' && item.path !== '/employee' && window.location.pathname.startsWith(item.path));

              return (
                <Box
                  key={item.label}
                  sx={{
                    mb: 0.5,
                    display: 'flex',
                    width: '100%'
                  }}
                >
                  <Box
                    onClick={() => navigate(item.path)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      borderRadius: '10px',
                      width: '100%',
                      height: 48,
                      px: 2.5,
                      cursor: 'pointer',
                      background: isActive 
                        ? `linear-gradient(90deg, ${alpha(customColors.gradientLight, 0.08)} 0%, ${alpha(customColors.gradientDark, 0.08)} 100%)`
                        : 'transparent',
                      '&:hover': {
                        background: `linear-gradient(90deg, ${alpha(customColors.gradientLight, 0.05)} 0%, ${alpha(customColors.gradientDark, 0.05)} 100%)`
                      }
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isActive ? customColors.gradientDark : 'inherit',
                        mr: open ? 3 : 'auto',
                      }}
                    >
                      {item.icon}
                    </Box>
                    
                    {open && (
                      <Box 
                        component="span"
                        sx={{
                          fontWeight: isActive ? 700 : 600,
                          color: isActive ? customColors.gradientDark : '#333',
                          flexGrow: 1,
                          userSelect: 'none',
                          fontSize: '0.95rem',
                          textShadow: '0px 0px 1px rgba(0,0,0,0.1)',
                          display: 'inline-block',
                          position: 'relative',
                          zIndex: 999
                        }}
                      >
                        {item.label}
                      </Box>
                    )}
                  </Box>
                </Box>
              );
            })}
          </List>

          {/* Logout at bottom */}
          <Box sx={{ mt: 'auto', mb: 2, px: 2 }}>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ width: '100%' }}>
              <Box 
                onClick={handleLogout}
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '10px',
                  width: '100%',
                  height: 48,
                  px: 2.5,
                  cursor: 'pointer',
                  '&:hover': {
                    color: '#f44336',
                    background: 'rgba(244,67,54,0.08)'
                  }
                }}
              >
                <Box sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: open ? 3 : "auto", 
                  color: 'inherit' 
                }}>
                  <LogoutRoundedIcon />
                </Box>
                
                {open && (
                  <Box
                    component="span"
                    sx={{
                      fontWeight: 700,
                      color: '#333',
                      flexGrow: 1,
                      userSelect: 'none',
                      fontSize: '0.95rem',
                      textShadow: '0px 0px 1px rgba(0,0,0,0.1)',
                      display: 'inline-block',
                      position: 'relative',
                      zIndex: 999
                    }}
                  >
                    Logout
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </Drawer>
      <Box component="main" sx={{ 
        p: 3, 
        pt: '90px',
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        left: open ? drawerWidth : 60,
        background: 'linear-gradient(135deg, rgba(249,250,251,1) 0%, rgba(243,244,246,1) 100%)',
        overflow: 'auto',
        transition: 'left 0.3s ease',
      }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
