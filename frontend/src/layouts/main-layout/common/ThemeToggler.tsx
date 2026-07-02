import { Button, useColorScheme } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';

const ThemeToggler = () => {
  const { mode, setMode } = useColorScheme();

  const toggleMode = () => {
    setMode(mode === 'dark' ? 'light' : 'dark');
  };

  return (
    <Button color="neutral" variant="soft" shape="circle" onClick={toggleMode} title={mode === 'dark' ? 'Switch to Light' : 'Switch to Dark'}>
      <IconifyIcon
        icon={mode === 'dark' ? 'material-symbols:light-mode-outline-rounded' : 'material-symbols:dark-mode-outline-rounded'}
        sx={{ fontSize: 22 }}
      />
    </Button>
  );
};

export default ThemeToggler;
