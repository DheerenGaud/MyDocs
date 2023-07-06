const mongoose =require("mongoose")
const requestStaus=mongoose.Schema({
    userId:String,
    projectId:String,
    status:Boolean
})
module.exports=mongoose.model("requestStaus",requestStaus)