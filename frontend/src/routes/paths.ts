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
  // Organization Structure
  departments: '/org/departments',
  designations: '/org/designations',
  branches: '/org/branches',
  shifts: '/org/shifts',
  holidays: '/org/holidays',
  // Recruitment
  recruitmentJobs: '/recruitment/jobs',
  recruitmentCandidates: '/recruitment/candidates',
  // People Management
  performance: '/performance',
  training: '/training',
  // Operations
  assets: '/assets',
  expenses: '/expenses',
  documents: '/documents',
  notifications: '/notifications',
  // Auth
  login: '/auth/login',
  forgotPassword: '/auth/forgot-password',
  // legacy
  signup: '/auth/sign-up',
  account: '/account',
  starter: '/starter',
  documentation: 'https://github.com',
  404: '/404',
};

export default paths;
