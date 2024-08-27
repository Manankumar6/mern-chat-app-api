const User = require('../models/userModel');
const generateToken = require('../token/token');

const signup = async (req, res,next) => {
    try {

       
        const { name, email, password, pic } = req.body;
        if (!name || !email || !password) {
            res.status(400).json({ success: false, message: "Invaild Credentials" })
        }
        const userExist = await User.findOne({ email });
        if (userExist) {
            res.status(400).json({ success: false, message: "User already exists" })
        }
        const user = await User.create({ name, email, password, pic });

        // Generate the token using the newly created user's ID
        const token = generateToken(user._id);

        // Add the token to the user object or send it separately in the response
        res.status(200).json({
            success: true,
            user: { ...user.toObject(), token }
        });
    } catch (error) {
        next(error)
    }
}


const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find the user by email, and include the password in the returned data
        const user = await User.findOne({ email }).select("+password");

        // If no user is found, return an error response
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Compare the provided password with the stored password
        const isPasswordValid = await user.comparePassword(password);

        // If the password is invalid, return an error response
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: "Invalid password" });
        }
        const token = generateToken(user._id);
        // If the user is found and the password is valid, return a success response
        res.status(200).json({ success: true,_id:user._id, name: user.name, email: user.email,pic:user.pic,token });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

// /api/user?search=manan 
const getAllUsers = async (req, res) => {
    const keyword = req.query.search
        ? {
              $or: [
                  { name: { $regex: req.query.search, $options: "i" } },
                  { email: { $regex: req.query.search, $options: "i" } },
              ],
          }
        : {};

    try {
        // Combine both the search keyword and the exclusion of the current user into a single query
        const users = await User.find({
            ...keyword,  // Apply the search filter if it exists
            _id: { $ne: req.user._id },  // Exclude the current user
        });

        // Send the filtered users
        res.status(200).json({ success: true, users });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Failed to get users', error });
    }
};


module.exports = { login, signup,getAllUsers }