import React from 'react';
import { Card, CardContent, Typography, Chip } from '@mui/material';

interface ComponentCardProps {
  name: string;
  type: string;
  serialNumber: string;
  status: string;
}

export const ComponentCard: React.FC<ComponentCardProps> = ({ 
  name, 
  type, 
  serialNumber, 
  status 
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'default';
      case 'in_repair':
        return 'warning';
      case 'disposed':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Card sx={{ minWidth: 275, maxWidth: 300 }}>
      <CardContent>
        <Typography variant="h6" component="div">
          {name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Тип: {type}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Серийный номер: {serialNumber}
        </Typography>
        <Chip 
          label={status === 'in_repair' ? 'В ремонте' : 
                 status === 'disposed' ? 'Утилизировано' : 
                 status === 'active' ? 'Активно' : 'Неактивно'}
          color={getStatusColor(status) as any}
          size="small"
        />
      </CardContent>
    </Card>
  );
};