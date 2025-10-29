import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Devices from './pages/Devices';
import Components from './pages/Components';
import Users from './pages/Users';
import Search from './pages/Search';
import Settings from './pages/Settings';
import Contracts from './pages/Contracts';
import Navbar from './components/common/Navbar';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Toolbar
} from '@mui/material';
import {
  Computer as DeviceIcon,
  Settings as SettingsIcon,
  Search as SearchIcon,
 People as UsersIcon,
  Storage as ComponentsIcon,
  Assignment as ContractIcon
} from '@mui/icons-material';
import './App.css';

const drawerWidth = '15%';

// Create a theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#e57373',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

// ProtectedRoute component to handle authentication
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

// Navigation component for the sidebar
const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleNavigation = (path: string) => {
    navigate(path);
  };
  
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: 'border-box',
          height: '90vh',
          top: '10%',
          position: 'absolute'
        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto' }}>
        <List>
          <ListItem disablePadding>
            <ListItemButton
              selected={location.pathname === '/contracts'}
              onClick={() => handleNavigation('/contracts')}
            >
              <ListItemIcon>
                <ContractIcon />
              </ListItemIcon>
              <ListItemText primary="Контракты" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton
              selected={location.pathname === '/devices'}
              onClick={() => handleNavigation('/devices')}
            >
              <ListItemIcon>
                <DeviceIcon />
              </ListItemIcon>
              <ListItemText primary="Устройства" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton
              selected={location.pathname === '/components'}
              onClick={() => handleNavigation('/components')}
            >
              <ListItemIcon>
                <ComponentsIcon />
              </ListItemIcon>
              <ListItemText primary="Комплектующие" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton
              selected={location.pathname === '/users'}
              onClick={() => handleNavigation('/users')}
            >
              <ListItemIcon>
                <UsersIcon />
              </ListItemIcon>
              <ListItemText primary="Пользователи" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton
              selected={location.pathname === '/search'}
              onClick={() => handleNavigation('/search')}
            >
              <ListItemIcon>
                <SearchIcon />
              </ListItemIcon>
              <ListItemText primary="Поиск" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton
              selected={location.pathname === '/settings'}
              onClick={() => handleNavigation('/settings')}
            >
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary="Настройки" />
            </ListItemButton>
          </ListItem>
        </List>
        <Divider />
      </Box>
    </Drawer>
  );
};

// Layout component for authenticated users
const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Navbar - 10% height, full width */}
      <Navbar />
      {/* Navigation sidebar */}
      <Navigation />
      {/* Main content area - under navbar and to the right of drawer */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: '85%',
          height: '90vh',
          top: '10%',
          position: 'absolute',
          left: '15%'
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

function App() {
 return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <div className="App">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="*"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Routes>
                        <Route path="/" element={<Devices />} />
                        <Route path="/contracts" element={<Contracts />} />
                        <Route path="/devices" element={<Devices />} />
                        <Route path="/devices/*" element={<Devices />} />
                        <Route path="/components" element={<Components />} />
                        <Route path="/users" element={<Users />} />
                        <Route path="/search" element={<Search />} />
                        <Route path="/settings" element={<Settings />} />
                      </Routes>
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;