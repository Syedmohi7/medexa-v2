const User = require('../models/User');
const Symptom = require('../models/Symptom');
const pdfService = require('../services/pdf.service');
const csvService = require('../services/csv.service');

/**
 * Download health report as PDF
 * GET /api/reports/pdf
 */
exports.downloadPDF = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    const symptoms = await Symptom.find({ user: userId }).sort({ createdAt: -1 });

    pdfService.generateHealthReport(user, symptoms, res);

  } catch (error) {
    console.error('PDF download error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate PDF report'
    });
  }
};

/**
 * Download health report as CSV
 * GET /api/reports/csv
 */
exports.downloadCSV = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    const symptoms = await Symptom.find({ user: userId }).sort({ createdAt: -1 });

    const csv = csvService.generateHealthReport(user, symptoms);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=MEDEXA_Health_Report_${user.name.replace(/\s/g, '_')}.csv`);
    res.send(csv);

  } catch (error) {
    console.error('CSV download error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate CSV report'
    });
  }
};