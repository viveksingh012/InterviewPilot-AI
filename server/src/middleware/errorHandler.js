export const errorHandler = (err,req,res,next)=>{
    res.status(err.statuscode).json({
        msg:err.message,
        succes:err.success

    })

}