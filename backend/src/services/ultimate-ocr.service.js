const axios = require('axios');
const FormData = require('form-data');
const Tesseract = require('tesseract.js');
const imageProcessor = require('./image-processor.service');

class UltimateOCRService {
  constructor() {
    this.ocrSpaceKey = process.env.OCR_API_KEY;
    this.googleVisionKey = process.env.GOOGLE_VISION_API_KEY;
  }

  async extractText(fileData) {
    try {
      console.log('🚀 ULTIMATE OCR - GOOGLE VISION PRIMARY ENGINE');

      const fileInfo = this.analyzeFile(fileData);
      console.log(`📋 Type: ${fileInfo.type}, Size: ${fileInfo.sizeMB}MB`);

      let imagesToProcess = [];

      if (fileInfo.type === 'pdf') {
        imagesToProcess = await imageProcessor.pdfToImages(fileData);
      } else {
        imagesToProcess = await imageProcessor.superEnhance(fileData);
      }

      console.log(`📸 Created ${imagesToProcess.length} enhanced versions`);

      const allResults = [];

      // PRIORITY: Google Vision on ALL enhanced versions
      for (let i = 0; i < Math.min(imagesToProcess.length, 4); i++) {
        const version = imagesToProcess[i];
        console.log(`\n🔍 Processing: ${version.name}`);

        // ⭐ ENGINE 1: GOOGLE CLOUD VISION (HIGHEST PRIORITY)
        if (this.googleVisionKey) {
          try {
            console.log('  🌟 Trying Google Cloud Vision...');
            const result = await this.runGoogleVision(version.base64);
            if (result.text && result.text.length > 10) {
              const score = this.scoreText(result.text);
              allResults.push({
                engine: 'GoogleVision',
                version: version.name,
                text: result.text,
                score: score + 20 // High bonus for Google
              });
              console.log(`  ✅ Google Vision: ${result.text.length} chars, Score: ${score + 20}/100`);

              // If Google Vision gives great results, stop immediately
              if (score > 65) {
                console.log('  🎯 Google Vision SUCCESS! Stopping.');
                break;
              }
            }
          } catch (e) {
            console.log(`  ❌ Google Vision error: ${e.message}`);
          }
        }

        // ENGINE 2: OCR.space (backup)
        if (this.ocrSpaceKey && i < 3) {
          try {
            console.log('  📄 Trying OCR.space...');
            const result = await this.runOCRSpace(version.base64);
            if (result.text && result.text.length > 10) {
              const score = this.scoreText(result.text);
              allResults.push({
                engine: 'OCR.space',
                version: version.name,
                text: result.text,
                score: score
              });
              console.log(`  ✅ OCR.space: ${result.text.length} chars, Score: ${score}/100`);
            }
          } catch (e) {
            console.log(`  ❌ OCR.space failed`);
          }
        }

        // ENGINE 3: Tesseract (last resort)
        if (i < 2 && allResults.length === 0) {
          try {
            console.log('  📝 Trying Tesseract...');
            const result = await this.runTesseract(version.base64);
            if (result.text && result.text.length > 10) {
              const score = this.scoreText(result.text);
              allResults.push({
                engine: 'Tesseract',
                version: version.name,
                text: result.text,
                score: score
              });
              console.log(`  ✅ Tesseract: ${result.text.length} chars, Score: ${score}/100`);
            }
          } catch (e) {
            console.log(`  ❌ Tesseract failed`);
          }
        }

        // Stop if we have excellent results
        if (allResults.some(r => r.score > 85)) {
          console.log('🎯 Found excellent result! Stopping.');
          break;
        }
      }

      if (allResults.length === 0) {
        return {
          success: false,
          text: '',
          message: 'Could not extract text. Please:\n• Use better lighting\n• Keep text in focus\n• Avoid shadows and glare\n• Retake photo'
        };
      }

      // Sort by score and pick BEST
      allResults.sort((a, b) => b.score - a.score);
      const best = allResults[0];

      console.log(`\n🏆 WINNER: ${best.engine} (${best.version})`);
      console.log(`📊 Final Score: ${best.score}/100`);
      console.log(`📝 Text Length: ${best.text.length} characters`);

      return {
        success: true,
        text: best.text,
        engine: best.engine,
        version: best.version,
        score: best.score
      };

    } catch (error) {
      console.error('❌ Ultimate OCR Error:', error.message);
      throw error;
    }
  }

