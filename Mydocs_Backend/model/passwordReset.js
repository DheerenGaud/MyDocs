const mongoose =require("mongoose")
const PasswordResetScyema=mongoose.Schema({
    userId:String,
    resetString:String,
    createdAt:Date,
    expiredAt:Date
})
module.exports=mongoose.model("PasswordReset",PasswordResetScyema)