const authorize = (...roles) => {
    return (req, res, next) => {
        if (
            req.user &&
            req.user.role === "Manager" &&
            (req.baseUrl === "/api/leaves" || req.baseUrl === "/api/attendance")
        ) {
            return next();
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Access denied" });
        }

        next();
    };
};

module.exports = authorize;
