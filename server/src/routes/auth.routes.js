import {Router} from "express";
import authMiddleware from "../middleware/authMiddleware.js";

import {register, login, refresh_token, logout, profile} from "../controller/authController.js"
 const router = Router();

 router.route("/register").get(register).post(register)
 router.route("/login").get(login).post(login)
 router.route("/refresh_token").get(refresh_token)
 router.route("/logout").get(authMiddleware, logout)
 router.route("/profile").get(authMiddleware, profile)


 export default router;