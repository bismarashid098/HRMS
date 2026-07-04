import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import { Icon } from '@iconify/react';
import { useAuth } from 'context/AuthContext';

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
      setError('Please enter email and password');
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

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 420,
        mx: 2,
        position: 'relative',
        zIndex: 1,
      }}
    >
      {/* Card */}
      <Box
        sx={{
          backgroundColor: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '20px',
          p: { xs: 3, sm: 4 },
          boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
        }}
      >
        {/* Logo + Brand */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #4F46E5 0%, #818CF8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
              boxShadow: '0 8px 24px rgba(79,70,229,0.5)',
            }}
          >
            <Icon icon="material-symbols:people-rounded" color="#fff" width={30} />
          </Box>
          <Typography variant="h5" fontWeight={800} color="#F1F5F9" letterSpacing="-0.02em">
            WorkSphere HRMS
          </Typography>
          <Typography variant="body2" color="#64748B" mt={0.5}>
            Sign in to your account
          </Typography>
        </Box>

        {/* Form */}
        <Box component="form" onSubmit={handleSubmit}>
          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 2.5,
                borderRadius: '10px',
                backgroundColor: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.2)',
                color: '#FCA5A5',
                '& .MuiAlert-icon': { color: '#EF4444' },
              }}
            >
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography
                variant="caption"
                fontWeight={600}
                color="#94A3B8"
                display="block"
                mb={0.75}
                fontSize="0.78rem"
                letterSpacing="0.04em"
              >
                EMAIL ADDRESS
              </Typography>
              <TextField
                fullWidth
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Icon
                        icon="material-symbols:mail-outline-rounded"
                        color="#64748B"
                        width={18}
                      />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    borderRadius: '10px',
                    color: '#F1F5F9',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2) !important' },
                    '&.Mui-focused fieldset': { borderColor: '#6366F1 !important' },
                  },
                  '& input': {
                    '&::placeholder': { color: '#475569', opacity: 1 },
                  },
                }}
              />
            </Box>

            <Box>
              <Typography
                variant="caption"
                fontWeight={600}
                color="#94A3B8"
                display="block"
                mb={0.75}
                fontSize="0.78rem"
                letterSpacing="0.04em"
              >
                PASSWORD
              </Typography>
              <TextField
                fullWidth
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Icon
                        icon="material-symbols:lock-outline-rounded"
                        color="#64748B"
                        width={18}
                      />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setShowPassword((p) => !p)}
                        edge="end"
                        sx={{ color: '#64748B' }}
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
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    borderRadius: '10px',
                    color: '#F1F5F9',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2) !important' },
                    '&.Mui-focused fieldset': { borderColor: '#6366F1 !important' },
                  },
                  '& input': {
                    '&::placeholder': { color: '#475569', opacity: 1 },
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
                mt: 0.5,
                py: 1.4,
                borderRadius: '10px',
                fontSize: '0.9375rem',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)',
                boxShadow: '0 8px 24px rgba(79,70,229,0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #3730A3 0%, #4F46E5 100%)',
                  boxShadow: '0 8px 28px rgba(79,70,229,0.5)',
                },
                '&:disabled': { opacity: 0.7 },
              }}
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : 'Sign In'}
            </Button>
          </Box>
        </Box>

        {/* Demo credentials */}
        <Box
          sx={{
            mt: 3,
            p: 2,
            borderRadius: '10px',
            backgroundColor: 'rgba(99,102,241,0.08)',
            border: '1px solid rgba(99,102,241,0.15)',
          }}
        >
          <Typography
            variant="caption"
            color="#818CF8"
            fontWeight={600}
            display="block"
            mb={0.75}
            fontSize="0.72rem"
            letterSpacing="0.06em"
          >
            DEMO CREDENTIALS
          </Typography>
          <Typography variant="caption" color="#94A3B8" display="block" fontSize="0.78rem">
            Admin: admin@hrms.com / 123
          </Typography>
          <Typography variant="caption" color="#94A3B8" display="block" fontSize="0.78rem">
            Manager: manager@hrms.com / 123
          </Typography>
        </Box>
      </Box>

      <Typography variant="caption" color="#334155" display="block" textAlign="center" mt={3}>
        © {new Date().getFullYear()} WorkSphere HRMS. All rights reserved.
      </Typography>
    </Box>
  );
};

export default Login;
