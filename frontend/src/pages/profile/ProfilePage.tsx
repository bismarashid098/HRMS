import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import api from 'api/axios';
import { useAuth } from 'context/AuthContext';

const ProfilePage = () => {
  const { user } = useAuth();
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('');
    setError('');
    try {
      await api.put('/auth/change-password', {
        currentPassword: password,
        newPassword,
      });
      setMsg('Password changed successfully');
      setPassword('');
      setNewPassword('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to change password');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
        My Profile
      </Typography>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="h5" color="white">
                    {user?.name?.[0]?.toUpperCase()}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h6">{user?.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user?.email}
                  </Typography>
                  <Typography variant="caption" color="primary">
                    {user?.role}
                  </Typography>
                </Box>
              </Box>
              <Divider />
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Role
                </Typography>
                <Typography fontWeight="medium">{user?.role}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Change Password
              </Typography>
              {msg && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {msg}
                </Alert>
              )}
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              <Box
                component="form"
                onSubmit={handleChangePassword}
                sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
              >
                <TextField
                  label="Current Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <TextField
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <Button type="submit" variant="contained">
                  Change Password
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfilePage;
