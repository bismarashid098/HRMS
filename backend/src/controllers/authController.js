const User = require("../models/User");
const Employee = require("../models/Employee");
const generateToken = require("../utils/generateToken");
const asyncHandler = require("express-async-handler");
const { logAudit } = require("../services/auditService");

exports.register = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error("User already exists");
    }

    const user = await User.create({
        name,
        email,
        password,
        role: "Manager"
    });

    res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user)
    });
});

exports.login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
        // Log failed login without crashing (user may not exist)
        if (user) {
            logAudit(req, {
                module: "Auth",
                action: "Failed Login",
                recordId: user._id,
                recordName: user.name,
                description: `Failed login attempt for ${email}`,
                userOverride: { _id: user._id, name: user.name, role: user.role },
            });
        }
        res.status(401);
        throw new Error("Invalid credentials");
    }

    if (!user.isActive) {
        res.status(403);
        throw new Error("Account is deactivated");
    }

    const employee = await Employee.findOne({ user: user._id });

    logAudit(req, {
        module: "Auth",
        action: "Login",
        recordId: user._id,
        recordName: user.name,
        description: `${user.name} (${user.role}) logged in`,
        userOverride: { _id: user._id, name: user.name, role: user.role },
    });

    res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeId: employee ? employee._id : null,
        token: generateToken(user)
    });
});

exports.verify = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    const employee = await Employee.findOne({ user: user._id });

    res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeId: employee ? employee._id : null
    });
});

exports.changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
        res.status(400);
        throw new Error("Current password is incorrect");
    }

    user.password = newPassword;
    await user.save();

    logAudit(req, {
        module: "Auth",
        action: "Password Change",
        recordId: user._id,
        recordName: user.name,
        description: `${user.name} changed their password`,
    });

    res.json({ message: "Password updated successfully" });
});

exports.updateProfile = asyncHandler(async (req, res) => {
    const { name, email } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    const oldValues = { name: user.name, email: user.email };

    if (email && email !== user.email) {
        const emailExists = await User.findOne({ email });
        if (emailExists) {
            res.status(400);
            throw new Error("Email already in use");
        }
        user.email = email;
    }

    if (name) {
        user.name = name;
    }

    await user.save();

    logAudit(req, {
        module: "Auth",
        action: "Profile Update",
        recordId: user._id,
        recordName: user.name,
        description: `${user.name} updated their profile`,
        oldValues,
        newValues: { name: user.name, email: user.email },
    });

    res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
    });
});
