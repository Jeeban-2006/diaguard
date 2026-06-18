import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'DiaguARd API Server',
    version: '1.0.0',
    status: 'running'
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// Example API route for health data
app.post('/api/health-data', (req, res) => {
  // TODO: Implement health data processing
  const healthData = req.body;
  
  res.json({
    success: true,
    message: 'Health data received',
    data: healthData
  });
});

// Medical Chatbot System Prompt
const SYSTEM_PROMPT = `You are DiaGuard AI, a highly advanced, clinical-grade medical assistant embedded within the DiaGuard health monitoring platform. 
Your primary goal is to provide accurate, empathetic, and scientifically grounded information regarding diabetes prevention, metabolic health, and general wellness.

CRITICAL INSTRUCTIONS:
1. Empathy & Professionalism: Always maintain a warm, reassuring, and deeply professional tone.
2. Accuracy: Base all answers on established medical heuristics and the latest metabolic research.
3. Clarity: Explain complex medical terms (like HbA1c, insulin resistance, or fasting glucose) in simple, accessible language.
4. Disclaimer: You must clearly state that you are an AI assistant and not a substitute for professional medical advice when giving specific health recommendations.
5. Conciseness: Keep responses structured, easy to read, and ideally under 2 paragraphs unless a detailed breakdown is requested. Use bullet points for advice.

When the user asks about their risk, focus on actionable, preventative lifestyle changes (diet, exercise, stress, sleep).`;

// Chatbot Endpoint connecting to Groq
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [], context = '' } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Append context to system prompt softly, instructing it to use it ONLY when relevant
    const dynamicSystemPrompt = SYSTEM_PROMPT + `\n\n${context}\nIMPORTANT: Only reference this health profile when it is directly relevant to answering the user's specific question. Do NOT repeatedly summarize their entire profile on every response (e.g. if they just say 'hi' or 'how are you', simply greet them back normally).`;

    const messages = [
      { role: 'system', content: dynamicSystemPrompt },
      ...history,
      { role: 'user', content: message }
    ];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile', // Fast, intelligent model ideal for medical reasoning
        messages: messages,
        temperature: 0.5, // Slightly lower temp for more factual/clinical responses
        max_tokens: 1024,
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API Error:', errorText);
      throw new Error(`Groq API returned status ${response.status}`);
    }

    const data = await response.json();
    const aiMessage = data.choices[0].message.content;

    res.json({
      success: true,
      message: aiMessage
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ 
      error: 'Failed to process chat request',
      details: error.message 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;
