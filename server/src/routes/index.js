import {Router} from "express";
import healthCheckRoutes from "./healthCheckRoutes.js"
import authRoutes from "./auth.routes.js"
import authMiddleware from "../middleware/authMiddleware.js"

const router =Router();

router.get("/",authMiddleware,(req,res)=>{
    res.send("server running on api version 1")
})

router.use("/auth",authRoutes)
router.use("/healthcheck",healthCheckRoutes)

export default router;