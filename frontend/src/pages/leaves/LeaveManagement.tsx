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
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Icon } from '@iconify/react';
import api from 'api/axios';
import { useAuth } from 'context/AuthContext';

interface Leave {
  _id: string;
  employee: { _id: string; name: string; department: string } | null;
  type: 'Casual' | 'Sick' | 'Annual';
  fromDate: string;
  toDate: string;
  totalDays: number;
  paid: boolean;
  status: 'Pending' | 'Approved' | 'Rejected';
  reason?: string;
}

interface Employee {
  _id: string;
  name: string;
  department: string;
}

const LEAVE_TYPES = ['Casual', 'Sick', 'Annual'] as const;
const STATUSES = ['Pending', 'Approved', 'Rejected'] as const;

const defaultApplyForm = {
  employeeId: '',
  type: 'Casual' as Leave['type'],
  fromDate: '',
  toDate: '',
  reason: '',
};

const defaultEditForm = {
  type: 'Casual' as Leave['type'],
  fromDate: '',
  toDate: '',
  reason: '',
  status: 'Pending' as Leave['status'],
};

const statusColor: Record<string, 'warning' | 'success' | 'error'> = {
  Pending: 'warning',
  Approved: 'success',
  Rejected: 'error',
};

const typeColor: Record<string, 'info' | 'warning' | 'success'> = {
  Casual: 'info',
  Sick: 'warning',
  Annual: 'success',
};

