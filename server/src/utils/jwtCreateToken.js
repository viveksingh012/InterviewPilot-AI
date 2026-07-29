import jwt from "jsonwebtoken";

const generateaAccessToken=async(id)=>{
    return await jwt.sign({
        id:id
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
    expiresIn:"15m"
    })
}
const generateRefreshToken=async(id)=>{
    return await jwt.sign({
        id:id
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
    expiresIn:"7d"
    })
}

export {generateaAccessToken,generateRefreshToken}