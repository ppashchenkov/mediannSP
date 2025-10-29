import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const Settings: React.FC = () => {
  return (
    <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
      <Container maxWidth="lg">
        <Typography component="h1" variant="h4" align="center" gutterBottom>
          Настройки
        </Typography>
        <Typography variant="body1" align="center">
          Страница настроек приложения
        </Typography>
      </Container>
    </Box>
  );
};

export default Settings;