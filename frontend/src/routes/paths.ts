export const rootPaths = { root: '/', authRoot: 'auth' };

const paths = {
  root: '/',
  dashboard: '/',
  employees: '/employees',
  addEmployee: '/employees/add',
  editEmployee: '/employees/:id/edit',
  viewEmployee: '/employees/:id',
  attendance: '/attendance',
  attendanceMonthly: '/attendance/monthly',
  leaves: '/leaves',
  payroll: '/payroll',
  advanceSalary: '/payroll/advance',
  salarySlip: '/payroll/slip/:id',
  reportAttendance: '/reports/attendance',
  reportLeave: '/reports/leave',
  reportPayroll: '/reports/payroll',
  reportAdvance: '/reports/advance',
  users: '/users',
  settings: '/settings',
  auditLogs: '/audit',
  biometric: '/biometric',
  profile: '/profile',
  login: '/auth/login',
  // legacy aurora paths (kept for backward compatibility)
  signup: '/auth/sign-up',
  account: '/account',
  starter: '/starter',
  documentation: 'https://github.com',
  notifications: '/notifications',
  404: '/404',
};

export default paths;
