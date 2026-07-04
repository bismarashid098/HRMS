import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  Alert,
  Stack,
} from '@mui/material';
import { Icon } from '@iconify/react';
import { useAuth } from 'context/AuthContext';

const FEATURES = [
  { icon: 'material-symbols:badge-outline-rounded', label: 'Employee Management' },
  { icon: 'material-symbols:fingerprint-rounded', label: 'Attendance Tracking' },
  { icon: 'material-symbols:payments-outline-rounded', label: 'Payroll Processing' },
  { icon: 'material-symbols:event-available-outline-rounded', label: 'Leave Management' },
  { icon: 'material-symbols:bar-chart-4-bars-rounded', label: 'Reports & Analytics' },
  { icon: 'material-symbols:work-outline-rounded', label: 'Recruitment Pipeline' },
];

const DEMO = [
  { label: 'Admin', email: 'admin@hrms.com', password: '123', color: '#818CF8' },
  { label: 'Manager', email: 'manager@hrms.com', password: '123', color: '#34D399' },
];

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (d: (typeof DEMO)[0]) => {
    setEmail(d.email);
    setPassword(d.password);
    setError('');
  };

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 900,
        mx: 2,
        display: 'flex',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
        position: 'relative',
        zIndex: 1,
      }}
    >
      {/* ── LEFT PANEL ── */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: '52%',
          flexShrink: 0,
          p: 5,
          background: 'linear-gradient(160deg, #1E1B4B 0%, #0B1120 60%, #0F172A 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative blobs */}
        <Box
          sx={{
            position: 'absolute',
            top: -80,
            right: -80,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -60,
            left: -60,
            width: 250,
            height: 250,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        {/* Dot grid */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(rgba(148,163,184,0.07) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
            pointerEvents: 'none',
          }}
        />

        {/* Brand */}
        <Box sx={{ position: 'relative' }}>
          <Stack direction="row" alignItems="center" spacing={1.5} mb={4}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #4F46E5 0%, #818CF8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 20px rgba(79,70,229,0.5)',
              }}
            >
              <Icon icon="material-symbols:people-rounded" color="#fff" width={24} />
            </Box>
            <Box>
              <Typography fontWeight={800} color="#F1F5F9" fontSize="1.1rem" lineHeight={1.1}>
                WorkSphere
              </Typography>
              <Typography fontSize="0.65rem" color="#6366F1" fontWeight={700} letterSpacing="0.1em">
                HRMS PLATFORM
              </Typography>
            </Box>
          </Stack>

          <Typography
            variant="h4"
            fontWeight={800}
            color="#F1F5F9"
            lineHeight={1.2}
            letterSpacing="-0.03em"
            mb={1.5}
            fontSize={{ md: '1.75rem', lg: '2rem' }}
          >
            Complete HR
            <br />
            Management
            <Box component="span" sx={{ color: '#818CF8' }}>
              {' '}
              Suite
            </Box>
          </Typography>
          <Typography variant="body2" color="#64748B" mb={4} lineHeight={1.7}>
            Streamline your workforce operations with a unified platform built for modern teams.
          </Typography>

          {/* Feature list */}
          <Stack spacing={1.75}>
            {FEATURES.map((f) => (
              <Stack key={f.label} direction="row" alignItems="center" spacing={1.5}>
                <Box
                  sx={{
                    width: 30,
                    height: 30,
                    borderRadius: '8px',
                    backgroundColor: 'rgba(99,102,241,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon icon={f.icon} color="#818CF8" width={16} />
                </Box>
                <Typography variant="body2" color="#94A3B8" fontWeight={500} fontSize="0.85rem">
                  {f.label}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Box>

        {/* Bottom tagline */}
        <Box sx={{ position: 'relative' }}>
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mb: 2 }} />
          <Typography variant="caption" color="#475569" fontSize="0.72rem">
            Trusted by HR teams · Secure · Scalable
          </Typography>
        </Box>
      </Box>

      {/* ── RIGHT PANEL ── */}
      <Box
        sx={{
          flex: 1,
          backgroundColor: '#fff',
          p: { xs: 3, sm: 4, md: 5 },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        {/* Mobile brand */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.25}
          mb={3}
          sx={{ display: { xs: 'flex', md: 'none' } }}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #4F46E5 0%, #818CF8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon icon="material-symbols:people-rounded" color="#fff" width={20} />
          </Box>
          <Typography fontWeight={800} fontSize="1rem" color="text.primary">
            WorkSphere HRMS
          </Typography>
        </Stack>

        <Typography variant="h5" fontWeight={800} color="text.primary" mb={0.5}>
          Welcome back
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3.5}>
          Sign in to your account to continue
        </Typography>

        {error && (
          <Alert
            severity="error"
            icon={<Icon icon="material-symbols:error-outline-rounded" width={18} />}
            sx={{ mb: 2.5, borderRadius: '10px', fontSize: '0.85rem' }}
          >
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2.5}>
            <Box>
              <Typography
                variant="caption"
                fontWeight={700}
                color="text.secondary"
                display="block"
                mb={0.75}
                fontSize="0.75rem"
                letterSpacing="0.05em"
                sx={{ textTransform: 'uppercase' }}
              >
                Email Address
              </Typography>
              <TextField
                fullWidth
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                autoFocus
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Icon
                        icon="material-symbols:mail-outline-rounded"
                        width={18}
                        color="#94A3B8"
                      />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                    fontSize: '0.9rem',
                    backgroundColor: '#F8FAFC',
                    '&.Mui-focused': { backgroundColor: '#fff' },
                  },
                }}
              />
            </Box>

            <Box>
              <Typography
                variant="caption"
                fontWeight={700}
                color="text.secondary"
                display="block"
                mb={0.75}
                fontSize="0.75rem"
                letterSpacing="0.05em"
                sx={{ textTransform: 'uppercase' }}
              >
                Password
              </Typography>
              <TextField
                fullWidth
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Icon
                        icon="material-symbols:lock-outline-rounded"
                        width={18}
                        color="#94A3B8"
                      />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setShowPassword((p) => !p)}
                        edge="end"
                        sx={{ color: '#94A3B8', '&:hover': { color: '#4F46E5' } }}
                      >
                        <Icon
                          icon={
                            showPassword
                              ? 'material-symbols:visibility-off-outline-rounded'
                              : 'material-symbols:visibility-outline-rounded'
                          }
                          width={18}
                        />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                    fontSize: '0.9rem',
                    backgroundColor: '#F8FAFC',
                    '&.Mui-focused': { backgroundColor: '#fff' },
                  },
                }}
              />
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                py: 1.4,
                borderRadius: '10px',
                fontSize: '0.9375rem',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)',
                boxShadow: '0 6px 20px rgba(79,70,229,0.35)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #3730A3 0%, #4F46E5 100%)',
                  boxShadow: '0 8px 24px rgba(79,70,229,0.45)',
                  transform: 'translateY(-1px)',
                },
                '&:active': { transform: 'translateY(0)' },
                transition: 'all 0.2s ease',
                '&:disabled': { opacity: 0.7, transform: 'none' },
              }}
            >
              {loading ? (
                <Stack direction="row" alignItems="center" spacing={1}>
                  <CircularProgress size={18} color="inherit" />
                  <span>Signing in…</span>
                </Stack>
              ) : (
                <Stack direction="row" alignItems="center" spacing={0.75}>
                  <span>Sign In</span>
                  <Icon icon="material-symbols:arrow-forward-rounded" width={18} />
                </Stack>
              )}
            </Button>
          </Stack>
        </Box>

        {/* Demo credentials */}
        <Box mt={3.5}>
          <Divider sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" fontSize="0.72rem" px={1}>
              DEMO ACCESS
            </Typography>
          </Divider>
          <Stack direction="row" spacing={1.5}>
            {DEMO.map((d) => (
              <Box
                key={d.label}
                onClick={() => fillDemo(d)}
                sx={{
                  flex: 1,
                  p: 1.5,
                  borderRadius: '10px',
                  border: '1.5px dashed #E2E8F0',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  '&:hover': {
                    borderColor: d.color,
                    backgroundColor: `${d.color}0D`,
                    transform: 'translateY(-1px)',
                  },
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1} mb={0.25}>
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: '5px',
                      backgroundColor: `${d.color}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon
                      icon={
                        d.label === 'Admin'
                          ? 'material-symbols:admin-panel-settings-outline-rounded'
                          : 'material-symbols:manage-accounts-outline-rounded'
                      }
                      color={d.color}
                      width={13}
                    />
                  </Box>
                  <Typography fontWeight={700} fontSize="0.75rem" color="text.primary">
                    {d.label}
                  </Typography>
                </Stack>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontSize="0.7rem"
                  display="block"
                >
                  {d.email}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: d.color }}
                  fontSize="0.7rem"
                  fontWeight={600}
                >
                  Click to fill ↑
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>

        <Typography
          variant="caption"
          color="text.disabled"
          textAlign="center"
          display="block"
          mt={3}
          fontSize="0.7rem"
        >
          © {new Date().getFullYear()} WorkSphere HRMS · All rights reserved
        </Typography>
      </Box>
    </Box>
  );
};

export default Login;
