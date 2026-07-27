import {Router} from "express";
import healthCheckRoutes from "./healthCheckRoutes.js"

const router =Router();

router.get("/",(req,res)=>{
    res.send("server running on api version 1")
})
router.use("/healthcheck",healthCheckRoutes)

export default router;