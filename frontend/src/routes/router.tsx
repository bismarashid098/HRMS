import { Suspense, lazy } from 'react';
import { Outlet, RouteObject, createBrowserRouter, useLocation } from 'react-router';
import App from 'App';
import AuthLayout from 'layouts/auth-layout';
import MainLayout from 'layouts/main-layout';
import Page404 from 'pages/errors/Page404';
import PageLoader from 'components/loading/PageLoader';
import ProtectedRoute from './ProtectedRoute';
import paths, { rootPaths } from './paths';

const Login = lazy(() => import('pages/authentication/Login'));
const DashboardHome = lazy(() => import('pages/dashboard/DashboardHome'));
const EmployeeList = lazy(() => import('pages/employees/EmployeeList'));
const EmployeeForm = lazy(() => import('pages/employees/EmployeeForm'));
const EmployeeView = lazy(() => import('pages/employees/EmployeeView'));
const AttendanceDaily = lazy(() => import('pages/attendance/AttendanceDaily'));
const AttendanceMonthly = lazy(() => import('pages/attendance/AttendanceMonthly'));
const LeaveManagement = lazy(() => import('pages/leaves/LeaveManagement'));
const PayrollPage = lazy(() => import('pages/payroll/PayrollPage'));
const AdvanceSalary = lazy(() => import('pages/payroll/AdvanceSalary'));
const SalarySlip = lazy(() => import('pages/payroll/SalarySlip'));
const AttendanceReport = lazy(() => import('pages/reports/AttendanceReport'));
const LeaveReport = lazy(() => import('pages/reports/LeaveReport'));
const PayrollReport = lazy(() => import('pages/reports/PayrollReport'));
const AdvanceReport = lazy(() => import('pages/reports/AdvanceReport'));
const UserManagement = lazy(() => import('pages/users/UserManagement'));
const Settings = lazy(() => import('pages/settings/Settings'));
const AuditLogs = lazy(() => import('pages/audit/AuditLogs'));
const ProfilePage = lazy(() => import('pages/profile/ProfilePage'));
const BiometricImport = lazy(() => import('pages/biometric/BiometricImport'));
// Org Structure
const Departments = lazy(() => import('pages/org/Departments'));
const Designations = lazy(() => import('pages/org/Designations'));
const Branches = lazy(() => import('pages/org/Branches'));
const Shifts = lazy(() => import('pages/org/Shifts'));
const Holidays = lazy(() => import('pages/org/Holidays'));
// Recruitment
const JobPostings = lazy(() => import('pages/recruitment/JobPostings'));
const Candidates = lazy(() => import('pages/recruitment/Candidates'));
// People
const PerformanceReviews = lazy(() => import('pages/performance/PerformanceReviews'));
const TrainingPage = lazy(() => import('pages/training/TrainingPage'));
// Operations
const AssetManagement = lazy(() => import('pages/assets/AssetManagement'));
const ExpenseClaims = lazy(() => import('pages/expenses/ExpenseClaims'));
const DocumentsPage = lazy(() => import('pages/documents/DocumentsPage'));
const NotificationsPage = lazy(() => import('pages/notifications/NotificationsPage'));

export const SuspenseOutlet = () => {
  const location = useLocation();
  return (
    <Suspense key={location.pathname} fallback={<PageLoader />}>
      <Outlet />
    </Suspense>
  );
};

const AdminOnly = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute allowedRoles={['Admin']}>{children}</ProtectedRoute>
);

const WithPermission = ({ perm, children }: { perm: string; children: React.ReactNode }) => (
  <ProtectedRoute requiredPermission={perm}>{children}</ProtectedRoute>
);

