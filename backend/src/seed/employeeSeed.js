const mongoose = require("mongoose");
const Employee = require("../models/Employee");
const dotenv = require("dotenv");

dotenv.config();

const departments = ["Accounts", "HR", "Production", "Sales", "IT"];

const buildEmployees = () => {
  const items = [];

  for (let i = 1; i <= 60; i++) {
    const dept = departments[i % departments.length];

    items.push({
      name: `Demo Employee ${i}`,
      employeeId: `EMP${String(i).padStart(4, "0")}`,
      department: dept,
      salary: 30000 + i * 500,
      biometricId: `AUTO${String(i).padStart(4, "0")}`,
      leaveBalance: 12
    });
  }

  return items;
};

const seedEmployees = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const collection = mongoose.connection.collection("employees");

    await collection.deleteMany({ biometricId: /^AUTO/ });

    const employees = buildEmployees();
    await collection.insertMany(employees);

    console.log("Employees seeded successfully");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedEmployees();
