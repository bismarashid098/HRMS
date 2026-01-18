export const logAudit = (action, message) => {
    const logs = JSON.parse(localStorage.getItem("audit-logs")) || [];

    const entry = {
        id: Date.now(),
        action,
        message,
        date: new Date().toLocaleString(),
    };

    logs.unshift(entry);
    localStorage.setItem("audit-logs", JSON.stringify(logs));
};
