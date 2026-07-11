import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  MenuItem,
  Stack,
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
import { Icon } from '@iconify/react';
import * as XLSX from 'xlsx';
import api from 'api/axios';
import { useCurrency } from 'context/SettingsContext';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const PayrollReport = () => {
  const { code: currCode } = useCurrency();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const tableRef = useRef<HTMLTableElement>(null);

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

  const handleExport = () => {
    const rows = records.map((r) => ({
      Employee: r.employeeName || '—',
      'Employee Code': r.employeeCode || '—',
      Department: r.department || '—',
      'Basic Salary (PKR)': r.basicSalary || 0,
      'Allowance (PKR)': r.allowance || 0,
      'Deductions (PKR)': r.deductions || 0,
      'Net Pay (PKR)': r.netPay || 0,
      Status: r.status,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Payroll');
    XLSX.writeFile(wb, `Payroll_Report_${MONTHS[month - 1]}_${year}.xlsx`);
  };

  const handlePrint = () => {
    if (!tableRef.current) return;
    const win = window.open('', '_blank', 'width=1000,height=700');
    if (!win) return;
    win.document.write(`
      <html>
      <head>
        <title>Payroll Report — ${MONTHS[month - 1]} ${year}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 24px; color: #0f172a; }
          h2 { margin: 0 0 4px; font-size: 20px; }
          p  { margin: 0 0 20px; color: #64748b; font-size: 13px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th { background: #f1f5f9; padding: 8px 10px; text-align: left; border-bottom: 2px solid #e2e8f0; font-weight: 600; }
          td { padding: 7px 10px; border-bottom: 1px solid #f1f5f9; }
          tr:nth-child(even) td { background: #f8fafc; }
          .total-row td { font-weight: 700; background: #f1f5f9; }
        </style>
      </head>
      <body>
        <h2>Payroll Report</h2>
        <p>${MONTHS[month - 1]} ${year} &mdash; ${records.length} employees &mdash; Total Net: ${currCode} ${totalNet.toLocaleString()}</p>
        ${tableRef.current.outerHTML}
      </body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
      win.close();
    }, 300);
  };

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" gap={1.5} mb={0.5}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Payroll Report
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Generated payroll records for the selected period
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Icon icon="material-symbols:print-outline-rounded" />}
            onClick={handlePrint}
            disabled={!records.length}
            sx={{ borderRadius: '8px' }}
          >
            Print
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<Icon icon="material-symbols:download-rounded" />}
            onClick={handleExport}
            disabled={!records.length}
            sx={{ borderRadius: '8px' }}
          >
            Export Excel
          </Button>
        </Stack>
      </Stack>

      <Card sx={{ mb: 3, mt: 3 }}>
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
                  label={`Total: ${currCode} ${totalNet.toLocaleString()}`}
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
            <Box sx={{ overflowX: 'auto' }}>
            <Table ref={tableRef}>
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
                          {currCode} {(r.basicSalary || 0).toLocaleString()}
                        </TableCell>
                        <TableCell align="right">
                          {currCode} {(r.allowance || 0).toLocaleString()}
                        </TableCell>
                        <TableCell align="right" sx={{ color: 'error.main' }}>
                          {currCode} {(r.deductions || 0).toLocaleString()}
                        </TableCell>
                        <TableCell align="right">
                          <strong>{currCode} {(r.netPay || 0).toLocaleString()}</strong>
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
                          {currCode} {totalBasic.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell />
                      <TableCell />
                      <TableCell align="right">
                        <Typography variant="subtitle2" fontWeight={700} color="success.main">
                          {currCode} {totalNet.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell />
                    </TableRow>
                  </>
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

export default PayrollReport;
