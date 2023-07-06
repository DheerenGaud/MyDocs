const mongoose =require("mongoose")
const dataSchema=mongoose.Schema({
    data:String,
    adminId:String,
    pName:String,
    createdAt:Date,
    updatedAt:Date,
    shere:[{Fname:String,Lname:String,userId:String}],
})
module.exports=mongoose.model("data",dataSchema)
