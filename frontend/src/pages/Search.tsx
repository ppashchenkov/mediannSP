import React from 'react';
import { Container, Typography, Box, Toolbar } from '@mui/material';
import Navbar from '../components/common/Navbar';

const drawerWidth = 240;

const Search: React.FC = () => {
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
            Поиск
          </Typography>
          <Typography variant="body1" align="center">
            Страница поиска устройств и комплектующих
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Search;