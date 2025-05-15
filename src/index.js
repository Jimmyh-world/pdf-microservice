const express = require('express');
const PDFDocument = require('pdfkit');
const cors = require('cors');

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(cors());

// PDF Generation endpoint
app.post('/generate-pdf', (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // Create PDF document
    const doc = new PDFDocument();

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=generated.pdf');

    // Pipe PDF to response
    doc.pipe(res);

    // Add content to PDF
    doc.fontSize(12).text(content);

    // Finalize PDF
    doc.end();
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Root endpoint with usage information
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>PDF Service</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; max-width: 800px; margin: 0 auto; }
          pre { background: #f4f4f4; padding: 10px; border-radius: 5px; }
          h1 { color: #333; }
        </style>
      </head>
      <body>
        <h1>PDF Generation Service</h1>
        <p>This service converts text content to PDF format.</p>
        
        <h2>API Endpoints</h2>
        <h3>Generate PDF</h3>
        <pre>
POST /generate-pdf
Content-Type: application/json

{
    "content": "Your text content here"
}
        </pre>
        
        <h3>Health Check</h3>
        <pre>GET /health</pre>
        
        <p>For more information, see the <a href="https://github.com/yourusername/pdf-service">GitHub repository</a>.</p>
      </body>
    </html>
  `);
});

module.exports = app;
