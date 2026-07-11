import { useRegisterSW } from 'virtual:pwa-register/react';
import { Box, Button, Slide, Paper, Typography } from '@mui/material';
import { Icon } from '@iconify/react';

const PWAUpdateAlert = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      // Poll for updates every 60 minutes
      r &&
        setInterval(
          () => {
            r.update();
          },
          60 * 60 * 1000,
        );
    },
  });

  return (
    <Slide direction="up" in={needRefresh} mountOnEnter unmountOnExit>
      <Paper
        elevation={8}
        sx={{
          position: 'fixed',
          bottom: { xs: 16, sm: 24 },
          left: { xs: 16, right: 'auto' },
          right: { xs: 16, sm: 24 },
          maxWidth: 360,
          zIndex: 2001,
          borderRadius: '16px',
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          border: '1px solid',
          borderColor: 'primary.light',
          background: 'linear-gradient(135deg, rgba(79,70,229,0.06) 0%, rgba(129,140,248,0.04) 100%)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #4F46E5 0%, #818CF8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon icon="material-symbols:system-update-rounded" color="#fff" width={22} />
        </Box>
        <Box flex={1}>
          <Typography variant="body2" fontWeight={700} fontSize="0.875rem">
            Update Available
          </Typography>
          <Typography variant="caption" color="text.secondary" fontSize="0.75rem">
            Naya version ready hai. Refresh karein.
          </Typography>
          <Box display="flex" gap={1} mt={0.75}>
            <Button
              size="small"
              variant="contained"
              onClick={() => updateServiceWorker(true)}
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                fontSize: '0.75rem',
                py: 0.4,
                background: 'linear-gradient(135deg, #4F46E5, #818CF8)',
              }}
            >
              Update
            </Button>
            <Button
              size="small"
              variant="text"
              onClick={() => setNeedRefresh(false)}
              sx={{ borderRadius: '8px', textTransform: 'none', fontSize: '0.75rem', py: 0.4 }}
            >
              Baad mein
            </Button>
          </Box>
        </Box>
      </Paper>
    </Slide>
  );
};

export default PWAUpdateAlert;
