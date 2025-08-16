
//  here we actually making a wrapper function such that we dont have to do same thing again and again like in handeling request there many lines of code for error and response so we will write it only ones here and then whenever i need to handel these thing then we call this function aand pass a function inside it as argument



// here we define asynhandle function by two ways-->
// using  1. try-catch   2. promise
// 
const asynchandler=(requesthandler)=>{
return (req,res,next) => {

    Promise.resolve(requesthandler(req,res,next)).catch((err) => {
      next(err)
    }
    )
  
}

}


export {asynchandler}



// const asynchandler=(fn)=>(req,res,next) => {
  
//     try {
//         await fn(req,res,next)
//     } catch (err) {
//         // sending status code with json data for fronted so that  they can get function call get successfule for not and message of error
//         res.sataus(err.code || 200).json({
//             sucess:false,
//             message:err.message
//         })
//     }
// }
