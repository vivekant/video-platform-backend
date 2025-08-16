import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv/config'
import cookieParser from 'cookie-parser'
const app=express()
app.use(cors({
    origin:process.env.ORIGIN,
    credentials:true
    
}))


// limiting the input data size comming in form of json 
// traditional way of taking json file is use of body parser but now there facility in express is build in
app.use(express.json({limit:"20kb"}))



// express.urlencoded middleware parses URL-encoded request bodies, useful for handling HTML form data. extended: true allows nested objects; false doesn’t.
// nested object means--> object inside a object
app.use(express.urlencoded({
    extended:true,limit:"20kb"
}))


// we can take file from client and save in public folder and anyone can see the file inside public folder(name can be anything)
app.use(express.static("public"))


app.use(cookieParser());



// import router that i made
import userRouter from './routes/user.routes.js'
import userrouter1 from './routes/comment.routes.js'




app.use('/api/v1/users',userRouter)
























// app.get('/',(req,res) => {
//   res.send("Dhara is very humber and nice girl!!")
// }
// )    

// app.listen(process.env.port || 8000 , () => {
//   console.log("server is running!!!");
  
// }
// )

export default app

