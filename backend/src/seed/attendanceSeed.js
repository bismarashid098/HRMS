const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Employee = require("../models/Employee");
const Attendance = require("../models/Attendance");

dotenv.config();

const normalizeDate = (d) => {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  return date;
};

const buildDemoAttendance = async () => {
  const employees = await Employee.find({ biometricId: /^AUTO/ })
    .sort({ biometricId: 1 })
    .limit(10);

  if (employees.length === 0) {
    console.log("No demo employees found. Run employeeSeed first.");
    return [];
  }

  const today = normalizeDate(new Date());

  const records = [];

  employees.forEach((emp, index) => {
    const baseDate = new Date(today);
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() - 1);

    if (index < 4) {
      const punchIn = new Date(date);
      punchIn.setHours(9, 0, 0, 0);
      const punchOut = new Date(date);
      punchOut.setHours(18, 0, 0, 0);
      records.push({
        employee: emp._id,
        date,
        punchIn,
        punchOut,
        status: "Present"
      });
    } else if (index < 7) {
      const punchIn = new Date(date);
      punchIn.setHours(9, 45, 0, 0);
      const punchOut = new Date(date);
      punchOut.setHours(18, 0, 0, 0);
      records.push({
        employee: emp._id,
        date,
        punchIn,
        punchOut,
        status: "Late"
      });
    } else {
      records.push({
        employee: emp._id,
        date,
        status: "Absent"
      });
    }
  });

  return records;
};

const seedAttendance = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const day = normalizeDate(new Date());
    day.setDate(day.getDate() - 1);

    await Attendance.deleteMany({ date: day });

    const records = await buildDemoAttendance();

    if (!records.length) {
      process.exit(0);
    }

    await Attendance.insertMany(records);
    console.log("Demo attendance seeded successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding attendance:", error);
    process.exit(1);
  }
};

seedAttendance();

