const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Port
const PORT = process.env.PORT || 3001;

console.log('API Key available:', !!process.env.CLAUDE_API_KEY);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'Backend is running!' });
});

// Generate Professional Scope endpoint
app.post('/api/generate-scope', async (req, res) => {
  try {
    const { rawScope, companyName } = req.body;

    if (!rawScope) {
      return res.status(400).json({ error: 'Raw scope is required' });
    }

    const apiKey = process.env.CLAUDE_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured on server' });
    }

    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-opus-4-1',
        max_tokens: 1500,
        messages: [
          {
            role: 'user',
            content: `You are a professional construction estimate scope generator for a handyman service called "${companyName}". Convert the following rough notes into a professional, detailed scope of work. Use professional language, be specific about work to be done, and format with numbered sections. Raw Notes: ${rawScope}`
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        }
      }
    );

    const professionalScope = response.data.content[0].text;
    res.json({ professionalScope });
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    res.status(500).json({
      error: error.response?.data?.error?.message || 'Failed to generate scope'
    });
  }
});

// Error handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});