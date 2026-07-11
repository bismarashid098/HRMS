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
import { useNavigate } from 'react-router';
import api from 'api/axios';

interface Job {
  _id: string;
  title: string;
  department?: { name: string };
  employmentType: string;
  vacancies: number;
  status: string;
  lastDate?: string;
  createdAt: string;
}

const STATUSES = ['Open', 'Closed', 'On Hold'];
const TYPES = ['Full-Time', 'Part-Time', 'Contract', 'Internship'];
const emptyForm = {
  title: '',
  description: '',
  requirements: '',
  vacancies: '1',
  employmentType: 'Full-Time',
  salaryMin: '',
  salaryMax: '',
  lastDate: '',
  status: 'Open',
};

const statusColor: Record<string, 'success' | 'error' | 'warning'> = {
  Open: 'success',
  Closed: 'error',
  'On Hold': 'warning',
};

const JobPostings = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Job | null>(null);
  const [form, setForm] = useState<typeof emptyForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/recruitment/jobs', {
        params: { search, status: statusFilter || undefined, limit: 50 },
      });
      setJobs(res.data.jobs || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, statusFilter]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setOpen(true);
  };
  const openEdit = (j: Job) => {
    setEditing(j);
    setForm({
      title: j.title,
      description: '',
      requirements: '',
      vacancies: String(j.vacancies),
      employmentType: j.employmentType,
      salaryMin: '',
      salaryMax: '',
      lastDate: j.lastDate?.slice(0, 10) || '',
      status: j.status,
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
      setError('Job title is required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        vacancies: Number(form.vacancies),
        lastDate: form.lastDate || undefined,
        salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
        salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined,
      };
      if (editing) await api.put(`/recruitment/jobs/${editing._id}`, payload);
      else await api.post('/recruitment/jobs', payload);
      handleClose();
      fetchData();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this job posting and all associated candidates?')) return;
    try {
      await api.delete(`/recruitment/jobs/${id}`);
      fetchData();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Cannot delete');
    }
  };

  const f =
    (k: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm({ ...form, [k]: e.target.value });

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} gap={1.5} mb={3}>
        <Typography variant="h5" fontWeight={700}>
          Job Postings
        </Typography>
        <Button
          variant="contained"
          startIcon={<Icon icon="material-symbols:add" />}
          onClick={openCreate}
        >
          Post Job
        </Button>
      </Stack>

      <Card>
        <CardContent>
          <Stack direction="row" spacing={2} mb={2} flexWrap="wrap">
            <TextField
              placeholder="Search jobs..."
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
                    <b>Type</b>
                  </TableCell>
                  <TableCell>
                    <b>Vacancies</b>
                  </TableCell>
                  <TableCell>
                    <b>Status</b>
                  </TableCell>
                  <TableCell>
                    <b>Last Date</b>
                  </TableCell>
                  <TableCell align="right">
                    <b>Actions</b>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {jobs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No job postings found
                    </TableCell>
                  </TableRow>
                ) : (
                  jobs.map((j) => (
                    <TableRow key={j._id} hover>
                      <TableCell>{j.title}</TableCell>
                      <TableCell>{j.department?.name || '—'}</TableCell>
                      <TableCell>{j.employmentType}</TableCell>
                      <TableCell>{j.vacancies}</TableCell>
                      <TableCell>
                        <Chip
                          label={j.status}
                          color={statusColor[j.status] || 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {j.lastDate ? new Date(j.lastDate).toLocaleDateString() : '—'}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="View Candidates">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/recruitment/candidates?jobPosting=${j._id}`)}
                          >
                            <Icon icon="material-symbols:people-outline" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => openEdit(j)}>
                            <Icon icon="material-symbols:edit-outline" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(j._id)}
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

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editing ? 'Edit Job Posting' : 'Post New Job'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            {error && (
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            )}
            <TextField
              label="Job Title *"
              value={form.title}
              onChange={f('title')}
              fullWidth
              size="small"
            />
            <Grid container spacing={2}>
              <Grid size={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Employment Type</InputLabel>
                  <Select
                    value={form.employmentType}
                    label="Employment Type"
                    onChange={(e) => setForm({ ...form, employmentType: e.target.value })}
                  >
                    {TYPES.map((t) => (
                      <MenuItem key={t} value={t}>
                        {t}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={2}>
                <TextField
                  label="Vacancies"
                  type="number"
                  value={form.vacancies}
                  onChange={f('vacancies')}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid size={3}>
                <TextField
                  label="Salary Min"
                  type="number"
                  value={form.salaryMin}
                  onChange={f('salaryMin')}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid size={3}>
                <TextField
                  label="Salary Max"
                  type="number"
                  value={form.salaryMax}
                  onChange={f('salaryMax')}
                  fullWidth
                  size="small"
                />
              </Grid>
            </Grid>
            <TextField
              label="Last Date"
              type="date"
              value={form.lastDate}
              onChange={f('lastDate')}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Job Description"
              value={form.description}
              onChange={f('description')}
              fullWidth
              size="small"
              multiline
              rows={3}
            />
            <TextField
              label="Requirements"
              value={form.requirements}
              onChange={f('requirements')}
              fullWidth
              size="small"
              multiline
              rows={3}
            />
            {editing && (
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={form.status}
                  label="Status"
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  {STATUSES.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? <CircularProgress size={18} /> : editing ? 'Update' : 'Post Job'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default JobPostings;
