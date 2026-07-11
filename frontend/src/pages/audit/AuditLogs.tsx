import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { alpha, useTheme } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import api from 'api/axios';

// ─── Types ──────────────────────────────────────────────────────────────────

interface AuditLog {
  _id: string;
  userName: string;
  userRole: string;
  module: string;
  action: string;
  recordId?: string;
  recordName?: string;
  description: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  changedFields?: string[];
  ip?: string;
  browser?: string;
  os?: string;
  device?: string;
  createdAt: string;
}

interface Meta {
  modules: string[];
  actions: string[];
  roles: string[];
}

// ─── Constants ───────────────────────────────────────────────────────────────

const ACTION_COLORS: Record<
  string,
  'success' | 'info' | 'error' | 'warning' | 'default' | 'primary' | 'secondary'
> = {
  Create: 'success',
  Update: 'info',
  Delete: 'error',
  Login: 'primary',
  Logout: 'default',
  'Failed Login': 'warning',
  'Password Change': 'secondary',
  'Profile Update': 'info',
  Approve: 'success',
  Reject: 'error',
  Import: 'secondary',
  Generate: 'primary',
};

const ACTION_ICONS: Record<string, string> = {
  Create: 'material-symbols:add-circle-outline-rounded',
  Update: 'material-symbols:edit-outline-rounded',
  Delete: 'material-symbols:delete-outline-rounded',
  Login: 'material-symbols:login-rounded',
  Logout: 'material-symbols:logout-rounded',
  'Failed Login': 'material-symbols:warning-outline-rounded',
  'Password Change': 'material-symbols:lock-reset-rounded',
  'Profile Update': 'material-symbols:manage-accounts-outline-rounded',
  Approve: 'material-symbols:check-circle-outline-rounded',
  Reject: 'material-symbols:cancel-outline-rounded',
  Import: 'material-symbols:upload-file-outline-rounded',
  Generate: 'material-symbols:receipt-long-outline-rounded',
};

const MODULE_ICONS: Record<string, string> = {
  Employee: 'material-symbols:badge-outline-rounded',
  Attendance: 'material-symbols:fingerprint-rounded',
  Leave: 'material-symbols:event-available-outline-rounded',
  Payroll: 'material-symbols:payments-outline-rounded',
  Advance: 'material-symbols:currency-exchange-rounded',
  Auth: 'material-symbols:security-rounded',
  Settings: 'material-symbols:settings-outline-rounded',
  User: 'material-symbols:manage-accounts-outline-rounded',
  Biometric: 'material-symbols:fingerprint-rounded',
};

// ─── Diff View ───────────────────────────────────────────────────────────────

