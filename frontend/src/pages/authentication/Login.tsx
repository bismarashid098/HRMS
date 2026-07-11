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
  Stack,
  Chip,
} from '@mui/material';
import { Icon } from '@iconify/react';
import { useAuth } from 'context/AuthContext';

const FEATURES = [
  {
    icon: 'material-symbols:badge-outline-rounded',
    label: 'Employee Management',
    desc: 'Full employee lifecycle',
  },
  {
    icon: 'material-symbols:fingerprint-rounded',
    label: 'Smart Attendance',
    desc: 'Biometric & auto tracking',
  },
  {
    icon: 'material-symbols:payments-outline-rounded',
    label: 'Payroll Engine',
    desc: 'Automated salary processing',
  },
  {
    icon: 'material-symbols:bar-chart-4-bars-rounded',
    label: 'Analytics & Reports',
    desc: 'Real-time HR insights',
  },
];

const DEMO = [
  {
    label: 'Admin',
    email: 'admin@hrms.com',
    password: '12345678',
    icon: 'material-symbols:admin-panel-settings-outline-rounded',
    color: '#818CF8',
    bg: 'rgba(99,102,241,0.12)',
    desc: 'Full system access',
  },
  {
    label: 'Manager',
    email: 'manager@hrms.com',
    password: '12345678',
    icon: 'material-symbols:manage-accounts-outline-rounded',
    color: '#34D399',
    bg: 'rgba(52,211,153,0.12)',
    desc: 'Attendance & leaves',
  },
];

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your credentials.');
      triggerShake();
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Incorrect email or password.');
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (d: (typeof DEMO)[0]) => {
    setDemoLoading(d.label);
    setError('');
    try {
      await login(d.email, d.password);
      navigate('/');
    } catch (err: any) {
      setEmail(d.email);
      setPassword(d.password);
      setError(err?.response?.data?.message || 'Demo login failed.');
      triggerShake();
    } finally {
      setDemoLoading(null);
    }
  };

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      backgroundColor: 'rgba(255,255,255,0.05)',
      color: '#F1F5F9',
      fontSize: '0.9375rem',
      transition: 'background 0.2s, box-shadow 0.2s',
      '& fieldset': { borderColor: 'rgba(255,255,255,0.1)', transition: 'border-color 0.2s' },
      '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.22) !important' },
      '&.Mui-focused': {
        backgroundColor: 'rgba(255,255,255,0.08)',
        boxShadow: '0 0 0 3px rgba(99,102,241,0.25)',
      },
      '&.Mui-focused fieldset': { borderColor: '#6366F1 !important' },
      '& input': { py: 1.55, '&::placeholder': { color: '#475569', opacity: 1 } },
    },
    '& .MuiInputLabel-root': { color: '#64748B' },
  };

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 960,
        display: 'flex',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 40px 120px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)',
        animation: 'cardIn 0.7s cubic-bezier(0.22,1,0.36,1) both',
      }}
    >
      {/* ══════════════ LEFT PANEL ══════════════ */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          width: '45%',
          flexShrink: 0,
          p: 5,
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(155deg, #1E1B4B 0%, #0D0B1E 55%, #080612 100%)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Inner glows */}
        <Box sx={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: -80, left: -80, width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 65%)', pointerEvents: 'none' }} />

        {/* Brand */}
        <Box sx={{ position: 'relative', animation: 'fadeUp 0.6s 0.2s both' }}>
          <Stack direction="row" alignItems="center" spacing={1.5} mb={4.5}>
            <Box
              sx={{
                width: 46, height: 46, borderRadius: '14px',
                background: 'linear-gradient(135deg, #4F46E5, #818CF8)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(79,70,229,0.5)',
                animation: 'logoPulse 2.5s ease-in-out infinite', flexShrink: 0,
              }}
            >
              <Icon icon="material-symbols:people-rounded" color="#fff" width={24} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 800, color: '#F1F5F9', fontSize: '1.05rem', lineHeight: 1.1 }}>
                WorkSphere
              </Typography>
              <Typography sx={{ fontSize: '0.62rem', color: '#6366F1', fontWeight: 700, letterSpacing: '0.1em' }}>
                HRMS PLATFORM
              </Typography>
            </Box>
          </Stack>

          <Typography
            sx={{
              fontWeight: 800, fontSize: { md: '1.75rem', lg: '2rem' }, lineHeight: 1.15,
              letterSpacing: '-0.03em', mb: 1.25,
              background: 'linear-gradient(135deg, #F1F5F9 0%, #94A3B8 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}
          >
            Modern HR,
            <br />Simplified.
          </Typography>
          <Typography sx={{ color: '#64748B', fontSize: '0.875rem', lineHeight: 1.75, mb: 4 }}>
            One platform to manage your entire workforce — from hire to retire.
          </Typography>

          {/* Feature cards */}
          <Stack spacing={1.25}>
            {FEATURES.map((f, i) => (
              <Box
                key={f.label}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 1.5,
                  p: 1.4, borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.06)',
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  backdropFilter: 'blur(8px)',
                  animation: `fadeUp 0.5s ${0.35 + i * 0.08}s both`,
                  transition: 'all 0.2s',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.06)', borderColor: 'rgba(99,102,241,0.3)' },
                }}
              >
                <Box sx={{ width: 32, height: 32, borderRadius: '9px', backgroundColor: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon icon={f.icon} color="#818CF8" width={17} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#E2E8F0', lineHeight: 1.2 }}>
                    {f.label}
                  </Typography>
                  <Typography sx={{ fontSize: '0.7rem', color: '#475569' }}>{f.desc}</Typography>
                </Box>
              </Box>
            ))}
          </Stack>
        </Box>

        {/* Bottom badges */}
        <Box sx={{ position: 'relative', mt: 'auto', pt: 4, animation: 'fadeUp 0.5s 0.75s both' }}>
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mb: 2 }} />
          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
            {['Secure', 'Scalable', 'Real-time', 'PWA Ready'].map((t) => (
              <Chip
                key={t} label={t} size="small"
                sx={{ backgroundColor: 'rgba(99,102,241,0.1)', color: '#818CF8', border: '1px solid rgba(99,102,241,0.2)', fontSize: '0.68rem', fontWeight: 600, height: 22 }}
              />
            ))}
          </Stack>
        </Box>
      </Box>

      {/* ══════════════ RIGHT PANEL ══════════════ */}
      <Box
        sx={{
          flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
          px: { xs: 3, sm: 5, md: 5.5 },
          py: { xs: 4, md: 5 },
          background: 'linear-gradient(180deg, rgba(15,10,30,0.97) 0%, rgba(10,6,20,0.99) 100%)',
          backdropFilter: 'blur(40px)',
        }}
      >
        {/* Mobile brand */}
        <Stack
          direction="row" alignItems="center" spacing={1.25} mb={3}
          sx={{ display: { xs: 'flex', md: 'none' }, animation: 'fadeUp 0.5s 0.1s both' }}
        >
          <Box sx={{ width: 34, height: 34, borderRadius: '10px', background: 'linear-gradient(135deg,#4F46E5,#818CF8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon icon="material-symbols:people-rounded" color="#fff" width={18} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 800, color: '#F1F5F9', fontSize: '0.95rem', lineHeight: 1.1 }}>
              WorkSphere HRMS
            </Typography>
            <Typography sx={{ fontSize: '0.65rem', color: '#6366F1', fontWeight: 600, letterSpacing: '0.08em' }}>
              HR MANAGEMENT PLATFORM
            </Typography>
          </Box>
        </Stack>

        {/* Heading */}
        <Box sx={{ mb: 3, animation: 'fadeUp 0.5s 0.2s both' }}>
          <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: '#F1F5F9', letterSpacing: '-0.025em', lineHeight: 1.2, mb: 0.4 }}>
            Welcome back
          </Typography>
          <Typography sx={{ color: '#475569', fontSize: '0.875rem' }}>
            Sign in to your workspace
          </Typography>
        </Box>

        {/* Error */}
        {error && (
          <Box
            sx={{
              mb: 2.5, px: 2, py: 1.4, borderRadius: '12px',
              backgroundColor: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.2)',
              display: 'flex', alignItems: 'center', gap: 1.25,
              animation: shake ? 'shake 0.45s ease both' : 'fadeUp 0.3s both',
            }}
          >
            <Icon icon="material-symbols:error-outline-rounded" color="#F87171" width={18} style={{ flexShrink: 0 }} />
            <Typography sx={{ fontSize: '0.85rem', color: '#FCA5A5', lineHeight: 1.5 }}>
              {error}
            </Typography>
          </Box>
        )}

        {/* Form */}
        <Box component="form" onSubmit={handleSubmit} sx={{ animation: 'fadeUp 0.5s 0.3s both' }}>
          <Stack spacing={2}>
            <Box>
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', letterSpacing: '0.07em', textTransform: 'uppercase', mb: 0.75 }}>
                Email
              </Typography>
              <TextField
                fullWidth type="email" placeholder="you@company.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                autoComplete="email" autoFocus sx={inputSx}
              />
            </Box>

            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.75}>
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                  Password
                </Typography>
              </Stack>
              <TextField
                fullWidth type={showPwd ? 'text' : 'password'} placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                autoComplete="current-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowPwd((p) => !p)} edge="end"
                        sx={{ color: '#475569', mr: 0.25, '&:hover': { color: '#94A3B8', backgroundColor: 'transparent' } }}
                      >
                        <Icon icon={showPwd ? 'material-symbols:visibility-off-outline-rounded' : 'material-symbols:visibility-outline-rounded'} width={19} />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={inputSx}
              />
            </Box>

            {/* Submit */}
            <Box sx={{ pt: 0.5 }}>
              <Button
                type="submit" fullWidth disabled={loading}
                sx={{
                  py: 1.55, borderRadius: '12px', fontSize: '0.9375rem', fontWeight: 700,
                  letterSpacing: '-0.01em', color: '#fff', textTransform: 'none',
                  background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 50%, #818CF8 100%)',
                  backgroundSize: '200% 200%',
                  boxShadow: '0 8px 32px rgba(79,70,229,0.4)',
                  position: 'relative', overflow: 'hidden', transition: 'all 0.25s ease',
                  '&:hover': {
                    boxShadow: '0 12px 40px rgba(79,70,229,0.6)',
                    transform: 'translateY(-1px)',
                    '&::after': { animation: 'shimmer 0.7s ease' },
                  },
                  '&:active': { transform: 'translateY(0)', boxShadow: '0 4px 16px rgba(79,70,229,0.4)' },
                  '&:disabled': { opacity: 0.6, transform: 'none', boxShadow: 'none' },
                  '&::after': {
                    content: '""', position: 'absolute', top: 0, left: 0,
                    width: '40%', height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                    transform: 'translateX(-100%) skewX(-12deg)',
                  },
                }}
              >
                {loading ? (
                  <Stack direction="row" alignItems="center" spacing={1.25} justifyContent="center">
                    <CircularProgress size={18} sx={{ color: 'rgba(255,255,255,0.8)' }} />
                    <span>Signing in…</span>
                  </Stack>
                ) : (
                  <Stack direction="row" alignItems="center" spacing={1} justifyContent="center">
                    <span>Sign In</span>
                    <Icon icon="material-symbols:arrow-forward-rounded" width={18} />
                  </Stack>
                )}
              </Button>
            </Box>
          </Stack>
        </Box>

        {/* Demo accounts */}
        <Box sx={{ mt: 3.5, animation: 'fadeUp 0.5s 0.45s both' }}>
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.07)', mb: 2.5 }}>
            <Typography sx={{ fontSize: '0.68rem', color: '#334155', fontWeight: 600, letterSpacing: '0.08em', px: 1 }}>
              DEMO ACCOUNTS
            </Typography>
          </Divider>
          <Stack direction="row" spacing={1.5}>
            {DEMO.map((d) => (
              <Box
                key={d.label}
                onClick={() => !demoLoading && handleDemoLogin(d)}
                sx={{
                  flex: 1, p: 1.75, borderRadius: '14px',
                  border: '1px solid rgba(255,255,255,0.07)',
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  cursor: demoLoading ? 'wait' : 'pointer',
                  transition: 'all 0.22s ease',
                  '&:hover': {
                    backgroundColor: d.bg,
                    borderColor: `${d.color}55`,
                    transform: demoLoading ? 'none' : 'translateY(-2px)',
                    boxShadow: `0 8px 24px ${d.color}18`,
                  },
                  '&:active': { transform: 'translateY(0)' },
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1} mb={0.75}>
                  <Box sx={{ width: 24, height: 24, borderRadius: '7px', backgroundColor: d.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {demoLoading === d.label
                      ? <CircularProgress size={12} sx={{ color: d.color }} />
                      : <Icon icon={d.icon} color={d.color} width={14} />
                    }
                  </Box>
                  <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: '#E2E8F0' }}>
                    {d.label}
                  </Typography>
                </Stack>
                <Typography sx={{ fontSize: '0.7rem', color: '#64748B', mb: 0.3 }}>{d.email}</Typography>
                <Typography sx={{ fontSize: '0.68rem', color: '#475569' }}>{d.desc}</Typography>
                <Stack direction="row" alignItems="center" spacing={0.5} mt={0.75}>
                  <Icon icon="material-symbols:bolt-rounded" color={d.color} width={12} />
                  <Typography sx={{ fontSize: '0.68rem', color: d.color, fontWeight: 600 }}>
                    {demoLoading === d.label ? 'Logging in…' : 'One-click login'}
                  </Typography>
                </Stack>
              </Box>
            ))}
          </Stack>
        </Box>

        <Typography sx={{ textAlign: 'center', fontSize: '0.68rem', color: '#334155', mt: 3, animation: 'fadeUp 0.5s 0.6s both' }}>
          © {new Date().getFullYear()} WorkSphere HRMS · All rights reserved
        </Typography>
      </Box>
    </Box>
  );
};

export default Login;
