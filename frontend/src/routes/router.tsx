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

export const SuspenseOutlet = () => {
  const location = useLocation();
  return (
    <Suspense key={location.pathname} fallback={<PageLoader />}>
      <Outlet />
    </Suspense>
  );
};

export const routes: RouteObject[] = [
  {
    element: <App />,
    children: [
      {
        path: '/',
        element: (
          <ProtectedRoute>
            <MainLayout>
              <SuspenseOutlet />
            </MainLayout>
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <DashboardHome /> },
          { path: 'employees', element: <EmployeeList /> },
          {
            path: 'employees/add',
            element: (
              <ProtectedRoute allowedRoles={['Admin']}>
                <EmployeeForm />
              </ProtectedRoute>
            ),
          },
          { path: 'employees/:id', element: <EmployeeView /> },
          {
            path: 'employees/:id/edit',
            element: (
              <ProtectedRoute allowedRoles={['Admin']}>
                <EmployeeForm />
              </ProtectedRoute>
            ),
          },
          { path: 'attendance', element: <AttendanceDaily /> },
          { path: 'attendance/monthly', element: <AttendanceMonthly /> },
          { path: 'leaves', element: <LeaveManagement /> },
          {
            path: 'payroll',
            element: (
              <ProtectedRoute allowedRoles={['Admin']}>
                <PayrollPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'payroll/advance',
            element: (
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdvanceSalary />
              </ProtectedRoute>
            ),
          },
          {
            path: 'payroll/slip/:id',
            element: (
              <ProtectedRoute allowedRoles={['Admin']}>
                <SalarySlip />
              </ProtectedRoute>
            ),
          },
          { path: 'reports/attendance', element: <AttendanceReport /> },
          { path: 'reports/leave', element: <LeaveReport /> },
          {
            path: 'reports/payroll',
            element: (
              <ProtectedRoute allowedRoles={['Admin']}>
                <PayrollReport />
              </ProtectedRoute>
            ),
          },
          {
            path: 'reports/advance',
            element: (
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdvanceReport />
              </ProtectedRoute>
            ),
          },
          {
            path: 'users',
            element: (
              <ProtectedRoute allowedRoles={['Admin']}>
                <UserManagement />
              </ProtectedRoute>
            ),
          },
          {
            path: 'settings',
            element: (
              <ProtectedRoute allowedRoles={['Admin']}>
                <Settings />
              </ProtectedRoute>
            ),
          },
          {
            path: 'audit',
            element: (
              <ProtectedRoute allowedRoles={['Admin']}>
                <AuditLogs />
              </ProtectedRoute>
            ),
          },
          {
            path: 'biometric',
            element: (
              <ProtectedRoute allowedRoles={['Admin']}>
                <BiometricImport />
              </ProtectedRoute>
            ),
          },
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
