import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/auth/Login";
import PrivateRoute from "./routes/PrivateRoute";
import MainLayout from "./components/layout/MainLayout";

import Dashboard from "./pages/dashboard/Dashboard";
import Employees from "./pages/employees/Employees";
import EmployeeForm from "./pages/employees/EmployeeForm";
import EmployeeView from "./pages/employees/EmployeeView";

import Attendance from "./pages/attendance/Attendance";
import Leaves from "./pages/leaves/Leaves";
import Payroll from "./pages/payroll/Payroll";

import AttendanceReport from "./pages/reports/AttendanceReport";
import LeaveReport from "./pages/reports/LeaveReport";
import PayrollReport from "./pages/reports/PayrollReport";
import AdvanceReport from "./pages/reports/AdvanceReport";

import Settings from "./pages/settings/Settings";
import AuditLogs from "./pages/audit/AuditLogs";

const App = () => {
    return (
        <AuthProvider>
            <Routes>
                {/* PUBLIC */}
                <Route path="/login" element={<Login />} />

                {/* DASHBOARD */}
                <Route
                    path="/"
                    element={
                        <PrivateRoute>
                            <MainLayout>
                                <Dashboard />
                            </MainLayout>
                        </PrivateRoute>
                    }
                />

                {/* EMPLOYEES */}
                <Route
                    path="/employees"
                    element={
                        <PrivateRoute>
                            <MainLayout>
                                <Employees />
                            </MainLayout>
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/employees/add"
                    element={
                        <PrivateRoute>
                            <MainLayout>
                                <EmployeeForm />
                            </MainLayout>
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/employees/edit/:id"
                    element={
                        <PrivateRoute>
                            <MainLayout>
                                <EmployeeForm />
                            </MainLayout>
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/employees/view/:id"
                    element={
                        <PrivateRoute>
                            <MainLayout>
                                <EmployeeView />
                            </MainLayout>
                        </PrivateRoute>
                    }
                />

                {/* ATTENDANCE */}
                <Route
                    path="/attendance"
                    element={
                        <PrivateRoute>
                            <MainLayout>
                                <Attendance />
                            </MainLayout>
                        </PrivateRoute>
                    }
                />

                {/* LEAVES */}
                <Route
                    path="/leaves"
                    element={
                        <PrivateRoute>
                            <MainLayout>
                                <Leaves />
                            </MainLayout>
                        </PrivateRoute>
                    }
                />

                {/* PAYROLL */}
                <Route
                    path="/payroll"
                    element={
                        <PrivateRoute>
                            <MainLayout>
                                <Payroll />
                            </MainLayout>
                        </PrivateRoute>
                    }
                />

                {/* REPORTS */}
                <Route
                    path="/reports/attendance"
                    element={
                        <PrivateRoute>
                            <MainLayout>
                                <AttendanceReport />
                            </MainLayout>
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/reports/leaves"
                    element={
                        <PrivateRoute>
                            <MainLayout>
                                <LeaveReport />
                            </MainLayout>
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/reports/payroll"
                    element={
                        <PrivateRoute>
                            <MainLayout>
                                <PayrollReport />
                            </MainLayout>
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/reports/advance"
                    element={
                        <PrivateRoute>
                            <MainLayout>
                                <AdvanceReport />
                            </MainLayout>
                        </PrivateRoute>
                    }
                />

                {/* SETTINGS */}
                <Route
                    path="/settings"
                    element={
                        <PrivateRoute>
                            <MainLayout>
                                <Settings />
                            </MainLayout>
                        </PrivateRoute>
                    }
                />

                {/* AUDIT */}
                <Route
                    path="/audit-logs"
                    element={
                        <PrivateRoute>
                            <MainLayout>
                                <AuditLogs />
                            </MainLayout>
                        </PrivateRoute>
                    }
                />
            </Routes>
        </AuthProvider>
    );
};

export default App;
