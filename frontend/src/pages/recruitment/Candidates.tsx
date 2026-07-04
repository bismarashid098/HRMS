import { useEffect, useState } from 'react';
import {
  Box, Button, Card, CardContent, Chip, Table, TableBody, TableCell,
  TableHead, TableRow, Typography, CircularProgress, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Tooltip, Stack,
  MenuItem, Select, FormControl, InputLabel,
} from '@mui/material';
import { Icon } from '@iconify/react';
import { useSearchParams } from 'react-router';
import api from 'api/axios';

interface Candidate {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  status: string;
  source: string;
  jobPosting?: { _id: string; title: string };
  createdAt: string;
}

interface Job { _id: string; title: string; }

const STATUSES = ['Applied', 'Shortlisted', 'Interviewed', 'Offered', 'Hired', 'Rejected', 'Withdrawn'];
const SOURCES = ['LinkedIn', 'Indeed', 'Referral', 'Walk-in', 'Website', 'Other'];
const emptyForm = { name: '', email: '', phone: '', source: 'Other', notes: '', jobPosting: '' };

const statusColor: Record<string, 'default' | 'info' | 'warning' | 'success' | 'error' | 'primary'> = {
  Applied: 'default', Shortlisted: 'info', Interviewed: 'warning',
  Offered: 'primary', Hired: 'success', Rejected: 'error', Withdrawn: 'default',
};

const Candidates = () => {
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get('jobPosting') || '';
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [open, setOpen] = useState(false);
  const [statusDialog, setStatusDialog] = useState<{ open: boolean; candidate: Candidate | null; status: string; notes: string }>({ open: false, candidate: null, status: '', notes: '' });
  const [form, setForm] = useState({ ...emptyForm, jobPosting: jobId });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cRes, jRes] = await Promise.all([
        api.get('/recruitment/candidates', { params: { search, status: statusFilter || undefined, jobPosting: jobId || undefined, limit: 50 } }),
        api.get('/recruitment/jobs', { params: { status: 'Open', limit: 100 } }),
      ]);
      setCandidates(cRes.data.candidates || []);
      setJobs(jRes.data.jobs || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [search, statusFilter, jobId]);

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Name is required'); return; }
    if (!form.jobPosting) { setError('Job posting is required'); return; }
    setSaving(true);
    try {
      await api.post('/recruitment/candidates', form);
      setOpen(false);
      setForm({ ...emptyForm, jobPosting: jobId });
      fetchData();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to add candidate');
    } finally { setSaving(false); }
  };

  const handleStatusUpdate = async () => {
    if (!statusDialog.candidate || !statusDialog.status) return;
    setSaving(true);
    try {
      await api.put(`/recruitment/candidates/${statusDialog.candidate._id}/status`, { status: statusDialog.status, notes: statusDialog.notes });
      setStatusDialog({ open: false, candidate: null, status: '', notes: '' });
      fetchData();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to update status');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this candidate?')) return;
    try { await api.delete(`/recruitment/candidates/${id}`); fetchData(); }
    catch (e: any) { alert(e.response?.data?.message || 'Cannot delete'); }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>Candidates</Typography>
        <Button variant="contained" startIcon={<Icon icon="material-symbols:add" />} onClick={() => { setForm({ ...emptyForm, jobPosting: jobId }); setError(''); setOpen(true); }}>Add Candidate</Button>
      </Stack>

      <Card>
        <CardContent>
          <Stack direction="row" spacing={2} mb={2} flexWrap="wrap">
            <TextField placeholder="Search candidates..." value={search} onChange={(e) => setSearch(e.target.value)} size="small"
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
                  <TableCell><b>Name</b></TableCell>
                  <TableCell><b>Job</b></TableCell>
                  <TableCell><b>Email</b></TableCell>
                  <TableCell><b>Phone</b></TableCell>
                  <TableCell><b>Source</b></TableCell>
                  <TableCell><b>Status</b></TableCell>
                  <TableCell align="right"><b>Actions</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {candidates.length === 0 ? <TableRow><TableCell colSpan={7} align="center">No candidates found</TableCell></TableRow>
                  : candidates.map((c) => (
                    <TableRow key={c._id} hover>
                      <TableCell>{c.name}</TableCell>
                      <TableCell>{c.jobPosting?.title || '—'}</TableCell>
                      <TableCell>{c.email || '—'}</TableCell>
                      <TableCell>{c.phone || '—'}</TableCell>
                      <TableCell>{c.source}</TableCell>
                      <TableCell><Chip label={c.status} color={statusColor[c.status]} size="small" /></TableCell>
                      <TableCell align="right">
                        <Tooltip title="Update Status">
                          <IconButton size="small" onClick={() => setStatusDialog({ open: true, candidate: c, status: c.status, notes: '' })}>
                            <Icon icon="material-symbols:update" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => handleDelete(c._id)}><Icon icon="material-symbols:delete-outline" /></IconButton></Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Candidate</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            {error && <Typography color="error" variant="body2">{error}</Typography>}
            <FormControl fullWidth size="small">
              <InputLabel>Job Posting *</InputLabel>
              <Select value={form.jobPosting} label="Job Posting *" onChange={(e) => setForm({ ...form, jobPosting: e.target.value })}>
                {jobs.map((j) => <MenuItem key={j._id} value={j._id}>{j.title}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Full Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} fullWidth size="small" />
            <TextField label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} fullWidth size="small" />
            <TextField label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} fullWidth size="small" />
            <FormControl fullWidth size="small">
              <InputLabel>Source</InputLabel>
              <Select value={form.source} label="Source" onChange={(e) => setForm({ ...form, source: e.target.value })}>
                {SOURCES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} fullWidth size="small" multiline rows={2} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? <CircularProgress size={18} /> : 'Add Candidate'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={statusDialog.open} onClose={() => setStatusDialog({ ...statusDialog, open: false })} maxWidth="xs" fullWidth>
        <DialogTitle>Update Candidate Status</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <Typography variant="body2">Candidate: <b>{statusDialog.candidate?.name}</b></Typography>
            <FormControl fullWidth size="small">
              <InputLabel>New Status</InputLabel>
              <Select value={statusDialog.status} label="New Status" onChange={(e) => setStatusDialog({ ...statusDialog, status: e.target.value })}>
                {STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Notes" value={statusDialog.notes} onChange={(e) => setStatusDialog({ ...statusDialog, notes: e.target.value })} fullWidth size="small" multiline rows={2} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialog({ ...statusDialog, open: false })}>Cancel</Button>
          <Button variant="contained" onClick={handleStatusUpdate} disabled={saving}>
            {saving ? <CircularProgress size={18} /> : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Candidates;
