import { getAdvanceSettings } from "../../utils/advanceSettings";

/* ===============================
   IN-MEMORY EMPLOYEE STORE
================================ */
let employees = [
    {
        id: "1",
        name: "Ali Raza",
        role: "Manager",
        department: "Accounts",
        salary: 60000,
        phone: "0300-0000000",
        address: "Lahore",
        status: "Active",
        attendance: { late: 2 },
        advance: 0,
        advanceHistory: [],
    },
    {
        id: "2",
        name: "Sara Khan",
        role: "Cashier",
        department: "Sales",
        salary: 45000,
        phone: "0311-1111111",
        address: "Karachi",
        status: "Active",
        attendance: { late: 1 },
        advance: 0,
        advanceHistory: [],
    },
];

/* ===============================
   GETTERS
================================ */
export const getEmployees = () => employees;

export const getEmployeeById = (id) =>
    employees.find((emp) => emp.id === id);

/* ===============================
   UPDATE EMPLOYEE ✅
================================ */
export const updateEmployee = (updatedEmployee) => {
    employees = employees.map((emp) =>
        emp.id === updatedEmployee.id
            ? { ...emp, ...updatedEmployee }
            : emp
    );
};




/* ===============================
   ADD EMPLOYEE ✅ (THIS FIXES ERROR)
================================ */
export const addEmployee = (employee) => {
    employees.push({
        ...employee,
        id: Date.now().toString(),
        advance: 0,
        advanceHistory: [],
        attendance: { late: 0 },
    });
};

/* ===============================
   DELETE EMPLOYEE
================================ */
export const deleteEmployee = (id) => {
    employees = employees.filter((emp) => emp.id !== id);
};

/* ===============================
   ADVANCE LOGIC (WITH LIMIT)
================================ */
export const addAdvance = ({ empId, month, amount, reason }) => {
    const emp = getEmployeeById(empId);
    if (!emp) {
        return { success: false, message: "Employee not found" };
    }

    emp.advance = emp.advance || 0;
    emp.advanceHistory = emp.advanceHistory || [];

    const settings = getAdvanceSettings();

    let maxAllowed =
        settings.type === "PERCENTAGE"
            ? (emp.salary * settings.value) / 100
            : settings.value;

    if (emp.advance + amount > maxAllowed) {
        return {
            success: false,
            message: `Advance limit exceeded. Max allowed Rs ${maxAllowed}`,
        };
    }

    emp.advance += amount;

    emp.advanceHistory.push({
        month,
        amount,
        reason,
        date: new Date().toISOString().slice(0, 10),
    });

    return { success: true };
};
