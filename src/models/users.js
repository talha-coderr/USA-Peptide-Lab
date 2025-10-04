const mongoose = require("mongoose");
const { isEmail } = require("validator");
const Schema = mongoose.Schema;

// Address Subschema
const addressSchema = new Schema(
  {
    companyName: { type: String },
    address1: { type: String },
    address2: { type: String },
    city: { type: String },
    state: { type: String },
    zipCode: { type: String },
    phoneNumber: { type: String },
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    firstName: { type: String },
    lastName: { type: String },
    fullName: { type: String },
    username: {
      type: String,
    },
    email: {
      type: String,
      validate: [isEmail, "Invalid email"],
      required: true,
      unique: true,
    },
    role: {
      type: String,
      default: "User",
    },
    password: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: false,
    },
    refreshToken: { type: String },
    isDeleted: {
      type: Boolean,
      default: false,
    },

    // New addresses field
    addresses: {
      billing: {
        type: addressSchema,
        default: {},
      },
      shipping: {
        type: addressSchema,
        default: {},
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
exports.userSchema = userSchema;
