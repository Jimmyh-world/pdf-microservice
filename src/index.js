const express = require('express');
const PDFDocument = require('pdfkit');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const { apiKeyAuth } = require('./middleware/auth');
const {
  renderMarkdownToPdf,
  createCoverPage,
  DEFAULT_THEME,
} = require('./utils/pdfRenderer');
const { extractMetadata } = require('./utils/metadataParser');
const { storePdf, getPdf, getStoreSize } = require('./utils/pdfStore');
const { createBufferStream, getPdfBuffer } = require('./utils/pdfBufferStream');
const {
  getPdfViewerHtml,
  getErrorHtml,
  getDashboardHtml,
} = require('./views/pdfViewer');

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Helper function to generate PDF - used by both endpoints
async function generatePdf(content, filename, options = {}) {
  if (!content) {
    throw new Error('Content is required');
  }

  // Parse metadata from content
  const { metadata, cleanContent } = extractMetadata(content);

  // Extract theme options if provided in options
  const themeOptions = options.theme || {};

  // Determine filename from metadata or request
  const outputFilename =
    filename ||
    metadata.filename ||
    `${metadata.title || 'generated'}.pdf`.toLowerCase().replace(/\s+/g, '-');

  // Create PDF document with options and improved spacing settings
  const doc = new PDFDocument({
    margins: {
      top: themeOptions.margins?.top || DEFAULT_THEME.margins.top,
      bottom: themeOptions.margins?.bottom || DEFAULT_THEME.margins.bottom,
      left: themeOptions.margins?.left || DEFAULT_THEME.margins.left,
      right: themeOptions.margins?.right || DEFAULT_THEME.margins.right,
    },
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
  doc.lineGap(themeOptions.spacing?.lineGap || DEFAULT_THEME.spacing.lineGap);

  // Create cover page if metadata exists
  if (metadata.title || metadata.author) {
    createCoverPage(metadata, doc, themeOptions);
  }

  // Add content to PDF with markdown rendering
  renderMarkdownToPdf(cleanContent, doc, themeOptions);

  return {
    doc,
    metadata,
    outputFilename,
  };
}

// PDF Generation endpoint - protected with API key auth
app.post('/generate-pdf', apiKeyAuth, async (req, res) => {
  try {
    const { content, filename, options } = req.body;

    const { doc, outputFilename } = await generatePdf(
      content,
      filename,
      options
    );

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${outputFilename}`
    );

    // Pipe PDF to response
    doc.pipe(res);

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

// Buffer endpoint - return PDF as buffer, protected with API key auth
app.post('/generate-pdf-buffer', apiKeyAuth, async (req, res) => {
  try {
    const { content, options } = req.body;

    if (!content) {
      return res.status(400).json({
        error: 'Content is required',
        stage: 'validation',
      });
    }

    // Use the new buffer utility
    const pdfBuffer = await getPdfBuffer(content, {}, options);

    // Return buffer as base64
    res.json({
      success: true,
      pdf: pdfBuffer.toString('base64'),
    });
  } catch (error) {
    console.error('PDF buffer generation error:', error);
    res.status(500).json({
      error: 'Failed to generate PDF buffer',
      details: error.message,
      stage: 'pdf_buffer_generation',
    });
  }
});

// === PREVIEW FUNCTIONALITY === //

// Dashboard route (for testing)
app.get('/dashboard', (req, res) => {
  // Get all PDFs from store
  const pdfs = [];

  // The store is a map, so we need to convert it to an array
  for (const [id, data] of getPdf('all') || []) {
    if (data.expires > Date.now()) {
      pdfs.push({
        id,
        ...data,
      });
    }
  }

  // Send dashboard HTML
  res.send(getDashboardHtml(pdfs));
});

// PDF Preview endpoint - no auth for testing
app.post('/api/preview-pdf', async (req, res) => {
  try {
    const { content, filename, options } = req.body;

    // Generate PDF using the helper function
    const { doc, metadata } = await generatePdf(content, filename, options);

    // Create a buffer stream to capture the PDF output
    const { stream, bufferPromise } = createBufferStream();
    doc.pipe(stream);
    doc.end();

    // Wait for the PDF to be generated
    const pdfBuffer = await bufferPromise;

    // Store the PDF buffer with metadata
    const pdfId = storePdf(pdfBuffer, metadata);

    // Redirect to the preview URL
    res.redirect(`/preview/${pdfId}`);
  } catch (error) {
    console.error('PDF preview generation error:', error);
    res
      .status(500)
      .send(getErrorHtml(`Failed to generate PDF preview: ${error.message}`));
  }
});

// Preview page to view the PDF
app.get('/preview/:id', (req, res) => {
  const pdfId = req.params.id;
  const pdfData = getPdf(pdfId);

  if (!pdfData) {
    return res.status(404).send(getErrorHtml('PDF not found or has expired'));
  }

  res.send(getPdfViewerHtml(pdfId, pdfData.metadata));
});

// API endpoint to view the PDF directly
app.get('/api/view-pdf/:id', (req, res) => {
  const pdfId = req.params.id;
  const pdfData = getPdf(pdfId);

  if (!pdfData) {
    return res.status(404).send('PDF not found or has expired');
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.send(pdfData.pdf);
});

// API endpoint to download the PDF
app.get('/api/download-pdf/:id', (req, res) => {
  const pdfId = req.params.id;
  const pdfData = getPdf(pdfId);

  if (!pdfData) {
    return res.status(404).send('PDF not found or has expired');
  }

  const filename =
    pdfData.metadata.filename ||
    `${pdfData.metadata.title || 'generated'}.pdf`
      .toLowerCase()
      .replace(/\s+/g, '-');

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
  res.send(pdfData.pdf);
});

// === END PREVIEW FUNCTIONALITY === //

// Health check endpoint - public
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    storedPdfs: getStoreSize(), // Return count of PDFs in preview store
  });
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
          .preview-link { margin-top: 20px; padding: 10px; background: #e0f0ff; border-radius: 5px; }
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
        
        <div class="preview-link">
          <h3>PDF Preview Dashboard (Development Only)</h3>
          <p>For testing and refinement, visit the <a href="/dashboard">PDF Preview Dashboard</a>.</p>
        </div>
        
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
