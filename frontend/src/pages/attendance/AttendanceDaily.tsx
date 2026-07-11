import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  MenuItem,
  Select,
  Snackbar,
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
import { useAuth } from 'context/AuthContext';

const statuses = ['Present', 'Absent', 'Late', 'Half Day'];

const AttendanceDaily = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [snack, setSnack] = useState('');

  const fetchAttendance = () => {
    setLoading(true);
    api
      .get(`/attendance?date=${date}`)
      .then((res) => setRecords(res.data.attendance || res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAttendance();
  }, [date]);

  const handleStatusChange = async (record: any, newStatus: string) => {
    setSaving(record._id || record.employee?._id);
    try {
      if (record._id) {
        await api.put(`/attendance/${record._id}`, { status: newStatus });
      } else {
        await api.post('/attendance', {
          employee: record.employee?._id,
          date,
          status: newStatus,
        });
      }
      fetchAttendance();
    } catch (e: any) {
      setSnack(e.response?.data?.message || 'Failed to update attendance');
    } finally {
      setSaving(null);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 1.5, mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          Daily Attendance
        </Typography>
        <TextField
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          size="small"
          InputLabelProps={{ shrink: true }}
          label="Date"
        />
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
                  <TableCell>Department</TableCell>
                  <TableCell>Punch In</TableCell>
                  <TableCell>Punch Out</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {records.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No attendance records for this date
                    </TableCell>
                  </TableRow>
                ) : (
                  records.map((rec: any) => (
                    <TableRow key={rec._id || rec.employee?._id}>
                      <TableCell>{rec.employee?.name || rec.name}</TableCell>
                      <TableCell>{rec.employee?.department || rec.department}</TableCell>
                      <TableCell>{rec.punchIn || '—'}</TableCell>
                      <TableCell>{rec.punchOut || '—'}</TableCell>
                      <TableCell>
                        {isAdmin ? (
                          <Select
                            size="small"
                            value={rec.status || 'Absent'}
                            onChange={(e) => handleStatusChange(rec, e.target.value)}
                            disabled={saving === (rec._id || rec.employee?._id)}
                          >
                            {statuses.map((s) => (
                              <MenuItem key={s} value={s}>
                                {s}
                              </MenuItem>
                            ))}
                          </Select>
                        ) : (
                          <Chip
                            label={rec.status || 'Absent'}
                            size="small"
                            color={
                              rec.status === 'Present'
                                ? 'success'
                                : rec.status === 'Late'
                                  ? 'warning'
                                  : rec.status === 'Half Day'
                                    ? 'info'
                                    : 'error'
                            }
                          />
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
      <Snackbar open={!!snack} autoHideDuration={3500} onClose={() => setSnack('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="error" onClose={() => setSnack('')} sx={{ width: '100%' }}>{snack}</Alert>
      </Snackbar>
    </Box>
  );
};

export default AttendanceDaily;
