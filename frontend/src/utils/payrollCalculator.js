export const calculatePayroll = (employee) => {
    const basic = Number(employee.basicSalary || 0);
    const advance = Number(employee.advance || 0);
    const deduction = Number(employee.deduction || 0);

    const netSalary = basic - advance - deduction;

    return {
        basic,
        advance,
        deduction,
        netSalary: netSalary < 0 ? 0 : netSalary,
    };
};
