const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
require('dotenv').config();
// const {createClient}=require('redis');
// const {createAdapter, createAdapter}=require("@socket.io/redis-adapter");

const Message = require("./models/Message");
const FollowStatus=require('./models/FollowStatus');
const Follow=require('./models/Follow');
const User=require('./models/User')

// mondodb connection 

mongoose.connect(`${process.env.MONGODB_URI}`)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("DB Error:", err));

// mongoose.connect("mongodb://127.0.0.1:27017/EcommercePro")
//   .then(() => console.log("MongoDB Connected"))
//   .catch((error)=>console.log('mongo connection error',error))

const app = express();   // instance of express
const server = http.createServer(app);  //http server

const cors = require("cors");  // for communication of diferent post req
app.use(cors({ origin: "*" }));   // * for all page 
app.use(express.json());   //


// socket io server 
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const onlineUsers = {};  // all connected sockets
 
// this is used to fetch last 30 messages  not older only plast 30
app.get("/messages/:user1/:user2", async (req, res) => {
  const { user1, user2 } = req.params;
  // const limit=30;

  try {
    const messages = await Message.find({
      $or: [
        { from: user1, to: user2 },
        { from: user2, to: user1 },
      ],
    }).sort({ createdAt: -1 }).limit(20);

    res.json(messages.reverse());  // reverse so chat show correct order
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// this is used to fetch older messages fetching 30-30 messages only....
app.get('/message/:user1/:user2/before/:cursor',async(req,res)=>{
  const {user1,user2,cursor}=req.params;
  // const limit=30
  try{
    const messages=await Message.find({
      $or:[{from:user1,to:user2},{from:user2,to:user1}],
      createdAt:{$lt:new Date(cursor)}
    }).sort({createdAt:-1}).limit(20);
    res.json(messages.reverse())
  }
  catch(error){
    console.log(error,'error in fetching old messages')
    res.json({error:error.message})
  }
})


app.get('/request/:user1/:user2',async(req,res)=>{
  const {user1,user2}=req.params;
  try{
    const msg=await FollowStatus.findOne({
      $or:[
        {from:user1,to:user2},
        {from:user2,to:user1}
      ]
    });
    console.log('messages is',msg)
    res.json(msg || null)
  }
  catch(err){
    console.log('error in fetching req messages data in backend')
    res.status(500).json({err:err.msg})
  }
})

app.get("/notification/:user1", async (req, res) => {
  try {
    const requests = await FollowStatus.find({
      to: req.params.user1,
      status: "pending",
    }).populate("from", "username image");

    res.json(requests || []);
  } catch (err) {
    console.log(err);
    res.json([]); 
  }
});

// for check online or offline 
app.get("/online-users", (req, res) => {
  res.json(Object.keys(onlineUsers));
});

// any other user logged in same account then trigger
app.post("/force-logout", (req, res) => {
  const { userId } = req.body;
  const targetSocket = onlineUsers[userId];
  if (targetSocket) {
    io.to(targetSocket).emit("forceLogout");
    console.log("Force logout sent to", userId);
  }
  res.json({ success: true });
});

io.on("connection", (socket) => {
  // join socket 
  socket.on("join", (userId) => {
  console.log(userId + " joined");

  // check existing session
  const oldSocketId = onlineUsers[userId];

  if (oldSocketId && oldSocketId !== socket.id) {
    const oldSocket = io.sockets.sockets.get(oldSocketId);

    if (oldSocket) {
      oldSocket.emit("sessionEnded", {
        message: "Login from another device"
      });
      oldSocket.disconnect(true);
      console.log("Old socket disconnected:", oldSocketId);
    }
  }

  //  save new session
  onlineUsers[userId] = socket.id;

  // send online list to this user
  io.to(socket.id).emit("onlineList", Object.keys(onlineUsers));

  // notify others
  socket.broadcast.emit("userStatus", {
    userId,
    status: "online",
    });
  });
    
  //if register-user account in onlineUsers then logout from other device means open in new device only
  // this trigger in /Componants/SocketListener.js
  //-----
  socket.on("force-logout-user", (userId) => {
    const targetSocket = onlineUsers[userId];
     if (targetSocket) {
      io.to(targetSocket).emit("forceLogout");
    }
  });
  
  // for chatting 
  socket.on("sendMessage", async ({ from, to, message }) => {
    try {
      const savedMessage = await Message.create({
        from,
        to,
        message,
        isSeen:false
      });
      const receiverSocket = onlineUsers[to];
      if (receiverSocket) {
        io.to(receiverSocket).emit("receiveMessage", savedMessage);
      }
      socket.emit("receiveMessage", savedMessage);
    } catch (err) {
      console.log(err);
    }
  });

  //for unreaded message badge 
  socket.on('markSeen',async({myId,otherId})=>{
    await Message.updateMany({from:otherId,to:myId,isSeen:false},
      {$set:{isSeen:true}}
    )
    //if user can see message then send notification to sender 
    const senderSocket=onlineUsers[otherId];
    if(senderSocket){
      io.to(senderSocket).emit('messageSeen',{by:myId});
    }
  })

  // for deleting message
  socket.on("deleteMessage", async (messageId) => {
    await Message.findByIdAndDelete(messageId);
    io.emit("messageDeleted", messageId);
  });

  // sending follow req
  socket.on('sendFollowRequest',async({from,to,status})=>{
    try{
      const createStatusModel=await FollowStatus.create({
        from:from,
        to:to,
        status:status
      })

      const populatedReq = await FollowStatus
      .findById(createStatusModel._id)
      .populate("from", "username image");

      if(createStatusModel){
        console.log('status model is created')
      }
      const receiverSocket=onlineUsers[to];
      if(receiverSocket){
        io.to(receiverSocket).emit('newFollowReq',populatedReq);
      }
      
    }
    catch(error){
      console.log(error,'error in sending req.. for server side')
    }
  })

  //accept follow req
  socket.on('acceptFollowRequest',async({from,to})=>{
    try{
      const checkPendingReq=await FollowStatus.findOne({
        from:from,
        to:to
      })
      
      // if(!checkPendingReq){     // checking any req is pending or not 
      //   console.log('not any pending req...')
      //   return;
      // }

      //create follow collection for new relation
      const createFollowCollection=await Follow.create({
        follower:from,
        following:to,
      })

      if(createFollowCollection){
        console.log('follow collection is created...')
      }

      //update pending req after accept
      if(checkPendingReq){
        const updatePendingReq=await FollowStatus.updateOne(
          {_id:checkPendingReq._id},{status:'accepted'}
        )
        if(updatePendingReq){
          console.log('delete pending req success...')
        }
      }

      const checkFriend=await Follow.findOne({follower:to,following:from});

      // create new follostatus to follow back for pending status
      if(!checkFriend){
        await FollowStatus.create({
          from:to,
          to:from,
          status:'pending'
        })
      }
      
      // send to sender socket
      const senderSocket = onlineUsers[from];
      if(senderSocket){
        io.to(senderSocket).emit("reqAccepted",{from,to});
      }

      // send to receiver also
      const receiverSocket = onlineUsers[to];
      if(receiverSocket){
        // io.to(receiverSocket).emit('friendOrNot',checkFriend);
        io.to(receiverSocket).emit("friendOrNot", {from,to,isFriend: !!checkFriend,});
        io.to(receiverSocket).emit("reqAccepted",{from,to});
      }
    }
    catch(error){
      console.log(error,'error in accepting follow req from server side....')
    }
  })

  //if user can get follow back then it trigger
  socket.on('followback',async({from,to})=>{
    try{

      const craeteFollowCollection=await Follow.create(
        {follower:from,following:to}
      )
      if(craeteFollowCollection){
        console.log('follow collection created success...')
      }

      //update followstatus
      const updateFollowStatus=await FollowStatus.updateOne(
        {from:from,to:to},{status:'accepted'}
      )

      // const updateFollowStatus=await FollowStatus.create({from:from,to:to,status:'accepted'})
      
      if(updateFollowStatus){
        // send to sender socket
        const senderSocket = onlineUsers[from];
        if(senderSocket){
          io.to(senderSocket).emit("reqAccepted",{from,to});
        }

        // send to receiver also
        const receiverSocket = onlineUsers[to];
        if(receiverSocket){
          io.to(receiverSocket).emit("reqAccepted",{from,to});
        }
      }
    }
    catch(error){
      console.log(error,'error in follow back socket')
    }
  })

  // decline request
  socket.on('declineReq',async({from,to})=>{
    try{
      const findFollowStatus=await FollowStatus.findOne({from,to});
      const deleteFolloStatusCollection=await FollowStatus.deleteOne({
        _id:findFollowStatus._id
      })
      if(deleteFolloStatusCollection){
        console.log('delete status collection success...')
      }
      const senderSocket=onlineUsers[from];
      if(senderSocket){
        io.to(senderSocket).emit('declineReq',{from,to});  // send decline req message
      }
    }
    catch(error){
      console.log('error in decline request from server side...')
    }
  })

  // disconnectingg
  socket.on("disconnect", () => {
    for (let uid in onlineUsers) {
      if (onlineUsers[uid] === socket.id) {
        delete onlineUsers[uid];

        io.emit('userStatus',{
          userId:uid,
          status:'offline'
        });
      }
    }
  });
});

server.listen(process.env.PORT, () => {
  console.log("Socket running on 1212");
});
