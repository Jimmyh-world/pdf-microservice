/**
 * Inline Formatting Utilities
 *
 * This module provides functionality to process inline Markdown formatting
 * like bold, italic, code, and hyperlinks within text.
 *
 * @module utils/pdf/inlineFormatting
 */

const { DEFAULT_THEME } = require('./theme');

/**
 * Process inline markdown formatting (bold, italic, code)
 * Converts markdown formatting syntax to PDFKit styling
 *
 * @param {string} text - The text to process (may contain ** or __ for bold, _ for italic, ` for code)
 * @param {PDFDocument} doc - The PDFKit document instance
 * @param {Object} theme - Theme settings for formatting
 * @param {number} xPosition - The x position to start text (for explicit positioning)
 * @param {number} widthLimit - The maximum width for text content
 */
function processInlineFormatting(
  text,
  doc,
  theme = DEFAULT_THEME,
  xPosition = null,
  widthLimit = null
) {
  // Save the current font settings
  const currentFont = doc._font ? doc._font.name : theme.fonts.body;
  const currentFontSize = doc._fontSize || theme.fontSize.body;

  // Calculate position and width if not provided
  const startX = xPosition !== null ? xPosition : doc.page.margins.left;
  const contentWidth =
    widthLimit !== null
      ? widthLimit
      : doc.page.width - doc.page.margins.left - doc.page.margins.right;

  // Start a new text segment at the specified position
  let isFirstSegment = true;

  // Set explicit options for text segments to ensure consistent alignment
  const getTextOptions = (isFirst) => ({
    continued: true,
    align: 'left',
    width: contentWidth,
    lineBreak: true, // Add lineBreak to ensure proper word wrapping
  });

  // URL regex pattern for hyperlink detection
  const urlPattern =
    /(https?:\/\/[^\s()<>]+(?:\([^\s()<>]+\)|[^,\s`!()\[\]{};:'".,<>?«»""'']))/g;

  // Process the text to handle URLs as hyperlinks
  let processedText = text;
  const matches = [...text.matchAll(urlPattern)];

  // If we have URLs in the text, we need to handle them as hyperlinks
  if (matches.length > 0) {
    // For each URL match
    let lastIndex = 0;
    let segments = [];

    for (const match of matches) {
      const url = match[0];
      const index = match.index;

      // Add text before the URL
      if (index > lastIndex) {
        segments.push({
          text: text.substring(lastIndex, index),
          isLink: false,
        });
      }

      // Add the URL as a link
      segments.push({
        text: url,
        isLink: true,
        url: url,
      });

      lastIndex = index + url.length;
    }

    // Add any remaining text after the last URL
    if (lastIndex < text.length) {
      segments.push({
        text: text.substring(lastIndex),
        isLink: false,
      });
    }

    // Render each segment
    for (const segment of segments) {
      const options = getTextOptions(isFirstSegment);

      if (isFirstSegment) {
        isFirstSegment = false;

        if (segment.isLink) {
          doc.fillColor(theme.colors.link).text(segment.text, startX, doc.y, {
            ...options,
            link: segment.url,
            underline: true,
          });
          doc.fillColor(theme.colors.text);
        } else {
          doc.text(segment.text, startX, doc.y, options);
        }
      } else {
        if (segment.isLink) {
          doc.fillColor(theme.colors.link).text(segment.text, {
            ...options,
            link: segment.url,
            underline: true,
          });
          doc.fillColor(theme.colors.text);
        } else {
          doc.text(segment.text, options);
        }
      }
    }

    // End the line with explicit alignment
    doc.text('', {
      continued: false,
      align: 'left',
      width: contentWidth,
    });

    return;
  }

  // For simple text without formatting, render directly to avoid character-by-character issues
  if (
    !text.includes('**') &&
    !text.includes('__') &&
    !text.includes('_') &&
    !text.includes('`')
  ) {
    doc.text(text, startX, doc.y, {
      continued: false,
      align: 'left',
      width: contentWidth,
      lineBreak: true,
    });
    return;
  }

  // Handle formatting in a more robust way with replacements
  // Process formatting in order of precedence: code, bold, italic
  let processed = text;

  // Process inline code first (since it shouldn't have nested formatting)
  processed = processed.replace(/`([^`]+)`/g, (match, code) => {
    // For first segment, we need explicit positioning
    const options = getTextOptions(isFirstSegment);
    if (isFirstSegment) {
      doc.text('', startX, doc.y, { continued: true, width: contentWidth });
      isFirstSegment = false;
    }

    doc.font(theme.fonts.code).text(code, options);
    doc.font(currentFont);
    return '';
  });

  // Process bold text
  processed = processed.replace(
    /\*\*([^*]+)\*\*|__([^_]+)__/g,
    (match, bold1, bold2) => {
      const content = bold1 || bold2;

      // For first segment, we need explicit positioning
      const options = getTextOptions(isFirstSegment);
      if (isFirstSegment) {
        doc.text('', startX, doc.y, { continued: true, width: contentWidth });
        isFirstSegment = false;
      }

      doc.font(theme.fonts.bold).text(content, options);
      doc.font(currentFont);
      return '';
    }
  );

  // Process italic text
  processed = processed.replace(/_([^_]+)_/g, (match, italic) => {
    // For first segment, we need explicit positioning
    const options = getTextOptions(isFirstSegment);
    if (isFirstSegment) {
      doc.text('', startX, doc.y, { continued: true, width: contentWidth });
      isFirstSegment = false;
    }

    doc.font(theme.fonts.italic).text(italic, options);
    doc.font(currentFont);
    return '';
  });

  // Process remaining text
  if (processed.trim()) {
    // For first segment, we need explicit positioning
    const options = getTextOptions(isFirstSegment);
    if (isFirstSegment) {
      doc.text(processed, startX, doc.y, {
        ...options,
        continued: false,
      });
    } else {
      doc.text(processed, {
        ...options,
        continued: false,
      });
    }
  } else if (!isFirstSegment) {
    // End the line with explicit alignment if we've started a text segment
    doc.text('', {
      continued: false,
      align: 'left',
      width: contentWidth,
    });
  }
}

module.exports = {
  processInlineFormatting,
};
