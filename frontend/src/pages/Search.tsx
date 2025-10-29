import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const Search: React.FC = () => {
  return (
    <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
      <Container maxWidth="lg">
        <Typography component="h1" variant="h4" align="center" gutterBottom>
          Поиск
        </Typography>
        <Typography variant="body1" align="center">
          Страница поиска устройств и комплектующих
        </Typography>
      </Container>
    </Box>
  );
};

export default Search;