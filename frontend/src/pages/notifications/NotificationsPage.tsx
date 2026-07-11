import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Typography,
  CircularProgress,
  IconButton,
  Tooltip,
  Stack,
  Button,
  Divider,
  Avatar,
} from '@mui/material';
import { Icon } from '@iconify/react';
import api from 'api/axios';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

const typeIcon: Record<string, string> = {
  Leave: 'material-symbols:event-available-outline',
  Attendance: 'material-symbols:fingerprint-rounded',
  Payroll: 'material-symbols:payments-outline',
  Advance: 'material-symbols:currency-exchange-rounded',
  Asset: 'material-symbols:laptop-outline',
  Expense: 'material-symbols:receipt-long-outline',
  Training: 'material-symbols:school-outline',
  Performance: 'material-symbols:star-rate-outline',
  General: 'material-symbols:notifications-outline',
};

const typeColor: Record<string, string> = {
  Leave: '#3b82f6',
  Attendance: '#8b5cf6',
  Payroll: '#22c55e',
  Advance: '#f59e0b',
  Asset: '#64748b',
  Expense: '#ef4444',
  Training: '#06b6d4',
  Performance: '#f97316',
  General: '#94a3b8',
};

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications', { params: { limit: 50 } });
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const markRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // ignore
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch {
      // ignore
    }
  };

  return (
    <Box sx={{ p: { xs: 0, sm: 0 }, maxWidth: 800, mx: 'auto' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} gap={1.5} mb={3}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="h5" fontWeight={700}>
            Notifications
          </Typography>
          {unreadCount > 0 && <Chip label={unreadCount} color="error" size="small" />}
        </Stack>
        {unreadCount > 0 && (
          <Button
            size="small"
            onClick={markAllRead}
            startIcon={<Icon icon="material-symbols:done-all" />}
          >
            Mark all read
          </Button>
        )}
      </Stack>

      <Card>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : notifications.length === 0 ? (
            <Box textAlign="center" py={6}>
              <Icon
                icon="material-symbols:notifications-off-outline"
                fontSize={48}
                color="#94a3b8"
              />
              <Typography color="text.secondary" mt={1}>
                No notifications
              </Typography>
            </Box>
          ) : (
            notifications.map((n, i) => (
              <Box key={n._id}>
                <Stack
                  direction="row"
                  alignItems="flex-start"
                  spacing={2}
                  sx={{
                    px: 3,
                    py: 2,
                    bgcolor: n.isRead ? 'transparent' : 'action.hover',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.selected' },
                  }}
                  onClick={() => !n.isRead && markRead(n._id)}
                >
                  <Avatar sx={{ bgcolor: typeColor[n.type] || '#94a3b8', width: 38, height: 38 }}>
                    <Icon icon={typeIcon[n.type] || typeIcon.General} fontSize={20} />
                  </Avatar>
                  <Box flex={1} minWidth={0}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Typography variant="body2" fontWeight={n.isRead ? 400 : 700} noWrap>
                        {n.title}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ whiteSpace: 'nowrap', ml: 1 }}
                      >
                        {new Date(n.createdAt).toLocaleDateString()}
                      </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                      {n.message}
                    </Typography>
                    <Stack direction="row" spacing={1} mt={0.5}>
                      <Chip
                        label={n.type}
                        size="small"
                        sx={{ bgcolor: typeColor[n.type], color: '#fff', fontSize: 11 }}
                      />
                      {!n.isRead && <Chip label="New" color="primary" size="small" />}
                    </Stack>
                  </Box>
                  <Stack direction="row">
                    {!n.isRead && (
                      <Tooltip title="Mark read">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            markRead(n._id);
                          }}
                        >
                          <Icon icon="material-symbols:mark-email-read-outline" />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(n._id);
                        }}
                      >
                        <Icon icon="material-symbols:delete-outline" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Stack>
                {i < notifications.length - 1 && <Divider />}
              </Box>
            ))
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default NotificationsPage;
