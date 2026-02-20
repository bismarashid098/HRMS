const asyncHandler = require("express-async-handler");
const Employee = require("../models/Employee");
const Attendance = require("../models/Attendance");
const Leave = require("../models/Leave");
const Payroll = require("../models/payroll");

exports.getDashboardSummary = asyncHandler(async (req, res) => {
    try {
        // 1. Total Employees
        const totalEmployees = await Employee.countDocuments({
            isDeleted: false,
            employmentStatus: "Active"
        });

        // 2. Attendance Today
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const attendanceToday = await Attendance.countDocuments({
            date: { $gte: todayStart, $lte: todayEnd },
            status: { $in: ["Present", "Late", "Half Day"] }
        });

        // 3. Pending Leaves
        const pendingLeaves = await Leave.countDocuments({
            status: "Pending"
        });

        // 4. Monthly Payroll (Current Month)
        const currentMonth = new Date().getMonth() + 1; // 1-12
        const currentYear = new Date().getFullYear();

        const payrollData = await Payroll.aggregate([
            {
                $match: {
                    month: currentMonth,
                    year: currentYear
                }
            },
            {
                $group: {
                    _id: null,
                    totalSalary: { $sum: "$netSalary" }
                }
            }
        ]);

        const monthlyPayroll = payrollData.length > 0 ? payrollData[0].totalSalary : 0;

        res.json({
            totalEmployees,
            attendanceToday,
            pendingLeaves,
            monthlyPayroll
        });

    } catch (error) {
        res.status(500);
        throw new Error("Error fetching dashboard summary");
    }
});

exports.getAttendanceChartData = asyncHandler(async (req, res) => {
    try {
        const monthParam = req.query.month;
        const yearParam = req.query.year;

        const now = new Date();
        const targetYear = yearParam ? parseInt(yearParam, 10) : now.getFullYear();
        const targetMonth = monthParam ? parseInt(monthParam, 10) : now.getMonth() + 1;

        const startOfMonth = new Date(targetYear, targetMonth - 1, 1);
        const endOfMonth = new Date(targetYear, targetMonth, 0, 23, 59, 59);

        const attendanceData = await Attendance.aggregate([
            {
                $match: {
                    date: { $gte: startOfMonth, $lte: endOfMonth }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    present: {
                        $sum: {
                            $cond: [{ $in: ["$status", ["Present", "Late", "Half Day"]] }, 1, 0]
                        }
                    },
                    absent: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "Absent"] }, 1, 0]
                        }
                    }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json(attendanceData);
    } catch (error) {
        res.status(500);
        throw new Error("Error fetching attendance chart data");
    }
});

exports.getLeaveStats = asyncHandler(async (req, res) => {
    try {
        const leaveStats = await Leave.aggregate([
            {
                $group: {
                    _id: "$type",
                    total: { $sum: 1 }
                }
            }
        ]);
        res.json(leaveStats);
    } catch (error) {
        res.status(500);
        throw new Error("Error fetching leave stats");
    }
});

exports.getPayrollStats = asyncHandler(async (req, res) => {
    try {
        const yearParam = req.query.year;
        const targetYear = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear();

        const payrollStats = await Payroll.aggregate([
            {
                $match: { year: targetYear }
            },
            {
                $group: {
                    _id: "$month",
                    totalPaid: { $sum: "$netSalary" }
                }
            },
            { $sort: { _id: 1 } }
        ]);
        res.json(payrollStats);
    } catch (error) {
        res.status(500);
        throw new Error("Error fetching payroll stats");
    }
});
