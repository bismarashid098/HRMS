import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Snackbar,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  CircularProgress,
} from '@mui/material';
import api from 'api/axios';

const UserManagement = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Manager' });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [snack, setSnack] = useState('');
  const [snackSeverity, setSnackSeverity] = useState<'success' | 'error'>('success');

  const showSnack = (msg: string, severity: 'success' | 'error' = 'success') => {
    setSnack(msg);
    setSnackSeverity(severity);
  };

  const fetchUsers = () => {
    setLoading(true);
    api
      .get('/users')
      .then((res) => setUsers(res.data.users || res.data || []))
      .catch(() => showSnack('Failed to load users', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setFormError('Name, email and password are required');
      return;
    }
    setFormError('');
    setSubmitting(true);
    try {
      await api.post('/users', form);
      setOpen(false);
      setForm({ name: '', email: '', password: '', role: 'Manager' });
      fetchUsers();
      showSnack('User created successfully');
    } catch (e: any) {
      setFormError(e.response?.data?.message || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (user: any) => {
    try {
      await api.put(`/users/${user._id}/status`);
      fetchUsers();
      showSnack(`User ${user.isActive ? 'deactivated' : 'activated'}`);
    } catch (e: any) {
      showSnack(e.response?.data?.message || 'Failed to update user', 'error');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 1.5, mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          User Management
        </Typography>
        <Button variant="contained" onClick={() => { setFormError(''); setOpen(true); }}>
          Add User
        </Button>
      </Box>
      <Card>
        <CardContent>
          {loading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ overflowX: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Toggle Active</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">No users found</TableCell>
                    </TableRow>
                  ) : (
                    users.map((u: any) => (
                      <TableRow key={u._id}>
                        <TableCell>{u.name}</TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>
                          <Chip label={u.role} size="small" color={u.role === 'Admin' ? 'primary' : 'default'} />
                        </TableCell>
                        <TableCell>
                          <Chip label={u.isActive ? 'Active' : 'Inactive'} size="small" color={u.isActive ? 'success' : 'error'} />
                        </TableCell>
                        <TableCell>
                          <Switch checked={u.isActive} onChange={() => toggleActive(u)} size="small" />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Box>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add User</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {formError && <Alert severity="error">{formError}</Alert>}
            <TextField
              label="Name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
            <TextField
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
            />
            <TextField
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              required
            />
            <TextField
              select
              label="Role"
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
            >
              <MenuItem value="Admin">Admin</MenuItem>
              <MenuItem value="Manager">Manager</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={submitting}>
            {submitting ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!snack}
        autoHideDuration={3500}
        onClose={() => setSnack('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackSeverity} onClose={() => setSnack('')} sx={{ width: '100%' }}>
          {snack}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserManagement;
