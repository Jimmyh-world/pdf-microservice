/**
 * Isolated test for list item rendering
 * Tests direct PDFKit text flow without markdown parsing
 */
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const { visualizeMargins } = require('./utils/pdf/debug');

// Create the PDF document
const doc = new PDFDocument({
  margins: {
    top: 72,
    bottom: 72,
    left: 72,
    right: 72,
  },
});

// Create an output stream
const outputPath = path.join(__dirname, '..', 'isolated-list-test.pdf');
const outputStream = fs.createWriteStream(outputPath);

// Pipe the PDF to the output stream
doc.pipe(outputStream);

console.log('Testing isolated list item rendering...');

// Set up content width calculation (same as in production code)
const contentWidth =
  doc.page.width - doc.page.margins.left - doc.page.margins.right;
const leftMargin = doc.page.margins.left;

// Visualize margins
visualizeMargins(doc, { fillBackground: true });

// Add a title
doc.fontSize(16).font('Helvetica-Bold');
doc.text('Isolated List Rendering Test', leftMargin, 100);
doc.moveDown(1);

// Reset to body font
doc.fontSize(12).font('Helvetica');
doc.text(
  'The list items below should render with proper text flow - no vertical stacking.'
);
doc.moveDown(1);

// Test 1: Bullet list item using the proven pattern
doc.fontSize(12).font('Helvetica');
doc.text('Test 1: Basic bullet list item:', leftMargin, doc.y);
doc.moveDown(0.5);

// Render a bullet list item directly using the proven pattern
const bulletWidth = 15;
doc.fontSize(12).font('Helvetica');
doc.text('• ', leftMargin, doc.y, {
  continued: true,
  width: bulletWidth,
  align: 'left',
  lineBreak: false,
});

doc.text(
  'This is a bullet list item with text that should flow properly and wrap naturally to the next line without any vertical stacking issues.',
  {
    continued: false,
    width: contentWidth - bulletWidth,
    align: 'left',
    lineBreak: true,
  }
);

doc.moveDown(1);

// Test 2: Numbered list item
doc.text('Test 2: Basic numbered list item:', leftMargin, doc.y);
doc.moveDown(0.5);

// Render a numbered list item directly
const numberWidth = 25;
doc.fontSize(12).font('Helvetica');
doc.text('1. ', leftMargin, doc.y, {
  continued: true,
  width: numberWidth,
  align: 'left',
  lineBreak: false,
});

doc.text(
  'This is a numbered list item with text that should flow properly and wrap naturally to the next line without any vertical stacking issues.',
  {
    continued: false,
    width: contentWidth - numberWidth,
    align: 'left',
    lineBreak: true,
  }
);

doc.moveDown(1);

// Test 3: Longer number (to ensure width is appropriate)
doc.text('Test 3: Longer numbered list item:', leftMargin, doc.y);
doc.moveDown(0.5);

// Render a numbered list item with a longer number
const longerNumberWidth = 25;
doc.fontSize(12).font('Helvetica');
doc.text('10. ', leftMargin, doc.y, {
  continued: true,
  width: longerNumberWidth,
  align: 'left',
  lineBreak: false,
});

doc.text(
  'This is a numbered list item with a two-digit number that should also flow properly and wrap naturally without any stacking issues.',
  {
    continued: false,
    width: contentWidth - longerNumberWidth,
    align: 'left',
    lineBreak: true,
  }
);

doc.moveDown(1);

// Test 4: With string width calculation
doc.text('Test 4: Using string width calculation:', leftMargin, doc.y);
doc.moveDown(0.5);

// Calculate the width of the prefix
const prefix = '1. ';
const calculatedWidth = Math.max(25, doc.widthOfString(prefix) + 5);

doc.fontSize(12).font('Helvetica');
doc.text(prefix, leftMargin, doc.y, {
  continued: true,
  width: calculatedWidth,
  align: 'left',
  lineBreak: false,
});

doc.text(
  'This is a numbered list item using dynamic width calculation based on the actual prefix width, which should produce better results.',
  {
    continued: false,
    width: contentWidth - calculatedWidth,
    align: 'left',
    lineBreak: true,
  }
);

// Finalize the PDF
doc.end();

// Log completion
outputStream.on('finish', () => {
  console.log(`Isolated list test PDF saved to ${outputPath}`);
  console.log('Check this PDF to verify proper list item rendering.');
});

outputStream.on('error', (err) => {
  console.error('Error generating isolated list test PDF:', err);
});
