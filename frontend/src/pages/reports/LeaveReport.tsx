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

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const LeaveReport = () => {
  const [allLeaves, setAllLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const tableRef = useRef<HTMLTableElement>(null);

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

  const handleExport = () => {
    const rows = records.map((r: any) => ({
      Employee: r.employee?.name || '—',
      Department: r.employee?.department || '—',
      'Leave Type': r.type,
      'From Date': r.fromDate?.slice(0, 10),
      'To Date': r.toDate?.slice(0, 10),
      'Total Days': r.totalDays,
      Paid: r.paid ? 'Paid' : 'Unpaid',
      Status: r.status,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Leaves');
    XLSX.writeFile(wb, `Leave_Report_${MONTHS[month - 1]}_${year}.xlsx`);
  };

  const handlePrint = () => {
    if (!tableRef.current) return;
    const win = window.open('', '_blank', 'width=1000,height=700');
    if (!win) return;
    win.document.write(`
      <html>
      <head>
        <title>Leave Report — ${MONTHS[month - 1]} ${year}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 24px; color: #0f172a; }
          h2 { margin: 0 0 4px; font-size: 20px; }
          p  { margin: 0 0 20px; color: #64748b; font-size: 13px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th { background: #f1f5f9; padding: 8px 10px; text-align: left; border-bottom: 2px solid #e2e8f0; font-weight: 600; }
          td { padding: 7px 10px; border-bottom: 1px solid #f1f5f9; }
          tr:nth-child(even) td { background: #f8fafc; }
        </style>
      </head>
      <body>
        <h2>Leave Report</h2>
        <p>${MONTHS[month - 1]} ${year} &mdash; ${records.length} requests &mdash; ${totalApproved} approved &mdash; ${totalDays} days taken</p>
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
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" mb={0.5}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Leave Report
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            All leave requests filtered by month
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
            <Box sx={{ overflowX: 'auto' }}>
            <Table ref={tableRef}>
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
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default LeaveReport;
