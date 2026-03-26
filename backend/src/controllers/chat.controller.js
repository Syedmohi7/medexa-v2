const Chat = require('../models/Chat');
const aiService = require('../services/ai.service');

/**
 * Generate unique session ID
 */
function generateSessionId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

/**
 * Send message to AI assistant
 * POST /api/chat/message
 */
exports.sendMessage = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const { message, sessionId } = req.body;
    const userId = req.user._id;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    const chatSessionId = sessionId || generateSessionId();

    // Get or create chat session
    let chat = await Chat.findOne({
      user: userId,
      sessionId: chatSessionId
    });

    if (!chat) {
      chat = await Chat.create({
        user: userId,
        sessionId: chatSessionId,
        messages: []
      });
    }

    // Add user message
    chat.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    // Prepare last 10 messages for AI
    const conversationHistory = chat.messages.slice(-10).map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content
    }));

    // User context for personalization
    const userContext = {
      name: req.user.name,
      age: req.user.healthProfile?.age,
      gender: req.user.healthProfile?.gender,
      bmi: req.user.healthProfile?.bmi,
      existingConditions: req.user.healthProfile?.existingConditions
    };

    // Call AI service (Groq)
    const aiResponse = await aiService.generateResponse(
      conversationHistory,
      userContext
    );

    // Save AI response
    chat.messages.push({
      role: 'assistant',
      content: aiResponse.message,
      timestamp: new Date()
    });

    await chat.save();

    res.json({
      success: true,
      sessionId: chatSessionId,
      message: aiResponse.message,
      usage: aiResponse.usage
    });

  } catch (error) {
    console.error('Chat error:', error.message);

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process message'
    });
  }
};

/**
 * Get chat history
 * GET /api/chat/history
 */
exports.getChatHistory = async (req, res) => {
  try {
    const { sessionId } = req.query;
    const userId = req.user._id;

    const query = { user: userId };
    if (sessionId) query.sessionId = sessionId;

    const chats = await Chat.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      chats
    });

  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get chat history'
    });
  }
};

/**
 * Delete chat session
 * DELETE /api/chat/session/:sessionId
 */
exports.deleteSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user._id;

    await Chat.deleteMany({ user: userId, sessionId });

    res.json({
      success: true,
      message: 'Chat session deleted successfully'
    });

  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete chat session'
    });
  }
};

/**
 * Get all chat sessions
 * GET /api/chat/sessions
 */
exports.getSessions = async (req, res) => {
  try {
    const userId = req.user._id;

    const sessions = await Chat.aggregate([
      { $match: { user: userId } },
      { $sort: { updatedAt: -1 } },
      {
        $group: {
          _id: '$sessionId',
          lastMessage: { $first: '$messages' },
          messageCount: { $sum: { $size: '$messages' } },
          createdAt: { $first: '$createdAt' },
          updatedAt: { $first: '$updatedAt' }
        }
      }
    ]);

    res.json({
      success: true,
      sessions
    });

  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get chat sessions'
    });
  }
};
