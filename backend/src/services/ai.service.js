const axios = require('axios');

class AIService {
  constructor() {
    this.apiKey = process.env.GROQ_API_KEY;
    this.baseURL = 'https://api.groq.com/openai/v1';

    if (!this.apiKey) {
      throw new Error('GROQ_API_KEY is not configured');
    }
  }

  async generateResponse(messages, userContext = {}) {
    try {
      const systemPrompt = this.getSystemPrompt(userContext);

      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages
          ],
          temperature: 0.3,
          max_tokens: 4096,
          top_p: 0.9
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 50000
        }
      );

      const content = response?.data?.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error('Empty AI response');
      }

      return {
        success: true,
        message: content,
        usage: response.data.usage
      };

    } catch (error) {
      console.error('AI API Error:', error.response?.data || error.message);

      if (error.response?.status === 401) {
        throw new Error('Invalid GROQ API key');
      }

      if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded');
      }

      throw new Error('AI service unavailable');
    }
  }

  getSystemPrompt(userContext) {
    const { name, age, gender, bmi, existingConditions } = userContext;

    let context = 'You are MEDEXA AI, a medical assistant with deep pharmaceutical and clinical knowledge. ';

    if (name) {
      context += `Helping ${name}`;
      if (age) context += `, ${age} years`;
      if (gender) context += `, ${gender}`;
      context += '. ';
    }

    if (bmi) context += `BMI: ${bmi}. `;
    if (existingConditions?.length) {
      context += `Conditions: ${existingConditions.join(', ')}. `;
    }

    return `${context}

You are a medical AI with expertise in:
- Pharmacology and drug interactions
- Clinical diagnosis and symptom analysis
- Laboratory test interpretation
- Medical terminology and abbreviations
- Patient education and health recommendations

Provide accurate, evidence-based information.
Be empathetic and professional.
Always recommend consulting healthcare professionals for serious concerns.`;
  }

  async analyzeSymptoms(symptoms, userContext = {}) {
    try {
      const prompt = `Analyze: ${symptoms.join(', ')}

Return JSON:
{
  "riskLevel": "low|medium|high",
  "precautions": ["..."],
  "recommendations": ["..."]
}`;

      const response = await this.generateResponse(
        [{ role: 'user', content: prompt }],
        userContext
      );

      const jsonMatch = response.message.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return {
          success: true,
          ...JSON.parse(jsonMatch[0])
        };
      }

      return this.getFallbackAnalysis(symptoms);

    } catch (error) {
      return this.getFallbackAnalysis(symptoms);
    }
  }

  getFallbackAnalysis(symptoms) {
    const dangerKeywords = [
      'chest pain', 'difficulty breathing', 'unconscious',
      'stroke', 'heart attack', 'high fever', 'severe bleeding'
    ];

    const highRisk = symptoms.some(s =>
      dangerKeywords.some(k => s.toLowerCase().includes(k))
    );

    return {
      success: true,
      riskLevel: highRisk ? 'high' : 'medium',
      precautions: [
        'Monitor symptoms closely',
        'Stay hydrated',
        'Get adequate rest',
        'Avoid strenuous activity',
        highRisk ? '⚠️ Seek immediate medical attention' : 'Consult doctor if symptoms persist'
      ],
      recommendations: [
        'Maintain regular sleep schedule',
        'Eat balanced, nutritious meals',
        'Manage stress levels',
        'Track symptoms daily',
        'Follow medical advice'
      ]
    };
  }

  async getHealthRecommendations(userContext = {}) {
    try {
      let prompt = 'Provide 5 personalized daily health recommendations';

      if (userContext.age) prompt += ` for ${userContext.age}-year-old`;
      if (userContext.bmi) prompt += ` with BMI ${userContext.bmi}`;
      if (userContext.existingConditions?.length) {
        prompt += ` with ${userContext.existingConditions.join(', ')}`;
      }

      prompt += '. Include diet, exercise, mental health, and preventive care tips.';

      const response = await this.generateResponse(
        [{ role: 'user', content: prompt }],
        userContext
      );

      return {
        success: true,
        recommendations: response.message
      };

    } catch (error) {
      return {
        success: false,
        recommendations: this.getFallbackRecommendations()
      };
    }
  }

  getFallbackRecommendations() {
    return `
🌟 Daily Health Tips:
1. 💧 Hydration: Drink 8-10 glasses of water
2. 🥗 Nutrition: Balanced meals with fruits & vegetables
3. 🏃 Exercise: 30 minutes moderate activity
4. 😴 Sleep: 7-9 hours quality sleep
5. 🧘 Mental Health: Practice stress management

Consult healthcare professional for personalized advice.
`;
  }
}

module.exports = new AIService();