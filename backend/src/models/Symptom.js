const mongoose = require('mongoose');

const symptomSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  symptoms: [{
    type: String,
    required: true
  }],
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    required: true
  },
  precautions: [String],
  recommendations: [String],
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

symptomSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Symptom', symptomSchema);