import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import prisma from "../config/prisma.js";
import { apiResponse } from "../utils/apiResponse.js";
import apiError from "../utils/apiError.js"
import { generateaAccessToken, generateRefreshToken } from "../utils/jwtCreateToken.js";


const register = async(req,res,next)=>{
    const {fullName, email, password} = req.body;
    const hash_password= await bcrypt.hash(password,10);
    await prisma.user.create({
        data:{
            fullName,
            email,
            password:hash_password
        }
    })
    apiResponse(res,200,"user register succesfull") 
}
const login = async(req,res,next)=>{
    const {email,password}=req.body;
    const user=await prisma.user.findUnique({
        where:{
            email:email
        }
    })
    if(!user){
        throw new apiError(404, "not user found")
    }
    const isMatched =await bcrypt.compare(password,user.password)
    if(!isMatched){
       throw new apiError(400, "incorrect password")
    }
    const accessToken=await generateaAccessToken(user.id)
    const refreshToken=await generateRefreshToken(user.id)
    await prisma.user.update({
        where:{
            id:user.id
        },
        data:{
            refresh_token:refreshToken
        }
    })
    res.cookie(
    "accessToken",
    accessToken,
    {
        httpOnly:true,
        secure:false,
        sameSite:"lax"
    }
    )
    .cookie(
    "refreshToken",
    refreshToken,
    {
        httpOnly:true,
        secure:false,
        sameSite:"lax"
    }
    );

    apiResponse(res,200,"login Succesfull")
}
const refresh_token = async(req,res,next)=>{
  const refreshToken=req.cookies.refreshToken;
  if(!refreshToken){
    throw new apiError(404, "no refersh token")
  }
  const decode = await jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET)
  const user=await prisma.user.findUnique({
    where:{
        id:decode.id
    }
  })
  console.log(refreshToken)
  console.log(user.refresh_token)

  if(user.refresh_token!=refreshToken){
   throw new apiError(404, "you are not login")
  }
  const accessToken =await generateaAccessToken(user.id)
  const NewrefreshToken =await generateRefreshToken(user.id)
  
    await prisma.user.update({
        where:{
            id:user.id
        },
        data:{
            refresh_token:NewrefreshToken
        }
    })
  res.cookie(
    "accessToken",
    accessToken,
    {
        httpOnly:true,
        secure:false,
        sameSite:"lax"
    }
    )
    .cookie(
    "refreshToken",
    NewrefreshToken,
    {
        httpOnly:true,
        secure:false,
        sameSite:"lax"
    }
    )
    .json({
        msg:"refresh token successful"
    })
}
const logout = async(req,res,next)=>{
    const id=req.user;
    await prisma.user.update({
        where:{
            id:id
        },
        data:{
            refresh_token:null
        }
    })
    res
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json("user logout")
}
const profile = (req,res,next)=>{
    res.send("profile")
}

export {register, login, refresh_token, logout, profile}
