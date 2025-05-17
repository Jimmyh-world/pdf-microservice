/**
 * Block Element Renderers
 *
 * This module provides functions for rendering Markdown block elements like
 * blockquotes and code blocks to PDF.
 *
 * @module utils/pdf/renderers/blocks
 */

/**
 * Renders a blockquote to the PDF
 *
 * @param {PDFDocument} doc - The PDFKit document instance
 * @param {string} content - The blockquote content
 * @param {number} x - The x position to start text
 * @param {number} y - The y position to start text
 * @param {number} contentWidth - The available width for content
 * @param {Object} theme - The theme settings
 * @param {number} spacing - The spacing to add after the blockquote
 */
function renderBlockquote(doc, content, x, y, contentWidth, theme, spacing) {
  const quoteIndent = 20;

  // Draw blockquote with explicit positioning
  doc
    .fontSize(theme.fontSize.body)
    .font(theme.fonts.italic)
    .fillColor(theme.colors.blockquote)
    .text(content, x + quoteIndent, y, {
      align: 'left',
      lineGap: theme.spacing.lineGap,
      width: contentWidth - quoteIndent,
      lineBreak: true, // Ensure proper text wrapping
    });

  doc.fillColor(theme.colors.text);
  doc.moveDown(spacing);
}

/**
 * Renders a code block to the PDF
 *
 * @param {PDFDocument} doc - The PDFKit document instance
 * @param {string} content - The code block content
 * @param {number} x - The x position to start text
 * @param {number} y - The y position to start text
 * @param {number} contentWidth - The available width for content
 * @param {Object} theme - The theme settings
 * @param {number} spacing - The spacing to add after the code block
 */
function renderCodeBlock(doc, content, x, y, contentWidth, theme, spacing) {
  const codeIndent = 10;

  // Draw code block with explicit positioning
  doc
    .fontSize(theme.fontSize.code)
    .font(theme.fonts.code)
    .fillColor(theme.colors.text)
    .text(content, x + codeIndent, y, {
      align: 'left',
      backgroundColor: theme.colors.codeBackground,
      lineGap: theme.spacing.lineGap,
      width: contentWidth - codeIndent * 2,
      lineBreak: true, // Ensure proper text wrapping
    });

  // Reset to normal text formatting
  doc.font(theme.fonts.body).fontSize(theme.fontSize.body);
  doc.moveDown(spacing);
}

/**
 * Renders a horizontal rule to the PDF
 *
 * @param {PDFDocument} doc - The PDFKit document instance
 * @param {number} x - The x position to start line
 * @param {number} right - The right margin position
 * @param {number} spacing - The spacing to add after the line
 */
function renderHorizontalRule(doc, x, right, spacing) {
  doc
    .moveTo(x, doc.y)
    .lineTo(doc.page.width - right, doc.y)
    .stroke();
  doc.moveDown(spacing);
}

/**
 * Renders a regular paragraph to the PDF
 *
 * @param {PDFDocument} doc - The PDFKit document instance
 * @param {string} content - The paragraph content
 * @param {number} x - The x position to start text
 * @param {number} y - The y position to start text
 * @param {number} contentWidth - The available width for content
 * @param {Object} theme - The theme settings
 * @param {number} spacing - The spacing to add after the paragraph
 */
function renderParagraph(doc, content, x, y, contentWidth, theme, spacing) {
  // Reset to normal font
  doc
    .fontSize(theme.fontSize.body)
    .font(theme.fonts.body)
    .lineGap(theme.spacing.lineGap);

  // Render regular text with appropriate width and line breaking
  doc.text(content, x, y, {
    align: 'left',
    width: contentWidth,
    lineBreak: true,
    continued: false,
  });

  doc.moveDown(spacing);
}

module.exports = {
  renderBlockquote,
  renderCodeBlock,
  renderHorizontalRule,
  renderParagraph,
};
