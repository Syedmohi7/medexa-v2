const sharp = require('sharp');
const Jimp = require('jimp');

class ImageProcessorService {
  async superEnhance(base64Image) {
    try {
      console.log('🔥 SUPER ENHANCEMENT...');

      const base64Clean = base64Image.includes('base64,')
        ? base64Image.split('base64,')[1]
        : base64Image;
      
      const imageBuffer = Buffer.from(base64Clean, 'base64');
      const versions = [];

      // VERSION 1: ULTRA CONTRAST
      try {
        const v1 = await sharp(imageBuffer)
          .resize(3500, 3500, { fit: 'inside', withoutEnlargement: false })
          .greyscale()
          .normalize()
          .linear(2.5, -(128 * 1.0))
          .sharpen({ sigma: 3, m1: 2, m2: 1.5 })
          .threshold(110)
          .median(1)
          .jpeg({ quality: 100 })
          .toBuffer();
        
        versions.push({
          name: 'UltraContrast',
          base64: `data:image/jpeg;base64,${v1.toString('base64')}`
        });
      } catch (e) {
        console.log('  ⚠️ UltraContrast failed');
      }

      // VERSION 2: HANDWRITING
      try {
        const v2 = await sharp(imageBuffer)
          .resize(3000, 3000, { fit: 'inside', withoutEnlargement: false })
          .greyscale()
          .normalize()
          .gamma(1.4)
          .sharpen({ sigma: 2, m1: 2, m2: 1 })
          .modulate({ brightness: 1.2 })
          .linear(1.5, -(128 * 0.5))
          .jpeg({ quality: 100 })
          .toBuffer();
        
        versions.push({
          name: 'Handwriting',
          base64: `data:image/jpeg;base64,${v2.toString('base64')}`
        });
      } catch (e) {
        console.log('  ⚠️ Handwriting failed');
      }

      // VERSION 3: EXTREME SHARP
      try {
        const v3 = await sharp(imageBuffer)
          .resize(3200, 3200, { fit: 'inside', withoutEnlargement: false })
          .greyscale()
          .normalize()
          .sharpen({ sigma: 4, m1: 3, m2: 2 })
          .linear(1.6, -(128 * 0.6))
          .median(1)
          .jpeg({ quality: 100 })
          .toBuffer();
        
        versions.push({
          name: 'ExtremeSharp',
          base64: `data:image/jpeg;base64,${v3.toString('base64')}`
        });
      } catch (e) {
        console.log('  ⚠️ ExtremeSharp failed');
      }

      // VERSION 4: DENOISE
      try {
        const v4 = await sharp(imageBuffer)
          .resize(2800, 2800, { fit: 'inside', withoutEnlargement: false })
          .greyscale()
          .median(3)
          .normalize()
          .sharpen({ sigma: 2, m1: 1.8, m2: 1 })
          .linear(1.4, -(128 * 0.4))
          .jpeg({ quality: 100 })
          .toBuffer();
        
        versions.push({
          name: 'Denoised',
          base64: `data:image/jpeg;base64,${v4.toString('base64')}`
        });
      } catch (e) {
        console.log('  ⚠️ Denoised failed');
      }

      // VERSION 5: BALANCED
      try {
        const v5 = await sharp(imageBuffer)
          .resize(2500, 2500, { fit: 'inside', withoutEnlargement: false })
          .greyscale()
          .normalize()
          .sharpen({ sigma: 1.5, m1: 1.3, m2: 0.8 })
          .linear(1.3, -(128 * 0.3))
          .jpeg({ quality: 95 })
          .toBuffer();
        
        versions.push({
          name: 'Balanced',
          base64: `data:image/jpeg;base64,${v5.toString('base64')}`
        });
      } catch (e) {
        console.log('  ⚠️ Balanced failed');
      }

      // VERSION 6: JIMP
      try {
        const jimpImage = await Jimp.read(imageBuffer);
        await jimpImage
          .greyscale()
          .contrast(0.5)
          .brightness(0.1)
          .normalize();
        
        const jimpBuffer = await jimpImage.getBufferAsync(Jimp.MIME_JPEG);
        versions.push({
          name: 'JimpAdvanced',
          base64: `data:image/jpeg;base64,${jimpBuffer.toString('base64')}`
        });
      } catch (e) {
        console.log('  ⚠️ JIMP failed');
      }

      // Always include original
      versions.push({
        name: 'Original',
        base64: base64Image.includes('base64,') ? base64Image : `data:image/jpeg;base64,${base64Image}`
      });

      console.log(`✅ Created ${versions.length} versions!`);
      return versions;

    } catch (error) {
      console.error('❌ Enhancement error:', error.message);
      return [{
        name: 'Original',
        base64: base64Image.includes('base64,') ? base64Image : `data:image/jpeg;base64,${base64Image}`
      }];
    }
  }

  async pdfToImages(base64Pdf) {
    try {
      console.log('📄 PDF detected...');
      const pdfBuffer = Buffer.from(
        base64Pdf.includes('base64,') ? base64Pdf.split('base64,')[1] : base64Pdf,
        'base64'
      );

      return [{
        name: 'PDF_Page',
        base64: `data:image/jpeg;base64,${pdfBuffer.toString('base64')}`
      }];

    } catch (error) {
      throw new Error('Failed to process PDF. Upload as JPG/PNG instead.');
    }
  }
}

module.exports = new ImageProcessorService();