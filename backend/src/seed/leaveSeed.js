const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Employee = require("../models/Employee");
const Leave = require("../models/Leave");

dotenv.config();

const buildDemoLeaves = (employees) => {
  const items = [];
  const today = new Date();

  const makeRange = (offsetDays, length) => {
    const start = new Date(today);
    start.setDate(start.getDate() + offsetDays);
    const end = new Date(start);
    end.setDate(start.getDate() + (length - 1));
    return { start, end };
  };

  employees.forEach((emp, index) => {
    const idx = index % 3;

    if (idx === 0) {
      const { start, end } = makeRange(-10, 3);
      items.push({
        employee: emp._id,
        type: "Casual",
        fromDate: start,
        toDate: end,
        totalDays: 3,
        paid: true,
        status: "Approved",
        reason: "Personal time for family commitments."
      });
    } else if (idx === 1) {
      const { start, end } = makeRange(-3, 2);
      items.push({
        employee: emp._id,
        type: "Sick",
        fromDate: start,
        toDate: end,
        totalDays: 2,
        paid: true,
        status: "Pending",
        reason: "Medical checkup and rest."
      });
    } else {
      const { start, end } = makeRange(-20, 1);
      items.push({
        employee: emp._id,
        type: "Annual",
        fromDate: start,
        toDate: end,
        totalDays: 1,
        paid: false,
        status: "Rejected",
        reason: "Unplanned personal work."
      });
    }
  });

  return items;
};

const seedLeaves = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const employees = await Employee.find()
      .sort({ createdAt: 1 })
      .limit(15);

    if (!employees.length) {
      console.log("No employees found to attach demo leaves.");
      process.exit(0);
    }

    await Leave.deleteMany({ reason: /Demo|family commitments|Medical checkup|Unplanned personal work/i });

    const demoLeaves = buildDemoLeaves(employees);
    await Leave.insertMany(demoLeaves);

    console.log(`Seeded ${demoLeaves.length} demo leave records.`);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedLeaves();

