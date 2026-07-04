import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import Grid from '@mui/material/Grid';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Chip,
  Stack,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  alpha,
  Button,
  Divider,
} from '@mui/material';
import { Icon } from '@iconify/react';
import api from 'api/axios';
import { useAuth } from 'context/AuthContext';

interface DashboardStats {
  totalEmployees?: number;
  activeEmployees?: number;
  presentToday?: number;
  onLeaveToday?: number;
  pendingLeaves?: number;
  totalPayroll?: number;
  pendingAdvances?: number;
  recentAttendance?: Array<{
    _id: string;
    employee: { name: string; employeeId: string; department: string };
    date: string;
    status: string;
    checkIn?: string;
    checkOut?: string;
  }>;
}

const StatCard = ({
  label,
  value,
  icon,
  color,
  sub,
  onClick,
}: {
  label: string;
  value: number | string;
  icon: string;
  color: string;
  sub?: string;
  onClick?: () => void;
}) => (
  <Card
    onClick={onClick}
    sx={{
      cursor: onClick ? 'pointer' : 'default',
      transition: 'all 0.2s',
      '&:hover': onClick
        ? { transform: 'translateY(-2px)', boxShadow: '0 8px 24px rgba(15,23,42,0.1)' }
        : {},
    }}
  >
    <CardContent sx={{ p: 2.5 }}>
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
        <Box>
          <Typography variant="body2" color="text.secondary" fontWeight={500} mb={0.75}>
            {label}
          </Typography>
          <Typography variant="h4" fontWeight={800} color="text.primary" lineHeight={1}>
            {value}
          </Typography>
          {sub && (
            <Typography variant="caption" color="text.secondary" mt={0.5} display="block">
              {sub}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '14px',
            backgroundColor: alpha(color, 0.12),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon icon={icon} color={color} width={26} />
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

const QuickLink = ({
  label,
  icon,
  color,
  path,
}: {
  label: string;
  icon: string;
  color: string;
  path: string;
}) => {
  const navigate = useNavigate();
  return (
    <Box
      onClick={() => navigate(path)}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1,
        p: 2,
        borderRadius: '12px',
        border: '1px solid #F1F5F9',
        cursor: 'pointer',
        transition: 'all 0.15s',
        '&:hover': {
          backgroundColor: alpha(color, 0.06),
          borderColor: alpha(color, 0.3),
          transform: 'translateY(-1px)',
        },
      }}
    >
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: '12px',
          backgroundColor: alpha(color, 0.12),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon icon={icon} color={color} width={22} />
      </Box>
      <Typography
        variant="caption"
        fontWeight={600}
        color="text.secondary"
        textAlign="center"
        fontSize="0.75rem"
      >
        {label}
      </Typography>
    </Box>
  );
};

const statusColor: Record<string, 'success' | 'error' | 'warning' | 'default'> = {
  Present: 'success',
  Absent: 'error',
  Late: 'warning',
  Leave: 'warning',
  Holiday: 'default',
};

const DashboardHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [dashRes, attRes] = await Promise.allSettled([
          api.get('/dashboard'),
          api.get('/attendance', {
            params: {
              date: new Date().toISOString().split('T')[0],
              limit: 8,
            },
          }),
        ]);

        const dash = dashRes.status === 'fulfilled' ? dashRes.value.data : {};
        const att = attRes.status === 'fulfilled' ? attRes.value.data : {};

        setStats({
          ...dash,
          recentAttendance: att.attendance || att.records || [],
        });
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const today = new Date().toLocaleDateString('en-PK', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h5" fontWeight={800} color="text.primary">
          Good{' '}
          {new Date().getHours() < 12
            ? 'Morning'
            : new Date().getHours() < 17
              ? 'Afternoon'
              : 'Evening'}
          , {user?.name?.split(' ')[0]} 👋
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          {today}
        </Typography>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={2.5} mb={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Total Employees"
            value={stats.totalEmployees ?? stats.activeEmployees ?? '—'}
            icon="material-symbols:badge-outline-rounded"
            color="#4F46E5"
            sub={`${stats.activeEmployees ?? ''} active`}
            onClick={() => navigate('/employees')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Present Today"
            value={stats.presentToday ?? '—'}
            icon="material-symbols:how-to-reg-outline-rounded"
            color="#10B981"
            sub="Checked in"
            onClick={() => navigate('/attendance')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="On Leave"
            value={stats.onLeaveToday ?? '—'}
            icon="material-symbols:event-available-outline-rounded"
            color="#F59E0B"
            sub={`${stats.pendingLeaves ?? 0} pending approval`}
            onClick={() => navigate('/leaves')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Pending Advances"
            value={stats.pendingAdvances ?? '—'}
            icon="material-symbols:currency-exchange-rounded"
            color="#EC4899"
            sub="Awaiting approval"
            onClick={() => navigate('/payroll/advance')}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        {/* Recent Attendance */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card>
            <Box
              sx={{
                px: 3,
                pt: 2.5,
                pb: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box>
                <Typography variant="h6" fontWeight={700} fontSize="0.95rem">
                  Today's Attendance
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date().toLocaleDateString('en-PK', { dateStyle: 'full' })}
                </Typography>
              </Box>
              <Button
                size="small"
                variant="outlined"
                onClick={() => navigate('/attendance')}
                sx={{ borderRadius: '8px', fontSize: '0.78rem' }}
              >
                View All
              </Button>
            </Box>
            <Divider />
            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Check In</TableCell>
                    <TableCell>Check Out</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {!stats.recentAttendance?.length ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4, color: '#94A3B8' }}>
                        <Icon icon="material-symbols:event-busy-outline" width={32} />
                        <Typography variant="body2" mt={1}>
                          No attendance records for today
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    stats.recentAttendance.map((rec) => (
                      <TableRow key={rec._id} hover>
                        <TableCell>
                          <Stack direction="row" alignItems="center" gap={1.25}>
                            <Avatar
                              sx={{
                                width: 30,
                                height: 30,
                                background: 'linear-gradient(135deg, #4F46E5 0%, #818CF8 100%)',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                              }}
                            >
                              {rec.employee?.name?.[0]?.toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={600} fontSize="0.8125rem">
                                {rec.employee?.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                fontSize="0.72rem"
                              >
                                {rec.employee?.employeeId}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontSize="0.8125rem">
                            {rec.employee?.department || '—'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            fontSize="0.8125rem"
                            color={rec.checkIn ? 'text.primary' : 'text.secondary'}
                          >
                            {rec.checkIn || '—'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            fontSize="0.8125rem"
                            color={rec.checkOut ? 'text.primary' : 'text.secondary'}
                          >
                            {rec.checkOut || '—'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={rec.status}
                            color={statusColor[rec.status] || 'default'}
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Box>
          </Card>
        </Grid>

        {/* Quick Links */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={700} fontSize="0.95rem" mb={0.5}>
                Quick Actions
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                Navigate to key modules
              </Typography>
              <Grid container spacing={1.5}>
                <Grid size={4}>
                  <QuickLink
                    label="Add Employee"
                    icon="material-symbols:person-add-outline-rounded"
                    color="#4F46E5"
                    path="/employees/add"
                  />
                </Grid>
                <Grid size={4}>
                  <QuickLink
                    label="Attendance"
                    icon="material-symbols:fingerprint-rounded"
                    color="#10B981"
                    path="/attendance"
                  />
                </Grid>
                <Grid size={4}>
                  <QuickLink
                    label="Leave Mgmt"
                    icon="material-symbols:event-available-outline-rounded"
                    color="#F59E0B"
                    path="/leaves"
                  />
                </Grid>
                <Grid size={4}>
                  <QuickLink
                    label="Payroll"
                    icon="material-symbols:payments-outline-rounded"
                    color="#3B82F6"
                    path="/payroll"
                  />
                </Grid>
                <Grid size={4}>
                  <QuickLink
                    label="Reports"
                    icon="material-symbols:bar-chart-4-bars-rounded"
                    color="#8B5CF6"
                    path="/reports/attendance"
                  />
                </Grid>
                <Grid size={4}>
                  <QuickLink
                    label="Settings"
                    icon="material-symbols:settings-outline-rounded"
                    color="#64748B"
                    path="/settings"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardHome;
