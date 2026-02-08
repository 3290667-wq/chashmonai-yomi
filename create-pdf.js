const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function createPDF() {
  console.log('Starting PDF generation...');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Read the HTML file
  const htmlPath = path.join(__dirname, 'site-documentation.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');

  // Set content
  await page.setContent(htmlContent, {
    waitUntil: 'networkidle0'
  });

  // Generate PDF
  const pdfPath = path.join(__dirname, 'חשמונאי-יומי-מסמך-טכני.pdf');
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    margin: {
      top: '20mm',
      bottom: '20mm',
      left: '15mm',
      right: '15mm'
    },
    printBackground: true
  });

  await browser.close();

  console.log('PDF created successfully!');
  console.log('Location: ' + pdfPath);
}

createPDF().catch(console.error);
