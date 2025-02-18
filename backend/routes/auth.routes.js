import express from "express";
import { resetPassword, signup } from "../controllers/auth.controller.js";
import { login } from "../controllers/auth.controller.js";
import { logout } from "../controllers/auth.controller.js";
import { veifyEmail } from "../controllers/auth.controller.js";
import { forgotPassword } from "../controllers/auth.controller.js";
import { checkAuth } from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";


const router = express.Router();


router.get("/check-auth", verifyToken , checkAuth)


router.post("/signup", signup)


router.post("/login", login)


router.post("/logout", logout)


router.post ("/verify-email", veifyEmail)
router.post ("/forgot-password", forgotPassword)

router.post ("/reset-password/:resetToken", resetPassword)




export default router;