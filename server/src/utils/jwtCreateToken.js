import jwt from "jsonwebtoken";

const generateaAccessToken=async(id,role)=>{
    return await jwt.sign({
        id:id,
        role:role
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
    expiresIn:"15m"
    })
}
const generateRefreshToken=async(id,role)=>{
    return await jwt.sign({
        id:id,
        role:role
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
    expiresIn:"7d"
    })
}

export {generateaAccessToken,generateRefreshToken}