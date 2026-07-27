class apiError extends Error{
    constructor(statuscode,message,success,stack="",error=[]){
        super(message);
        statuscode=statuscode;
        message=message;
        success:false;
        error=error;
        if(stack){
           this.stack=stack;
        }
        else{
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export default apiError;