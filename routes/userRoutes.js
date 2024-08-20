const express = require("express");
const { login, signup, getAllUsers } = require("../controllers/authController");
const authMiddleware = require("../Middleware/authMiddleware");
const router = express.Router();

router.post('/signup',signup)
router.post("/login",login)
router.get('/',authMiddleware,getAllUsers)

module.exports = router