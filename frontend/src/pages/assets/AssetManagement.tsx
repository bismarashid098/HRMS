import { useEffect, useState } from 'react';
import {
  Box, Button, Card, CardContent, Chip, Table, TableBody, TableCell,
  TableHead, TableRow, Typography, CircularProgress, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Tooltip, Stack,
  MenuItem, Select, FormControl, InputLabel,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { Icon } from '@iconify/react';
import api from 'api/axios';

interface Asset {
  _id: string;
  name: string;
  assetCode?: string;
  category: string;
  brand?: string;
  serialNumber?: string;
  status: string;
  assignedTo?: { name: string; employeeId: string };
  purchaseDate?: string;
  currentValue?: number;
}

interface Employee { _id: string; name: string; employeeId: string; }

const CATEGORIES = ['Laptop', 'Desktop', 'Mobile', 'Vehicle', 'Furniture', 'Equipment', 'Other'];
const STATUSES = ['Available', 'Assigned', 'Under Maintenance', 'Disposed'];
const statusColor: Record<string, 'success' | 'info' | 'warning' | 'error'> = { Available: 'success', Assigned: 'info', 'Under Maintenance': 'warning', Disposed: 'error' };

const AssetManagement = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [open, setOpen] = useState(false);
  const [assignDialog, setAssignDialog] = useState<{ open: boolean; asset: Asset | null; employeeId: string; condition: string }>({ open: false, asset: null, employeeId: '', condition: 'Good' });
  const [form, setForm] = useState({ name: '', assetCode: '', category: 'Laptop', brand: '', model: '', serialNumber: '', purchaseDate: '', purchasePrice: '', currentValue: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [aRes, eRes] = await Promise.all([
        api.get('/assets', { params: { search, status: statusFilter || undefined, limit: 50 } }),
        api.get('/employees', { params: { limit: 200 } }),
      ]);
      setAssets(aRes.data.assets || []);
      setEmployees(eRes.data.employees || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [search, statusFilter]);

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Asset name is required'); return; }
    setSaving(true);
    try {
      const payload = { ...form, purchasePrice: form.purchasePrice ? Number(form.purchasePrice) : undefined, currentValue: form.currentValue ? Number(form.currentValue) : undefined, purchaseDate: form.purchaseDate || undefined };
      await api.post('/assets', payload);
      setOpen(false);
      fetchData();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleAssign = async () => {
    if (!assignDialog.asset || !assignDialog.employeeId) { alert('Select employee'); return; }
    setSaving(true);
    try {
      await api.post(`/assets/${assignDialog.asset._id}/assign`, { employeeId: assignDialog.employeeId, condition: assignDialog.condition });
      setAssignDialog({ open: false, asset: null, employeeId: '', condition: 'Good' });
      fetchData();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to assign');
    } finally { setSaving(false); }
  };

  const handleReturn = async (id: string) => {
    if (!window.confirm('Return this asset?')) return;
    try { await api.post(`/assets/${id}/return`, { condition: 'Good' }); fetchData(); }
    catch (e: any) { alert(e.response?.data?.message || 'Failed to return'); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this asset?')) return;
    try { await api.delete(`/assets/${id}`); fetchData(); }
    catch (e: any) { alert(e.response?.data?.message || 'Cannot delete'); }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>Asset Management</Typography>
        <Button variant="contained" startIcon={<Icon icon="material-symbols:add" />} onClick={() => { setError(''); setOpen(true); }}>Add Asset</Button>
      </Stack>

      <Card>
        <CardContent>
          <Stack direction="row" spacing={2} mb={2}>
            <TextField placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} size="small"
              InputProps={{ startAdornment: <Icon icon="material-symbols:search" style={{ marginRight: 8 }} /> }} sx={{ width: 260 }} />
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Status</InputLabel>
              <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
                <MenuItem value="">All</MenuItem>
                {STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </Select>
            </FormControl>
          </Stack>

          {loading ? <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box> : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><b>Asset</b></TableCell>
                  <TableCell><b>Code</b></TableCell>
                  <TableCell><b>Category</b></TableCell>
                  <TableCell><b>Assigned To</b></TableCell>
                  <TableCell><b>Status</b></TableCell>
                  <TableCell align="right"><b>Actions</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assets.length === 0 ? <TableRow><TableCell colSpan={6} align="center">No assets found</TableCell></TableRow>
                  : assets.map((a) => (
                    <TableRow key={a._id} hover>
                      <TableCell>{a.name}{a.brand ? ` (${a.brand})` : ''}</TableCell>
                      <TableCell>{a.assetCode || '—'}</TableCell>
                      <TableCell>{a.category}</TableCell>
                      <TableCell>{a.assignedTo?.name || '—'}</TableCell>
                      <TableCell><Chip label={a.status} color={statusColor[a.status] || 'default'} size="small" /></TableCell>
                      <TableCell align="right">
                        {a.status === 'Available' && (
                          <Tooltip title="Assign"><IconButton size="small" onClick={() => setAssignDialog({ open: true, asset: a, employeeId: '', condition: 'Good' })}><Icon icon="material-symbols:person-add-outline" /></IconButton></Tooltip>
                        )}
                        {a.status === 'Assigned' && (
                          <Tooltip title="Return"><IconButton size="small" onClick={() => handleReturn(a._id)}><Icon icon="material-symbols:keyboard-return" /></IconButton></Tooltip>
                        )}
                        <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => handleDelete(a._id)}><Icon icon="material-symbols:delete-outline" /></IconButton></Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add Asset</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            {error && <Typography color="error" variant="body2">{error}</Typography>}
            <Grid container spacing={2}>
              <Grid size={6}><TextField label="Asset Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} fullWidth size="small" /></Grid>
              <Grid size={3}><TextField label="Asset Code" value={form.assetCode} onChange={(e) => setForm({ ...form, assetCode: e.target.value })} fullWidth size="small" /></Grid>
              <Grid size={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Category</InputLabel>
                  <Select value={form.category} label="Category" onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid size={4}><TextField label="Brand" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} fullWidth size="small" /></Grid>
              <Grid size={4}><TextField label="Model" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} fullWidth size="small" /></Grid>
              <Grid size={4}><TextField label="Serial Number" value={form.serialNumber} onChange={(e) => setForm({ ...form, serialNumber: e.target.value })} fullWidth size="small" /></Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid size={4}><TextField label="Purchase Date" type="date" value={form.purchaseDate} onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })} fullWidth size="small" InputLabelProps={{ shrink: true }} /></Grid>
              <Grid size={4}><TextField label="Purchase Price" type="number" value={form.purchasePrice} onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })} fullWidth size="small" /></Grid>
              <Grid size={4}><TextField label="Current Value" type="number" value={form.currentValue} onChange={(e) => setForm({ ...form, currentValue: e.target.value })} fullWidth size="small" /></Grid>
            </Grid>
            <TextField label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} fullWidth size="small" multiline rows={2} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>{saving ? <CircularProgress size={18} /> : 'Add Asset'}</Button>
        </DialogActions>
      </Dialog>

      {/* Assign Dialog */}
      <Dialog open={assignDialog.open} onClose={() => setAssignDialog({ ...assignDialog, open: false })} maxWidth="xs" fullWidth>
        <DialogTitle>Assign: {assignDialog.asset?.name}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <FormControl fullWidth size="small">
              <InputLabel>Employee *</InputLabel>
              <Select value={assignDialog.employeeId} label="Employee *" onChange={(e) => setAssignDialog({ ...assignDialog, employeeId: e.target.value })}>
                {employees.map((e) => <MenuItem key={e._id} value={e._id}>{e.name} ({e.employeeId})</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>Condition</InputLabel>
              <Select value={assignDialog.condition} label="Condition" onChange={(e) => setAssignDialog({ ...assignDialog, condition: e.target.value })}>
                {['Good', 'Fair', 'Damaged'].map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialog({ ...assignDialog, open: false })}>Cancel</Button>
          <Button variant="contained" onClick={handleAssign} disabled={saving}>{saving ? <CircularProgress size={18} /> : 'Assign'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AssetManagement;
