export const calculateSalary = (employee, attendance) => {
    const dailyRate = employee.baseSalary / 30;

    const absentDeduction = attendance.absent * dailyRate;
    const lateDeduction = attendance.late * (dailyRate * 0.25);

    const totalDeduction = absentDeduction + lateDeduction;

    return {
        baseSalary: employee.baseSalary,
        deduction: Math.round(totalDeduction),
        netSalary: Math.round(employee.baseSalary - totalDeduction),
    };
};
