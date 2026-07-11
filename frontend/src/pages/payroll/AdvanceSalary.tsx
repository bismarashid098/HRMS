import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  CircularProgress,
} from '@mui/material';
import api from 'api/axios';

const AdvanceSalary = () => {
  const [advances, setAdvances] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    employee: '',
    amount: '',
    reason: '',
    date: new Date().toISOString().slice(0, 10),
  });
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchAdvances = () => {
    setLoading(true);
    api
      .get('/advances')
      .then((res) => setAdvances(res.data.advances || res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAdvances();
    api
      .get('/employees')
      .then((res) => setEmployees(res.data.employees || res.data || []))
      .catch(console.error);
  }, []);

  const handleSubmit = async () => {
    if (!form.employee || !form.amount || !form.reason) return;
    try {
      const d = new Date(form.date);
      await api.post('/advances', {
        employeeId: form.employee,
        amount: Number(form.amount),
        reason: form.reason,
        date: form.date,
        month: d.getMonth() + 1,
        year: d.getFullYear(),
      });
      setOpen(false);
      setForm({
        employee: '',
        amount: '',
        reason: '',
        date: new Date().toISOString().slice(0, 10),
      });
      fetchAdvances();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to add advance');
    }
  };

  const handleAction = async (id: string, status: string) => {
    setActionLoading(id);
    try {
      await api.put(`/advances/${id}`, { status });
      fetchAdvances();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const statusColor: any = {
    Pending: 'warning',
    Approved: 'success',
    Rejected: 'error',
    Paid: 'info',
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 1.5, mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          Advance Salary
        </Typography>
        <Button variant="contained" onClick={() => setOpen(true)}>
          Add Advance
        </Button>
      </Box>
      <Card>
        <CardContent>
          {loading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {advances.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No advances found
                    </TableCell>
                  </TableRow>
                ) : (
                  advances.map((a: any) => (
                    <TableRow key={a._id}>
                      <TableCell>{a.employee?.name || '—'}</TableCell>
                      <TableCell>PKR {a.amount?.toLocaleString()}</TableCell>
                      <TableCell>{a.reason}</TableCell>
                      <TableCell>{a.date?.slice(0, 10)}</TableCell>
                      <TableCell>
                        <Chip
                          label={a.status}
                          size="small"
                          color={statusColor[a.status] || 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        {a.status === 'Pending' && (
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              disabled={actionLoading === a._id}
                              onClick={() => handleAction(a._id, 'Approved')}
                            >
                              Approve
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              disabled={actionLoading === a._id}
                              onClick={() => handleAction(a._id, 'Rejected')}
                            >
                              Reject
                            </Button>
                          </Box>
                        )}
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

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Advance Salary</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              select
              label="Employee"
              value={form.employee}
              onChange={(e) => setForm((f) => ({ ...f, employee: e.target.value }))}
            >
              {employees.map((e) => (
                <MenuItem key={e._id} value={e._id}>
                  {e.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Amount"
              type="number"
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
            />
            <TextField
              label="Reason"
              value={form.reason}
              onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
              multiline
              rows={2}
            />
            <TextField
              label="Date"
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdvanceSalary;
