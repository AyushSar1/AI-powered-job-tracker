const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide name'],
        maxlength: [50, 'Name exceeds maximum character']
    },
    email: {
        type: String,
        required: [true, "Please provide a email"],
        match: [
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            "Please provide a valid email"
        ],
        unique: true,
    },
    password: {
        type: String,
        required: [true, "Please provide a password"],
    }
});

UserSchema.pre("save", async function (){
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePasswords = function (password) {
    return bcrypt.compare(password, this.password);
};

UserSchema.methods.createToken = function () {
    return jwt.sign({userId: this._id}, process.env.JWT_SECRET, {expiresIn: "30d"});
};

module.exports = mongoose.model('User', UserSchema);