const STORAGE_KEY = "hrms-employees";

export const getEmployees = () => {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
};

export const saveEmployees = (employees) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
};

export const getEmployeeById = (id) => {
    const employees = getEmployees();
    return employees.find((e) => e.id === id);
};
