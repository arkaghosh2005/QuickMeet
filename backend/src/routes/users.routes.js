import { Router } from "express";
import { addToHistory, getUserHistory, login, signup } from "../controllers/userController.js";

const router = Router();

router.route("/login").post(login);
router.route("/signup").post(signup);
router.route("/history").get(getUserHistory).post(addToHistory);

export default router;