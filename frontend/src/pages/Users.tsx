import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Toolbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import Navbar from '../components/common/Navbar';
import api from '../services/api';

const drawerWidth = 240;

interface User {
  id: number;
  username: string;
  email: string;
  role_id: number;
  role_name: string;
  created_at: string;
  updated_at: string;
}

interface Role {
  id: number;
  name: string;
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [roleId, setRoleId] = useState<number>(1);
  const [password, setPassword] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<{ id: number; username: string; email: string; role_id: number; role_name: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user info
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Требуется аутентификация');
          return;
        }
        
        // Get users list
        const usersResponse = await api.get('/users');
        setUsers(usersResponse.data.users);
        
        // Get current user from token
        try {
          const tokenPayload = JSON.parse(atob(token.split('.')[1]));
          const currentUserId = tokenPayload.userId;
          
          // Find current user in the users list
          const user = usersResponse.data.users.find((u: User) => u.id === currentUserId);
          if (user) {
            setCurrentUser({
              id: user.id,
              username: user.username,
              email: user.email,
              role_id: user.role_id,
              role_name: user.role_name
            });
          }
        } catch (decodeErr) {
          console.error('Error decoding token:', decodeErr);
        }
        
        try {
          const rolesResponse = await api.get('/roles');
          setRoles(rolesResponse.data.roles);
        } catch (rolesErr) {
          console.error('Error fetching roles:', rolesErr);
          // Continue without roles - user management will still work
        }
      } catch (err) {
        setError('Ошибка при загрузке пользователей');
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setUsername(user.username);
    setEmail(user.email);
    setRoleId(user.role_id);
    setPassword('');
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!selectedUser) return;
    
    try {
      const userData: { username?: string; email?: string; role_id?: number; password?: string } = {};
      
      if (username) userData.username = username;
      if (email) userData.email = email;
      if (roleId) userData.role_id = roleId;
      if (password) userData.password = password;
      
      const response = await api.put(`/users/${selectedUser.id}`, userData);
      
      // Update the user in the local state
      setUsers(users.map(u => u.id === selectedUser.id ? { ...u, ...response.data } : u));
      
      setEditDialogOpen(false);
      setSelectedUser(null);
    } catch (err) {
      setError('Ошибка при обновлении пользователя');
      console.error('Error updating user:', err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;
    
    try {
      await api.delete(`/users/${selectedUser.id}`);
      
      // Remove the user from the local state
      setUsers(users.filter(u => u.id !== selectedUser.id));
      
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    } catch (err) {
      setError('Ошибка при удалении пользователя');
      console.error('Error deleting user:', err);
    }
  };

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
          <Typography variant="body1" align="center" gutterBottom>
            Страница управления пользователями
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" sx={{ mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="users table">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Имя пользователя</TableCell>
                    <TableCell>Электронная почта</TableCell>
                    <TableCell>Роль</TableCell>
                    <TableCell>Дата создания</TableCell>
                    <TableCell>Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow
                      key={user.id}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        {user.id}
                      </TableCell>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role_name}</TableCell>
                      <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => handleEditClick(user)}
                        >
                          <EditIcon />
                        </IconButton>
                        {currentUser && currentUser.id !== user.id && (
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => handleDeleteClick(user)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Container>
        
        {/* Edit User Dialog */}
        <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
          <DialogTitle>Редактировать пользователя</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Имя пользователя"
              fullWidth
              variant="outlined"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              margin="dense"
              label="Электронная почта"
              fullWidth
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <FormControl fullWidth margin="dense">
              <InputLabel>Роль</InputLabel>
              <Select
                value={roleId}
                label="Роль"
                onChange={(e) => setRoleId(Number(e.target.value))}
              >
                {roles.map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    {role.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              margin="dense"
              label="Пароль (оставьте пустым, чтобы не изменять)"
              type="password"
              fullWidth
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>Отмена</Button>
            <Button onClick={handleEditSubmit}>Сохранить</Button>
          </DialogActions>
        </Dialog>
        
        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Подтверждение удаления</DialogTitle>
          <DialogContent>
            <Typography>
              Вы уверены, что хотите удалить пользователя {selectedUser?.username}?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Отмена</Button>
            <Button onClick={handleDeleteConfirm} color="error">Удалить</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default Users;