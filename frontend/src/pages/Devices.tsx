import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton
} from '@mui/material';
import { contractAPI, deviceAPI, deviceTypeAPI } from '../services/api';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Link } from '@mui/material';

interface Device {
  id: number;
  name: string;
  device_type_name: string;
  serial_number: string;
  status: string;
  contract_number?: string;
  device_type_id?: number;
  manufacturer?: string;
  model?: string;
  contract_id?: number;
  updated_by_username?: string;
}

interface DeviceType {
  id: number;
  name: string;
}

interface Contract {
  id: number;
  contract_number: string;
  contract_date: string;
  user_name: string;
}

const Devices: React.FC = () => {
  const navigate = useNavigate();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [showAddDialog, setShowAddDialog] = useState<boolean>(false);
  
  // State for new device form
  const [newDevice, setNewDevice] = useState({
    name: '',
    device_type_id: '',
    serial_number: '',
    manufacturer: '',
    model: '',
    status: 'active',
    contract_id: ''  // Add contract_id to the form state
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showEditDialog, setShowEditDialog] = useState<boolean>(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [currentDevice, setCurrentDevice] = useState<Device | null>(null);
  const [editDevice, setEditDevice] = useState({
    name: '',
    device_type_id: '',
    serial_number: '',
    manufacturer: '',
    model: '',
   status: 'active',
    contract_id: ''
  });
  const [deviceToDelete, setDeviceToDelete] = useState<number | null>(null);
  const [searchParams] = useSearchParams();

  const fetchContracts = React.useCallback(async () => {
     try {
       const response = await contractAPI.getContracts(1, 100); // Get all contracts
       setContracts(response.data.contracts);
     } catch (err) {
       console.error('Error fetching contracts:', err);
     }
   }, []);
 
   const fetchDevices = React.useCallback(async () => {
     try {
       setLoading(true);
       // Get contract_id from URL parameters
       const contractId = searchParams.get('contract_id');
       
       // If contractId is present, filter devices by contract
       let response;
       if (contractId) {
         // Если contractId существует, вызываем с 7-ю параметрами
         const contractIdNum = parseInt(contractId, 10);
         response = await (deviceAPI.getDevices as any)(1, 100, '', null, null, null, contractIdNum);
       } else {
         // Если contractId не существует, вызываем с 6-ю параметрами (без последнего)
         response = await deviceAPI.getDevices(1, 100, '', null, null, null);
       }
       setDevices(response.data.devices || []);
       setError(null);
     } catch (err) {
       console.error('Error fetching devices:', err);
       setError('Ошибка при загрузке устройств из базы данных');
     } finally {
       setLoading(false);
     }
   }, [searchParams]);

  const fetchDeviceTypes = React.useCallback(async () => {
    try {
      const response = await deviceTypeAPI.getDeviceTypes();
      setDeviceTypes(response.data.device_types || []);
    } catch (err) {
      console.error('Error fetching device types:', err);
    }
  }, []);

  const handleAddDevice = async () => {
    // Validate form
    const errors: Record<string, string> = {};
    if (!newDevice.name.trim()) {
      errors.name = 'Название устройства обязательно';
    }
    if (!newDevice.device_type_id) {
      errors.device_type_id = 'Тип устройства обязателен';
    }
    if (!newDevice.contract_id) {
      errors.contract_id = 'Контракт обязателен';
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      // Convert device_type_id and contract_id to number before sending to backend
      const deviceData = {
        ...newDevice,
        device_type_id: parseInt(newDevice.device_type_id),
        contract_id: parseInt(newDevice.contract_id)
      };
      await deviceAPI.createDevice(deviceData);
      // Reset form
      setNewDevice({
        name: '',
        device_type_id: '',
        serial_number: '',
        manufacturer: '',
        model: '',
        status: 'active',
        contract_id: ''
      });
      setFormErrors({});
      setShowAddDialog(false);
      // Refresh device list
      fetchDevices();
    } catch (err) {
      console.error('Error adding device:', err);
      setError('Ошибка при добавлении устройства');
    }
  };

  const handleCloseDialog = () => {
    setShowAddDialog(false);
    setNewDevice({
      name: '',
      device_type_id: '',
      serial_number: '',
      manufacturer: '',
      model: '',
      status: 'active',
      contract_id: ''
    });
    setFormErrors({});
  };

  const handleEditDevice = async () => {
    if (!currentDevice) return;
    
    try {
      // Validate form
      const errors: Record<string, string> = {};
      if (!editDevice.name.trim()) {
        errors.name = 'Название устройства обязательно';
      }
      if (!editDevice.device_type_id) {
        errors.device_type_id = 'Тип устройства обязателен';
      }
      if (!editDevice.contract_id) {
        errors.contract_id = 'Контракт обязателен';
      }
      
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }

      // Convert device_type_id and contract_id to number before sending to backend
      const deviceData = {
        ...editDevice,
        device_type_id: parseInt(editDevice.device_type_id),
        contract_id: parseInt(editDevice.contract_id)
      };
      
      await deviceAPI.updateDevice(currentDevice.id, deviceData);
      
      // Reset form
      setEditDevice({
        name: '',
        device_type_id: '',
        serial_number: '',
        manufacturer: '',
        model: '',
        status: 'active',
        contract_id: ''
      });
      setFormErrors({});
      setShowEditDialog(false);
      
      // Refresh device list
      fetchDevices();
    } catch (err) {
      console.error('Error updating device:', err);
      setError('Ошибка при обновлении устройства');
    }
  };

  const handleDeleteDevice = async () => {
    if (deviceToDelete === null) return;
    
    try {
      await deviceAPI.deleteDevice(deviceToDelete);
      setDeviceToDelete(null);
      setShowDeleteDialog(false);
      // Refresh device list
      fetchDevices();
    } catch (err) {
      console.error('Error deleting device:', err);
      setError('Ошибка при удалении устройства');
    }
  };

  const openEditDialog = async (device: Device) => {
    try {
      // Fetch full device details to populate the edit form
      const response = await deviceAPI.getDevice(device.id);
      const fullDevice = response.data;
      
      setCurrentDevice(device);
      setEditDevice({
        name: fullDevice.name,
        device_type_id: fullDevice.device_type_id.toString(),
        serial_number: fullDevice.serial_number || '',
        manufacturer: fullDevice.manufacturer || '',
        model: fullDevice.model || '',
        status: fullDevice.status,
        contract_id: fullDevice.contract_id ? fullDevice.contract_id.toString() : ''
      });
      setShowEditDialog(true);
    } catch (error) {
      console.error('Error fetching device details:', error);
      setError('Ошибка при загрузке данных устройства');
    }
  };

  const openDeleteDialog = (id: number) => {
    setDeviceToDelete(id);
    setShowDeleteDialog(true);
  };

  useEffect(() => {
    fetchDevices();
    fetchDeviceTypes();
    fetchContracts();
  }, [searchParams, fetchDevices, fetchDeviceTypes, fetchContracts]);

  return (
    <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography component="h1" variant="h4" align="left" gutterBottom>
            Устройства
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => setShowAddDialog(true)}
          >
            Добавить устройство
          </Button>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : devices.length === 0 ? (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="h6" color="textSecondary">
              В базе данных пока нет устройств
            </Typography>
            <Button 
              variant="outlined" 
              color="primary" 
              sx={{ mt: 2 }}
              onClick={() => setShowAddDialog(true)}
            >
              Добавить первое устройство
            </Button>
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650, '& .MuiTableCell-root': { borderRight: '1px solid #e0e0e0' } }} aria-label="devices table" size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Название</TableCell>
                  <TableCell>Тип</TableCell>
                  <TableCell>Контракт</TableCell>
                  <TableCell>Серийный номер</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell>Пользователь</TableCell>
                  <TableCell>Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {devices.map((device) => (
                  <TableRow
                    key={device.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {device.name}
                    </TableCell>
                    <TableCell>{device.device_type_name}</TableCell>
                    <TableCell>
                      {device.contract_id ? (
                        <Link
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            navigate(`/contracts?contract_id=${device.contract_id}`);
                          }}
                          sx={{ textDecoration: 'none' }}
                        >
                          {device.contract_number || 'N/A'}
                        </Link>
                      ) : (
                        device.contract_number || 'N/A'
                      )}
                    </TableCell>
                    <TableCell>{device.serial_number || 'N/A'}</TableCell>
                    <TableCell>
                      <span style={{
                        color: device.status === 'active' ? 'green' :
                               device.status === 'in_repair' ? 'orange' :
                               device.status === 'disposed' ? 'red' :
                               'black'
                      }}>
                        {device.status === 'active' ? 'Активно' :
                         device.status === 'in_repair' ? 'В ремонте' :
                         device.status === 'disposed' ? 'Утилизировано' :
                         device.status === 'inactive' ? 'Неактивно' : device.status}
                      </span>
                    </TableCell>
                    <TableCell>{device.updated_by_username || 'N/A'}</TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        size="small"
                        sx={{ mr: 1 }}
                        onClick={() => openEditDialog(device)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => openDeleteDialog(device.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        
        {/* Add Device Dialog */}
        <Dialog open={showAddDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>Добавить новое устройство</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <TextField
                autoFocus
                margin="dense"
                label="Название устройства"
                fullWidth
                variant="outlined"
                value={newDevice.name}
                onChange={(e) => setNewDevice({...newDevice, name: e.target.value})}
                error={!!formErrors.name}
                helperText={formErrors.name}
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth margin="dense" error={!!formErrors.device_type_id} sx={{ mb: 2 }}>
                <InputLabel>Тип устройства</InputLabel>
                <Select
                  value={newDevice.device_type_id}
                  label="Тип устройства"
                  onChange={(e) => setNewDevice({...newDevice, device_type_id: e.target.value as string})}
                >
                  {deviceTypes.map((type) => (
                    <MenuItem key={type.id} value={type.id.toString()}>
                      {type.name}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.device_type_id && (
                  <FormHelperText>{formErrors.device_type_id}</FormHelperText>
                )}
              </FormControl>
              <TextField
                margin="dense"
                label="Серийный номер"
                fullWidth
                variant="outlined"
                value={newDevice.serial_number}
                onChange={(e) => setNewDevice({...newDevice, serial_number: e.target.value})}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="dense"
                label="Производитель"
                fullWidth
                variant="outlined"
                value={newDevice.manufacturer}
                onChange={(e) => setNewDevice({...newDevice, manufacturer: e.target.value})}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="dense"
                label="Модель"
                fullWidth
                variant="outlined"
                value={newDevice.model}
                onChange={(e) => setNewDevice({...newDevice, model: e.target.value})}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="dense"
                label="Местоположение"
                fullWidth
                variant="outlined"
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth margin="dense" error={!!formErrors.contract_id} sx={{ mb: 2 }}>
                <InputLabel>Контракт</InputLabel>
                <Select
                  value={newDevice.contract_id}
                  label="Контракт"
                  onChange={(e) => setNewDevice({...newDevice, contract_id: e.target.value as string})}
                >
                  {contracts.map((contract) => (
                    <MenuItem key={contract.id} value={contract.id.toString()}>
                      {contract.contract_number} ({contract.contract_date})
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.contract_id && (
                  <FormHelperText>{formErrors.contract_id}</FormHelperText>
                )}
              </FormControl>
              <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
                <InputLabel>Статус</InputLabel>
                <Select
                  value={newDevice.status}
                  label="Статус"
                  onChange={(e) => setNewDevice({...newDevice, status: e.target.value as string})}
                >
                  <MenuItem value="active">Активно</MenuItem>
                  <MenuItem value="inactive">Неактивно</MenuItem>
                  <MenuItem value="in_repair">В ремонте</MenuItem>
                  <MenuItem value="disposed">Утилизировано</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Отмена</Button>
            <Button onClick={handleAddDevice}>Добавить</Button>
          </DialogActions>
        </Dialog>
        
        {/* Edit Device Dialog */}
        <Dialog open={showEditDialog} onClose={() => setShowEditDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Редактировать устройство</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <TextField
                autoFocus
                margin="dense"
                label="Название устройства"
                fullWidth
                variant="outlined"
                value={editDevice.name}
                onChange={(e) => setEditDevice({...editDevice, name: e.target.value})}
                error={!!formErrors.name}
                helperText={formErrors.name}
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth margin="dense" error={!!formErrors.device_type_id} sx={{ mb: 2 }}>
                <InputLabel>Тип устройства</InputLabel>
                <Select
                  value={editDevice.device_type_id}
                  label="Тип устройства"
                  onChange={(e) => setEditDevice({...editDevice, device_type_id: e.target.value as string})}
                >
                  {deviceTypes.map((type) => (
                    <MenuItem key={type.id} value={type.id.toString()}>
                      {type.name}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.device_type_id && (
                  <FormHelperText>{formErrors.device_type_id}</FormHelperText>
                )}
              </FormControl>
              <TextField
                margin="dense"
                label="Серийный номер"
                fullWidth
                variant="outlined"
                value={editDevice.serial_number}
                onChange={(e) => setEditDevice({...editDevice, serial_number: e.target.value})}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="dense"
                label="Производитель"
                fullWidth
                variant="outlined"
                value={editDevice.manufacturer}
                onChange={(e) => setEditDevice({...editDevice, manufacturer: e.target.value})}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="dense"
                label="Модель"
                fullWidth
                variant="outlined"
                value={editDevice.model}
                onChange={(e) => setEditDevice({...editDevice, model: e.target.value})}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="dense"
                label="Местоположение"
                fullWidth
                variant="outlined"
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth margin="dense" error={!!formErrors.contract_id} sx={{ mb: 2 }}>
                <InputLabel>Контракт</InputLabel>
                <Select
                  value={editDevice.contract_id}
                  label="Контракт"
                  onChange={(e) => setEditDevice({...editDevice, contract_id: e.target.value as string})}
                >
                  {contracts.map((contract) => (
                    <MenuItem key={contract.id} value={contract.id.toString()}>
                      {contract.contract_number} ({contract.contract_date})
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.contract_id && (
                  <FormHelperText>{formErrors.contract_id}</FormHelperText>
                )}
              </FormControl>
              <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
                <InputLabel>Статус</InputLabel>
                <Select
                  value={editDevice.status}
                  label="Статус"
                  onChange={(e) => setEditDevice({...editDevice, status: e.target.value as string})}
                >
                  <MenuItem value="active">Активно</MenuItem>
                  <MenuItem value="inactive">Неактивно</MenuItem>
                  <MenuItem value="in_repair">В ремонте</MenuItem>
                  <MenuItem value="disposed">Утилизировано</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowEditDialog(false)}>Отмена</Button>
            <Button onClick={handleEditDevice}>Сохранить</Button>
          </DialogActions>
        </Dialog>
        
        {/* Delete Device Dialog */}
        <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
          <DialogTitle>Удалить устройство</DialogTitle>
          <DialogContent>
            <Typography>Вы уверены, что хотите удалить это устройство?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowDeleteDialog(false)}>Отмена</Button>
            <Button onClick={handleDeleteDevice} color="error">Удалить</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Devices;