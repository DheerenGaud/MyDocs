const express = require("express");
const User = require("../model/usermodel");
const Project = require("../model/project");
const Data = require("../model/data");
const RequestStatus = require("../model/requestStatus");
const Router = express.Router();

const {
  tokenVerify,
  sendNotifiction,
  acceptRequest,
  giveAccess,
  rejectRequest
} = require("../Function/index");

Router.post("/newProject", async (req, res) => {
  try {
    const { token, pName } = req.body;
    const x = await tokenVerify(token);
    if (x.status == "error") {
      return res.json(x);
    } else {
      const userId = x.data._id.toString();
      const Fname = x.data.Fname;
      const Lname = x.data.Lname;
      // console.log(Fname);
      // new projectId makin in data db
      Data.create({
        data: "<p>Welcome</p>",
        pName: pName,
        adminId: userId,
        createdAt: Date.now(),
      })
        .then((result) => {
          Data.updateOne(
            { _id: result._id }, // Match the document by its _id
            {
              $push: {
                shere: {
                  Fname: Fname,
                  Lname: Lname,
                  userId: userId,
                },
              },
            }
          )
            .then(() => {
              // all project are perent in project Db so ading projectid  in  project db
              Project.updateOne(
                { userId },
                { $push: { projects: { projectId: result._id, pName: pName ,isAdmin:true} } }
              )
                .then(() => {
                  return res.json({
                    status: "ok",
                    data: "succesfully created new Project",
                  });
                })
                .catch((err) => {
                  console.log(err);
                  return res.json({
                    status: "error",
                    data: "Error occure while Adding  new Project in projectDb",
                  });
                });
            })
            .catch((err) => {
              console.log(err);
            });
        })
        .catch((err) => {
          console.log(err);
          return res.json({
            status: "error",
            data: "Error occure while creating new Project",
          });
        });
      //  return res.json(x);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});
// Update project
Router.post("/updateProject", async (req, res) => {
  const { token, projectId, content } = req.body;
  // console.log(req.body);
  try {
    const x = await tokenVerify(token);
    if (x.status == "error") {
      return res.json({ status: "error", data: "first go for Login" });
    } else {
      const userId = x.data._id;
      Data.find({ _id: projectId })
        .then((result) => {
          // console.log("result");
          // console.log(userId.toString());
          const foundObject = result[0].shere.find(
            (item) => item.userId === userId.toString()
          );
          console.log(foundObject);
          if (result.length === 0) {
            res.json({ status: "error", data: "Project is not exist" });
          } else if (foundObject || userId.toString() === result[0].adminId) {
            Data.updateOne(
              { _id: projectId },
              { data: content, updatedAt: Date.now() }
            )
              .then(() => {
                res.json({
                  status: "ok",
                  data: "Succesfully updated data of project",
                });
              })
              .catch((err) => {
                console.log(err);
                res.json({
                  status: "error",
                  data: "error occure while updating data of project",
                });
              });
          } else {
            res.json({
              status: "error",
              data: "You have no access to the content",
            });
          }
        })
        .catch((err) => {
          console.log(err);
          res.json({
            status: "error",
            data: "error occure while finding project",
          });
        });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

Router.post("/giveAccessTo", async (req, res) => {
  const { toUserId, token, projectId, massage, noid } = req.body;
  // console.log(req.body);
  try {
    const x = await tokenVerify(token);
    if (x.status == "error") {
      return res.json({ status: "error", data: "first go for Login" });
    } else {
      const adminId = x.data._id;
      if (adminId.toString() === toUserId) {
        res.json({
          status: "error",
          data: "user Alredy have access",
        });
      } else {
        //firest chek project is belong to admin
        Data.find({ _id: projectId, adminId: adminId })
          .then((result) => {
            if (result.length === 0) {
              res.json({ status: "error", data: "Project is not exist" });
            } else {
              // console.log(result);

              const foundObject = result[0].shere.find(
                (item) => item.userId === toUserId
              );
              if (foundObject) {
                res.json({
                  status: "error",
                  data: "user Alredy have access",
                });
              } else {
                // to chek the the user is exist or not
                User.find({ _id: toUserId })
                  .then((a) => {
                    // console.log(toUserId)
                    if (a[0].varified) {
                      // chek suer alredy have acces or not
                      RequestStatus.findOne({
                        userId: toUserId,
                        projectId: projectId,
                      })
                        .then((m) => {
                          if (!m) {
                            // send user access
                            if (noid.length !== 0) {
                              Project.findOneAndUpdate(
                                { userId: adminId },
                                { $pull: { notifications: { _id: noid } } },
                                { new: true }
                              )
                                .then(() => {
                                  giveAccess(
                                    projectId,
                                    toUserId,
                                    adminId,
                                    x.data.Fname,
                                    result[0].pName,
                                    massage,
                                    res
                                  );
                                })
                                .catch((err) => {
                                  console.log(err);
                                  res.json({
                                    status: "error",
                                    data: "error occure while find deleting notification that you rsend the request",
                                  });
                                });
                            } else {
                              giveAccess(
                                projectId,
                                toUserId,
                                adminId,
                                x.data.Fname,
                                result[0].pName,
                                massage,
                                res
                              );
                            }
                          } else {
                            res.json({
                              status: "error",
                              data: "user Alredy have access",
                            });
                          }
                        })
                        .catch((err) => {
                          console.log(err);
                          res.json({
                            status: "error",
                            data: "error occure while find RequestStatus of user to give access of project",
                          });
                        });
                    } else {
                      res.json({
                        status: "error",
                        data: "User is not varifiyed yet",
                      });
                    }
                  })
                  .catch((err) => {
                    console.log(err);
                    res.json({
                      status: "error",
                      data: "error occure while find user to give access of project",
                    });
                  });
              }
            }
          })
          .catch((err) => {
            console.log(err);
            res.json({
              status: "error",
              data: "error occure while find the poject ",
            });
          });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

Router.post("/notificationResponce", async (req, res) => {
  const { notId, token, responses, fromId, pName, projectId } = req.body;
  try {
    const x = await tokenVerify(token);
    if (x.status == "error") {
      return res.json({ status: "error", data: "first go for Login" });
    } else {
      const userId = x.data._id;
      const username = x.data.Fname;
      const sername = x.data.Lname;

      if (responses === "accepted") {
        let massage = "Accept your request";
        Data
        .find({_id:projectId})
        .then((result)=>{
            // console.log(result)
             if(result.length===0){
              Project.findOneAndUpdate(
                { userId: userId },
                { $pull: { notifications: { _id: notId } }}
              ).then(()=>{
                return res.json({status:"error",data:"Admin deleted project "})
              }).catch((error)=>{
                console.log(error)
                return res.json({status:"error",data:"error ocure while deleteing notificatio project"})
              })
             }
             else{
              sendNotifiction(
                userId,
                fromId,
                pName,
                projectId,
                res,
                massage,
                username
              );
              acceptRequest(
                userId,
                fromId,
                projectId,
                notId,
                pName,
                res,
                username,
                sername
              );
             }
        })
        .catch((error)=>{
              console.log(error)
              return res.json({status:"error",data:"error ocure while finding project"})
        })
      
     
        
      } else if (responses === "reject") {
        let massage = "User Discarded your request";
        Data
        .find({_id:projectId})
        .then((result)=>{
          if(result.length===0){
            Project.findOneAndUpdate(
              { userId: userId },
              { $pull: { notifications: { _id: notId } }}
            ).then(()=>{
              return res.json({status:"error",data:"Admin deleted project "})
            }).catch((error)=>{
              console.log(error)
              return res.json({status:"error",data:"error ocure while deleteing notificatio project"})
            })
          }
          else{
            sendNotifiction(
              userId,
              fromId,
              pName,
              projectId,
              res,
              massage,
              username
            );
            rejectRequest(userId, projectId, notId, res);
          }
        })
        .catch(()=>{

        })
      } else if (responses === "resend") {
      } else if (responses === "ok") {
        // now user reject so we deleting the user for access
        // RequestStatus.deleteOne({ fromId, projectId })
        //   .then((result) => {
        //     if (result.deletedCount == 0) {
        //       res.json({
        //         status: "error",
        //         data: "usrr is not exist RequestStatus db ",
        //       });
        //     } else {
        //       console.log(result);
        //       return res.json({
        //         status: "ok",
        //         data: "You remove access from user",
        //       });
        //     }
        //   })
        //   .catch((err) => {
        //     console.log(err);
        //     res.json({
        //       status: "error",
        //       data: "Error occurred while deleting the user in requestStatus db i=beuz it accept the request",
        //     });
        //   });
        if (notId.length !== 0) {
          Project.findOneAndUpdate(
            { userId: userId },
            { $pull: { notifications: { _id: notId } } },
            { new: true }
          )
            .then(() => {
              res.json({
                status: "ok",
                data: "cleare the notification",
              });
            })
            .catch((err) => {
              console.log(err);
              res.json({
                status: "error",
                data: "error occure while find deleting notification that you rsend the request",
              });
            });
        } else {
          res.json({
            status: "error",
            data: "error occure while deleying notification that you saw",
          });
        }
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});


Router.post("/removeAccess", async (req, res) => {
  const { user, projectId, token, pName } = req.body;
  // console.log(req.body);
  let massage = "Admin remove access from the Project";
  try {
    const x = await tokenVerify(token);
    const adminId = x.data._id;
    // console.log(x)
    if (x.status == "error") {
      return res.json({ status: "error", data: "first go for Login" });
    } else {
      Data.find({ _id: projectId, adminId: adminId })
        .then((result) => {
          if (result.length === 0) {
            return res.json({
              status: "error",
              data: "you have no access or project not exist",
            });
          } else {
            // to remove access from all user array
            if (result[0].adminId === user) {
              return res.json({ status: "error", data: "you are admin" });
            } else {
              Project.findOneAndUpdate(
                { userId: user },
                {
                  $pull: {
                    projects: { projectId: projectId },
                    notifications: { projectId: projectId },
                  },
                }
              )
                .then((result) => {
                  // after delete the project and notification send new notificatjion
                  sendNotifiction(
                    adminId,
                    user,
                    pName,
                    projectId,
                    res,
                    massage,
                    x.data.Fname
                  );

                  // io.on('connection', (socket) => {
                  //   socket.to(user).emit("new__notification");
                  // });
                  // socket.emit("join__room", user);
                  // socket.emit("update__notification",user,() => {
                  //   console.log("notification update send")
                  // });
                  // socket.disconnect(true);
                 
                 
                })
                .catch((err) => {
                  console.log(err);
                  return res.json({
                    status: "error",
                    data: "An error occurred while deleting the project and associated notifications",
                  });
                });
            }

            // then now delete user from shere array
            Data.findOneAndUpdate(
              { _id: projectId },
              { $pull: { shere: { userId: user } } }
            )
              .then((result) => {
                if (!result) {
                  return res.json({
                    status: "error",
                    data: "admin not found or project not found",
                  });
                } else {
                  return res.json({
                    status: "ok",
                    data: "Successflly remove access",
                  });
                }
              })
              .catch((err) => {
                console.log(err);
                return res.json({ error: "internal error" });
              });
          }
        })
        .catch((err) => {
          console.log(err);
          return res.json({
            error: "error occre while find user or project in data db",
          });
        });
    }
  } catch (error) {
    console.log(error);
    return res.json({ error: "internal error" });
  }
});

//view or Edit
Router.post("/", async (req, res) => {
  const { projectId, token } = req.body;
  try {
    const x = await tokenVerify(token);
    if (x.status == "error") {
      return res.json({
        status: "error",
        data: "first go for Login",
        redirect: projectId,
      });
    } else {
      const userId = x.data._id.toString();
      Data.find({ _id: projectId })
        .then((result) => {
          if (result.length > 0) {
            const foundObject = result[0].shere.find(
              (item) => item.userId === userId
            );
            if (foundObject || result[0].adminId === userId) {
              return res.json({
                status: "ok",
                access: "edit",
                data: result[0],
              });
            } else {
              console.log(result[0]);
              return res.json({
                status: "ok",
                access: "view",
                data: result[0],
              });
            }
          } else {
            return res.json({ status: "error ", data: "project is not found" });
          }
        })
        .catch((err) => {
          console.log(err);
          return {
            status: "error",
            data: "error occore while finding project",
          };
        });
    }
  } catch (error) {
    console.log(error);
    return { status: "error", data: "intrnal error" };
  }
});

// all user list
Router.get("/allUser", async (req, res) => {
  const { query } = req.query;
  try {
    User.find({varified:true}, { _id: 1, Fname: 1, Lname: 1 })
      .then((result) => {
        if (!query && query.length !== 0) {
          result = result
            .filter(
              (user) =>
                user.Fname.toLowerCase().includes(query) ||
                user.Fname.toLowerCase().includes(query)
            )
            .splice(1, 10);
        }
        return res.json({ status: "ok", data: result });
      })
      .catch((err) => {
        console.log(err);
        return {
          status: "error",
          data: "error occure while finding all user list",
        };
      });
  } catch (err) {
    console.log(err);
    return { status: "error", data: "intrnal error" };
  }
});

//viewNotification
Router.post("/viewNotification", async (req, res) => {
  const { token } = req.body;
  // console.log(token);
  try {
    const x = await tokenVerify(token);
      // console.log(x)
    if (x.status == "error") {
      return res.json({
        status: "error",
        data: x.data,
      });
    } else {
      const userId = x.data._id;
      // console.log(userId);
      Project.findOneAndUpdate(
        { userId: userId },
        { $set: { notifCount: 0 }},
        { new: true }
      )
        .then((result) => {
          // console.log(result)
          if (!result) {
            return res.json({
              status: "error",
              data: "user not found while clraring notification count ",
            });
          } else {
            return (
              res.
              json({
                status: "ok",
                data: "Suucessfully cleared the notification count",
              })
            );
          }
        })
        .catch((err) => {
          console.log(err);
          return res.json({
            status: "error",
            data: "error occure while finding user fore clear notification ",
          });
        });
    }
  } catch (err) {
    console.log(err);
    return res.json({ status: "error", data: "internal error " });
  }
});

Router.post("/deleteProject", async (req, res) => {
  const { token, projectId } = req.body;
  try {
    const x = await tokenVerify(token);
    if (x.status == "error") {
     return res.json({ status: "error", data: "first go for Login" });
    }
     else
    {
      const adminId = x.data._id;
      // console.log(projectId);
      //first find who have access of project
      Data.find({ _id: projectId ,adminId:adminId})
        .then((result) => {
          if (!result) {
            return res.json({ status: "error", data: "Project not found" });
          } else {
            const currentDate = new Date();
            const oneWeekLater = new Date(
              currentDate.getTime() + 7 * 24 * 60 * 60 * 1000
            );
            let massage = "Admin deleted the Project";
        
            const adminIdsToDelete = result[0].shere.map((obj) => obj.userId);
            console.log(adminIdsToDelete);
            const bulkOps = [];
            // Perform the $pull operation to remove projects and notifications
            bulkOps.push({
              updateMany: {
                filter: {
                  userId: { $in: adminIdsToDelete },
                },
                update: {
                  $pull: {
                    projects: { projectId: projectId },
                    notifications: { projectId: projectId },
                  },
                },
              },
            });

            // Perform the $push operation to add a new notification
            const array = adminIdsToDelete.filter((id)=> id!==adminId.toString())
            bulkOps.push({
              updateMany: {
                filter: {
                  userId: { $in: array },
                },
                update: {
                  $push: {
                    notifications: {
                      $each: [
                        {
                          expiredAt: oneWeekLater,
                          fromId: adminId,
                          fromName: x.data.Fname,
                          projectId: projectId,
                          pName: result.pName,
                          massage: massage,
                        },
                      ],
                    },
                  },
                 $inc:{ notifCount: 1}
                },
              },
            });

            // Execute the bulk operations
            Project.bulkWrite(bulkOps)
              .then(() => {
                Data.deleteOne({ _id: projectId })
                  .then(() => {
                    Project.findOneAndUpdate(
                      {},
                      {
                        $pull: {
                          notifications: { projectId: projectId },
                        },
                      }
                    )
                      .then(() => {
                        return res.json({
                          status: "ok",
                          data: "Successfully deleted project",
                          value:adminIdsToDelete,
                        });
                      })
                      .catch((err) => {
                        console.log(err);
                        return res.json({
                          status: "error",
                          data: "Error occur delete all notification  admin",
                        });
                      });
                  })
                  .catch((err) => {
                    console.log(err);
                    return res.json({
                      status: "error",
                      data: "Error occure while Deleteing project",
                    });
                  });
              })
              .catch((err) => {
                console.log(err);
                return res.json({
                  status: "error",
                  data: "eooro occore when delete many of notification",
                });
              });
          }
        })
        .catch((err) => {
          console.log(err);
          return res.json({
            status: "error",
            data: "you have no access to delete",
          });
        });
      //remove accesss thane delete project
    }
  } catch (error) {
    console.log(error);
    return res.json({ data: "internal error", status: "error" });
  }
});

module.exports = Router;
