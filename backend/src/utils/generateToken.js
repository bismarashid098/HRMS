const jwt = require("jsonwebtoken");

// Embed role/name/email so auth middleware needs no DB lookup
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role, name: user.name, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
    );
};

module.exports = generateToken;