  /**
   * Google Cloud Vision API - WORLD'S BEST HANDWRITING OCR
   */
  async runGoogleVision(base64Image) {
    if (!this.googleVisionKey) {
      throw new Error('Google Vision API key not configured');
    }

    const base64Clean = base64Image.includes('base64,')
      ? base64Image.split('base64,')[1]
      : base64Image;

    const response = await axios.post(
      `https://vision.googleapis.com/v1/images:annotate?key=${this.googleVisionKey}`,
      {
        requests: [{
          image: {
            content: base64Clean
          },
          features: [
            { 
              type: 'DOCUMENT_TEXT_DETECTION',
              maxResults: 1
            },
            {
              type: 'TEXT_DETECTION',
              maxResults: 1
            }
          ],
          imageContext: {
            languageHints: ['en', 'en-US']
          }
        }]
      },
      {
        timeout: 35000,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const data = response.data.responses?.[0];

    if (!data) {
      throw new Error('Empty response from Google Vision');
    }

    // Check for errors
    if (data.error) {
      throw new Error(`Google Vision Error: ${data.error.message}`);
    }

    // Try DOCUMENT_TEXT_DETECTION first (best for structured text)
    const fullText = data.fullTextAnnotation?.text;
    if (fullText && fullText.trim().length > 10) {
      console.log('    ✓ Using DOCUMENT_TEXT_DETECTION result');
      return { text: fullText.trim() };
    }

    // Fallback to TEXT_DETECTION
    const textAnnotations = data.textAnnotations;
    if (textAnnotations && textAnnotations.length > 0) {
      console.log('    ✓ Using TEXT_DETECTION result');
      return { text: textAnnotations[0].description.trim() };
    }

    throw new Error('No text detected in image');
  }

  /**
   * OCR.space API
   */
  async runOCRSpace(base64Image) {
    const base64Clean = base64Image.includes('base64,')
      ? base64Image.split('base64,')[1]
      : base64Image;

    const formData = new FormData();
    formData.append('base64Image', `data:image/jpeg;base64,${base64Clean}`);
    formData.append('apikey', this.ocrSpaceKey);
    formData.append('language', 'eng');
    formData.append('OCREngine', '2');
    formData.append('scale', 'true');
    formData.append('isTable', 'true');

    const response = await axios.post('https://api.ocr.space/parse/image', formData, {
      headers: formData.getHeaders(),
      timeout: 30000,
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    if (response.data?.OCRExitCode === 1) {
      const text = response.data.ParsedResults?.[0]?.ParsedText || '';
      return { text: text.trim() };
    }

    throw new Error('OCR.space failed');
  }

  /**
   * Tesseract.js
   */
  async runTesseract(base64Image) {
    const result = await Tesseract.recognize(base64Image, 'eng', {
      logger: () => {}
    });
    return { text: result.data.text.trim() };
  }

  /**
   * Advanced text scoring algorithm
   */
  scoreText(text) {
    if (!text || text.length < 10) return 0;

    let score = 0;

    // 1. Length score (0-30 points)
    score += Math.min(text.length / 15, 30);

    // 2. Medical terminology (0-30 points)
    const medicalTerms = [
      'mg', 'ml', 'tablet', 'cap', 'capsule', 'syrup', 'ointment', 'cream', 'lotion',
      'times', 'daily', 'day', 'week', 'month', 'food', 'morning', 'night', 'evening',
      'doctor', 'dr', 'patient', 'prescription', 'diagnosis',
      'glucose', 'hemoglobin', 'cholesterol', 'test', 'result', 'normal', 'range',
      'high', 'low', 'critical', 'blood', 'count', 'level'
    ];
    const foundTerms = medicalTerms.filter(term => 
      text.toLowerCase().includes(term)
    );
    score += Math.min(foundTerms.length * 3, 30);

    // 3. Numbers presence (0-15 points) - important for dosages and values
    const numbers = text.match(/\d+/g);
    if (numbers) {
      score += Math.min(numbers.length * 1.5, 15);
    }

    // 4. Readability ratio (0-15 points)
    const readable = text.match(/[a-zA-Z0-9\s.,:\-\/()]/g)?.length || 0;
    const ratio = readable / text.length;
    score += ratio * 15;

    // 5. Structure score (0-10 points) - proper line breaks
    const lines = text.split('\n').filter(l => l.trim().length > 2);
    score += Math.min(lines.length * 0.8, 10);

    return Math.min(Math.round(score), 100);
  }

  analyzeFile(fileData) {
    let type = 'unknown';
    let sizeMB = (fileData.length * 0.75) / 1024 / 1024;

    if (fileData.includes('application/pdf')) type = 'pdf';
    else if (fileData.includes('image/')) type = 'image';

    if (sizeMB > 15) throw new Error('File too large (max 15MB)');

    return { type, sizeMB: sizeMB.toFixed(2) };
  }

  validateFile(fileData) {
    const info = this.analyzeFile(fileData);
    if (info.type === 'unknown') {
      throw new Error('Invalid file type. Please upload JPG, PNG, or PDF');
    }
    return true;
  }
}

module.exports = new UltimateOCRService();