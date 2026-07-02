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

const ProfileMenu = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    handleClose();
    logout();
    navigate('/auth/login');
  };

  const menuButton = (
    <Button
      color="neutral"
      variant="text"
      shape="circle"
      onClick={handleClick}
      sx={{
        height: 44,
        width: 44,
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          bgcolor: 'primary.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          fontSize: 16,
        }}
      >
        {user?.name?.[0]?.toUpperCase() ?? 'U'}
      </Box>
    </Button>
  );

  return (
    <>
      {menuButton}
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        sx={{
          [`& .${paperClasses.root}`]: { minWidth: 280 },
          [`& .${listClasses.root}`]: { py: 0 },
        }}
      >
        <Stack sx={{ alignItems: 'center', gap: 2, px: 3, py: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: 20,
            }}
          >
            {user?.name?.[0]?.toUpperCase() ?? 'U'}
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
              {user?.name ?? 'User'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.email}
            </Typography>
            <Typography variant="caption" color="primary.main">
              {user?.role}
            </Typography>
          </Box>
        </Stack>
        <Divider />
        <Box sx={{ py: 1 }}>
          <ProfileMenuItem
            icon="material-symbols:person-outline-rounded"
            onClick={() => {
              handleClose();
              navigate('/profile');
            }}
          >
            My Profile
          </ProfileMenuItem>
        </Box>
        <Divider />
        <Box sx={{ py: 1 }}>
          <ProfileMenuItem icon="material-symbols:logout-rounded" onClick={handleLogout}>
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
    <MenuItem onClick={onClick} {...linkProps} sx={{ gap: 1, ...sx }}>
      <ListItemIcon
        sx={{
          [`&.${listItemIconClasses.root}`]: { minWidth: 'unset !important' },
        }}
      >
        <IconifyIcon icon={icon} sx={{ color: 'text.secondary' }} />
      </ListItemIcon>
      {children}
    </MenuItem>
  );
};

export default ProfileMenu;
