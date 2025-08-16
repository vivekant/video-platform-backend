import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asynchadler} from "../utils/asynchadler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asynchadler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    const limitNum=parseInt(limit,10)
    const pageNum=parseInt(page,10)
    //TODO: get all videos based on query, sort, pagination
     const skip=(pageNum-1)*limit
     const filter={}
     if(userId){
        filter.owner=userId
     }
     if(query){
        filter.$or=[
            {title:{$regex:query,$options:'i'}},
            {description:{$regex:query,$options:'i'}}
        ]
     }
     const sortConfig={}
     if(sortBy){
        sortConfig[sortBy]=sortType==='disc'?-1:1
     }

    const videos= await Video
    .find(filter)
    .sort(sortConfig)
    .skip(skip)
    .limit(limitNum)

    const totalNumOfVideo= await videos.length
    const dataToSend={
        videos,
        page:pageNum,
        videoCount:totalNumOfVideo
    } 
    res
    .status(200)
    .josn(
        new apiResponse(
            200,
            dataToSend,
            "videos fetched successfully!!!"


        )
    )








})

const publishAVideo = asynchadler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
})

const getVideoById = asynchadler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const updateVideo = asynchadler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asynchadler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asynchadler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
