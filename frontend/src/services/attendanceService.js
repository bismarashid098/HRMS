import api from "../api/axios";

export const punchIn = (employeeId, config) => {
  return api.post("/attendance/punch-in", { employeeId }, config);
};

export const punchOut = (employeeId, config) => {
  return api.post("/attendance/punch-out", { employeeId }, config);
};

export const getMonthlyAttendance = (params, config) => {
  return api.get("/attendance", {
    params,
    ...config
  });
};

export const requestCorrection = (attendanceId, reason, config) => {
  return api.post(
    "/attendance/correction",
    { attendanceId, reason },
    config
  );
};

export const approveCorrection = (id, config) => {
  return api.put(`/attendance/correction/${id}`, undefined, config);
};

export const manualAttendance = (payload, config) => {
  return api.post("/attendance/manual", payload, config);
};
