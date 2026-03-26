const ultimateOCR = require('./ultimate-ocr.service');
const aiService = require('./ai.service');

class VisionService {
  async analyzePrescription(fileData) {
    try {
      console.log('🏥 ULTRA PRESCRIPTION ANALYSIS - GOOGLE VISION + ADVANCED AI');

      ultimateOCR.validateFile(fileData);
      const ocrResult = await ultimateOCR.extractText(fileData);

      if (!ocrResult.success) throw new Error(ocrResult.message);

      const extractedText = ocrResult.text;
      console.log(`✅ OCR Engine: ${ocrResult.engine}, Quality: ${ocrResult.score}/100`);
      console.log(`📝 Extracted ${extractedText.length} characters`);

      // ULTRA-DETAILED AI PROMPT WITH MEDICAL KNOWLEDGE
      const prompt = `You are an expert pharmacist analyzing a prescription. The text below was extracted via OCR and may contain errors from handwriting.

EXTRACTED TEXT:
${extractedText}

YOUR TASK:
Extract ALL medicines with complete details. Use your pharmaceutical knowledge to:
1. Correct OCR spelling errors (common: "Paracetamo1" = Paracetamol, "Azithromycn" = Azithromycin)
2. Interpret medical abbreviations correctly
3. Provide accurate dosing information
4. Include relevant warnings and side effects
5. Give proper food timing recommendations

MEDICAL ABBREVIATIONS GUIDE:
- Tab/Tab. = Tablet, Cap = Capsule, Syr = Syrup, Susp = Suspension
- Ont/Oint = Ointment, Lot = Lotion, Cr = Cream, Gel = Gel
- Shmp = Shampoo, Sol = Solution, Inj = Injection
- BD/b.d/BID = Twice daily (bis in die)
- TDS/t.d.s/TID = Three times daily (ter in die)
- QDS/QID = Four times daily (quater in die)
- OD/o.d = Once daily (omne in die)
- SOS = As needed (si opus sit)
- HS = At bedtime (hora somni)
- PRN = When necessary (pro re nata)
- AC = Before food (ante cibum)
- PC = After food (post cibum)
- Stat = Immediately
- PRN = As needed

FREQUENCY PATTERNS:
- "1-0-1" = Morning and Night (2 times daily)
- "1-1-1" = Three times daily
- "0-0-1" = Night only
- "1-0-0" = Morning only

RETURN ONLY THIS EXACT JSON STRUCTURE:
{
  "medicines": [
    {
      "name": "Correct medicine name (generic or brand)",
      "dosage": "Exact strength (e.g., 500mg, 10ml, 1%, 2 tablets)",
      "frequency": "Once daily / Twice daily / Three times daily / Four times daily / As needed",
      "duration": "7 days / 10 days / 2 weeks / 1 month / Continue / As needed",
      "timing": "Morning / Night / Morning and Night / Morning-Afternoon-Night / Every 6 hours / As needed",
      "beforeAfterFood": "After food / Before food / With food / Empty stomach / Not applicable",
      "purpose": "Primary indication (e.g., For bacterial infection, For pain relief, For acne, For blood pressure)",
      "sideEffects": [
        "Most common side effect",
        "Second common side effect",
        "Third common side effect"
      ],
      "precautions": [
        "Important warning or contraindication",
        "Drug interaction warning",
        "Special instruction"
      ]
    }
  ],
  "doctorName": "Dr. Full Name (or null if not clearly visible)",
  "prescriptionDate": "YYYY-MM-DD format (or null)",
  "generalInstructions": "Any general advice from doctor (or null)",
  "emergencyNote": "Any urgent warnings (or null)",
  "clarity": "high / medium / low"
}

IMPORTANT MEDICINE KNOWLEDGE:
Antibiotics: Azithromycin (500mg OD/BD x5 days), Amoxicillin (500mg TDS x7 days), Ciprofloxacin, Doxycycline
Pain Relief: Paracetamol (500-1000mg), Ibuprofen (400mg), Diclofenac
Skin: Clindamycin gel/lotion, Tretinoin cream, Adapalene, Benzoyl Peroxide, Salicylic Acid
Antifungal: Ketoconazole, Fluconazole, Terbinafine
Steroids: Mometasone, Betamethasone, Hydrocortisone
Antihistamine: Cetirizine (10mg OD), Loratadine
Stomach: Pantoprazole (40mg), Omeprazole, Ranitidine

Extract EVERY medicine you can identify. Return ONLY the JSON, nothing else.`;

      const response = await aiService.generateResponse([
        { role: 'user', content: prompt }
      ]);

      console.log('🤖 AI Analysis complete');

      let jsonStr = this.cleanJSON(response.message);
      let parsed = this.safeJSONParse(jsonStr, {
        medicines: [],
        doctorName: null,
        prescriptionDate: null,
        generalInstructions: null,
        emergencyNote: null,
        clarity: "medium"
      });

      // Fallback: Manual extraction if AI failed
      if (!parsed.medicines || parsed.medicines.length === 0) {
        console.log('⚠️ AI extraction failed, attempting manual extraction...');
        parsed.medicines = this.intelligentManualExtraction(extractedText);
      }

      // Add metadata
      parsed.extractedText = extractedText;
      parsed.ocrEngine = ocrResult.engine;
      parsed.ocrScore = ocrResult.score;

      if (!parsed.medicines) parsed.medicines = [];

      // Enhance medicines with additional safety info
      parsed.medicines = parsed.medicines.map(med => this.enhanceMedicine(med));

      console.log(`✅ FINAL: Successfully extracted ${parsed.medicines.length} medicine(s)`);
      
      return parsed;

    } catch (error) {
      console.error('❌ Prescription Analysis Error:', error.message);
      throw error;
    }
  }

