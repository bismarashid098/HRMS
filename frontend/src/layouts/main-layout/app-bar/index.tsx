import { Box, Button, Stack, paperClasses } from '@mui/material';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import { useBreakpoints } from 'providers/BreakpointsProvider';
import { useSettingsContext } from 'providers/SettingsProvider';
import IconifyIcon from 'components/base/IconifyIcon';
import Logo from 'components/common/Logo';
import AppbarActionItems from '../common/AppbarActionItems';
import SearchBox, { SearchBoxButton } from '../common/search-box/SearchBox';

const AppBar = () => {
  const {
    config: { drawerWidth },
    handleDrawerToggle,
  } = useSettingsContext();

  const { up } = useBreakpoints();
  const upSm = up('sm');
  const upMd = up('md');

  return (
    <MuiAppBar
      position="fixed"
      sx={{
        width: { md: `calc(100% - ${drawerWidth}px)` },
        ml: { md: `${drawerWidth}px` },
        background: 'rgba(8,13,28,0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 1px 0 rgba(255,255,255,0.04), 0 8px 32px rgba(0,0,0,0.35)',
        [`&.${paperClasses.root}`]: { outline: 'none' },

        /* action icon buttons */
        '& .MuiButton-softNeutral, & .MuiButton-textNeutral': {
          color: 'rgba(255,255,255,0.65)',
          bgcolor: 'transparent',
          '&:hover': {
            bgcolor: 'rgba(255,255,255,0.07)',
            color: 'rgba(255,255,255,0.92)',
          },
        },
      }}
    >
      <Toolbar variant="appbar" sx={{ px: { xs: 2.5, md: 4 }, gap: 1.5 }}>
        {/* Mobile — hamburger + logo */}
        <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1, mr: 1 }}>
          <Button
            color="neutral"
            variant="soft"
            shape="circle"
            aria-label="open drawer"
            onClick={handleDrawerToggle}
            sx={{
              bgcolor: 'rgba(255,255,255,0.06)',
              color: 'rgba(255,255,255,0.75)',
              border: '1px solid rgba(255,255,255,0.08)',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.1)',
                borderColor: 'rgba(255,255,255,0.14)',
              },
            }}
          >
            <IconifyIcon icon="material-symbols:menu-rounded" sx={{ fontSize: 20 }} />
          </Button>
          {upSm && <Logo showName />}
        </Box>

        {/* Search */}
        <Box sx={{ flex: 1 }}>
          {upMd ? (
            <SearchBox
              sx={{
                maxWidth: 360,
                '& .MuiOutlinedInput-root': {
                  height: 40,
                  borderRadius: '10px',
                  bgcolor: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.75)',
                  fontSize: 13.5,
                  '& fieldset': { border: 'none' },
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.08)',
                    borderColor: 'rgba(255,255,255,0.14)',
                  },
                  '&.Mui-focused': {
                    bgcolor: 'rgba(255,255,255,0.07)',
                    borderColor: 'rgba(59,130,246,0.5)',
                    boxShadow: '0 0 0 3px rgba(59,130,246,0.12)',
                  },
                  '& input::placeholder': { color: 'rgba(255,255,255,0.28)', opacity: 1 },
                  '& .MuiInputAdornment-root': { color: 'rgba(255,255,255,0.3)' },
                },
              }}
            />
          ) : (
            <SearchBoxButton />
          )}
        </Box>

        {/* Right — action items */}
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <AppbarActionItems />
        </Stack>
      </Toolbar>
    </MuiAppBar>
  );
};

export default AppBar;
