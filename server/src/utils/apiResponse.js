export const apiResponse =(res, statuscode, message, success,data)=>{
    return res.status(statuscode).json({
        message:message,
        success:true,
        data:data
    })
}