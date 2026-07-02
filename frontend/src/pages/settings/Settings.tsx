import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  CircularProgress,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import api from 'api/axios';

const Settings = () => {
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api
      .get('/settings')
      .then((res) => setSettings(res.data.settings || res.data || {}))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/settings', settings);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      console.error(e);
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
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
        Settings
      </Typography>
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Settings saved successfully!
        </Alert>
      )}
      <Card>
        <CardContent>
          <Grid container spacing={2}>
            {Object.entries(settings)
              .filter(([k]) => !k.startsWith('_') && k !== '__v')
              .map(([key, val]) => (
                <Grid key={key} size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label={key.replace(/([A-Z])/g, ' $1').trim()}
                    value={String(val || '')}
                    onChange={(e) => setSettings((s: any) => ({ ...s, [key]: e.target.value }))}
                  />
                </Grid>
              ))}
            {Object.keys(settings).length === 0 && (
              <Grid size={12}>
                <Typography color="text.secondary">No settings configured yet.</Typography>
              </Grid>
            )}
          </Grid>
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="contained" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Settings;
