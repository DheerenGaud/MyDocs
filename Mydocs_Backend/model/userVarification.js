const mongoose =require("mongoose")
const userVarification=mongoose.Schema({
    userID:String,
    uniqueString:String,
    createdAt:Date,
    expiredAt:Date
})
module.exports=mongoose.model("userVarification",userVarification)