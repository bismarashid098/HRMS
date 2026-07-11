import { useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { alpha, useTheme } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import api from 'api/axios';

interface ImportResult {
  total: number;
  inserted: number;
  updated: number;
  skipped: number;
  errorCount: number;
  errors: { row: number; code?: string; reason: string }[];
}

const StatBox = ({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: number;
  color: string;
}) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        textAlign: 'center',
        py: 2,
        px: 1.5,
        borderRadius: 2,
        bgcolor: alpha(color, theme.palette.mode === 'dark' ? 0.12 : 0.07),
        border: `1px solid ${alpha(color, 0.25)}`,
        flex: 1,
      }}
    >
      <Icon icon={icon} width={24} color={color} />
      <Typography variant="h5" fontWeight={800} color={color} sx={{ lineHeight: 1.2, mt: 0.5 }}>
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Box>
  );
};

const ImportTab = () => {
  const theme = useTheme();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState('');

  const handleFile = (f: File) => {
    const ext = f.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(ext || '')) {
      setError('Only CSV, XLS, or XLSX files are accepted.');
      return;
    }
    setFile(f);
    setResult(null);
    setError('');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    setResult(null);
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await api.post('/biometric/import', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(res.data);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Import failed. Please check the file format.');
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    api
      .get('/biometric/template', { responseType: 'blob' })
      .then((res) => {
        const url = URL.createObjectURL(res.data);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'biometric_attendance_template.xlsx';
        a.click();
        URL.revokeObjectURL(url);
      })
      .catch(() => setError('Failed to download template.'));
  };

  return (
    <Stack spacing={3}>
      {/* Instructions banner */}
      <Box
        sx={{
          p: 2.5,
          borderRadius: 2,
          bgcolor: alpha(theme.palette.info.main, theme.palette.mode === 'dark' ? 0.1 : 0.06),
          border: `1px solid ${alpha(theme.palette.info.main, 0.25)}`,
          display: 'flex',
          gap: 2,
          alignItems: 'flex-start',
        }}
      >
        <Icon
          icon="material-symbols:info-outline-rounded"
          width={22}
          color={theme.palette.info.main}
          style={{ marginTop: 2, flexShrink: 0 }}
        />
        <Box>
          <Typography variant="subtitle2" fontWeight={700} color="info.main" gutterBottom>
            Biometric Machine Export Format
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Export attendance logs from your biometric device (ZKTeco, Suprema, Hikvision, etc.) as{' '}
            <strong>CSV or Excel</strong>. The file must contain columns:{' '}
            <strong>Employee Code</strong>, <strong>Date</strong>, <strong>Punch In</strong>{' '}
            (optional), <strong>Punch Out</strong> (optional), <strong>Status</strong> (optional).
            Status is auto-calculated from Punch In time if omitted. Download the template below for
            the exact format.
          </Typography>
        </Box>
      </Box>

      {/* Template download */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<Icon icon="material-symbols:download-rounded" />}
          onClick={downloadTemplate}
        >
          Download Template (XLSX)
        </Button>
      </Box>

      {/* Drop zone */}
      <Box
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        sx={{
          border: `2px dashed ${dragging ? theme.palette.primary.main : theme.palette.divider}`,
          borderRadius: 3,
          p: 5,
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'border-color 0.2s, background 0.2s',
          bgcolor: dragging
            ? alpha(theme.palette.primary.main, 0.06)
            : alpha(theme.palette.action.hover, 0.3),
          '&:hover': {
            borderColor: theme.palette.primary.main,
            bgcolor: alpha(theme.palette.primary.main, 0.04),
          },
        }}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          style={{ display: 'none' }}
          onChange={(e) => {
            if (e.target.files?.[0]) handleFile(e.target.files[0]);
          }}
        />
        <Icon
          icon={
            file
              ? 'material-symbols:file-present-outline-rounded'
              : 'material-symbols:upload-file-outline-rounded'
          }
          width={48}
          color={file ? theme.palette.success.main : theme.palette.text.secondary}
        />
        {file ? (
          <>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mt: 1 }}>
              {file.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {(file.size / 1024).toFixed(1)} KB — click or drop to replace
            </Typography>
          </>
        ) : (
          <>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 1 }}>
              Drag & drop your attendance file here
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Supports .csv, .xlsx, .xls — max 10 MB
            </Typography>
          </>
        )}
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Import button */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          size="large"
          disabled={!file || loading}
          onClick={handleImport}
          startIcon={
            loading ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <Icon icon="material-symbols:upload-rounded" />
            )
          }
          sx={{ minWidth: 160 }}
        >
          {loading ? 'Importing…' : 'Import Attendance'}
        </Button>
        {file && (
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => {
              setFile(null);
              setResult(null);
              setError('');
            }}
          >
            Clear
          </Button>
        )}
      </Box>

      {/* Result summary */}
      {result && (
        <Box>
          <Alert
            severity={
              result.errorCount > 0 && result.inserted + result.updated === 0
                ? 'error'
                : result.errorCount > 0
                  ? 'warning'
                  : 'success'
            }
            sx={{ mb: 2 }}
          >
            Import complete — {result.total} row{result.total !== 1 ? 's' : ''} processed.
          </Alert>

          <Stack direction="row" spacing={1.5} flexWrap="wrap" sx={{ mb: 3 }}>
            <StatBox
              icon="material-symbols:add-circle-outline-rounded"
              label="Inserted"
              value={result.inserted}
              color={theme.palette.success.main}
            />
            <StatBox
              icon="material-symbols:edit-outline-rounded"
              label="Updated"
              value={result.updated}
              color={theme.palette.info.main}
            />
            <StatBox
              icon="material-symbols:lock-outline-rounded"
              label="Skipped"
              value={result.skipped}
              color={theme.palette.warning.main}
            />
            <StatBox
              icon="material-symbols:error-outline-rounded"
              label="Errors"
              value={result.errorCount}
              color={theme.palette.error.main}
            />
          </Stack>

          {result.errors.length > 0 && (
            <Box>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                Row Errors {result.errorCount > 50 && `(showing first 50 of ${result.errorCount})`}
              </Typography>
              <Paper variant="outlined" sx={{ overflow: 'hidden', borderRadius: 2 }}>
                <Box sx={{ overflowX: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: alpha(theme.palette.error.main, 0.07) }}>
                      <TableCell sx={{ fontWeight: 700, width: 80 }}>Row #</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: 130 }}>Employee Code</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Reason</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {result.errors.map((e, idx) => (
                      <TableRow key={idx} sx={{ '&:last-child td': { border: 0 } }}>
                        <TableCell>{e.row}</TableCell>
                        <TableCell>{e.code || '—'}</TableCell>
                        <TableCell sx={{ color: 'error.main' }}>{e.reason}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </Box>
              </Paper>
            </Box>
          )}
        </Box>
      )}
    </Stack>
  );
};

