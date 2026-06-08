import { Router } from "express";
import { body } from "express-validator";
import { addToHistory, deleteFromHistory, getUserHistory, login, signup } from "../controllers/userController.js";
import authMiddleware from "../middleware/auth.js";

const router = Router();

// Public routes
router.route("/login").post(
    body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
    login
);

router.route("/signup").post(
    body("name").trim().notEmpty().withMessage("Name is required")
        .matches(/^[A-Za-z\s]+$/).withMessage("Name can only contain letters and spaces")
        .custom(val => val.trim().includes(" ")).withMessage("Please include both first and last name"),
    body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
    signup
);

// Protected routes
router.route("/history")
    .get(authMiddleware, getUserHistory)
    .post(
        authMiddleware,
        body("meeting_code").matches(/^[A-Z0-9]{3}-[A-Z0-9]{4}-[A-Z0-9]{3}$/).withMessage("Invalid meeting code format"),
        addToHistory
    )
    .delete(
        authMiddleware,
        body("meeting_id").notEmpty().withMessage("Meeting ID is required"),
        deleteFromHistory
    );

export default router;