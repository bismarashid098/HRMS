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
        <Route path="employees" element={<EmployeeList />} />
        <Route path="employees/create" element={<EmployeeForm />} />
        <Route path="employees/:id" element={<EmployeeView />} />
        <Route path="employees/edit/:id" element={<EmployeeForm />} />
        
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="attendance/daily" element={<DailyAttendance />} />
        <Route path="leaves" element={<Leaves />} />
        <Route path="payroll" element={<Payroll />} />
        <Route path="advance" element={<AdvanceSalary />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="settings" element={<Settings />} />
        <Route path="profile" element={<Profile />} />

        <Route path="audit" element={<AuditLogs />} />
        <Route path="reports/attendance" element={<AttendanceReport />} />
        <Route path="reports/leaves" element={<LeaveReport />} />
        <Route path="reports/payroll" element={<PayrollReport />} />
        <Route path="reports/advances" element={<AdvanceReport />} />
      </Route>
    </Routes>
  );
};

export default App;
