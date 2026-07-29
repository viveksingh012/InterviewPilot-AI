import jwt from "jsonwebtoken"
import apiError from "../utils/apiError.js";
import prisma from "../config/prisma.js";
const authMiddleware = async(req,res,next)=>{
    const accessToken = req.cookies.accessToken;
    if(!accessToken){
        throw new apiError(404,"Token expire and Not matched")
    }
    const result = await jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECRET)
    const user = await prisma.user.findUnique({
        where:{
            id:result.id
        }
    })
    if(!user){
       throw new apiError(404, "user not found")
    }
    req.user=user;
    next();
}

export default authMiddleware;