const DiffView = ({ log }: { log: AuditLog }) => {
  const theme = useTheme();
  if (!log.oldValues && !log.newValues) return null;

  const changedKeys = log.changedFields?.length
    ? log.changedFields
    : Object.keys({ ...(log.oldValues || {}), ...(log.newValues || {}) });

  return (
    <Box>
      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
        Field Changes ({changedKeys.length})
      </Typography>
      <Paper variant="outlined" sx={{ overflow: 'hidden', borderRadius: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: alpha(theme.palette.action.selected, 0.5) }}>
              <TableCell sx={{ fontWeight: 700, width: '25%' }}>Field</TableCell>
              <TableCell sx={{ fontWeight: 700, width: '37.5%', color: 'error.main' }}>
                Before
              </TableCell>
              <TableCell sx={{ fontWeight: 700, width: '37.5%', color: 'success.main' }}>
                After
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {changedKeys.map((key) => {
              const oldVal = log.oldValues?.[key];
              const newVal = log.newValues?.[key];
              const changed = JSON.stringify(oldVal) !== JSON.stringify(newVal);
              return (
                <TableRow
                  key={key}
                  sx={{
                    bgcolor: changed
                      ? alpha(
                          theme.palette.warning.main,
                          theme.palette.mode === 'dark' ? 0.07 : 0.04,
                        )
                      : 'transparent',
                    '&:last-child td': { border: 0 },
                  }}
                >
                  <TableCell>
                    <Typography variant="caption" fontWeight={700} color="text.secondary">
                      {key}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {oldVal !== undefined ? (
                      <Typography
                        variant="body2"
                        sx={{
                          color: changed ? 'error.main' : 'text.secondary',
                          textDecoration: changed ? 'line-through' : 'none',
                          fontFamily: 'monospace',
                          fontSize: 12,
                        }}
                      >
                        {String(typeof oldVal === 'object' ? JSON.stringify(oldVal) : oldVal)}
                      </Typography>
                    ) : (
                      <Typography variant="caption" color="text.disabled">
                        —
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {newVal !== undefined ? (
                      <Typography
                        variant="body2"
                        sx={{
                          color: changed ? 'success.main' : 'text.secondary',
                          fontWeight: changed ? 600 : 400,
                          fontFamily: 'monospace',
                          fontSize: 12,
                        }}
                      >
                        {String(typeof newVal === 'object' ? JSON.stringify(newVal) : newVal)}
                      </Typography>
                    ) : (
                      <Typography variant="caption" color="text.disabled">
                        —
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

// ─── Detail Modal ─────────────────────────────────────────────────────────────

const DetailModal = ({ log, onClose }: { log: AuditLog | null; onClose: () => void }) => {
  const theme = useTheme();
  const [showRaw, setShowRaw] = useState(false);
  if (!log) return null;

  const actionColor = ACTION_COLORS[log.action] || 'default';

  return (
    <Dialog open onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Icon
              icon={ACTION_ICONS[log.action] || 'material-symbols:info-outline-rounded'}
              width={22}
            />
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Audit Log Detail
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(log.createdAt).toLocaleString('en-PK', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </Typography>
            </Box>
          </Stack>
          <IconButton size="small" onClick={onClose}>
            <Icon icon="material-symbols:close-rounded" />
          </IconButton>
        </Stack>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2.5 }}>
        <Stack spacing={3}>
          {/* Summary */}
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: alpha(
                theme.palette.primary.main,
                theme.palette.mode === 'dark' ? 0.1 : 0.05,
              ),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            }}
          >
            <Typography variant="body1" fontWeight={600}>
              {log.description}
            </Typography>
          </Box>

          {/* Meta grid */}
          <Grid container spacing={2}>
            {[
              {
                label: 'User',
                value: log.userName,
                icon: 'material-symbols:person-outline-rounded',
              },
              {
                label: 'Role',
                value: log.userRole,
                icon: 'material-symbols:shield-outline-rounded',
              },
              {
                label: 'Module',
                value: log.module,
                icon: MODULE_ICONS[log.module] || 'material-symbols:widgets-outline-rounded',
              },
              {
                label: 'Action',
                value: log.action,
                icon: ACTION_ICONS[log.action] || 'material-symbols:bolt-rounded',
              },
              {
                label: 'Record',
                value: log.recordName || log.recordId || '—',
                icon: 'material-symbols:article-outline-rounded',
              },
              {
                label: 'IP Address',
                value: log.ip || '—',
                icon: 'material-symbols:router-outline-rounded',
              },
              {
                label: 'Browser',
                value: log.browser || '—',
                icon: 'material-symbols:public-rounded',
              },
              {
                label: 'OS',
                value: log.os || '—',
                icon: 'material-symbols:computer-outline-rounded',
              },
              {
                label: 'Device',
                value: log.device || '—',
                icon: 'material-symbols:devices-outline-rounded',
              },
            ].map(({ label, value, icon }) => (
              <Grid key={label} size={{ xs: 6, sm: 4 }}>
                <Stack direction="row" spacing={1} alignItems="flex-start">
                  <Icon
                    icon={icon}
                    width={16}
                    style={{ marginTop: 3, opacity: 0.6, flexShrink: 0 }}
                  />
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', fontWeight: 600 }}
                    >
                      {label}
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {label === 'Action' ? (
                        <Chip label={value} size="small" color={actionColor} />
                      ) : (
                        value
                      )}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
            ))}
          </Grid>

          {/* Field diff */}
          {(log.oldValues || log.newValues) && <DiffView log={log} />}

          {/* Raw JSON toggle */}
          {(log.oldValues || log.newValues) && (
            <Box>
              <Button
                size="small"
                variant="outlined"
                color="inherit"
                startIcon={
                  <Icon
                    icon={
                      showRaw
                        ? 'material-symbols:expand-less-rounded'
                        : 'material-symbols:code-rounded'
                    }
                  />
                }
                onClick={() => setShowRaw((p) => !p)}
              >
                {showRaw ? 'Hide' : 'Show'} Raw JSON
              </Button>
              <Collapse in={showRaw}>
                <Box
                  sx={{
                    mt: 1.5,
                    p: 2,
                    borderRadius: 2,
                    bgcolor:
                      theme.palette.mode === 'dark' ? alpha('#000', 0.4) : alpha('#000', 0.04),
                    border: `1px solid ${theme.palette.divider}`,
                    fontFamily: 'monospace',
                    fontSize: 12,
                    overflowX: 'auto',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                    color: 'text.secondary',
                  }}
                >
                  {JSON.stringify({ oldValues: log.oldValues, newValues: log.newValues }, null, 2)}
                </Box>
              </Collapse>
            </Box>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const AuditLogs = () => {
  const theme = useTheme();
  const today = new Date().toISOString().slice(0, 10);
  const firstOfMonth = today.slice(0, 8) + '01';

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<AuditLog | null>(null);
  const [meta, setMeta] = useState<Meta>({ modules: [], actions: [], roles: [] });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [exporting, setExporting] = useState<'xlsx' | 'csv' | null>(null);

  // Filter state
  const [from, setFrom] = useState(firstOfMonth);
  const [to, setTo] = useState(today);
  const [module, setModule] = useState('');
  const [action, setAction] = useState('');
  const [role, setRole] = useState('');
  const [search, setSearch] = useState('');
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeFilterCount = [from, to, module, action, role, search].filter(Boolean).length - 2; // from/to are always set

  const buildParams = useCallback(
    (pg = page) => {
      const p: Record<string, string> = { page: String(pg), limit: '25' };
      if (from) p.from = from;
      if (to) p.to = to;
      if (module) p.module = module;
      if (action) p.action = action;
      if (role) p.role = role;
      if (search) p.search = search;
      return new URLSearchParams(p).toString();
    },
    [page, from, to, module, action, role, search],
  );

  const fetchLogs = useCallback(
    async (pg = page) => {
      setLoading(true);
      try {
        const res = await api.get(`/audit-logs?${buildParams(pg)}`);
        setLogs(res.data.logs || []);
        setTotal(res.data.total || 0);
        setPages(res.data.pages || 1);
      } catch {
        setLogs([]);
      } finally {
        setLoading(false);
      }
    },
    [buildParams, page],
  );

  useEffect(() => {
    api
      .get('/audit-logs/meta')
      .then((r) => setMeta(r.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchLogs(1);
    setPage(1);
  }, [from, to, module, action, role]);

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      fetchLogs(1);
      setPage(1);
    }, 400);
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [search]);

  useEffect(() => {
    fetchLogs(page);
  }, [page]);

  const handleExport = async (fmt: 'xlsx' | 'csv') => {
    setExporting(fmt);
    try {
      const params = buildParams();
      const res = await api.get(`/audit-logs/export?${params}&format=${fmt}`, {
        responseType: 'blob',
      });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit_logs.${fmt}`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(null);
    }
  };

  const clearFilters = () => {
    setFrom(firstOfMonth);
    setTo(today);
    setModule('');
    setAction('');
    setRole('');
    setSearch('');
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Page header */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ sm: 'center' }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Icon
              icon="material-symbols:history-rounded"
              width={28}
              color={theme.palette.primary.main}
            />
            <Typography variant="h5" fontWeight={800}>
              Audit Logs
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Immutable record of all system activity — {total.toLocaleString()} log
            {total !== 1 ? 's' : ''}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Button
            variant="outlined"
            color="inherit"
            size="small"
            startIcon={<Icon icon="material-symbols:filter-list-rounded" />}
            onClick={() => setFiltersOpen((p) => !p)}
            endIcon={
              activeFilterCount > 0 ? (
                <Chip
                  label={activeFilterCount}
                  size="small"
                  color="primary"
                  sx={{ height: 18, fontSize: 11 }}
                />
              ) : undefined
            }
          >
            Filters
          </Button>
          <Button
            variant="outlined"
            size="small"
            disabled={exporting === 'xlsx'}
            onClick={() => handleExport('xlsx')}
            startIcon={
              exporting === 'xlsx' ? (
                <CircularProgress size={14} />
              ) : (
                <Icon icon="mdi:microsoft-excel" />
              )
            }
          >
            Excel
          </Button>
          <Button
            variant="outlined"
            size="small"
            disabled={exporting === 'csv'}
            onClick={() => handleExport('csv')}
            startIcon={
              exporting === 'csv' ? (
                <CircularProgress size={14} />
              ) : (
                <Icon icon="mdi:file-delimited-outline" />
              )
            }
          >
            CSV
          </Button>
        </Stack>
      </Stack>

      {/* Filters panel */}
      <Collapse in={filtersOpen}>
        <Paper
          variant="outlined"
          sx={{
            p: 2.5,
            mb: 2.5,
            borderRadius: 2.5,
            bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.05 : 0.02),
          }}
        >
          <Grid container spacing={2} alignItems="flex-end">
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <Typography
                variant="caption"
                fontWeight={700}
                color="text.secondary"
                sx={{ display: 'block', mb: 0.5 }}
              >
                From
              </Typography>
              <TextField
                type="date"
                size="small"
                fullWidth
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <Typography
                variant="caption"
                fontWeight={700}
                color="text.secondary"
                sx={{ display: 'block', mb: 0.5 }}
              >
                To
              </Typography>
              <TextField
                type="date"
                size="small"
                fullWidth
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <Typography
                variant="caption"
                fontWeight={700}
                color="text.secondary"
                sx={{ display: 'block', mb: 0.5 }}
              >
                Module
              </Typography>
              <Select
                size="small"
                fullWidth
                displayEmpty
                value={module}
                onChange={(e) => setModule(e.target.value)}
              >
                <MenuItem value="">All Modules</MenuItem>
                {meta.modules.map((m) => (
                  <MenuItem key={m} value={m}>
                    {m}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <Typography
                variant="caption"
                fontWeight={700}
                color="text.secondary"
                sx={{ display: 'block', mb: 0.5 }}
              >
                Action
              </Typography>
              <Select
                size="small"
                fullWidth
                displayEmpty
                value={action}
                onChange={(e) => setAction(e.target.value)}
              >
                <MenuItem value="">All Actions</MenuItem>
                {meta.actions.map((a) => (
                  <MenuItem key={a} value={a}>
                    {a}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <Typography
                variant="caption"
                fontWeight={700}
                color="text.secondary"
                sx={{ display: 'block', mb: 0.5 }}
              >
                Role
              </Typography>
              <Select
                size="small"
                fullWidth
                displayEmpty
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <MenuItem value="">All Roles</MenuItem>
                {meta.roles.map((r) => (
                  <MenuItem key={r} value={r}>
                    {r}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <Typography
                variant="caption"
                fontWeight={700}
                color="text.secondary"
                sx={{ display: 'block', mb: 0.5 }}
              >
                Search
              </Typography>
              <TextField
                size="small"
                fullWidth
                placeholder="Description, name…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <Icon
                        icon="material-symbols:search-rounded"
                        width={18}
                        style={{ marginRight: 6, opacity: 0.5 }}
                      />
                    ),
                  },
                }}
              />
            </Grid>
          </Grid>
          <Stack direction="row" justifyContent="flex-end" sx={{ mt: 1.5 }}>
            <Button
              size="small"
              color="inherit"
              onClick={clearFilters}
              startIcon={<Icon icon="material-symbols:clear-all-rounded" />}
            >
              Clear Filters
            </Button>
          </Stack>
        </Paper>
      </Collapse>

      {/* Table */}
      <Paper variant="outlined" sx={{ borderRadius: 2.5, overflow: 'hidden' }}>
        {loading ? (
          <Box
            sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 240 }}
          >
            <CircularProgress />
          </Box>
        ) : logs.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Icon
              icon="material-symbols:search-off-rounded"
              width={48}
              color={theme.palette.text.disabled}
            />
            <Typography variant="h6" color="text.disabled" sx={{ mt: 1 }}>
              No audit logs found
            </Typography>
            <Typography variant="body2" color="text.disabled">
              Try adjusting your filters
            </Typography>
          </Box>
        ) : (
          <>
            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow
                    sx={{
                      bgcolor: alpha(
                        theme.palette.primary.main,
                        theme.palette.mode === 'dark' ? 0.08 : 0.04,
                      ),
                    }}
                  >
                    {[
                      'Date & Time',
                      'User',
                      'Role',
                      'Module',
                      'Action',
                      'Description',
                      'IP / Device',
                      '',
                    ].map((h) => (
                      <TableCell key={h} sx={{ fontWeight: 700, whiteSpace: 'nowrap', py: 1.5 }}>
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow
                      key={log._id}
                      sx={{
                        '&:last-child td': { border: 0 },
                        '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.5) },
                      }}
                    >
                      <TableCell
                        sx={{ whiteSpace: 'nowrap', color: 'text.secondary', fontSize: 12 }}
                      >
                        {new Date(log.createdAt).toLocaleString('en-PK', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {log.userName || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={log.userRole}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: 11, fontWeight: 600, borderRadius: 1 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={0.75}>
                          <Icon
                            icon={
                              MODULE_ICONS[log.module] || 'material-symbols:widgets-outline-rounded'
                            }
                            width={15}
                            style={{ opacity: 0.6 }}
                          />
                          <Typography variant="body2">{log.module}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={log.action}
                          size="small"
                          color={ACTION_COLORS[log.action] || 'default'}
                          icon={
                            <Icon
                              icon={ACTION_ICONS[log.action] || 'material-symbols:bolt-rounded'}
                              width={13}
                            />
                          }
                          sx={{ fontWeight: 700, fontSize: 11 }}
                        />
                      </TableCell>
                      <TableCell
                        sx={{
                          maxWidth: 280,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <Tooltip title={log.description} placement="top">
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {log.description}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        <Stack spacing={0.25}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontFamily: 'monospace' }}
                          >
                            {log.ip || '—'}
                          </Typography>
                          <Typography variant="caption" color="text.disabled">
                            {[log.browser, log.device].filter(Boolean).join(' · ') || '—'}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View Details">
                          <IconButton size="small" onClick={() => setSelected(log)}>
                            <Icon icon="material-symbols:open-in-new-rounded" width={16} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>

            {/* Pagination */}
            <Divider />
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              gap={1}
              sx={{ px: 2.5, py: 1.5 }}
            >
              <Typography variant="caption" color="text.secondary">
                Showing {(page - 1) * 25 + 1}–{Math.min(page * 25, total)} of{' '}
                {total.toLocaleString()} records
              </Typography>
              <Pagination
                count={pages}
                page={page}
                onChange={(_, p) => setPage(p)}
                size="small"
                color="primary"
                shape="rounded"
              />
            </Stack>
          </>
        )}
      </Paper>

      {/* Detail modal */}
      <DetailModal log={selected} onClose={() => setSelected(null)} />
    </Box>
  );
};

export default AuditLogs;
