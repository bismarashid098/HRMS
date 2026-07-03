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

const LeaveReport = () => {
  const [allLeaves, setAllLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setLoading(true);
    api
      .get('/leaves')
      .then((res) => setAllLeaves(Array.isArray(res.data) ? res.data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const records = allLeaves.filter((l: any) => {
    const d = new Date(l.fromDate);
    return d.getFullYear() === year && d.getMonth() + 1 === month;
  });

  const statusColor: any = { Pending: 'warning', Approved: 'success', Rejected: 'error' };
  const typeColor: any = { Casual: 'info', Sick: 'warning', Annual: 'success' };

  const totalApproved = records.filter((l) => l.status === 'Approved').length;
  const totalDays = records
    .filter((l) => l.status === 'Approved')
    .reduce((s: number, l: any) => s + (l.totalDays || 0), 0);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
        Leave Report
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        All leave requests filtered by month
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
                <Chip label={`${records.length} requests`} size="small" color="default" />
                <Chip label={`${totalApproved} approved`} size="small" color="success" />
                <Chip label={`${totalDays} days taken`} size="small" color="info" />
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
                  <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>From</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>To</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>
                    Days
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Paid</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {records.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">
                        No leave records for {MONTHS[month - 1]} {year}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  records.map((r: any) => (
                    <TableRow key={r._id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {r.employee?.name || '—'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {r.employee?.department}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={r.type} size="small" color={typeColor[r.type] || 'default'} />
                      </TableCell>
                      <TableCell>{r.fromDate?.slice(0, 10)}</TableCell>
                      <TableCell>{r.toDate?.slice(0, 10)}</TableCell>
                      <TableCell align="center">{r.totalDays}</TableCell>
                      <TableCell>
                        <Chip
                          label={r.paid ? 'Paid' : 'Unpaid'}
                          size="small"
                          color={r.paid ? 'success' : 'error'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={r.status}
                          size="small"
                          color={statusColor[r.status] || 'default'}
                        />
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

export default LeaveReport;
