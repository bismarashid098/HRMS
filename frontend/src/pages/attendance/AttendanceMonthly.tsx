import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  MenuItem,
  TextField,
  Typography,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import api from 'api/axios';

const AttendanceMonthly = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
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
    api
      .get('/employees')
      .then((res) => {
        const emps = res.data.employees || res.data || [];
        setEmployees(emps);
        if (emps.length > 0) setSelectedEmployee(emps[0]._id);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedEmployee) return;
    setLoading(true);
    api
      .get(`/attendance/monthly?employeeId=${selectedEmployee}&month=${month}&year=${year}`)
      .then((res) => setRecords(Array.isArray(res.data) ? res.data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedEmployee, month, year]);

  const statusColor: any = {
    Present: 'success',
    Absent: 'error',
    Late: 'warning',
    'Half Day': 'info',
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
        Monthly Attendance Ledger
      </Typography>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              select
              label="Employee"
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              size="small"
              sx={{ minWidth: 200 }}
            >
              {employees.map((e) => (
                <MenuItem key={e._id} value={e._id}>
                  {e.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Month"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              size="small"
              sx={{ minWidth: 100 }}
            >
              {months.map((m, i) => (
                <MenuItem key={i} value={i + 1}>
                  {m}
                </MenuItem>
              ))}
            </TextField>
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
            <Box sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Punch In</TableCell>
                  <TableCell>Punch Out</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {records.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No records found
                    </TableCell>
                  </TableRow>
                ) : (
                  records.map((r: any) => (
                    <TableRow key={r._id}>
                      <TableCell>{r.date?.slice(0, 10)}</TableCell>
                      <TableCell>{r.punchIn || '—'}</TableCell>
                      <TableCell>{r.punchOut || '—'}</TableCell>
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
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default AttendanceMonthly;
