import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  FormGroup,
  MenuItem,
  Snackbar,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  CircularProgress,
  Stack,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { Icon } from '@iconify/react';
import api from 'api/axios';

const MODULE_GROUPS = [
  {
    label: 'HR Management',
    modules: [
      { key: 'employees', label: 'Employees' },
      { key: 'attendance', label: 'Attendance' },
      { key: 'leaves', label: 'Leave Management' },
      { key: 'biometric', label: 'Biometric Import' },
    ],
  },
  {
    label: 'Organization',
    modules: [
      { key: 'departments', label: 'Departments' },
      { key: 'designations', label: 'Designations' },
      { key: 'branches', label: 'Branches' },
      { key: 'shifts', label: 'Shifts' },
      { key: 'holidays', label: 'Holidays' },
    ],
  },
  {
    label: 'Payroll',
    modules: [
      { key: 'payroll', label: 'Payroll' },
      { key: 'advance-salary', label: 'Advance Salary' },
    ],
  },
  {
    label: 'Recruitment & People',
    modules: [
      { key: 'recruitment', label: 'Recruitment' },
      { key: 'performance', label: 'Performance Reviews' },
      { key: 'training', label: 'Training' },
    ],
  },
  {
    label: 'Operations',
    modules: [
      { key: 'assets', label: 'Asset Management' },
      { key: 'expenses', label: 'Expense Claims' },
      { key: 'documents', label: 'Documents' },
    ],
  },
  {
    label: 'Reports',
    modules: [{ key: 'reports', label: 'All Reports' }],
  },
];

const ALL_MODULES = MODULE_GROUPS.flatMap((g) => g.modules.map((m) => m.key));

const UserManagement = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Manager' });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [snack, setSnack] = useState('');
  const [snackSeverity, setSnackSeverity] = useState<'success' | 'error'>('success');

  // Permissions dialog
  const [permUser, setPermUser] = useState<any | null>(null);
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
  const [savingPerms, setSavingPerms] = useState(false);

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

  const openPermissions = (u: any) => {
    setPermUser(u);
    setSelectedPerms(u.permissions || []);
  };

  const togglePerm = (key: string) =>
    setSelectedPerms((prev) => (prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]));

  const selectAll = () => setSelectedPerms(ALL_MODULES);
  const clearAll = () => setSelectedPerms([]);

  const savePermissions = async () => {
    if (!permUser) return;
    setSavingPerms(true);
    try {
      await api.put(`/users/${permUser._id}/permissions`, { permissions: selectedPerms });
      fetchUsers();
      setPermUser(null);
      showSnack('Permissions updated successfully');
    } catch (e: any) {
      showSnack(e.response?.data?.message || 'Failed to update permissions', 'error');
    } finally {
      setSavingPerms(false);
    }
  };

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 1.5,
          mb: 3,
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          User Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Icon icon="material-symbols:person-add-outline-rounded" />}
          onClick={() => {
            setFormError('');
            setOpen(true);
          }}
        >
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
                    <TableCell>Permissions</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Active</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((u: any) => (
                      <TableRow key={u._id}>
                        <TableCell sx={{ fontWeight: 500 }}>{u.name}</TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>
                          <Chip
                            label={u.role}
                            size="small"
                            color={u.role === 'Admin' ? 'primary' : 'default'}
                          />
                        </TableCell>
                        <TableCell>
                          {u.role === 'Admin' ? (
                            <Chip label="Full Access" size="small" color="success" />
                          ) : (
                            <Tooltip
                              title={
                                (u.permissions || []).length === 0
                                  ? 'No modules assigned'
                                  : (u.permissions || []).join(', ')
                              }
                            >
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<Icon icon="material-symbols:shield-outline-rounded" />}
                                onClick={() => openPermissions(u)}
                                sx={{ fontSize: '0.7rem', py: 0.25 }}
                              >
                                {(u.permissions || []).length} modules
                              </Button>
                            </Tooltip>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={u.isActive ? 'Active' : 'Inactive'}
                            size="small"
                            color={u.isActive ? 'success' : 'error'}
                          />
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={u.isActive}
                            onChange={() => toggleActive(u)}
                            size="small"
                          />
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

      {/* Create User Dialog */}
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

      {/* Permissions Dialog */}
      <Dialog
        open={!!permUser}
        onClose={() => setPermUser(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Icon icon="material-symbols:shield-outline-rounded" width={22} />
            <span>Module Access — {permUser?.name}</span>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <Button size="small" variant="outlined" onClick={selectAll}>
              Select All
            </Button>
            <Button size="small" variant="outlined" color="inherit" onClick={clearAll}>
              Clear All
            </Button>
            <Chip
              label={`${selectedPerms.length} / ${ALL_MODULES.length} modules`}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Stack>

          {MODULE_GROUPS.map((group, gi) => (
            <Box key={group.label}>
              {gi > 0 && <Divider sx={{ my: 1.5 }} />}
              <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ display: 'block', mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {group.label}
              </Typography>
              <Grid container spacing={0}>
                {group.modules.map((mod) => (
                  <Grid key={mod.key} size={{ xs: 12, sm: 6 }}>
                    <FormGroup>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedPerms.includes(mod.key)}
                            onChange={() => togglePerm(mod.key)}
                            size="small"
                          />
                        }
                        label={<Typography variant="body2">{mod.label}</Typography>}
                      />
                    </FormGroup>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPermUser(null)}>Cancel</Button>
          <Button variant="contained" onClick={savePermissions} disabled={savingPerms}>
            {savingPerms ? 'Saving...' : 'Save Permissions'}
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
