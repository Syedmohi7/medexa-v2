const PDFDocument = require('pdfkit');

class PDFService {
  generateHealthReport(user, symptoms, res) {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 0 
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=MEDEXA_Premium_Report.pdf`
    );

    doc.pipe(res);

    /* ===== BRAND COLORS (Matching Medexa Web) ===== */
    const MEDEXA_BLUE = '#2563eb';    
    const MEDEXA_TEAL = '#10b981';    
    const TEXT_MAIN = '#0f172a';     
    const TEXT_SUB = '#64748b';      
    const CARD_BG = '#f8fafc';       

    /* ===== TOP GRADIENT HEADER ===== */
    doc.rect(0, 0, doc.page.width, 140).fill(MEDEXA_BLUE);
    doc.path('M 400 0 L 600 0 L 600 140 L 480 140 Z').fill(MEDEXA_TEAL);

    // LOGO
    doc.circle(75, 70, 25).fill('#ffffff');
    doc.fontSize(22).fillColor(MEDEXA_BLUE).font('Helvetica-Bold').text('M', 65, 62);
    
    doc.fontSize(30).fillColor('#ffffff').font('Helvetica-Bold')
      .text('MEDEXA', 110, 52);
    doc.fontSize(10).fillColor('#e0e7ff').font('Helvetica')
      .text('INTELLIGENT HEALTH SYSTEMS', 110, 85, { characterSpacing: 1 });

    let y = 170;

    /* ===== TITLE ===== */
    doc.fontSize(22).fillColor(TEXT_MAIN).font('Helvetica-Bold')
      .text('Medical Analysis Report', 45, y);
    doc.fontSize(10).fillColor(TEXT_SUB).font('Helvetica')
      .text(`ISSUED: ${new Date().toLocaleDateString()} | ${new Date().toLocaleTimeString()}`, 45, y + 25);

    y += 65;

    /* ===== PATIENT INFO CARD ===== */
    doc.roundedRect(45, y, 505, 110, 15).fill(CARD_BG);
    doc.roundedRect(45, y, 505, 110, 15).lineWidth(1).strokeColor('#e2e8f0').stroke();

    doc.fontSize(11).fillColor(MEDEXA_BLUE).font('Helvetica-Bold')
      .text('VITAL BIOMETRICS', 65, y + 20);

    doc.fontSize(10).fillColor(TEXT_MAIN).font('Helvetica-Bold');
    doc.text(`Patient: ${user.name}`, 65, y + 45);
    doc.text(`Age: ${user.healthProfile?.age || 'N/A'}`, 65, y + 65);
    doc.text(`Gender: ${user.healthProfile?.gender || 'N/A'}`, 65, y + 85);

    doc.text(`Height: ${user.healthProfile?.height || 'N/A'} cm`, 220, y + 45);
    doc.text(`Weight: ${user.healthProfile?.weight || 'N/A'} kg`, 220, y + 65);
    doc.text(`Blood: ${user.healthProfile?.bloodGroup || 'N/A'}`, 220, y + 85);

    // BMI Gauge
    doc.circle(470, y + 55, 35).lineWidth(3).strokeColor(MEDEXA_TEAL).stroke();
    doc.fontSize(16).fillColor(MEDEXA_TEAL).font('Helvetica-Bold')
      .text(`${user.healthProfile?.bmi || 'N/A'}`, 435, y + 48, { width: 70, align: 'center' });
    doc.fontSize(8).fillColor(TEXT_SUB).font('Helvetica-Bold')
      .text('BMI SCORE', 435, y + 65, { width: 70, align: 'center' });

    y += 140;

    /* ===== RISK ANALYSIS ===== */
    if (symptoms?.length) {
      const s = symptoms[0];
      const risk = s.riskLevel.toLowerCase();
      const riskColor = risk === 'high' ? '#ef4444' : risk === 'medium' ? '#f59e0b' : MEDEXA_TEAL;

      doc.fontSize(14).fillColor(TEXT_MAIN).font('Helvetica-Bold')
        .text('CLINICAL RISK ASSESSMENT', 45, y);
      
      y += 25;

      doc.roundedRect(45, y, 505, 40, 10).fill('#f1f5f9');
      doc.fontSize(10).fillColor(TEXT_SUB).font('Helvetica-Bold').text('STATUS:', 65, y + 15);
      
      doc.roundedRect(120, y + 8, 120, 24, 12).fill(riskColor);
      doc.fontSize(9).fillColor('#ffffff').font('Helvetica-Bold')
        .text(risk.toUpperCase() + ' RISK', 120, y + 16, { width: 120, align: 'center' });

      y += 60;

      doc.fontSize(10).fillColor(TEXT_SUB).font('Helvetica-Bold').text('Reported Symptoms:', 45, y);
      y += 18;
      // Replaced bullet emoji with a standard dash/dot supported by PDFKit
      doc.fontSize(12).fillColor(TEXT_MAIN).font('Helvetica-Bold')
        .text(s.symptoms.join('  |  '), 45, y, { width: 500 });

      y += 50;

      /* ===== RECOMMENDATIONS ===== */
      if (s.recommendations?.length) {
        doc.fontSize(14).fillColor(TEXT_MAIN).font('Helvetica-Bold')
          .text('AI RECOMMENDATIONS', 45, y);

        y += 30;

        s.recommendations.forEach((rec, i) => {
          const h = doc.heightOfString(rec, { width: 450 });
          doc.roundedRect(45, y, 505, h + 20, 10).fill('#ffffff').strokeColor('#e2e8f0').lineWidth(0.5).stroke();
          
          // Vector Checkmark (No Emojis used)
          doc.circle(65, y + 15, 6).fill(MEDEXA_TEAL);
          doc.moveTo(62, y + 15).lineTo(64, y + 17).lineTo(68, y + 13).strokeColor('#fff').lineWidth(1.5).stroke();

          doc.fontSize(10).fillColor(TEXT_MAIN).font('Helvetica')
            .text(rec, 85, y + 10, { width: 440 });
          
          y += h + 30;
        });
      }
    }

    /* ===== FOOTER ===== */
    y = 740;
    doc.rect(0, y, doc.page.width, 102).fill(TEXT_MAIN);
    doc.fontSize(10).fillColor('#ffffff').font('Helvetica-Bold')
      .text('CLINICAL DISCLAIMER', 45, y + 20);
    doc.fontSize(8).fillColor('#94a3b8').font('Helvetica')
      .text('This report is generated for educational purposes only and does not constitute medical advice.', 45, y + 38, { width: 505 });
    doc.fontSize(9).fillColor('#ffffff').font('Helvetica-Bold')
      .text('WWW.MEDEXA-ASSISTANT.COM', 0, y + 75, { align: 'center', width: doc.page.width });

    doc.end();
  }
}

module.exports = new PDFService();