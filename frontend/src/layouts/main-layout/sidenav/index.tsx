import { Backdrop, useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import Drawer, { drawerClasses } from '@mui/material/Drawer';
import { useBreakpoints } from 'providers/BreakpointsProvider';
import { useSettingsContext } from 'providers/SettingsProvider';
import SidenavCollapse from './SidenavCollapse';
import SidenavDrawerContent from './SidenavDrawerContent';

const Sidenav = () => {
  const {
    config: { sidenavCollapsed, drawerWidth },
    toggleNavbarCollapse,
  } = useSettingsContext();
  const { currentBreakpoint } = useBreakpoints();
  const theme = useTheme();

  const paperSx = {
    overflow: 'visible',
    boxSizing: 'border-box',
    width: drawerWidth,
    border: 0,
    borderRight: '1px solid rgba(255,255,255,0.07)',
    background: 'rgba(8,13,28,0.88)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    transition: {
      xs: theme.transitions.create(['width'], {
        duration: theme.transitions.duration.standard,
      }),
      lg: 'none',
    },

    /* ── Nav items ── */
    '& .MuiListItemButton-root': {
      borderRadius: '10px',
      position: 'relative',
      transition: 'background .18s, color .18s',
      '& .MuiListItemIcon-root': {
        color: 'rgba(255,255,255,0.38)',
        transition: 'color .18s',
      },
      '& .MuiListItemText-primary': {
        color: 'rgba(255,255,255,0.52)',
        transition: 'color .18s',
      },
      '& .expand-icon': {
        color: 'rgba(255,255,255,0.28)',
      },
      '&:hover': {
        background: 'rgba(255,255,255,0.055)',
        '& .MuiListItemIcon-root': { color: 'rgba(255,255,255,0.75)' },
        '& .MuiListItemText-primary': { color: 'rgba(255,255,255,0.9)' },
        '& .expand-icon': { color: 'rgba(255,255,255,0.55)' },
      },

      /* active item */
      '&.Mui-selected': {
        background: 'rgba(59,130,246,0.11)',
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          width: '3px',
          height: '55%',
          borderRadius: '0 3px 3px 0',
          background: '#3B82F6',
        },
        '& .MuiListItemIcon-root': { color: '#60A5FA' },
        '& .MuiListItemText-primary': {
          color: '#93C5FD',
          fontWeight: 700,
        },
        '& .expand-icon': { color: '#60A5FA' },
        '&:hover': { background: 'rgba(59,130,246,0.17)' },
      },
    },

    /* dividers */
    '& .MuiDivider-root': { borderColor: 'rgba(255,255,255,0.07)' },

    /* mobile close button */
    '& .MuiIconButton-root': {
      color: 'rgba(255,255,255,0.45)',
      '&:hover': {
        background: 'rgba(255,255,255,0.07)',
        color: 'rgba(255,255,255,0.85)',
      },
    },
  };

  return (
    <Box
      component="nav"
      className="default-sidenav"
      sx={{
        width: { md: drawerWidth },
        flexShrink: { sm: 0 },
        transition: {
          xs: theme.transitions.create(['width'], {
            duration: theme.transitions.duration.standard,
          }),
          lg: 'none',
        },
        position: { md: 'absolute', lg: 'static' },
      }}
    >
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          [`& .${drawerClasses.paper}`]: paperSx,
        }}
        open
      >
        <SidenavDrawerContent />
        <SidenavCollapse />
      </Drawer>

      {currentBreakpoint === 'md' && (
        <Backdrop open={!sidenavCollapsed} sx={{ zIndex: 1199 }} onClick={toggleNavbarCollapse} />
      )}
    </Box>
  );
};

export default Sidenav;
