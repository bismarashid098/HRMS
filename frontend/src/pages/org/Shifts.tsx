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
  Checkbox,
  FormControlLabel,
  FormGroup,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { Icon } from '@iconify/react';
import api from 'api/axios';

interface Shift {
  _id: string;
  name: string;
  startTime: string;
  endTime: string;
  gracePeriod: number;
  workingDays: string[];
  overtimeEnabled: boolean;
  isActive: boolean;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const emptyForm = {
  name: '',
  startTime: '09:00',
  endTime: '18:00',
  gracePeriod: '10',
  overtimeEnabled: false,
  workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
};

const Shifts = () => {
  const [items, setItems] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Shift | null>(null);
  const [form, setForm] = useState<typeof emptyForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/shifts');
      setItems(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setOpen(true);
  };
  const openEdit = (s: Shift) => {
    setEditing(s);
    setForm({
      name: s.name,
      startTime: s.startTime,
      endTime: s.endTime,
      gracePeriod: String(s.gracePeriod),
      overtimeEnabled: s.overtimeEnabled,
      workingDays: s.workingDays,
    });
    setError('');
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setEditing(null);
  };

  const toggleDay = (day: string) => {
    setForm((f) => ({
      ...f,
      workingDays: f.workingDays.includes(day)
        ? f.workingDays.filter((d) => d !== day)
        : [...f.workingDays, day],
    }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError('Name is required');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, gracePeriod: Number(form.gracePeriod) };
      if (editing) await api.put(`/shifts/${editing._id}`, payload);
      else await api.post('/shifts', payload);
      handleClose();
      fetchData();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this shift?')) return;
    try {
      await api.delete(`/shifts/${id}`);
      fetchData();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Cannot delete');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>
          Shifts
        </Typography>
        <Button
          variant="contained"
          startIcon={<Icon icon="material-symbols:add" />}
          onClick={openCreate}
        >
          Add Shift
        </Button>
      </Stack>

      <Card>
        <CardContent>
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>
                    <b>Name</b>
                  </TableCell>
                  <TableCell>
                    <b>Start</b>
                  </TableCell>
                  <TableCell>
                    <b>End</b>
                  </TableCell>
                  <TableCell>
                    <b>Grace (min)</b>
                  </TableCell>
                  <TableCell>
                    <b>Working Days</b>
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
                      No shifts found
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((s) => (
                    <TableRow key={s._id} hover>
                      <TableCell>{s.name}</TableCell>
                      <TableCell>{s.startTime}</TableCell>
                      <TableCell>{s.endTime}</TableCell>
                      <TableCell>{s.gracePeriod}</TableCell>
                      <TableCell>{s.workingDays.join(', ')}</TableCell>
                      <TableCell>
                        <Chip
                          label={s.isActive ? 'Active' : 'Inactive'}
                          color={s.isActive ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => openEdit(s)}>
                            <Icon icon="material-symbols:edit-outline" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(s._id)}
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

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Shift' : 'Add Shift'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            {error && (
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            )}
            <TextField
              label="Shift Name *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              fullWidth
              size="small"
            />
            <Grid container spacing={2}>
              <Grid size={4}>
                <TextField
                  label="Start Time"
                  value={form.startTime}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                  fullWidth
                  size="small"
                  placeholder="09:00"
                />
              </Grid>
              <Grid size={4}>
                <TextField
                  label="End Time"
                  value={form.endTime}
                  onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                  fullWidth
                  size="small"
                  placeholder="18:00"
                />
              </Grid>
              <Grid size={4}>
                <TextField
                  label="Grace (min)"
                  type="number"
                  value={form.gracePeriod}
                  onChange={(e) => setForm({ ...form, gracePeriod: e.target.value })}
                  fullWidth
                  size="small"
                />
              </Grid>
            </Grid>
            <Typography variant="body2" fontWeight={600}>
              Working Days
            </Typography>
            <FormGroup row>
              {DAYS.map((d) => (
                <FormControlLabel
                  key={d}
                  control={
                    <Checkbox
                      checked={form.workingDays.includes(d)}
                      onChange={() => toggleDay(d)}
                      size="small"
                    />
                  }
                  label={d.slice(0, 3)}
                />
              ))}
            </FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.overtimeEnabled}
                  onChange={(e) => setForm({ ...form, overtimeEnabled: e.target.checked })}
                />
              }
              label="Enable Overtime"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? <CircularProgress size={18} /> : editing ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Shifts;
