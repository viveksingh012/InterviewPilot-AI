const notFound=(req,res,next)=>{
    res.status(404).json({
        success:false,
        message:"Page Not Found"
    })
}
export default notFound;