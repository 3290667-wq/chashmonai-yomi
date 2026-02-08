const { mdToPdf } = require('md-to-pdf');
const path = require('path');

async function generatePdf() {
  try {
    const pdf = await mdToPdf(
      { path: path.join(__dirname, 'DOCUMENTATION.md') },
      {
        dest: path.join(__dirname, 'chashmonai-yomi-guide.pdf'),
        pdf_options: {
          format: 'A4',
          margin: {
            top: '25mm',
            bottom: '25mm',
            left: '20mm',
            right: '20mm'
          },
          printBackground: true
        },
        stylesheet: path.join(__dirname, 'pdf-style.css'),
        launch_options: {
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        }
      }
    );

    if (pdf) {
      console.log('PDF created successfully!');
      console.log('File saved at:', path.join(__dirname, 'chashmonai-yomi-guide.pdf'));
    }
  } catch (error) {
    console.error('Error creating PDF:', error);
  }
}

generatePdf();
