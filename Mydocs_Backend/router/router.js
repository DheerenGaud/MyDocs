const express=require("express")
const bycrpt=require("bcryptjs")
const User=require("../model/usermodel")
const UserVarification=require("../model/userVarification")
const PasswordReset=require("../model/passwordReset")
const Router=express.Router();
const Project=require("../model/project");


// user random Srring
const {v4:uuidv4}=require("uuid")

//use for mail varificatiom and mail send to Auther to user
const nodemailer =require("nodemailer")

require("dotenv").config();

//creating nodemailer transpoter or nodemail stuff
const treanspoter=nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:process.env.AUTH_EMAIL,
        pass:process.env.AUTH_PASSWORD
    }
})

//testing  mail send successfuly from  Auth side
treanspoter.verify((err,success)=>{
    if(err){
        console.log(err);
    }
    else{
        console.log(success)
        console.log(" Redy for masseges")
    }
})

const sendemailvarification=({_id,email},res)=>{
 const currentUrl="http://localhost:3000/";
 const uniqueSting=uuidv4()+_id;

 const mailOptions={
    from :process.env.AUTH_EMAIL,
    to:email,
    subject:"Verify Your email",
    html:`<p>Verufy your email Address to complete the singup and login into Your account .<p>TRhis is the link <br>expire in 6 hourese</br></p></p>
     <p> press <a href=${currentUrl+"user/verify/"+_id+"/"+uniqueSting}> here</a> to proceed</p>`
 }

 //hash the uniguestring
 const saltRounds=10;
 bycrpt
 .hash(uniqueSting,saltRounds)
 .then((hashUniqueString)=>{
    const newverification = new UserVarification({
        userID:_id,
        uniqueString:hashUniqueString,
        createdAt:Date.now(),
        expiredAt:Date.now()+21600000,
    })
    newverification
    .save()
    .then(()=>{
        treanspoter
        .sendMail(mailOptions)
        .then(()=>{
            res.json({status:"Pending",data:" send email varifiaction "})
        })
        .catch((err)=>{
            console.log(err)
            res.json({status:"error",data:"Could not send   email varifiaction "})
        })
    })
    .catch((err)=>{
        console.log(err)
        res.json({status:"error",data:"Could ot save verification email data"})
    })
 })
 .catch((error)=>{
     res.json({status:"error",data:"An error while HASING EMAIL DATA"})
 })

}

 Router.get("/verify/:userID/:uinqueString",async(req,res)=>{
     let {userID,uinqueString}=req.params;
     UserVarification.find({userID})
     .then((result)=>{
        if(result.length>0){
            // cheking user varifiction is valid  or not by compairing the time
          const {expiredAt}=result[0];
          const hashUniqueString=result[0].uniqueString;
 
          if(expiredAt<Date.now()){
            // record is expire so we delete the user varification detail
            UserVarification
            .deleteOne()
            .then(()=>{
                User
                .deleteOne({_id:userID})
                .then(()=>{
                    let massege="An Link is Expired becuse user Not completed varification at a given time." 
                    res.json({status:"error",data:massege})
                })
                .catch((err)=>{
                    console.log(err)
                    let massege="An error occured  while deleting the user which is Not completed varification at a given time." 
                    res.json({status:"error",data:massege})
                })
            })
            .catch((err)=>{
                console.log(err)
                let massege="An error occured  while deleting the userVarifivation which is alredy expired." 
                res.json({status:"error",data:massege})
            })

          }
          else{
            // record  is valid 
           // comapire uniqueString and hashuniqueString that store in db
            bycrpt
           .compare(uinqueString,hashUniqueString)
           .then((result)=>{
            if(result){
                // Sting match 
                User
                .updateOne({_id:userID},{varified:true})
                .then(()=>{
                    //user varifiyed so now delete the userVarifiction detail
                    UserVarification
                    .deleteOne({userID})
                    .then(()=>{
                        // adding userid in Project db
                        Project
                         .create({userId:userID,notifCount:0})
                         .then(()=>{
                             let massege="succesfully varifired Go for Login." 
                             res.json({status:"ok",data:massege})
                         })
                         .catch((err)=>{
                            console.log(err)
                            res.json({status:"error",data:"Project is not creted but user varifiyd"})
                         })
                    })
                    .catch((error)=>{
                      console.log(error)
                      let massege="An error occured  while Deleting the userVarification which succesfully varifired  ." 
                      res.json({status:"error",data:massege})
                    })
                })
                .catch((error)=>{
                      console.log(error)
                      let massege="An error occured  while Updating the user Is valid ." 
                      res.json({status:"error",data:massege})
                })
            }
            else{
               // existing user record but incorrect varification detail is passed
               let massege="Invalid varification detail is passed" 
               res.json({status:"error",data:massege})
            }
           })
           .catch((err)=>{
            console.log(err);
            let massege="error ocured while compairing uinqueString" 
            res.json({status:"error",data:massege})
           })
          }
        }
        else{
        let massege="An account record does not exist or has been varified  alredy . plese singIn or login" 
        res.json({status:"error",data:massege})
        }
     })
     .catch((err)=>{
        console.log(err)
        let massege="An error occured while cheking for existing user varification " 
        res.json({status:"error",data:massege})
     })
 })


