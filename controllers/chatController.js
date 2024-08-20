const Chat = require("../models/chatModel");
const User = require("../models/userModel");

const accessChat = async(req,res)=>{
    const {userId} = req.body;
    
    if(!userId){
        console.log("userID param not sent with request")
        return res.status(400).json({success:false})

    }

    let isChat = await Chat.find({
        isGroupChat : false,
        $and:[
            {users:{$elemMatch:{$eq:req.user._id}}},
            {users:{$elemMatch:{$eq:userId}}}
        ]
    }).populate("users","-password").populate('latestMessage')

    isChat = await User.populate(isChat,{
        path:'latestMessage.sender',
        select:"name pic email"
    })
    if(isChat.length>0){
        res.send(isChat[0])

    }else{
        const chatData = {
            chatName:'sender',
            isGroupChat:false,
            users:[req.user._id,userId]
        }

        try {
            const createdchat = await Chat.create(chatData)
            const FullChat = await Chat.findOne({_id:createdchat._id}).populate('users')
            res.status(200).send(FullChat)
        } catch (error) {
         console.log(error)   
        }
    }

}

const fetchChats = async (req, res) => {
    try {
        // Find chats where the user is a participant
        let chats = await Chat.find({ users: req.user._id })
            .populate('users', '-password') // Populate users, excluding passwords
            .populate('groupAdmin') // Populate group admin
            .populate('latestMessage') // Populate the latest message
            .sort({ updatedAt: -1 }); // Sort by latest updated chats first

        // Populate the sender of the latest message
        chats = await User.populate(chats, {
            path: 'latestMessage.sender',
            select: 'name pic email'
        });

        // Send the response with the fetched chats
        res.status(200).json(chats);
    } catch (error) {
        console.error('Error fetching chats:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch chats' });
    }
};

const createGroupChat = async (req,res)=>{
    if(!req.body.users || !req.body.name){
        return res.status(400).json({success:false,message:"Please fill all the feilds"})
    }
    let users = JSON.parse(req.body.users);
    if(users.length > 2){
        return res.status(400).json({success:false,message:"More than 2 users are required to from a group chat "})
    }
    users.push(req.user);
    try {
        const groupChat =await Chat.create({
            chatName:req.body.name,
            users:users,
            isGroupChat:true,
            groupAdmin:req.user,
        });

        const fullGroupChat = await Chat.findOne({_id:groupChat._id}).populate('users').populate('groupAdmin','-password')
        res.status(200).json(fullGroupChat)
    } catch (error) {
        console.error('Error fetching chats:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch chats' });
    }
}
const renameGroup = async(req,res)=>{
    const{chatId,chatName}=req.body;
    const updatedChat = await Chat.findByIdAndUpdate(
        chatId,
        { chatName },
        { new:true}
    ).populate('users').populate('groupAdmin')

    if(!updatedChat){
        res.status(400).json({success:false})

    }
    res.status(200).json(updatedChat)
}

const addToGroup = async(req,res)=>{
    const {chatId,userId} = req.body;
    const added = await Chat.findByIdAndUpdate(chatId, { $push: { users: userId } }, { new: true }).populate('users').populate('groupAdmin');

   if(!added){
        res.status(400).json({success:false})

    }
    res.status(200).json({success:true,added})
}
const removeFromGroup = async(req,res)=>{
    const {chatId,userId} = req.body;
    const remove = await Chat.findByIdAndUpdate(chatId, { $pull: { users: userId } }, { new: true }).populate('users').populate('groupAdmin');

   if(!remove){
        res.status(400).json({success:false})

    }
    res.status(200).json({success:true,remove})
}
module.exports = {accessChat,fetchChats,createGroupChat,renameGroup,addToGroup,removeFromGroup}