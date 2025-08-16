import mongoose, { Schema } from 'mongoose' 
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
const userSchema = new mongoose.Schema({
username:{
    type : String,
    required:true,
    trim:true,
    lowercase:true,
    index:true,
    unique:true
    
},
email:{
    type : String,
    required:true,
    trim:true,
    lowercase:true,
    index:true,
    unique:true
    
},
fullname:{
    type : String,
    required:true,
    trim:true,    
    index:true,
   
    
},
avatar:{
    type:String,
    required:true
},
coverImage:{
    type:String,
    
},
password:{
    type:String,
    required:true,
    trim:true
},
refreshToken:{
    type:String
},
watchHistory:{
    type:Schema.Types.ObjectId,
    ref:"Video"
}




},{timestamps:true});

userSchema.pre("save",async function(next){

    // the following line prevent again and again hasing(not cheap) when not any change in password if you not check this condition then whenever you set anything like avatar , profileImage then it hash password again and again
    if (!this.isModified("password")) {
        next();
        return;
    }
    this.password= await bcrypt.hash(this.password,10)
    next()

} )


// in mongoose schema  has object called methods that allow you to define a fucntion for document

userSchema.methods.isCorrectPassword= async function(password){
     const iscorrect=await bcrypt.compare(password,this.password)
    //  console.log({"databasePassword":this.password,password,iscorrect});
     
    return iscorrect;
}

// defining methods in userschema to generate access and refresh token

userSchema.methods.generateAccessToken=async function(){
    // this have access of user data thats why we use function here instead of arrow function
    // three minimum three argument you have to pass to generate jwt token
    // 1. payload in object form 
    // 2. secret or private key 
    // 3. expiry time
               const accesstoken=await jwt.sign(
                {
                    _id:this._id,
                    username:this.username,
                    fullname:this.fullname
                },
                process.env.ACCESS_TOKEN_SECRET,
                {
                    expiresIn:process.env.ACCESS_TOKEN_EXPIRY
                },
            )
            return accesstoken;
}
userSchema.methods.generateRefreshToken=async function (){
    // we store less information in refresh token because of it uses on each refresing
    const accesstoken=await jwt.sign(
        {
            _id:this._id,
           
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        },
    )
    return accesstoken;
}
export const User =mongoose.model('User',userSchema)       