const jwt=require("jsonwebtoken")
const User=require("../model/usermodel")
const Project = require("../model/project");
const RequestStatus = require("../model/requestStatus");

const Data = require("../model/data");
require("dotenv").config();


exports.tokenVerify=async(token)=>{
    try {
      const user=jwt.verify(token,process.env.JWT_SECREAT,(err,res)=>{
          if(err){
              return "token expire"
          }
          return res;
      })
      const userEmail=user.email
      if(user=="token expire"){
          return {status:"error",data:"token expire"}
      }
      const userInfo= await User.findOne({email:userEmail})
      if(userInfo){

       return {status:"ok",data:userInfo}
      }
      else{
          return {status:"error"}
      }
     } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}

exports.sendNotifiction=(userId,fromId,pName,projectId,res,massage,username)=>{
    const currentDate = new Date(); 
    const oneWeekLater = new Date(
      currentDate.getTime() + 7 * 24 * 60 * 60 * 1000
    );
    
    Project.updateOne(
        { userId: fromId },
        {
          $push: {
            notifications: {
              expiredAt: oneWeekLater,
              fromId: userId,
              fromName: username,
              projectId: projectId,
              pName:pName,
              massage: massage,
            },
          },
          $inc:{ notifCount: 1} 
        }
      )
        .then((result) => {
          if (!result) {
            // Handle the case when no document was found for the given userId
            return res.json({ status: "error", data: "fromId not found" });
          }
        })
        .catch((err) => {
          console.log(err);
          res.json({
            status: "error",
            data: "error occure while Updaing data db by adding notification  ",
          });
        });
}

exports.acceptRequest=(userId,adminId,projectId,notId,pName,res,Fname,Lname)=>{
    Project.findOneAndUpdate(
        { userId: userId },
        { $pull: { notifications: { _id: notId } },$push:{projects:{pName,projectId}}},{ new: true }
      )
        .then((result) => {
          if (!result) {
            // Handle the case when no document was found for the given userId
            return res.json({ status: "error", data: "user is not found" });
          }
          else{
           RequestStatus
          .deleteOne({userId,projectId})
          .then((result)=>{
              if(result.deletedCount==0){
                res.json({
                    status: "error",
                    data: "usrr is not exist RequestStatus db ",
                  });
              }
              else{
                Data
                .updateOne({_id:projectId},{$push:{shere:{userId:userId,Fname:Fname,Lname:Lname}}})
                .then((result)=>{
                  return  res.json({
                        status: "ok",
                        data: "Successfully send the responce",
                      });
                  })
                .catch((err)=>{
                    console.log(err);
                    res.json({
                      status: "error",
                      data: "Error occurred while Updating data db by ading new user in shere array",
                    });
                })
            }
          })
          .catch((err)=>{
            console.log(err);
            res.json({
              status: "error",
              data: "Error occurred while deleting the user in requestStatus db i=beuz it accept the request",
            });
          })
        }
        })
        .catch((err) => {
          console.log(err);
          res.json({
            status: "error",
            data: "Error occurred while updaing project db by ading new peoject that give by admin access the element",
          });
        });
}

exports.giveAccess=(projectId,toUserId,adminId,fromName,pName,massage,res)=>{
          const currentDate = new Date(); // Get the current date
          const oneWeekLater = new Date(
            currentDate.getTime() + 7 * 24 * 60 * 60 * 1000
          );
          Project.updateOne(
            { userId: toUserId },
            {
              $push: {
                notifications: {
                  expiredAt: oneWeekLater,
                  fromId: adminId,
                  fromName: fromName,
                  projectId: projectId,
                  pName: pName,
                  massage: massage,
                },
              },
              $inc:{ notifCount:1} 
            }
          )
            .then(() => {
                RequestStatus
                .create({userId:toUserId,projectId:projectId,status:false})
                .then(()=>{

                    res.json({
                      status: "ok",
                      data: "Access is given to User",
                    });
                })
                .catch((err)=>{
                    console.log(err);
                    res.json({
                      status: "error",
                      data: "error occure while vcreating RequestStatus db by sating status is false  ",
                    });
                })
                
            })
            .catch((err) => {
              console.log(err);
              res.json({
                status: "error",
                data: "error occure while Updaing data db by adding notification  ",
              });
            });
}

exports.rejectRequest=(userId,projectId,notId,res)=>{
  Project.findOneAndUpdate(
    { userId: userId },
    { $pull: { notifications: { _id: notId } }},{ new: true }
  )
    .then((result) => {
      if (!result) {
        return res.json({ status: "error", data: "user is not found" });
      }
      else{
        RequestStatus
        .deleteOne({userId,projectId})
        .then((result)=>{
            if(result.deletedCount==0){
              res.json({
                  status: "error",
                  data: "usrr is not exist RequestStatus db",
                });
            }
            else{
              res.json({
                status: "ok",
                data: "successfully rejected request"
              });
          }
        })
        .catch((err)=>{
          console.log(err);
          res.json({
            status: "error",
            data: "Error occurred while deleting the user in requestStatus db reject he request",
          });
        })
      }
    })
    .catch((err)=>{
      console.log(err);
      res.json({
        status: "error",
        data: "Error occurred while deleting the user in requestStatus db it reject the request",
      });
    })

}

exports.removeAccess=(userId,projectId,fromId,res)=>{
  Data
  .findOneAndUpdate({adminId:userId,_id:projectId},{ $pull: {shere:{userId:fromId}}},{new:true})
  .then((result)=>{
   console.log(result)
   if (!result) {
     // Handle the case when no document was found for the given userId
     return res.json({ status: "error", data: "User not found" });
   }
   else{
    RequestStatus
    .deleteOne({fromId,projectId})
    .then((result)=>{
        if(result.deletedCount==0){
          res.json({
              status: "error",
              data: "usrr is not exist RequestStatus db ",
            });
        }
        else{
          console.log(result)
          return res.json({ status: "ok", data: "You remove access from user" });
      }
    })
    .catch((err)=>{
      console.log(err);
      res.json({
        status: "error",
        data: "Error occurred while deleting the user in requestStatus db i=beuz it accept the request",
      });
    })

   }
  })
  .catch((err)=>{
      console.log(err);
      return res.json({ status: "error", data: "error occoure while updating data db by deleting meber access" });
  })
}

exports.findProject=(projectId)=>{
  try {
     Data.
     find({_id:projectId})
     .then((result)=>{
         if(result.length>0){
            console.log(result[0])
            return {data:result[0]}
         }
         else{
          return {data:"project not found"}
         }
     })
     .catch((err)=>{
       console.log(err)
       return {status:"error",data:"error occore while finding project"}
     })
    
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: "Internal server error" });
  }
}

