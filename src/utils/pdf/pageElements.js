/**
 * PDF Page Elements
 *
 * This module handles the creation of special page elements like
 * cover pages, headers, and footers for PDF documents.
 *
 * @module utils/pdf/pageElements
 */

const { DEFAULT_THEME } = require('./theme');
const { logPosition } = require('./debug');

/**
 * Creates a cover page for the PDF
 * Generates a professional cover page with title, author, and date based on
 * the provided metadata.
 *
 * @param {Object} metadata - The document metadata
 * @param {string} [metadata.title] - The document title to display
 * @param {string} [metadata.author] - The author's name
 * @param {string} [metadata.date] - The document date (defaults to current date if not provided)
 * @param {PDFDocument} doc - The PDFKit document instance
 * @param {Object} theme - Optional theme settings to override defaults
 */
function createCoverPage(metadata, doc, theme = {}) {
  // Merge theme with defaults
  const mergedTheme = {
    ...DEFAULT_THEME,
    fonts: { ...DEFAULT_THEME.fonts, ...theme.fonts },
    fontSize: { ...DEFAULT_THEME.fontSize, ...theme.fontSize },
    colors: { ...DEFAULT_THEME.colors, ...theme.colors },
    margins: { ...DEFAULT_THEME.margins, ...theme.margins },
    spacing: { ...DEFAULT_THEME.spacing, ...theme.spacing },
  };

  // Set default values if metadata is missing
  const title = metadata?.title || 'Generated Document';
  const author = metadata?.author || '';

  // Parse the date properly, ensuring it's a Date object
  let docDate;
  try {
    docDate = metadata?.date ? new Date(metadata.date) : new Date();
    // Check if the date is valid
    if (isNaN(docDate.getTime())) {
      docDate = new Date(); // Fallback to current date if invalid
    }
  } catch (e) {
    docDate = new Date(); // Fallback to current date on parsing error
  }

  const dateFormatted = docDate.toLocaleDateString();

  // Update PDF document metadata with proper date format
  doc.info = {
    Title: title,
    Author: author,
    Subject: metadata?.description || 'Markdown Rendered PDF',
    Keywords: metadata?.keywords || '',
    Creator: 'PDF Microservice',
    Producer: 'PDFKit',
    CreationDate: docDate,
  };

  // Calculate the content width and margins for consistency
  const leftMargin = doc.page.margins.left;
  const contentWidth =
    doc.page.width - doc.page.margins.left - doc.page.margins.right;

  // Start at a good position from top of page
  const titleY = 100;
  let currentY = titleY;

  // Ensure any previous alignment settings don't affect the cover page
  doc.text('', { align: 'left', continued: false });

  // Title - explicitly set to center alignment with fixed position
  doc
    .fontSize(mergedTheme.fontSize.h1 + 4) // Larger for title
    .font(mergedTheme.fonts.heading)
    .fillColor(mergedTheme.colors.heading);

  // Calculate centered x position
  const titleWidth = doc.widthOfString(title);
  const titleX = (doc.page.width - titleWidth) / 2;

  // Draw title centered
  doc.text(title, titleX, currentY, {
    width: titleWidth,
    align: 'center',
    lineGap: 8,
  });

  currentY = doc.y + 40; // move down for author

  // Author - explicitly set to center alignment with fixed position
  if (author) {
    doc.fontSize(mergedTheme.fontSize.h3 - 2).font(mergedTheme.fonts.italic);

    // Calculate centered x position
    const authorText = `By: ${author}`;
    const authorWidth = doc.widthOfString(authorText);
    const authorX = (doc.page.width - authorWidth) / 2;

    // Draw author centered
    doc.text(authorText, authorX, currentY, {
      width: authorWidth,
      align: 'center',
      lineGap: 4,
    });

    currentY = doc.y + 20; // move down for date
  }

  // Date - explicitly set to center alignment with fixed position
  doc.fontSize(mergedTheme.fontSize.body).font(mergedTheme.fonts.body);

  // Calculate centered x position
  const dateWidth = doc.widthOfString(dateFormatted);
  const dateX = (doc.page.width - dateWidth) / 2;

  // Draw date centered
  doc.text(dateFormatted, dateX, currentY, {
    width: dateWidth,
    align: 'center',
    lineGap: 4,
  });

  // Reset alignment to left before adding a new page - position at left margin
  doc.text('', leftMargin, doc.y, {
    align: 'left',
    continued: false,
  });

  // Log position before adding a new page
  logPosition(doc, 'Before adding page after cover');

  // Add a new page after the cover
  console.log(`[DEBUG] Adding page after cover page`);
  doc.addPage();

  // Reset Y position at the top of the new page and log
  doc.text('', { continued: false });
  logPosition(doc, 'After cover page, start of content page');
}

/**
 * Adds a footer with page number to the current page
 * Useful for multi-page documents to help with navigation
 *
 * @param {PDFDocument} doc - The PDFKit document instance
 * @param {number} currentPage - The current page number
 * @param {string} [footerText=''] - Optional additional footer text
 * @param {Object} theme - Optional theme settings to override defaults
 */
function addPageFooter(
  doc,
  currentPage,
  footerText = '',
  theme = DEFAULT_THEME
) {
  // Save the current position and font settings
  const originalY = doc.y;
  const originalFont = doc._font ? doc._font.name : theme.fonts.body;
  const originalFontSize = doc._fontSize || theme.fontSize.body;

  const pageText = `Page ${currentPage}`;
  const combinedText = footerText ? `${footerText} | ${pageText}` : pageText;

  // Position at the bottom of the page
  const textWidth = doc.widthOfString(combinedText);
  const textX = (doc.page.width - textWidth) / 2;
  const textY = doc.page.height - doc.page.margins.bottom + 12;

  // Move to footer position and add text
  doc
    .fontSize(theme.fontSize.footer)
    .fillColor(theme.colors.footer)
    .text(combinedText, textX, textY, { lineBreak: false });

  // Restore original position and font settings
  doc
    .fillColor(theme.colors.text)
    .fontSize(originalFontSize)
    .font(originalFont);

  // Reset Y position to where we were before adding the footer
  doc.y = originalY;
}

module.exports = {
  createCoverPage,
  addPageFooter,
};
