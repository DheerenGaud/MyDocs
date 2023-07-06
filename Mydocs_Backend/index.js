const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyparser = require("body-parser");
const bycrpt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./model/usermodel");
const Router = require("./router/router.js");
const Router2 = require("./router/router2");
const { tokenVerify } = require("./Function/index");
const Project = require("./model/project");
const connected = require("./db/db");
require("dotenv").config();


app = express();


app.use(cors({ origin: "http://localhost:3000", methods: ["GET", "POST"] }));
app.use(express.json());
app.use(bodyparser.urlencoded({ extended: true }));

// const connected = async () => {
//   try {
//     await mongoose.connect("mongodb://0.0.0.0:27017/Authentication", {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//     console.log("database is connected...");
//   } catch (error) {
//     console.log("some error in connecting database");
//   }
// };


connected();

app.use("/user", Router);
app.use("/project", Router2);

app.post("/login-user", async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body)
  const user = await User.findOne({ email });

  if (!user) {
    return res.json({ error: "user not found", redirect: "" });
  } else {
    if (!user.varified) {
      return res.json({ error: "User is not varified" });
    }
    if (await bycrpt.compare(password, user.password)){
      const token = jwt.sign({ email: user.email }, process.env.JWT_SECREAT, {
        expiresIn: 3600, //to expire the token in 3600sec
      });
      if (res.status(201)) {
        return res.json({ status: "ok",data:  token });
      } else {
        return res.json({ error: "Error" });
      }
    }
    return res.json({ status: "error", error: "INVALID PASSWORD" });
  }
});

app.post("/userData", async (req, res) => {
  try {
    const { token } = req.body;
    const result = await tokenVerify(token);
    // console.log(result)
    if (result.status === "error") {
         return res.json(result);

    } else {
      const userId = result.data._id;
      // console.log(userId);
      Project.findOneAndUpdate(
        { userId: userId },
        { $pull: { notifications: { expiredAt: { $lt: Date.now() } } } },
        { new: true }
      )
      .then((x) => {
          if (!x) {
            // Handle the case when no document was found for the given userId
            return res.json({
              status: "error",
              data: "No user found",
              redirect: "",
            });
          } else {
            // console.log(x);
            res.json({
              status: "ok",
              data: {
                userId:x.userId,
                Fname:result.data.Fname,
                projects: x.projects,
                notifications: x.notifications,
                notifCount: x.notifCount,
              },
            });
          }
        })
        .catch((err) => {
          console.log(err);
          return res.json({
            status: "error",
            data: "Error while updating user ",
          });
        });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(9000,()=>{
  console.log(" server is listen on port 9000")
})