export const routes: RouteObject[] = [
  {
    element: <App />,
    children: [
      {
        path: '/',
        element: (
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <DashboardHome /> },

          // Employees
          { path: 'employees', element: <WithPermission perm="employees"><EmployeeList /></WithPermission> },
          { path: 'employees/add', element: <WithPermission perm="employees"><EmployeeForm /></WithPermission> },
          { path: 'employees/:id', element: <WithPermission perm="employees"><EmployeeView /></WithPermission> },
          { path: 'employees/:id/edit', element: <WithPermission perm="employees"><EmployeeForm /></WithPermission> },

          // Attendance
          { path: 'attendance', element: <WithPermission perm="attendance"><AttendanceDaily /></WithPermission> },
          { path: 'attendance/monthly', element: <WithPermission perm="attendance"><AttendanceMonthly /></WithPermission> },

          // Leaves
          { path: 'leaves', element: <WithPermission perm="leaves"><LeaveManagement /></WithPermission> },

          // Payroll
          { path: 'payroll', element: <WithPermission perm="payroll"><PayrollPage /></WithPermission> },
          { path: 'payroll/advance', element: <WithPermission perm="advance-salary"><AdvanceSalary /></WithPermission> },
          { path: 'payroll/slip/:id', element: <WithPermission perm="payroll"><SalarySlip /></WithPermission> },

          // Reports
          { path: 'reports/attendance', element: <WithPermission perm="reports"><AttendanceReport /></WithPermission> },
          { path: 'reports/leave', element: <WithPermission perm="reports"><LeaveReport /></WithPermission> },
          { path: 'reports/payroll', element: <WithPermission perm="reports"><PayrollReport /></WithPermission> },
          { path: 'reports/advance', element: <WithPermission perm="reports"><AdvanceReport /></WithPermission> },

          // Administration (Admin only)
          { path: 'users', element: <AdminOnly><UserManagement /></AdminOnly> },
          { path: 'settings', element: <AdminOnly><Settings /></AdminOnly> },
          { path: 'audit', element: <AdminOnly><AuditLogs /></AdminOnly> },

          // Biometric
          { path: 'biometric', element: <WithPermission perm="biometric"><BiometricImport /></WithPermission> },

          // Organization Structure
          { path: 'org/departments', element: <WithPermission perm="departments"><Departments /></WithPermission> },
          { path: 'org/designations', element: <WithPermission perm="designations"><Designations /></WithPermission> },
          { path: 'org/branches', element: <WithPermission perm="branches"><Branches /></WithPermission> },
          { path: 'org/shifts', element: <WithPermission perm="shifts"><Shifts /></WithPermission> },
          { path: 'org/holidays', element: <WithPermission perm="holidays"><Holidays /></WithPermission> },

          // Recruitment
          { path: 'recruitment/jobs', element: <WithPermission perm="recruitment"><JobPostings /></WithPermission> },
          { path: 'recruitment/candidates', element: <WithPermission perm="recruitment"><Candidates /></WithPermission> },

          // People
          { path: 'performance', element: <WithPermission perm="performance"><PerformanceReviews /></WithPermission> },
          { path: 'training', element: <WithPermission perm="training"><TrainingPage /></WithPermission> },

          // Operations
          { path: 'assets', element: <WithPermission perm="assets"><AssetManagement /></WithPermission> },
          { path: 'expenses', element: <WithPermission perm="expenses"><ExpenseClaims /></WithPermission> },
          { path: 'documents', element: <WithPermission perm="documents"><DocumentsPage /></WithPermission> },

          // Always accessible
          { path: 'notifications', element: <NotificationsPage /> },
          { path: 'profile', element: <ProfilePage /> },
        ],
      },
      {
        path: rootPaths.authRoot,
        element: (
          <AuthLayout>
            <SuspenseOutlet />
          </AuthLayout>
        ),
        children: [{ path: 'login', element: <Login /> }],
      },
      { path: paths[404], element: <Page404 /> },
      { path: '*', element: <Page404 /> },
    ],
  },
];

const router = createBrowserRouter(routes, {
  basename: import.meta.env.MODE === 'production' ? import.meta.env.VITE_BASENAME : '/',
});

export default router;
