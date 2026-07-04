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
} from '@mui/material';
import { Icon } from '@iconify/react';
import { useAuth } from 'context/AuthContext';

const DEMO = [
  { label: 'Admin', email: 'admin@hrms.com', password: '123' },
  { label: 'Manager', email: 'manager@hrms.com', password: '123' },
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
      setError('Enter your Apple ID and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Your account ID or password was incorrect.');
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
        maxWidth: 460,
        mx: 2,
      }}
    >
      {/* Card */}
      <Box
        sx={{
          backgroundColor: '#fff',
          borderRadius: '18px',
          boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
          overflow: 'hidden',
        }}
      >
        {/* Top section */}
        <Box
          sx={{
            px: { xs: 4, sm: 5 },
            pt: 5,
            pb: 4,
          }}
        >
          {/* Logo */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: '14px',
                backgroundColor: '#1D1D1F',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2.5,
              }}
            >
              <Icon icon="material-symbols:people-rounded" color="#fff" width={28} />
            </Box>
            <Typography
              sx={{
                fontSize: '1.6rem',
                fontWeight: 700,
                color: '#1D1D1F',
                letterSpacing: '-0.03em',
                lineHeight: 1.15,
                fontFamily: '"Inter", system-ui, sans-serif',
              }}
            >
              Sign In
            </Typography>
            <Typography
              sx={{
                fontSize: '0.9rem',
                color: '#6E6E73',
                mt: 0.5,
                fontFamily: '"Inter", system-ui, sans-serif',
              }}
            >
              to WorkSphere HRMS
            </Typography>
          </Box>

          {/* Error */}
          {error && (
            <Box
              sx={{
                backgroundColor: '#FFF2F2',
                border: '1px solid #FECACA',
                borderRadius: '10px',
                px: 2,
                py: 1.25,
                mb: 2.5,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1,
              }}
            >
              <Icon
                icon="material-symbols:error-outline-rounded"
                color="#DC2626"
                width={16}
                style={{ marginTop: 2, flexShrink: 0 }}
              />
              <Typography sx={{ fontSize: '0.84rem', color: '#DC2626', lineHeight: 1.5 }}>
                {error}
              </Typography>
            </Box>
          )}

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={1.5}>
              {/* Email field */}
              <TextField
                fullWidth
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                autoComplete="email"
                autoFocus
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                    backgroundColor: '#F5F5F7',
                    fontSize: '0.9375rem',
                    color: '#1D1D1F',
                    '& fieldset': { border: 'none' },
                    '&.Mui-focused': {
                      backgroundColor: '#fff',
                      outline: '2px solid #0071E3',
                      outlineOffset: '0px',
                    },
                    '& input': {
                      py: 1.5,
                      '&::placeholder': { color: '#AEAEB2', opacity: 1 },
                    },
                  },
                }}
              />

              {/* Password field */}
              <TextField
                fullWidth
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                autoComplete="current-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setShowPassword((p) => !p)}
                        edge="end"
                        sx={{
                          color: '#AEAEB2',
                          mr: 0.25,
                          '&:hover': { color: '#1D1D1F', backgroundColor: 'transparent' },
                        }}
                      >
                        <Icon
                          icon={
                            showPassword
                              ? 'material-symbols:visibility-off-outline-rounded'
                              : 'material-symbols:visibility-outline-rounded'
                          }
                          width={19}
                        />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                    backgroundColor: '#F5F5F7',
                    fontSize: '0.9375rem',
                    color: '#1D1D1F',
                    '& fieldset': { border: 'none' },
                    '&.Mui-focused': {
                      backgroundColor: '#fff',
                      outline: '2px solid #0071E3',
                      outlineOffset: '0px',
                    },
                    '& input': {
                      py: 1.5,
                      '&::placeholder': { color: '#AEAEB2', opacity: 1 },
                    },
                  },
                }}
              />

              {/* Sign In button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  py: 1.35,
                  mt: 0.5,
                  borderRadius: '10px',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  letterSpacing: '-0.01em',
                  backgroundColor: '#0071E3',
                  color: '#fff',
                  textTransform: 'none',
                  boxShadow: 'none',
                  '&:hover': { backgroundColor: '#0077ED', boxShadow: 'none' },
                  '&:active': { backgroundColor: '#006EDB' },
                  '&:disabled': { backgroundColor: '#B2D7FE', color: '#fff' },
                  transition: 'background-color 0.15s ease',
                }}
              >
                {loading ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : 'Sign In'}
              </Button>
            </Stack>
          </Box>
        </Box>

        {/* Demo section */}
        <Box
          sx={{
            borderTop: '1px solid #F2F2F7',
            px: { xs: 4, sm: 5 },
            py: 3,
            backgroundColor: '#FAFAFA',
          }}
        >
          <Typography
            sx={{
              fontSize: '0.72rem',
              color: '#AEAEB2',
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              textAlign: 'center',
              mb: 2,
            }}
          >
            Quick Access
          </Typography>
          <Stack direction="row" spacing={1.5}>
            {DEMO.map((d) => (
              <Box
                key={d.label}
                onClick={() => fillDemo(d)}
                sx={{
                  flex: 1,
                  py: 1.25,
                  px: 2,
                  borderRadius: '10px',
                  border: '1px solid #E5E5EA',
                  backgroundColor: '#fff',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    borderColor: '#0071E3',
                    backgroundColor: '#F0F7FF',
                  },
                  '&:active': { transform: 'scale(0.98)' },
                }}
              >
                <Typography
                  sx={{
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: '#1D1D1F',
                    lineHeight: 1.3,
                  }}
                >
                  {d.label}
                </Typography>
                <Typography sx={{ fontSize: '0.7rem', color: '#AEAEB2', mt: 0.25 }}>
                  {d.email}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>

      {/* Footer */}
      <Divider sx={{ my: 2.5, borderColor: '#D2D2D7' }} />
      <Typography
        sx={{
          textAlign: 'center',
          fontSize: '0.72rem',
          color: '#AEAEB2',
          lineHeight: 1.8,
        }}
      >
        Copyright © {new Date().getFullYear()} WorkSphere HRMS. All rights reserved.
      </Typography>
    </Box>
  );
};

export default Login;
