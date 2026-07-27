export const apiResponse =(res, statuscode, message, success,data)=>{
    res.status(statuscode).json({
        message:message,
        success:true,
        data:data
    })
}