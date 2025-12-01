// routes/openai.js
const express = require("express");
const router = express.Router();
const { Configuration, OpenAIApi } = require("openai");

// Khởi tạo cấu hình OpenAI với API Key từ .env
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);

// API chat
router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Vui lòng gửi message" });
    }

    const completion = await openai.createChatCompletion({
  model: "gpt-3.5-turbo",
  messages: [{ role: "user", content: message }]
});

    const reply = completion.data.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    console.error("Chat error:", err.response?.data || err.message);
    res.status(500).json({ error: "Lỗi khi gọi API OpenAI" });
  }
});

module.exports = router;
