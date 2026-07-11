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

const DASHBOARD_SECTION: MenuItem = {
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
};

const NOTIFICATIONS_ITEM: SubMenuItem = {
  name: 'Notifications',
  path: paths.notifications,
  pathName: 'notifications',
  icon: 'material-symbols:notifications-outline-rounded',
  active: true,
};

export const getSitemap = (role?: string, permissions: string[] = []): MenuItem[] => {
  const isAdmin = role === 'Admin';
  const has = (mod: string) => isAdmin || permissions.includes(mod);

  const sections: MenuItem[] = [DASHBOARD_SECTION];

  // HR Management
  const hrItems: SubMenuItem[] = [];
  if (has('employees'))
    hrItems.push({
      name: 'Employees',
      path: paths.employees,
      pathName: 'employees',
      selectionPrefix: '/employees',
      icon: 'material-symbols:badge-outline-rounded',
      active: true,
    });
  if (has('attendance'))
    hrItems.push({
      name: 'Attendance',
      pathName: 'attendance-group',
      icon: 'material-symbols:fingerprint-rounded',
      active: true,
      items: [
        { name: 'Daily', path: paths.attendance, pathName: 'attendance-daily', active: true },
        { name: 'Monthly Ledger', path: paths.attendanceMonthly, pathName: 'attendance-monthly', active: true },
      ],
    });
  if (has('leaves'))
    hrItems.push({
      name: 'Leave Management',
      path: paths.leaves,
      pathName: 'leaves',
      icon: 'material-symbols:event-available-outline-rounded',
      active: true,
    });
  if (has('biometric'))
    hrItems.push({
      name: 'Biometric Import',
      path: paths.biometric,
      pathName: 'biometric',
      icon: 'material-symbols:fingerprint-rounded',
      active: true,
    });
  if (hrItems.length)
    sections.push({ id: 'hr', icon: 'material-symbols:people-outline-rounded', subheader: 'HR Management', items: hrItems });

  // Organization
  const orgSubItems: SubMenuItem[] = [];
  if (has('departments'))
    orgSubItems.push({ name: 'Departments', path: paths.departments, pathName: 'departments', active: true });
  if (has('designations'))
    orgSubItems.push({ name: 'Designations', path: paths.designations, pathName: 'designations', active: true });
  if (has('branches'))
    orgSubItems.push({ name: 'Branches', path: paths.branches, pathName: 'branches', active: true });
  if (has('shifts'))
    orgSubItems.push({ name: 'Shifts', path: paths.shifts, pathName: 'shifts', active: true });
  if (has('holidays'))
    orgSubItems.push({ name: 'Holidays', path: paths.holidays, pathName: 'holidays', active: true });
  if (orgSubItems.length)
    sections.push({
      id: 'org',
      icon: 'material-symbols:account-tree-outline-rounded',
      subheader: 'Organization',
      items: [{ name: 'Organization', pathName: 'org-group', icon: 'material-symbols:corporate-fare-rounded', active: true, items: orgSubItems }],
    });

  // Payroll
  const payrollItems: SubMenuItem[] = [];
  if (has('payroll'))
    payrollItems.push({
      name: 'Payroll',
      path: paths.payroll,
      pathName: 'payroll',
      icon: 'material-symbols:account-balance-wallet-outline-rounded',
      active: true,
    });
  if (has('advance-salary'))
    payrollItems.push({
      name: 'Advance Salary',
      path: paths.advanceSalary,
      pathName: 'advance-salary',
      icon: 'material-symbols:currency-exchange-rounded',
      active: true,
    });
  if (payrollItems.length)
    sections.push({ id: 'payroll', icon: 'material-symbols:payments-outline-rounded', subheader: 'Payroll', items: payrollItems });

  // Recruitment
  if (has('recruitment'))
    sections.push({
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
    });

  // People
  const peopleItems: SubMenuItem[] = [];
  if (has('performance'))
    peopleItems.push({
      name: 'Performance Reviews',
      path: paths.performance,
      pathName: 'performance',
      icon: 'material-symbols:star-rate-outline-rounded',
      active: true,
    });
  if (has('training'))
    peopleItems.push({
      name: 'Training',
      path: paths.training,
      pathName: 'training',
      icon: 'material-symbols:school-outline-rounded',
      active: true,
    });
  if (peopleItems.length)
    sections.push({ id: 'people', icon: 'material-symbols:groups-outline-rounded', subheader: 'People', items: peopleItems });

  // Operations
  const opsItems: SubMenuItem[] = [];
  if (has('assets'))
    opsItems.push({
      name: 'Asset Management',
      path: paths.assets,
      pathName: 'assets',
      icon: 'material-symbols:laptop-outline-rounded',
      active: true,
    });
  if (has('expenses'))
    opsItems.push({
      name: 'Expense Claims',
      path: paths.expenses,
      pathName: 'expenses',
      icon: 'material-symbols:receipt-long-outline-rounded',
      active: true,
    });
  if (has('documents'))
    opsItems.push({
      name: 'Documents',
      path: paths.documents,
      pathName: 'documents',
      icon: 'material-symbols:folder-outline-rounded',
      active: true,
    });
  if (opsItems.length)
    sections.push({ id: 'operations', icon: 'material-symbols:inventory-2-outline-rounded', subheader: 'Operations', items: opsItems });

  // Reports
  if (has('reports'))
    sections.push({
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
    });

  // Administration (Admin only)
  if (isAdmin)
    sections.push({
      id: 'admin',
      icon: 'material-symbols:admin-panel-settings-outline-rounded',
      subheader: 'Administration',
      items: [
        { name: 'User Management', path: paths.users, pathName: 'users', icon: 'material-symbols:manage-accounts-outline-rounded', active: true },
        { name: 'Settings', path: paths.settings, pathName: 'settings', icon: 'material-symbols:settings-outline-rounded', active: true },
        { name: 'Audit Logs', path: paths.auditLogs, pathName: 'audit-logs', icon: 'material-symbols:history-rounded', active: true },
      ],
    });

  // Notifications (always visible for all authenticated users)
  sections.push({
    id: 'notifications',
    icon: 'material-symbols:notifications-outline-rounded',
    subheader: 'General',
    items: [NOTIFICATIONS_ITEM],
  });

  return sections;
};

export default getSitemap;
