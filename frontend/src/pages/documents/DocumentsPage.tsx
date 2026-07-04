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

interface Document {
  _id: string;
  title: string;
  type: string;
  employee?: { name: string; employeeId: string };
  fileUrl: string;
  fileName?: string;
  mimeType?: string;
  expiryDate?: string;
  isSharedWithEmployee: boolean;
  createdAt: string;
}

interface Employee {
  _id: string;
  name: string;
  employeeId: string;
}

const DOC_TYPES = [
  'CNIC',
  'Passport',
  'Degree',
  'Experience Letter',
  'Contract',
  'Offer Letter',
  'Warning Letter',
  'Policy',
  'Other',
];

const DocumentsPage = () => {
  const [docs, setDocs] = useState<Document[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    employee: '',
    title: '',
    type: 'Other',
    expiryDate: '',
    notes: '',
    isSharedWithEmployee: 'false',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dRes, eRes] = await Promise.all([
        api.get('/documents', { params: { type: typeFilter || undefined, limit: 50 } }),
        api.get('/employees', { params: { limit: 200 } }),
      ]);
      setDocs(dRes.data.documents || []);
      setEmployees(eRes.data.employees || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [typeFilter]);

  const handleUpload = async () => {
    if (!file) {
      setError('File is required');
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      Object.entries(form).forEach(([k, v]) => {
        if (v) fd.append(k, v);
      });
      await api.post('/documents', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setOpen(false);
      setFile(null);
      setForm({
        employee: '',
        title: '',
        type: 'Other',
        expiryDate: '',
        notes: '',
        isSharedWithEmployee: 'false',
      });
      fetchData();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to upload');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this document permanently?')) return;
    try {
      await api.delete(`/documents/${id}`);
      fetchData();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Cannot delete');
    }
  };

  const getFileIcon = (mime?: string) => {
    if (!mime) return 'material-symbols:description-outline';
    if (mime.includes('image')) return 'material-symbols:image-outline';
    if (mime.includes('pdf')) return 'material-symbols:picture-as-pdf-outline';
    return 'material-symbols:description-outline';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>
          Documents
        </Typography>
        <Button
          variant="contained"
          startIcon={<Icon icon="material-symbols:upload" />}
          onClick={() => {
            setError('');
            setOpen(true);
          }}
        >
          Upload Document
        </Button>
      </Stack>

      <Card>
        <CardContent>
          <FormControl size="small" sx={{ mb: 2, minWidth: 180 }}>
            <InputLabel>Type</InputLabel>
            <Select value={typeFilter} label="Type" onChange={(e) => setTypeFilter(e.target.value)}>
              <MenuItem value="">All Types</MenuItem>
              {DOC_TYPES.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

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
                    <b>Employee</b>
                  </TableCell>
                  <TableCell>
                    <b>Expiry</b>
                  </TableCell>
                  <TableCell>
                    <b>Uploaded</b>
                  </TableCell>
                  <TableCell align="right">
                    <b>Actions</b>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {docs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No documents found
                    </TableCell>
                  </TableRow>
                ) : (
                  docs.map((d) => (
                    <TableRow key={d._id} hover>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Icon icon={getFileIcon(d.mimeType)} />
                          <span>{d.title}</span>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip label={d.type} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>{d.employee?.name || '—'}</TableCell>
                      <TableCell>
                        {d.expiryDate ? new Date(d.expiryDate).toLocaleDateString() : '—'}
                      </TableCell>
                      <TableCell>{new Date(d.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Download/View">
                          <IconButton size="small" component="a" href={d.fileUrl} target="_blank">
                            <Icon icon="material-symbols:download-outline" />
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
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Document</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            {error && (
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            )}
            <Button
              variant="outlined"
              component="label"
              startIcon={<Icon icon="material-symbols:upload" />}
            >
              {file ? file.name : 'Select File *'}
              <input type="file" hidden onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </Button>
            <TextField
              label="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              fullWidth
              size="small"
              placeholder="Leave blank to use filename"
            />
            <Grid container spacing={2}>
              <Grid size={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Document Type</InputLabel>
                  <Select
                    value={form.type}
                    label="Document Type"
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                  >
                    {DOC_TYPES.map((t) => (
                      <MenuItem key={t} value={t}>
                        {t}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Employee</InputLabel>
                  <Select
                    value={form.employee}
                    label="Employee"
                    onChange={(e) => setForm({ ...form, employee: e.target.value })}
                  >
                    <MenuItem value="">Company-wide</MenuItem>
                    {employees.map((e) => (
                      <MenuItem key={e._id} value={e._id}>
                        {e.name} ({e.employeeId})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <TextField
              label="Expiry Date"
              type="date"
              value={form.expiryDate}
              onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              fullWidth
              size="small"
              multiline
              rows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpload} disabled={saving}>
            {saving ? <CircularProgress size={18} /> : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DocumentsPage;
