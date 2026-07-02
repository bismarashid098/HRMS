import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
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

const AdvanceReport = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear());

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

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
        Advance Report
      </Typography>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            label="Year"
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            size="small"
            sx={{ width: 100 }}
          />
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
                  <TableCell>Amount</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell>Status</TableCell>
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
                      <TableCell>PKR {r.amount?.toLocaleString()}</TableCell>
                      <TableCell>{r.date?.slice(0, 10)}</TableCell>
                      <TableCell>{r.reason}</TableCell>
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
