export const apiHandler=(fn)=>{
   return async(req,res,next)=>{
    try{
        await(req,res,next)
    }
    catch(error){
        next(error)
    }
   }
}