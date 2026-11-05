const express = require("express");
const OpenAI = require("openai");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

router.post("/chat", protect, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required"
      });
    }

    const response = await openai.responses.create({
      model: "gpt-5.5",
      instructions:
        "You are Intelli CRM AI Assistant. Help users with customer management, sales, business growth and CRM questions. Give simple and useful answers.",
      input: message
    });

    res.json({
      success: true,
      reply: response.output_text
    });

  } catch (error) {
    console.error("AI Error:", error.message);

    res.status(500).json({
      success: false,
      message: "AI Assistant is temporarily unavailable."
    });
  }
});

module.exports = router;