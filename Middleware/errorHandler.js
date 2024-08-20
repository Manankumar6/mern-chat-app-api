const errorHandler = (err, req, res, next) => {
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(val => val.message);

        res.status(400).json({
            success: false,
            message: "Validation Error",
            errors: errors
        });
    } else {
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

module.exports = errorHandler;
