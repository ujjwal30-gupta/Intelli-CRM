
const express = require("express");
const Customer = require("../models/Customer");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// All routes require login and Consumer role
router.use(protect, authorize("consumer"));


// 1. ADD CUSTOMER
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, company, address } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: "Customer name and phone are required."
      });
    }

    const customer = await Customer.create({
      name,
      email,
      phone,
      company,
      address,
      owner: req.user.id
    });

    res.status(201).json({
      success: true,
      message: "Customer added successfully!",
      customer
    });

  } catch (error) {
    console.error("Add Customer Error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to add customer."
    });
  }
});


// 2. GET ALL CUSTOMERS
router.get("/", async (req, res) => {
  try {
    const customers = await Customer.find({
      owner: req.user.id
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      total: customers.length,
      customers
    });

  } catch (error) {
    console.error("Get Customers Error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to fetch customers."
    });
  }
});


// 3. UPDATE CUSTOMER
router.put("/:id", async (req, res) => {
  try {
    const { name, email, phone, company, address } = req.body;

    if (name !== undefined && !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Customer name cannot be empty."
      });
    }

    if (phone !== undefined && !phone.trim()) {
      return res.status(400).json({
        success: false,
        message: "Customer phone cannot be empty."
      });
    }

    const customer = await Customer.findOneAndUpdate(
      {
        _id: req.params.id,
        owner: req.user.id
      },
      { name, email, phone, company, address },
      {
        new: true,
        runValidators: true
      }
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found."
      });
    }

    res.json({
      success: true,
      message: "Customer updated successfully!",
      customer
    });

  } catch (error) {
    console.error("Update Customer Error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to update customer."
    });
  }
});


// 4. DELETE CUSTOMER
router.delete("/:id", async (req, res) => {
  try {
    const customer = await Customer.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.id
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found."
      });
    }

    res.json({
      success: true,
      message: "Customer deleted successfully!"
    });

  } catch (error) {
    console.error("Delete Customer Error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to delete customer."
    });
  }
});

module.exports = router;
