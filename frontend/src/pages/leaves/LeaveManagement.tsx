import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
} from '@mui/material';
import { Icon } from '@iconify/react';
import api from 'api/axios';

const LeaveManagement = () => {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchLeaves = () => {
    setLoading(true);
    api
      .get('/leaves')
      .then((res) => setLeaves(res.data.leaves || res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleAction = async (id: string, status: 'Approved' | 'Rejected') => {
    setActionLoading(id);
    try {
      await api.put(`/leaves/${id}`, { status });
      fetchLeaves();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const statusColor: any = { Pending: 'warning', Approved: 'success', Rejected: 'error' };
  const typeColor: any = { Casual: 'info', Sick: 'warning', Annual: 'success' };

  const filtered = leaves.filter((l: any) => {
    const matchStatus = filter === 'all' || l.status === filter;
    const matchSearch = !search || l.employee?.name?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
        Leave Management
      </Typography>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder="Search employee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Icon icon="material-symbols:search-rounded" />
                  </InputAdornment>
                ),
              }}
            />
            <Select
              size="small"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              sx={{ minWidth: 130 }}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Approved">Approved</MenuItem>
              <MenuItem value="Rejected">Rejected</MenuItem>
            </Select>
          </Box>
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
                  <TableCell>Reason</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No leave records found
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((l: any) => (
                    <TableRow key={l._id}>
                      <TableCell>{l.employee?.name || '—'}</TableCell>
                      <TableCell>
                        <Chip label={l.type} size="small" color={typeColor[l.type] || 'default'} />
                      </TableCell>
                      <TableCell>{l.fromDate?.slice(0, 10)}</TableCell>
                      <TableCell>{l.toDate?.slice(0, 10)}</TableCell>
                      <TableCell>{l.totalDays}</TableCell>
                      <TableCell
                        sx={{
                          maxWidth: 150,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {l.reason}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={l.status}
                          size="small"
                          color={statusColor[l.status] || 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        {l.status === 'Pending' && (
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              disabled={actionLoading === l._id}
                              onClick={() => handleAction(l._id, 'Approved')}
                            >
                              Approve
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              disabled={actionLoading === l._id}
                              onClick={() => handleAction(l._id, 'Rejected')}
                            >
                              Reject
                            </Button>
                          </Box>
                        )}
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

export default LeaveManagement;
