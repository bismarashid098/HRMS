import { PropsWithChildren, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Box,
  Button,
  Divider,
  Link,
  ListItemIcon,
  MenuItem,
  MenuItemProps,
  Stack,
  SxProps,
  Typography,
  listClasses,
  listItemIconClasses,
  paperClasses,
} from '@mui/material';
import Menu from '@mui/material/Menu';
import { useAuth } from 'context/AuthContext';
import IconifyIcon from 'components/base/IconifyIcon';

interface ProfileMenuItemProps extends MenuItemProps {
  icon: string;
  href?: string;
  sx?: SxProps;
}

/* gradient per role */
const roleGradient = (role?: string) =>
  role === 'Admin'
    ? 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)'
    : 'linear-gradient(135deg, #10B981 0%, #0EA5E9 100%)';

const roleColor = (role?: string) => (role === 'Admin' ? '#818CF8' : '#34D399');

const Avatar = ({ name, role, size = 38 }: { name?: string; role?: string; size?: number }) => (
  <Box
    sx={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: roleGradient(role),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontWeight: 700,
      fontSize: size * 0.42,
      flexShrink: 0,
      boxShadow: `0 4px 14px ${role === 'Admin' ? 'rgba(99,102,241,.45)' : 'rgba(16,185,129,.45)'}`,
      letterSpacing: '-0.5px',
    }}
  >
    {name?.[0]?.toUpperCase() ?? 'U'}
  </Box>
);

const ProfileMenu = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);
  const handleClick = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    handleClose();
    logout();
    navigate('/auth/login');
  };

  return (
    <>
      {/* Trigger button */}
      <Button
        color="neutral"
        variant="text"
        shape="circle"
        onClick={handleClick}
        sx={{
          p: 0.5,
          border: open ? '2px solid rgba(99,102,241,0.5)' : '2px solid transparent',
          borderRadius: '50%',
          transition: 'border-color .2s',
          '&:hover': { bgcolor: 'transparent', borderColor: 'rgba(255,255,255,0.2)' },
        }}
      >
        <Avatar name={user?.name} role={user?.role} size={34} />
      </Button>

      {/* Dropdown */}
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{ paper: { elevation: 0 } }}
        sx={{
          mt: 1,
          [`& .${paperClasses.root}`]: {
            minWidth: 270,
            background: 'rgba(10,14,30,0.96)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: '16px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.06) inset',
            overflow: 'hidden',
          },
          [`& .${listClasses.root}`]: { py: 0 },
        }}
      >
        {/* User info header */}
        <Box
          sx={{
            px: 2.5,
            py: 2.5,
            background:
              'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(99,102,241,0.05) 100%)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.75}>
            <Avatar name={user?.name} role={user?.role} size={46} />
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: 14.5,
                  color: '#F1F5F9',
                  lineHeight: 1.3,
                  mb: 0.25,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {user?.name ?? 'User'}
              </Typography>
              <Typography
                sx={{
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.4)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {user?.email}
              </Typography>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  mt: 0.75,
                  px: 1.25,
                  py: 0.25,
                  borderRadius: '20px',
                  background: `${roleColor(user?.role)}18`,
                  border: `1px solid ${roleColor(user?.role)}35`,
                }}
              >
                <Typography
                  sx={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: roleColor(user?.role),
                    letterSpacing: '0.04em',
                  }}
                >
                  {user?.role}
                </Typography>
              </Box>
            </Box>
          </Stack>
        </Box>

        {/* Menu items */}
        <Box sx={{ py: 1 }}>
          <ProfileMenuItem
            icon="solar:user-bold-duotone"
            onClick={() => {
              handleClose();
              navigate('/profile');
            }}
          >
            My Profile
          </ProfileMenuItem>
        </Box>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.07)' }} />

        <Box sx={{ py: 1 }}>
          <ProfileMenuItem
            icon="solar:logout-bold-duotone"
            onClick={handleLogout}
            sx={{ color: '#F87171 !important', '& svg': { color: '#F87171 !important' } }}
          >
            Sign Out
          </ProfileMenuItem>
        </Box>
      </Menu>
    </>
  );
};

const ProfileMenuItem = ({
  icon,
  onClick,
  children,
  href,
  sx,
}: PropsWithChildren<ProfileMenuItemProps>) => {
  const linkProps = href ? { component: Link, href, underline: 'none' } : {};
  return (
    <MenuItem
      onClick={onClick}
      {...linkProps}
      sx={{
        gap: 1.5,
        py: 1.1,
        px: 2.5,
        color: 'rgba(255,255,255,0.72)',
        fontSize: 13.5,
        fontWeight: 500,
        transition: 'background .15s, color .15s',
        '&:hover': {
          bgcolor: 'rgba(255,255,255,0.06)',
          color: 'rgba(255,255,255,0.95)',
        },
        ...sx,
      }}
    >
      <ListItemIcon sx={{ [`&.${listItemIconClasses.root}`]: { minWidth: 'unset !important' } }}>
        <IconifyIcon icon={icon} sx={{ fontSize: 18, color: 'inherit' }} />
      </ListItemIcon>
      {children}
    </MenuItem>
  );
};

export default ProfileMenu;
