const User = require('../models/User');
const Chat = require('../models/Chat');
const Symptom = require('../models/Symptom');
const { Parser } = require('json2csv');

/**
 * Get admin dashboard stats
 * GET /api/admin/dashboard
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const activeUsers = await User.countDocuments({
      role: 'user',
      isActive: true,
    });
    const totalChats = await Chat.countDocuments();
    const totalSymptoms = await Symptom.countDocuments();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newUsers = await User.countDocuments({
      role: 'user',
      createdAt: { $gte: thirtyDaysAgo },
    });

    const riskDistributionRaw = await Symptom.aggregate([
      {
        $group: {
          _id: '$riskLevel',
          count: { $sum: 1 },
        },
      },
    ]);

    const riskDistribution = { low: 0, medium: 0, high: 0 };
    riskDistributionRaw.forEach((r) => {
      if (r._id) riskDistribution[r._id] = r.count;
    });

    /* ✅ FIXED PART — ONLY THIS CHANGED */
    const recentUsersRaw = await User.find({ role: 'user' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email createdAt healthProfile');

    const recentUsers = recentUsersRaw.map((u) => ({
  name: u.name,
  email: u.email,
  createdAt: u.createdAt,
  age: u.healthProfile?.age || null,
  gender: u.healthProfile?.gender || null,
  height: u.healthProfile?.height || null,
  weight: u.healthProfile?.weight || null,
}));

    /* ✅ END FIX */

    const recentSymptoms = await Symptom.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        totalChats,
        totalSymptoms,
        newUsers,
        riskDistribution,
        recentUsers,
        recentSymptoms,
      },
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard stats',
    });
  }
};

/**
 * Get all users
 * GET /api/admin/users
 */
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;

    const query = { role: 'user' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users',
    });
  }
};

/**
 * Get user details
 * GET /api/admin/users/:userId
 */
exports.getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const symptoms = await Symptom.find({ user: userId }).sort({
      createdAt: -1,
    });
    const chats = await Chat.find({ user: userId }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      user,
      symptoms,
      chatCount: chats.length,
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user details',
    });
  }
};

/**
 * Get all chat logs
 * GET /api/admin/chats
 */
exports.getAllChats = async (req, res) => {
  try {
    const { page = 1, limit = 20, userId } = req.query;

    const query = {};
    if (userId) query.user = userId;

    const chats = await Chat.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Chat.countDocuments(query);

    res.json({
      success: true,
      chats,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get all chats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get chat logs',
    });
  }
};

/**
 * Get all symptoms
 * GET /api/admin/symptoms
 */
exports.getAllSymptoms = async (req, res) => {
  try {
    const { page = 1, limit = 20, riskLevel } = req.query;

    const query = {};
    if (riskLevel) query.riskLevel = riskLevel;

    const symptoms = await Symptom.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Symptom.countDocuments(query);

    res.json({
      success: true,
      symptoms,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get all symptoms error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get symptoms',
    });
  }
};

/**
 * Export users FULL health data as CSV
 */
exports.exportUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' })
      .select('-password')
      .lean();

    const symptoms = await Symptom.find()
      .populate('user', 'email')
      .lean();

    const symptomMap = {};

    symptoms.forEach((s) => {
      const email = s.user?.email;
      if (!email) return;

      if (!symptomMap[email]) {
        symptomMap[email] = [];
      }

      if (Array.isArray(s.symptoms)) {
        symptomMap[email].push(...s.symptoms);
      }
    });

    /* ✅ Find maximum number of symptoms any user has */
    let maxSymptoms = 0;
    Object.values(symptomMap).forEach((arr) => {
      if (arr.length > maxSymptoms) maxSymptoms = arr.length;
    });

    const csvData = users.map((u) => {
      const hp = u.healthProfile || {};
      const userSymptoms = [
  ...new Set(symptomMap[u.email] || [])
];


      const row = {
        Name: u.name || '',
        Email: u.email || '',
        Age: hp.age || '',
        Gender: hp.gender || '',
        Height_cm: hp.height || '',
        Weight_kg: hp.weight || '',
        BMI: hp.bmi || '',
        Status: u.isActive ? 'Active' : 'Inactive',
        Registered_On: u.createdAt
          ? new Date(u.createdAt).toLocaleDateString()
          : '',
      };

      /* ✅ Add dynamic symptom columns */
      for (let i = 0; i < maxSymptoms; i++) {
        row[`Symptom_${i + 1}`] = userSymptoms[i] || '';
      }

      return row;
    });

    const parser = new Parser({ fields: Object.keys(csvData[0]) });
    const csv = parser.parse(csvData);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=MEDEXA_FULL_USER_REPORT_${Date.now()}.csv`
    );

    res.status(200).send(csv);
  } catch (error) {
    console.error('Export users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export users',
    });
  }
};

/**
 * Toggle user active status
 */
exports.toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${
        user.isActive ? 'activated' : 'deactivated'
      } successfully`,
      isActive: user.isActive,
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle user status',
    });
  }
};