const ExportTab = () => {
  const theme = useTheme();
  const today = new Date().toISOString().slice(0, 10);
  const firstOfMonth = today.slice(0, 8) + '01';
  const [from, setFrom] = useState(firstOfMonth);
  const [to, setTo] = useState(today);
  const [format, setFormat] = useState<'xlsx' | 'csv'>('xlsx');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleExport = async () => {
    if (!from || !to) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/biometric/export?from=${from}&to=${to}&format=${format}`, {
        responseType: 'blob',
      });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance_${from}_to_${to}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError('Export failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Box
        sx={{
          p: 2.5,
          borderRadius: 2,
          bgcolor: alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.09 : 0.05),
          border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
          display: 'flex',
          gap: 2,
          alignItems: 'flex-start',
        }}
      >
        <Icon
          icon="material-symbols:info-outline-rounded"
          width={22}
          color={theme.palette.success.main}
          style={{ marginTop: 2, flexShrink: 0 }}
        />
        <Typography variant="body2" color="text.secondary">
          Export all attendance records for a date range as <strong>Excel (.xlsx)</strong> or{' '}
          <strong>CSV</strong>. The exported file includes Employee Code, Biometric ID, Punch In/Out
          times, and status — compatible for re-import or biometric machine analysis.
        </Typography>
      </Box>

      <Grid container spacing={2} alignItems="flex-end">
        <Grid size={{ xs: 12, sm: 4 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mb: 0.5, fontWeight: 600 }}
          >
            From Date
          </Typography>
          <TextField
            type="date"
            size="small"
            fullWidth
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            slotProps={{ htmlInput: { max: to } }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mb: 0.5, fontWeight: 600 }}
          >
            To Date
          </Typography>
          <TextField
            type="date"
            size="small"
            fullWidth
            value={to}
            onChange={(e) => setTo(e.target.value)}
            slotProps={{ htmlInput: { min: from, max: today } }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mb: 0.5, fontWeight: 600 }}
          >
            Format
          </Typography>
          <Stack direction="row" spacing={1}>
            {(['xlsx', 'csv'] as const).map((f) => (
              <Chip
                key={f}
                label={f.toUpperCase()}
                onClick={() => setFormat(f)}
                color={format === f ? 'primary' : 'default'}
                variant={format === f ? 'filled' : 'outlined'}
                icon={
                  <Icon
                    icon={f === 'xlsx' ? 'mdi:microsoft-excel' : 'mdi:file-delimited-outline'}
                    width={16}
                  />
                }
                sx={{ cursor: 'pointer', fontWeight: 700 }}
              />
            ))}
          </Stack>
        </Grid>
      </Grid>

      {error && <Alert severity="error">{error}</Alert>}

      <Box>
        <Button
          variant="contained"
          size="large"
          disabled={!from || !to || loading}
          onClick={handleExport}
          startIcon={
            loading ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <Icon icon="material-symbols:download-rounded" />
            )
          }
          sx={{ minWidth: 200 }}
        >
          {loading ? 'Exporting…' : `Export as ${format.toUpperCase()}`}
        </Button>
      </Box>
    </Stack>
  );
};

const DeviceInfoTab = () => {
  const theme = useTheme();
  const devices = [
    {
      name: 'ZKTeco',
      icon: 'material-symbols:fingerprint-rounded',
      color: '#3b82f6',
      steps: [
        'Open ZKTeco software → Reports → Attendance Logs',
        'Select date range and all employees',
        'Export → Save as Excel or CSV',
        'Upload the file in the Import tab',
      ],
    },
    {
      name: 'Suprema',
      icon: 'material-symbols:lock-open-right-outline-rounded',
      color: '#10b981',
      steps: [
        'Open BioStar 2 → Reports → Time & Attendance',
        'Filter by date range',
        'Export to Excel',
        'Map "User ID" column to Employee Code and upload',
      ],
    },
    {
      name: 'Hikvision',
      icon: 'material-symbols:videocam-outline-rounded',
      color: '#f59e0b',
      steps: [
        'Open iVMS-4200 → Access Control → Search',
        'Select date range and export attendance records',
        'Export as CSV',
        'Rename "Card No" or "ID" column to "Employee Code"',
      ],
    },
    {
      name: 'Anviz',
      icon: 'material-symbols:nfc-rounded',
      color: '#8b5cf6',
      steps: [
        'Open CrossChex → Reports → Attendance',
        'Set date range and click Export',
        'Save as Excel file',
        'Upload directly — "Emp Code" column is recognized automatically',
      ],
    },
  ];

  return (
    <Stack spacing={3}>
      <Box
        sx={{
          p: 2.5,
          borderRadius: 2,
          bgcolor: alpha(theme.palette.warning.main, theme.palette.mode === 'dark' ? 0.1 : 0.06),
          border: `1px solid ${alpha(theme.palette.warning.main, 0.25)}`,
          display: 'flex',
          gap: 2,
          alignItems: 'flex-start',
        }}
      >
        <Icon
          icon="material-symbols:devices-outline-rounded"
          width={22}
          color={theme.palette.warning.main}
          style={{ marginTop: 2, flexShrink: 0 }}
        />
        <Box>
          <Typography variant="subtitle2" fontWeight={700} color="warning.main" gutterBottom>
            How to export from your biometric machine
          </Typography>
          <Typography variant="body2" color="text.secondary">
            All modern biometric attendance machines can export logs as CSV or Excel. Follow the
            steps for your device brand below, then upload the file on the Import tab.
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={2}>
        {devices.map((d) => (
          <Grid key={d.name} size={{ xs: 12, sm: 6 }}>
            <Paper
              variant="outlined"
              sx={{
                p: 2.5,
                borderRadius: 2,
                border: `1px solid ${alpha(d.color, 0.25)}`,
                bgcolor: alpha(d.color, theme.palette.mode === 'dark' ? 0.06 : 0.03),
                height: '100%',
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1.5,
                    bgcolor: alpha(d.color, 0.15),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon icon={d.icon} width={20} color={d.color} />
                </Box>
                <Typography variant="subtitle1" fontWeight={700}>
                  {d.name}
                </Typography>
              </Stack>
              <Stack spacing={1}>
                {d.steps.map((step, i) => (
                  <Stack key={i} direction="row" spacing={1.5} alignItems="flex-start">
                    <Box
                      sx={{
                        minWidth: 20,
                        height: 20,
                        borderRadius: '50%',
                        bgcolor: d.color,
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 11,
                        fontWeight: 700,
                        mt: 0.15,
                      }}
                    >
                      {i + 1}
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {step}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Divider />

      <Box>
        <Typography variant="subtitle2" fontWeight={700} gutterBottom>
          Supported Column Names
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          The importer automatically recognises these column name variants from common machine
          exports:
        </Typography>
        <Grid container spacing={1}>
          {[
            ['Employee Code', 'EmployeeCode, Emp Code, employee_code'],
            ['Biometric ID', 'BiometricID, biometric_id, Card No, ID'],
            ['Date', 'date, Attendance Date, AttendanceDate'],
            ['Punch In', 'PunchIn, punch_in, Check In, Time In'],
            ['Punch Out', 'PunchOut, punch_out, Check Out, Time Out'],
            ['Status', 'status — Present/Absent/Late/Half Day (auto if omitted)'],
          ].map(([col, aliases]) => (
            <Grid key={col} size={{ xs: 12, sm: 6 }}>
              <Stack
                direction="row"
                spacing={1}
                sx={{
                  p: 1.5,
                  bgcolor: alpha(theme.palette.action.selected, 0.5),
                  borderRadius: 1.5,
                }}
              >
                <Chip
                  label={col}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ fontWeight: 700, fontSize: 11 }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center' }}>
                  {aliases}
                </Typography>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Stack>
  );
};

const BiometricImport = () => {
  const theme = useTheme();
  const [tab, setTab] = useState(0);

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 960, mx: 'auto' }}>
      {/* Page header */}
      <Box
        sx={{
          mb: 3,
          p: 3,
          borderRadius: 3,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: 2,
            bgcolor: 'rgba(255,255,255,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon icon="material-symbols:fingerprint-rounded" width={30} />
        </Box>
        <Box>
          <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: '-0.3px' }}>
            Biometric Attendance
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.85 }}>
            Import bulk attendance from biometric machine exports · Export records to Excel or CSV
          </Typography>
        </Box>
      </Box>

      {/* Tabs */}
      <Paper elevation={0} variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            px: 2,
            pt: 1,
            borderBottom: `1px solid ${theme.palette.divider}`,
            '& .MuiTab-root': { fontWeight: 700, minHeight: 48 },
          }}
        >
          <Tab
            icon={<Icon icon="material-symbols:upload-file-outline-rounded" width={18} />}
            iconPosition="start"
            label="Import from File"
          />
          <Tab
            icon={<Icon icon="material-symbols:download-rounded" width={18} />}
            iconPosition="start"
            label="Export Attendance"
          />
          <Tab
            icon={<Icon icon="material-symbols:devices-outline-rounded" width={18} />}
            iconPosition="start"
            label="Device Guide"
          />
        </Tabs>

        <Box sx={{ p: { xs: 2.5, sm: 3.5 } }}>
          {tab === 0 && <ImportTab />}
          {tab === 1 && <ExportTab />}
          {tab === 2 && <DeviceInfoTab />}
        </Box>
      </Paper>
    </Box>
  );
};

export default BiometricImport;
