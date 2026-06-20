import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/auth/Login";
import Profile from "./pages/auth/Profile";
import Dashboard from "./pages/dashboard/Dashboard";   // your combined Dashboard + DashboardHome
import EmployeeList from "./pages/employees/EmployeeList";
import EmployeeForm from "./pages/employees/EmployeeForm";
import EmployeeView from "./pages/employees/EmployeeView";
import AttendancePage from "./pages/attendance/AttendancePage";
import Leaves from "./pages/leaves/Leaves";
import Payroll from "./pages/payroll/Payroll";
import AdvanceSalary from "./pages/payroll/AdvanceSalary";
import Settings from "./pages/settings/Settings";
import AuditLogs from "./pages/audit/AuditLogs";
import AttendanceReport from "./pages/reports/AttendanceReport";
import LeaveReport from "./pages/reports/LeaveReport";
import PayrollReport from "./pages/reports/PayrollReport";
import AdvanceReport from "./pages/reports/AdvanceReport";
import ProtectedRoute from "./routes/ProtectedRoute";
import UserManagement from "./pages/users/UserManagement";

// Admin guard wrapper
const AdminOnly = ({ children }) => (
  <ProtectedRoute allowedRoles={["Admin"]}>{children}</ProtectedRoute>
);

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />

      {/* Dashboard Layout with nested routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      >
        {/* Employees */}
        <Route path="employees" element={<EmployeeList />} />
        <Route path="employees/create" element={<AdminOnly><EmployeeForm /></AdminOnly>} />
        <Route path="employees/edit/:id" element={<AdminOnly><EmployeeForm /></AdminOnly>} />
        <Route path="employees/:id" element={<EmployeeView />} />

        {/* Attendance */}
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="reports/attendance" element={<AttendanceReport />} />

        {/* Leaves */}
        <Route path="leaves" element={<Leaves />} />
        <Route path="reports/leaves" element={<LeaveReport />} />

        {/* Payroll (Admin only) */}
        <Route path="payroll" element={<AdminOnly><Payroll /></AdminOnly>} />
        <Route path="advance" element={<AdminOnly><AdvanceSalary /></AdminOnly>} />
        <Route path="reports/payroll" element={<AdminOnly><PayrollReport /></AdminOnly>} />
        <Route path="reports/advances" element={<AdminOnly><AdvanceReport /></AdminOnly>} />
        {/* System (Admin only) */}
        <Route path="users" element={<AdminOnly><UserManagement /></AdminOnly>} />
        <Route path="settings" element={<AdminOnly><Settings /></AdminOnly>} />
        <Route path="audit" element={<AdminOnly><AuditLogs /></AdminOnly>} />

        {/* Profile (both roles) */}
        <Route path="profile" element={<Profile />} />

        {/* Catch-all: unknown sub-routes redirect to dashboard home */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>

      {/* Catch-all: any unknown top-level route goes to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;