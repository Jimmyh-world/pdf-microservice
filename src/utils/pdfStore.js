/**
 * PDF Store Utility
 *
 * Simple in-memory store for PDF documents with TTL for testing and preview purposes.
 * This is NOT intended for production use with large files or high traffic.
 */

// In-memory store with TTL
const pdfStore = new Map();
const DEFAULT_TTL = 1000 * 60 * 30; // 30 minutes

/**
 * Stores a PDF buffer in memory with an ID and TTL
 * @param {Buffer} pdfBuffer - The PDF content as a buffer
 * @param {Object} metadata - Optional metadata about the PDF
 * @returns {string} The ID of the stored PDF
 */
function storePdf(pdfBuffer, metadata = {}) {
  // Generate a simple ID based on timestamp and random string
  const id = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;

  // Store the PDF with metadata and expiration time
  pdfStore.set(id, {
    pdf: pdfBuffer,
    metadata,
    created: Date.now(),
    expires: Date.now() + DEFAULT_TTL,
  });

  // Clean up expired PDFs
  cleanupExpiredPdfs();

  return id;
}

/**
 * Retrieves a PDF buffer by ID
 * @param {string} id - The ID of the stored PDF, or 'all' to get all PDFs
 * @returns {Object|null|Map} The PDF data, null if not found, or the Map if 'all'
 */
function getPdf(id) {
  // Special case: return all PDFs for the dashboard
  if (id === 'all') {
    // Clean up expired PDFs first
    cleanupExpiredPdfs();
    // Return the entire store
    return pdfStore;
  }

  // Check if the PDF exists and is not expired
  if (!pdfStore.has(id)) {
    return null;
  }

  const pdfData = pdfStore.get(id);

  // Check if the PDF has expired
  if (pdfData.expires < Date.now()) {
    pdfStore.delete(id);
    return null;
  }

  return pdfData;
}

/**
 * Removes expired PDFs from the store
 */
function cleanupExpiredPdfs() {
  const now = Date.now();

  for (const [id, data] of pdfStore.entries()) {
    if (data.expires < now) {
      pdfStore.delete(id);
    }
  }
}

/**
 * Gets the total number of PDFs in the store
 * @returns {number} Count of stored PDFs
 */
function getStoreSize() {
  cleanupExpiredPdfs(); // Clean up expired PDFs first
  return pdfStore.size;
}

module.exports = {
  storePdf,
  getPdf,
  getStoreSize,
};
