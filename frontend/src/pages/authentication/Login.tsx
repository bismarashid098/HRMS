import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Icon } from '@iconify/react';
import { useAuth } from 'context/AuthContext';

const CREDS = [
  {
    role: 'Admin',
    email: 'admin@hrms.com',
    pw: '123',
    color: '#3B82F6',
    glow: 'rgba(59,130,246,.55)',
  },
  {
    role: 'Manager',
    email: 'manager@hrms.com',
    pw: '123',
    color: '#10B981',
    glow: 'rgba(16,185,129,.55)',
  },
];

const FEATURES = [
  {
    icon: 'solar:users-group-two-rounded-bold-duotone',
    title: 'Employee Management',
    desc: 'Complete employee lifecycle, profiles & records',
  },
  {
    icon: 'solar:calendar-mark-bold-duotone',
    title: 'Attendance & Payroll',
    desc: 'Real-time tracking with automated payroll processing',
  },
  {
    icon: 'solar:document-text-bold-duotone',
    title: 'Leave Management',
    desc: 'Streamlined approvals, balances & leave reporting',
  },
];

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    height: 52,
    borderRadius: '12px',
    background: 'rgba(255,255,255,0.03)',
    color: '#E2E8F0',
    fontSize: 14.5,
    transition: 'background .2s, box-shadow .2s',
    '& fieldset': { borderColor: 'rgba(255,255,255,0.08)', transition: 'border-color .2s' },
    '&:hover fieldset': { borderColor: 'rgba(59,130,246,.38)' },
    '&.Mui-focused fieldset': { borderColor: '#3B82F6', borderWidth: '1.5px' },
    '&.Mui-focused': {
      background: 'rgba(37,99,235,.04)',
      boxShadow: '0 0 0 3px rgba(59,130,246,.1)',
    },
  },
  '& .MuiInputLabel-root': { color: '#475569', fontSize: 14 },
  '& .MuiInputLabel-root.Mui-focused': { color: '#60A5FA' },
  '& .MuiInputLabel-root.MuiFormLabel-filled': { color: '#94A3B8' },
};

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [email, setEmail] = useState('admin@hrms.com');
  const [password, setPassword] = useState('123');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch {
      setShake(true);
      setTimeout(() => setShake(false), 550);
    } finally {
      setLoading(false);
    }
  };

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(null), 1600);
  };

  return (
    <Box sx={{ display: 'flex', width: '100%', minHeight: '100vh' }}>
      {/* ════════════════════════════════════════
          LEFT — BRAND PANEL  (hidden on mobile)
      ════════════════════════════════════════ */}
      {!isMobile && (
        <Box
          sx={{
            flex: '0 0 46%',
            position: 'relative',
            overflow: 'hidden',
            background: 'linear-gradient(150deg, #060F26 0%, #0B1C40 55%, #0E245A 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            p: '52px 56px',
            animation: 'fadeIn 0.55s ease both',
          }}
        >
          {/* Panel decoration */}
          <Box
            sx={{
              position: 'absolute',
              top: '-15%',
              right: '-18%',
              width: 550,
              height: 550,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(59,130,246,.24) 0%, transparent 65%)',
              filter: 'blur(70px)',
              pointerEvents: 'none',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: '-10%',
              left: '-12%',
              width: 450,
              height: 450,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(99,102,241,.18) 0%, transparent 65%)',
              filter: 'blur(60px)',
              pointerEvents: 'none',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: '52%',
              left: '42%',
              width: 280,
              height: 280,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(16,185,129,.12) 0%, transparent 65%)',
              filter: 'blur(40px)',
              pointerEvents: 'none',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              backgroundImage:
                'linear-gradient(rgba(59,130,246,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,.03) 1px, transparent 1px)',
              backgroundSize: '52px 52px',
              pointerEvents: 'none',
            }}
          />

          {/* Top — Logo */}
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box
              component="img"
              src="/hrms-logo.png"
              alt="WorkSphere HRMS"
              sx={{ height: 82, width: 'auto', display: 'block', borderRadius: '10px' }}
            />
          </Box>

          {/* Middle — Headline + Features */}
          <Box sx={{ position: 'relative', zIndex: 1, animation: 'fadeUp 0.65s ease 0.15s both' }}>
            <Typography
              sx={{
                fontFamily: 'Inter,sans-serif',
                fontWeight: 800,
                fontSize: 38,
                color: '#F8FAFC',
                letterSpacing: '-1.2px',
                lineHeight: 1.18,
                mb: 1.5,
              }}
            >
              Manage your
              <br />
              <Box
                component="span"
                sx={{
                  background: 'linear-gradient(90deg, #60A5FA, #818CF8)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                workforce
              </Box>{' '}
              smarter.
            </Typography>
            <Typography
              sx={{
                fontFamily: 'Inter,sans-serif',
                fontSize: 15,
                color: '#475569',
                lineHeight: 1.8,
                mb: 5.5,
              }}
            >
              The complete HR platform for modern teams — from attendance to payroll, all in one
              place.
            </Typography>

            <Stack direction="column" spacing={3.5}>
              {FEATURES.map((f, i) => (
                <Stack
                  key={f.title}
                  direction="row"
                  alignItems="flex-start"
                  spacing={2}
                  sx={{ animation: `fadeUp 0.6s ease ${0.25 + i * 0.1}s both` }}
                >
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      flexShrink: 0,
                      borderRadius: '12px',
                      border: '1px solid rgba(59,130,246,.18)',
                      background: 'rgba(59,130,246,.07)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 12px rgba(59,130,246,.08)',
                    }}
                  >
                    <Icon icon={f.icon} width={22} color="#60A5FA" />
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        fontFamily: 'Inter,sans-serif',
                        fontWeight: 600,
                        fontSize: 14.5,
                        color: '#CBD5E1',
                        mb: 0.35,
                      }}
                    >
                      {f.title}
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: 'Inter,sans-serif',
                        fontSize: 13,
                        color: '#475569',
                        lineHeight: 1.65,
                      }}
                    >
                      {f.desc}
                    </Typography>
                  </Box>
                </Stack>
              ))}
            </Stack>
          </Box>

          {/* Bottom */}
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: '#10B981',
                  animation: 'statusPulse 2.5s ease-in-out infinite',
                }}
              />
              <Typography
                sx={{
                  fontFamily: 'Inter,sans-serif',
                  fontSize: 12.5,
                  color: '#1E3A5F',
                  fontWeight: 500,
                }}
              >
                All systems operational · WorkSphere HRMS v2.0
              </Typography>
            </Stack>
          </Box>
        </Box>
      )}

      {/* ════════════════════════════════════════
          RIGHT — LOGIN FORM
      ════════════════════════════════════════ */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: '40px 24px', sm: '48px 40px', md: '56px 64px' },
          overflowY: 'auto',
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 400,
            animation: 'fadeUp 0.55s cubic-bezier(.16,1,.3,1) 0.08s both',
          }}
        >
          {/* Mobile-only logo */}
          {isMobile && (
            <Box sx={{ mb: 5 }}>
              <Box
                component="img"
                src="/hrms-logo.png"
                alt="WorkSphere HRMS"
                sx={{ height: 60, width: 'auto', display: 'block', borderRadius: '8px' }}
              />
            </Box>
          )}

          {/* Heading */}
          <Box sx={{ mb: 5 }}>
            <Typography
              sx={{
                fontFamily: 'Inter,sans-serif',
                fontWeight: 800,
                fontSize: 28,
                color: '#F8FAFC',
                letterSpacing: '-0.7px',
                lineHeight: 1.2,
                mb: 0.75,
              }}
            >
              Welcome back
            </Typography>
            <Typography
              sx={{
                fontFamily: 'Inter,sans-serif',
                fontSize: 14.5,
                color: '#475569',
                lineHeight: 1.65,
              }}
            >
              Sign in to your workspace to continue.
            </Typography>
          </Box>

          {/* Form */}
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ animation: shake ? 'shake 0.55s ease' : 'none' }}
          >
            <Stack direction="column" spacing={2.75}>
              <TextField
                fullWidth
                label="Email address"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                sx={fieldSx}
                slotProps={{
                  inputLabel: { shrink: true },
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Icon icon="solar:letter-bold-duotone" width={18} color="#334155" />
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <TextField
                fullWidth
                label="Password"
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                sx={fieldSx}
                slotProps={{
                  inputLabel: { shrink: true },
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Icon icon="solar:lock-keyhole-bold-duotone" width={18} color="#334155" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setShowPw((p) => !p)}
                          sx={{
                            color: '#334155',
                            '&:hover': { color: '#60A5FA', background: 'rgba(96,165,250,.08)' },
                            transition: 'color .2s',
                          }}
                        >
                          <Icon
                            icon={
                              showPw ? 'solar:eye-closed-bold-duotone' : 'solar:eye-bold-duotone'
                            }
                            width={18}
                          />
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      sx={{ color: '#1E293B', '&.Mui-checked': { color: '#3B82F6' }, p: 0.75 }}
                    />
                  }
                  label={
                    <Typography
                      sx={{ fontFamily: 'Inter,sans-serif', fontSize: 13.5, color: '#475569' }}
                    >
                      Remember me
                    </Typography>
                  }
                />
                <Typography
                  sx={{
                    fontFamily: 'Inter,sans-serif',
                    fontSize: 13.5,
                    color: '#3B82F6',
                    cursor: 'pointer',
                    fontWeight: 500,
                    transition: 'color .2s',
                    '&:hover': { color: '#60A5FA' },
                  }}
                >
                  Forgot password?
                </Typography>
              </Stack>

              <Button
                fullWidth
                type="submit"
                disabled={loading}
                sx={{
                  height: 52,
                  borderRadius: '12px',
                  fontFamily: 'Inter,sans-serif',
                  fontWeight: 700,
                  fontSize: 15,
                  textTransform: 'none',
                  letterSpacing: '-0.1px',
                  background: loading
                    ? 'rgba(37,99,235,.2)'
                    : 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                  color: '#fff',
                  boxShadow: loading
                    ? 'none'
                    : '0 4px 22px rgba(29,78,216,.42), 0 1px 0 rgba(255,255,255,.1) inset',
                  transition: 'all .25s cubic-bezier(.16,1,.3,1)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)',
                    boxShadow:
                      '0 8px 30px rgba(37,99,235,.55), 0 1px 0 rgba(255,255,255,.14) inset',
                    transform: 'translateY(-2px)',
                  },
                  '&:active': { transform: 'translateY(0)', transition: 'none' },
                  '&.Mui-disabled': {
                    background: 'rgba(37,99,235,.12)',
                    color: 'rgba(255,255,255,.22)',
                    boxShadow: 'none',
                  },
                }}
              >
                {loading ? (
                  <CircularProgress size={20} sx={{ color: '#fff' }} />
                ) : (
                  <Stack direction="row" alignItems="center" spacing={0.75}>
                    <span>Sign in to WorkSphere</span>
                    <Icon icon="solar:arrow-right-bold" width={16} />
                  </Stack>
                )}
              </Button>
            </Stack>
          </Box>

          {/* Divider */}
          <Box sx={{ my: 3.5 }}>
            <Divider sx={{ '&::before,&::after': { borderColor: 'rgba(255,255,255,.06)' } }}>
              <Typography
                sx={{
                  fontFamily: 'Inter,sans-serif',
                  fontSize: 10.5,
                  color: '#1E293B',
                  fontWeight: 700,
                  px: 1.5,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                Quick Access
              </Typography>
            </Divider>
          </Box>

          {/* Demo credential cards */}
          <Stack direction="row" spacing={1.5}>
            {CREDS.map((c) => (
              <Box
                key={c.role}
                onClick={() => {
                  setEmail(c.email);
                  setPassword(c.pw);
                }}
                sx={{
                  flex: 1,
                  p: '14px 16px',
                  borderRadius: '14px',
                  border: `1px solid ${c.color}1E`,
                  background: `${c.color}09`,
                  cursor: 'pointer',
                  transition: 'all .22s cubic-bezier(.16,1,.3,1)',
                  '&:hover': {
                    border: `1px solid ${c.color}45`,
                    background: `${c.color}13`,
                    transform: 'translateY(-3px)',
                    boxShadow: `0 10px 28px ${c.color}18`,
                  },
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ mb: 0.9 }}
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: c.color,
                        boxShadow: `0 0 8px ${c.glow}`,
                        animation: 'statusPulse 2.5s ease-in-out infinite',
                      }}
                    />
                    <Typography
                      sx={{
                        fontFamily: 'Inter,sans-serif',
                        fontSize: 12.5,
                        fontWeight: 700,
                        color: '#CBD5E1',
                      }}
                    >
                      {c.role}
                    </Typography>
                  </Stack>
                  <Box
                    onClick={(e) => {
                      e.stopPropagation();
                      copy(c.email, c.role);
                    }}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      px: 1,
                      py: 0.4,
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'background .15s',
                      '&:hover': { background: 'rgba(255,255,255,.06)' },
                    }}
                  >
                    <Icon
                      icon={copied === c.role ? 'solar:check-read-bold' : 'solar:copy-bold-duotone'}
                      width={12}
                      color={copied === c.role ? '#22C55E' : '#334155'}
                    />
                    <Typography
                      sx={{
                        fontFamily: 'Inter,sans-serif',
                        fontSize: 11,
                        fontWeight: 600,
                        color: copied === c.role ? '#22C55E' : '#334155',
                      }}
                    >
                      {copied === c.role ? 'Copied' : 'Use'}
                    </Typography>
                  </Box>
                </Stack>
                <Typography
                  sx={{
                    fontFamily: 'monospace',
                    fontSize: 11.5,
                    color: '#334155',
                    letterSpacing: '-0.2px',
                  }}
                >
                  {c.email}
                </Typography>
              </Box>
            ))}
          </Stack>

          {/* Footer */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 5 }}>
            <Typography sx={{ fontFamily: 'Inter,sans-serif', fontSize: 12, color: '#1E293B' }}>
              © 2026 WorkSphere HRMS
            </Typography>
            <Stack direction="row" spacing={2.5}>
              {['Privacy', 'Terms'].map((t) => (
                <Typography
                  key={t}
                  sx={{
                    fontFamily: 'Inter,sans-serif',
                    fontSize: 12,
                    color: '#1E293B',
                    cursor: 'pointer',
                    transition: 'color .2s',
                    '&:hover': { color: '#334155' },
                  }}
                >
                  {t}
                </Typography>
              ))}
            </Stack>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
