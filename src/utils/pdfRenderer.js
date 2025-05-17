/**
 * PDF Rendering Utilities
 *
 * This module provides functionality to convert Markdown content to PDF using PDFKit.
 * It supports various Markdown features including headings, lists, code blocks, blockquotes,
 * and inline formatting (bold, italic, code). The module also handles document metadata and
 * cover page generation.
 *
 * @module utils/pdfRenderer
 */

// Default theme settings
const DEFAULT_THEME = {
  fonts: {
    heading: 'Helvetica-Bold',
    body: 'Helvetica',
    italic: 'Helvetica-Oblique',
    bold: 'Helvetica-Bold',
    code: 'Courier',
  },
  fontSize: {
    h1: 24,
    h2: 20,
    h3: 16,
    body: 12,
    code: 10,
    footer: 8,
  },
  colors: {
    text: '#000000',
    heading: '#000000',
    blockquote: '#666666',
    codeBackground: '#f4f4f4',
    footer: '#666666',
    link: '#0000EE',
  },
  margins: {
    top: 72,
    bottom: 72,
    left: 72,
    right: 72,
  },
  spacing: {
    paragraph: 0.8,
    heading1: 1,
    heading2: 0.8,
    heading3: 0.7,
    list: 0.8,
    blockquote: 0.8,
    codeBlock: 1,
    lineGap: 4,
  },
};

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

  // Handle formatting in a more robust way with replacements
  // Process formatting in order of precedence: code, bold, italic
  let processed = text;

  // Process inline code first (since it shouldn't have nested formatting)
  processed = processed.replace(/`([^`]+)`/g, (match, code) => {
    // For first segment, we need explicit positioning
    const options = getTextOptions(isFirstSegment);
    if (isFirstSegment) {
      doc.text('', startX, doc.y, { continued: true });
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
        doc.text('', startX, doc.y, { continued: true });
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
      doc.text('', startX, doc.y, { continued: true });
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
      doc.text(processed, startX, doc.y, options);
    } else {
      doc.text(processed, options);
    }
  }

  // End the line with explicit alignment
  doc.text('', {
    continued: false,
    align: 'left',
    width: contentWidth,
  });
}

/**
 * Renders Markdown content to a PDFKit document
 * This is the main function for converting Markdown to PDF, handling various
 * formatting elements and ensuring proper spacing and layout.
 *
 * Supported Markdown features:
 * - Headings (# to ###)
 * - Lists (bulleted with - or *)
 * - Numbered lists (1. 2. etc)
 * - Blockquotes (> text)
 * - Code blocks (```)
 * - Horizontal rules (---)
 * - Bold formatting (** or __)
 * - Italic formatting (_text_)
 * - Inline code (`code`)
 *
 * @param {string} markdown - The markdown content to render
 * @param {PDFDocument} doc - The PDFKit document instance
 * @param {Object} theme - Optional theme settings to override defaults
 * @throws {Error} If markdown or doc is not provided
 */
