const express = require('express');
const router = express.Router();
const { downloadPDF, downloadCSV } = require('../controllers/report.controller');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/pdf', downloadPDF);
router.get('/csv', downloadCSV);

module.exports = router;