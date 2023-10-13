const { Schema, model, default: mongoose } = require("mongoose");

/**
 * Creating Schema for user
 */
const userSchema = new Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: Number,
      required: true,
      unique: true,
    },
    otp: {
      type: Number,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    codeSentAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const UserCollection = model("user", userSchema);

module.exports = UserCollection;
