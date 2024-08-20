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



// Routes 
app.get("/",(req,res)=>{
    res.send("hello world")
})
// app.get("/api/chats",(req,res)=>{
//     res.send(chats)
   
// })
// app.get("/api/chat/:id",(req,res)=>{
//     const singleChat = chats.find((chat) => chat._id.toString() === req.params.id);
//     if(singleChat){
//          res.send(singleChat)
//     }
// })

app.listen(PORT,()=>{
    console.log(`app is listening on the Port http://localhost:${PORT}`.yellow.bold)
})