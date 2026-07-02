import { ReactElement } from 'react';
import { Stack, SxProps } from '@mui/material';
import NotificationMenu from './NotificationMenu';
import ProfileMenu from './ProfileMenu';
import ThemeToggler from './ThemeToggler';

interface AppbarActionItemsProps {
  sx?: SxProps;
  searchComponent?: ReactElement;
}

const AppbarActionItems = ({ sx, searchComponent }: AppbarActionItemsProps) => {
  return (
    <Stack
      className="action-items"
      spacing={1}
      sx={{
        alignItems: 'center',
        ml: 'auto',
        ...sx,
      }}
    >
      {searchComponent}
      <ThemeToggler />
      <NotificationMenu />
      <ProfileMenu />
    </Stack>
  );
};

export default AppbarActionItems;
