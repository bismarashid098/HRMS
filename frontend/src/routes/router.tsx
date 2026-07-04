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
          { path: 'employees', element: <EmployeeList /> },
          {
            path: 'employees/add',
            element: (
              <AdminOnly>
                <EmployeeForm />
              </AdminOnly>
            ),
          },
          { path: 'employees/:id', element: <EmployeeView /> },
          {
            path: 'employees/:id/edit',
            element: (
              <AdminOnly>
                <EmployeeForm />
              </AdminOnly>
            ),
          },

          // Attendance
          { path: 'attendance', element: <AttendanceDaily /> },
          { path: 'attendance/monthly', element: <AttendanceMonthly /> },

          // Leaves
          { path: 'leaves', element: <LeaveManagement /> },

          // Payroll (Admin only)
          {
            path: 'payroll',
            element: (
              <AdminOnly>
                <PayrollPage />
              </AdminOnly>
            ),
          },
          {
            path: 'payroll/advance',
            element: (
              <AdminOnly>
                <AdvanceSalary />
              </AdminOnly>
            ),
          },
          {
            path: 'payroll/slip/:id',
            element: (
              <AdminOnly>
                <SalarySlip />
              </AdminOnly>
            ),
          },

          // Reports
          { path: 'reports/attendance', element: <AttendanceReport /> },
          { path: 'reports/leave', element: <LeaveReport /> },
          {
            path: 'reports/payroll',
            element: (
              <AdminOnly>
                <PayrollReport />
              </AdminOnly>
            ),
          },
          {
            path: 'reports/advance',
            element: (
              <AdminOnly>
                <AdvanceReport />
              </AdminOnly>
            ),
          },

          // Administration (Admin only)
          {
            path: 'users',
            element: (
              <AdminOnly>
                <UserManagement />
              </AdminOnly>
            ),
          },
          {
            path: 'settings',
            element: (
              <AdminOnly>
                <Settings />
              </AdminOnly>
            ),
          },
          {
            path: 'audit',
            element: (
              <AdminOnly>
                <AuditLogs />
              </AdminOnly>
            ),
          },
          {
            path: 'biometric',
            element: (
              <AdminOnly>
                <BiometricImport />
              </AdminOnly>
            ),
          },

          // Organization Structure (Admin only)
          {
            path: 'org/departments',
            element: (
              <AdminOnly>
                <Departments />
              </AdminOnly>
            ),
          },
          {
            path: 'org/designations',
            element: (
              <AdminOnly>
                <Designations />
              </AdminOnly>
            ),
          },
          {
            path: 'org/branches',
            element: (
              <AdminOnly>
                <Branches />
              </AdminOnly>
            ),
          },
          {
            path: 'org/shifts',
            element: (
              <AdminOnly>
                <Shifts />
              </AdminOnly>
            ),
          },
          {
            path: 'org/holidays',
            element: (
              <AdminOnly>
                <Holidays />
              </AdminOnly>
            ),
          },

          // Recruitment (Admin only)
          {
            path: 'recruitment/jobs',
            element: (
              <AdminOnly>
                <JobPostings />
              </AdminOnly>
            ),
          },
          {
            path: 'recruitment/candidates',
            element: (
              <AdminOnly>
                <Candidates />
              </AdminOnly>
            ),
          },

          // People (Admin only)
          {
            path: 'performance',
            element: (
              <AdminOnly>
                <PerformanceReviews />
              </AdminOnly>
            ),
          },
          {
            path: 'training',
            element: (
              <AdminOnly>
                <TrainingPage />
              </AdminOnly>
            ),
          },

          // Operations (Admin only)
          {
            path: 'assets',
            element: (
              <AdminOnly>
                <AssetManagement />
              </AdminOnly>
            ),
          },
          {
            path: 'expenses',
            element: (
              <AdminOnly>
                <ExpenseClaims />
              </AdminOnly>
            ),
          },
          {
            path: 'documents',
            element: (
              <AdminOnly>
                <DocumentsPage />
              </AdminOnly>
            ),
          },

          // Notifications (all authenticated)
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
