
const express = require("express");
const Customer = require("../models/Customer");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// Only logged-in Consumers can access analytics
router.use(protect, authorize("consumer"));


// GET CUSTOMER ANALYTICS
router.get("/", async (req, res) => {
  try {
    const owner = req.user.id;

    // Total customers
    const totalCustomers = await Customer.countDocuments({ owner });

    // Customers added this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const customersThisMonth = await Customer.countDocuments({
      owner,
      createdAt: { $gte: startOfMonth }
    });

    // Customers added last month
    const startOfLastMonth = new Date(startOfMonth);
    startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);

    const customersLastMonth = await Customer.countDocuments({
      owner,
      createdAt: {
        $gte: startOfLastMonth,
        $lt: startOfMonth
      }
    });

    // Calculate monthly growth percentage
    let growthPercentage = 0;

    if (customersLastMonth > 0) {
      growthPercentage = Number(
        (
          ((customersThisMonth - customersLastMonth) /
            customersLastMonth) * 100
        ).toFixed(2)
      );
    } else if (customersThisMonth > 0) {
      growthPercentage = 100;
    }

    // Company-wise customer distribution
    const companyDistribution = await Customer.aggregate([
      {
        $match: { owner: new (require("mongoose").Types.ObjectId)(owner) }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: [{ $ifNull: ["$company", ""] }, ""] },
              "Not Specified",
              "$company"
            ]
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Last 6 months customer growth
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyGrowth = await Customer.aggregate([
      {
        $match: {
          owner: new (require("mongoose").Types.ObjectId)(owner),
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    res.json({
      success: true,
      analytics: {
        totalCustomers,
        customersThisMonth,
        customersLastMonth,
        growthPercentage,
        companyDistribution,
        monthlyGrowth
      }
    });

  } catch (error) {
    console.error("Analytics Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to generate analytics."
    });
  }
});

module.exports = router;
