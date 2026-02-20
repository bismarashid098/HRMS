import mongoose from "mongoose";
import Employee from "../models/Employee.js";
import dotenv from "dotenv";

dotenv.config();

const employees = [];

for (let i = 1; i <= 50; i++) {
  employees.push({
    name: `Employee ${i}`,
    email: `employee${i}@gmail.com`,
    phone: `0300${100000 + i}`,
    department: "IT",
    designation: "Developer",
    basicSalary: 50000,
    allowances: 5000,
    deductions: 0,
    joiningDate: new Date(),
    status: "Active"
  });
}

const seedEmployees = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Employee.deleteMany(); // optional
    await Employee.insertMany(employees);
    console.log("✅ Employees seeded successfully");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedEmployees();
