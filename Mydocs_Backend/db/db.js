const mongoose=require("mongoose")
require("dotenv").config();


const connected =async ()=>{
    console.log(process.env.DB_LINK)
    mongoose.connect(process.env.DB_LINK,{
        useNewUrlParser: true,
        useUnifiedTopology: true,

       }).then(()=>{
        console.log("Db Sucessfully connected..")
    }).catch((err)=>{
        console.log("Db Failed to connect..")
        console.log(err)
    })
}
module.exports =connected;