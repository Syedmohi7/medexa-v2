const express = require('express');
const router = express.Router();

const adminController = require('../controllers/admin.controller');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);
router.use(adminOnly);

/* ======================
   DASHBOARD
====================== */
router.get('/dashboard', adminController.getDashboardStats);

/* ======================
   USERS
====================== */
router.get('/users', adminController.getAllUsers);
router.get('/users/:userId', adminController.getUserDetails);
router.put(
  '/users/:userId/toggle-status',
  adminController.toggleUserStatus
);

/* ======================
   CHATS
====================== */
router.get('/chats', adminController.getAllChats);

/* ======================
   SYMPTOMS
====================== */
router.get('/symptoms', adminController.getAllSymptoms);

/* ======================
   EXPORT
====================== */
router.get('/export/users', adminController.exportUsers);

module.exports = router;
