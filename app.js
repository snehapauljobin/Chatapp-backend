const express=require('express');
const Userdata=require('./src/model/userdata');
const Groupdata=require('./src/model/groupchat');
const Privatedata=require('./src/model/privatechat')
const Blockchatdata=require('./src/model/blockchatdata')
// var nodemailer = require('nodemailer');
 const jwt=require('jsonwebtoken');
const cors=require('cors');

var app=new express();
// const Jobemployerdata = require('./src/model/jobemployerdata');
var debug = require('debug')('angular2-nodejs:server');
var http = require('http');
var port = normalizePort(process.env.PORT || '9600');
app.set('port', port);


app.use(cors());
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));

var server = http.createServer(app);

var io = require('socket.io')(server);



// ------------------------Sign UP---------------------------
app.post('/signup/insert', function(req,res){
  res.header("Access-Control-Allow-Origin","*")
  res.header("Access-Control-Allow-Methods:GET,POST,PATCH,PUT,DELETE,OPTIONS")
  console.log(req.body);


let  email=req.body.user.email;
let  password=req.body.user.password;


         

Userdata.findOne({email:email},function(err,user){
  
  if(!user){
      var user={
     
          name:req.body.user.name,
         email:req.body.user.email,
         password:req.body.user.password,
         passwordcheck:req.body.user.passwordcheck,
         status:req.body.user.status
      }

var user=new Userdata(user);
user.save();


      return res.status(200).send({message:"Successfully saved the details"});
    }

  
  else{
      return res.status(400).send({message:"Already exist"});
      
   }
})
})

// ------------------------Login in---------------------------

app.post('/login', (req,res)=>{
    let email=req.body.email;
    let password=req.body.password;
    let status=req.body.status;
    const users = [];
    users.push({user: req.body.email});
       // console.log(users)
   
    
   
       let payload = {subject:email+password}
        let token = jwt.sign(payload, 'secretKey')
       
      
      Userdata.findOne({email:email},function(err,user){
        if(user){
          
          user.comparePassword(password, (error, match) => {
            if(!match) {
              res.status(400).send({message:"Credentials are not proper"});;
            }
            else{
              Userdata.findOneAndUpdate({"email":email},
              {$set:{"status":"online"
          }})
.then((details)=>{
              res.status(200).send({token,details})
            
        });
            }
          })
        }
      
        
          else  {
                res.status(400).send({message:"Credentials are not proper"});
              }  
        })
      
             
})
   


function verifyToken(req, res, next) {
    if(!req.headers.authorization) {
      return res.status(401).send('Unauthorized request')
    }
    let token = req.headers.authorization.split(' ')[1]
    if(token === 'null') {
      return res.status(401).send('Unauthorized request')    
    }
    let payload = jwt.verify(token, 'secretKey')
    if(!payload) {
      return res.status(401).send('Unauthorized request')    
    }
    req.userId = payload.subject
    next()
  }

 // --------------------------------logout user---------------------------
app.post('/logout/chat',function(req, res){
   res.header("Access-Control-Allow-Origin","*")
   res.header("Access-Control-Allow-Methods:GET,POST,PATCH,PUT,DELETE,OPTIONS")
  // const id = req.body._id;
 const email=req.body.email;
 // console.log(email)
  // console.log(id)
    Userdata.findOneAndUpdate({"email":email}, {$set:{"status":"offline"}})
    .then((offlineuser)=>{
        res.send(offlineuser);
       // console.log(verifiedcandidate)
    });
})

// --------------------------------Block user---------------------------
app.post('/blockcontact',function(req, res){
  res.header("Access-Control-Allow-Origin","*")
  res.header("Access-Control-Allow-Methods:GET,POST,PATCH,PUT,DELETE,OPTIONS")
 // const id = req.body._id;
 console.log(req.body)
const from=req.body.fromemail
const to=req.body.toemail;
const from1=req.body.toemail
const to1=req.body.fromemail
 //console.log(from)
 //console.log(to)


 var blockchat={
 from:req.body.fromemail,
  to:req.body.toemail,
  from1:req.body.toemail,
  to1:req.body.fromemail
}

var blockchat=new Blockchatdata(blockchat);
blockchat.save();

return res.status(200).send();
})


//------------------------get user details to dashboard--------------------
 
app.get('/userprofile/:item', verifyToken,(req, res) => {
  
  const email = req.params.item;
  // console.log(email)
    Userdata.findOne({"email":email})
    .then((userdetail)=>{
        res.send(userdetail);
       // console.log(userdetail)
    });
})


//------------------------get blocked user details to dashboard--------------------
 
app.get('/contactsblocked/:item', verifyToken,(req, res) => {
  
  const email = req.params.item;
  //console.log(email)
    Blockchatdata.findOne({"from":email})
    .then((userdetail)=>{
        res.send(userdetail);
      // console.log(userdetail)
    });
})

app.post('/unblockContact', verifyToken,(req, res) => {
  // console.log(req.params.item)
  const from = req.body.fromemail
  const to = req.body.toemail
  // console.log(from)
  // console.log(to)
    Blockchatdata.findOneAndDelete({"from":from,"to":to})
    .then((userdetail)=>{
        res.send();
      //  console.log(userdetail)
    });
})

