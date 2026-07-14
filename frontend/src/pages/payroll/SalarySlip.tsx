import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Box, Button, Chip, CircularProgress, Divider, Stack, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { alpha, useTheme } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import api from 'api/axios';
import { useCurrency } from 'context/SettingsContext';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

interface Payroll {
  _id: string;
  month: number;
  year: number;
  status: string;
  basicSalary: number;
  allowance: number;
  leaveDeduction: number;
  advanceDeduction: number;
  extraOffDeduction: number;
  taxDeduction: number;
  eobiDeduction: number;
  pfDeduction: number;
  deductions: number;
  extraOffDays: number;
  workingDays: number;
  presentDays: number;
  netSalary: number;
  employee: {
    name: string;
    employeeId: string;
    department: string;
    designation: string;
  };
}

const Row = ({
  label,
  value,
  isDeduction,
  bold,
  color,
}: {
  label: string;
  value: number;
  isDeduction?: boolean;
  bold?: boolean;
  color?: string;
}) => {
  const { code } = useCurrency();
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 0.9 }}>
      <Typography
        variant={bold ? 'subtitle1' : 'body2'}
        fontWeight={bold ? 700 : 400}
        color={color ?? 'text.primary'}
      >
        {label}
      </Typography>
      <Typography
        variant={bold ? 'subtitle1' : 'body2'}
        fontWeight={bold ? 700 : 500}
        color={color ?? (isDeduction ? 'error.main' : 'text.primary')}
      >
        {isDeduction && value > 0 ? '− ' : ''}
        {code} {Math.abs(value).toLocaleString('en-PK', { minimumFractionDigits: 0 })}
      </Typography>
    </Stack>
  );
};

