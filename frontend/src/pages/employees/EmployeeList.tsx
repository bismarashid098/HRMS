import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Icon } from '@iconify/react';
import api from 'api/axios';
import { useAuth } from 'context/AuthContext';

const EmployeeList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const isAdmin = user?.role === 'Admin';

  const fetchEmployees = () => {
    setLoading(true);
    api
      .get('/employees')
      .then((res) => setEmployees(res.data.employees || res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/employees/${deleteId}`);
      setDeleteId(null);
      fetchEmployees();
    } catch (e: any) {
      console.error(e.response?.data?.message || 'Failed to delete employee');
      setDeleteId(null);
    }
  };

  const filtered = employees.filter(
    (e: any) =>
      e.name?.toLowerCase().includes(search.toLowerCase()) ||
      e.department?.toLowerCase().includes(search.toLowerCase()) ||
      e.employeeId?.toLowerCase().includes(search.toLowerCase()),
  );

  const columns: GridColDef[] = [
    { field: 'employeeId', headerName: 'ID', width: 100 },
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'department', headerName: 'Department', flex: 1 },
    { field: 'designation', headerName: 'Designation', flex: 1 },
    { field: 'phone', headerName: 'Phone', width: 130 },
    {
      field: 'employmentStatus',
      headerName: 'Status',
      width: 110,
      renderCell: ({ value }) => (
        <Chip
          label={value}
          size="small"
          color={value === 'Active' ? 'success' : value === 'Resigned' ? 'warning' : 'error'}
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 140,
      sortable: false,
      renderCell: ({ row }) => (
        <Box>
          <IconButton size="small" onClick={() => navigate(`/employees/${row._id}`)} title="View">
            <Icon icon="material-symbols:visibility-outline-rounded" />
          </IconButton>
          {isAdmin && (
            <>
              <IconButton
                size="small"
                onClick={() => navigate(`/employees/${row._id}/edit`)}
                title="Edit"
              >
                <Icon icon="material-symbols:edit-outline-rounded" />
              </IconButton>
              <IconButton
                size="small"
                color="error"
                onClick={() => setDeleteId(row._id)}
                title="Delete"
              >
                <Icon icon="material-symbols:delete-outline-rounded" />
              </IconButton>
            </>
          )}
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 1.5,
          mb: 3,
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          Employees
        </Typography>
        {isAdmin && (
          <Button
            variant="contained"
            startIcon={<Icon icon="material-symbols:add-rounded" />}
            onClick={() => navigate('/employees/add')}
            sx={{ alignSelf: { xs: 'stretch', sm: 'auto' } }}
          >
            Add Employee
          </Button>
        )}
      </Box>
      <Card>
        <CardContent>
          <TextField
            placeholder="Search by name, department, ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            fullWidth
            sx={{ mb: 2, maxWidth: { sm: 380 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Icon icon="material-symbols:search-rounded" />
                </InputAdornment>
              ),
            }}
          />
          <DataGrid
            rows={filtered}
            columns={columns}
            getRowId={(row) => row._id}
            loading={loading}
            autoHeight
            pageSizeOptions={[10, 25, 50]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            disableRowSelectionOnClick
          />
        </CardContent>
      </Card>

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Delete Employee?</DialogTitle>
        <DialogContent>This action cannot be undone.</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeList;
