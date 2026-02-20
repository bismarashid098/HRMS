const KEY = "attendance-records";

export const getAttendance = () => {
    return JSON.parse(localStorage.getItem(KEY)) || [];
};

export const saveAttendance = (records) => {
    localStorage.setItem(KEY, JSON.stringify(records));
};

export const addAttendance = (record) => {
    const data = getAttendance();
    data.push(record);
    saveAttendance(data);
};
