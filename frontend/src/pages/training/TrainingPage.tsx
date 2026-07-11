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

interface Training {
  _id: string;
  title: string;
  type: string;
  trainer?: string;
  startDate?: string;
  endDate?: string;
  status: string;
  enrollments: Array<{ employee: { name: string }; status: string }>;
}

interface Employee {
  _id: string;
  name: string;
  employeeId: string;
}

const TYPES = ['Internal', 'External', 'Online', 'Workshop', 'Seminar'];
const STATUSES = ['Planned', 'Ongoing', 'Completed', 'Cancelled'];
const statusColor: Record<string, 'info' | 'warning' | 'success' | 'error'> = {
  Planned: 'info',
  Ongoing: 'warning',
  Completed: 'success',
  Cancelled: 'error',
};

const TrainingPage = () => {
  const [items, setItems] = useState<Training[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [open, setOpen] = useState(false);
  const [enrollDialog, setEnrollDialog] = useState<{
    open: boolean;
    trainingId: string;
    employeeId: string;
  }>({ open: false, trainingId: '', employeeId: '' });
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'Internal',
    trainer: '',
    venue: '',
    startDate: '',
    endDate: '',
    duration: '',
    cost: '',
    maxParticipants: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tRes, eRes] = await Promise.all([
        api.get('/training', { params: { search, status: statusFilter || undefined, limit: 50 } }),
        api.get('/employees', { params: { limit: 200 } }),
      ]);
      setItems(tRes.data.trainings || []);
      setEmployees(eRes.data.employees || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, statusFilter]);

  const handleSave = async () => {
    if (!form.title.trim()) {
      setError('Title is required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
        duration: form.duration ? Number(form.duration) : undefined,
        cost: form.cost ? Number(form.cost) : undefined,
        maxParticipants: form.maxParticipants ? Number(form.maxParticipants) : undefined,
      };
      await api.post('/training', payload);
      setOpen(false);
      fetchData();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to create training');
    } finally {
      setSaving(false);
    }
  };

  const handleEnroll = async () => {
    if (!enrollDialog.employeeId) {
      alert('Select an employee');
      return;
    }
    setSaving(true);
    try {
      await api.post(`/training/${enrollDialog.trainingId}/enroll`, {
        employeeId: enrollDialog.employeeId,
      });
      setEnrollDialog({ open: false, trainingId: '', employeeId: '' });
      fetchData();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to enroll');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this training?')) return;
    try {
      await api.delete(`/training/${id}`);
      fetchData();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Cannot delete');
    }
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>
          Training Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Icon icon="material-symbols:add" />}
          onClick={() => {
            setError('');
            setOpen(true);
          }}
        >
          Create Training
        </Button>
      </Stack>

      <Card>
        <CardContent>
          <Stack direction="row" spacing={2} mb={2}>
            <TextField
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: <Icon icon="material-symbols:search" style={{ marginRight: 8 }} />,
              }}
              sx={{ width: 260 }}
            />
            <FormControl size="small" sx={{ minWidth: 140 }}>
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
          </Stack>

          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>
                    <b>Title</b>
                  </TableCell>
                  <TableCell>
                    <b>Type</b>
                  </TableCell>
                  <TableCell>
                    <b>Trainer</b>
                  </TableCell>
                  <TableCell>
                    <b>Dates</b>
                  </TableCell>
                  <TableCell>
                    <b>Enrolled</b>
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
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No trainings found
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((t) => (
                    <TableRow key={t._id} hover>
                      <TableCell>{t.title}</TableCell>
                      <TableCell>{t.type}</TableCell>
                      <TableCell>{t.trainer || '—'}</TableCell>
                      <TableCell>
                        {t.startDate ? new Date(t.startDate).toLocaleDateString() : '—'}
                        {t.endDate ? ` – ${new Date(t.endDate).toLocaleDateString()}` : ''}
                      </TableCell>
                      <TableCell>{t.enrollments?.length || 0}</TableCell>
                      <TableCell>
                        <Chip
                          label={t.status}
                          color={statusColor[t.status] || 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Enroll Employee">
                          <IconButton
                            size="small"
                            onClick={() =>
                              setEnrollDialog({ open: true, trainingId: t._id, employeeId: '' })
                            }
                          >
                            <Icon icon="material-symbols:person-add-outline" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(t._id)}
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
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Training</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            {error && (
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            )}
            <TextField
              label="Title *"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              fullWidth
              size="small"
            />
            <Grid container spacing={2}>
              <Grid size={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={form.type}
                    label="Type"
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                  >
                    {TYPES.map((t) => (
                      <MenuItem key={t} value={t}>
                        {t}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={4}>
                <TextField
                  label="Trainer"
                  value={form.trainer}
                  onChange={(e) => setForm({ ...form, trainer: e.target.value })}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid size={4}>
                <TextField
                  label="Venue"
                  value={form.venue}
                  onChange={(e) => setForm({ ...form, venue: e.target.value })}
                  fullWidth
                  size="small"
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid size={3}>
                <TextField
                  label="Start Date"
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={3}>
                <TextField
                  label="End Date"
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={2}>
                <TextField
                  label="Hours"
                  type="number"
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid size={2}>
                <TextField
                  label="Cost"
                  type="number"
                  value={form.cost}
                  onChange={(e) => setForm({ ...form, cost: e.target.value })}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid size={2}>
                <TextField
                  label="Max"
                  type="number"
                  value={form.maxParticipants}
                  onChange={(e) => setForm({ ...form, maxParticipants: e.target.value })}
                  fullWidth
                  size="small"
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
            {saving ? <CircularProgress size={18} /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Enroll Dialog */}
      <Dialog
        open={enrollDialog.open}
        onClose={() => setEnrollDialog({ ...enrollDialog, open: false })}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Enroll Employee</DialogTitle>
        <DialogContent>
          <FormControl fullWidth size="small" sx={{ mt: 1 }}>
            <InputLabel>Employee</InputLabel>
            <Select
              value={enrollDialog.employeeId}
              label="Employee"
              onChange={(e) => setEnrollDialog({ ...enrollDialog, employeeId: e.target.value })}
            >
              {employees.map((e) => (
                <MenuItem key={e._id} value={e._id}>
                  {e.name} ({e.employeeId})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEnrollDialog({ ...enrollDialog, open: false })}>Cancel</Button>
          <Button variant="contained" onClick={handleEnroll} disabled={saving}>
            {saving ? <CircularProgress size={18} /> : 'Enroll'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TrainingPage;
