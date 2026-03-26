const express = require('express');
const router = express.Router();
const analysisController = require('../controllers/analysis.controller');
const { protect } = require('../middleware/auth'); // Correct path to auth.js

// All routes require authentication
router.use(protect);

// POST /api/analysis/prescription - Analyze prescription
router.post('/prescription', analysisController.analyzePrescription);

// POST /api/analysis/lab-report - Analyze lab report
router.post('/lab-report', analysisController.analyzeLabReport);

// GET /api/analysis/history - Get analysis history
router.get('/history', analysisController.getHistory);

// GET /api/analysis/:id - Get single analysis
router.get('/:id', analysisController.getAnalysis);

// DELETE /api/analysis/:id - Delete analysis
router.delete('/:id', analysisController.deleteAnalysis);

module.exports = router;