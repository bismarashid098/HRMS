import { HTMLAttributeAnchorTarget } from 'react';
import { SxProps } from '@mui/material';
import paths from './paths';

export interface SubMenuItem {
  name: string;
  pathName: string;
  key?: string;
  selectionPrefix?: string;
  path?: string;
  target?: HTMLAttributeAnchorTarget;
  active?: boolean;
  icon?: string;
  iconSx?: SxProps;
  items?: SubMenuItem[];
}

export interface MenuItem {
  id: string;
  key?: string;
  subheader?: string;
  icon: string;
  target?: HTMLAttributeAnchorTarget;
  iconSx?: SxProps;
  items: SubMenuItem[];
}

const adminSitemap: MenuItem[] = [
  {
    id: 'main',
    icon: 'material-symbols:view-quilt-outline',
    subheader: 'Main',
    items: [
      {
        name: 'Dashboard',
        path: paths.dashboard,
        pathName: 'dashboard',
        icon: 'material-symbols:dashboard-outline-rounded',
        active: true,
      },
    ],
  },
  {
    id: 'hr',
    icon: 'material-symbols:people-outline-rounded',
    subheader: 'HR Management',
    items: [
      {
        name: 'Employees',
        path: paths.employees,
        pathName: 'employees',
        selectionPrefix: '/employees',
        icon: 'material-symbols:badge-outline-rounded',
        active: true,
      },
      {
        name: 'Attendance',
        pathName: 'attendance-group',
        icon: 'material-symbols:fingerprint-rounded',
        active: true,
        items: [
          { name: 'Daily', path: paths.attendance, pathName: 'attendance-daily', active: true },
          { name: 'Monthly Ledger', path: paths.attendanceMonthly, pathName: 'attendance-monthly', active: true },
        ],
      },
      {
        name: 'Leave Management',
        path: paths.leaves,
        pathName: 'leaves',
        icon: 'material-symbols:event-available-outline-rounded',
        active: true,
      },
      {
        name: 'Biometric Import',
        path: paths.biometric,
        pathName: 'biometric',
        icon: 'material-symbols:fingerprint-rounded',
        active: true,
      },
    ],
  },
  {
    id: 'org',
    icon: 'material-symbols:account-tree-outline-rounded',
    subheader: 'Organization',
    items: [
      {
        name: 'Organization',
        pathName: 'org-group',
        icon: 'material-symbols:corporate-fare-rounded',
        active: true,
        items: [
          { name: 'Departments', path: paths.departments, pathName: 'departments', active: true },
          { name: 'Designations', path: paths.designations, pathName: 'designations', active: true },
          { name: 'Branches', path: paths.branches, pathName: 'branches', active: true },
          { name: 'Shifts', path: paths.shifts, pathName: 'shifts', active: true },
          { name: 'Holidays', path: paths.holidays, pathName: 'holidays', active: true },
        ],
      },
    ],
  },
  {
    id: 'payroll',
    icon: 'material-symbols:payments-outline-rounded',
    subheader: 'Payroll',
    items: [
      {
        name: 'Payroll',
        path: paths.payroll,
        pathName: 'payroll',
        icon: 'material-symbols:account-balance-wallet-outline-rounded',
        active: true,
      },
      {
        name: 'Advance Salary',
        path: paths.advanceSalary,
        pathName: 'advance-salary',
        icon: 'material-symbols:currency-exchange-rounded',
        active: true,
      },
    ],
  },
  {
    id: 'recruitment',
    icon: 'material-symbols:person-search-outline-rounded',
    subheader: 'Recruitment',
    items: [
      {
        name: 'Recruitment',
        pathName: 'recruitment-group',
        icon: 'material-symbols:work-outline-rounded',
        active: true,
        items: [
          { name: 'Job Postings', path: paths.recruitmentJobs, pathName: 'recruitment-jobs', active: true },
          { name: 'Candidates', path: paths.recruitmentCandidates, pathName: 'recruitment-candidates', active: true },
        ],
      },
    ],
  },
  {
    id: 'people',
    icon: 'material-symbols:groups-outline-rounded',
    subheader: 'People',
    items: [
      {
        name: 'Performance Reviews',
        path: paths.performance,
        pathName: 'performance',
        icon: 'material-symbols:star-rate-outline-rounded',
        active: true,
      },
      {
        name: 'Training',
        path: paths.training,
        pathName: 'training',
        icon: 'material-symbols:school-outline-rounded',
        active: true,
      },
    ],
  },
  {
    id: 'operations',
    icon: 'material-symbols:inventory-2-outline-rounded',
    subheader: 'Operations',
    items: [
      {
        name: 'Asset Management',
        path: paths.assets,
        pathName: 'assets',
        icon: 'material-symbols:laptop-outline-rounded',
        active: true,
      },
      {
        name: 'Expense Claims',
        path: paths.expenses,
        pathName: 'expenses',
        icon: 'material-symbols:receipt-long-outline-rounded',
        active: true,
      },
      {
        name: 'Documents',
        path: paths.documents,
        pathName: 'documents',
        icon: 'material-symbols:folder-outline-rounded',
        active: true,
      },
    ],
  },
  {
    id: 'reports',
    icon: 'material-symbols:bar-chart-4-bars-rounded',
    subheader: 'Reports',
    items: [
      {
        name: 'Reports',
        pathName: 'reports-group',
        icon: 'material-symbols:assessment-outline-rounded',
        active: true,
        items: [
          { name: 'Attendance Report', path: paths.reportAttendance, pathName: 'report-attendance', active: true },
          { name: 'Leave Report', path: paths.reportLeave, pathName: 'report-leave', active: true },
          { name: 'Payroll Report', path: paths.reportPayroll, pathName: 'report-payroll', active: true },
          { name: 'Advance Report', path: paths.reportAdvance, pathName: 'report-advance', active: true },
        ],
      },
    ],
  },
  {
    id: 'admin',
    icon: 'material-symbols:admin-panel-settings-outline-rounded',
    subheader: 'Administration',
    items: [
      {
        name: 'User Management',
        path: paths.users,
        pathName: 'users',
        icon: 'material-symbols:manage-accounts-outline-rounded',
        active: true,
      },
      {
        name: 'Settings',
        path: paths.settings,
        pathName: 'settings',
        icon: 'material-symbols:settings-outline-rounded',
        active: true,
      },
      {
        name: 'Audit Logs',
        path: paths.auditLogs,
        pathName: 'audit-logs',
        icon: 'material-symbols:history-rounded',
        active: true,
      },
    ],
  },
];

