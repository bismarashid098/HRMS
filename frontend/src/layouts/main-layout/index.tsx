import { useState, useCallback, Suspense, useEffect } from 'react';
import { Outlet, useLocation, useNavigate, Link } from 'react-router';
import PageLoader from 'components/loading/PageLoader';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Collapse,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Badge,
  Stack,
  Paper,
  BottomNavigation,
  BottomNavigationAction,
  useMediaQuery,
  useTheme,
  alpha,
} from '@mui/material';
import { Icon } from '@iconify/react';
import { useAuth } from 'context/AuthContext';
import { getSitemap, SubMenuItem } from 'routes/sitemap';

const SIDEBAR_W = 258;
const SIDEBAR_COLLAPSED_W = 66;

const NavItem = ({
  item,
  collapsed,
  depth = 0,
  onNavigate,
}: {
  item: SubMenuItem;
  collapsed: boolean;
  depth?: number;
  onNavigate?: () => void;
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(() => {
    if (!item.items) return false;
    return item.items.some(
      (i) =>
        i.path === location.pathname ||
        location.pathname.startsWith(i.selectionPrefix || i.path || '____'),
    );
  });

  const isActive =
    item.path === location.pathname ||
    !!(item.selectionPrefix && location.pathname.startsWith(item.selectionPrefix));

  const hasChildren = !!item.items?.length;

  const handleClick = () => {
    if (hasChildren) {
      setOpen((p) => !p);
    } else if (item.path) {
      navigate(item.path);
      onNavigate?.();
    }
  };

  if (hasChildren) {
    return (
      <Box>
        <Tooltip title={collapsed ? item.name : ''} placement="right" arrow>
          <ListItemButton
            onClick={handleClick}
            sx={{
              pl: collapsed ? 1.5 : depth === 0 ? 1.5 : 3,
              pr: 1.5,
              py: 0.7,
              mx: 1,
              borderRadius: '8px',
              color: '#94A3B8',
              minHeight: 40,
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.06)', color: '#E2E8F0' },
            }}
          >
            {item.icon && (
              <ListItemIcon sx={{ minWidth: collapsed ? 'auto' : 34, color: 'inherit' }}>
                <Icon icon={item.icon} width={19} />
              </ListItemIcon>
            )}
            {!collapsed && (
              <>
                <ListItemText
                  primary={item.name}
                  primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}
                />
                <Icon
                  icon={
                    open
                      ? 'material-symbols:keyboard-arrow-up'
                      : 'material-symbols:keyboard-arrow-down'
                  }
                  width={17}
                />
              </>
            )}
          </ListItemButton>
        </Tooltip>
        {!collapsed && (
          <Collapse in={open} timeout="auto">
            <List disablePadding>
              {item.items!.map((sub) => (
                <NavItem
                  key={sub.pathName}
                  item={sub}
                  collapsed={collapsed}
                  depth={depth + 1}
                  onNavigate={onNavigate}
                />
              ))}
            </List>
          </Collapse>
        )}
      </Box>
    );
  }

  return (
    <Tooltip title={collapsed ? item.name : ''} placement="right" arrow>
      <ListItemButton
        component={Link}
        to={item.path || '#'}
        onClick={onNavigate}
        sx={{
          pl: collapsed ? 1.75 : depth === 0 ? 1.5 : 3.5,
          pr: 1.5,
          py: 0.7,
          mx: 1,
          borderRadius: '8px',
          minHeight: 40,
          color: isActive ? '#C7D2FE' : '#94A3B8',
          backgroundColor: isActive ? 'rgba(99,102,241,0.18)' : 'transparent',
          borderLeft: isActive ? '2px solid #6366F1' : '2px solid transparent',
          transition: 'all 0.15s ease',
          '&:hover': {
            backgroundColor: isActive ? 'rgba(99,102,241,0.22)' : 'rgba(255,255,255,0.05)',
            color: '#E2E8F0',
          },
        }}
      >
        {item.icon && (
          <ListItemIcon
            sx={{
              minWidth: collapsed ? 'auto' : 34,
              color: isActive ? '#818CF8' : 'inherit',
            }}
          >
            <Icon icon={item.icon} width={19} />
          </ListItemIcon>
        )}
        {!collapsed && (
          <ListItemText
            primary={item.name}
            primaryTypographyProps={{
              fontSize: '0.875rem',
              fontWeight: isActive ? 600 : 500,
            }}
          />
        )}
      </ListItemButton>
    </Tooltip>
  );
};

