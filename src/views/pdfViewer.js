/**
 * PDF Viewer Template
 *
 * Provides HTML templates for the PDF preview interface.
 */

/**
 * Generates the main PDF viewer HTML
 * @param {string} pdfId - The ID of the PDF to view
 * @param {Object} metadata - Metadata about the PDF
 * @returns {string} HTML content
 */
function getPdfViewerHtml(pdfId, metadata = {}) {
  const title = metadata.title || 'PDF Preview';
  const timestamp = new Date(metadata.created || Date.now()).toLocaleString();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - PDF Preview</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    header {
      background: #f4f4f4;
      padding: 1rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    main {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 1rem;
    }
    .pdf-container {
      width: 100%;
      max-width: 1000px;
      height: 80vh;
      border: 1px solid #ddd;
      margin: 1rem 0;
    }
    .toolbar {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
      justify-content: center;
    }
    button {
      padding: 0.5rem 1rem;
      background: #0066cc;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
    }
    button:hover {
      background: #0055aa;
    }
    .metadata {
      background: #f9f9f9;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      margin-bottom: 1rem;
      font-size: 0.9rem;
      width: 100%;
      max-width: 1000px;
      box-sizing: border-box;
    }
    footer {
      text-align: center;
      padding: 1rem;
      background: #f4f4f4;
      font-size: 0.8rem;
    }
  </style>
</head>
<body>
  <header>
    <h1>${title}</h1>
  </header>
  
  <main>
    <div class="metadata">
      <p>Preview generated: ${timestamp}</p>
      ${Object.entries(metadata)
        .map(([key, value]) =>
          key !== 'created' ? `<p><strong>${key}:</strong> ${value}</p>` : ''
        )
        .join('')}
    </div>
    
    <div class="toolbar">
      <button onclick="window.location.href='/api/download-pdf/${pdfId}'">Download PDF</button>
      <button onclick="window.location.reload()">Refresh Preview</button>
      <button onclick="window.location.href='/dashboard'">Back to Dashboard</button>
    </div>
    
    <iframe class="pdf-container" src="/api/view-pdf/${pdfId}" frameborder="0"></iframe>
  </main>
  
  <footer>
    <p>PDF Preview System - For testing and development only</p>
  </footer>
</body>
</html>`;
}

/**
 * Generates error HTML for when a PDF is not found
 * @param {string} errorMessage - The error message to display
 * @returns {string} HTML content
 */
function getErrorHtml(errorMessage) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Error - PDF Preview</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
      padding: 0 1rem;
      background: #f8f8f8;
    }
    .error-container {
      background: white;
      border-radius: 8px;
      padding: 2rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      max-width: 600px;
      width: 100%;
      text-align: center;
    }
    h1 {
      color: #e74c3c;
      margin-top: 0;
    }
    a {
      display: inline-block;
      margin-top: 1rem;
      padding: 0.5rem 1rem;
      background: #0066cc;
      color: white;
      text-decoration: none;
      border-radius: 4px;
    }
    a:hover {
      background: #0055aa;
    }
  </style>
</head>
<body>
  <div class="error-container">
    <h1>PDF Preview Error</h1>
    <p>${
      errorMessage || 'The requested PDF could not be found or has expired.'
    }</p>
    <a href="/dashboard">Back to Dashboard</a>
  </div>
</body>
</html>`;
}

/**
 * Generates a simple dashboard HTML for listing available PDFs
 * @param {Array} pdfs - Array of PDF metadata objects
 * @returns {string} HTML content
 */
function getDashboardHtml(pdfs = []) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PDF Preview Dashboard</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
    }
    header {
      background: #f4f4f4;
      padding: 1rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    main {
      padding: 1rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    .pdf-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }
    .pdf-card {
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 1rem;
      background: white;
    }
    .pdf-card h3 {
      margin-top: 0;
      border-bottom: 1px solid #eee;
      padding-bottom: 0.5rem;
    }
    .pdf-card p {
      margin: 0.5rem 0;
      font-size: 0.9rem;
    }
    .pdf-card a {
      display: inline-block;
      margin-top: 1rem;
      padding: 0.5rem 1rem;
      background: #0066cc;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      font-size: 0.9rem;
    }
    .pdf-card a:hover {
      background: #0055aa;
    }
    .empty-state {
      text-align: center;
      padding: 2rem;
      background: #f9f9f9;
      border-radius: 4px;
    }
    .test-form {
      margin-top: 2rem;
      padding: 1rem;
      background: #f9f9f9;
      border-radius: 4px;
    }
    .test-form h2 {
      margin-top: 0;
    }
    textarea {
      width: 100%;
      height: 200px;
      padding: 0.5rem;
      font-family: monospace;
      margin-bottom: 1rem;
      box-sizing: border-box;
    }
    button {
      padding: 0.5rem 1rem;
      background: #0066cc;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
    }
    button:hover {
      background: #0055aa;
    }
    footer {
      text-align: center;
      padding: 1rem;
      background: #f4f4f4;
      font-size: 0.8rem;
      margin-top: 2rem;
    }
  </style>
</head>
<body>
  <header>
    <h1>PDF Preview Dashboard</h1>
  </header>
  
  <main>
    <p>This dashboard allows you to preview and test PDFs generated by the microservice.</p>
    
    <div class="pdf-list">
      ${
        pdfs.length > 0
          ? pdfs
              .map(
                (pdf) => `
        <div class="pdf-card">
          <h3>${pdf.metadata.title || 'Untitled PDF'}</h3>
          <p>Created: ${new Date(pdf.created).toLocaleString()}</p>
          <p>Expires: ${new Date(pdf.expires).toLocaleString()}</p>
          ${pdf.metadata.author ? `<p>Author: ${pdf.metadata.author}</p>` : ''}
          <a href="/preview/${pdf.id}">View Preview</a>
        </div>
      `
              )
              .join('')
          : `
        <div class="empty-state">
          <h3>No PDFs available</h3>
          <p>Generate a new PDF using the test form below.</p>
        </div>
      `
      }
    </div>
    
    <div class="test-form">
      <h2>Generate Test PDF</h2>
      <form action="/api/preview-pdf" method="POST">
        <textarea name="content" placeholder="Enter Markdown content here...">---
title: Test Document
author: Test User
date: ${new Date().toISOString().split('T')[0]}
---

# Test Document

This is a **bold** statement and this is *italic* text.

## Section 1

- List item 1
- List item 2
- List item 3

### Subsection

1. Numbered item 1
2. Numbered item 2

> This is a blockquote with important information.

## Section 2

This is another paragraph with some content.

---

### Code Example

\`\`\`javascript
function testFunction() {
  console.log("Hello PDF!");
}
\`\`\`
</textarea>
        <button type="submit">Generate Preview</button>
      </form>
    </div>
  </main>
  
  <footer>
    <p>PDF Preview System - For testing and development only</p>
  </footer>
</body>
</html>`;
}

module.exports = {
  getPdfViewerHtml,
  getErrorHtml,
  getDashboardHtml,
};
