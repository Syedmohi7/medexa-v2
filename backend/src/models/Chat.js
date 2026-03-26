const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  metadata: {
    symptomsDiscussed: [String],
    riskLevel: String,
    userSatisfaction: Number
  }
}, {
  timestamps: true
});

// Index for faster queries
chatSchema.index({ user: 1, createdAt: -1 });
chatSchema.index({ sessionId: 1 });

module.exports = mongoose.model('Chat', chatSchema);