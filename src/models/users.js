const mongoose = require("mongoose"),
  Schema = mongoose.Schema,
  { isEmail } = require("validator");

const userSchema = new Schema({
  email: {
    type: String,
    validate: [isEmail, "invalid email"],
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    default: "Student",
  },
  name: {
    type: String,
  },
});

module.exports = mongoose.model("User", userSchema);
exports.userSchema = userSchema;
console.info("[UserSchema] created successfully");
