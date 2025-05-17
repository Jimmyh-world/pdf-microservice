/**
 * PDF Rendering Debug Utilities
 *
 * This module provides debugging tools for PDF rendering issues related to
 * margins, page breaks, and text positioning.
 *
 * @module utils/pdf/debug
 */

/**
 * Wraps PDFKit's addPage method to log debugging information
 * @param {PDFDocument} doc - The PDFKit document instance to monitor
 */
function monitorPageBreaks(doc) {
  if (!doc._originalAddPage) {
    doc._originalAddPage = doc.addPage;
    doc.addPage = function () {
      console.log(`[DEBUG] Explicit addPage() called at Y position: ${doc.y}`);
      return doc._originalAddPage.apply(this, arguments);
    };

    doc.on('pageAdded', () => {
      console.log(`[DEBUG] Auto pageAdded event at Y position: ${doc.y}`);
    });
  }
}

/**
 * Adds a visual representation of margins to the PDF page
 * Useful for debugging positioning issues
 *
 * @param {PDFDocument} doc - The PDFKit document instance
 * @param {Object} options - Optional settings
 * @param {boolean} options.fillBackground - Whether to fill the content area with a light color
 * @param {string} options.borderColor - Color for margin lines
 */
function visualizeMargins(doc, options = {}) {
  const fillBackground = options.fillBackground || false;
  const borderColor = options.borderColor || '#cccccc';

  const x = doc.page.margins.left;
  const y = doc.page.margins.top;
  const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const height =
    doc.page.height - doc.page.margins.top - doc.page.margins.bottom;

  // Save current graphics state
  doc.save();

  // Draw content area background if requested
  if (fillBackground) {
    doc.rect(x, y, width, height).fill('#f9f9f9');
  }

  // Draw margin boundaries
  doc
    .strokeColor(borderColor)
    .lineWidth(0.5)
    .rect(x, y, width, height)
    .stroke();

  // Draw y-coordinate guidelines every 100 points
  doc.strokeColor('#aaaaaa').lineWidth(0.2);
  for (
    let yLine = y + 100;
    yLine < doc.page.height - doc.page.margins.bottom;
    yLine += 100
  ) {
    doc
      .moveTo(x, yLine)
      .lineTo(x + width, yLine)
      .stroke();

    // Add y-position label
    doc
      .fontSize(8)
      .fillColor('#999999')
      .text(`y: ${yLine}`, x + 5, yLine - 10, { width: 50 });
  }

  // Restore graphics state
  doc.restore();

  // Log margin information
  console.log('[DEBUG] Page dimensions:', {
    width: doc.page.width,
    height: doc.page.height,
    margins: doc.page.margins,
    contentArea: {
      x,
      y,
      width,
      height,
      bottom: y + height,
      right: x + width,
    },
  });
}

/**
 * Safely adds a page only if we're close to the bottom margin
 * Prevents unnecessary blank pages
 *
 * @param {PDFDocument} doc - The PDFKit document instance
 * @param {number} safetyMargin - Minimum space needed before forcing a page break (default: 50)
 * @returns {boolean} - Whether a page was added
 */
function safeAddPage(doc, safetyMargin = 50) {
  const bottomMarginPos = doc.page.height - doc.page.margins.bottom;

  if (doc.y > bottomMarginPos - safetyMargin) {
    console.log(
      `[DEBUG] Safe addPage triggered at Y=${doc.y}, approaching bottom=${bottomMarginPos}`
    );
    doc.addPage();
    return true;
  }

  return false;
}

/**
 * Logs current document position information
 * Useful for tracking where we are in the rendering process
 *
 * @param {PDFDocument} doc - The PDFKit document instance
 * @param {string} label - A label to identify this position in logs
 */
function logPosition(doc, label = '') {
  const bottomMarginPos = doc.page.height - doc.page.margins.bottom;
  const spaceRemaining = bottomMarginPos - doc.y;

  console.log(
    `[DEBUG] ${label} Position - Y: ${doc.y}, Space remaining: ${spaceRemaining}px`
  );
}

module.exports = {
  monitorPageBreaks,
  visualizeMargins,
  safeAddPage,
  logPosition,
};
