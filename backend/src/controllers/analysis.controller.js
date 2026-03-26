const Analysis = require('../models/Analysis');
const visionService = require('../services/vision.service');

class AnalysisController {
  async analyzePrescription(req, res) {
    try {
      const { imageData } = req.body;

      if (!imageData) {
        return res.status(400).json({
          success: false,
          message: 'Please provide file'
        });
      }

      console.log('📸 Analyzing prescription...');

      const result = await visionService.analyzePrescription(imageData);

      if (result.clarity === 'low') {
        return res.status(400).json({
          success: false,
          message: 'Quality too low. Retake with better lighting.',
          extractedText: result.extractedText
        });
      }

      const analysis = new Analysis({
        user: req.user.id,
        type: 'prescription',
        imageData: imageData,
        extractedText: result.extractedText,
        medicines: result.medicines || [],
        doctorName: result.doctorName,
        prescriptionDate: result.prescriptionDate,
        generalInstructions: result.generalInstructions,
        emergencyNote: result.emergencyNote,
        analysis: result
      });

      await analysis.save();

      res.json({
        success: true,
        message: `✅ Found ${analysis.medicines.length} medicine(s)`,
        data: {
          id: analysis._id,
          medicines: analysis.medicines,
          doctorName: analysis.doctorName,
          prescriptionDate: analysis.prescriptionDate,
          generalInstructions: analysis.generalInstructions,
          emergencyNote: analysis.emergencyNote,
          extractedText: result.extractedText,
          clarity: result.clarity,
          ocrEngine: result.ocrEngine,
          ocrScore: result.ocrScore,
          createdAt: analysis.createdAt
        }
      });

    } catch (error) {
      console.error('❌ Error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Analysis failed'
      });
    }
  }

  async analyzeLabReport(req, res) {
    try {
      const { imageData } = req.body;

      if (!imageData) {
        return res.status(400).json({
          success: false,
          message: 'Please provide file'
        });
      }

      console.log('🧪 Analyzing lab report...');

      const result = await visionService.analyzeLabReport(imageData);

      if (result.clarity === 'low') {
        return res.status(400).json({
          success: false,
          message: 'Quality too low. Try clearer image.',
          extractedText: result.extractedText
        });
      }

      const analysis = new Analysis({
        user: req.user.id,
        type: 'lab_report',
        imageData: imageData,
        extractedText: result.extractedText,
        reportType: result.reportType,
        testResults: result.testResults || [],
        overallStatus: result.overallStatus,
        keyFindings: result.keyFindings || [],
        recommendations: result.recommendations || [],
        doctorConsultationNeeded: result.doctorConsultationNeeded,
        urgencyLevel: result.urgencyLevel,
        summary: result.summary,
        analysis: result
      });

      await analysis.save();

      res.json({
        success: true,
        message: `✅ Found ${analysis.testResults.length} test(s)`,
        data: {
          id: analysis._id,
          reportType: analysis.reportType,
          testResults: analysis.testResults,
          overallStatus: analysis.overallStatus,
          keyFindings: analysis.keyFindings,
          recommendations: analysis.recommendations,
          doctorConsultationNeeded: analysis.doctorConsultationNeeded,
          urgencyLevel: analysis.urgencyLevel,
          summary: analysis.summary,
          extractedText: result.extractedText,
          clarity: result.clarity,
          ocrEngine: result.ocrEngine,
          ocrScore: result.ocrScore,
          createdAt: analysis.createdAt
        }
      });

    } catch (error) {
      console.error('❌ Error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Analysis failed'
      });
    }
  }

  async getHistory(req, res) {
    try {
      const { type } = req.query;
      const query = { user: req.user.id };
      if (type) query.type = type;

      const analyses = await Analysis.find(query)
        .sort({ createdAt: -1 })
        .select('-imageData')
        .limit(50);

      res.json({ success: true, data: analyses });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch' });
    }
  }

  async getAnalysis(req, res) {
    try {
      const analysis = await Analysis.findOne({
        _id: req.params.id,
        user: req.user.id
      });

      if (!analysis) {
        return res.status(404).json({ success: false, message: 'Not found' });
      }

      res.json({ success: true, data: analysis });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed' });
    }
  }

  async deleteAnalysis(req, res) {
    try {
      const analysis = await Analysis.findOneAndDelete({
        _id: req.params.id,
        user: req.user.id
      });

      if (!analysis) {
        return res.status(404).json({ success: false, message: 'Not found' });
      }

      res.json({ success: true, message: 'Deleted' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed' });
    }
  }
}

module.exports = new AnalysisController();