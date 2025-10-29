import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Typography,
  TablePagination,
  InputAdornment
} from '@mui/material';
import { Add as AddIcon, Search as SearchIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { contractAPI } from '../services/api';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Link } from '@mui/material';

interface Contract {
  id: number;
  contract_number: string;
  contract_date: string;
  user_id: number;
  user_name: string;
  updated_at: string;
  created_at: string;
}

const Contracts: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentContract, setCurrentContract] = useState<Contract | null>(null);
  const [newContract, setNewContract] = useState({
    contract_number: '',
    contract_date: ''
  });
  const { user } = useAuth();

  const fetchContracts = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await contractAPI.getContracts(page + 1, rowsPerPage, search);
      setContracts(response.data.contracts);
      
      // Если в URL есть параметр contract_id, переходим к этому контракту
      const contractIdFromUrl = searchParams.get('contract_id');
      if (contractIdFromUrl) {
        const contractId = parseInt(contractIdFromUrl, 10);
        if (!isNaN(contractId)) {
          // Прокрутка к элементу с указанным контрактом
          setTimeout(() => {
            const element = document.getElementById(`contract-${contractId}`);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth' });
              element.style.backgroundColor = '#e3f2fd'; // Подсветка элемента
              setTimeout(() => {
                if (element) {
                  element.style.backgroundColor = '';
                }
              }, 2000);
            }
          }, 100);
        }
      }
    } catch (error) {
      console.error('Error fetching contracts:', error);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search, searchParams]);

  useEffect(() => {
    fetchContracts();
 }, [fetchContracts, searchParams]);

  const handleAddContract = async () => {
    try {
      // Добавляем user_id из текущего пользователя
      const contractData = {
        ...newContract,
        user_id: user?.id
      };
      await contractAPI.createContract(contractData);
      setOpenAddDialog(false);
      setNewContract({ contract_number: '', contract_date: '' });
      fetchContracts();
    } catch (error) {
      console.error('Error adding contract:', error);
    }
 };

  const handleUpdateContract = async () => {
    if (!currentContract) return;
    
    try {
      await contractAPI.updateContract(currentContract.id, {
        contract_number: currentContract.contract_number,
        contract_date: currentContract.contract_date,
        user_id: currentContract.user_id
      });
      setOpenEditDialog(false);
      setCurrentContract(null);
      fetchContracts();
    } catch (error) {
      console.error('Error updating contract:', error);
    }
  };

  const handleDeleteContract = async () => {
    if (!currentContract) return;
    
    try {
      await contractAPI.deleteContract(currentContract.id);
      setOpenDeleteDialog(false);
      setCurrentContract(null);
      fetchContracts();
    } catch (error) {
      console.error('Error deleting contract:', error);
    }
 };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(0); // Reset to first page when searching
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleAddClick = () => {
    setOpenAddDialog(true);
  };

  const handleEditClick = (contract: Contract) => {
    setCurrentContract(contract);
    setOpenEditDialog(true);
  };

  const handleDeleteClick = (contract: Contract) => {
    setCurrentContract(contract);
    setOpenDeleteDialog(true);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2, p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h1">
            Контракты
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddClick}
          >
            Добавить контракт
          </Button>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <TextField
            label="Поиск"
            variant="outlined"
            fullWidth
            value={search}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="contracts table">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Номер контракта</TableCell>
                <TableCell>Дата контракта</TableCell>
                <TableCell>Пользователь</TableCell>
                <TableCell>Дата изменения</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Загрузка...
                  </TableCell>
                </TableRow>
              ) : contracts.length > 0 ? (
                contracts.map((contract) => (
                  <TableRow
                    key={contract.id}
                    id={`contract-${contract.id}`}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {contract.id}
                    </TableCell>
                    <TableCell>
                      <Link
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(`/devices?contract_id=${contract.id}`);
                        }}
                        sx={{ textDecoration: 'none' }}
                      >
                        {contract.contract_number}
                      </Link>
                    </TableCell>
                    <TableCell>{new Date(contract.contract_date).toLocaleDateString()}</TableCell>
                    <TableCell>{contract.user_name}</TableCell>
                    <TableCell>{new Date(contract.updated_at).toLocaleString()}</TableCell>
                    <TableCell>
                      <IconButton 
                        color="primary" 
                        onClick={() => handleEditClick(contract)}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        onClick={() => handleDeleteClick(contract)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Нет данных
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={-1} // We don't have total count from API response
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Add Contract Dialog */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)}>
        <DialogTitle>Добавить контракт</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Пожалуйста, введите информацию о новом контракте.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Номер контракта"
            fullWidth
            variant="outlined"
            value={newContract.contract_number}
            onChange={(e) => setNewContract({...newContract, contract_number: e.target.value})}
            sx={{ mt: 2 }}
          />
          <TextField
            margin="dense"
            label="Дата контракта"
            type="date"
            fullWidth
            variant="outlined"
            value={newContract.contract_date}
            onChange={(e) => setNewContract({...newContract, contract_date: e.target.value})}
            InputLabelProps={{
              shrink: true,
            }}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Отмена</Button>
          <Button onClick={handleAddContract}>Создать</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Contract Dialog */}
      {currentContract && (
        <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
          <DialogTitle>Редактировать контракт</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Пожалуйста, измените информацию о контракте.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              label="Номер контракта"
              fullWidth
              variant="outlined"
              value={currentContract.contract_number || ''}
              onChange={(e) => setCurrentContract({...currentContract, contract_number: e.target.value})}
              sx={{ mt: 2 }}
            />
            <TextField
              margin="dense"
              label="Дата контракта"
              type="date"
              fullWidth
              variant="outlined"
              value={currentContract.contract_date.split('T')[0]}
              onChange={(e) => setCurrentContract({...currentContract, contract_date: e.target.value})}
              InputLabelProps={{
                shrink: true,
              }}
              sx={{ mt: 2 }}
            />
            <TextField
              margin="dense"
              label="ID пользователя"
              type="number"
              fullWidth
              variant="outlined"
              value={currentContract.user_id}
              onChange={(e) => setCurrentContract({...currentContract, user_id: parseInt(e.target.value) || 1})}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEditDialog(false)}>Отмена</Button>
            <Button onClick={handleUpdateContract}>Сохранить</Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Delete Contract Dialog */}
      {currentContract && (
        <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
          <DialogTitle>Удалить контракт</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Вы уверены, что хотите удалить контракт №{currentContract.contract_number}?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDeleteDialog(false)}>Отмена</Button>
            <Button onClick={handleDeleteContract} color="error">Удалить</Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default Contracts;