Router.post("/register",async(req,res)=>{
    const {Fname,Lname,email,password}=req.body
    // console.log(req.body)
    const encryptPassword= await bycrpt.hash(password,10)
    try {
        const oldUser= await User.findOne({email});
        
        if(oldUser){
            // console.log("user haiii")
            return res.json({error:"UserExist"})
        }else{
               // email varifaction
               await User.create({
                   Fname,Lname,email,password:encryptPassword,varified:false
                })
                .then((result)=>{
                    sendemailvarification(result,res);
                })
                .catch((err)=>{
                    res.json({status:"error",data:"Erroe occure while saveing new user"})
                })
    }
    } catch (error) {
        console.log(error)
        res.json({status:"error"})
    }
})

//Foget password
const sendResetPassword=({_id,email},redirecrURL,res)=>{
  const resetString=uuidv4()
  // first we delete all reset reacord
  PasswordReset
   .deleteMany({userId:_id})
   .then(result=>{
     // all reset reacord are deleted succesfully
     // now we can send mail for reset password
     const mailOptions={
        from :process.env.AUTH_EMAIL,
        to:email,
        subject:"Reset Your Password",
        html:`<p> You forgot yor password.<p>this is the link to update your password <br> it expire in 60 minutes</br></p></p>
         <p> press <a href=${redirecrURL+"/"+_id+"/"+resetString}> here</a> to proceed</p>`
     }
   
     // encrypting the reset string
     bycrpt
     .hash(resetString,10)
     .then(hashResetString=>{
        // storing  hashResetString in PasswordReset db
        const newPsswordReset=new PasswordReset({
            userId:_id,
            resetString:hashResetString,
            createdAt:Date.now(),
            expiredAt:Date.now()+3600000,
        });
   
        newPsswordReset
         .save()
         .then(()=>{
            treanspoter
            .sendMail(mailOptions)
            .then(()=>{
                res.json({status:"Pending",data:"email send for Reset Your Password"})
            })
            .catch((err)=>{
                console.log(err)
                res.json({status:"error",data:"Could not send   email for reset the paswword "})
            })
         })
         .catch((err)=>{
            console.log(err)
            res.json({status:"error",data:"Error occure while Saving new password reset record "})
         })


     })
     .catch((err)=>{
        console.log(err)
        res.json({status:"error",data:"Error occure while encrypting the reset string "})
     })

   })
   .catch((err)=>{
    console.log(err)
    res.json({status:"error",data:"Error occure while deleteing  privious reset record "})
   })
}


Router.post("/forgotpassword",(req,res)=>{
    const {email,redirecrURL}=req.body;
    // console.log(redirecrURL);

     User
     .find({email})
     .then((result)=>{
        if(result.length){
            if(result[0].varified){
                //send mail for reset password
                sendResetPassword(result[0],redirecrURL,res);
                  
            }
            else{
              res.json({status:"error",data:"User is not Varified  his/her email"});
            }
        }
        else{ 
            res.json({status:"error",data:"There no user exist with this email"})
        }
     })
     .catch((err)=>{
        console.log(err)
        res.json({status:"error",data:"Error occure while finding user "})
     })
})

// Acutaly reset the password
Router.post("/resetPassword",(req,res)=>{
    const {userId,resetString,newPassword,cpassword}=req.body;
    // console.log(req.body)

    PasswordReset
    .find({userId})
    .then(result=>{
        if(result.length){
          // password reset record exist
          const {expiredAt}=result[0];
          const hashResetString=result[0].resetString;
          if(expiredAt<Date.now()){
            // Link is expired for upddating yhe password
            // we delete the the record from db 
            PasswordReset
            .deleteOne({userId})
            .then(()=>{
                res.json({status:"error",data:"link is expired for Updating the Password"})
            })
            .catch((err)=>{
                console.log(err)
                res.json({status:"error",data:"Error occure while deleteing user in PasswordReset db "})
             })
          }
          else{
            //record is valid for reset the paswword 
            // we varify the resetString 
            bycrpt
             .compare(resetString,hashResetString)
             .then(result=>{
                if(result){
                    // now encrypt the new password ans store in db
                    bycrpt
                     .hash(newPassword,10)
                     .then(hashNewPassword=>{
                        // update password
                        User
                        .updateOne({_id:userId},{password:hashNewPassword})
                        .then(()=>{
                            //update complete
                            //noe delete the password reset record of user
                            PasswordReset
                            .deleteOne({userId})
                            .then(()=>{
                                res.json({status:"ok",data:"Pssword Succesfully updated"});
                            })
                            .catch((err)=>{
                                console.log(err)
                                res.json({status:"error",data:"Error occure while deleteing user in PasswordReset db "})
                             })
                        })
                        .catch((err)=>{
                            console.log(err)
                            res.json({status:"error",data:"Error occure while updating new Password"})
                         })
                     })
                     .catch((err)=>{
                        console.log(err)
                        res.json({status:"error",data:"Error occure while hashing new Password"})
                     })
                }
                else{
                    res.json({status:"error",data:"reset string not match || invalid reset string "})
                }
             })
             .catch((err)=>{
                console.log(err)
                res.json({status:"error",data:"Error occure while comparing string of resetpassword  "})
             })

          }
        }
        else{
            res.json({status:"error",data:" user is not found in PasswordReset db"})
        }
    })
    .catch((err)=>{
        console.log(err)
        res.json({status:"error",data:"Error occure while finde user in PasswordReset db "})
     })
})

  


module.exports= Router
