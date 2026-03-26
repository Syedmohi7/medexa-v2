const express = require('express');
const router = express.Router();
const { updateHealthProfile, getDashboard } = require('../controllers/user.controller');
const { protect } = require('../middleware/auth');

router.use(protect);

router.put('/profile', updateHealthProfile);
router.get('/dashboard', getDashboard);

module.exports = router;