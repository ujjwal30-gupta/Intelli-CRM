
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true
    },

    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: /^[a-zA-Z0-9]+$/
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true,
      minlength: 8
    },

    role: {
      type: String,
      enum: ["consumer", "seller"],
      required: true
    },

    plan: {
      type: String,
      enum: ["Basic", "Intermediate", "Advanced"],
      default: "Basic"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("User", userSchema);
