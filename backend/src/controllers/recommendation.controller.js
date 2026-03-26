const aiService = require('../services/ai.service');
const User = require('../models/User');

/**
 * Get personalized health recommendations
 * GET /api/recommendations
 */
exports.getRecommendations = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    const userContext = {
      name: user.name,
      age: user.healthProfile?.age,
      gender: user.healthProfile?.gender,
      bmi: user.healthProfile?.bmi,
      existingConditions: user.healthProfile?.existingConditions
    };

    const recommendations = await aiService.getHealthRecommendations(userContext);

    // Motivational quotes
    const quotes = [
      "Health is wealth. Take care of yourself today.",
      "Your body hears everything your mind says. Stay positive.",
      "Take care of your body. It's the only place you have to live.",
      "The greatest wealth is health.",
      "A healthy outside starts from the inside.",
      "Your health is an investment, not an expense.",
      "Small steps every day lead to big changes.",
      "Health is not about the weight you lose, but about the life you gain."
    ];

    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

    res.json({
      success: true,
      recommendations: recommendations.recommendations,
      quote: randomQuote,
      userProfile: {
        bmi: user.healthProfile?.bmi,
        bmiStatus: user.getBMIStatus()
      }
    });

  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recommendations'
    });
  }
};

/**
 * Get exercise recommendations based on symptoms/goals
 * GET /api/recommendations/exercises
 */
exports.getExerciseRecommendations = async (req, res) => {
  try {
    const { symptom, goal } = req.query;

    // Exercise database with YouTube links
    const exercises = {
      stress: [
        { name: 'Yoga for Stress Relief', videoId: 'COp7BR_Dvps', duration: '20 min' },
        { name: 'Meditation for Beginners', videoId: 'inpok4MKVLM', duration: '10 min' },
        { name: 'Deep Breathing Exercises', videoId: 'tybOi4hjZFQ', duration: '5 min' }
      ],

      'back pain': [
        { name: 'Lower Back Pain Relief', videoId: 'DWmGArQBtFI', duration: '15 min' },
        { name: 'Stretches for Back Pain', videoId: '4BOTvaRaDjI', duration: '10 min' },
        { name: 'Yoga for Back Pain', videoId: 'qULTwquOuT4', duration: '25 min' }
      ],

      // UPDATED Energy Boost with your 3 provided videos
      fatigue: [
        {
          name: 'Energy Boost Routine 1',
          videoId: '1_yu_XcJEFc', // https://youtu.be/1_yu_XcJEFc
          duration: '10 min'
        },
        {
          name: 'Energy Boost Routine 2',
          videoId: 'MU_3eoa1-X0', // https://youtu.be/MU_3eoa1-X0
          duration: '10 min'
        },
        {
          name: 'Energy Boost Routine 3',
          videoId: '5CLCJrxfn6Q', // https://youtu.be/5CLCJrxfn6Q
          duration: '10 min'
        }
      ],

      anxiety: [
        { name: 'Calming Yoga Flow', videoId: 'BiWDsfZ3zbo', duration: '20 min' },
        { name: 'Breathing for Anxiety', videoId: 'odADwWzHR24', duration: '8 min' },
        {
          name: 'Anxiety Relief Exercise',
          videoId: 'c0aqDu8Dmvo', // https://youtu.be/c0aqDu8Dmvo
          duration: '15 min'
        }
      ],

      general: [
        { name: 'Full Body Workout', videoId: 'ml6cT4AZdqI', duration: '30 min' },
        { name: 'Cardio for Beginners', videoId: 'gC_L9qAHVJ8', duration: '20 min' },
        { name: 'Daily Stretching Routine', videoId: 'g_tea8ZNk5A', duration: '15 min' }
      ]
    };

    const key = (symptom || goal || 'general').toLowerCase();
    const matchedExercises = exercises[key] || exercises['general'];

    res.json({
      success: true,
      exercises: matchedExercises
    });

  } catch (error) {
    console.error('Get exercises error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get exercise recommendations'
    });
  }
};
