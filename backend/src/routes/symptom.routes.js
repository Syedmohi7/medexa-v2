const express = require('express');
const router = express.Router();
const {
  analyzeSymptoms,
  getSymptomHistory,
  getSymptomStats
} = require('../controllers/symptom.controller');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/analyze', analyzeSymptoms);
router.get('/history', getSymptomHistory);
router.get('/stats', getSymptomStats);

module.exports = router;