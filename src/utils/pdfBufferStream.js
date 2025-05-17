/**
 * Buffer stream utilities for PDF generation
 *
 * This module provides functionality to create buffer streams for PDF generation,
 * allowing for in-memory PDF manipulation without writing to disk.
 *
 * @module utils/pdfBufferStream
 */

const stream = require('stream');

/**
 * Creates a buffer stream for capturing PDF output
 * @returns {Object} Object with stream and promise to get buffer
 */
function createBufferStream() {
  const bufferChunks = [];
  const bufferStream = new stream.Writable({
    write(chunk, encoding, callback) {
      bufferChunks.push(chunk);
      callback();
    },
  });

  const bufferPromise = new Promise((resolve, reject) => {
    bufferStream.on('finish', () => {
      const finalBuffer = Buffer.concat(bufferChunks);
      resolve(finalBuffer);
    });
    bufferStream.on('error', reject);
  });

  return {
    stream: bufferStream,
    bufferPromise,
  };
}

/**
 * Get PDF as buffer (for API use)
 *
 * @param {string} markdown - The markdown content to render
 * @param {Object} metadata - The document metadata
 * @param {Object} options - PDFKit document options
 * @returns {Promise<Buffer>} Promise resolving to PDF buffer
 */
async function getPdfBuffer(markdown, metadata = {}, options = {}) {
  const PDFDocument = require('pdfkit');
  const { renderMarkdownToPdf, createCoverPage } = require('./pdfRenderer');
  const { extractMetadata } = require('./metadataParser');

  // Process metadata if provided as markdown frontmatter
  let cleanContent = markdown;
  let metadataObj = metadata;

  if (typeof markdown === 'string' && !Object.keys(metadata).length) {
    const extracted = extractMetadata(markdown);
    cleanContent = extracted.cleanContent;
    metadataObj = extracted.metadata;
  }

  // Create PDF document
  const doc = new PDFDocument({
    autoFirstPage: false,
    margins: { top: 72, bottom: 72, left: 72, right: 72 },
    ...options,
  });

  // Create buffer stream
  const { stream: bufferStream, bufferPromise } = createBufferStream();
  doc.pipe(bufferStream);

  // Create cover page if metadata exists
  doc.addPage();
  if (metadataObj.title || metadataObj.author) {
    createCoverPage(metadataObj, doc);
  }

  // Render markdown to PDF
  renderMarkdownToPdf(cleanContent, doc);

  // Finalize the PDF
  doc.end();

  // Return the buffer
  return bufferPromise;
}

module.exports = {
  createBufferStream,
  getPdfBuffer,
};