const LeaveManagement = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';

  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Apply Leave dialog
  const [applyOpen, setApplyOpen] = useState(false);
  const [applyForm, setApplyForm] = useState({ ...defaultApplyForm });
  const [applyLoading, setApplyLoading] = useState(false);

  // Edit Leave dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editLeave, setEditLeave] = useState<Leave | null>(null);
  const [editForm, setEditForm] = useState({ ...defaultEditForm });
  const [editLoading, setEditLoading] = useState(false);

  // Delete confirmation
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchLeaves = () => {
    setLoading(true);
    api
      .get('/leaves')
      .then((res) => setLeaves(res.data.leaves || res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLeaves();
    if (isAdmin) {
      api
        .get('/employees')
        .then((res) => setEmployees(res.data.employees || res.data || []))
        .catch(console.error);
    }
  }, [isAdmin]);

  const handleAction = async (id: string, status: 'Approved' | 'Rejected') => {
    setActionLoading(id);
    try {
      await api.put(`/leaves/${id}`, { status });
      fetchLeaves();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const handleApplySubmit = async () => {
    setApplyLoading(true);
    try {
      await api.post('/leaves', applyForm);
      setApplyOpen(false);
      setApplyForm({ ...defaultApplyForm });
      fetchLeaves();
    } catch (e) {
      console.error(e);
    } finally {
      setApplyLoading(false);
    }
  };

  const openEdit = (leave: Leave) => {
    setEditLeave(leave);
    setEditForm({
      type: leave.type,
      fromDate: leave.fromDate.slice(0, 10),
      toDate: leave.toDate.slice(0, 10),
      reason: leave.reason || '',
      status: leave.status,
    });
    setEditOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!editLeave) return;
    setEditLoading(true);
    try {
      await api.patch(`/leaves/${editLeave._id}`, editForm);
      setEditOpen(false);
      fetchLeaves();
    } catch (e) {
      console.error(e);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/leaves/${deleteId}`);
      setDeleteId(null);
      fetchLeaves();
    } catch (e) {
      console.error(e);
    } finally {
      setDeleteLoading(false);
    }
  };

  const filtered = leaves.filter((l) => {
    const matchStatus = filter === 'all' || l.status === filter;
    const matchSearch = !search || l.employee?.name?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 1.5, mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          Leave Management
        </Typography>
        {isAdmin && (
          <Button
            variant="contained"
            startIcon={<Icon icon="material-symbols:add-rounded" />}
            onClick={() => setApplyOpen(true)}
          >
            Apply Leave
          </Button>
        )}
      </Box>

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder="Search employee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Icon icon="material-symbols:search-rounded" />
                  </InputAdornment>
                ),
              }}
            />
            <Select
              size="small"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              sx={{ minWidth: 130 }}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Approved">Approved</MenuItem>
              <MenuItem value="Rejected">Rejected</MenuItem>
            </Select>
          </Box>

          {loading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>From</TableCell>
                  <TableCell>To</TableCell>
                  <TableCell>Days</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No leave records found
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((l) => (
                    <TableRow key={l._id}>
                      <TableCell>{l.employee?.name || '—'}</TableCell>
                      <TableCell>
                        <Chip label={l.type} size="small" color={typeColor[l.type] || 'default'} />
                      </TableCell>
                      <TableCell>{l.fromDate?.slice(0, 10)}</TableCell>
                      <TableCell>{l.toDate?.slice(0, 10)}</TableCell>
                      <TableCell>{l.totalDays}</TableCell>
                      <TableCell
                        sx={{
                          maxWidth: 150,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {l.reason}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={l.status}
                          size="small"
                          color={statusColor[l.status] || 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{ display: 'flex', gap: 0.5, alignItems: 'center', flexWrap: 'wrap' }}
                        >
                          {l.status === 'Pending' && (
                            <>
                              <Button
                                size="small"
                                variant="contained"
                                color="success"
                                disabled={actionLoading === l._id}
                                onClick={() => handleAction(l._id, 'Approved')}
                              >
                                Approve
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                disabled={actionLoading === l._id}
                                onClick={() => handleAction(l._id, 'Rejected')}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          {isAdmin && (
                            <>
                              <Tooltip title="Edit">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => openEdit(l)}
                                >
                                  <Icon icon="material-symbols:edit-outline-rounded" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => setDeleteId(l._id)}
                                >
                                  <Icon icon="material-symbols:delete-outline-rounded" />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Apply Leave Dialog (Admin only) */}
      <Dialog open={applyOpen} onClose={() => setApplyOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Apply Leave</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Employee</InputLabel>
              <Select
                label="Employee"
                value={applyForm.employeeId}
                onChange={(e) => setApplyForm((f) => ({ ...f, employeeId: e.target.value }))}
              >
                {employees.map((emp) => (
                  <MenuItem key={emp._id} value={emp._id}>
                    {emp.name} — {emp.department}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth>
              <InputLabel>Leave Type</InputLabel>
              <Select
                label="Leave Type"
                value={applyForm.type}
                onChange={(e) =>
                  setApplyForm((f) => ({ ...f, type: e.target.value as Leave['type'] }))
                }
              >
                {LEAVE_TYPES.map((t) => (
                  <MenuItem key={t} value={t}>
                    {t}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              size="small"
              label="From Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={applyForm.fromDate}
              onChange={(e) => setApplyForm((f) => ({ ...f, fromDate: e.target.value }))}
            />
            <TextField
              size="small"
              label="To Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={applyForm.toDate}
              onChange={(e) => setApplyForm((f) => ({ ...f, toDate: e.target.value }))}
            />
            <TextField
              size="small"
              label="Reason"
              multiline
              rows={3}
              value={applyForm.reason}
              onChange={(e) => setApplyForm((f) => ({ ...f, reason: e.target.value }))}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApplyOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleApplySubmit}
            disabled={
              applyLoading || !applyForm.employeeId || !applyForm.fromDate || !applyForm.toDate
            }
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Leave Dialog (Admin only) */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Leave — {editLeave?.employee?.name}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Leave Type</InputLabel>
              <Select
                label="Leave Type"
                value={editForm.type}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, type: e.target.value as Leave['type'] }))
                }
              >
                {LEAVE_TYPES.map((t) => (
                  <MenuItem key={t} value={t}>
                    {t}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              size="small"
              label="From Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={editForm.fromDate}
              onChange={(e) => setEditForm((f) => ({ ...f, fromDate: e.target.value }))}
            />
            <TextField
              size="small"
              label="To Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={editForm.toDate}
              onChange={(e) => setEditForm((f) => ({ ...f, toDate: e.target.value }))}
            />
            <TextField
              size="small"
              label="Reason"
              multiline
              rows={3}
              value={editForm.reason}
              onChange={(e) => setEditForm((f) => ({ ...f, reason: e.target.value }))}
            />
            <FormControl size="small" fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={editForm.status}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, status: e.target.value as Leave['status'] }))
                }
              >
                {STATUSES.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleEditSubmit}
            disabled={editLoading || !editForm.fromDate || !editForm.toDate}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog (Admin only) */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Leave Request</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this leave request? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete} disabled={deleteLoading}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LeaveManagement;
