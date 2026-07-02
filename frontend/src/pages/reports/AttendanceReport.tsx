import { useEffect, useState } from 'react';
import {
  Box,
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
  LinearProgress,
  Stack,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import api from 'api/axios';

interface AttendanceRecord {
  employee: string;
  employeeCode: string;
  name: string;
  department: string;
  designation: string;
  totalDays: number;
  present: number;
  late: number;
  halfDay: number;
  absent: number;
  onLeave: number;
  notMarked: number;
  rate: number;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const AttendanceReport = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const fetchReport = () => {
    setLoading(true);
    const from = new Date(year, month - 1, 1).toISOString().slice(0, 10);
    const to = new Date(year, month, 0).toISOString().slice(0, 10);
    api
      .get(`/attendance/range?from=${from}&to=${to}`)
      .then((res) => setRecords(Array.isArray(res.data) ? res.data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReport();
  }, [month, year]);

  const rateColor = (rate: number) =>
    rate >= 80 ? '#10b981' : rate >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
        Attendance Report
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Monthly attendance summary for all active employees
      </Typography>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            <Select
              size="small"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              sx={{ minWidth: 110 }}
            >
              {MONTHS.map((m, i) => (
                <MenuItem key={i} value={i + 1}>{m}</MenuItem>
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
              <Chip
                label={`${records.length} employees`}
                size="small"
                sx={{ bgcolor: alpha('#3b82f6', 0.1), color: '#3b82f6', fontWeight: 600 }}
              />
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Table */}
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
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Working Days</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Present</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Late</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Half Day</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Absent</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>On Leave</TableCell>
                  <TableCell sx={{ fontWeight: 600, minWidth: 130 }}>Attendance Rate</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {records.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">No records found for this period</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  records.map((r) => (
                    <TableRow key={r.employee} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>{r.name || '—'}</Typography>
                        <Typography variant="caption" color="text.secondary">{r.employeeCode}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{r.department || '—'}</Typography>
                      </TableCell>
                      <TableCell align="center">{r.totalDays}</TableCell>
                      <TableCell align="center">
                        <Chip label={r.present} size="small" color="success" variant="outlined" />
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={r.late} size="small" color="warning" variant="outlined" />
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={r.halfDay} size="small" color="info" variant="outlined" />
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={r.absent} size="small" color="error" variant="outlined" />
                      </TableCell>
                      <TableCell align="center">{r.onLeave}</TableCell>
                      <TableCell>
                        <Stack spacing={0.5}>
                          <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <Typography variant="caption" fontWeight={600} color={rateColor(r.rate)}>
                              {r.rate}%
                            </Typography>
                          </Stack>
                          <LinearProgress
                            variant="determinate"
                            value={r.rate}
                            sx={{
                              height: 5,
                              borderRadius: 3,
                              bgcolor: alpha(rateColor(r.rate), 0.12),
                              '& .MuiLinearProgress-bar': { bgcolor: rateColor(r.rate), borderRadius: 3 },
                            }}
                          />
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default AttendanceReport;
