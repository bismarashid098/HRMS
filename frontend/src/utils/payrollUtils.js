export const markPayrollDirty = (month) => {
    const flags = JSON.parse(localStorage.getItem("payroll-status")) || {};
    flags[month] = "RECALC_REQUIRED";
    localStorage.setItem("payroll-status", JSON.stringify(flags));
};

export const markPayrollClean = (month) => {
    const flags = JSON.parse(localStorage.getItem("payroll-status")) || {};
    flags[month] = "FINALIZED";
    localStorage.setItem("payroll-status", JSON.stringify(flags));
};

export const getPayrollStatus = (month) => {
    const flags = JSON.parse(localStorage.getItem("payroll-status")) || {};
    return flags[month] || "NOT_GENERATED";
};
