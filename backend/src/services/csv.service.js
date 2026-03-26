const { Parser } = require('json2csv');

class CSVService {
  generateHealthReport(user, symptoms) {
    try {
      const data = [{
        'Name': user.name,
        'Email': user.email,
        'Age': user.healthProfile?.age || 'N/A',
        'Gender': user.healthProfile?.gender || 'N/A',
        'Height (cm)': user.healthProfile?.height || 'N/A',
        'Weight (kg)': user.healthProfile?.weight || 'N/A',
        'BMI': user.healthProfile?.bmi || 'N/A',
        'BMI Status': user.getBMIStatus(),
        'Blood Group': user.healthProfile?.bloodGroup || 'N/A',
        'Existing Conditions': user.healthProfile?.existingConditions?.join('; ') || 'None',
        'Latest Symptoms': symptoms?.[0]?.symptoms?.join('; ') || 'None',
        'Risk Level': symptoms?.[0]?.riskLevel || 'N/A',
        'Report Date': new Date().toLocaleString()
      }];

      const parser = new Parser();
      return parser.parse(data);
    } catch (error) {
      console.error('CSV generation error:', error);
      throw new Error('Failed to generate CSV report');
    }
  }

  generateAdminReport(users) {
    try {
      const Symptom = require('../models/Symptom');
      
      // Flatten user data with all details
      const data = users.map(user => {
        // Get latest symptom
        const latestSymptom = user.symptoms?.[user.symptoms.length - 1];
        
        return {
          'User ID': user._id,
          'Name': user.name,
          'Email': user.email,
          'Role': user.role,
          'Age': user.healthProfile?.age || 'N/A',
          'Gender': user.healthProfile?.gender || 'N/A',
          'Height (cm)': user.healthProfile?.height || 'N/A',
          'Weight (kg)': user.healthProfile?.weight || 'N/A',
          'BMI': user.healthProfile?.bmi || 'N/A',
          'Blood Group': user.healthProfile?.bloodGroup || 'N/A',
          'Existing Conditions': user.healthProfile?.existingConditions?.join('; ') || 'None',
          'Latest Symptom': latestSymptom?.symptom || 'None',
          'Symptom Severity': latestSymptom?.severity || 'N/A',
          'Symptom Date': latestSymptom?.date ? new Date(latestSymptom.date).toLocaleDateString() : 'N/A',
          'Active': user.isActive ? 'Yes' : 'No',
          'Last Login': user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never',
          'Registered Date': new Date(user.createdAt).toLocaleString(),
          'Total Symptoms Recorded': user.symptoms?.length || 0
        };
      });

      const parser = new Parser();
      return parser.parse(data);
    } catch (error) {
      console.error('Admin CSV generation error:', error);
      throw new Error('Failed to generate admin CSV report');
    }
  }
}

module.exports = new CSVService();