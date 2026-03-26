const express = require('express');
const router = express.Router();
const {
  getRecommendations,
  getExerciseRecommendations
} = require('../controllers/recommendation.controller');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getRecommendations);
router.get('/exercises', getExerciseRecommendations);

module.exports = router;