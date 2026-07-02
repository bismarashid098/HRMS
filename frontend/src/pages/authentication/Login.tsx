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
} from '@mui/material';
import { Icon } from '@iconify/react';
import { useAuth } from 'context/AuthContext';

/* ── Demo credentials ─────────────────────────────────────────────────────── */
const CREDS = [
  { role: 'Admin',   email: 'admin@hrms.com',   pw: '123', color: '#3B82F6', glow: 'rgba(59,130,246,.6)'  },
  { role: 'Manager', email: 'manager@hrms.com', pw: '123', color: '#10B981', glow: 'rgba(16,185,129,.6)'  },
];

/* ── Input field style ────────────────────────────────────────────────────── */
const fieldSx = {
  '& .MuiOutlinedInput-root': {
    height: 50,
    borderRadius: '11px',
    background: 'rgba(255,255,255,0.04)',
    color: '#E2E8F0',
    fontSize: 14,
    fontFamily: 'Inter, sans-serif',
    transition: 'background .2s, box-shadow .2s',
    '& fieldset': { borderColor: 'rgba(255,255,255,0.08)', transition: 'border-color .2s' },
    '&:hover fieldset':        { borderColor: 'rgba(59,130,246,0.45)' },
    '&:hover':                 { background: 'rgba(255,255,255,0.06)' },
    '&.Mui-focused fieldset':  { borderColor: '#3B82F6', borderWidth: '1.5px' },
    '&.Mui-focused':           { background: 'rgba(37,99,235,0.05)', boxShadow: '0 0 0 3px rgba(59,130,246,0.14)' },
  },
  '& .MuiInputLabel-root': { color: '#475569', fontFamily: 'Inter, sans-serif', fontSize: 13.5 },
  '& .MuiInputLabel-root.Mui-focused':        { color: '#60A5FA' },
  '& .MuiInputLabel-root.MuiFormLabel-filled':{ color: '#94A3B8' },
};

/* ═══════════════════════════════════════════════════════════════════════════ */

