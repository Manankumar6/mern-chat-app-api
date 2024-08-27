const express = require("express")
const router = express.Router()
const authMiddleware = require("../Middleware/authMiddleware")
const { sendMessage, allMessage } = require("../controllers/messageController")

router.post("/",authMiddleware,sendMessage)
router.get("/:chatId",authMiddleware,allMessage)

module.exports = router;
