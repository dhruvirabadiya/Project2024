// Import required modules
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const ServiceCategory = require("../models/servicesCategoryModel");
const Schema = mongoose.Schema;

// Define user schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Enter Your Name"],
  },
  email: {
    type: String,
    required: [true, "Please Enter Your Email"],
    unique: true,
    validate: [validator.isEmail, "Please Enter a valid Email"],
  },
  mobile: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: [true, "Please Enter Your Address"],
  },
  password: {
    type: String,
    required: [true, "Please Enter Your Password"],
    minlength: 8,
    select: false,
  },
  role: {
    type: String,
    enum: ['Service Taker', 'Service Provider'],
    default: "Service Taker",
  },
  profileImage: {
    type: String,
  },
  token: {
    type: String,
  },
  availability: {
    type: String,
    enum: ['Available', 'Unavailable'],
    default: "Available",
  },
  // Additional fields for service category and other data
  experience: {
    type: Number,
  },
  aadharCardNo: {
    type: String,
  },
  serviceCategoryId: {
    type: Schema.Types.ObjectId,
    ref: 'ServiceCategory'
  },
  expectedfees: {
    type: Number,
  },
  accountNumber: {
    type: Number,
  },
  ifscCode: {
    type: String,
  },
  bankName: {
    type: String,
  },
  // Additional fields for profile
  country: {
    type: String,
  },
  zipcode: {
    type: String,
  },
  city: {
    type: String,
  },
  aboutme: {
    type: String,
  },

  resetPasswordToken: String,
  resetPasswordExpier: Date,
});

// Hash password before saving to database
userSchema.pre('save', async function (next) {
  const user = this;
  if (!user.isModified('password')) return next();
  const hash = await bcrypt.hash(user.password, 10);
  user.password = hash;
  next();
});

// Compare passwords for login
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

//JWT Token
userSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE_KEY,
  });
};
userSchema.methods.saveToken = async function (token) {
  this.token = token;
  await this.save();
};

//Reset password token
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpier = Date.now() + 20 * 60 * 1000;
  return resetToken;
}

// Conditionally include availability field only for service provider
userSchema.pre('save', function (next) {
  if (this.role !== 'Service Provider') {
    this.availability = undefined;
  }
  next();
});

//exports user module
module.exports = mongoose.model("User", userSchema);