function renderMarkdownToPdf(markdown, doc, theme = {}) {
  if (!markdown || !doc) {
    throw new Error('Missing required parameters');
  }

  // Merge theme with defaults
  const mergedTheme = {
    ...DEFAULT_THEME,
    fonts: { ...DEFAULT_THEME.fonts, ...theme.fonts },
    fontSize: { ...DEFAULT_THEME.fontSize, ...theme.fontSize },
    colors: { ...DEFAULT_THEME.colors, ...theme.colors },
    margins: { ...DEFAULT_THEME.margins, ...theme.margins },
    spacing: { ...DEFAULT_THEME.spacing, ...theme.spacing },
  };

  // Define consistent spacing values
  const SPACING = {
    heading1: mergedTheme.spacing.heading1 * 0.4 || 0.3, // Significantly reduced
    heading2: mergedTheme.spacing.heading2 * 0.4 || 0.25, // Significantly reduced
    heading3: mergedTheme.spacing.heading3 * 0.4 || 0.2, // Significantly reduced
    paragraph: mergedTheme.spacing.paragraph || 0.2,
    list: mergedTheme.spacing.list * 0.7 || 0.2,
    listWithUrl: 1.0, // More space for list items with URLs
    blockquote: mergedTheme.spacing.blockquote * 0.7 || 0.2,
    codeBlock: mergedTheme.spacing.codeBlock * 0.7 || 0.3,
    emptyLine: 0.3, // Smaller space for empty lines
  };

  // Add metadata to the PDF - ensures proper date format
  const creationDate = new Date();
  if (!doc.info) {
    doc.info = {
      Title: 'Markdown Rendered PDF',
      Author: 'PDF Microservice',
      Subject: 'Markdown to PDF Conversion',
      Keywords: 'markdown, pdf, conversion',
      Creator: 'PDF Microservice',
      Producer: 'PDFKit',
      CreationDate: creationDate,
    };
  } else {
    // Ensure CreationDate is a Date object
    doc.info.CreationDate = creationDate;
  }

  // Set up page numbering
  let currentPage = 1;

  // Add footer to the first page
  addPageFooter(doc, currentPage, '', mergedTheme);

  // Handle new pages being added - add footer to each new page
  doc.on('pageAdded', () => {
    currentPage++;
    addPageFooter(doc, currentPage, '', mergedTheme);
  });

  // Set default document properties for better readability
  doc.font(mergedTheme.fonts.body);
  doc.fontSize(mergedTheme.fontSize.body);
  doc.lineGap(mergedTheme.spacing.lineGap); // Add consistent line spacing throughout the document
  doc.fillColor(mergedTheme.colors.text);

  // URL detection regex
  const urlPattern =
    /(https?:\/\/[^\s()<>]+(?:\([^\s()<>]+\)|[^,\s`!()\[\]{};:'".,<>?«»""'']))/g;

  // CRITICAL: Calculate content width and positions for consistent rendering
  const leftMargin = doc.page.margins.left;
  const rightMargin = doc.page.margins.right;
  const contentWidth = doc.page.width - leftMargin - rightMargin;

  // Force reset text position and alignment
  doc.text('', leftMargin, doc.y, {
    align: 'left',
    continued: false,
  });

  // Parse and render the markdown content
  const lines = markdown.split('\n');
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // Skip empty lines
    if (!trimmedLine) {
      doc.moveDown(SPACING.emptyLine); // Reduced spacing for empty lines
      continue;
    }

    // Save current Y position
    const currentY = doc.y;

    // Heading 1
    if (trimmedLine.startsWith('# ')) {
      doc
        .fontSize(mergedTheme.fontSize.h1)
        .font(mergedTheme.fonts.heading)
        .fillColor(mergedTheme.colors.heading)
        // Explicitly position text with x coordinate
        .text(trimmedLine.replace('# ', ''), leftMargin, currentY, {
          align: 'left',
          underline: false,
          lineGap: mergedTheme.spacing.lineGap + 1, // Slightly increased for headings
          width: contentWidth,
        });
      doc.moveDown(SPACING.heading1); // Significantly reduced spacing
      doc.fillColor(mergedTheme.colors.text);
    }
    // Heading 2
    else if (trimmedLine.startsWith('## ')) {
      doc
        .fontSize(mergedTheme.fontSize.h2)
        .font(mergedTheme.fonts.heading)
        .fillColor(mergedTheme.colors.heading)
        // Explicitly position text with x coordinate
        .text(trimmedLine.replace('## ', ''), leftMargin, currentY, {
          align: 'left',
          underline: false,
          lineGap: mergedTheme.spacing.lineGap + 0.5, // Slightly increased for headings
          width: contentWidth,
        });
      doc.moveDown(SPACING.heading2); // Significantly reduced spacing
      doc.fillColor(mergedTheme.colors.text);
    }
    // Heading 3
    else if (trimmedLine.startsWith('### ')) {
      doc
        .fontSize(mergedTheme.fontSize.h3)
        .font(mergedTheme.fonts.heading)
        .fillColor(mergedTheme.colors.heading)
        // Explicitly position text with x coordinate
        .text(trimmedLine.replace('### ', ''), leftMargin, currentY, {
          align: 'left',
          underline: false,
          lineGap: mergedTheme.spacing.lineGap, // Standard line gap for smaller headings
          width: contentWidth,
        });
      doc.moveDown(SPACING.heading3); // Significantly reduced spacing
      doc.fillColor(mergedTheme.colors.text);
    }
    // Bullet List
    else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
      const listContent = trimmedLine.substring(2);
      const listIndent = 20;
      const hasUrl = urlPattern.test(listContent);

      // Increase spacing for bibliography/reference items with URLs
      const listItemWidth = contentWidth - listIndent - 10;

      doc.fontSize(mergedTheme.fontSize.body).font(mergedTheme.fonts.body);

      // Add the bullet point with explicit positioning
      // We position at the list indentation
      doc.text('• ', leftMargin + listIndent, currentY, {
        continued: true,
        align: 'left',
        width: 10,
      });

      // Process any inline formatting in the list item
      // References with URLs need better formatting
      const listX = leftMargin + listIndent + 10;
      processInlineFormatting(
        listContent,
        doc,
        mergedTheme,
        listX,
        listItemWidth
      );

      inList = true;
      // Use more spacing for list items with URLs (like in references/bibliography)
      doc.moveDown(hasUrl ? SPACING.listWithUrl : SPACING.list);
    }
    // Numbered list
    else if (/^\d+\.\s/.test(trimmedLine)) {
      const listContent = trimmedLine.replace(/^\d+\.\s/, '');
      const listIndent = 20;
      const hasUrl = urlPattern.test(listContent);

      // Increase spacing for bibliography/reference items with URLs
      const listItemWidth = contentWidth - listIndent - 20;

      doc.fontSize(mergedTheme.fontSize.body).font(mergedTheme.fonts.body);

      // Add the number with explicit positioning
      const number = trimmedLine.match(/^\d+\./)[0];
      doc.text(`${number} `, leftMargin + listIndent, currentY, {
        continued: true,
        align: 'left',
        width: 20,
      });

      // Process any inline formatting in the list item
      const listX = leftMargin + listIndent + 20;
      processInlineFormatting(
        listContent,
        doc,
        mergedTheme,
        listX,
        listItemWidth
      );

      inList = true;
      // Use more spacing for list items with URLs (like in references/bibliography)
      doc.moveDown(hasUrl ? SPACING.listWithUrl : SPACING.list);
    }
    // Blockquote
    else if (trimmedLine.startsWith('> ')) {
      const quoteContent = trimmedLine.substring(2);
      const quoteIndent = 20;

      // Draw blockquote with explicit positioning
      doc
        .fontSize(mergedTheme.fontSize.body)
        .font(mergedTheme.fonts.italic)
        .fillColor(mergedTheme.colors.blockquote)
        .text(quoteContent, leftMargin + quoteIndent, currentY, {
          align: 'left',
          lineGap: mergedTheme.spacing.lineGap,
          width: contentWidth - quoteIndent,
        });

      doc.fillColor(mergedTheme.colors.text);
      doc.moveDown(SPACING.blockquote); // Reduced spacing
    }
    // Horizontal rule
    else if (trimmedLine.match(/^[\-\*\_]{3,}$/)) {
      doc
        .moveTo(leftMargin, doc.y)
        .lineTo(doc.page.width - rightMargin, doc.y)
        .stroke();
      doc.moveDown(0.5); // Reduced spacing for horizontal rule
    }
    // Code block
    else if (trimmedLine.startsWith('```')) {
      // Find the end of the code block
      let codeBlockEnd = i + 1;
      while (
        codeBlockEnd < lines.length &&
        !lines[codeBlockEnd].trim().startsWith('```')
      ) {
        codeBlockEnd++;
      }

      // Extract the code content
      const codeContent = lines.slice(i + 1, codeBlockEnd).join('\n');
      const codeIndent = 10;

      // Draw code block with explicit positioning
      doc
        .fontSize(mergedTheme.fontSize.code)
        .font(mergedTheme.fonts.code)
        .fillColor(mergedTheme.colors.text)
        .text(codeContent, leftMargin + codeIndent, currentY, {
          align: 'left',
          backgroundColor: mergedTheme.colors.codeBackground,
          lineGap: mergedTheme.spacing.lineGap,
          width: contentWidth - codeIndent * 2,
        });

      // Reset to normal text formatting
      doc.font(mergedTheme.fonts.body).fontSize(mergedTheme.fontSize.body);

      // Skip to the end of code block
      i = codeBlockEnd;
      doc.moveDown(SPACING.codeBlock); // Reduced spacing
      continue; // Skip the closing ``` line
    }
    // HTML anchor tag (skip rendering)
    else if (
      trimmedLine.startsWith('<a name=') &&
      trimmedLine.endsWith('</a>')
    ) {
      // Skip rendering HTML anchor tags
      continue;
    }
    // Regular paragraph with inline formatting
    else {
      // Reset to normal font if coming from heading or list
      doc
        .fontSize(mergedTheme.fontSize.body)
        .font(mergedTheme.fonts.body)
        .lineGap(mergedTheme.spacing.lineGap);

      // Process inline formatting with explicit positioning
      processInlineFormatting(
        trimmedLine,
        doc,
        mergedTheme,
        leftMargin,
        contentWidth
      );

      inList = false;
      doc.moveDown(SPACING.paragraph); // Reduced spacing
    }

    // Force alignment reset after each element to prevent inheritance
    if (i < lines.length - 1) {
      doc.text('', leftMargin, doc.y, {
        align: 'left',
        continued: false,
      });
    }
  }
}

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

  // Add a new page after the cover
  doc.addPage();
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
  renderMarkdownToPdf,
  createCoverPage,
  addPageFooter,
  processInlineFormatting,
  DEFAULT_THEME,
};
