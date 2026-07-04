import { useEffect, useState } from 'react';
import {
  Box, Button, Card, CardContent, Chip, Table, TableBody, TableCell,
  TableHead, TableRow, Typography, CircularProgress, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Tooltip, Stack,
} from '@mui/material';
import { Icon } from '@iconify/react';
import api from 'api/axios';

interface Department {
  _id: string;
  name: string;
  code?: string;
  description?: string;
  isActive: boolean;
  head?: { name: string; employeeId: string };
}

const emptyForm = { name: '', code: '', description: '' };

const Departments = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/departments', { params: { search, limit: 100 } });
      setDepartments(res.data.departments || res.data);
    } catch {
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDepartments(); }, [search]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setError(''); setOpen(true); };
  const openEdit = (d: Department) => {
    setEditing(d);
    setForm({ name: d.name, code: d.code || '', description: d.description || '' });
    setError('');
    setOpen(true);
  };
  const handleClose = () => { setOpen(false); setEditing(null); };

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Department name is required'); return; }
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/departments/${editing._id}`, form);
      } else {
        await api.post('/departments', form);
      }
      handleClose();
      fetchDepartments();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to save department');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (d: Department) => {
    try {
      await api.put(`/departments/${d._id}`, { isActive: !d.isActive });
      fetchDepartments();
    } catch {}
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this department?')) return;
    try {
      await api.delete(`/departments/${id}`);
      fetchDepartments();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Cannot delete department');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>Departments</Typography>
        <Button variant="contained" startIcon={<Icon icon="material-symbols:add" />} onClick={openCreate}>
          Add Department
        </Button>
      </Stack>

      <Card>
        <CardContent>
          <TextField
            placeholder="Search departments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            InputProps={{ startAdornment: <Icon icon="material-symbols:search" style={{ marginRight: 8 }} /> }}
            sx={{ mb: 2, width: 300 }}
          />

          {loading ? (
            <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><b>Name</b></TableCell>
                  <TableCell><b>Code</b></TableCell>
                  <TableCell><b>Head</b></TableCell>
                  <TableCell><b>Status</b></TableCell>
                  <TableCell align="right"><b>Actions</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {departments.length === 0 ? (
                  <TableRow><TableCell colSpan={5} align="center">No departments found</TableCell></TableRow>
                ) : departments.map((d) => (
                  <TableRow key={d._id} hover>
                    <TableCell>{d.name}</TableCell>
                    <TableCell>{d.code || '—'}</TableCell>
                    <TableCell>{d.head?.name || '—'}</TableCell>
                    <TableCell>
                      <Chip label={d.isActive ? 'Active' : 'Inactive'} color={d.isActive ? 'success' : 'default'} size="small" />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(d)}><Icon icon="material-symbols:edit-outline" /></IconButton></Tooltip>
                      <Tooltip title={d.isActive ? 'Deactivate' : 'Activate'}>
                        <IconButton size="small" onClick={() => handleToggle(d)}>
                          <Icon icon={d.isActive ? 'material-symbols:toggle-on' : 'material-symbols:toggle-off'} color={d.isActive ? '#22c55e' : undefined} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => handleDelete(d._id)}><Icon icon="material-symbols:delete-outline" /></IconButton></Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Department' : 'Add Department'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            {error && <Typography color="error" variant="body2">{error}</Typography>}
            <TextField label="Department Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} fullWidth size="small" />
            <TextField label="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} fullWidth size="small" />
            <TextField label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} fullWidth size="small" multiline rows={2} />
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

export default Departments;
