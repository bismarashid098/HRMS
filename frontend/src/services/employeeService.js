import api from "../api/axios";

export const getEmployees = (config) => {
  return api.get("/employees", config);
};

export const getEmployeeById = (id, config) => {
  return api.get(`/employees/${id}`, config);
};

export const createEmployee = (employeeData, config) => {
  return api.post("/employees", employeeData, config);
};

export const updateEmployee = (id, employeeData, config) => {
  return api.put(`/employees/${id}`, employeeData, config);
};

export const deleteEmployee = (id, config) => {
  return api.delete(`/employees/${id}`, config);
};

