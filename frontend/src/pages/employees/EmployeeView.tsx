import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Typography,
  CircularProgress,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { Icon } from '@iconify/react';
import api from 'api/axios';
import { useAuth } from 'context/AuthContext';

const InfoRow = ({ label, value }: { label: string; value: string | number }) => (
  <Box sx={{ display: 'flex', py: 1 }}>
    <Typography variant="body2" color="text.secondary" sx={{ width: 160, flexShrink: 0 }}>
      {label}
    </Typography>
    <Typography variant="body2" fontWeight="medium">
      {value || '—'}
    </Typography>
  </Box>
);

const EmployeeView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const isAdmin = user?.role === 'Admin';

  useEffect(() => {
    api
      .get(`/employees/${id}`)
      .then((res) => setEmployee(res.data.employee || res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  if (!employee)
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Employee not found</Typography>
      </Box>
    );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold">
            {employee.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {employee.designation} · {employee.department}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Icon icon="material-symbols:arrow-back-rounded" />}
            onClick={() => navigate('/employees')}
          >
            Back
          </Button>
          {isAdmin && (
            <Button
              variant="contained"
              startIcon={<Icon icon="material-symbols:edit-outline-rounded" />}
              onClick={() => navigate(`/employees/${id}/edit`)}
            >
              Edit
            </Button>
          )}
        </Box>
      </Box>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="h5" color="white">
                {employee.name?.[0]?.toUpperCase()}
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6">{employee.name}</Typography>
              <Chip
                label={employee.employmentStatus}
                size="small"
                color={employee.employmentStatus === 'Active' ? 'success' : 'error'}
              />
            </Box>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                Personal Info
              </Typography>
              <InfoRow label="Employee ID" value={employee.employeeId} />
              <InfoRow label="Email" value={employee.email} />
              <InfoRow label="Phone" value={employee.phone} />
              <InfoRow label="Gender" value={employee.gender} />
              <InfoRow label="Religion" value={employee.religion} />
              <InfoRow label="Address" value={employee.address} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                Employment Info
              </Typography>
              <InfoRow label="Department" value={employee.department} />
              <InfoRow label="Designation" value={employee.designation} />
              <InfoRow label="Joining Date" value={employee.joiningDate?.slice(0, 10)} />
              <InfoRow label="Duty Start" value={employee.dutyStartTime} />
              <InfoRow label="Monthly Off Days" value={employee.monthlyOffDays} />
              <InfoRow label="Biometric ID" value={employee.biometricId} />
              {isAdmin && (
                <InfoRow label="Salary" value={`PKR ${employee.salary?.toLocaleString()}`} />
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default EmployeeView;
