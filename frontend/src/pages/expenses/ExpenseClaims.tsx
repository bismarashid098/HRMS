import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Stack,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { Icon } from '@iconify/react';
import api from 'api/axios';

interface Expense {
  _id: string;
  employee: { name: string; department: string };
  title: string;
  category: string;
  amount: number;
  date: string;
  status: string;
}

interface Employee {
  _id: string;
  name: string;
  employeeId: string;
}

const CATEGORIES = [
  'Travel',
  'Food',
  'Accommodation',
  'Communication',
  'Office Supplies',
  'Training',
  'Medical',
  'Other',
];
const STATUSES = ['Pending', 'Approved', 'Rejected', 'Paid'];
const statusColor: Record<string, 'warning' | 'success' | 'error' | 'info'> = {
  Pending: 'warning',
  Approved: 'success',
  Rejected: 'error',
  Paid: 'info',
};

const ExpenseClaims = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [open, setOpen] = useState(false);
  const [statusDialog, setStatusDialog] = useState<{
    open: boolean;
    id: string;
    status: string;
    reason: string;
  }>({ open: false, id: '', status: '', reason: '' });
  const [form, setForm] = useState({
    employee: '',
    title: '',
    category: 'Other',
    amount: '',
    date: '',
    description: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [eRes, empRes] = await Promise.all([
        api.get('/expenses', { params: { status: statusFilter || undefined, limit: 50 } }),
        api.get('/employees', { params: { limit: 200 } }),
      ]);
      setExpenses(eRes.data.expenses || []);
      setEmployees(empRes.data.employees || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const handleSave = async () => {
    if (!form.employee) {
      setError('Employee is required');
      return;
    }
    if (!form.title.trim()) {
      setError('Title is required');
      return;
    }
    if (!form.amount || Number(form.amount) <= 0) {
      setError('Amount must be > 0');
      return;
    }
    if (!form.date) {
      setError('Date is required');
      return;
    }
    setSaving(true);
    try {
      await api.post('/expenses', { ...form, amount: Number(form.amount) });
      setOpen(false);
      setForm({
        employee: '',
        title: '',
        category: 'Other',
        amount: '',
        date: '',
        description: '',
      });
      fetchData();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to submit');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusUpdate = async () => {
    setSaving(true);
    try {
      await api.put(`/expenses/${statusDialog.id}/status`, {
        status: statusDialog.status,
        rejectionReason: statusDialog.reason || undefined,
      });
      setStatusDialog({ open: false, id: '', status: '', reason: '' });
      fetchData();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await api.delete(`/expenses/${id}`);
      fetchData();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Cannot delete');
    }
  };

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} gap={1.5} mb={3}>
        <Typography variant="h5" fontWeight={700}>
          Expense Claims
        </Typography>
        <Button
          variant="contained"
          startIcon={<Icon icon="material-symbols:add" />}
          onClick={() => {
            setError('');
            setOpen(true);
          }}
        >
          Submit Expense
        </Button>
      </Stack>

      <Card>
        <CardContent>
          <FormControl size="small" sx={{ mb: 2, minWidth: 140 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {STATUSES.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>
                    <b>Employee</b>
                  </TableCell>
                  <TableCell>
                    <b>Title</b>
                  </TableCell>
                  <TableCell>
                    <b>Category</b>
                  </TableCell>
                  <TableCell>
                    <b>Amount</b>
                  </TableCell>
                  <TableCell>
                    <b>Date</b>
                  </TableCell>
                  <TableCell>
                    <b>Status</b>
                  </TableCell>
                  <TableCell align="right">
                    <b>Actions</b>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {expenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No expense claims
                    </TableCell>
                  </TableRow>
                ) : (
                  expenses.map((e) => (
                    <TableRow key={e._id} hover>
                      <TableCell>{e.employee?.name}</TableCell>
                      <TableCell>{e.title}</TableCell>
                      <TableCell>{e.category}</TableCell>
                      <TableCell>PKR {e.amount.toLocaleString()}</TableCell>
                      <TableCell>{new Date(e.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Chip
                          label={e.status}
                          color={statusColor[e.status] || 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        {e.status === 'Pending' && (
                          <>
                            <Tooltip title="Approve">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() =>
                                  setStatusDialog({
                                    open: true,
                                    id: e._id,
                                    status: 'Approved',
                                    reason: '',
                                  })
                                }
                              >
                                <Icon icon="material-symbols:check-circle-outline" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() =>
                                  setStatusDialog({
                                    open: true,
                                    id: e._id,
                                    status: 'Rejected',
                                    reason: '',
                                  })
                                }
                              >
                                <Icon icon="material-symbols:cancel-outline" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                        {e.status === 'Approved' && (
                          <Tooltip title="Mark Paid">
                            <IconButton
                              size="small"
                              color="info"
                              onClick={() =>
                                setStatusDialog({
                                  open: true,
                                  id: e._id,
                                  status: 'Paid',
                                  reason: '',
                                })
                              }
                            >
                              <Icon icon="material-symbols:payments-outline" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(e._id)}
                          >
                            <Icon icon="material-symbols:delete-outline" />
                          </IconButton>
                        </Tooltip>
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

      {/* Submit Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Submit Expense Claim</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            {error && (
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            )}
            <FormControl fullWidth size="small">
              <InputLabel>Employee *</InputLabel>
              <Select
                value={form.employee}
                label="Employee *"
                onChange={(e) => setForm({ ...form, employee: e.target.value })}
              >
                {employees.map((emp) => (
                  <MenuItem key={emp._id} value={emp._id}>
                    {emp.name} ({emp.employeeId})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Title *"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              fullWidth
              size="small"
            />
            <Grid container spacing={2}>
              <Grid size={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={form.category}
                    label="Category"
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    {CATEGORIES.map((c) => (
                      <MenuItem key={c} value={c}>
                        {c}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={3}>
                <TextField
                  label="Amount *"
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid size={3}>
                <TextField
                  label="Date *"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
            <TextField
              label="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              fullWidth
              size="small"
              multiline
              rows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? <CircularProgress size={18} /> : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog
        open={statusDialog.open}
        onClose={() => setStatusDialog({ ...statusDialog, open: false })}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Update Expense Status</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <Typography variant="body2">
              Set status to: <b>{statusDialog.status}</b>
            </Typography>
            {statusDialog.status === 'Rejected' && (
              <TextField
                label="Rejection Reason *"
                value={statusDialog.reason}
                onChange={(e) => setStatusDialog({ ...statusDialog, reason: e.target.value })}
                fullWidth
                size="small"
                multiline
                rows={2}
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialog({ ...statusDialog, open: false })}>Cancel</Button>
          <Button variant="contained" onClick={handleStatusUpdate} disabled={saving}>
            {saving ? <CircularProgress size={18} /> : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ExpenseClaims;
