
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// USER REGISTRATION
router.post("/register", async (req, res) => {
  try {
    const {
      fullName,
      username,
      email,
      password,
      role,
      plan
    } = req.body;

    // Check required fields
    if (!fullName || !username || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields."
      });
    }

    // Validate username
    if (!/^[a-zA-Z0-9]+$/.test(username)) {
      return res.status(400).json({
        success: false,
        message: "Username can contain only letters and numbers."
      });
    }

    // Validate password
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters."
      });
    }

    // Validate role
    if (!["consumer", "seller"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user role."
      });
    }

    // Check existing user
    const existingUser = await User.findOne({
      $or: [
        { username: username.trim() },
        { email: email.trim().toLowerCase() }
      ]
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Username or email already registered."
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const newUser = await User.create({
      fullName: fullName.trim(),
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role,
      plan: role === "seller"
        ? (plan || "Basic")
        : "Basic"
    });

    res.status(201).json({
      success: true,
      message: "Registration successful!",
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        plan: newUser.plan
      }
    });

  } catch (error) {
    console.error("Registration Error:", error);

    res.status(500).json({
      success: false,
      message: "Registration failed. Please try again."
    });
  }
});


// USER LOGIN
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required."
      });
    }

    // Find user by username
    const user = await User.findOne({
      username: username.trim()
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password."
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password."
      });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d"
      }
    );

    res.json({
      success: true,
      message: "Login successful!",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        role: user.role,
        plan: user.plan
      }
    });

  } catch (error) {
    console.error("Login Error:", error);

    res.status(500).json({
      success: false,
      message: "Login failed. Please try again."
    });
  }
});

module.exports = router;
