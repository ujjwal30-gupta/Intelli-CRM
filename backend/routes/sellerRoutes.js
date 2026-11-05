
const express = require("express");
const User = require("../models/User");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// Only logged-in Sellers can access these routes
router.use(protect, authorize("seller"));


// 1. GET ALL REGISTERED CONSUMERS
router.get("/consumers", async (req, res) => {
  try {
    const consumers = await User.find({ role: "consumer" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      totalConsumers: consumers.length,
      consumers
    });

  } catch (error) {
    console.error("Fetch Consumers Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch consumers."
    });
  }
});


// 2. GET CONSUMER DETAILS BY ID
router.get("/consumers/:id", async (req, res) => {
  try {
    const consumer = await User.findOne({
      _id: req.params.id,
      role: "consumer"
    }).select("-password");

    if (!consumer) {
      return res.status(404).json({
        success: false,
        message: "Consumer not found."
      });
    }

    res.json({
      success: true,
      consumer
    });

  } catch (error) {
    console.error("Consumer Details Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch consumer details."
    });
  }
});

module.exports = router;
