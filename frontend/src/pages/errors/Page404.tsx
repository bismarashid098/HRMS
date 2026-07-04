import { Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router';
import { Icon } from '@iconify/react';

const Page404 = () => {
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F1F5F9',
        p: 3,
      }}
    >
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #4F46E5 0%, #818CF8 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 3,
          boxShadow: '0 8px 24px rgba(79,70,229,0.4)',
        }}
      >
        <Icon icon="material-symbols:search-off-rounded" color="#fff" width={40} />
      </Box>
      <Typography variant="h2" fontWeight={800} color="text.primary" mb={1}>
        404
      </Typography>
      <Typography variant="h6" fontWeight={600} color="text.primary" mb={1}>
        Page Not Found
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={4} textAlign="center" maxWidth={360}>
        The page you're looking for doesn't exist or has been moved.
      </Typography>
      <Button
        variant="contained"
        onClick={() => navigate('/')}
        startIcon={<Icon icon="material-symbols:arrow-back-rounded" width={18} />}
        sx={{ borderRadius: '10px', px: 3, py: 1.25 }}
      >
        Back to Dashboard
      </Button>
    </Box>
  );
};

export default Page404;
