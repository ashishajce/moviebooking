const jwt = require('jsonwebtoken');
const login = require('../models/login'); // ✅ rename this correctly

module.exports = {
    isadmin: async (req, res, next) => {
        const token = req.headers["token"];
        if (!token) {
            return res.status(401).json({ status: false, message: "Token required" });
        }

        try {
            const decoded = jwt.verify(token, 'mysecretkey123');
            const user = await login.findOne({ _id: decoded.id, status: true });

            if (!user) {
                return res.status(401).json({ status: false, message: "User not found" });
            }

            if (user.role !== 'admin') {
                return res.status(403).json({ status: false, message: "Access denied, admin only" });
            }

            req.user = user;
            next();
        } catch (error) {
            return res.status(401).json({ status: false, message: "Invalid token" });
        }
    },

    isuser: async (req, res, next) => {
        const token = req.headers["token"];
        if (!token) {
            return res.status(401).json({ status: false, message: "Token required" });
        }

        try {
            const decoded = jwt.verify(token, 'mysecretkey123');
            const user = await login.findOne({ _id: decoded.id, status: true });

            if (!user) {
                return res.status(401).json({ status: false, message: "User not found" });
            }

            req.user = user;
            next();
        } catch (error) {
            return res.status(401).json({ status: false, message: "Invalid token" });
        }
    }
};
