import mongoose, { Schema } from 'mongoose' 
const playlistSchema = new mongoose.Schema({
name:{
    type:String,
    required:true
},
description:{
    type:String
},
videos:[
    {
        type:Schema.Types.ObjectId,
        ref:"Video"
    }
],
owner:{
    type:Schema.Types.ObjectId,
    ref:"User"
}





})
export const Playlist=mongoose.model('Playlist',playlistSchema)