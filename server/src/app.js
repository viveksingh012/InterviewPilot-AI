import express from "express";
import dotenv from "dotenv"
import routes from "./routes/index.js"
import notFound from "./middleware/notFound.middleware..js";
dotenv.config();
const app=express();
app.use(express.json());
app.use(express.urlencoded({extended : true}))
app.use(express.static("public"))


app.use("/api/v1",routes)
app.use(notFound)

app.get("/",(req, res)=>{
    res.send("working state")
});

export default app;