const express= require("express")
const {Server}=require("socket.io")
const cors=require("cors")
const http =require("http")


const app= express();
const server=http.createServer(app);

app.use(cors())


let onlineUser=[];

const addUser=(userId,socketId)=>{
     !onlineUser.some((user)=>user.userId===userId)&&onlineUser.push({userId:userId,socketId:socketId})
}

const removeUser =(socketId)=>{
     onlineUser=onlineUser.filter((user)=>user.socketId!==socketId)
}

const getUser =(userId)=>{
     return onlineUser.find((user)=> user.userId===userId)
}
const io=new Server(server,{
   cors:{
    origin: 'http://localhost:3000',
    methods: ['GET','POST'],
   }
})

io.on("connection",(socket)=>{

      socket.on("join__room",(data)=>{
        socket.join(data);
        const clientsInRoom = io.sockets.adapter.rooms.get(data);
        // console.log(clientsInRoom);
        // console.log(clientsInRoom.size);
        if (clientsInRoom && clientsInRoom.size > 1) {
          const socketsInRoom = Array.from(clientsInRoom);
          const id=socketsInRoom[0];
          io.to(id).emit("_____",socket.id);
          // Room already has other clients
          io.to(socket.id).emit("isUserAllredy", true);
          
        }
        else{
          io.to(socket.id).emit("isUserAllredy", false);
        }
      })
      
      socket.on("disconnect",()=>{
        removeUser(socket.id)
      })


      socket.on("newUser",(userId)=>{
        // console.log(userId);
         addUser(userId,socket.id)
      })

      socket.on("send__massage",(data)=>{
        socket.to(data.room).emit("receive__massage",data.massage)
      })
      
      socket.on("send__massage_To",(data)=>{
        // console.log(data);
        io.to(data.to).emit("receive__massage",data.massage)
      })
      
      socket.on("update__notification",(data)=>{
        // console.log("update " +data);
        try {
          const recever=getUser(data)
          io.to(recever.socketId).emit("new__notification");
        } catch (error) {
          console.log(error)
        }
      })

    })
    



server.listen(8080,()=>{
    console.log("Socket server is listen on port 8080")
})