//------------------------get indv user details for personal chat --------------------
 
app.get('/indvuser/:id', verifyToken,(req, res) => {
  
  const id = req.params.id;
  console.log(id)
    Userdata.findOne({"_id":id})
    .then((userdetail)=>{
        res.send(userdetail);
       // console.log(userdetail)
    });
})


//------------------------get other users to dashboard--------------------
 
app.get('/otherusers/:item',verifyToken, (req, res) => {
  
  const email = req.params.item;
 // console.log(email)
  Userdata.find({ email: { $nin: [email] } })
    // Userdata.findOne({"email":email})
    .then((otheruserdetail)=>{
        res.send(otheruserdetail);
      // console.log(otheruserdetail)
    });
})
//------------------------get group chat history --------------------
 
app.get('/previous/previousChats/:itemz',verifyToken, (req, res) => {
  
  const room = req.params.itemz
   console.log(room)
  Groupdata.find({ room:room  })
    // Userdata.findOne({"email":email})
    .then((otheruserdetail)=>{
        res.send(otheruserdetail);
     // console.log(otheruserdetail)
    });
})
//------------------------get private chat history --------------------
 
app.get('/chatHistory/:item',verifyToken, (req, res) => {
  
  const room = req.params.item;
   console.log(room)
  Privatedata.find({ room:room  })
    // Userdata.findOne({"email":email})
    .then((otheruserdetail)=>{
        res.send(otheruserdetail);
     // console.log(otheruserdetail)
    });
})




io.on('connection',(socket)=>{

    console.log('new connection made.');



     // ---------------Private chat-------------------------

     socket.on('joinprivatechat',function(data){ 
    console.log(data.room)
    socket.join(data.room);
         socket.join(data.loginmail);
      //  console.log( data.loginmail+ ' need to chat with : ' + data.recepient+' on room '+data.room);
        socket.join(data.recepient);
     socket.broadcast.to(data.room).emit('invite_to',{user:data.loginmail,room:data.room, message:'need to chat.'})
    // socket.broadcast.to(data.room).emit('invite_to',{user:data.loginmail,room:data.room})
     
     })   
     
socket.on('forwardimage',function(data){
 // console.log(data)
 // console.log(data.room)
  socket.join(data.room);
       socket.join(data.loginmail);
     // console.log( data.loginmail+ ' need to chat with : ' + data.recepient+' on room '+data.room);
      socket.join(data.recepient);
   socket.broadcast.to(data.room).emit('frwdImg',{user:data.loginmail,room:data.room, image:data.img})

   
   })   
   socket.on('forwardtext',function(data){
    // console.log(data)
    // console.log(data.room)
     socket.join(data.room);
          socket.join(data.loginmail);
        // console.log( data.loginmail+ ' need to chat with : ' + data.recepient+' on room '+data.room);
         socket.join(data.recepient);
      socket.broadcast.to(data.room).emit('frwdtxt',{user:data.loginmail,room:data.room, message:data.text})
   
      
      })  


     socket.on('sendindvmsg',function(data){
    
      var chatdata={
        user:data.user,
        message:data.message,
        room:data.room
  
      }
      var chatdata=new Privatedata(chatdata);
  chatdata.save();
     io.in(data.room).emit('new_indvmessage', {message:data.message,user:data.user});
    
    })


//-----send private Image-----------

    socket.on('sendimage',function(data){
    
      var chatdata={
        user:data.user,
        imgfile:data.image,
        room:data.room
  
      }
     // console.log(data.image)
      var chatdata=new Privatedata(chatdata);
 chatdata.save();
     io.in(data.room).emit('new_image', {image:data.image,user:data.user});
    
    })
  

//-------------------------Group chat-------------------

    socket.on('join', function(data){
      //joining
      socket.join(data.room);

        
        // socket.emit("users", users);
     // console.log(data.user + 'joined the room : ' + data.room);

      socket.broadcast.to(data.room).emit('new user joined', {user:data.user, message:'has joined this room.',userID:socket.id});
    });


    socket.on('leave', function(data){
    
     // console.log(data.user + 'left the room : ' + data.room);

      socket.broadcast.to(data.room).emit('left room', {user:data.user, message:'has left this room.'});

      socket.leave(data.room);
    });

    socket.on('message',function(data){

    
    
    var chatdata={
      user:data.user,
      message:data.message,
      room:data.room

    }
    var chatdata=new Groupdata(chatdata);
chatdata.save();


 io.in(data.room).emit('new message', {user:data.user, message:data.message});

})


socket.on('sendgroupImg',function(data){

    
    
  var chatdata={
    user:data.user,
    imgfile:data.image,
    room:data.room

  }
  var chatdata=new Groupdata(chatdata);
chatdata.save();


io.in(data.room).emit('new_groupimage', {user:data.user, image:data.image});

})


})



/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}

//   app.listen(9500,function(){
//     console.log("listening to port 9500")
// })

