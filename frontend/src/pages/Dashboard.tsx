import React from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
 Paper, 
  Box,
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
  Storage as ComponentsIcon
} from '@mui/icons-material';
import { DeviceCard } from '../components/devices/DeviceCard.tsx';
import { ComponentCard } from '../components/components/ComponentCard.tsx';
import Navbar from '../components/common/Navbar.tsx';

const drawerWidth = 240;

const Dashboard: React.FC = () => {
  return (
    <Box sx={{ display: 'flex' }}>
      <Navbar />
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            <ListItem disablePadding>
              <ListItemButton href="/devices">
                <ListItemIcon>
                  <DeviceIcon />
                </ListItemIcon>
                <ListItemText primary="Устройства" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton href="/components">
                <ListItemIcon>
                  <ComponentsIcon />
                </ListItemIcon>
                <ListItemText primary="Комплектующие" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton href="/users">
                <ListItemIcon>
                  <UsersIcon />
                </ListItemIcon>
                <ListItemText primary="Пользователи" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton href="/search">
                <ListItemIcon>
                  <SearchIcon />
                </ListItemIcon>
                <ListItemText primary="Поиск" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton href="/settings">
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
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Container maxWidth="lg">
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            Система учета компьютерной техники
          </Typography>
          
          <Grid container spacing={3}>
            {/* Summary Cards */}
            <Grid item xs={12} md={4}>
              <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6" color="textSecondary">Всего устройств</Typography>
                <Typography variant="h4" color="primary">128</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6" color="textSecondary">Всего комплектующих</Typography>
                <Typography variant="h4" color="primary">512</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6" color="textSecondary">Активных пользователей</Typography>
                <Typography variant="h4" color="primary">24</Typography>
              </Paper>
            </Grid>
            
            {/* Recent Devices */}
            <Grid item xs={12}>
              <Paper elevation={3} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Недавние устройства</Typography>
                <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto' }}>
                  <DeviceCard 
                    name="Сервер Dell R740" 
                    type="Сервер" 
                    serialNumber="SVR-740-001" 
                    status="active" 
                    location="ЦОД-01" 
                  />
                  <DeviceCard 
                    name="Рабочая станция HP Z4" 
                    type="Рабочая станция" 
                    serialNumber="WS-Z4-002" 
                    status="active" 
                    location="Офис-02" 
                  />
                  <DeviceCard 
                    name="Ноутбук Lenovo T14" 
                    type="Ноутбук" 
                    serialNumber="NB-T14-003" 
                    status="in_repair" 
                    location="Офис-03" 
                  />
                </Box>
              </Paper>
            </Grid>
            
            {/* Recent Components */}
            <Grid item xs={12}>
              <Paper elevation={3} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Недавние комплектующие</Typography>
                <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto' }}>
                  <ComponentCard 
                    name="Intel Xeon Gold 6248R" 
                    type="Процессор" 
                    serialNumber="CPU-6248R-001" 
                    status="active" 
                  />
                  <ComponentCard 
                    name="32GB DDR4-3200" 
                    type="Оперативная память" 
                    serialNumber="RAM-32GB-02" 
                    status="active" 
                  />
                  <ComponentCard 
                    name="1TB NVMe SSD" 
                    type="Накопитель" 
                    serialNumber="SSD-1TB-003" 
                    status="active" 
                  />
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Dashboard;