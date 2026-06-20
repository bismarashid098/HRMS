const mongoose = require("mongoose");

const connectDB = async (retries = 5) => {
    for (let i = 1; i <= retries; i++) {
        try {
            await mongoose.connect(process.env.MONGO_URI);
            console.log("✅ MongoDB Connected");
            return;
        } catch (error) {
            console.error(`❌ MongoDB Error (attempt ${i}/${retries}):`, error.message);
            if (i === retries) {
                console.error("All DB connection attempts failed. Server will continue without DB.");
                return;
            }
            await new Promise(r => setTimeout(r, 3000 * i));
        }
    }
};

module.exports = connectDB;
