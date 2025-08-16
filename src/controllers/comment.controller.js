import mongoose from "mongoose"
import {Comment} from "../models/comments.models.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asynchandler} from "../utils/asynchandler.js"

const getVideoComments = asynchandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    // for pagination 
    const {page = 1, limit = 10} = req.query
    const comments=await Comment.aggregate([
        {
            $match:{
                video:new mongoose.Types.ObjectId(videoId)
            }
        },
        {
           $lookup:{
            from:"users",
            localField:"owner",
            foreignField:"_id",
            as:'owner',
            pipeline:[
                {$project:{
                    username:1,
                    avatar:1,
                    coverImage:1,
                    fullName:1
                    }}
            ]
           }
        }
        
    ])

    res
    .status(200)
    .json(
        new apiResponse(200,comments,"comments of the video fetched successfully!")
    )

})

const addComment = asynchandler(async (req, res) => {
    // TODO: add a comment to a video
   const {content}=req.body
   const userid=req.user?._id
   const {videoId}=req.params
   if(!content){
    throw new apiError(400,"content is empty!!!")
   }
   if(!userid){
    throw new apiError(400,"user is not loggedIn !!!")
   }
   if(!videoId){
    throw new apiError(400,"videoId is missing!!!")
   }


  const result= await Comment.create({
    content,
    owner:userid,
    video:videoId
   })

   if(result){
    throw new apiError(500,"comment not added try again!!!!")
   }

   res
   .status(200)
   .json(
    new apiResponse(200,result,"comment added successfully")
   )


})

const updateComment = asynchandler(async (req, res) => {
    // TODO: update a comment
    const {content}=req.body
    const userid=req.user?._id
    const {videoId}=req.params
    if(!userid){
        throw new apiError(400,"user is not loggedIn")
    }
    if(!videoId){
        throw new apiError(400,"Video id is missing!!!!")
    }

    const commentss=await Comment.find({
        owner: mongoose.Types.ObjectId(userid),
        video: mongoose.Types.ObjectId(videoId)
    })
    if(!commentss){
        throw new apiError(400,"commnet not found")
    }

    commentss.content=content
    await commentss.save({ validateBeforeSave: false })
    res.status(200)
    .json(
        new apiResponse(200,{},"comment updated successfully!!!!")
    )

})

const deleteComment = asynchandler(async (req, res) => {
    // TODO: delete a comment
    const {content}=req.body
    const userid=req.user?._id
    const {videoId}=req.params
    if(!userid){
        throw new apiError(400,"user is not loggedIn")
    }
    if(!videoId){
        throw new apiError(400,"Video id is missing!!!!")
    }

    const result=await Comment.deleteOne({
        owner: mongoose.Types.ObjectId(userid),
        video: mongoose.Types.ObjectId(videoId),
        content
    })
    if(result.deletedCount===0){
        throw new apiError(400,"commnet not found")
    }

    res.status(200)
    .json(
        new apiResponse(200,{},"comment deleted successfully!!!")
    )



})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }




