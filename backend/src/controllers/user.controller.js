const User = require('../models/User');

/**
 * Update health profile
 * PUT /api/users/profile
 */
exports.updateHealthProfile = async (req, res) => {
  try {
    const { age, gender, height, weight, bloodGroup, existingConditions } = req.body;

    const user = await User.findById(req.user._id);

    // Update fields
    if (age !== undefined) user.healthProfile.age = age;
    if (gender !== undefined) user.healthProfile.gender = gender;
    if (height !== undefined) user.healthProfile.height = height;
    if (weight !== undefined) user.healthProfile.weight = weight;
    if (bloodGroup !== undefined) user.healthProfile.bloodGroup = bloodGroup;
    if (existingConditions !== undefined) user.healthProfile.existingConditions = existingConditions;

    await user.save();

    res.json({
      success: true,
      message: 'Health profile updated successfully',
      healthProfile: user.healthProfile
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update health profile'
    });
  }
};

/**
 * Get user dashboard stats
 * GET /api/users/dashboard
 */
exports.getDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const Symptom = require('../models/Symptom');
    const Chat = require('../models/Chat');

    const symptomCount = await Symptom.countDocuments({ user: user._id });
    const chatCount = await Chat.countDocuments({ user: user._id });
    const latestSymptoms = await Symptom.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        totalSymptoms: symptomCount,
        totalChats: chatCount,
        healthProfile: user.healthProfile,
        latestSymptoms,
        bmiStatus: user.getBMIStatus()
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard data'
    });
  }
};