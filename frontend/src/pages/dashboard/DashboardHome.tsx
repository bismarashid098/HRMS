import { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import ReactECharts from 'echarts-for-react';
import api from 'api/axios';
import { useAuth } from 'context/AuthContext';

/* ── Types ───────────────────────────────────────────────────── */
interface Summary {
  totalEmployees: number;
  attendanceToday: number;
  pendingLeaves: number;
  monthlyPayroll: number;
  attendanceRate: number;
  absentToday: number;
}
interface ChartDay {
  _id: string;
  present: number;
  absent: number;
  attendanceRate: number;
}
interface LeaveType {
  _id: string;
  total: number;
  approved: number;
  pending: number;
  rejected: number;
}
interface PayrollMonth {
  month: string;
  totalPaid: number;
  employees: number;
}

/* ── KPI Card ────────────────────────────────────────────────── */
interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: string;
  color: string;
  badge?: string;
  badgeColor?: 'success' | 'warning' | 'error' | 'info' | 'default';
  ringValue?: number;
}

const KpiCard = ({ title, value, subtitle, icon, color, badge, badgeColor, ringValue }: KpiCardProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const hasRing = ringValue !== undefined;

  return (
    <Card
      sx={{
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        background: `radial-gradient(ellipse at 92% 12%, ${alpha(color, isDark ? 0.18 : 0.13)} 0%, transparent 58%)`,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        cursor: 'default',
        '&:hover': { transform: 'translateY(-3px)', boxShadow: isDark ? 8 : 6 },
      }}
    >
      {/* Top accent line */}
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, bgcolor: color, opacity: 0.85 }} />

      <CardContent sx={{ pt: 3, pb: '20px !important', px: 2.5 }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ letterSpacing: 1, fontWeight: 600, lineHeight: 1.4, fontSize: '0.68rem' }}
          >
            {title}
          </Typography>

          {hasRing ? (
            <Box sx={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
              <CircularProgress
                variant="determinate"
                value={100}
                size={52}
                thickness={3}
                sx={{ color: alpha(color, 0.12), position: 'absolute', top: 0, left: 0 }}
              />
              <CircularProgress
                variant="determinate"
                value={ringValue}
                size={52}
                thickness={3}
                sx={{ color, '& .MuiCircularProgress-circle': { strokeLinecap: 'round' } }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon icon={icon} width={22} color={color} />
              </Box>
            </Box>
          ) : (
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2.5,
                bgcolor: alpha(color, isDark ? 0.18 : 0.1),
                border: `1px solid ${alpha(color, 0.2)}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Icon icon={icon} width={24} color={color} />
            </Box>
          )}
        </Stack>

        <Typography
          variant="h3"
          fontWeight={800}
          sx={{ mb: 0.4, lineHeight: 1.05, letterSpacing: '-0.5px' }}
        >
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: badge ? 1.5 : 0 }}>
          {subtitle}
        </Typography>
        {badge && (
          <Chip
            label={badge}
            size="small"
            color={badgeColor}
            sx={{ height: 22, fontSize: '0.69rem', fontWeight: 700 }}
          />
        )}
      </CardContent>
    </Card>
  );
};

const KpiSkeleton = () => (
  <Card sx={{ height: '100%' }}>
    <CardContent sx={{ pt: 3 }}>
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
        <Skeleton width="50%" height={14} />
        <Skeleton variant="rounded" width={48} height={48} sx={{ borderRadius: 2.5 }} />
      </Stack>
      <Skeleton width="42%" height={52} sx={{ mb: 0.5 }} />
      <Skeleton width="65%" height={16} />
    </CardContent>
  </Card>
);

/* ── Ring Gauge ──────────────────────────────────────────────── */
const RingGauge = ({
  value,
  total,
  color,
  label,
  icon,
}: {
  value: number;
  total: number;
  color: string;
  label: string;
  icon: string;
}) => {
  const pct = total > 0 ? Math.min((value / total) * 100, 100) : 0;
  return (
    <Box sx={{ textAlign: 'center' }}>
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <CircularProgress
          variant="determinate"
          value={100}
          size={82}
          thickness={4}
          sx={{ color: alpha(color, 0.1), position: 'absolute', top: 0, left: 0 }}
        />
        <CircularProgress
          variant="determinate"
          value={pct}
          size={82}
          thickness={4}
          sx={{ color, '& .MuiCircularProgress-circle': { strokeLinecap: 'round' } }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="subtitle1" fontWeight={800} color={color} sx={{ lineHeight: 1 }}>
            {value}
          </Typography>
          <Icon icon={icon} width={13} color={color} style={{ opacity: 0.7 }} />
        </Box>
      </Box>
      <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mt: 0.75 }}>
        {label}
      </Typography>
      <Typography variant="caption" sx={{ display: 'block', color: color, fontWeight: 700 }}>
        {Math.round(pct)}%
      </Typography>
    </Box>
  );
};

/* ── Chart Card Header ───────────────────────────────────────── */
const ChartHeader = ({
  title,
  caption,
  legend,
  right,
}: {
  title: string;
  caption: string;
  legend?: { label: string; color: string; shape?: 'circle' | 'rect' }[];
  right?: React.ReactNode;
}) => (
  <>
    <Stack
      direction="row"
      alignItems={{ xs: 'flex-start', sm: 'center' }}
      justifyContent="space-between"
      flexWrap="wrap"
      gap={1}
      sx={{ px: 2.5, pt: 2.5, pb: 2 }}
    >
      <Box>
        <Typography variant="h6" fontWeight={700}>
          {title}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {caption}
        </Typography>
      </Box>
      <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
        {legend?.map((item) => (
          <Stack key={item.label} direction="row" alignItems="center" spacing={0.6}>
            <Box
              sx={{
                width: item.shape === 'circle' ? 8 : 10,
                height: 8,
                borderRadius: item.shape === 'circle' ? '50%' : '2px',
                bgcolor: item.color,
                flexShrink: 0,
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
              {item.label}
            </Typography>
          </Stack>
        ))}
        {right}
      </Stack>
    </Stack>
    <Divider />
  </>
);

/* ── Empty State ─────────────────────────────────────────────── */
const EmptyChart = ({ icon, message, color }: { icon: string; message: string; color: string }) => (
  <Box
    sx={{
      height: 260,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 1.5,
    }}
  >
    <Box sx={{ p: 2, borderRadius: 3, bgcolor: alpha(color, 0.07) }}>
      <Icon icon={icon} width={36} color={alpha(color, 0.4)} />
    </Box>
    <Typography color="text.secondary" variant="body2" fontWeight={500}>
      {message}
    </Typography>
  </Box>
);

/* ── Dashboard ───────────────────────────────────────────────── */
const DashboardHome = () => {
  const theme = useTheme();
  const { user } = useAuth();

  const [summary, setSummary] = useState<Summary | null>(null);
  const [chartData, setChartData] = useState<ChartDay[]>([]);
  const [leaveStats, setLeaveStats] = useState<LeaveType[]>([]);
  const [payrollStats, setPayrollStats] = useState<PayrollMonth[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === 'Admin';
  const isDark = theme.palette.mode === 'dark';

  useEffect(() => {
    const reqs = [
      api.get('/dashboard/summary'),
      api.get('/dashboard/attendance-chart'),
      api.get('/dashboard/leave-stats'),
    ];
    if (isAdmin) reqs.push(api.get('/dashboard/payroll-stats'));

    Promise.all(reqs)
      .then(([s, c, l, p]) => {
        setSummary(s.data);
        setChartData(c.data || []);
        setLeaveStats(l.data || []);
        if (p) setPayrollStats(p.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isAdmin]);

  /* ── Palette shortcuts ── */
  const P = {
    blue: theme.palette.primary.main,
    green: theme.palette.success.main,
    amber: theme.palette.warning.main,
    purple: theme.palette.secondary.main,
    red: theme.palette.error.main,
  };

  /* ── Chart shared styles ── */
  const axLbl = { color: theme.palette.text.secondary as string, fontSize: 11 };
  const splitLn = {
    lineStyle: { color: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.06), type: 'dashed' as const },
  };
  const tooltipStyle = {
    backgroundColor: isDark ? '#1e2328' : '#fff',
    borderColor: isDark ? '#303840' : '#e0e0e0',
    textStyle: { color: isDark ? '#e0e0e0' : '#1a1a2e', fontSize: 12 },
    borderWidth: 1,
    extraCssText: 'box-shadow: 0 4px 20px rgba(0,0,0,0.12);',
  };

  const fmtDate = (s: string) => {
    const d = new Date(s);
    return `${d.toLocaleString('default', { month: 'short' })} ${d.getDate()}`;
  };

  /* ── Attendance Chart ── */
  const attendanceChart = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      ...tooltipStyle,
      axisPointer: { type: 'shadow', shadowStyle: { color: alpha(isDark ? '#fff' : '#000', 0.04) } },
    },
    legend: { show: false },
    grid: { left: 4, right: 4, top: 12, bottom: 4, containLabel: true },
    xAxis: {
      type: 'category',
      data: chartData.map((d) => fmtDate(d._id)),
      axisLine: { lineStyle: { color: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.1) } },
      axisTick: { show: false },
      axisLabel: { ...axLbl, interval: Math.max(0, Math.floor(chartData.length / 8) - 1) },
    },
    yAxis: [
      {
        type: 'value',
        axisLabel: axLbl,
        splitLine: splitLn,
        axisLine: { show: false },
        axisTick: { show: false },
        minInterval: 1,
      },
      {
        type: 'value',
        min: 0,
        max: 100,
        axisLabel: { ...axLbl, formatter: '{value}%' },
        splitLine: { show: false },
        axisLine: { show: false },
        axisTick: { show: false },
      },
    ],
    series: [
      {
        name: 'Present',
        type: 'bar',
        barMaxWidth: 16,
        barCategoryGap: '35%',
        barGap: '10%',
        data: chartData.map((d) => d.present),
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: P.blue },
              { offset: 1, color: alpha(P.blue, 0.5) },
            ],
          },
        },
      },
      {
        name: 'Absent',
        type: 'bar',
        barMaxWidth: 16,
        data: chartData.map((d) => d.absent),
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: P.red },
              { offset: 1, color: alpha(P.red, 0.4) },
            ],
          },
        },
      },
      {
        name: 'Rate',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        symbol: 'circle',
        symbolSize: 5,
        data: chartData.map((d) => d.attendanceRate),
        lineStyle: { color: P.green, width: 2.5 },
        itemStyle: { color: P.green, borderWidth: 2.5, borderColor: isDark ? '#1e2328' : '#fff' },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: alpha(P.green, 0.2) },
              { offset: 1, color: alpha(P.green, 0) },
            ],
          },
        },
      },
    ],
  };

  /* ── Leave Donut ── */
  const LEAF_CLR = [P.blue, P.amber, P.green, P.purple, P.red];
  const totalLeaves = leaveStats.reduce((s, x) => s + x.total, 0);
  const totalPending = leaveStats.reduce((s, x) => s + x.pending, 0);
  const totalApproved = leaveStats.reduce((s, x) => s + x.approved, 0);

  const leaveDonut = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item', ...tooltipStyle, formatter: '{b}: {c} ({d}%)' },
    legend: { show: false },
    series: [
      {
        type: 'pie',
        radius: ['52%', '74%'],
        center: ['50%', '50%'],
        data: leaveStats.map((l, i) => ({
          name: l._id,
          value: l.total,
          itemStyle: {
            color: LEAF_CLR[i % LEAF_CLR.length],
            shadowBlur: 4,
            shadowColor: alpha(LEAF_CLR[i % LEAF_CLR.length], 0.25),
          },
        })),
        label: { show: false },
        emphasis: {
          itemStyle: { shadowBlur: 12, shadowColor: 'rgba(0,0,0,0.2)', scale: true, scaleSize: 4 },
        },
        animationType: 'expansion',
        animationEasing: 'cubicOut',
      },
    ],
  };

  /* ── Payroll Chart ── */
  const avgPayroll =
    payrollStats.length > 0
      ? Math.round(payrollStats.reduce((s, p) => s + p.totalPaid, 0) / payrollStats.length)
      : 0;

  const payrollChart = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      ...tooltipStyle,
      formatter: (params: { name: string; value: number; marker: string }[]) => {
        const p = params[0];
        if (!p) return '';
        return `<strong>${p.name}</strong><br/>${p.marker} PKR ${(p.value || 0).toLocaleString()}`;
      },
    },
    grid: { left: 4, right: 16, top: 12, bottom: 4, containLabel: true },
    xAxis: {
      type: 'category',
      data: payrollStats.map((p) => p.month),
      axisLine: { lineStyle: { color: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.1) } },
      axisTick: { show: false },
      axisLabel: axLbl,
    },
    yAxis: {
      type: 'value',
      axisLabel: { ...axLbl, formatter: (v: number) => `${(v / 1000).toFixed(0)}K` },
      splitLine: splitLn,
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series: [
      {
        type: 'line',
        smooth: true,
        data: payrollStats.map((p) => p.totalPaid),
        symbol: 'circle',
        symbolSize: 7,
        lineStyle: { color: P.purple, width: 2.5 },
        itemStyle: { color: P.purple, borderWidth: 3, borderColor: isDark ? '#1e2328' : '#fff' },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: alpha(P.purple, 0.3) },
              { offset: 1, color: alpha(P.purple, 0) },
            ],
          },
        },
      },
      ...(payrollStats.length > 0
        ? [
            {
              type: 'line',
              data: payrollStats.map(() => avgPayroll),
              lineStyle: { color: alpha(P.amber, 0.7), width: 1.5, type: 'dashed' as const },
              symbol: 'none',
              tooltip: { show: false },
            },
          ]
        : []),
    ],
  };

  /* ── Greeting ── */
  const now = new Date();
  const hr = now.getHours();
  const greeting = hr < 12 ? 'Good Morning' : hr < 17 ? 'Good Afternoon' : 'Good Evening';
  const greetIcon =
    hr < 12
      ? 'material-symbols:wb-sunny-outline-rounded'
      : hr < 17
        ? 'material-symbols:light-mode-outline-rounded'
        : 'material-symbols:nights-stay-outline-rounded';
  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  /* ── Render ── */
  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, pb: { xs: 4, sm: 4 } }}>

      {/* ══ Greeting Banner ══ */}
      <Box
        sx={{
          mb: 3,
          p: { xs: 2, sm: 2.5 },
          borderRadius: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1.5,
          background: isDark
            ? `linear-gradient(120deg, ${alpha(P.blue, 0.18)} 0%, ${alpha(P.purple, 0.12)} 60%, transparent 100%)`
            : `linear-gradient(120deg, ${alpha(P.blue, 0.09)} 0%, ${alpha(P.purple, 0.06)} 60%, transparent 100%)`,
          border: `1px solid ${alpha(P.blue, isDark ? 0.2 : 0.12)}`,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: 2.5,
              bgcolor: alpha(P.blue, isDark ? 0.2 : 0.12),
              border: `1px solid ${alpha(P.blue, 0.2)}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon icon={greetIcon} width={24} color={P.blue} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={800} sx={{ lineHeight: 1.25, letterSpacing: '-0.3px' }}>
              {greeting}, {user?.name?.split(' ')[0]}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {dateStr}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Chip
            label={user?.role}
            size="small"
            sx={{
              bgcolor: alpha(isAdmin ? P.purple : P.blue, 0.12),
              color: isAdmin ? P.purple : P.blue,
              fontWeight: 700,
              border: `1px solid ${alpha(isAdmin ? P.purple : P.blue, 0.2)}`,
              fontSize: '0.7rem',
            }}
          />
          <Chip
            icon={
              <Box sx={{ display: 'flex', pl: 0.5 }}>
                <Icon
                  icon={loading ? 'material-symbols:hourglass-empty-rounded' : 'material-symbols:radio-button-checked'}
                  width={10}
                  color={loading ? P.amber : P.green}
                />
              </Box>
            }
            label={loading ? 'Loading…' : 'Live'}
            size="small"
            sx={{
              bgcolor: alpha(loading ? P.amber : P.green, 0.1),
              color: loading ? P.amber : P.green,
              fontWeight: 700,
              border: `1px solid ${alpha(loading ? P.amber : P.green, 0.22)}`,
              fontSize: '0.7rem',
            }}
          />
        </Stack>
      </Box>

      {/* ══ KPI Cards ══ */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
          {loading ? (
            <KpiSkeleton />
          ) : (
            <KpiCard
              title="Total Employees"
              value={summary?.totalEmployees ?? 0}
              subtitle="Active workforce"
              icon="material-symbols:people-outline-rounded"
              color={P.blue}
            />
          )}
        </Grid>

        <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
          {loading ? (
            <KpiSkeleton />
          ) : (
            <KpiCard
              title="Present Today"
              value={summary?.attendanceToday ?? 0}
              subtitle={`${summary?.absentToday ?? 0} absent of ${summary?.totalEmployees ?? 0}`}
              icon="material-symbols:fingerprint-rounded"
              color={P.green}
              badge={`${summary?.attendanceRate ?? 0}% rate`}
              badgeColor="success"
              ringValue={summary?.attendanceRate ?? 0}
            />
          )}
        </Grid>

        <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
          {loading ? (
            <KpiSkeleton />
          ) : (
            <KpiCard
              title="Pending Leaves"
              value={summary?.pendingLeaves ?? 0}
              subtitle={
                (summary?.pendingLeaves ?? 0) > 0 ? 'Awaiting your decision' : 'All leaves processed'
              }
              icon="material-symbols:event-busy-outline-rounded"
              color={P.amber}
              badge={(summary?.pendingLeaves ?? 0) > 0 ? 'Action needed' : undefined}
              badgeColor="warning"
            />
          )}
        </Grid>

        <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
          {loading ? (
            <KpiSkeleton />
          ) : (
            <KpiCard
              title={isAdmin ? 'Payroll This Month' : 'Absent Today'}
              value={
                isAdmin
                  ? `PKR ${((summary?.monthlyPayroll ?? 0) / 1000).toFixed(1)}K`
                  : (summary?.absentToday ?? 0)
              }
              subtitle={isAdmin ? 'Total net disbursed' : 'Not checked in today'}
              icon={
                isAdmin
                  ? 'material-symbols:payments-outline-rounded'
                  : 'material-symbols:person-off-outline-rounded'
              }
              color={isAdmin ? P.purple : P.red}
            />
          )}
        </Grid>
      </Grid>

      {/* ══ Charts Row ══ */}
      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>

        {/* Attendance Trend */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card sx={{ height: '100%' }}>
            <ChartHeader
              title="Attendance Trends"
              caption={`${now.toLocaleString('default', { month: 'long', year: 'numeric' })} — daily`}
              legend={[
                { label: 'Present', color: P.blue },
                { label: 'Absent', color: P.red },
                { label: 'Rate %', color: P.green, shape: 'circle' },
              ]}
            />
            <Box sx={{ px: 2.5, pt: 2, pb: 1 }}>
              {loading ? (
                <Skeleton variant="rounded" height={300} />
              ) : chartData.length > 0 ? (
                <ReactECharts option={attendanceChart} style={{ height: 300 }} />
              ) : (
                <EmptyChart
                  icon="material-symbols:bar-chart-off-outline"
                  message="No attendance data for this month"
                  color={P.blue}
                />
              )}
            </Box>
          </Card>
        </Grid>

        {/* Leave Breakdown */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={{ height: '100%' }}>
            <ChartHeader title="Leave Breakdown" caption="All time — by type" />

            {loading ? (
              <Box sx={{ px: 2.5, pt: 2 }}>
                <Skeleton variant="circular" width={140} height={140} sx={{ mx: 'auto', mb: 2 }} />
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} height={28} sx={{ mb: 0.75 }} />
                ))}
              </Box>
            ) : leaveStats.length > 0 ? (
              <>
                {/* Status summary pills */}
                <Stack direction="row" spacing={1} sx={{ px: 2.5, pt: 2, pb: 1 }} justifyContent="center">
                  {[
                    { label: 'Approved', count: totalApproved, color: P.green },
                    { label: 'Pending', count: totalPending, color: P.amber },
                  ].map((s) => (
                    <Box
                      key={s.label}
                      sx={{
                        flex: 1,
                        textAlign: 'center',
                        py: 0.75,
                        borderRadius: 2,
                        bgcolor: alpha(s.color, isDark ? 0.15 : 0.08),
                        border: `1px solid ${alpha(s.color, 0.2)}`,
                      }}
                    >
                      <Typography variant="subtitle2" fontWeight={800} color={s.color}>
                        {s.count}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.2 }}>
                        {s.label}
                      </Typography>
                    </Box>
                  ))}
                </Stack>

                {/* Donut */}
                <Box sx={{ position: 'relative', mx: 2.5 }}>
                  <ReactECharts option={leaveDonut} style={{ height: 165 }} />
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      pointerEvents: 'none',
                    }}
                  >
                    <Typography variant="h4" fontWeight={800} sx={{ lineHeight: 1 }}>
                      {totalLeaves}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total
                    </Typography>
                  </Box>
                </Box>

                {/* Per-type rows */}
                <Stack spacing={1.25} sx={{ px: 2.5, pb: 2.5, mt: 0.5 }}>
                  {leaveStats.map((l, i) => (
                    <Stack
                      key={l._id}
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{
                        py: 1,
                        px: 1.5,
                        borderRadius: 2,
                        bgcolor: alpha(LEAF_CLR[i % LEAF_CLR.length], isDark ? 0.1 : 0.06),
                        border: `1px solid ${alpha(LEAF_CLR[i % LEAF_CLR.length], 0.15)}`,
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: LEAF_CLR[i % LEAF_CLR.length],
                            flexShrink: 0,
                          }}
                        />
                        <Typography variant="body2" fontWeight={600}>
                          {l._id}
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Typography variant="caption" color="text.secondary">
                          {l.approved} ✓
                        </Typography>
                        <Typography
                          variant="caption"
                          fontWeight={800}
                          color={LEAF_CLR[i % LEAF_CLR.length]}
                        >
                          {l.total}
                        </Typography>
                      </Stack>
                    </Stack>
                  ))}
                </Stack>
              </>
            ) : (
              <Box sx={{ px: 2.5, pb: 2.5 }}>
                <EmptyChart
                  icon="material-symbols:event-note-outline"
                  message="No leave records found"
                  color={P.amber}
                />
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>

      {/* ══ Bottom Row ══ */}
      <Grid container spacing={2.5}>

        {/* Payroll Trend — Admin only */}
        {isAdmin && (
          <Grid size={{ xs: 12, lg: 7 }}>
            <Card>
              <ChartHeader
                title="Payroll Trend"
                caption={`${now.getFullYear()} — monthly net disbursement`}
                legend={[{ label: 'Disbursed', color: P.purple }]}
                right={
                  avgPayroll > 0 ? (
                    <Chip
                      label={`Avg PKR ${(avgPayroll / 1000).toFixed(1)}K`}
                      size="small"
                      sx={{
                        bgcolor: alpha(P.amber, 0.1),
                        color: P.amber,
                        fontWeight: 700,
                        border: `1px solid ${alpha(P.amber, 0.2)}`,
                        fontSize: '0.68rem',
                      }}
                    />
                  ) : undefined
                }
              />
              <Box sx={{ px: 2.5, pt: 2, pb: 1 }}>
                {loading ? (
                  <Skeleton variant="rounded" height={220} />
                ) : payrollStats.length > 0 ? (
                  <ReactECharts option={payrollChart} style={{ height: 220 }} />
                ) : (
                  <EmptyChart
                    icon="material-symbols:payments-outline"
                    message={`No payroll generated for ${now.getFullYear()}`}
                    color={P.purple}
                  />
                )}
              </Box>
            </Card>
          </Grid>
        )}

        {/* Workforce Snapshot */}
        <Grid size={{ xs: 12, lg: isAdmin ? 5 : 12 }}>
          <Card sx={{ height: '100%' }}>
            <ChartHeader title="Workforce Snapshot" caption="Today's real-time status" />

            <CardContent sx={{ pt: 2.5 }}>
              {loading ? (
                <Stack direction="row" justifyContent="space-around">
                  {[1, 2, 3].map((i) => (
                    <Box key={i} sx={{ textAlign: 'center' }}>
                      <Skeleton variant="circular" width={82} height={82} sx={{ mx: 'auto', mb: 1 }} />
                      <Skeleton width={60} height={14} sx={{ mx: 'auto' }} />
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Stack
                  direction="row"
                  justifyContent="space-around"
                  alignItems="flex-start"
                  sx={{ mb: 3 }}
                  flexWrap="wrap"
                  gap={2}
                >
                  <RingGauge
                    value={summary?.attendanceToday ?? 0}
                    total={summary?.totalEmployees ?? 0}
                    color={P.green}
                    label="Present"
                    icon="material-symbols:person-check-outline-rounded"
                  />
                  <RingGauge
                    value={summary?.absentToday ?? 0}
                    total={summary?.totalEmployees ?? 0}
                    color={P.red}
                    label="Absent"
                    icon="material-symbols:person-off-outline-rounded"
                  />
                  <Box sx={{ textAlign: 'center' }}>
                    <Box
                      sx={{
                        width: 82,
                        height: 82,
                        borderRadius: '50%',
                        bgcolor: alpha(P.amber, isDark ? 0.15 : 0.08),
                        border: `3px solid ${alpha(P.amber, 0.25)}`,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                      }}
                    >
                      <Typography variant="subtitle1" fontWeight={800} color={P.amber} sx={{ lineHeight: 1 }}>
                        {summary?.pendingLeaves ?? 0}
                      </Typography>
                      <Icon icon="material-symbols:pending-actions-outline-rounded" width={13} color={P.amber} style={{ opacity: 0.7 }} />
                    </Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mt: 0.75 }}>
                      Pending
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', color: P.amber, fontWeight: 700 }}>
                      Leaves
                    </Typography>
                  </Box>
                </Stack>
              )}

              {/* Leave type approved breakdown */}
              {!loading && leaveStats.length > 0 && (
                <>
                  <Divider sx={{ mb: 2 }} />
                  <Typography
                    variant="overline"
                    color="text.secondary"
                    sx={{ letterSpacing: 1, fontWeight: 600, fontSize: '0.65rem', display: 'block', mb: 1.5 }}
                  >
                    Approved Leaves by Type
                  </Typography>
                  <Grid container spacing={1.5}>
                    {leaveStats.map((l, i) => (
                      <Grid key={l._id} size={{ xs: 4 }}>
                        <Box
                          sx={{
                            textAlign: 'center',
                            py: 1.5,
                            px: 1,
                            borderRadius: 2.5,
                            bgcolor: alpha(LEAF_CLR[i % LEAF_CLR.length], isDark ? 0.12 : 0.07),
                            border: `1px solid ${alpha(LEAF_CLR[i % LEAF_CLR.length], 0.2)}`,
                            transition: 'transform 0.15s',
                            '&:hover': { transform: 'scale(1.03)' },
                          }}
                        >
                          <Typography
                            variant="h5"
                            fontWeight={800}
                            color={LEAF_CLR[i % LEAF_CLR.length]}
                            sx={{ lineHeight: 1.1 }}
                          >
                            {l.approved}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: 'block', fontWeight: 600, mt: 0.25, fontSize: '0.65rem' }}
                          >
                            {l._id}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </>
              )}

              {!loading && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Icon icon="material-symbols:group-outline-rounded" width={18} color={theme.palette.text.secondary} />
                      <Typography variant="body2" color="text.secondary">Total Workforce</Typography>
                    </Stack>
                    <Typography variant="subtitle1" fontWeight={800}>
                      {summary?.totalEmployees ?? 0}
                    </Typography>
                  </Stack>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardHome;
