const Symptom = require('../models/Symptom');
const User = require('../models/User');
const aiService = require('../services/ai.service');

/**
 * Analyze symptoms
 * POST /api/symptoms/analyze
 */
exports.analyzeSymptoms = async (req, res) => {
  try {
    const { symptoms } = req.body;
    const userId = req.user._id;

    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one symptom'
      });
    }

    // Get user context
    const user = await User.findById(userId);
    const userContext = {
      name: user.name,
      age: user.healthProfile?.age,
      gender: user.healthProfile?.gender,
      bmi: user.healthProfile?.bmi,
      existingConditions: user.healthProfile?.existingConditions
    };

    // Analyze symptoms using AI
    const analysis = await aiService.analyzeSymptoms(symptoms, userContext);

    // Save to database
    const symptomRecord = await Symptom.create({
      user: userId,
      symptoms,
      riskLevel: analysis.riskLevel,
      precautions: analysis.precautions,
      recommendations: analysis.recommendations
    });

    // Also update user's symptoms array
    user.symptoms.push({
      symptom: symptoms.join(', '),
      severity: analysis.riskLevel,
      date: new Date()
    });
    await user.save();

    res.json({
      success: true,
      analysis: {
        riskLevel: analysis.riskLevel,
        precautions: analysis.precautions,
        recommendations: analysis.recommendations
      },
      symptomId: symptomRecord._id
    });

  } catch (error) {
    console.error('Symptom analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze symptoms'
    });
  }
};

/**
 * Get symptom history
 * GET /api/symptoms/history
 */
exports.getSymptomHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 10, page = 1 } = req.query;

    const symptoms = await Symptom.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Symptom.countDocuments({ user: userId });

    res.json({
      success: true,
      symptoms,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get symptom history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get symptom history'
    });
  }
};

/**
 * Get symptom statistics
 * GET /api/symptoms/stats
 */
exports.getSymptomStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await Symptom.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$riskLevel',
          count: { $sum: 1 }
        }
      }
    ]);

    const total = await Symptom.countDocuments({ user: userId });

    res.json({
      success: true,
      stats: {
        total,
        byRiskLevel: stats.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, { low: 0, medium: 0, high: 0 })
      }
    });

  } catch (error) {
    console.error('Get symptom stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get symptom statistics'
    });
  }
};