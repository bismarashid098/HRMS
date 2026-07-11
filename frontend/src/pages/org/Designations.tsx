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

interface Designation {
  _id: string;
  title: string;
  grade?: string;
  description?: string;
  isActive: boolean;
  department?: { _id: string; name: string };
}

interface Department {
  _id: string;
  name: string;
}

const emptyForm = { title: '', grade: '', description: '', department: '' };

const Designations = () => {
  const [items, setItems] = useState<Designation[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Designation | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [desRes, deptRes] = await Promise.all([
        api.get('/designations', { params: { search, limit: 100 } }),
        api.get('/departments', { params: { isActive: true, limit: 200 } }),
      ]);
      setItems(desRes.data.designations || desRes.data);
      setDepartments(deptRes.data.departments || deptRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setOpen(true);
  };
  const openEdit = (d: Designation) => {
    setEditing(d);
    setForm({
      title: d.title,
      grade: d.grade || '',
      description: d.description || '',
      department: d.department?._id || '',
    });
    setError('');
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setEditing(null);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      setError('Title is required');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, department: form.department || undefined };
      if (editing) await api.put(`/designations/${editing._id}`, payload);
      else await api.post('/designations', payload);
      handleClose();
      fetchData();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this designation?')) return;
    try {
      await api.delete(`/designations/${id}`);
      fetchData();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Cannot delete');
    }
  };

  return (
    <Box>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} gap={1.5} mb={3}>
        <Typography variant="h5" fontWeight={700}>
          Designations
        </Typography>
        <Button
          variant="contained"
          startIcon={<Icon icon="material-symbols:add" />}
          onClick={openCreate}
        >
          Add Designation
        </Button>
      </Stack>

      <Card>
        <CardContent>
          <TextField
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: <Icon icon="material-symbols:search" style={{ marginRight: 8 }} />,
            }}
            fullWidth sx={{ mb: 2, maxWidth: { sm: 320 } }}
          />
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
                    <b>Title</b>
                  </TableCell>
                  <TableCell>
                    <b>Department</b>
                  </TableCell>
                  <TableCell>
                    <b>Grade</b>
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
                    <TableCell colSpan={5} align="center">
                      No designations found
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((d) => (
                    <TableRow key={d._id} hover>
                      <TableCell>{d.title}</TableCell>
                      <TableCell>{d.department?.name || '—'}</TableCell>
                      <TableCell>{d.grade || '—'}</TableCell>
                      <TableCell>
                        <Chip
                          label={d.isActive ? 'Active' : 'Inactive'}
                          color={d.isActive ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => openEdit(d)}>
                            <Icon icon="material-symbols:edit-outline" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(d._id)}
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

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Designation' : 'Add Designation'}</DialogTitle>
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
            <FormControl fullWidth size="small">
              <InputLabel>Department</InputLabel>
              <Select
                value={form.department}
                label="Department"
                onChange={(e) => setForm({ ...form, department: e.target.value })}
              >
                <MenuItem value="">None</MenuItem>
                {departments.map((d) => (
                  <MenuItem key={d._id} value={d._id}>
                    {d.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Grade"
              value={form.grade}
              onChange={(e) => setForm({ ...form, grade: e.target.value })}
              fullWidth
              size="small"
            />
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
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? <CircularProgress size={18} /> : editing ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Designations;
