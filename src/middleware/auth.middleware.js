import jwt from 'jsonwebtoken'
import {User} from '../models/user.models.js'
import {apiError} from '../utils/apiError.js'
import {asynchandler} from '../utils/asynchandler.js'




export const verifyjwt= asynchandler(

    async (req,_,next) => {
     
      

       try {
         // req.coockies not work in mobile so we use req.header work in mobile
         // use of coockies is possible because we did app.use(cookie parser in app.js)
         // the the data we sent in cookies in usermodel.js at line 85, the name you given there that you have to user here for access accessToken
         const token=await req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
 
         if(!token){
             throw new ApiError(400,"unauthorised request!!!!")
         }
         
       const decodeToken= await jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
 
       const user=await User.findById(decodeToken._id).select("-password -refreshToken")

       
      if(!user){
         throw new apiError(401,"Invalid access token")
      }
       // adding user data   in req by following line which makes user data accessible at logout of  user.routes.js  at line 255
     req.user=user 
     next()
       
       
       } catch (error) {
        throw new apiError(401, error?.message || "Invalid access token!!!")

       }
      
      
      
      
      }


)