const SalarySlip = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { code: currCode } = useCurrency();
  const slipRef = useRef<HTMLDivElement>(null);
  const [payroll, setPayroll] = useState<Payroll | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/payroll/${id}`)
      .then((res) => setPayroll(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );

  if (!payroll)
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Icon
          icon="material-symbols:error-outline-rounded"
          width={48}
          color={theme.palette.error.main}
        />
        <Typography variant="h6" sx={{ mt: 1 }}>
          Payroll record not found
        </Typography>
        <Button sx={{ mt: 2 }} onClick={() => navigate('/payroll')}>
          Go back
        </Button>
      </Box>
    );

  const grossSalary = (payroll.basicSalary || 0) + (payroll.allowance || 0);
  const totalDeductions = payroll.deductions || 0;
  const net = payroll.netSalary;

  const monthName = MONTHS[(payroll.month || 1) - 1];
  const isDark = theme.palette.mode === 'dark';

  return (
    <>
      {/* ── Print styles ── */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #salary-slip-print, #salary-slip-print * { visibility: visible; }
          #salary-slip-print { position: fixed; inset: 0; background: white !important; padding: 32px; }
          .no-print { display: none !important; }
        }
      `}</style>

      <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 780, mx: 'auto' }}>
        {/* ── Action buttons ── */}
        <Stack direction="row" spacing={1.5} sx={{ mb: 3 }} className="no-print">
          <Button
            variant="outlined"
            startIcon={<Icon icon="material-symbols:arrow-back-rounded" />}
            onClick={() => navigate('/payroll')}
          >
            Back
          </Button>
          <Button
            variant="contained"
            startIcon={<Icon icon="material-symbols:print-rounded" />}
            onClick={() => window.print()}
          >
            Print Slip
          </Button>
        </Stack>

        {/* ── Slip Card ── */}
        <Box
          id="salary-slip-print"
          ref={slipRef}
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper',
          }}
        >
          {/* Header band */}
          <Box
            sx={{
              px: 4,
              py: 3,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Box>
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 0.5 }}>
                <Icon icon="material-symbols:business-center-outline-rounded" width={28} />
                <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: '-0.3px' }}>
                  WorkSphere HRMS
                </Typography>
              </Stack>
              <Typography variant="body2" sx={{ opacity: 0.85 }}>
                Salary Slip — {monthName} {payroll.year}
              </Typography>
            </Box>
            <Chip
              label={payroll.status}
              sx={{
                bgcolor:
                  payroll.status === 'Approved' ? alpha('#10b981', 0.25) : alpha('#fff', 0.18),
                color: '#fff',
                fontWeight: 700,
                border: '1px solid rgba(255,255,255,0.3)',
              }}
            />
          </Box>

          <Box sx={{ px: { xs: 2.5, sm: 4 }, py: 3 }}>
            {/* ── Employee Info ── */}
            <Box
              sx={{
                p: 2.5,
                mb: 3,
                borderRadius: 2,
                bgcolor: isDark ? alpha('#fff', 0.04) : alpha('#000', 0.025),
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ fontWeight: 700, letterSpacing: 1, display: 'block', mb: 1.5 }}
              >
                Employee Details
              </Typography>
              <Grid container spacing={2}>
                {[
                  { label: 'Full Name', value: payroll.employee?.name || '—' },
                  { label: 'Employee ID', value: payroll.employee?.employeeId || '—' },
                  { label: 'Department', value: payroll.employee?.department || '—' },
                  { label: 'Designation', value: payroll.employee?.designation || '—' },
                  { label: 'Pay Period', value: `${monthName} ${payroll.year}` },
                  { label: 'Payment Status', value: payroll.status },
                ].map(({ label, value }) => (
                  <Grid key={label} size={{ xs: 6, sm: 4 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      {label}
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {value}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* ── Attendance Summary ── */}
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ fontWeight: 700, letterSpacing: 1, display: 'block', mb: 1.5 }}
              >
                Attendance Summary
              </Typography>
              <Grid container spacing={1.5}>
                {[
                  {
                    label: 'Working Days',
                    value: payroll.workingDays ?? 0,
                    color: theme.palette.primary.main,
                  },
                  {
                    label: 'Present Days',
                    value: payroll.presentDays ?? 0,
                    color: theme.palette.success.main,
                  },
                  {
                    label: 'Extra Off Days',
                    value: payroll.extraOffDays ?? 0,
                    color: theme.palette.error.main,
                  },
                ].map(({ label, value, color }) => (
                  <Grid key={label} size={{ xs: 4 }}>
                    <Box
                      sx={{
                        textAlign: 'center',
                        py: 1.5,
                        px: 1,
                        borderRadius: 2,
                        bgcolor: alpha(color, isDark ? 0.12 : 0.07),
                        border: `1px solid ${alpha(color, 0.2)}`,
                      }}
                    >
                      <Typography
                        variant="h5"
                        fontWeight={800}
                        color={color}
                        sx={{ lineHeight: 1.1 }}
                      >
                        {value}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block', mt: 0.25 }}
                      >
                        {label}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* ── Earnings & Deductions ── */}
            <Grid container spacing={3}>
              {/* Earnings */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.success.main, 0.25)}`,
                    bgcolor: alpha(theme.palette.success.main, isDark ? 0.07 : 0.03),
                    height: '100%',
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                    <Icon
                      icon="material-symbols:add-circle-outline-rounded"
                      width={18}
                      color={theme.palette.success.main}
                    />
                    <Typography
                      variant="overline"
                      fontWeight={700}
                      letterSpacing={1}
                      color="success.main"
                    >
                      Earnings
                    </Typography>
                  </Stack>
                  <Row label="Basic Salary" value={payroll.basicSalary || 0} />
                  {(payroll.allowance || 0) > 0 && (
                    <Row label="Allowance" value={payroll.allowance || 0} />
                  )}
                  <Divider sx={{ my: 1 }} />
                  <Row label="Gross Salary" value={grossSalary} bold color="success.main" />
                </Box>
              </Grid>

              {/* Deductions */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.error.main, 0.25)}`,
                    bgcolor: alpha(theme.palette.error.main, isDark ? 0.07 : 0.03),
                    height: '100%',
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                    <Icon
                      icon="material-symbols:remove-circle-outline-rounded"
                      width={18}
                      color={theme.palette.error.main}
                    />
                    <Typography
                      variant="overline"
                      fontWeight={700}
                      letterSpacing={1}
                      color="error.main"
                    >
                      Deductions
                    </Typography>
                  </Stack>
                  {(payroll.leaveDeduction || 0) > 0 && (
                    <Row label="Unpaid Leave" value={payroll.leaveDeduction || 0} isDeduction />
                  )}
                  {(payroll.extraOffDeduction || 0) > 0 && (
                    <Row
                      label={`Extra Off (${payroll.extraOffDays ?? 0} days)`}
                      value={payroll.extraOffDeduction || 0}
                      isDeduction
                    />
                  )}
                  {(payroll.advanceDeduction || 0) > 0 && (
                    <Row
                      label="Advance Recovery"
                      value={payroll.advanceDeduction || 0}
                      isDeduction
                    />
                  )}
                  {(payroll.taxDeduction || 0) > 0 && (
                    <Row label="Income Tax" value={payroll.taxDeduction || 0} isDeduction />
                  )}
                  {(payroll.eobiDeduction || 0) > 0 && (
                    <Row label="EOBI" value={payroll.eobiDeduction || 0} isDeduction />
                  )}
                  {(payroll.pfDeduction || 0) > 0 && (
                    <Row label="Provident Fund" value={payroll.pfDeduction || 0} isDeduction />
                  )}
                  {totalDeductions === 0 && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ py: 1, fontStyle: 'italic' }}
                    >
                      No deductions this month
                    </Typography>
                  )}
                  <Divider sx={{ my: 1 }} />
                  <Row label="Total Deductions" value={totalDeductions} bold color="error.main" />
                </Box>
              </Grid>
            </Grid>

            {/* ── Net Salary ── */}
            <Box
              sx={{
                mt: 3,
                px: 3,
                py: 2.5,
                borderRadius: 2.5,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 1,
              }}
            >
              <Box>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)', mb: 0.25 }}>
                  Net Take-Home Salary
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                  Gross {currCode} {grossSalary.toLocaleString()} − Deductions {currCode}{' '}
                  {totalDeductions.toLocaleString()}
                </Typography>
              </Box>
              <Typography
                variant="h4"
                fontWeight={800}
                sx={{ color: '#fff', letterSpacing: '-0.5px' }}
              >
                {currCode} {net.toLocaleString('en-PK')}
              </Typography>
            </Box>

            {/* ── Footer ── */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              sx={{ mt: 3, pt: 2, borderTop: `1px dashed ${theme.palette.divider}` }}
              gap={1}
            >
              <Typography variant="caption" color="text.disabled">
                Generated on{' '}
                {new Date().toLocaleDateString('en-PK', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </Typography>
              <Typography variant="caption" color="text.disabled">
                This is a computer-generated slip and requires no signature.
              </Typography>
            </Stack>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default SalarySlip;
