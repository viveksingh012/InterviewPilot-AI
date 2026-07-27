export const healthCheckController=(req,res,next)=>{
    res.json({
        status:"successful",
        code:200,
        message:"working site"
    })
}