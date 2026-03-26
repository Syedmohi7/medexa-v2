const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getChatHistory,
  deleteSession,
  getSessions
} = require('../controllers/chat.controller');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/message', sendMessage);
router.get('/history', getChatHistory);
router.get('/sessions', getSessions);
router.delete('/session/:sessionId', deleteSession);

module.exports = router;