import mongoose from 'mongoose' 
const subscriptionSchema = new mongoose.Schema({
subcribers:{
    type:mongoose.Schema.Types.ObjectId, // users who subscribe the channel
    ref:"User"
},
channel:{
     type:mongoose.Schema.Types.ObjectId, // user who own the channel
    ref:"User"
}

},{timestamps:true})
export const Subscriptions=mongoose.model('Subscriptions',subscriptionSchema)