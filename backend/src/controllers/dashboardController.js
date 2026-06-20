const asyncHandler = require("express-async-handler");

const Employee = require("../models/Employee");
const Attendance = require("../models/Attendance");
const Leave = require("../models/Leave");
const Payroll = require("../models/payroll");

/* ─────────────────────────────────────────────
   DASHBOARD SUMMARY
───────────────────────────────────────────── */
exports.getDashboardSummary = asyncHandler(async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    /* Parallel Queries */
    const [
      totalEmployees,
      attendanceToday,
      pendingLeaves,
      payrollAgg,
    ] = await Promise.all([

      /* Active Employees */
      Employee.countDocuments({
        isDeleted: false,
        employmentStatus: "Active",
      }),

      /* Present Today */
      Attendance.countDocuments({
        date: {
          $gte: todayStart,
          $lte: todayEnd,
        },
        status: {
          $in: ["Present", "Late", "Half Day"],
        },
      }),

      /* Pending Leaves */
      Leave.countDocuments({
        status: "Pending",
      }),

      /* Current Month Payroll */
      Payroll.aggregate([
        {
          $match: {
            month: currentMonth,
            year: currentYear,
          },
        },
        {
          $group: {
            _id: null,
            totalSalary: {
              $sum: "$netSalary",
            },
          },
        },
      ]),
    ]);

    const monthlyPayroll =
      payrollAgg?.[0]?.totalSalary || 0;

    return res.status(200).json({
      success: true,

      totalEmployees,
      attendanceToday,
      pendingLeaves,
      monthlyPayroll,

      attendanceRate:
        totalEmployees > 0
          ? Math.round(
              (attendanceToday / totalEmployees) * 100
            )
          : 0,

      absentToday:
        totalEmployees - attendanceToday,

      generatedAt: new Date(),
    });
  } catch (error) {
    console.log(error);

    res.status(500);
    throw new Error(
      "Error fetching dashboard summary"
    );
  }
});

/* ─────────────────────────────────────────────
   ATTENDANCE CHART DATA
───────────────────────────────────────────── */
exports.getAttendanceChartData =
  asyncHandler(async (req, res) => {
    try {
      const now = new Date();

      const monthParam = req.query.month;
      const yearParam = req.query.year;

      const targetYear = yearParam
        ? parseInt(yearParam)
        : now.getFullYear();

      const targetMonth = monthParam
        ? parseInt(monthParam)
        : now.getMonth() + 1;

      const startOfMonth = new Date(
        targetYear,
        targetMonth - 1,
        1
      );

      const endOfMonth = new Date(
        targetYear,
        targetMonth,
        0,
        23,
        59,
        59
      );

      const attendanceData =
        await Attendance.aggregate([
          {
            $match: {
              date: {
                $gte: startOfMonth,
                $lte: endOfMonth,
              },
            },
          },

          {
            $group: {
              _id: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$date",
                },
              },

              present: {
                $sum: {
                  $cond: [
                    {
                      $in: [
                        "$status",
                        [
                          "Present",
                          "Late",
                          "Half Day",
                        ],
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },

              absent: {
                $sum: {
                  $cond: [
                    {
                      $eq: [
                        "$status",
                        "Absent",
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },
            },
          },

          {
            $sort: {
              _id: 1,
            },
          },
        ]);

      /* Format For Frontend */
      const formatted = attendanceData.map(
        (item) => ({
          _id: item._id,

          present: item.present || 0,

          absent: item.absent || 0,

          total:
            (item.present || 0) +
            (item.absent || 0),

          attendanceRate:
            item.present + item.absent > 0
              ? Math.round(
                  (item.present /
                    (item.present +
                      item.absent)) *
                    100
                )
              : 0,
        })
      );

      return res.status(200).json(formatted);
    } catch (error) {
      console.log(error);

      res.status(500);

      throw new Error(
        "Error fetching attendance chart data"
      );
    }
  });

/* ─────────────────────────────────────────────
   LEAVE STATS
───────────────────────────────────────────── */
exports.getLeaveStats = asyncHandler(
  async (req, res) => {
    try {
      const leaveStats = await Leave.aggregate([
        {
          $group: {
            _id: "$type",

            total: {
              $sum: 1,
            },

            approved: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$status",
                      "Approved",
                    ],
                  },
                  1,
                  0,
                ],
              },
            },

            pending: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$status",
                      "Pending",
                    ],
                  },
                  1,
                  0,
                ],
              },
            },

            rejected: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$status",
                      "Rejected",
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },

        {
          $sort: {
            total: -1,
          },
        },
      ]);

      return res.status(200).json(leaveStats);
    } catch (error) {
      console.log(error);

      res.status(500);

      throw new Error(
        "Error fetching leave stats"
      );
    }
  }
);

/* ─────────────────────────────────────────────
   PAYROLL STATS
───────────────────────────────────────────── */
exports.getPayrollStats = asyncHandler(
  async (req, res) => {
    try {
      const yearParam = req.query.year;

      const targetYear = yearParam
        ? parseInt(yearParam)
        : new Date().getFullYear();

      const payrollStats =
        await Payroll.aggregate([
          {
            $match: {
              year: targetYear,
            },
          },

          {
            $group: {
              _id: "$month",

              totalPaid: {
                $sum: "$netSalary",
              },

              employees: {
                $sum: 1,
              },

              averageSalary: {
                $avg: "$netSalary",
              },
            },
          },

          {
            $sort: {
              _id: 1,
            },
          },
        ]);

      /* Month Names */
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      const formatted = payrollStats.map(
        (item) => ({
          month: months[item._id - 1],

          monthNumber: item._id,

          totalPaid:
            Math.round(item.totalPaid) || 0,

          employees: item.employees || 0,

          averageSalary:
            Math.round(item.averageSalary) || 0,
        })
      );

      return res.status(200).json(formatted);
    } catch (error) {
      console.log(error);

      res.status(500);

      throw new Error(
        "Error fetching payroll stats"
      );
    }
  }
);