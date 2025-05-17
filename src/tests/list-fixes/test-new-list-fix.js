/**
 * Test script for the updated list rendering implementation
 */
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const { visualizeMargins } = require('../../utils/pdf/debug');
const {
  renderBulletListItem,
  renderNumberedListItem,
  renderTocListItem,
} = require('../../utils/pdf/renderers/lists');

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
const outputPath = path.join(__dirname, '../../../', 'new-list-fix-test.pdf');
const outputStream = fs.createWriteStream(outputPath);

// Pipe the PDF to the output stream
doc.pipe(outputStream);

console.log('Testing updated list rendering implementation...');

// Set up theme and spacing
const theme = {
  fonts: {
    body: 'Helvetica',
    heading: 'Helvetica-Bold',
  },
  fontSize: {
    body: 12,
    heading: 16,
  },
  spacing: {
    lineGap: 2,
  },
};

const spacing = {
  list: 0.5,
  listWithUrl: 0.8,
};

// Set up content width calculation
const contentWidth =
  doc.page.width - doc.page.margins.left - doc.page.margins.right;
const leftMargin = doc.page.margins.left;

// Visualize margins
visualizeMargins(doc, { fillBackground: true });

// Add a title
doc.fontSize(theme.fontSize.heading).font(theme.fonts.heading);
doc.text('Updated List Rendering Test', leftMargin, 100);
doc.moveDown(1);

// Reset to body font and add introduction
doc.fontSize(theme.fontSize.body).font(theme.fonts.body);
doc.text('This test demonstrates the fixed list rendering implementation:');
doc.moveDown(1);

// Test bullet lists
doc.fontSize(theme.fontSize.body).font(theme.fonts.heading);
doc.text('1. Bullet List Items:', leftMargin, doc.y);
doc.moveDown(0.5);

// Draw a box to visualize the list area
doc.rect(leftMargin, doc.y, contentWidth, 100).strokeColor('#dddddd').stroke();

// Simple bullet item
renderBulletListItem(
  doc,
  'Simple bullet list item',
  leftMargin,
  doc.y,
  contentWidth,
  false,
  theme,
  spacing
);

// Bullet item with longer text
renderBulletListItem(
  doc,
  'This is a longer bullet list item that should wrap to multiple lines and demonstrate that the text flows properly without vertical stacking issues.',
  leftMargin,
  doc.y,
  contentWidth,
  false,
  theme,
  spacing
);

// Bullet item with special characters
renderBulletListItem(
  doc,
  'Item with special characters: @#$%^&*()',
  leftMargin,
  doc.y,
  contentWidth,
  false,
  theme,
  spacing
);

doc.moveDown(1);

// Test numbered lists
doc.fontSize(theme.fontSize.body).font(theme.fonts.heading);
doc.text('2. Numbered List Items:', leftMargin, doc.y);
doc.moveDown(0.5);

// Draw a box to visualize the list area
doc.rect(leftMargin, doc.y, contentWidth, 100).strokeColor('#dddddd').stroke();

// Simple numbered item
renderNumberedListItem(
  doc,
  'Simple numbered list item',
  '1.',
  leftMargin,
  doc.y,
  contentWidth,
  false,
  theme,
  spacing
);

// Numbered item with longer text
renderNumberedListItem(
  doc,
  'This is a longer numbered list item that should wrap to multiple lines and demonstrate that the text flows properly without vertical stacking issues.',
  '2.',
  leftMargin,
  doc.y,
  contentWidth,
  false,
  theme,
  spacing
);

// Numbered item with special characters
renderNumberedListItem(
  doc,
  'Item with special characters: @#$%^&*()',
  '3.',
  leftMargin,
  doc.y,
  contentWidth,
  false,
  theme,
  spacing
);

doc.moveDown(1);

// Test TOC list items
doc.fontSize(theme.fontSize.body).font(theme.fonts.heading);
doc.text('3. Table of Contents Items:', leftMargin, doc.y);
doc.moveDown(0.5);

// Draw a box to visualize the list area
doc.rect(leftMargin, doc.y, contentWidth, 100).strokeColor('#dddddd').stroke();

// Simple TOC item
renderTocListItem(
  doc,
  'Simple TOC item',
  '1.',
  leftMargin,
  doc.y,
  contentWidth,
  theme,
  0.5
);

// TOC item with longer text
renderTocListItem(
  doc,
  'This is a longer TOC item that should wrap to multiple lines and demonstrate that the text flows properly without vertical stacking issues.',
  '2.',
  leftMargin,
  doc.y,
  contentWidth,
  theme,
  0.5
);

// TOC item with special prefix
renderTocListItem(
  doc,
  'TOC item with bullet prefix',
  '• ',
  leftMargin,
  doc.y,
  contentWidth,
  theme,
  0.5
);

// Finalize the PDF
doc.end();

// Log completion
outputStream.on('finish', () => {
  console.log(`Updated list rendering test PDF saved to ${outputPath}`);
  console.log(
    'Check this PDF to verify that vertical stacking issues are resolved.'
  );
});

outputStream.on('error', (err) => {
  console.error('Error generating updated list rendering test PDF:', err);
});
