import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  CircularProgress,
  Stack,
  Alert,
} from '@mui/material';
import { Icon } from '@iconify/react';
import { alpha, useTheme } from '@mui/material/styles';
import api from 'api/axios';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const PayrollPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [overview, setOverview] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchOverview = () => {
    setLoading(true);
    api
      .get(`/payroll/overview?month=${month}&year=${year}`)
      .then((res) => setOverview(Array.isArray(res.data) ? res.data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOverview();
  }, [month, year]);

  const handleGenerate = async (employeeId: string, name: string) => {
    setActionLoading(employeeId);
    setError('');
    try {
      await api.post('/payroll/generate', { employeeId, month, year });
      setSuccess(`Payroll generated for ${name}`);
      setTimeout(() => setSuccess(''), 3000);
      fetchOverview();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to generate payroll');
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = async (payrollId: string, name: string) => {
    setActionLoading(payrollId);
    setError('');
    try {
      await api.put(`/payroll/${payrollId}/approve`);
      setSuccess(`Payroll approved for ${name}`);
      setTimeout(() => setSuccess(''), 3000);
      fetchOverview();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to approve payroll');
    } finally {
      setActionLoading(null);
    }
  };

  const generated = overview.filter((e) => e.payrollStatus !== 'Not Generated').length;
  const approved = overview.filter((e) => e.payrollStatus === 'Approved').length;
  const totalNet = overview
    .filter((e) => e.payrollStatus !== 'Not Generated')
    .reduce((s, e) => s + (e.netSalary || 0), 0);

  const statusColor = (s: string) =>
    s === 'Approved' ? 'success' : s === 'Generated' ? 'info' : 'default';

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}
      >
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Payroll
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Generate and approve monthly payroll for all employees
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Filters + Summary */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            gap={2}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Select
                size="small"
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                sx={{ minWidth: 100 }}
              >
                {MONTHS.map((m, i) => (
                  <MenuItem key={i} value={i + 1}>
                    {m}
                  </MenuItem>
                ))}
              </Select>
              <TextField
                label="Year"
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                size="small"
                sx={{ width: 100 }}
              />
            </Stack>
            {!loading && overview.length > 0 && (
              <Stack direction="row" spacing={1.5} flexWrap="wrap">
                <Chip
                  icon={<Icon icon="material-symbols:people-outline-rounded" width={14} />}
                  label={`${overview.length} employees`}
                  size="small"
                />
                <Chip
                  icon={<Icon icon="material-symbols:receipt-outline-rounded" width={14} />}
                  label={`${generated} generated`}
                  size="small"
                  color="info"
                />
                <Chip
                  icon={<Icon icon="material-symbols:check-circle-outline-rounded" width={14} />}
                  label={`${approved} approved`}
                  size="small"
                  color="success"
                />
                <Chip
                  label={`Total: PKR ${totalNet.toLocaleString()}`}
                  size="small"
                  sx={{
                    bgcolor: alpha(theme.palette.success.main, 0.1),
                    color: 'success.main',
                    fontWeight: 700,
                  }}
                />
              </Stack>
            )}
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          {loading ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Employee</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Department</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    Basic Salary
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>
                    Present / Working
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    Deductions
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    Net Pay
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {overview.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">No active employees found</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  overview.map((e: any) => {
                    const busy = actionLoading === e.employeeId || actionLoading === e.payrollId;
                    return (
                      <TableRow key={e.employeeId} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {e.name || '—'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {e.employeeCode}
                          </Typography>
                        </TableCell>
                        <TableCell>{e.department || '—'}</TableCell>
                        <TableCell align="right">
                          PKR {(e.basicSalary || 0).toLocaleString()}
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2">
                            {e.presentDays ?? '—'} / {e.workingDays ?? '—'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ color: 'error.main' }}>
                          PKR {(e.totalDeductions || 0).toLocaleString()}
                        </TableCell>
                        <TableCell align="right">
                          <strong>PKR {(e.netSalary || 0).toLocaleString()}</strong>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={e.payrollStatus}
                            size="small"
                            color={statusColor(e.payrollStatus)}
                          />
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={0.5}>
                            {e.payrollStatus === 'Not Generated' && (
                              <Button
                                size="small"
                                variant="contained"
                                disabled={busy}
                                onClick={() => handleGenerate(e.employeeId, e.name)}
                                startIcon={
                                  busy ? (
                                    <CircularProgress size={12} />
                                  ) : (
                                    <Icon icon="material-symbols:receipt-long-outline-rounded" />
                                  )
                                }
                              >
                                Generate
                              </Button>
                            )}
                            {e.payrollStatus === 'Generated' && (
                              <>
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="success"
                                  disabled={busy}
                                  onClick={() => handleApprove(e.payrollId, e.name)}
                                  startIcon={
                                    busy ? (
                                      <CircularProgress size={12} />
                                    ) : (
                                      <Icon icon="material-symbols:check-circle-outline-rounded" />
                                    )
                                  }
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => navigate(`/payroll/slip/${e.payrollId}`)}
                                  startIcon={
                                    <Icon icon="material-symbols:receipt-outline-rounded" />
                                  }
                                >
                                  Slip
                                </Button>
                              </>
                            )}
                            {e.payrollStatus === 'Approved' && (
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => navigate(`/payroll/slip/${e.payrollId}`)}
                                startIcon={<Icon icon="material-symbols:receipt-outline-rounded" />}
                              >
                                Slip
                              </Button>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default PayrollPage;