const Login = () => {
  const navigate   = useNavigate();
  const { login }  = useAuth();

  const [email,    setEmail]    = useState('admin@hrms.com');
  const [password, setPassword] = useState('123');
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [shake,    setShake]    = useState(false);
  const [copied,   setCopied]   = useState<string | null>(null);

  /* ── Auth logic — unchanged ── */
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
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <Box sx={{ fontFamily: 'Inter, sans-serif' }}>

      {/* ════════════════════════════════
          BRAND HEADER  (above card)
      ════════════════════════════════ */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="center"
        spacing={2}
        sx={{ mb: 5, animation: 'logoIn 0.5s cubic-bezier(.16,1,.3,1) both' }}
      >
        <Box
          sx={{
            borderRadius: '13px',
            bgcolor: '#fff',
            p: '7px 11px',
            display: 'inline-flex',
            boxShadow: '0 0 0 1px rgba(255,255,255,.12), 0 4px 20px rgba(0,0,0,.45)',
          }}
        >
          <Box component="img" src="/hrms-logo.png" alt="WorkSphere HRMS" sx={{ height: 42, width: 'auto', display: 'block' }} />
        </Box>
        <Box>
          <Typography sx={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 18, color: '#F8FAFC', letterSpacing: '-0.4px', lineHeight: 1.2 }}>
            WorkSphere
          </Typography>
          <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: 10.5, color: '#475569', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            HRMS Platform
          </Typography>
        </Box>
      </Stack>

      {/* System status badge */}
      <Stack justifyContent="center" direction="row" sx={{ mb: 4 }}>
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{
            px: 2, py: 0.65,
            borderRadius: '999px',
            border: '1px solid rgba(16,185,129,0.22)',
            background: 'rgba(16,185,129,0.06)',
          }}
        >
          <Box
            sx={{
              width: 6, height: 6, borderRadius: '50%', bgcolor: '#10B981',
              animation: 'statusPulse 2s ease-in-out infinite',
            }}
          />
          <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#10B981', fontWeight: 500 }}>
            All systems operational
          </Typography>
        </Stack>
      </Stack>

      {/* ════════════════════════════════
          GRADIENT-BORDER CARD
      ════════════════════════════════ */}
      <Box
        sx={{
          borderRadius: '22px',
          p: '1px',
          background: 'linear-gradient(140deg, rgba(59,130,246,.65) 0%, rgba(99,102,241,.28) 45%, rgba(15,23,50,.55) 100%)',
          boxShadow: '0 0 90px rgba(59,130,246,.16), 0 40px 90px rgba(0,0,0,.55)',
          animation: 'cardIn 0.5s cubic-bezier(.16,1,.3,1) 0.08s both',
        }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
          sx={{
            borderRadius: '21px',
            background: 'rgba(6,11,28,0.97)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            p: { xs: '32px 28px', sm: '44px' },
            animation: shake ? 'shake 0.55s ease' : 'none',
          }}
        >
          {/* Heading */}
          <Box sx={{ mb: 4 }}>
            <Typography
              sx={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 800,
                fontSize: 26,
                color: '#F8FAFC',
                letterSpacing: '-0.7px',
                lineHeight: 1.2,
                mb: 0.75,
              }}
            >
              Welcome back 👋
            </Typography>
            <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#64748B', lineHeight: 1.65 }}>
              Enter your credentials to access your workspace.
            </Typography>
          </Box>

          {/* Fields */}
          <Stack spacing={2.5}>

            {/* Email */}
            <TextField
              fullWidth
              label="Email address"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              sx={fieldSx}
              slotProps={{
                inputLabel: { shrink: true },
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Icon icon="solar:letter-bold-duotone" width={17} color="#475569" />
                    </InputAdornment>
                  ),
                },
              }}
            />

            {/* Password */}
            <TextField
              fullWidth
              label="Password"
              type={showPw ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              sx={fieldSx}
              slotProps={{
                inputLabel: { shrink: true },
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Icon icon="solar:lock-keyhole-bold-duotone" width={17} color="#475569" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        type="button"
                        size="small"
                        onClick={() => setShowPw(p => !p)}
                        aria-label={showPw ? 'Hide password' : 'Show password'}
                        sx={{ color: '#475569', '&:hover': { color: '#60A5FA', background: 'rgba(96,165,250,.08)' }, transition: 'color .2s' }}
                      >
                        <Icon icon={showPw ? 'solar:eye-closed-bold-duotone' : 'solar:eye-bold-duotone'} width={17} />
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            {/* Remember + Forgot */}
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: -0.5 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    sx={{ color: '#334155', '&.Mui-checked': { color: '#3B82F6' }, p: 0.75 }}
                  />
                }
                label={
                  <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#64748B' }}>
                    Remember me
                  </Typography>
                }
              />
              <Typography
                sx={{
                  fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#60A5FA',
                  cursor: 'pointer', fontWeight: 500, userSelect: 'none',
                  transition: 'color .2s', '&:hover': { color: '#93C5FD' },
                }}
              >
                Forgot password?
              </Typography>
            </Stack>

            {/* Sign In button */}
            <Button
              fullWidth
              type="submit"
              disabled={loading}
              sx={{
                height: 50,
                borderRadius: '11px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                fontSize: 15,
                textTransform: 'none',
                letterSpacing: '-0.1px',
                background: loading
                  ? 'rgba(37,99,235,.3)'
                  : 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                color: '#fff',
                boxShadow: loading
                  ? 'none'
                  : '0 1px 0 rgba(255,255,255,.1) inset, 0 8px 22px rgba(37,99,235,.44)',
                transition: 'all .25s cubic-bezier(.16,1,.3,1)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)',
                  boxShadow: '0 1px 0 rgba(255,255,255,.14) inset, 0 12px 28px rgba(37,99,235,.55)',
                  transform: 'translateY(-2px)',
                },
                '&:active':      { transform: 'translateY(0)', boxShadow: '0 4px 10px rgba(37,99,235,.3)' },
                '&.Mui-disabled':{ background: 'rgba(37,99,235,.18)', color: 'rgba(255,255,255,.3)', boxShadow: 'none' },
              }}
            >
              {loading
                ? <CircularProgress size={19} sx={{ color: '#fff' }} />
                : <Stack direction="row" alignItems="center" spacing={0.75}>
                    <span>Sign in to WorkSphere</span>
                    <Icon icon="solar:arrow-right-bold" width={15} />
                  </Stack>
              }
            </Button>
          </Stack>

          {/* Divider */}
          <Box sx={{ my: 3 }}>
            <Divider sx={{ '&::before,&::after': { borderColor: 'rgba(255,255,255,.07)' } }}>
              <Typography
                sx={{
                  fontFamily: 'Inter, sans-serif', fontSize: 10.5, color: '#334155',
                  fontWeight: 600, px: 1.5, letterSpacing: '0.09em', textTransform: 'uppercase',
                }}
              >
                Quick Access
              </Typography>
            </Divider>
          </Box>

          {/* Demo credential cards — side by side */}
          <Stack direction="row" spacing={1.5}>
            {CREDS.map(c => (
              <Box
                key={c.role}
                onClick={() => { setEmail(c.email); setPassword(c.pw); }}
                sx={{
                  flex: 1,
                  px: 2, py: 1.5,
                  borderRadius: '12px',
                  border: `1px solid ${c.color}22`,
                  background: `${c.color}0A`,
                  cursor: 'pointer',
                  transition: 'all .22s',
                  '&:hover': {
                    border: `1px solid ${c.color}48`,
                    background: `${c.color}14`,
                    transform: 'translateY(-2px)',
                    boxShadow: `0 8px 24px ${c.glow.replace('.6', '.1')}`,
                  },
                }}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.75 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: c.color, boxShadow: `0 0 7px ${c.glow}` }} />
                    <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, fontWeight: 700, color: '#CBD5E1', letterSpacing: '-0.1px' }}>
                      {c.role}
                    </Typography>
                  </Stack>
                  <Box
                    onClick={e => { e.stopPropagation(); copy(c.email, c.role); }}
                    sx={{
                      display: 'flex', alignItems: 'center', gap: 0.4,
                      px: 1, py: 0.35, borderRadius: '5px', cursor: 'pointer',
                      transition: 'background .15s',
                      '&:hover': { background: 'rgba(255,255,255,.07)' },
                    }}
                  >
                    <Icon
                      icon={copied === c.role ? 'solar:check-read-bold' : 'solar:copy-bold-duotone'}
                      width={12}
                      color={copied === c.role ? '#22C55E' : '#475569'}
                    />
                    <Typography sx={{ fontSize: 10.5, fontFamily: 'Inter, sans-serif', fontWeight: 600, color: copied === c.role ? '#22C55E' : '#475569' }}>
                      {copied === c.role ? 'Copied' : 'Use'}
                    </Typography>
                  </Box>
                </Stack>
                <Typography sx={{ fontFamily: 'monospace', fontSize: 11, color: '#475569' }}>
                  {c.email}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>

      {/* ════════════════════════════════
          FOOTER  (below card)
      ════════════════════════════════ */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mt: 4, px: 1, animation: 'footerIn 0.6s ease 0.3s both' }}
      >
        <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: '#1E293B' }}>
          © 2026 WorkSphere HRMS
        </Typography>
        <Stack direction="row" spacing={2.5}>
          {['Privacy', 'Terms'].map(t => (
            <Typography
              key={t}
              sx={{
                fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: '#1E293B',
                cursor: 'pointer', transition: 'color .2s',
                '&:hover': { color: '#334155' },
              }}
            >
              {t}
            </Typography>
          ))}
        </Stack>
      </Stack>
    </Box>
  );
};

export default Login;