

class apiError extends Error{

    // over writting the constructor of Errror class(build in) of nodeJs
constructor(
    statusCode,
    message="kuchh to gadbad hai",
    error=[],
    // stack give points from where error initiate
    stack=""
){
   super(message)   
   this.statusCode=statusCode
   this.data=null
   this.message=message
   this.success=false
   this.errors=error
   if(stack){
    this.stack=stack
   }
   else{
    Error.captureStackTrace(this,this.constructor)
   }

}
}

export {apiError}