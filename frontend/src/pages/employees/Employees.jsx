import { useState } from "react";
import EmployeeForm from "./EmployeeForm";
import EmployeeList from "./EmployeeList";
import "../../style/employees.css";

const Employees = () => {
  return (
    <div style={{ padding: "20px" }}>
      <h2>Employees</h2>
      <p>Employee module active ho gaya hai ✅</p>

      <button>Add Employee</button>
    </div>
  );
};

export default Employees;

