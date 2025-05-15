const express = require('express');
const PDFDocument = require('pdfkit');
const cors = require('cors');
require('dotenv').config();
const { apiKeyAuth } = require('./middleware/auth');

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(cors());

// PDF Generation endpoint - protected with API key auth
app.post('/generate-pdf', apiKeyAuth, (req, res) => {
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

// Health check endpoint - public
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Root endpoint with usage information - public
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
X-API-Key: your-api-key

{
    "content": "Your text content here"
}
        </pre>
        
        <h3>Health Check</h3>
        <pre>GET /health</pre>
        
        <p>For more information, see the <a href="https://github.com/Jimmyh-world/pdf-microservice">GitHub repository</a>.</p>
      </body>
    </html>
  `);
});

module.exports = app;
