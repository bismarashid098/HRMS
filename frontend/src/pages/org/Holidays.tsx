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
import { Icon } from '@iconify/react';
import api from 'api/axios';

interface Holiday {
  _id: string;
  name: string;
  date: string;
  endDate?: string;
  type: string;
  year: number;
  isRecurring: boolean;
}

const TYPES = ['Public', 'Restricted', 'Optional'];
const currentYear = new Date().getFullYear();
const emptyForm = { name: '', date: '', endDate: '', type: 'Public', isRecurring: false };

const Holidays = () => {
  const [items, setItems] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(String(currentYear));
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Holiday | null>(null);
  const [form, setForm] = useState<typeof emptyForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/holidays', { params: { year } });
      setItems(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [year]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setOpen(true);
  };
  const openEdit = (h: Holiday) => {
    setEditing(h);
    setForm({
      name: h.name,
      date: h.date.slice(0, 10),
      endDate: h.endDate?.slice(0, 10) || '',
      type: h.type,
      isRecurring: h.isRecurring,
    });
    setError('');
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setEditing(null);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError('Name is required');
      return;
    }
    if (!form.date) {
      setError('Date is required');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, endDate: form.endDate || undefined };
      if (editing) await api.put(`/holidays/${editing._id}`, payload);
      else await api.post('/holidays', payload);
      handleClose();
      fetchData();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this holiday?')) return;
    try {
      await api.delete(`/holidays/${id}`);
      fetchData();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Cannot delete');
    }
  };

  const typeColor: Record<string, 'error' | 'warning' | 'info'> = {
    Public: 'error',
    Restricted: 'warning',
    Optional: 'info',
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>
          Holidays
        </Typography>
        <Stack direction="row" spacing={2}>
          <TextField
            label="Year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            size="small"
            sx={{ width: 100 }}
          />
          <Button
            variant="contained"
            startIcon={<Icon icon="material-symbols:add" />}
            onClick={openCreate}
          >
            Add Holiday
          </Button>
        </Stack>
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
                    <b>Date</b>
                  </TableCell>
                  <TableCell>
                    <b>End Date</b>
                  </TableCell>
                  <TableCell>
                    <b>Type</b>
                  </TableCell>
                  <TableCell>
                    <b>Recurring</b>
                  </TableCell>
                  <TableCell align="right">
                    <b>Actions</b>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No holidays for {year}
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((h) => (
                    <TableRow key={h._id} hover>
                      <TableCell>{h.name}</TableCell>
                      <TableCell>{new Date(h.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {h.endDate ? new Date(h.endDate).toLocaleDateString() : '—'}
                      </TableCell>
                      <TableCell>
                        <Chip label={h.type} color={typeColor[h.type] || 'default'} size="small" />
                      </TableCell>
                      <TableCell>
                        {h.isRecurring ? (
                          <Icon icon="material-symbols:check-circle" color="#22c55e" />
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => openEdit(h)}>
                            <Icon icon="material-symbols:edit-outline" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(h._id)}
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
        <DialogTitle>{editing ? 'Edit Holiday' : 'Add Holiday'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            {error && (
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            )}
            <TextField
              label="Holiday Name *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              fullWidth
              size="small"
            />
            <TextField
              label="Date *"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="End Date (multi-day)"
              type="date"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
            />
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

export default Holidays;
