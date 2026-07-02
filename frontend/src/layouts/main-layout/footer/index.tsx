import { Divider, Stack, Typography } from '@mui/material';
import dayjs from 'dayjs';

const Footer = () => {
  return (
    <>
      <Divider />
      <Stack
        component="footer"
        direction={{ xs: 'column', sm: 'row' }}
        sx={[
          {
            columnGap: 2,
            rowGap: 0.5,
            bgcolor: 'background.default',
            justifyContent: { xs: 'center', sm: 'space-between' },
            alignItems: 'center',
            height: { xs: 72, sm: 56 },
            py: 1,
            px: { xs: 3, md: 5 },
            textAlign: { xs: 'center', sm: 'left' },
          },
        ]}
      >
        <Typography
          variant="caption"
          component="p"
          sx={{ fontWeight: 'light', color: 'text.secondary' }}
        >
          {dayjs().year()} © WorkSphere HRMS. All rights reserved.
        </Typography>

        <Typography
          variant="caption"
          component="p"
          sx={{ fontWeight: 'light', color: 'text.secondary' }}
        >
          v{import.meta.env.VITE_APP_VERSION}
        </Typography>
      </Stack>
    </>
  );
};

export default Footer;
