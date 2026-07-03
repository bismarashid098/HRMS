import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  MenuItem,
  TextField,
  Typography,
  CircularProgress,
  Stack,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { Icon } from '@iconify/react';
import api from 'api/axios';

interface SettingsState {
  company: { name: string; address: string; email: string; phone: string };
  attendance: {
    workingHours: { start: string; end: string };
    lateAfterMinutes: number;
    halfDayAfterMinutes: number;
  };
  payroll: { taxPercentage: number; overtimeRatePerHour: number; monthlyOffDays: number };
  currency: { code: string; symbol: string };
  advances: { limitType: string; limitValue: number };
}

const defaultSettings: SettingsState = {
  company: { name: '', address: '', email: '', phone: '' },
  attendance: {
    workingHours: { start: '09:00', end: '18:00' },
    lateAfterMinutes: 15,
    halfDayAfterMinutes: 240,
  },
  payroll: { taxPercentage: 5, overtimeRatePerHour: 0, monthlyOffDays: 3 },
  currency: { code: 'PKR', symbol: '₨' },
  advances: { limitType: 'PERCENTAGE', limitValue: 30 },
};

const SectionHeader = ({ icon, title }: { icon: string; title: string }) => (
  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
    <Box
      sx={{
        width: 34,
        height: 34,
        borderRadius: 1.5,
        bgcolor: 'primary.main',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        opacity: 0.85,
      }}
    >
      <Icon icon={icon} width={18} color="#fff" />
    </Box>
    <Typography variant="subtitle1" fontWeight={700}>
      {title}
    </Typography>
  </Stack>
);