  async analyzeLabReport(fileData) {
    try {
      console.log('🧪 ULTRA LAB REPORT ANALYSIS - GOOGLE VISION + ADVANCED AI');

      ultimateOCR.validateFile(fileData);
      const ocrResult = await ultimateOCR.extractText(fileData);

      if (!ocrResult.success) throw new Error(ocrResult.message);

      const extractedText = ocrResult.text;
      console.log(`✅ OCR Engine: ${ocrResult.engine}, Quality: ${ocrResult.score}/100`);

      // ADVANCED LAB ANALYSIS PROMPT
      const prompt = `You are a clinical pathologist analyzing a laboratory report.

EXTRACTED TEXT:
${extractedText}

ANALYZE EVERY TEST PARAMETER and provide comprehensive interpretation.

RETURN ONLY THIS JSON:
{
  "reportType": "Complete Blood Count (CBC) / Lipid Profile / Liver Function Test / Kidney Function Test / Thyroid Panel / Blood Glucose / Other",
  "testResults": [
    {
      "parameter": "Test name (e.g., Hemoglobin, Total Cholesterol, TSH)",
      "value": "Numeric result",
      "unit": "Unit of measurement (g/dL, mg/dL, mIU/L, etc.)",
      "normalRange": "Reference range from report or standard medical range",
      "status": "Normal / Low / High / Critical",
      "interpretation": "Patient-friendly explanation of what this value means and its clinical significance"
    }
  ],
  "overallStatus": "Normal / Needs Attention / Abnormal / Critical",
  "keyFindings": [
    "Most important abnormal finding with clinical significance",
    "Second important finding",
    "Third important finding"
  ],
  "recommendations": [
    "Specific dietary advice based on actual results",
    "Lifestyle modification recommendation",
    "Follow-up test recommendation if needed",
    "When to see doctor"
  ],
  "doctorConsultationNeeded": true/false,
  "urgencyLevel": "Routine / Soon (within 1 week) / Urgent (within 2-3 days) / Emergency (immediate)",
  "summary": "Comprehensive summary in patient-friendly language explaining overall health status",
  "clarity": "high / medium / low"
}

STANDARD REFERENCE RANGES:
- Hemoglobin: Male 13.5-17.5 g/dL, Female 12-15.5 g/dL
- WBC Count: 4,000-11,000 cells/µL
- RBC Count: Male 4.5-5.9 million/µL, Female 4.0-5.2 million/µL
- Platelet Count: 150,000-450,000/µL
- Glucose (Fasting): 70-100 mg/dL
- Total Cholesterol: <200 mg/dL (desirable)
- LDL: <100 mg/dL (optimal)
- HDL: >40 mg/dL (male), >50 mg/dL (female)
- Triglycerides: <150 mg/dL
- TSH: 0.4-4.0 mIU/L
- ALT/SGPT: 7-56 U/L
- AST/SGOT: 10-40 U/L
- Creatinine: 0.7-1.3 mg/dL
- Uric Acid: 3.5-7.2 mg/dL

Extract ALL parameters. Provide detailed, accurate interpretations. Return ONLY JSON.`;

      const response = await aiService.generateResponse([
        { role: 'user', content: prompt }
      ]);

      console.log('🤖 AI Analysis complete');

      let jsonStr = this.cleanJSON(response.message);
      let parsed = this.safeJSONParse(jsonStr, {
        reportType: "Medical Lab Report",
        testResults: [],
        overallStatus: "Unknown",
        keyFindings: ["Unable to parse results automatically"],
        recommendations: ["Please consult with your doctor for interpretation"],
        doctorConsultationNeeded: true,
        urgencyLevel: "Soon",
        summary: "Lab report received. Please review with your healthcare provider.",
        clarity: "medium"
      });

      // Manual extraction fallback
      if (!parsed.testResults || parsed.testResults.length === 0) {
        console.log('⚠️ AI extraction failed, attempting manual extraction...');
        parsed.testResults = this.intelligentLabExtraction(extractedText);
        
        if (parsed.testResults.length > 0) {
          parsed.reportType = this.detectReportType(extractedText);
          parsed.overallStatus = this.calculateOverallStatus(parsed.testResults);
          parsed.keyFindings = this.generateKeyFindings(parsed.testResults);
          parsed.recommendations = this.generateRecommendations(parsed.testResults, parsed.reportType);
          parsed.summary = this.generateSummary(parsed.testResults, parsed.overallStatus);
        }
      }

      parsed.extractedText = extractedText;
      parsed.ocrEngine = ocrResult.engine;
      parsed.ocrScore = ocrResult.score;

      if (!parsed.testResults) parsed.testResults = [];
      if (!parsed.recommendations) parsed.recommendations = [];
      if (!parsed.keyFindings) parsed.keyFindings = [];

      console.log(`✅ FINAL: Analyzed ${parsed.testResults.length} test parameter(s)`);

      return parsed;

    } catch (error) {
      console.error('❌ Lab Report Analysis Error:', error.message);
      throw error;
    }
  }