const managerSitemap: MenuItem[] = [
  {
    id: 'main',
    icon: 'material-symbols:view-quilt-outline',
    subheader: 'Main',
    items: [
      {
        name: 'Dashboard',
        path: paths.dashboard,
        pathName: 'dashboard',
        icon: 'material-symbols:dashboard-outline-rounded',
        active: true,
      },
    ],
  },
  {
    id: 'hr',
    icon: 'material-symbols:people-outline-rounded',
    subheader: 'HR Management',
    items: [
      {
        name: 'Employees',
        path: paths.employees,
        pathName: 'employees',
        selectionPrefix: '/employees',
        icon: 'material-symbols:badge-outline-rounded',
        active: true,
      },
      {
        name: 'Attendance',
        pathName: 'attendance-group',
        icon: 'material-symbols:fingerprint-rounded',
        active: true,
        items: [
          { name: 'Daily', path: paths.attendance, pathName: 'attendance-daily', active: true },
          { name: 'Monthly Ledger', path: paths.attendanceMonthly, pathName: 'attendance-monthly', active: true },
        ],
      },
      {
        name: 'Leave Management',
        path: paths.leaves,
        pathName: 'leaves',
        icon: 'material-symbols:event-available-outline-rounded',
        active: true,
      },
    ],
  },
  {
    id: 'reports',
    icon: 'material-symbols:bar-chart-4-bars-rounded',
    subheader: 'Reports',
    items: [
      {
        name: 'Reports',
        pathName: 'reports-group',
        icon: 'material-symbols:assessment-outline-rounded',
        active: true,
        items: [
          { name: 'Attendance Report', path: paths.reportAttendance, pathName: 'report-attendance', active: true },
          { name: 'Leave Report', path: paths.reportLeave, pathName: 'report-leave', active: true },
        ],
      },
    ],
  },
];

export const getSitemap = (role?: string): MenuItem[] =>
  role === 'Admin' ? adminSitemap : managerSitemap;

export default adminSitemap;
