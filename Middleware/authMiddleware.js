const jwt = require('jsonwebtoken');
const User = require('../models/userModel'); // Adjust the path as needed

const authMiddleware = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // Extract token from Authorization header

    if (!token) {
        return res.status(401).json({ success: false, message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token
        req.user = await User.findById(decoded.id); // Attach the user to the request object
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

module.exports = authMiddleware;
