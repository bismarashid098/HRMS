import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
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
import * as XLSX from 'xlsx';
import api from 'api/axios';

const AdvanceReport = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear());
  const tableRef = useRef<HTMLTableElement>(null);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/advances?year=${year}`)
      .then((res) => setRecords(res.data.advances || res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [year]);

  const statusColor: any = {
    Pending: 'warning',
    Approved: 'success',
    Rejected: 'error',
    Paid: 'info',
  };

  const totalAmount = records
    .filter((r) => r.status === 'Approved' || r.status === 'Paid')
    .reduce((s: number, r: any) => s + (r.amount || 0), 0);

  const handleExport = () => {
    const rows = records.map((r: any) => ({
      Employee: r.employee?.name || '—',
      Department: r.employee?.department || '—',
      'Amount (PKR)': r.amount || 0,
      Date: r.date?.slice(0, 10),
      Reason: r.reason || '—',
      Status: r.status,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Advances');
    XLSX.writeFile(wb, `Advance_Report_${year}.xlsx`);
  };

  const handlePrint = () => {
    if (!tableRef.current) return;
    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) return;
    win.document.write(`
      <html>
      <head>
        <title>Advance Report — ${year}</title>
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
        <h2>Advance Report</h2>
        <p>${year} &mdash; ${records.length} records &mdash; Approved/Paid total: PKR ${totalAmount.toLocaleString()}</p>
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
    <Box sx={{ p: 3 }}>
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" mb={0.5}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Advance Report
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Salary advance requests for the selected year
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
          <Stack direction="row" spacing={2} alignItems="center">
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
                <Chip label={`${records.length} records`} size="small" color="default" />
                {totalAmount > 0 && (
                  <Chip
                    label={`PKR ${totalAmount.toLocaleString()} approved`}
                    size="small"
                    color="success"
                  />
                )}
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
            <Table ref={tableRef}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Employee</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Department</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    Amount
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Reason</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {records.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">No advance records for {year}</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  records.map((r: any, i: number) => (
                    <TableRow key={r._id || i} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {r.employee?.name || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>{r.employee?.department || '—'}</TableCell>
                      <TableCell align="right">
                        <strong>PKR {r.amount?.toLocaleString()}</strong>
                      </TableCell>
                      <TableCell>{r.date?.slice(0, 10)}</TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            maxWidth: 220,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {r.reason || '—'}
                        </Typography>
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

export default AdvanceReport;
