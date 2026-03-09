const mongoose = require("mongoose");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const path = require("path");

// Load env vars
dotenv.config({ path: path.join(__dirname, "../../.env") });

const seedUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB Connected");

        const existingUser = await User.findOne({ email: "admin@hrms.com" });
        if (existingUser) {
            console.log("⚠️ Admin user already exists. Updating password...");
            existingUser.password = "123"; // Will be hashed by pre-save hook
            existingUser.isActive = true;
            await existingUser.save();
            console.log("✅ Admin password updated to '123'");
        } else {
            console.log("Creating new admin user...");
            await User.create({
                name: "Admin User",
                email: "admin@hrms.com",
                password: "123", // Will be hashed by pre-save hook
                role: "Admin",
                isActive: true
            });
            console.log("✅ Admin user created successfully");
        }

        const managerEmail = "manager@hrms.com";
        const existingManager = await User.findOne({ email: managerEmail });

        if (existingManager) {
            console.log("⚠️ Manager user already exists. Updating password...");
            existingManager.password = "123";
            existingManager.role = "Manager";
            existingManager.isActive = true;
            await existingManager.save();
            console.log("✅ Manager password updated to '123'");
        } else {
            console.log("Creating new manager user...");
            await User.create({
                name: "Manager User",
                email: managerEmail,
                password: "123",
                role: "Manager",
                isActive: true
            });
            console.log("✅ Manager user created successfully");
        }

        console.log("\nLogin Credentials:");
        console.log("Admin Email: admin@hrms.com");
        console.log("Admin Password: 123");
        console.log("Manager Email: manager@hrms.com");
        console.log("Manager Password: 123");
        
        process.exit();
    } catch (error) {
        console.error("❌ Error seeding user:", error);
        process.exit(1);
    }
};

seedUser();
