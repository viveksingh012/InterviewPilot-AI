import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import app from "./app.js"
dotenv.config();

const port = process.env.PORT || 3000;

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));


app.listen(port,(req,res)=>{
    console.log("server is running")
})