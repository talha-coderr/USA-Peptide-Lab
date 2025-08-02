const mongoose = require("mongoose");
const { isEmail } = require("validator");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  fullName: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    validate: [isEmail, "Invalid email"],
    required: true,
    unique: true,
  },
  role: {
    type: String,
    required: true,
    default: 'User',
  },
  password: {
    type: String,
    required: true,
  },
  refreshToken: {
    type: String
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("User", userSchema);
exports.userSchema = userSchema;
console.info("[UserSchema] created successfully");
