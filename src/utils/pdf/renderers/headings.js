/**
 * Heading Renderers
 *
 * This module provides functions for rendering Markdown headings to PDF.
 *
 * @module utils/pdf/renderers/headings
 */

/**
 * Renders a level 1 heading to the PDF
 *
 * @param {PDFDocument} doc - The PDFKit document instance
 * @param {string} text - The heading text (without the # prefix)
 * @param {number} x - The x position to start text
 * @param {number} y - The y position to start text
 * @param {number} width - The available width for the heading
 * @param {Object} theme - The theme settings
 * @param {number} spacing - The spacing to add after the heading
 */
function renderHeading1(doc, text, x, y, width, theme, spacing) {
  doc
    .fontSize(theme.fontSize.h1)
    .font(theme.fonts.heading)
    .fillColor(theme.colors.heading)
    .text(text, x, y, {
      align: 'left',
      underline: false,
      lineGap: theme.spacing.lineGap + 1, // Slightly increased for headings
      width: width,
      lineBreak: true, // Ensure proper text wrapping
    });

  doc.moveDown(spacing);
  doc.fillColor(theme.colors.text);
}

/**
 * Renders a level 2 heading to the PDF
 *
 * @param {PDFDocument} doc - The PDFKit document instance
 * @param {string} text - The heading text (without the ## prefix)
 * @param {number} x - The x position to start text
 * @param {number} y - The y position to start text
 * @param {number} width - The available width for the heading
 * @param {Object} theme - The theme settings
 * @param {number} spacing - The spacing to add after the heading
 */
function renderHeading2(doc, text, x, y, width, theme, spacing) {
  doc
    .fontSize(theme.fontSize.h2)
    .font(theme.fonts.heading)
    .fillColor(theme.colors.heading)
    .text(text, x, y, {
      align: 'left',
      underline: false,
      lineGap: theme.spacing.lineGap + 0.5, // Slightly increased for headings
      width: width,
      lineBreak: true, // Ensure proper text wrapping
    });

  doc.moveDown(spacing);
  doc.fillColor(theme.colors.text);
}

/**
 * Renders a level 3 heading to the PDF
 *
 * @param {PDFDocument} doc - The PDFKit document instance
 * @param {string} text - The heading text (without the ### prefix)
 * @param {number} x - The x position to start text
 * @param {number} y - The y position to start text
 * @param {number} width - The available width for the heading
 * @param {Object} theme - The theme settings
 * @param {number} spacing - The spacing to add after the heading
 */
function renderHeading3(doc, text, x, y, width, theme, spacing) {
  doc
    .fontSize(theme.fontSize.h3)
    .font(theme.fonts.heading)
    .fillColor(theme.colors.heading)
    .text(text, x, y, {
      align: 'left',
      underline: false,
      lineGap: theme.spacing.lineGap, // Standard line gap for smaller headings
      width: width,
      lineBreak: true, // Ensure proper text wrapping
    });

  doc.moveDown(spacing);
  doc.fillColor(theme.colors.text);
}

module.exports = {
  renderHeading1,
  renderHeading2,
  renderHeading3,
};
