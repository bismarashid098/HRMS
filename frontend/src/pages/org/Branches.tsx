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
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { Icon } from '@iconify/react';
import api from 'api/axios';

interface Branch {
  _id: string;
  name: string;
  code?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  manager?: { name: string };
}

const emptyForm = {
  name: '',
  code: '',
  address: '',
  city: '',
  country: 'Pakistan',
  phone: '',
  email: '',
};

const Branches = () => {
  const [items, setItems] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Branch | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/branches', { params: { search } });
      setItems(res.data);
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
  const openEdit = (b: Branch) => {
    setEditing(b);
    setForm({
      name: b.name,
      code: b.code || '',
      address: '',
      city: b.city || '',
      country: b.country || 'Pakistan',
      phone: b.phone || '',
      email: b.email || '',
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
      setError('Branch name is required');
      return;
    }
    setSaving(true);
    try {
      if (editing) await api.put(`/branches/${editing._id}`, form);
      else await api.post('/branches', form);
      handleClose();
      fetchData();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this branch?')) return;
    try {
      await api.delete(`/branches/${id}`);
      fetchData();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Cannot delete');
    }
  };

  const f = (k: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>
          Branches
        </Typography>
        <Button
          variant="contained"
          startIcon={<Icon icon="material-symbols:add" />}
          onClick={openCreate}
        >
          Add Branch
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
            sx={{ mb: 2, width: 300 }}
          />
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
                    <b>Code</b>
                  </TableCell>
                  <TableCell>
                    <b>City</b>
                  </TableCell>
                  <TableCell>
                    <b>Phone</b>
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
                    <TableCell colSpan={6} align="center">
                      No branches found
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((b) => (
                    <TableRow key={b._id} hover>
                      <TableCell>{b.name}</TableCell>
                      <TableCell>{b.code || '—'}</TableCell>
                      <TableCell>{b.city || '—'}</TableCell>
                      <TableCell>{b.phone || '—'}</TableCell>
                      <TableCell>
                        <Chip
                          label={b.isActive ? 'Active' : 'Inactive'}
                          color={b.isActive ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => openEdit(b)}>
                            <Icon icon="material-symbols:edit-outline" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(b._id)}
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
        <DialogTitle>{editing ? 'Edit Branch' : 'Add Branch'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            {error && (
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            )}
            <Grid container spacing={2}>
              <Grid size={8}>
                <TextField
                  label="Branch Name *"
                  value={form.name}
                  onChange={f('name')}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid size={4}>
                <TextField
                  label="Code"
                  value={form.code}
                  onChange={f('code')}
                  fullWidth
                  size="small"
                />
              </Grid>
            </Grid>
            <TextField
              label="Address"
              value={form.address}
              onChange={f('address')}
              fullWidth
              size="small"
            />
            <Grid container spacing={2}>
              <Grid size={6}>
                <TextField
                  label="City"
                  value={form.city}
                  onChange={f('city')}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  label="Country"
                  value={form.country}
                  onChange={f('country')}
                  fullWidth
                  size="small"
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid size={6}>
                <TextField
                  label="Phone"
                  value={form.phone}
                  onChange={f('phone')}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  label="Email"
                  value={form.email}
                  onChange={f('email')}
                  fullWidth
                  size="small"
                />
              </Grid>
            </Grid>
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

export default Branches;
