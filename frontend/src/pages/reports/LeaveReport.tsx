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
} from '@mui/material';
import api from 'api/axios';

const LeaveReport = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  useEffect(() => {
    setLoading(true);
    api
      .get(`/reports/leave?month=${month}&year=${year}`)
      .then((res) => setRecords(res.data.report || res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [month, year]);

  const statusColor: any = { Pending: 'warning', Approved: 'success', Rejected: 'error' };
  const typeColor: any = { Casual: 'info', Sick: 'warning', Annual: 'success' };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
        Leave Report
      </Typography>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Select
              size="small"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              sx={{ minWidth: 100 }}
            >
              {months.map((m, i) => (
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
          </Box>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
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
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {records.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No records found
                    </TableCell>
                  </TableRow>
                ) : (
                  records.map((r: any, i: number) => (
                    <TableRow key={r._id || i}>
                      <TableCell>{r.employee?.name || '—'}</TableCell>
                      <TableCell>
                        <Chip label={r.type} size="small" color={typeColor[r.type] || 'default'} />
                      </TableCell>
                      <TableCell>{r.fromDate?.slice(0, 10)}</TableCell>
                      <TableCell>{r.toDate?.slice(0, 10)}</TableCell>
                      <TableCell>{r.totalDays}</TableCell>
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
