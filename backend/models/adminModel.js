const mongoose = require("mongoose");
const validator = require("validator")
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");



const adminSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Please Enter Your Email"],
        unique: true,
        validate: [validator.isEmail, "Please Enter a valid Email"],
    },
    password: {
        type: String,
        required: [true, "Please Enter Your Password"],
        minlength: 8,
        select: false,
    },
    token: {
        type: String,
    }
});

// Hash password before saving to database
adminSchema.pre('save', async function (next) {
    const admin = this;
    if (!admin.isModified('password')) return next();
    const hash = await bcrypt.hash(admin.password, 10);
    admin.password = hash;
    next();
});

// Compare passwords for login
adminSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
  };

//JWT Token
adminSchema.methods.getJWTToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRE_KEY,
    });
};

adminSchema.methods.saveToken = async function(token) {
    this.token = token;
    await this.save();
};

//exports admin module
module.exports = mongoose.model("Admin", adminSchema);