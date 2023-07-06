const mongoose =require("mongoose")
const userShema=mongoose.Schema({
    Fname:String,
    Lname:String,
    email:{type:String,unique:true},
    password:String,
    varified:Boolean
})
module.exports=mongoose.model("user",userShema)