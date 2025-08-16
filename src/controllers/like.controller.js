import mongoose, {isValidObjectId} from "mongoose"
import {Like,Video,Tweet,Comments} from "../models/like.model.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asynchandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
     const userId=req.user?._id 
     const user=await User.findById(userId)
     if(!user){
        throw new apiError(404,"user not found!!!")
     }
     const videoValidation=await Video.findById(videoId)
     if(!videoValidation){
        throw new apiError(401,"video not found!!!")
     }
      const userAlreadyLiked=await Like.deleteOne({
         video:videoId,
         likedBy:userId
      })  
      

      if(userAlreadyLiked.deletedCount!=0){
       return res
        .status(200)
        .json(
         new apiResponse(200,{},"user like remove successfully")
        )
      }

   

     const result=await Like.create({
        video:videoId,
        likedBy:userId
     })

     if(!result){
        throw new apiError(500,"something went wrong while creating like document!!!")
     }
     res
     .status(200)
     .json(
        new apiResponse(200,result,"like added successfully!!!!")
     )
     
     





})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    const user=await User.findById(userId)
    if(!user){
       throw new apiError(404,"user not found!!!")
    }
    const commentValidation=await Comments.findById(commentId)
   if(!commentValidation){
    throw new apiError(400,"comment not found!!!!")
   }
   const userAlreadyLiked=await Like.deleteOne({
      comment:commentId,
    likedBy:userId
   })
   if(userAlreadyLiked.deletedCount!=0){
      return res.status(200).json(new apiResponse(200,{},"Comment's Like remove successfully!!"))
   }
  const result=await  Comments.create({
    comment:commentId,
    likedBy:userId
   })

   if(!result){
    throw new apiError(500,"like document for comment not get created!!!")

   }

   res
   .status(200)
   .json(
    new apiResponse(200,result,"like on comment saved successfully!!!")
   )



})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    const user=await User.findById(userId)
    if(!user){
       throw new apiError(404,"user not found!!!")
    }

    const tweetValidation=await Tweet.findById(tweetId)
    if(!tweetValidation){
      throw new apiError(200,"tweet not found!!!!")
    }

    const userAlreadyLiked=await Like.deleteOne({
      likedBy:userId,
      tweet:tweetId
    })
    if(userAlreadyLiked.deletedCount!=0){
      return res.status(200).json(new apiResponse(200,{},"tweet like by user removed!!!"))
    }
    const result=await Like.create({
      likedBy:userId,
      tweet:tweetId
    })
    if(!result){
      throw new apiError(500,"tweet like by user not saved!!!!")
    }
    res
    .status(200)
    .json(
      new apiResponse(200,result,"tweet like saved successfully!!!!")
    )


}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const userId=req.user?._id
    const result=await Like.aggregate([
      {
         $match:{
            likedBy:userId
         }
      },
      {
          $lookup:{
            from:"Video",
            localField: "video",
            foreignField: "_id",
            as: "video",
            pipeline:[
               {
                  $lookup:{
                     from:"User",
                     localField:"owner",
                     foreignField:"_id",
                     as:"owner"
                  }
               }
            ]
            
            
          }
      }
    ])

    res
    .status(200)
    .json(
      new apiResponse(200,result,"liked video by user fetched successfully!!!!")
    )
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}