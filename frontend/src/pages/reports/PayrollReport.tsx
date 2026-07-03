import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  CircularProgress,
  Select,
  Stack,
} from '@mui/material';
import api from 'api/axios';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const PayrollReport = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setLoading(true);
    api
      .get(`/payroll?month=${month}&year=${year}&limit=100`)
      .then((res) => setRecords(res.data.records || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [month, year]);

  const totalNet = records.reduce((s, r) => s + (r.netPay || 0), 0);
  const totalBasic = records.reduce((s, r) => s + (r.basicSalary || 0), 0);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
        Payroll Report
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Generated payroll records for the selected period
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
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
            {!loading && records.length > 0 && (
              <Stack direction="row" spacing={1}>
                <Chip label={`${records.length} employees`} size="small" color="default" />
                <Chip
                  label={`Total: PKR ${totalNet.toLocaleString()}`}
                  size="small"
                  color="success"
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
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    Allowance
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    Deductions
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    Net Pay
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {records.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">
                        No payroll generated for {MONTHS[month - 1]} {year}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {records.map((r: any) => (
                      <TableRow key={r._id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {r.employeeName || '—'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {r.employeeCode}
                          </Typography>
                        </TableCell>
                        <TableCell>{r.department || '—'}</TableCell>
                        <TableCell align="right">
                          PKR {(r.basicSalary || 0).toLocaleString()}
                        </TableCell>
                        <TableCell align="right">
                          PKR {(r.allowance || 0).toLocaleString()}
                        </TableCell>
                        <TableCell align="right" sx={{ color: 'error.main' }}>
                          PKR {(r.deductions || 0).toLocaleString()}
                        </TableCell>
                        <TableCell align="right">
                          <strong>PKR {(r.netPay || 0).toLocaleString()}</strong>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={r.status}
                            size="small"
                            color={r.status === 'Approved' ? 'success' : 'default'}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ bgcolor: 'action.hover' }}>
                      <TableCell colSpan={2}>
                        <Typography variant="subtitle2" fontWeight={700}>
                          Total ({records.length} records)
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="subtitle2" fontWeight={700}>
                          PKR {totalBasic.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell />
                      <TableCell />
                      <TableCell align="right">
                        <Typography variant="subtitle2" fontWeight={700} color="success.main">
                          PKR {totalNet.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell />
                    </TableRow>
                  </>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default PayrollReport;
