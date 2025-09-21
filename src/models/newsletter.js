const mongoose = require("mongoose");

const NewsletterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  phoneNumber: {
    type: String,
    trim: true,
  },
  textMe: {
    type: Boolean,
    default: false,
  },
  subscribedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Newsletter", NewsletterSchema);
