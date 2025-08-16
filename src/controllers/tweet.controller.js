import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js"
import { apiError, apiError } from "../utils/apiError.js"
import { apiResponse, apiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asynchandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const userId = req.user._id




    const { content } = req.body
    if (!userId) {
        throw new apiError(400, "user is not loggedIN!!!!")
    }

    const user = await User.findById(userId)
    if (!user) {
        throw new apiError(400, "user not found!!!!")
    }

    if (!content) {
        throw new apiError(400, "no content to add in tweet!!!!!")
    }

    const result = await Tweet.create({
        content,
        owner: userId
    })

    if (!result) {
        throw new apiError(500, "tweet not get added!!!")
    }

    res
        .status(200)
        .json(
            new apiResponse(200, result, "tweet get added successfully!!!!!")
        )





})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets

    const userId = req.user?._id
    if (!userId) {
        throw new apiError(400, "user is not loggedIn")
    }
    const user = await User.findById(userId)
    if (!user) {
        throw new apiError(400, "user not found!!!!")
    }
    const result = await Tweet.aggregate([
        {
            $match: {
                owner: mongoose.Types.ObjectId(userId)
            }
        },
        {
            $project: {
                content: 1
            }
        }
    ])

    if (!result) {
        throw new apiError(400, "no tweet are there!!!!")
    }

    res
        .status(200)
        .json(
            new apiResponse(200, result, 'tweet fetched successfully!!!')
        )











})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet

    const userId = req.user?._id
    const tweetId = req.params
    const { content } = req.body
    if (!userId) {
        throw new apiError(400, "user is not loggedIn!!!!")
    }
    const user = await User.findById(userId)
    if (!user) {
        throw new apiError(400, "user not found!!!!")
    }

    if (!tweetId) {
        throw new apiError(400, "tweetId is not valid!!!")
    }
    if (!content) {
        throw new apiError(400, "new tweet content is not there!!!")
    }

    const tweet = await Tweet.find({
        _id: mongoose.Types.ObjectId(tweetId),
        owner: mongoose.Types.ObjectId(userId)

    })
    if (!tweet) {
        throw new apiError(400, "tweet not found !!!")
    }
    tweet.content = content
    await tweet.save({ validateBeforeSave: false })

    res
        .status(200)
        .json(
            new apiResponse(200, {}, "tweet edited successfully!!!!")
        )








})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const userId = req.user?._id
    const tweetId = req.params
    if (!userId) {
        throw new apiError(400, "user is not loggedIn")
    }
    const user = await User.findById(userId)
    if (!user) {
        throw new apiError(400, "user not found!!!!")
    }
    if (!tweetId) {
        throw new apiError(400, "tweetId is not valid!!!")
    }

    const result = await Tweet.deleteOne({
        _id: mongoose.Types.ObjectId(tweetId),
        owner: mongoose.Types.ObjectId(userId)
    })

    if (result.deleteCount === 0) {
        throw new apiError(400, "tweet not found")
    }

    res
        .status(200)
        .json(
            new apiResponse(200, {}, "tweet deleted successfully!!!!")
        )




})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