  /**
   * Intelligent manual medicine extraction with pattern recognition
   */
  intelligentManualExtraction(text) {
    const medicines = [];
    const lines = text.split('\n');

    const medKeywords = /tab|cap|syr|ont|oint|cream|lotion|gel|shampoo|solution/i;
    const freqKeywords = /bd|tds|od|qid|sos|daily|day|times|morning|night/i;

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.length < 5) continue;
      if (/dr\.|doctor|clinic|hospital|patient name/i.test(trimmed)) continue;

      const hasNumber = /\d+/.test(trimmed);
      const hasMedWord = medKeywords.test(trimmed);
      const hasFreq = freqKeywords.test(trimmed);

      if (hasNumber || hasMedWord || hasFreq) {
        const words = trimmed.split(/\s+/).filter(w => w.length > 2);
        const medName = words.find(w => /^[a-z]{5,}$/i.test(w)) || words[0] || 'Medicine';

        const dosageMatch = trimmed.match(/(\d+\.?\d*)\s*(mg|ml|%|g|gm|tablet|tab|cap)/i);
        const dosage = dosageMatch ? `${dosageMatch[1]}${dosageMatch[2]}` : 'As directed';

        let frequency = 'As prescribed';
        if (/bd|b\.d|bis/i.test(trimmed)) frequency = 'Twice daily';
        else if (/tds|t\.d\.s|ter/i.test(trimmed)) frequency = 'Three times daily';
        else if (/od|o\.d|once/i.test(trimmed)) frequency = 'Once daily';
        else if (/qid|qds/i.test(trimmed)) frequency = 'Four times daily';

        const durMatch = trimmed.match(/(\d+)\s*(day|days|week|weeks|month|months)/i);
        const duration = durMatch ? `${durMatch[1]} ${durMatch[2]}` : '7 days';

        medicines.push({
          name: this.correctMedicineName(medName),
          dosage,
          frequency,
          duration,
          timing: this.getTimingFromFrequency(frequency),
          beforeAfterFood: 'After food',
          purpose: 'As prescribed by doctor',
          sideEffects: ['Consult doctor if any adverse reaction occurs'],
          precautions: ['Take as directed', 'Complete the full course']
        });

        if (medicines.length >= 10) break;
      }
    }

    return medicines;
  }

  /**
   * Intelligent lab test extraction with PROPER STATUS CALCULATION
   */
  intelligentLabExtraction(text) {
    const results = [];
    const lines = text.split('\n');

    for (const line of lines) {
      // Pattern: Parameter  Value  Unit  Range  Status
      const match = line.match(/^([A-Za-z\s\(\)]+?)\s+([\d.,]+)\s*([a-zA-Z\/µ]+)?\s*([\d.\s\-<>]+)?\s*(Normal|Low|High|Critical)?/i);
      
      if (match) {
        const param = match[1].trim();
        if (param.length < 3 || /^\d+$/.test(param)) continue;
        if (results.some(r => r.parameter === param)) continue;

        const value = match[2];
        const unit = match[3] || '';
        const range = match[4] || this.getStandardRange(param);
        
        // Calculate status from value and range
        const status = match[5] || this.calculateStatus(param, parseFloat(value), range);

        results.push({
          parameter: param,
          value,
          unit,
          normalRange: range,
          status,
          interpretation: this.getInterpretation(param, value, status)
        });

        if (results.length >= 20) break;
      }
    }

    return results;
  }

  /**
   * Calculate status by comparing value to normal range
   */
  calculateStatus(param, value, range) {
    if (!range || range === 'See report') return 'Review';

    // Parse range like "13.5 - 17.5" or "4,000 - 11,000" or "<200" or ">40"
    
    // Less than pattern: <200
    const lessThanMatch = range.match(/^<\s*([\d,]+)/);
    if (lessThanMatch) {
      const max = parseFloat(lessThanMatch[1].replace(/,/g, ''));
      if (value < max) return 'Normal';
      if (value < max * 1.2) return 'High';
      return 'Critical';
    }

    // Greater than pattern: >40
    const greaterThanMatch = range.match(/^>\s*([\d,]+)/);
    if (greaterThanMatch) {
      const min = parseFloat(greaterThanMatch[1].replace(/,/g, ''));
      if (value > min) return 'Normal';
      if (value > min * 0.8) return 'Low';
      return 'Critical';
    }

    // Range pattern: "13.5 - 17.5" or "4,000 - 11,000"
    const rangeMatch = range.match(/([\d.,]+)\s*[-–to]\s*([\d.,]+)/i);
    if (rangeMatch) {
      const min = parseFloat(rangeMatch[1].replace(/,/g, ''));
      const max = parseFloat(rangeMatch[2].replace(/,/g, ''));

      if (isNaN(min) || isNaN(max) || isNaN(value)) return 'Review';

      // Normal range
      if (value >= min && value <= max) return 'Normal';

      // Low
      if (value < min) {
        if (value < min * 0.8) return 'Critical';
        return 'Low';
      }

      // High
      if (value > max) {
        if (value > max * 1.2) return 'Critical';
        return 'High';
      }
    }

    return 'Review';
  }

  /**
   * Enhance medicine with safety info
   */
  enhanceMedicine(med) {
    if (!med.sideEffects || med.sideEffects.length === 0) {
      med.sideEffects = ['Nausea', 'Dizziness', 'Allergic reaction'];
    }
    if (!med.precautions || med.precautions.length === 0) {
      med.precautions = ['Take as directed', 'Consult doctor if symptoms persist'];
    }
    return med;
  }

  /**
   * Correct common medicine name errors
   */
  correctMedicineName(name) {
    const dict = {
      'paracetamol': 'Paracetamol', 'paracetamo1': 'Paracetamol',
      'azithromycin': 'Azithromycin', 'azithromycn': 'Azithromycin',
      'amoxicillin': 'Amoxicillin', 'amoxicilin': 'Amoxicillin',
      'cetirizine': 'Cetirizine', 'cetrizine': 'Cetirizine',
      'ibuprofen': 'Ibuprofen', 'diclofenac': 'Diclofenac',
      'pantoprazole': 'Pantoprazole', 'omeprazole': 'Omeprazole',
      'clindamycin': 'Clindamycin', 'tretinoin': 'Tretinoin',
      'adapalene': 'Adapalene', 'ketoconazole': 'Ketoconazole',
      'mometasone': 'Mometasone', 'betamethasone': 'Betamethasone'
    };

    const lower = name.toLowerCase().trim();
    return dict[lower] || (name.charAt(0).toUpperCase() + name.slice(1).toLowerCase());
  }

  getTimingFromFrequency(freq) {
    if (freq.includes('Twice')) return 'Morning and Night';
    if (freq.includes('Three')) return 'Morning, Afternoon, and Night';
    if (freq.includes('Four')) return 'Every 6 hours';
    if (freq.includes('Once')) return 'Morning or Night';
    return 'As directed';
  }

  detectReportType(text) {
    const patterns = {
      'Complete Blood Count': /complete blood (count|picture)|cbc|haemogram/i,
      'Lipid Profile': /lipid profile|cholesterol panel/i,
      'Liver Function Test': /liver function|lft|hepatic panel/i,
      'Kidney Function Test': /kidney function|kft|renal panel/i,
      'Thyroid Panel': /thyroid|tsh|t3|t4/i,
      'Blood Glucose': /glucose|blood sugar|hba1c/i
    };

    for (const [type, pattern] of Object.entries(patterns)) {
      if (pattern.test(text)) return type;
    }

    return 'Medical Lab Report';
  }

  /**
   * Calculate overall status from actual test statuses
   */
  calculateOverallStatus(results) {
    if (!results || results.length === 0) return 'Unknown';

    const critical = results.filter(r => r.status === 'Critical');
    const high = results.filter(r => r.status === 'High');
    const low = results.filter(r => r.status === 'Low');

    if (critical.length > 0) return 'Critical';
    if (high.length >= 2 || low.length >= 2) return 'Abnormal';
    if (high.length > 0 || low.length > 0) return 'Needs Attention';
    
    const allNormal = results.every(r => r.status === 'Normal');
    if (allNormal) return 'Normal';

    return 'Review Required';
  }

  /**
   * Generate key findings from abnormal results only
   */
  generateKeyFindings(results) {
    const abnormal = results.filter(r => 
      r.status !== 'Normal' && r.status !== 'Review'
    );

    if (abnormal.length === 0) {
      return ['All test parameters are within normal limits'];
    }

    return abnormal.slice(0, 5).map(r => 
      `${r.parameter}: ${r.value} ${r.unit} (${r.status}) - ${r.interpretation}`
    );
  }

  generateRecommendations(results, reportType) {
    const recommendations = [];
    const hasHighCholesterol = results.some(r => /cholesterol/i.test(r.parameter) && /high/i.test(r.status));
    const hasHighGlucose = results.some(r => /glucose|sugar/i.test(r.parameter) && /high/i.test(r.status));
    const hasLowHemoglobin = results.some(r => /hemoglobin/i.test(r.parameter) && /low/i.test(r.status));

    if (hasHighCholesterol) {
      recommendations.push('Reduce saturated fats and trans fats in diet');
      recommendations.push('Increase fiber intake with whole grains and vegetables');
      recommendations.push('Regular aerobic exercise (30 minutes, 5 days/week)');
    }
    if (hasHighGlucose) {
      recommendations.push('Limit refined carbohydrates and sugary foods');
      recommendations.push('Monitor blood glucose levels regularly');
      recommendations.push('Maintain healthy weight through diet and exercise');
    }
    if (hasLowHemoglobin) {
      recommendations.push('Increase iron-rich foods (spinach, red meat, lentils, fortified cereals)');
      recommendations.push('Pair iron-rich foods with vitamin C for better absorption');
      recommendations.push('Consider iron supplementation after consulting doctor');
    }

    if (recommendations.length === 0) {
      recommendations.push('Maintain a balanced, nutritious diet');
      recommendations.push('Stay physically active with regular exercise');
      recommendations.push('Get adequate sleep (7-8 hours nightly)');
    }

    recommendations.push('Schedule follow-up with your doctor to discuss results');
    return recommendations;
  }

  generateSummary(results, status) {
    const total = results.length;
    const abnormal = results.filter(r => r.status !== 'Normal' && r.status !== 'Review').length;

    if (status === 'Critical') {
      return `⚠️ Critical abnormalities detected in ${abnormal} of ${total} tests. Immediate medical attention is strongly recommended.`;
    }
    if (status === 'Abnormal') {
      return `${abnormal} of ${total} test results show significant abnormalities. Please consult your doctor for comprehensive evaluation and treatment plan.`;
    }
    if (status === 'Needs Attention') {
      return `${abnormal} test result(s) are outside normal range. Schedule a follow-up appointment with your doctor to discuss these findings.`;
    }
    if (status === 'Normal') {
      return `All ${total} test results are within normal limits. Your lab values indicate good health. Continue maintaining your healthy lifestyle.`;
    }
    return `Lab report analyzed with ${total} parameters. Please review with your healthcare provider for personalized medical advice.`;
  }

  /**
   * Get standard ranges for common tests
   */
  getStandardRange(param) {
    const lower = param.toLowerCase();
    
    const ranges = {
      'hemoglobin': '13.5 - 17.5',
      'hb': '13.5 - 17.5',
      'wbc': '4,000 - 11,000',
      'white blood': '4,000 - 11,000',
      'rbc': '4.5 - 5.9',
      'red blood': '4.5 - 5.9',
      'platelet': '150,000 - 450,000',
      'glucose': '70 - 100',
      'sugar': '70 - 100',
      'cholesterol': '<200',
      'ldl': '<100',
      'hdl': '>40',
      'triglyceride': '<150',
      'tsh': '0.4 - 4.0',
      'alt': '7 - 56',
      'ast': '10 - 40',
      'creatinine': '0.7 - 1.3',
      'uric': '3.5 - 7.2',
      'neutrophil': '40 - 70',
      'lymphocyte': '20 - 40',
      'monocyte': '2 - 8',
      'eosinophil': '1 - 6',
      'basophil': '0 - 1',
      'mcv': '80 - 100',
      'mch': '27 - 32',
      'mchc': '32 - 36'
    };

    for (const [key, range] of Object.entries(ranges)) {
      if (lower.includes(key)) return range;
    }

    return 'See report';
  }

  /**
   * Get interpretation based on parameter and status
   */
  getInterpretation(param, value, status) {
    const lower = param.toLowerCase();

    if (status === 'Normal') {
      return `${param} is within normal range, indicating good health`;
    }

    if (status === 'Low') {
      if (lower.includes('hemoglobin') || lower.includes('hb')) {
        return 'Low hemoglobin indicates anemia. May cause fatigue and weakness. Iron supplementation may be needed';
      }
      if (lower.includes('wbc') || lower.includes('white')) {
        return 'Low white blood cell count may indicate weakened immune system or bone marrow issues';
      }
      if (lower.includes('platelet')) {
        return 'Low platelet count may affect blood clotting ability. Monitor for unusual bleeding or bruising';
      }
      if (lower.includes('rbc') || lower.includes('red')) {
        return 'Low red blood cell count may cause fatigue and shortness of breath';
      }
      return `${param} is below normal range and requires medical evaluation`;
    }

    if (status === 'High') {
      if (lower.includes('glucose') || lower.includes('sugar')) {
        return 'High blood glucose may indicate diabetes or prediabetes. Dietary modifications and regular monitoring recommended';
      }
      if (lower.includes('cholesterol')) {
        return 'High cholesterol increases cardiovascular disease risk. Lifestyle changes and possible medication may be needed';
      }
      if (lower.includes('wbc') || lower.includes('white')) {
        return 'Elevated white blood cells may indicate infection, inflammation, or stress';
      }
      if (lower.includes('uric')) {
        return 'High uric acid may lead to gout or kidney stones. Reduce purine-rich foods and stay hydrated';
      }
      return `${param} is above normal range and requires medical attention`;
    }

    if (status === 'Critical') {
      return `⚠️ ${param} is at a critical level. Immediate medical consultation is essential`;
    }

    return `${param} level requires medical review for proper interpretation`;
  }

  cleanJSON(text) {
    let json = text.trim();
    json = json.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    const firstBrace = json.indexOf('{');
    const lastBrace = json.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1) {
      json = json.substring(firstBrace, lastBrace + 1);
    }
    
    return json;
  }

  safeJSONParse(jsonStr, fallback) {
    try {
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error('❌ JSON Parse Error:', error.message);
      return fallback;
    }
  }
}

module.exports = new VisionService();