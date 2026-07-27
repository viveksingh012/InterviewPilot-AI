import express from "express";
import { healthCheckController } from "../controller/healthCheckController.js";

const router=express.Router();

router.get("/", healthCheckController)


export default router;