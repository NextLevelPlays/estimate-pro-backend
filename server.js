const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Port
const PORT = process.env.PORT || 3001;
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;

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

    if (!CLAUDE_API_KEY) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-opus-4-1',
        max_tokens: 1500,
        messages: [
          {
            role: 'user',
            content: `You are a professional construction estimate scope generator for a handyman service called "${companyName}". 

Convert the following rough notes into a professional, detailed scope of work that would be sent to a client. 

Requirements:
1. Use professional but friendly language
2. Be specific about what work will be done
3. Include any materials or labor mentioned
4. Mention safety considerations if applicable
5. Include information about cleanup and quality assurance
6. Format with numbered sections and clear descriptions
7. Keep it concise but comprehensive

Raw Notes:
${rawScope}

Please provide a professional scope of work:`
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01'
        }
      }
    );

    const professionalScope = response.data.content[0].text;
    res.json({ professionalScope });
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    res.status(500).json({
      error: error.response?.data?.error?.message || 'Failed to generate scope'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
```