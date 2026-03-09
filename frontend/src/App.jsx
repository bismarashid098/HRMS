import { Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login";
import Profile from "./pages/auth/Profile";
import Dashboard from "./pages/dashboard/Dashboard";
import DashboardHome from "./pages/dashboard/DashboardHome";
import EmployeeList from "./pages/employees/EmployeeList";
import EmployeeForm from "./pages/employees/EmployeeForm";
import EmployeeView from "./pages/employees/EmployeeView";
import DailyAttendance from "./pages/attendance/Attendance";
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

// Wrapper: Admin access only
const AdminOnly = ({ children }) => (
  <ProtectedRoute allowedRoles={["Admin"]}>{children}</ProtectedRoute>
);

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardHome />} />

        {/* Admin & Manager - Employee list & view */}
        <Route path="employees" element={<EmployeeList />} />
        <Route path="employees/:id" element={<EmployeeView />} />

        {/* Admin only - Employee create & edit */}
        <Route path="employees/create" element={<AdminOnly><EmployeeForm /></AdminOnly>} />
        <Route path="employees/edit/:id" element={<AdminOnly><EmployeeForm /></AdminOnly>} />

        {/* Admin & Manager - Attendance */}
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="attendance/daily" element={<DailyAttendance />} />

        {/* Admin & Manager - Leaves */}
        <Route path="leaves" element={<Leaves />} />

        {/* Admin only - Payroll */}
        <Route path="payroll" element={<AdminOnly><Payroll /></AdminOnly>} />
        <Route path="advance" element={<AdminOnly><AdvanceSalary /></AdminOnly>} />

        {/* Admin only - System management */}
        <Route path="users" element={<AdminOnly><UserManagement /></AdminOnly>} />
        <Route path="settings" element={<AdminOnly><Settings /></AdminOnly>} />
        <Route path="audit" element={<AdminOnly><AuditLogs /></AdminOnly>} />

        {/* Both roles - Profile */}
        <Route path="profile" element={<Profile />} />

        {/* Admin & Manager - Attendance & Leave Reports */}
        <Route path="reports/attendance" element={<AttendanceReport />} />
        <Route path="reports/leaves" element={<LeaveReport />} />

        {/* Admin only - Payroll & Advance Reports */}
        <Route path="reports/payroll" element={<AdminOnly><PayrollReport /></AdminOnly>} />
        <Route path="reports/advances" element={<AdminOnly><AdvanceReport /></AdminOnly>} />
      </Route>
    </Routes>
  );
};

export default App;
