const mongoose = require("mongoose")
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique:true
    },
    password: {
        type: String,
        required: true, 
        select: false
    },
    pic: {
        type: String,
        default: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"
    }

}, { timestamps: true })

userSchema.pre('save', async function(next) {
    // Use function() to access `this`, which refers to the document being saved
    if (!this.isModified('password')) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});
// Compare Password 
userSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password)
}
const User = mongoose.model("User", userSchema)
module.exports = User