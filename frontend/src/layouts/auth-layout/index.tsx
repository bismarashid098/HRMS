import { PropsWithChildren } from 'react';
import { Box } from '@mui/material';

const AuthLayout = ({ children }: PropsWithChildren) => (
  <Box
    sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#F5F5F7',
    }}
  >
    {children}
  </Box>
);

export default AuthLayout;
