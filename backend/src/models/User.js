const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  healthProfile: {
    age: {
      type: Number,
      min: 0,
      max: 150
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', '']
    },
    height: {
      type: Number,
      min: 0
    },
    weight: {
      type: Number,
      min: 0
    },
    bmi: {
      type: Number
    },
    existingConditions: [{
      type: String
    }],
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', '']
    }
  },
  symptoms: [{
    symptom: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high']
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/* ✅ FIXED BMI CALCULATION (ONLY CHANGE) */
userSchema.pre('save', function(next) {
  const hp = this.healthProfile;

  if (
    hp &&
    hp.height !== undefined &&
    hp.weight !== undefined &&
    hp.height > 0 &&
    hp.weight > 0
  ) {
    const heightInMeters = hp.height / 100;
    hp.bmi = parseFloat(
      (hp.weight / (heightInMeters * heightInMeters)).toFixed(1)
    );
  }

  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get BMI status
userSchema.methods.getBMIStatus = function() {
  const bmi = this.healthProfile.bmi;
  if (!bmi) return 'Not calculated';
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
};

module.exports = mongoose.model('User', userSchema);
