import { useState, useEffect } from 'react';
import { Box, Button, IconButton, Paper, Slide, Typography } from '@mui/material';
import { Icon } from '@iconify/react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show after 3 seconds so it doesn't interrupt initial load
      setTimeout(() => setShow(true), 3000);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
    setShow(false);
  };

  const handleDismiss = () => {
    setShow(false);
    // Don't show again for 7 days
    localStorage.setItem('pwa-dismissed', String(Date.now() + 7 * 86400000));
  };

  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-dismissed');
    if (dismissed && Date.now() < Number(dismissed)) setShow(false);
  }, []);

  return (
    <Slide direction="up" in={show} mountOnEnter unmountOnExit>
      <Paper
        elevation={8}
        sx={{
          position: 'fixed',
          bottom: { xs: 16, sm: 24 },
          left: { xs: 16, sm: 'auto' },
          right: { xs: 16, sm: 24 },
          maxWidth: 380,
          zIndex: 2000,
          borderRadius: '16px',
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          border: '1px solid',
          borderColor: 'divider',
          background: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #4F46E5 0%, #818CF8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon icon="material-symbols:install-mobile-rounded" color="#fff" width={24} />
        </Box>
        <Box flex={1} minWidth={0}>
          <Typography variant="body2" fontWeight={700} fontSize="0.875rem">
            Install WorkSphere
          </Typography>
          <Typography variant="caption" color="text.secondary" fontSize="0.75rem">
            App install karein — offline bhi kaam kare
          </Typography>
          <Box display="flex" gap={1} mt={0.75}>
            <Button
              size="small"
              variant="contained"
              onClick={handleInstall}
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                fontSize: '0.75rem',
                py: 0.4,
                background: 'linear-gradient(135deg, #4F46E5, #818CF8)',
              }}
            >
              Install
            </Button>
            <Button
              size="small"
              variant="text"
              onClick={handleDismiss}
              sx={{ borderRadius: '8px', textTransform: 'none', fontSize: '0.75rem', py: 0.4 }}
            >
              Bad mein
            </Button>
          </Box>
        </Box>
        <IconButton size="small" onClick={handleDismiss} sx={{ alignSelf: 'flex-start', mt: -0.5 }}>
          <Icon icon="material-symbols:close-rounded" width={18} />
        </IconButton>
      </Paper>
    </Slide>
  );
};

export default PWAInstallPrompt;
