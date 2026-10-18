const express = require('express');
const cors = require('cors');
const path = require('path');
const Groq = require('groq-sdk');

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Check if API key exists
const apiKey = process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.trim() : null;

if (!apiKey) {
  console.log("❌ GROQ_API_KEY is missing! Go to Render Environment and add it.");
} else {
  console.log("✅ GROQ_API_KEY found, starting server...");
}

const groq = new Groq({
  apiKey: apiKey || "missing-key"
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    if (!apiKey) {
      return res.status(500).json({ error: "GROQ_API_KEY not set on server" });
    }

    console.log("User message:", message);

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: "You are a helpful AI assistant." },
        { role: "user", content: message }
      ],
      temperature: 0.7,
      max_tokens: 1024,
    });

    const reply = completion.choices[0]?.message?.content || "No reply";
    console.log("AI reply sent");
    res.json({ reply });

  } catch (error) {
    console.error("GROQ ERROR:", error.message);
    console.error("Full error:", error);
    // Send real error to frontend so you can see it
    res.status(500).json({ 
      error: `Groq Error: ${error.message}`,
      details: error.error || error.toString()
    });
  }
});

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});