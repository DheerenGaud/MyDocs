const mongoose =require("mongoose")
const projectSchema=mongoose.Schema({
    userId:String,
    projects:[{pName:String,projectId:String,isAdmin:{type: Boolean, default: false }}],
    notifications:[{expiredAt:Date,fromId:String,fromName:String,projectId:String,pName:String,massage:String}],
    notifCount: { type: Number, default: 0 }
})
module.exports=mongoose.model("project",projectSchema)
