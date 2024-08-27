const Chat = require("../models/chatModel");
const Message = require("../models/messageModel")
const User = require("../models/userModel")
const sendMessage = async (req,res)=>{
    const {content,chatId}=req.body;
    if(!content || !chatId){
        console.log('Invaild data passed into request')
        return res.status(400).send("Invaild data passed into request")
    }
    let newMessage ={
        sender : req.user._id,
        content:content,
        chat:chatId
    }
    try {
        var message = await Message.create(newMessage)
        message = await message.populate("sender", "name pic")
        message = await message.populate("chat")
        message = await User.populate(message,{
            path: "chat.users",
            select:"name pic email"
        })
        await Chat.findByIdAndUpdate(req.body.chatId,{
            latestMessage:message
        })
        return res.status(200).json(message);
    } catch (error) {
        console.log(error)
        return res.status(400).json("Server Error ")

    }
}

const allMessage = async(req,res)=>{
  
    try {
        const message = await  Message.find({chat:req.params.chatId}).populate("sender","name pic email").populate('chat')
  
        res.status(200).json(message)

    } catch (error) {
        res.status(400).json(error)
    }
}

module.exports = {sendMessage,allMessage}