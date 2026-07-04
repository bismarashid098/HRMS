import { Box, CircularProgress } from '@mui/material';

const PageLoader = () => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#F1F5F9',
    }}
  >
    <CircularProgress size={48} thickness={4} sx={{ color: '#4F46E5' }} />
  </Box>
);

export default PageLoader;
