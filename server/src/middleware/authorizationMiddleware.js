import apiError from "../utils/apiError.js"

const authorizationMiddleware = (...roles)=>{
   return (req,res,next)=>{
    console.log(roles)
    console.log(req.user.role)
    if(!roles.includes(req.user.role)){
        throw new apiError(403, "forbidden")
    }
    next();
   }
   
}

export default authorizationMiddleware;