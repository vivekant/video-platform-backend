import mongoose, { Schema } from 'mongoose' 
const likeSchema = new mongoose.Schema({
comment:{
    type: Schema.Types.ObjectId,
    ref:"Comments"
},
video:{
    type:Schema.Types.ObjectId,
    ref:"Video"
},
tweet:{
    type:Schema.Types.ObjectId,
    ref:"Tweet"
},
likedBy:{
    type:Schema.Types.ObjectId,
    ref:"User"
}




},{timestamps:ture})
export const Like=mongoose.model('Like',likeSchema)