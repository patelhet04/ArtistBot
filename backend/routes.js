import express from "express";

// Import the webhook controller and JWT verification middleware
import { handleWebhook } from "./controllers/webhookController.js";
import verifyToken from "./middleware/verifyToken.js";
import { getUserImages, uploadUserLogo } from "./controllers/userController.js";
import { handleChat, handleGreeting } from "./controllers/chatController.js";
import multer from "multer";
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

// Define the webhook route (protected by the JWT middleware)
router.post("/webhook", verifyToken, handleWebhook);
router.get("/response/:responseId/images", getUserImages);

// Chat endpoints with condition parameter
router.post("/chat", (req, res) => {
  const { condition } = req.body;
  if (!condition) {
    return res.status(400).json({ error: "Condition parameter is required" });
  }
  handleChat(req, res);
});

router.post("/greeting", (req, res) => {
  const { condition } = req.body;
  if (!condition) {
    return res.status(400).json({ error: "Condition parameter is required" });
  }
  handleGreeting(req, res);
});

// Logo and image handling
router.post("/logos/submit", upload.single("logoFile"), uploadUserLogo);

// Export using ES6 syntax
export default router;
