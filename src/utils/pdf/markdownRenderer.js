/**
 * Markdown Renderer
 *
 * This module handles the core functionality of converting Markdown content to PDF
 * using PDFKit, rendering various Markdown elements like headings, lists,
 * blockquotes, and code blocks.
 *
 * @module utils/pdf/markdownRenderer
 */

const { DEFAULT_THEME, createMergedTheme } = require('./theme');
const { addPageFooter } = require('./pageElements');
const { monitorPageBreaks, logPosition } = require('./debug');
const {
  // Heading renderers
  renderHeading1,
  renderHeading2,
  renderHeading3,

  // List renderers
  renderBulletListItem,
  renderNumberedListItem,
  renderTocListItem,

  // Block renderers
  renderBlockquote,
  renderCodeBlock,
  renderHorizontalRule,
  renderParagraph,
} = require('./renderers');

/**
 * Renders Markdown content to a PDFKit document
 * This is the main function for converting Markdown to PDF, handling various
 * formatting elements and ensuring proper spacing and layout.
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

  // Set up page break monitoring
  monitorPageBreaks(doc);

  // Log initial position
  logPosition(doc, 'Start of markdown rendering');

  // Debug page additions - only wrap if not already wrapped
  if (!doc._originalAddPage) {
    doc._originalAddPage = doc.addPage;
    doc.addPage = function () {
      console.log(`[DEBUG] Explicit addPage() called at Y position: ${doc.y}`);
      return doc._originalAddPage.apply(this, arguments);
    };
  }

  // Merge theme with defaults
  const mergedTheme = createMergedTheme(theme);

  // Define consistent spacing values with smaller values to avoid page breaks
  const SPACING = {
    heading1: mergedTheme.spacing.heading1 * 0.3 || 0.3, // Significantly reduced
    heading2: mergedTheme.spacing.heading2 * 0.3 || 0.25, // Significantly reduced
    heading3: mergedTheme.spacing.heading3 * 0.3 || 0.2, // Significantly reduced
    paragraph: mergedTheme.spacing.paragraph * 0.7 || 0.2,
    list: mergedTheme.spacing.list * 0.5 || 0.2,
    listWithUrl: 0.4, // Reduced from 0.6 to avoid blank pages
    blockquote: mergedTheme.spacing.blockquote * 0.5 || 0.2,
    codeBlock: mergedTheme.spacing.codeBlock * 0.5 || 0.3,
    emptyLine: 0.2, // Smaller space for empty lines
    tocItem: 0.15, // Even smaller spacing for TOC items
    horizontalRule: 0.5, // Spacing for horizontal rules
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
    console.log(`[DEBUG] Auto pageAdded event at Y position: ${doc.y}`);
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
  let inTableOfContents = false; // Track if we're in TOC section

  // Check if document starts with a Table of Contents
  for (let i = 0; i < Math.min(20, lines.length); i++) {
    if (lines[i].trim().toLowerCase().includes('table of contents')) {
      inTableOfContents = true;
      break;
    }
  }

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

    // Check if we're leaving the TOC section
    if (inTableOfContents && trimmedLine.match(/^[\-\*\_]{3,}$/)) {
      inTableOfContents = false;
    }

    // Heading 1
    if (trimmedLine.startsWith('# ')) {
      // Check if this heading indicates a Table of Contents
      if (trimmedLine.toLowerCase().includes('table of contents')) {
        inTableOfContents = true;
      } else {
        inTableOfContents = false;
      }

      renderHeading1(
        doc,
        trimmedLine.replace('# ', ''),
        leftMargin,
        currentY,
        contentWidth,
        mergedTheme,
        SPACING.heading1
      );
    }
    // Heading 2
    else if (trimmedLine.startsWith('## ')) {
      renderHeading2(
        doc,
        trimmedLine.replace('## ', ''),
        leftMargin,
        currentY,
        contentWidth,
        mergedTheme,
        SPACING.heading2
      );
    }
    // Heading 3
    else if (trimmedLine.startsWith('### ')) {
      renderHeading3(
        doc,
        trimmedLine.replace('### ', ''),
        leftMargin,
        currentY,
        contentWidth,
        mergedTheme,
        SPACING.heading3
      );
    }
    // Table of Contents List Item (numbered or bulleted that starts with a number/bracket)
    else if (
      inTableOfContents &&
      (/^\d+\.\s/.test(trimmedLine) ||
        ((trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) &&
          /\[\w+\]/.test(trimmedLine)))
    ) {
      let prefix = '';
      let content = '';

      if (/^\d+\.\s/.test(trimmedLine)) {
        // For numbered TOC items
        prefix = trimmedLine.match(/^\d+\./)[0] + ' ';
        content = trimmedLine.replace(/^\d+\.\s/, '');
      } else {
        // For bullet TOC items with links
        prefix = '• ';
        content = trimmedLine.substring(2);
      }

      renderTocListItem(
        doc,
        content,
        prefix,
        leftMargin,
        currentY,
        contentWidth,
        mergedTheme,
        SPACING.tocItem
      );
    }
    // Bullet List
    else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
      const listContent = trimmedLine.substring(2);
      const hasUrl = urlPattern.test(listContent);

      renderBulletListItem(
        doc,
        listContent,
        leftMargin,
        currentY,
        contentWidth,
        hasUrl,
        mergedTheme,
        SPACING
      );

      inList = true;
    }
    // Numbered list
    else if (/^\d+\.\s/.test(trimmedLine)) {
      const listContent = trimmedLine.replace(/^\d+\.\s/, '');
      const hasUrl = urlPattern.test(listContent);
      const number = trimmedLine.match(/^\d+\./)[0];

      renderNumberedListItem(
        doc,
        listContent,
        number,
        leftMargin,
        currentY,
        contentWidth,
        hasUrl,
        mergedTheme,
        SPACING
      );

      inList = true;
    }
    // Blockquote
    else if (trimmedLine.startsWith('> ')) {
      const quoteContent = trimmedLine.substring(2);

      renderBlockquote(
        doc,
        quoteContent,
        leftMargin,
        currentY,
        contentWidth,
        mergedTheme,
        SPACING.blockquote
      );
    }
    // Horizontal rule
    else if (trimmedLine.match(/^[\-\*\_]{3,}$/)) {
      renderHorizontalRule(
        doc,
        leftMargin,
        rightMargin,
        SPACING.horizontalRule
      );

      // If this is right after TOC, ensure we're no longer in TOC mode
      if (inTableOfContents) {
        inTableOfContents = false;
      }
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

      renderCodeBlock(
        doc,
        codeContent,
        leftMargin,
        currentY,
        contentWidth,
        mergedTheme,
        SPACING.codeBlock
      );

      // Skip to the end of code block
      i = codeBlockEnd;
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
      renderParagraph(
        doc,
        trimmedLine,
        leftMargin,
        currentY,
        contentWidth,
        mergedTheme,
        SPACING.paragraph
      );

      inList = false;
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

module.exports = {
  renderMarkdownToPdf,
};
