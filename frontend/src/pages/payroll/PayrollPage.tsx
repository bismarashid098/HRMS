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
} from '@mui/material';
import { Icon } from '@iconify/react';
import api from 'api/axios';

const PayrollPage = () => {
  const navigate = useNavigate();
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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

  const fetchPayrolls = () => {
    setLoading(true);
    api
      .get(`/payroll?month=${month}&year=${year}`)
      .then((res) => setPayrolls(res.data.records || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPayrolls();
  }, [month, year]);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          Payroll
        </Typography>
      </Box>
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
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payrolls.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No payroll records for this period
                    </TableCell>
                  </TableRow>
                ) : (
                  payrolls.map((p: any) => (
                    <TableRow key={p._id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>{p.employeeName || '—'}</Typography>
                        <Typography variant="caption" color="text.secondary">{p.employeeCode}</Typography>
                      </TableCell>
                      <TableCell>PKR {(p.basicSalary || 0).toLocaleString()}</TableCell>
                      <TableCell>PKR {(p.allowance || 0).toLocaleString()}</TableCell>
                      <TableCell>PKR {(p.deductions || 0).toLocaleString()}</TableCell>
                      <TableCell>
                        <strong>PKR {(p.netPay || 0).toLocaleString()}</strong>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={p.status}
                          size="small"
                          color={p.status === 'Approved' ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Icon icon="material-symbols:receipt-outline-rounded" />}
                          onClick={() => navigate(`/payroll/slip/${p._id}`)}
                        >
                          Slip
                        </Button>
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

export default PayrollPage;
