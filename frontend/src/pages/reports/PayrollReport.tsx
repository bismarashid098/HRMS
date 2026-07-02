import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
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

const PayrollReport = () => {
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
      .get(`/reports/payroll?month=${month}&year=${year}`)
      .then((res) => setRecords(res.data.report || res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [month, year]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
        Payroll Report
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
                  <TableCell>Basic Salary</TableCell>
                  <TableCell>Allowance</TableCell>
                  <TableCell>Deductions</TableCell>
                  <TableCell>Net Salary</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {records.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No records
                    </TableCell>
                  </TableRow>
                ) : (
                  records.map((r: any, i: number) => (
                    <TableRow key={r._id || i}>
                      <TableCell>{r.employee?.name || '—'}</TableCell>
                      <TableCell>PKR {r.basicSalary?.toLocaleString()}</TableCell>
                      <TableCell>PKR {r.allowance?.toLocaleString()}</TableCell>
                      <TableCell>
                        PKR{' '}
                        {(
                          (r.deductions || 0) +
                          (r.advanceDeduction || 0) +
                          (r.leaveDeduction || 0)
                        ).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <strong>PKR {r.netSalary?.toLocaleString()}</strong>
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

export default PayrollReport;
