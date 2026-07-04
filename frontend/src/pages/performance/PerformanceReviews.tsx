import { useEffect, useState } from 'react';
import {
  Box, Button, Card, CardContent, Chip, Table, TableBody, TableCell,
  TableHead, TableRow, Typography, CircularProgress, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Tooltip, Stack,
  MenuItem, Select, FormControl, InputLabel, Rating,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { Icon } from '@iconify/react';
import api from 'api/axios';

interface Review {
  _id: string;
  employee: { name: string; employeeId: string; department: string };
  type: string;
  period: { from: string; to: string };
  overallScore?: number;
  rating?: string;
  status: string;
}

interface Employee { _id: string; name: string; employeeId: string; }

const TYPES = ['Annual', 'Probation', 'Mid-Year', 'Quarterly'];
const RATINGS = ['Exceptional', 'Exceeds Expectations', 'Meets Expectations', 'Below Expectations', 'Unsatisfactory'];
const STATUSES = ['Draft', 'Submitted', 'Acknowledged'];
const currentYear = new Date().getFullYear();

const ratingColor: Record<string, 'success' | 'info' | 'warning' | 'error' | 'default'> = {
  Exceptional: 'success', 'Exceeds Expectations': 'success', 'Meets Expectations': 'info',
  'Below Expectations': 'warning', Unsatisfactory: 'error',
};

const PerformanceReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(String(currentYear));
  const [open, setOpen] = useState(false);
  const [viewing, setViewing] = useState<Review | null>(null);
  const [form, setForm] = useState({ employee: '', type: 'Annual', periodFrom: `${currentYear}-01-01`, periodTo: `${currentYear}-12-31`, strengths: '', improvements: '', goals: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rRes, eRes] = await Promise.all([
        api.get('/performance', { params: { year, limit: 50 } }),
        api.get('/employees', { params: { limit: 200 } }),
      ]);
      setReviews(rRes.data.reviews || []);
      setEmployees(eRes.data.employees || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [year]);

  const handleSave = async () => {
    if (!form.employee) { setError('Employee is required'); return; }
    setSaving(true);
    try {
      await api.post('/performance', { ...form, period: { from: form.periodFrom, to: form.periodTo } });
      setOpen(false);
      fetchData();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to create review');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this review?')) return;
    try { await api.delete(`/performance/${id}`); fetchData(); }
    catch (e: any) { alert(e.response?.data?.message || 'Cannot delete'); }
  };

  const statusColor: Record<string, 'default' | 'warning' | 'success'> = { Draft: 'default', Submitted: 'warning', Acknowledged: 'success' };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>Performance Reviews</Typography>
        <Stack direction="row" spacing={2}>
          <TextField label="Year" value={year} onChange={(e) => setYear(e.target.value)} size="small" sx={{ width: 100 }} />
          <Button variant="contained" startIcon={<Icon icon="material-symbols:add" />} onClick={() => { setError(''); setOpen(true); }}>New Review</Button>
        </Stack>
      </Stack>

      <Card>
        <CardContent>
          {loading ? <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box> : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><b>Employee</b></TableCell>
                  <TableCell><b>Department</b></TableCell>
                  <TableCell><b>Type</b></TableCell>
                  <TableCell><b>Period</b></TableCell>
                  <TableCell><b>Score</b></TableCell>
                  <TableCell><b>Rating</b></TableCell>
                  <TableCell><b>Status</b></TableCell>
                  <TableCell align="right"><b>Actions</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reviews.length === 0 ? <TableRow><TableCell colSpan={8} align="center">No reviews found</TableCell></TableRow>
                  : reviews.map((r) => (
                    <TableRow key={r._id} hover>
                      <TableCell>{r.employee?.name}</TableCell>
                      <TableCell>{r.employee?.department || '—'}</TableCell>
                      <TableCell>{r.type}</TableCell>
                      <TableCell>{new Date(r.period.from).toLocaleDateString()} – {new Date(r.period.to).toLocaleDateString()}</TableCell>
                      <TableCell>{r.overallScore != null ? `${r.overallScore}/10` : '—'}</TableCell>
                      <TableCell>{r.rating ? <Chip label={r.rating} color={ratingColor[r.rating] || 'default'} size="small" /> : '—'}</TableCell>
                      <TableCell><Chip label={r.status} color={statusColor[r.status] || 'default'} size="small" /></TableCell>
                      <TableCell align="right">
                        <Tooltip title="View"><IconButton size="small" onClick={() => setViewing(r)}><Icon icon="material-symbols:visibility-outline" /></IconButton></Tooltip>
                        <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => handleDelete(r._id)}><Icon icon="material-symbols:delete-outline" /></IconButton></Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New Performance Review</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            {error && <Typography color="error" variant="body2">{error}</Typography>}
            <FormControl fullWidth size="small">
              <InputLabel>Employee *</InputLabel>
              <Select value={form.employee} label="Employee *" onChange={(e) => setForm({ ...form, employee: e.target.value })}>
                {employees.map((e) => <MenuItem key={e._id} value={e._id}>{e.name} ({e.employeeId})</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>Review Type</InputLabel>
              <Select value={form.type} label="Review Type" onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </Select>
            </FormControl>
            <Grid container spacing={2}>
              <Grid size={6}><TextField label="Period From" type="date" value={form.periodFrom} onChange={(e) => setForm({ ...form, periodFrom: e.target.value })} fullWidth size="small" InputLabelProps={{ shrink: true }} /></Grid>
              <Grid size={6}><TextField label="Period To" type="date" value={form.periodTo} onChange={(e) => setForm({ ...form, periodTo: e.target.value })} fullWidth size="small" InputLabelProps={{ shrink: true }} /></Grid>
            </Grid>
            <TextField label="Strengths" value={form.strengths} onChange={(e) => setForm({ ...form, strengths: e.target.value })} fullWidth size="small" multiline rows={2} />
            <TextField label="Areas for Improvement" value={form.improvements} onChange={(e) => setForm({ ...form, improvements: e.target.value })} fullWidth size="small" multiline rows={2} />
            <TextField label="Goals" value={form.goals} onChange={(e) => setForm({ ...form, goals: e.target.value })} fullWidth size="small" multiline rows={2} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? <CircularProgress size={18} /> : 'Create Review'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={!!viewing} onClose={() => setViewing(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Performance Review — {viewing?.employee?.name}</DialogTitle>
        <DialogContent>
          {viewing && (
            <Stack spacing={1} mt={1}>
              <Typography variant="body2"><b>Type:</b> {viewing.type}</Typography>
              <Typography variant="body2"><b>Period:</b> {new Date(viewing.period.from).toLocaleDateString()} – {new Date(viewing.period.to).toLocaleDateString()}</Typography>
              {viewing.overallScore != null && <Typography variant="body2"><b>Score:</b> {viewing.overallScore}/10</Typography>}
              {viewing.rating && <Typography variant="body2"><b>Rating:</b> {viewing.rating}</Typography>}
              <Typography variant="body2"><b>Status:</b> {viewing.status}</Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewing(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PerformanceReviews;
