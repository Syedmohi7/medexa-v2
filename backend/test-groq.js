require('dotenv').config();
const axios = require('axios');

async function testGroq() {
  console.log('🔍 Testing Groq API...');
  console.log('API Key Loaded:', process.env.GROQ_API_KEY ? 'YES' : 'NO');

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: 'You are a helpful medical assistant.' },
          { role: 'user', content: 'I have fever and headache' }
        ],
        temperature: 0.7,
        max_tokens: 200
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Groq API Response:');
    console.log(response.data.choices[0].message.content);

  } catch (error) {
    console.error('❌ Groq API Error');

    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Message:', error.message);
    }
  }
}

testGroq();
