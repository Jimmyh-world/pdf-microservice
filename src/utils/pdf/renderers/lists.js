/**
 * List Renderers
 *
 * This module provides functions for rendering Markdown list items to PDF.
 *
 * @module utils/pdf/renderers/lists
 */

/**
 * Renders a bullet list item to the PDF
 *
 * @param {PDFDocument} doc - The PDFKit document instance
 * @param {string} content - The list item content
 * @param {number} x - The x position to start text
 * @param {number} y - The y position to start text (NOTE: We'll ignore this and use doc.y for better flow)
 * @param {number} contentWidth - The available width for content
 * @param {boolean} hasUrl - Whether the item contains URLs (for spacing)
 * @param {Object} theme - The theme settings
 * @param {Object} spacing - The spacing configuration
 */
function renderBulletListItem(
  doc,
  content,
  x,
  y,
  contentWidth,
  hasUrl,
  theme,
  spacing
) {
  doc
    .font(theme.fonts.body)
    .fontSize(theme.fontSize.body)
    .lineGap(theme.spacing.lineGap || 4);

  const listItemLine = `• ${content}`;

  doc.text(listItemLine, x, doc.y, {
    width: contentWidth,
    align: 'left',
    lineBreak: true,
  });

  doc.moveDown(hasUrl ? spacing.listWithUrl : spacing.list);
}

/**
 * Renders a numbered list item to the PDF
 *
 * @param {PDFDocument} doc - The PDFKit document instance
 * @param {string} content - The list item content
 * @param {string} number - The list item number/prefix (e.g., "1.")
 * @param {number} x - The x position to start text
 * @param {number} y - The y position to start text (NOTE: We'll ignore this and use doc.y for better flow)
 * @param {number} contentWidth - The available width for content
 * @param {boolean} hasUrl - Whether the item contains URLs (for spacing)
 * @param {Object} theme - The theme settings
 * @param {Object} spacing - The spacing configuration
 */
function renderNumberedListItem(
  doc,
  content,
  number,
  x,
  y,
  contentWidth,
  hasUrl,
  theme,
  spacing
) {
  doc
    .font(theme.fonts.body)
    .fontSize(theme.fontSize.body)
    .lineGap(theme.spacing.lineGap || 4);

  const numberedItemLine = `${number}. ${content}`;

  doc.text(numberedItemLine, x, doc.y, {
    width: contentWidth,
    align: 'left',
    lineBreak: true,
  });

  doc.moveDown(hasUrl ? spacing.listWithUrl : spacing.list);
}

/**
 * Renders a TOC list item to the PDF
 *
 * @param {PDFDocument} doc - The PDFKit document instance
 * @param {string} content - The list item content
 * @param {string} prefix - The list item prefix (e.g., "1." or "•")
 * @param {number} x - The x position to start text
 * @param {number} y - The y position to start text (NOTE: We'll ignore this and use doc.y for better flow)
 * @param {number} contentWidth - The available width for content
 * @param {Object} theme - The theme settings
 * @param {number} spacing - The spacing to add after the item
 */
function renderTocListItem(
  doc,
  content,
  prefix,
  x,
  y,
  contentWidth,
  theme,
  spacing
) {
  doc
    .font(theme.fonts.body)
    .fontSize(theme.fontSize.body)
    .lineGap(theme.spacing.lineGap || 4);

  const tocItemLine = `${prefix} ${content}`;

  doc.text(tocItemLine, x, doc.y, {
    width: contentWidth,
    align: 'left',
    lineBreak: true,
  });

  doc.moveDown(spacing);
}

module.exports = {
  renderBulletListItem,
  renderNumberedListItem,
  renderTocListItem,
};
