/**
 * PDF Rendering Utilities
 *
 * Provides functions to convert markdown to PDF using PDFKit
 */

/**
 * Process inline markdown formatting (bold, italic, code)
 * @param {string} text - The text to process
 * @param {PDFDocument} doc - The PDFKit document instance
 */
function processInlineFormatting(text, doc) {
  // Save the current font settings
  const currentFont = doc._font ? doc._font.name : 'Helvetica';
  const currentFontSize = doc._fontSize || 12;

  // Handle bold text with ** or __
  let parts = text.split(/(\*\*.*?\*\*|__.*?__)/g);
  let result = '';

  parts.forEach((part) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      // Bold text
      doc.font('Helvetica-Bold');
      doc.text(part.substring(2, part.length - 2), { continued: true });
      doc.font(currentFont);
    } else if (part.startsWith('__') && part.endsWith('__')) {
      // Also bold text
      doc.font('Helvetica-Bold');
      doc.text(part.substring(2, part.length - 2), { continued: true });
      doc.font(currentFont);
    } else if (part.trim()) {
      // Regular text or other formatting
      doc.text(part, { continued: true });
    }
  });

  doc.text('', { continued: false });
}

/**
 * Renders Markdown content to a PDFKit document
 * @param {string} markdown - The markdown content to render
 * @param {PDFDocument} doc - The PDFKit document instance
 */
function renderMarkdownToPdf(markdown, doc) {
  if (!markdown || !doc) {
    throw new Error('Missing required parameters');
  }

  // Set default document properties for better readability
  doc.lineGap(4); // Add consistent line spacing throughout the document

  // Parse and render the markdown content
  const lines = markdown.split('\n');
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // Skip empty lines
    if (!trimmedLine) {
      doc.moveDown(1);
      continue;
    }

    // Heading 1
    if (trimmedLine.startsWith('# ')) {
      doc
        .fontSize(24)
        .font('Helvetica-Bold')
        .text(trimmedLine.replace('# ', ''), {
          align: 'left',
          underline: false,
          lineGap: 8, // Extra spacing after headings
        });
      doc.moveDown(1.5);
    }
    // Heading 2
    else if (trimmedLine.startsWith('## ')) {
      doc
        .fontSize(20)
        .font('Helvetica-Bold')
        .text(trimmedLine.replace('## ', ''), {
          align: 'left',
          underline: false,
          lineGap: 6, // Extra spacing after subheadings
        });
      doc.moveDown(1.2);
    }
    // Heading 3
    else if (trimmedLine.startsWith('### ')) {
      doc
        .fontSize(16)
        .font('Helvetica-Bold')
        .text(trimmedLine.replace('### ', ''), {
          align: 'left',
          underline: false,
          lineGap: 5, // Extra spacing after smaller headings
        });
      doc.moveDown(1);
    }
    // Bullet List
    else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
      const listContent = trimmedLine.substring(2);

      doc.fontSize(12).font('Helvetica');

      // Add the bullet point and indent the content
      doc.text('• ', { continued: true, indent: 20, lineGap: 3 });

      // Process any inline formatting in the list item
      processInlineFormatting(listContent, doc);

      inList = true;
      doc.moveDown(0.5); // Add space between list items
    }
    // Numbered list
    else if (/^\d+\.\s/.test(trimmedLine)) {
      const listContent = trimmedLine.replace(/^\d+\.\s/, '');

      doc.fontSize(12).font('Helvetica');

      // Add the number and indent the content
      const number = trimmedLine.match(/^\d+\./)[0];
      doc.text(`${number} `, { continued: true, indent: 20, lineGap: 3 });

      // Process any inline formatting in the list item
      processInlineFormatting(listContent, doc);

      inList = true;
      doc.moveDown(0.5); // Add space between list items
    }
    // Blockquote
    else if (trimmedLine.startsWith('> ')) {
      const quoteContent = trimmedLine.substring(2);

      doc
        .fontSize(12)
        .font('Helvetica-Oblique')
        .fillColor('gray')
        .text(quoteContent, {
          indent: 20,
          align: 'left',
          lineGap: 3,
        });

      doc.fillColor('black');
      doc.moveDown(1);
    }
    // Horizontal rule
    else if (trimmedLine.match(/^[\-\*\_]{3,}$/)) {
      doc
        .moveTo(doc.page.margins.left, doc.y)
        .lineTo(doc.page.width - doc.page.margins.right, doc.y)
        .stroke();
      doc.moveDown(1.5);
    }
    // Code block (simple implementation)
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

      // Draw code block
      doc.fontSize(10).font('Courier').fillColor('black').text(codeContent, {
        align: 'left',
        indent: 10,
        backgroundColor: '#f4f4f4',
        lineGap: 3,
      });

      // Reset to normal text formatting
      doc.font('Helvetica').fontSize(12);

      // Skip to the end of code block
      i = codeBlockEnd;
      doc.moveDown(1.5);
    }
    // Regular paragraph with inline formatting
    else {
      // Reset to normal font if coming from heading or list
      doc.fontSize(12).font('Helvetica').lineGap(4);

      // Process inline formatting
      processInlineFormatting(trimmedLine, doc);

      inList = false;
      doc.moveDown(1); // Proper spacing after paragraphs
    }
  }
}

/**
 * Creates a cover page for the PDF
 * @param {Object} metadata - The document metadata (title, author, date)
 * @param {PDFDocument} doc - The PDFKit document instance
 */
function createCoverPage(metadata, doc) {
  // Set default values if metadata is missing
  const title = metadata?.title || 'Generated Document';
  const author = metadata?.author || '';
  const date = metadata?.date || new Date().toLocaleDateString();

  // Position in the middle of the page
  const centerY = doc.page.height / 2 - 100;

  // Title
  doc.fontSize(28).font('Helvetica-Bold').text(title, {
    align: 'center',
    lineGap: 8,
  });

  doc.moveDown(2);

  // Author
  if (author) {
    doc.fontSize(14).font('Helvetica-Oblique').text(`By: ${author}`, {
      align: 'center',
      lineGap: 4,
    });
    doc.moveDown(1);
  }

  // Date
  doc.fontSize(12).font('Helvetica').text(date, {
    align: 'center',
    lineGap: 4,
  });

  // Add a new page after the cover
  doc.addPage();
}

/**
 * Adds a footer with page number to each page
 * @param {PDFDocument} doc - The PDFKit document instance
 * @param {string} footerText - Optional additional footer text
 */
function addPageFooter(doc, footerText = '') {
  const pageNumber = doc.bufferedPageRange().count;
  const pageText = `Page ${pageNumber}`;
  const combinedText = footerText ? `${footerText} | ${pageText}` : pageText;

  // Position at the bottom of the page
  const textWidth = doc.widthOfString(combinedText);
  const textX = (doc.page.width - textWidth) / 2;
  const textY = doc.page.height - doc.page.margins.bottom + 12;

  doc.fontSize(8).fillColor('#666666').text(combinedText, textX, textY, {
    lineBreak: false,
  });

  doc.fillColor('black');
}

module.exports = {
  renderMarkdownToPdf,
  createCoverPage,
  addPageFooter,
  processInlineFormatting,
};
