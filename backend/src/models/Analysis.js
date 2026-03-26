const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['prescription', 'lab_report'],
    required: true
  },
  imageData: {
    type: String,
    required: true
  },
  extractedText: String,
  analysis: mongoose.Schema.Types.Mixed,
  
  // Prescription fields
  medicines: [{
    name: String,
    dosage: String,
    frequency: String,
    duration: String,
    timing: String,
    beforeAfterFood: String,
    purpose: String,
    sideEffects: [String],
    precautions: [String]
  }],
  doctorName: String,
  prescriptionDate: Date,
  generalInstructions: String,
  emergencyNote: String,
  
  // Lab Report fields - NO ENUM RESTRICTIONS AT ALL
  reportType: String,  // Accept ANY report type
  testResults: [{
    parameter: String,
    value: String,
    unit: String,
    normalRange: String,
    status: String,  // Accept ANY status (Normal, Low, High, Critical, Review, etc.)
    interpretation: String
  }],
  overallStatus: String,  // Accept ANY status
  keyFindings: [String],
  recommendations: [String],
  doctorConsultationNeeded: Boolean,
  urgencyLevel: String,  // Accept ANY urgency level
  summary: String,
  ocrEngine: String,
  ocrScore: Number,
  clarity: String,
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add index for faster queries
analysisSchema.index({ user: 1, createdAt: -1 });
analysisSchema.index({ type: 1 });

module.exports = mongoose.model('Analysis', analysisSchema);