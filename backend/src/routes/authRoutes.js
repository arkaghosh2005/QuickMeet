import { Router } from "express";
import { googleAuth, googleCallback, microsoftAuth, microsoftCallback } from "../controllers/authController.js";

const router = Router();

// Google OAuth
router.get("/google", googleAuth);
router.get("/google/callback", googleCallback);

// Microsoft OAuth
router.get("/microsoft", microsoftAuth);
router.get("/microsoft/callback", microsoftCallback);

export default router;