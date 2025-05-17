/**
 * Font-based list rendering test
 * Tests the list rendering with different fonts and font sizes
 */
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const {
  renderBulletListItem,
  renderNumberedListItem,
} = require('./utils/pdf/renderers/lists');

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
const outputPath = path.join(__dirname, '..', 'font-list-test.pdf');
const outputStream = fs.createWriteStream(outputPath);

// Pipe the PDF to the output stream
doc.pipe(outputStream);

console.log('Testing list rendering with different fonts...');

// Set up content width calculation
const contentWidth =
  doc.page.width - doc.page.margins.left - doc.page.margins.right;
const leftMargin = doc.page.margins.left;

// Add heading
doc.fontSize(16).font('Helvetica-Bold');
doc.text('Font-Based List Rendering Test', leftMargin, 72);
doc.moveDown(1);

// Test with different fonts
const fonts = [
  { name: 'Helvetica', style: 'default' },
  { name: 'Helvetica-Bold', style: 'bold' },
  { name: 'Helvetica-Oblique', style: 'italic' },
  { name: 'Times-Roman', style: 'serif' },
  { name: 'Times-Bold', style: 'serif bold' },
  { name: 'Courier', style: 'monospace' },
];

const fontSizes = [8, 10, 12, 14, 16];
const testContent =
  'This is a test list item with the single text call approach to verify that text flows correctly without vertical stacking.';

// Standard spacing object
const spacing = {
  list: 0.5,
  listWithUrl: 0.8,
};

// Loop through fonts and render list items
fonts.forEach((font, fontIndex) => {
  // Add a section title
  doc.fontSize(14).font('Helvetica-Bold');
  doc.text(`Font: ${font.name} (${font.style})`, leftMargin, doc.y);
  doc.moveDown(0.5);

  // Create a theme object with the current font
  const theme = {
    fonts: {
      body: font.name,
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

  // Render a bullet list item
  doc.fontSize(12).font('Helvetica');
  doc.text('Bullet list with different font sizes:', leftMargin, doc.y);
  doc.moveDown(0.5);

  // Test with different font sizes
  fontSizes.forEach((fontSize) => {
    theme.fontSize.body = fontSize;
    renderBulletListItem(
      doc,
      `[${fontSize}pt] ${testContent}`,
      leftMargin,
      doc.y,
      contentWidth,
      false,
      theme,
      spacing
    );
  });

  doc.moveDown(0.5);

  // Render a numbered list item
  doc.fontSize(12).font('Helvetica');
  doc.text('Numbered list with different font sizes:', leftMargin, doc.y);
  doc.moveDown(0.5);

  // Reset font size for the theme
  theme.fontSize.body = 12;

  // Test with different font sizes
  fontSizes.forEach((fontSize, i) => {
    theme.fontSize.body = fontSize;
    renderNumberedListItem(
      doc,
      `[${fontSize}pt] ${testContent}`,
      (i + 1).toString(),
      leftMargin,
      doc.y,
      contentWidth,
      false,
      theme,
      spacing
    );
  });

  // Add a page break between font types (except for the last one)
  if (fontIndex < fonts.length - 1) {
    doc.addPage();
  }
});

// Finalize the PDF
doc.end();

// Log completion
outputStream.on('finish', () => {
  console.log(`Font-based list test PDF saved to ${outputPath}`);
  console.log(
    'Check this PDF to verify that all font combinations render correctly.'
  );
});

outputStream.on('error', (err) => {
  console.error('Error generating font list test PDF:', err);
});