const Settings = () => {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/settings')
      .then((res) => {
        const d = res.data;
        setSettings({
          company: {
            name: d.company?.name || '',
            address: d.company?.address || '',
            email: d.company?.email || '',
            phone: d.company?.phone || '',
          },
          attendance: {
            workingHours: {
              start: d.attendance?.workingHours?.start || '09:00',
              end: d.attendance?.workingHours?.end || '18:00',
            },
            lateAfterMinutes: d.attendance?.lateAfterMinutes ?? 15,
            halfDayAfterMinutes: d.attendance?.halfDayAfterMinutes ?? 240,
          },
          payroll: {
            taxPercentage: d.payroll?.taxPercentage ?? 5,
            overtimeRatePerHour: d.payroll?.overtimeRatePerHour ?? 0,
            monthlyOffDays: d.payroll?.monthlyOffDays ?? 3,
          },
          currency: {
            code: d.currency?.code || 'PKR',
            symbol: d.currency?.symbol || '₨',
          },
          advances: {
            limitType: d.advances?.limitType || 'PERCENTAGE',
            limitValue: d.advances?.limitValue ?? 30,
          },
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const set =
    <S extends keyof SettingsState>(section: S) =>
    (field: keyof SettingsState[S]) =>
    (e: React.ChangeEvent<HTMLInputElement | { value: unknown }>) => {
      setSettings((prev) => ({
        ...prev,
        [section]: { ...prev[section], [field]: (e.target as HTMLInputElement).value },
      }));
    };

  const setNested = (path: string[], value: string) => {
    setSettings((prev) => {
      const next = { ...prev } as any;
      let cur = next;
      for (let i = 0; i < path.length - 1; i++) {
        cur[path[i]] = { ...cur[path[i]] };
        cur = cur[path[i]];
      }
      cur[path[path.length - 1]] = value;
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await api.put('/settings', settings);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box sx={{ p: 3, maxWidth: 860, mx: 'auto' }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
        Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Configure company info, attendance rules, payroll, and advance limits
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Settings saved successfully!
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Company Info */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <SectionHeader
            icon="material-symbols:business-outline-rounded"
            title="Company Information"
          />
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Company Name"
                value={settings.company.name}
                onChange={set('company')('name')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={settings.company.email}
                onChange={set('company')('email')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Phone"
                value={settings.company.phone}
                onChange={set('company')('phone')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Address"
                value={settings.company.address}
                onChange={set('company')('address')}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Attendance Settings */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <SectionHeader icon="material-symbols:fingerprint-rounded" title="Attendance Rules" />
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Work Start Time"
                type="time"
                value={settings.attendance.workingHours.start}
                onChange={(e) => setNested(['attendance', 'workingHours', 'start'], e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Work End Time"
                type="time"
                value={settings.attendance.workingHours.end}
                onChange={(e) => setNested(['attendance', 'workingHours', 'end'], e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Late After (minutes)"
                type="number"
                value={settings.attendance.lateAfterMinutes}
                onChange={(e) =>
                  setSettings((p) => ({
                    ...p,
                    attendance: { ...p.attendance, lateAfterMinutes: Number(e.target.value) },
                  }))
                }
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Half Day After (minutes)"
                type="number"
                value={settings.attendance.halfDayAfterMinutes}
                onChange={(e) =>
                  setSettings((p) => ({
                    ...p,
                    attendance: { ...p.attendance, halfDayAfterMinutes: Number(e.target.value) },
                  }))
                }
                inputProps={{ min: 0 }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Payroll Settings */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <SectionHeader
            icon="material-symbols:payments-outline-rounded"
            title="Payroll Settings"
          />
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Tax Percentage (%)"
                type="number"
                value={settings.payroll.taxPercentage}
                onChange={(e) =>
                  setSettings((p) => ({
                    ...p,
                    payroll: { ...p.payroll, taxPercentage: Number(e.target.value) },
                  }))
                }
                inputProps={{ min: 0, max: 100, step: 0.5 }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Monthly Off Days"
                type="number"
                value={settings.payroll.monthlyOffDays}
                onChange={(e) =>
                  setSettings((p) => ({
                    ...p,
                    payroll: { ...p.payroll, monthlyOffDays: Number(e.target.value) },
                  }))
                }
                inputProps={{ min: 0 }}
                helperText="Company holidays per month"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Overtime Rate (PKR/hr)"
                type="number"
                value={settings.payroll.overtimeRatePerHour}
                onChange={(e) =>
                  setSettings((p) => ({
                    ...p,
                    payroll: { ...p.payroll, overtimeRatePerHour: Number(e.target.value) },
                  }))
                }
                inputProps={{ min: 0 }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Advance Settings */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <SectionHeader
            icon="material-symbols:account-balance-wallet-outline-rounded"
            title="Advance Salary Limits"
          />
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                select
                label="Limit Type"
                value={settings.advances.limitType}
                onChange={(e) =>
                  setSettings((p) => ({
                    ...p,
                    advances: { ...p.advances, limitType: e.target.value },
                  }))
                }
              >
                <MenuItem value="PERCENTAGE">Percentage of Salary</MenuItem>
                <MenuItem value="FIXED">Fixed Amount</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label={
                  settings.advances.limitType === 'PERCENTAGE'
                    ? 'Limit Percentage (%)'
                    : 'Limit Amount (PKR)'
                }
                type="number"
                value={settings.advances.limitValue}
                onChange={(e) =>
                  setSettings((p) => ({
                    ...p,
                    advances: { ...p.advances, limitValue: Number(e.target.value) },
                  }))
                }
                inputProps={{ min: 0 }}
                helperText={
                  settings.advances.limitType === 'PERCENTAGE'
                    ? 'Max advance as % of basic salary per month'
                    : 'Max fixed advance amount per month'
                }
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Currency */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <SectionHeader icon="material-symbols:currency-exchange-rounded" title="Currency" />
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Currency Code"
                value={settings.currency.code}
                onChange={set('currency')('code')}
                helperText="e.g. PKR, USD, EUR"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Currency Symbol"
                value={settings.currency.symbol}
                onChange={set('currency')('symbol')}
                helperText="e.g. ₨, $, €"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Divider sx={{ mb: 3 }} />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleSave}
          disabled={saving}
          startIcon={<Icon icon="material-symbols:save-outline-rounded" />}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </Box>
    </Box>
  );
};

export default Settings;
