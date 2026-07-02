import Box from '@mui/material/Box';
import { Link } from '@mui/material';
import { rootPaths } from 'routes/paths';

interface LogoProps {
  showName?: boolean;
}

const Logo = ({ showName = true }: LogoProps) => {
  return (
    <Link href={rootPaths.root} underline="none" sx={{ display: 'inline-flex', alignItems: 'center' }}>
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#ffffff',
          borderRadius: '12px',
          px: showName ? 1.5 : 1,
          py: showName ? 0.75 : 0.75,
          boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
          transition: 'box-shadow 0.2s',
          '&:hover': { boxShadow: '0 4px 20px rgba(49,130,206,0.3)' },
        }}
      >
        <Box
          component="img"
          src="/hrms-logo.png"
          alt="WorkSphere HRMS"
          sx={{
            height: showName ? 54 : 42,
            width: 'auto',
            display: 'block',
            objectFit: 'contain',
          }}
        />
      </Box>
    </Link>
  );
};

export default Logo;