interface SidebarProps {
  collapsed: boolean;
  user: { name: string; role: string } | null;
  onNavigate?: () => void;
}

const SidebarContent = ({ collapsed, user, onNavigate }: SidebarProps) => {
  const sitemap = getSitemap(user?.role);

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#0B1120',
        overflow: 'hidden',
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          px: 2,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          minHeight: 64,
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #4F46E5 0%, #818CF8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(79,70,229,0.4)',
          }}
        >
          <Icon icon="material-symbols:people-rounded" color="#fff" width={20} />
        </Box>
        {!collapsed && (
          <Box>
            <Typography
              variant="subtitle1"
              fontWeight={700}
              color="#F1F5F9"
              lineHeight={1.2}
              fontSize="0.95rem"
            >
              WorkSphere
            </Typography>
            <Typography variant="caption" color="#475569" fontSize="0.68rem" letterSpacing="0.05em">
              HRMS PLATFORM
            </Typography>
          </Box>
        )}
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', py: 1 }}>
        {sitemap.map((section, idx) => (
          <Box key={section.id} mb={0.5}>
            {!collapsed && section.subheader && (
              <Typography
                variant="caption"
                sx={{
                  px: 2.5,
                  pt: idx === 0 ? 0.5 : 1.5,
                  pb: 0.25,
                  display: 'block',
                  color: '#374151',
                  fontWeight: 700,
                  fontSize: '0.67rem',
                  letterSpacing: '0.09em',
                  textTransform: 'uppercase',
                }}
              >
                {section.subheader}
              </Typography>
            )}
            {collapsed && idx > 0 && (
              <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)', mx: 1.5, my: 0.5 }} />
            )}
            <List disablePadding>
              {section.items.map((item) => (
                <NavItem
                  key={item.pathName}
                  item={item}
                  collapsed={collapsed}
                  onNavigate={onNavigate}
                />
              ))}
            </List>
          </Box>
        ))}
      </Box>

      {/* User strip */}
      <Box
        sx={{
          px: collapsed ? 1 : 2,
          py: 1.5,
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          flexShrink: 0,
        }}
      >
        <Avatar
          sx={{
            width: 32,
            height: 32,
            background: 'linear-gradient(135deg, #4F46E5 0%, #818CF8 100%)',
            fontSize: '0.8rem',
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </Avatar>
        {!collapsed && (
          <Box overflow="hidden">
            <Typography variant="body2" fontWeight={600} color="#E2E8F0" noWrap fontSize="0.8rem">
              {user?.name}
            </Typography>
            <Typography variant="caption" color="#64748B" fontSize="0.68rem">
              {user?.role}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/employees': 'Employees',
  '/attendance': 'Daily Attendance',
  '/attendance/monthly': 'Monthly Ledger',
  '/leaves': 'Leave Management',
  '/payroll': 'Payroll',
  '/payroll/advance': 'Advance Salary',
  '/payroll/salary-slip': 'Salary Slip',
  '/org/departments': 'Departments',
  '/org/designations': 'Designations',
  '/org/branches': 'Branches',
  '/org/shifts': 'Shifts',
  '/org/holidays': 'Holidays',
  '/recruitment/jobs': 'Job Postings',
  '/recruitment/candidates': 'Candidates',
  '/performance': 'Performance Reviews',
  '/training': 'Training',
  '/assets': 'Asset Management',
  '/expenses': 'Expense Claims',
  '/documents': 'Documents',
  '/notifications': 'Notifications',
  '/users': 'User Management',
  '/settings': 'Settings',
  '/audit': 'Audit Logs',
  '/biometric': 'Biometric Import',
  '/profile': 'My Profile',
};

const getPageTitle = (pathname: string) => {
  for (const [prefix, title] of Object.entries(PAGE_TITLES)) {
    if (pathname === prefix || (prefix !== '/' && pathname.startsWith(prefix))) return title;
  }
  return 'WorkSphere HRMS';
};

// Bottom nav items for mobile (most used)
const BOTTOM_NAV = [
  { label: 'Dashboard', icon: 'material-symbols:dashboard-outline-rounded', path: '/' },
  {
    label: 'Attendance',
    icon: 'material-symbols:fingerprint-rounded',
    path: '/attendance',
  },
  {
    label: 'Leaves',
    icon: 'material-symbols:event-available-outline-rounded',
    path: '/leaves',
  },
  {
    label: 'Profile',
    icon: 'material-symbols:person-outline-rounded',
    path: '/profile',
  },
  { label: 'More', icon: 'material-symbols:menu-rounded', path: '__menu__' },
];

const MainLayout = () => {
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED_W : SIDEBAR_W;

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/auth/login');
    setAnchorEl(null);
  }, [logout, navigate]);

  // Bottom nav active value
  const bottomNavValue = BOTTOM_NAV.findIndex(
    (n) =>
      n.path !== '__menu__' &&
      (pathname === n.path || (n.path !== '/' && pathname.startsWith(n.path))),
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Box
          sx={{
            width: sidebarWidth,
            flexShrink: 0,
            transition: 'width 0.22s ease',
            position: 'fixed',
            top: 0,
            left: 0,
            height: '100vh',
            zIndex: 1100,
          }}
        >
          <SidebarContent collapsed={collapsed} user={user} />
        </Box>
      )}

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        PaperProps={{
          sx: {
            width: SIDEBAR_W,
            border: 'none',
            boxShadow: '8px 0 32px rgba(15,23,42,0.25)',
          },
        }}
      >
        <SidebarContent
          collapsed={false}
          user={user}
          onNavigate={() => setMobileOpen(false)}
        />
      </Drawer>

      {/* Main area */}
      <Box
        sx={{
          flex: 1,
          ml: isMobile ? 0 : `${sidebarWidth}px`,
          transition: 'margin-left 0.22s ease',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          backgroundColor: '#F1F5F9',
          // iOS safe area
          paddingBottom: isMobile
            ? 'calc(56px + env(safe-area-inset-bottom))'
            : 0,
        }}
      >
        {/* Topbar */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            backgroundColor: '#fff',
            borderBottom: '1px solid #E2E8F0',
            color: '#0F172A',
            zIndex: 1050,
          }}
        >
          <Toolbar sx={{ px: { xs: 2, sm: 3 }, minHeight: '64px !important' }}>
            <IconButton
              size="small"
              onClick={() => (isMobile ? setMobileOpen(true) : setCollapsed((p) => !p))}
              sx={{ color: '#64748B', mr: 1.5, '&:hover': { backgroundColor: '#F1F5F9' } }}
            >
              <Icon icon="material-symbols:menu-rounded" width={22} />
            </IconButton>

            <Typography variant="h6" fontWeight={700} fontSize="1rem" sx={{ flex: 1 }} noWrap>
              {getPageTitle(pathname)}
            </Typography>

            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Tooltip title="Notifications" arrow>
                <IconButton
                  size="small"
                  component={Link}
                  to="/notifications"
                  sx={{ color: '#64748B', '&:hover': { backgroundColor: '#F1F5F9' } }}
                >
                  <Badge color="error" variant="dot">
                    <Icon icon="material-symbols:notifications-outline-rounded" width={22} />
                  </Badge>
                </IconButton>
              </Tooltip>

              <Box
                onClick={(e) => setAnchorEl(e.currentTarget)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  ml: 1,
                  pl: 1.5,
                  pr: 1,
                  py: 0.6,
                  borderRadius: '10px',
                  cursor: 'pointer',
                  border: '1px solid #E2E8F0',
                  transition: 'all 0.15s',
                  '&:hover': { backgroundColor: '#F8FAFC', borderColor: '#CBD5E1' },
                }}
              >
                <Avatar
                  sx={{
                    width: 30,
                    height: 30,
                    background: 'linear-gradient(135deg, #4F46E5 0%, #818CF8 100%)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                  }}
                >
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </Avatar>
                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                  <Typography variant="body2" fontWeight={600} lineHeight={1.2} fontSize="0.8rem">
                    {user?.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontSize="0.68rem">
                    {user?.role}
                  </Typography>
                </Box>
                <Icon icon="material-symbols:keyboard-arrow-down" width={15} color="#94A3B8" />
              </Box>
            </Stack>
          </Toolbar>
        </AppBar>

        {/* User dropdown */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          PaperProps={{
            sx: {
              mt: 1,
              minWidth: 210,
              borderRadius: '12px',
              boxShadow: '0 10px 40px rgba(15,23,42,0.12)',
              border: '1px solid #F1F5F9',
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="body2" fontWeight={700} fontSize="0.875rem">
              {user?.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.role}
            </Typography>
          </Box>
          <Divider />
          <MenuItem
            onClick={() => {
              navigate('/profile');
              setAnchorEl(null);
            }}
            sx={{ gap: 1.5, py: 1, fontSize: '0.875rem' }}
          >
            <Icon icon="material-symbols:person-outline-rounded" width={18} color="#64748B" />
            My Profile
          </MenuItem>
          <MenuItem
            onClick={() => {
              navigate('/notifications');
              setAnchorEl(null);
            }}
            sx={{ gap: 1.5, py: 1, fontSize: '0.875rem' }}
          >
            <Icon
              icon="material-symbols:notifications-outline-rounded"
              width={18}
              color="#64748B"
            />
            Notifications
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={handleLogout}
            sx={{
              gap: 1.5,
              py: 1,
              fontSize: '0.875rem',
              color: '#EF4444',
              '&:hover': { backgroundColor: alpha('#EF4444', 0.06) },
            }}
          >
            <Icon icon="material-symbols:logout-rounded" width={18} />
            Sign Out
          </MenuItem>
        </Menu>

        {/* Page content */}
        <Box sx={{ flex: 1, p: { xs: 2, sm: 2.5, md: 3 } }}>
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </Box>

        {/* Footer — hide on mobile (bottom nav replaces it) */}
        <Box
          sx={{
            px: 3,
            py: 1.25,
            borderTop: '1px solid #E2E8F0',
            backgroundColor: '#fff',
            textAlign: 'center',
            display: { xs: 'none', md: 'block' },
          }}
        >
          <Typography variant="caption" color="text.secondary" fontSize="0.72rem">
            © {new Date().getFullYear()} WorkSphere HRMS — All rights reserved
          </Typography>
        </Box>
      </Box>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <Paper
          elevation={8}
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1200,
            borderTop: '1px solid #E2E8F0',
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}
        >
          <BottomNavigation
            value={bottomNavValue === -1 ? false : bottomNavValue}
            sx={{ height: 56, backgroundColor: '#fff' }}
          >
            {BOTTOM_NAV.map((item, idx) => (
              <BottomNavigationAction
                key={item.label}
                label={item.label}
                icon={<Icon icon={item.icon} width={22} />}
                onClick={() => {
                  if (item.path === '__menu__') {
                    setMobileOpen(true);
                  } else {
                    navigate(item.path);
                  }
                }}
                sx={{
                  minWidth: 0,
                  fontSize: '0.65rem',
                  '&.Mui-selected': { color: '#4F46E5' },
                  color: bottomNavValue === idx ? '#4F46E5' : '#94A3B8',
                }}
              />
            ))}
          </BottomNavigation>
        </Paper>
      )}
    </Box>
  );
};

export default MainLayout;
