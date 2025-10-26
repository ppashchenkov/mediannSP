import React from 'react';
import { Container, Typography, Box, Toolbar } from '@mui/material';
import Navbar from '../components/common/Navbar.tsx';

const drawerWidth = 240;

const Users: React.FC = () => {
  return (
    <Box sx={{ display: 'flex' }}>
      <Navbar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` }
        }}
      >
        <Toolbar />
        <Container maxWidth="lg">
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            Пользователи
          </Typography>
          <Typography variant="body1" align="center">
            Страница управления пользователями
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Users;