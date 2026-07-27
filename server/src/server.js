import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import app from "./app.js"
const result=dotenv.config();
if(!result){
    console.log("hello")
}

const port = process.env.PORT;
console.log(process.env.PORT)
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));


app.listen(port,(req,res)=>{
    console.log("server is running")
})