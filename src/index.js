const express = require('express');
const PDFDocument = require('pdfkit');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const { apiKeyAuth } = require('./middleware/auth');
const { renderMarkdownToPdf, createCoverPage } = require('./utils/pdfRenderer');
const { extractMetadata } = require('./utils/metadataParser');

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(cors());

// PDF Generation endpoint - protected with API key auth
app.post('/generate-pdf', apiKeyAuth, (req, res) => {
  try {
    const { content, filename, options } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // Parse metadata from content
    const { metadata, cleanContent } = extractMetadata(content);

    // Determine filename from metadata or request
    const outputFilename =
      filename ||
      metadata.filename ||
      `${metadata.title || 'generated'}.pdf`.toLowerCase().replace(/\s+/g, '-');

    // Create PDF document with options and improved spacing settings
    const doc = new PDFDocument({
      margins: { top: 72, bottom: 72, left: 72, right: 72 }, // Standard 1-inch margins
      info: {
        Title: metadata.title || 'Generated Document',
        Author: metadata.author || '',
        Subject: metadata.subject || '',
        Keywords: Array.isArray(metadata.keywords)
          ? metadata.keywords.join(', ')
          : metadata.keywords || '',
      },
      compress: false, // Better quality for text
      ...options,
    });

    // Set global text options for better readability
    doc.lineGap(4);

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${outputFilename}`
    );

    // Pipe PDF to response
    doc.pipe(res);

    // Create cover page if metadata exists
    if (metadata.title || metadata.author) {
      createCoverPage(metadata, doc);
    }

    // Add content to PDF with markdown rendering
    renderMarkdownToPdf(cleanContent, doc);

    // Finalize PDF
    doc.end();
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({
      error: 'Failed to generate PDF',
      details: error.message,
      stage: 'pdf_generation',
    });
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
        <p>This service converts markdown content to PDF format with support for metadata and formatting.</p>
        
        <h2>API Endpoints</h2>
        <h3>Generate PDF</h3>
        <pre>
POST /generate-pdf
Content-Type: application/json
X-API-Key: your-api-key

{
    "content": "---\\ntitle: Document Title\\nauthor: Author Name\\ndate: 2024-07-29\\n---\\n# My Document\\n\\nThis is a sample document with **markdown** support.",
    "filename": "optional-custom-filename.pdf",
    "options": {
        "size": "A4",
        "layout": "portrait"
    }
}
        </pre>
        
        <h3>Health Check</h3>
        <pre>GET /health</pre>
        
        <p>For more information, see the <a href="https://github.com/Jimmyh-world/pdf-microservice">GitHub repository</a>.</p>
      </body>
    </html>
  `);
});

// If this file is run directly, start the server
if (require.main === module) {
  const port = process.env.PORT || 3000;
  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`PDF Service running on port ${port}`);
  });

  // Handle shutdown gracefully
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
    });
  });
}

module.exports = app;
