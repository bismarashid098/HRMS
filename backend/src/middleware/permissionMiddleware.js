const GRANTABLE_MODULES = [
  "employees", "attendance", "leaves", "biometric", "payroll", "advance-salary",
  "departments", "designations", "branches", "shifts", "holidays",
  "recruitment", "performance", "training",
  "assets", "expenses", "documents", "reports",
];

const authorizePermission = (module) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Not authorized" });
  if (req.user.role === "Admin") return next();
  if (req.user.permissions && req.user.permissions.includes(module)) return next();
  return res.status(403).json({ message: `Access to '${module}' is not permitted` });
};

module.exports = { authorizePermission, GRANTABLE_MODULES };
