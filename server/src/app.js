import express from "express";
import dotenv from "dotenv"
import routes from "./routes/index.js"
import notFound from "./middleware/notFound.middleware..js";
import prisma from "./config/prisma.js";

dotenv.config();
const app=express();
app.use(express.json());
app.use(express.urlencoded({extended : true}))
app.use(express.static("public"))


app.use("/api/v1",routes)


app.get("/",(req, res)=>{
    res.send("working state")
});



app.get("/create",async(req, res)=>{
    await prisma.user.create({
        data:{
            fullName:"vivek singh",
            email: "abc@gmail.com",
            password: "123456"    
        }
    })
    res.send("created")
});
app.get("/users",async(req, res)=>{
    const user = await prisma.user.findMany();
    console.log(user)
});

app.use(notFound)

export default app;
