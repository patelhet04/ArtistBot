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
// ✅ OpenAI Chat API (JWT protected)
router.post("/chat", handleChat);
router.post("/greeting", handleGreeting);

// Logo and image handling
router.post("/logos/submit", upload.single("logoFile"), uploadUserLogo);

// Export using ES6 syntax
export default router;
