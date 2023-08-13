const express = require("express");
const app = express();
const session = require("express-session");
const flash = require("express-flash");
const { body, validationResult, matchedData } = require("express-validator");
const ejs = require('ejs')
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const mongoose = require("mongoose");
const messageSchema = require("./models/Message");
const userSchema = require('./models/User')
const bcrypt = require('bcrypt')
require('dotenv').config()

const auth = require('./routes/auth');
const chat = require('./routes/chat');

app.use(express.static(__dirname + "/public"));
app.set("view engine", ejs)
app.set("views", __dirname + "/views")

const sessionMiddleware = session({
  saveUninitialized: true,
  resave: false,
  secret: "mysecrethash123456789",
  cookie: { maxAge: 60 * 60 * 24 * 30 * 1000 },
});

app.use(sessionMiddleware);
io.engine.use(sessionMiddleware);
app.use(express.urlencoded({ extended: true }));
app.use(flash());

const mustLogin = (req, res, next) => {
  //session based status
  if ( !req.session.user ) {
    res.redirect("/login");
  } 
  else
  next();
};

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect(process.env.MONGO_URL);

  const Message = mongoose.model("Message", messageSchema);
  const User = mongoose.model('User', userSchema);

  /**
   * Routes
   * **/

  chat.get(app, mustLogin);

  auth.get(app);
  auth.post(app, body, validationResult, User, bcrypt);


  /**
   * 
   * socket 
   * 
   * **/
  io.on("connection", (socket) => {
    
    socket.on("join", async (room) => {

      socket.join(room);
      
      /**
       *  
       *  online -  offline
       * 
       * **/
      socket.on("disconnect", (reason) => {
        console.log("user disconnected", reason);
        io.to(room).emit('setoffline', socket.request.session.user._id) 
        //io.to(room).emit('offline', socket.request.session.user._id)  
      });

      socket.on('setonline', (online)=>{
        console.log(online)
        io.to(room).emit('getonline', online) 
      })

      /**
       * 
       * typing
       * 
       * **/

      socket.on('setTyping', async(user_id)=>{
        const user = await User.findById(user_id)
        io.to(room).emit("typeing_name", user);
      })

      /**
       * 
       *  load init messages
       * 
       * **/
      const messages = await Message.find({room: room});
      io.to(socket.id).emit("messages", messages);


      /**
       * 
       *  load users
       * 
       * **/
      const users = await User.find({}).select('name color')
      io.to(room).emit("users", users);

     
      /**
       * 
       *  new message
       * 
       * **/
      socket.on("chat message", async (messageDetails) => {
        const msg = new Message({
          sender_id: messageDetails.sender_id,
          room: room,
          body: messageDetails.message,
          
        });
        msg.save();
        io.to(room).emit("chat message", messageDetails);
        const user = await User.findById( messageDetails.sender_id );
        io.to(room).emit("user", user);
        
      });
      
    });
  });

  server.listen(3000);
}
