import { PropsWithChildren } from 'react';
import { Box } from '@mui/material';

const AuthLayout = ({ children }: PropsWithChildren) => (
  <Box
    sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0B1120 0%, #0F172A 50%, #1E1B4B 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    {/* Background decorations */}
    <Box
      sx={{
        position: 'absolute',
        top: '-20%',
        right: '-10%',
        width: 600,
        height: 600,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
      }}
    />
    <Box
      sx={{
        position: 'absolute',
        bottom: '-20%',
        left: '-10%',
        width: 500,
        height: 500,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }}
    />
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'radial-gradient(rgba(99,102,241,0.08) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
        pointerEvents: 'none',
      }}
    />
    {children}
  </Box>
);

export default AuthLayout;
