import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  Box,
  Button,
  Card,
  CardContent,
  MenuItem,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import api from 'api/axios';

const depts = ['HR', 'IT', 'Finance', 'Operations', 'Sales', 'Marketing', 'Admin'];
const genders = ['Male', 'Female', 'Other'];
const statuses = ['Active', 'Resigned', 'Terminated'];

const emptyForm = {
  name: '',
  employeeId: '',
  department: '',
  designation: '',
  email: '',
  phone: '',
  gender: 'Male',
  salary: '',
  joiningDate: '',
  dutyStartTime: '09:00',
  monthlyOffDays: '8',
  religion: '',
  address: '',
  biometricId: '',
  employmentStatus: 'Active',
};

const EmployeeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      api
        .get(`/employees/${id}`)
        .then((res) => {
          const e = res.data.employee || res.data;
          setForm({
            name: e.name || '',
            employeeId: e.employeeId || '',
            department: e.department || '',
            designation: e.designation || '',
            email: e.email || '',
            phone: e.phone || '',
            gender: e.gender || 'Male',
            salary: String(e.salary || ''),
            joiningDate: e.joiningDate?.slice(0, 10) || '',
            dutyStartTime: e.dutyStartTime || '09:00',
            monthlyOffDays: String(e.monthlyOffDays || '8'),
            religion: e.religion || '',
            address: e.address || '',
            biometricId: e.biometricId || '',
            employmentStatus: e.employmentStatus || 'Active',
          });
        })
        .catch(() => setError('Failed to load employee data. Please go back and try again.'));
    }
  }, [id]);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        ...form,
        salary: Number(form.salary),
        monthlyOffDays: Number(form.monthlyOffDays),
      };
      if (isEdit) {
        await api.put(`/employees/${id}`, payload);
      } else {
        await api.post('/employees', payload);
      }
      navigate('/employees');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save employee');
    } finally {
      setLoading(false);
    }
  };

  const textFields: [string, string, string][] = [
    ['name', 'Name', 'text'],
    ['employeeId', 'Employee ID', 'text'],
    ['designation', 'Designation', 'text'],
    ['email', 'Email', 'text'],
    ['phone', 'Phone', 'text'],
    ['salary', 'Salary', 'number'],
    ['joiningDate', 'Joining Date', 'date'],
    ['dutyStartTime', 'Duty Start Time', 'text'],
    ['monthlyOffDays', 'Monthly Off Days', 'number'],
    ['religion', 'Religion', 'text'],
    ['biometricId', 'Biometric ID', 'text'],
    ['address', 'Address', 'text'],
  ];

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
        {isEdit ? 'Edit Employee' : 'Add Employee'}
      </Typography>
      <Card>
        <CardContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              {textFields.map(([field, label, type]) => (
                <Grid key={field} size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label={label}
                    value={(form as any)[field]}
                    onChange={handleChange(field)}
                    type={type}
                    InputLabelProps={type === 'date' ? { shrink: true } : undefined}
                  />
                </Grid>
              ))}
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  select
                  label="Department"
                  value={form.department}
                  onChange={handleChange('department')}
                >
                  {depts.map((d) => (
                    <MenuItem key={d} value={d}>
                      {d}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  select
                  label="Gender"
                  value={form.gender}
                  onChange={handleChange('gender')}
                >
                  {genders.map((g) => (
                    <MenuItem key={g} value={g}>
                      {g}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  select
                  label="Employment Status"
                  value={form.employmentStatus}
                  onChange={handleChange('employmentStatus')}
                >
                  {statuses.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={12} sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 1 }}>
                <Button variant="outlined" onClick={() => navigate('/employees')}>
                  Cancel
                </Button>
                <Button type="submit" variant="contained" disabled={loading}>
                  {loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default EmployeeForm;
