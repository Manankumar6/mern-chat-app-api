require('dotenv').config();
const express = require("express")
const app = express();
const PORT = process.env.PORT || 5000;
const chats = require("./data/data")
const cors = require("cors")
const db = require("./db/db")
const color = require("colors")
const userRoutes = require("./routes/userRoutes");
const errorHandler = require('./Middleware/errorHandler');
const chatRoutes = require('./routes/chatRoutes')
const messageRoutes = require('./routes/messageRoutes')
db()
// App use 
const corsOptions = {
    origin: true, // Replace with your frontend URL during production
    methods: ['GET', 'POST', 'PUT'], // Add other HTTP methods if needed
    // allowedHeaders: ['Content-Type', 'Authorization'], // Allow specific headers
    credentials: true // Allow credentials (cookies, authorization headers)
};
app.use(cors(corsOptions))
app.use(express.json());
app.use(errorHandler)

// App routes 

app.use('/api/user',userRoutes)
app.use('/api/chat',chatRoutes)
app.use('/api/message',messageRoutes)



// Routes 
app.get("/",(req,res)=>{
    res.send("hello world")
})

const server = app.listen(PORT,()=>{
    console.log(`app is listening on the Port http://localhost:${PORT}`.yellow.bold)
})

const io = require('socket.io')(server,{
    pingTimeout:60000,
    cors:{
        origin: "http://localhost:5000"
    }
})

io.on("connection",(socket)=>{
    console.log("conntected to socket io")

    socket.on('setup',(userData)=>{
        socket.join(userData._id);
      
        socket.emit("connected")
    })
    socket.on("join chat",(room)=>{
        socket.join(room)
        
    })
    socket.on('typing',(room)=>{
        socket.in(room).emit('typing')
    })
    socket.on('stop typing',(room)=>{
        socket.in(room).emit('stop typing')
    })
    socket.on("new message",(newMessageReceived)=>{
      
        var chat = newMessageReceived.chat;
        if(!chat.users) return console.log("chat user not definded")
        chat.users.forEach(user=>{
            if(user._id==newMessageReceived.sender._id) return ;
            socket.in(user._id).emit("message received",newMessageReceived)
        })
    })
})