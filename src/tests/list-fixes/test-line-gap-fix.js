/**
 * Test script for line gap fix in list rendering
 * Visualizes text baseline and line gap effects on list rendering
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
const outputPath = path.join(__dirname, '..', 'line-gap-fix-test.pdf');
const outputStream = fs.createWriteStream(outputPath);

// Pipe the PDF to the output stream
doc.pipe(outputStream);

console.log('Testing line gap fix in list rendering...');

// Set up content width calculation
const contentWidth =
  doc.page.width - doc.page.margins.left - doc.page.margins.right;
const leftMargin = doc.page.margins.left;

// Visualize margins
visualizeMargins(doc, { fillBackground: true });

// Add a title
doc.fontSize(16).font('Helvetica-Bold');
doc.text('Line Gap Fix Test', leftMargin, 100);
doc.moveDown(1);

// Reset to body font
doc.fontSize(12).font('Helvetica');
doc.text('This test demonstrates how line gap control affects list rendering.');
doc.moveDown(1);

// Function to draw a box around the current line to visualize rendering
function drawTextBox(x, y, width, height, label) {
  doc.save();
  doc.strokeColor('#bbbbbb').lineWidth(0.5);
  doc.rect(x, y, width, height).stroke();

  // Add a small label
  doc.fillColor('#999999').fontSize(8);
  doc.text(label, x + 2, y - 10, { width: 100 });

  doc.restore();
}

// Test 1: Without line gap control (PROBLEMATIC)
doc.fontSize(12).font('Helvetica-Bold');
doc.text('Test 1: WITHOUT line gap fix (problematic)', leftMargin, doc.y);
doc.moveDown(0.5);
doc.font('Helvetica');

const bulletWidth = 15;
const lineHeight = doc.currentLineHeight();

// Draw a box around where the text will be
drawTextBox(
  leftMargin,
  doc.y,
  contentWidth,
  lineHeight * 2.5,
  'Without lineGap(0)'
);

// Render without explicit line gap control
doc.fontSize(12).font('Helvetica');
const startY1 = doc.y;

doc.text('• ', leftMargin, doc.y, {
  continued: true,
  width: bulletWidth,
  align: 'left',
  lineBreak: false,
  // No lineGap: 0 - potential for misalignment
});

doc.text(
  'This is a bullet list item rendered WITHOUT lineGap(0) control. In some fonts and sizing scenarios, this might lead to vertical stacking issues when PDFKit decides to adjust the baseline.',
  {
    continued: false,
    width: contentWidth - bulletWidth,
    align: 'left',
    lineBreak: true,
  }
);

doc.moveDown(1.5);

// Test 2: WITH line gap control (FIXED)
doc.fontSize(12).font('Helvetica-Bold');
doc.text('Test 2: WITH line gap fix (correct)', leftMargin, doc.y);
doc.moveDown(0.5);
doc.font('Helvetica');

// Draw a box around where the text will be
drawTextBox(
  leftMargin,
  doc.y,
  contentWidth,
  lineHeight * 2.5,
  'With lineGap(0)'
);

// Render with explicit line gap control
doc.fontSize(12).font('Helvetica').lineGap(0); // CRITICAL FIX
const startY2 = doc.y;

doc.text('• ', leftMargin, doc.y, {
  continued: true,
  width: bulletWidth,
  align: 'left',
  lineBreak: false,
  lineGap: 0, // CRITICAL FIX
});

doc.text(
  'This is a bullet list item rendered WITH lineGap(0) control. This ensures the text flows correctly on a consistent baseline without vertical stacking issues, regardless of font or sizing.',
  {
    continued: false,
    width: contentWidth - bulletWidth,
    align: 'left',
    lineBreak: true,
  }
);

// Restore line gap
doc.lineGap(2);
doc.moveDown(1.5);

// Test 3: Visual comparison with longer content
doc.fontSize(12).font('Helvetica-Bold');
doc.text('Test 3: Direct comparison with wrapping text', leftMargin, doc.y);
doc.moveDown(0.5);
doc.font('Helvetica');

// WITHOUT fix
drawTextBox(leftMargin, doc.y, contentWidth, lineHeight * 3, 'Problem case');

doc.fontSize(12).font('Helvetica');
doc.text('1. ', leftMargin, doc.y, {
  continued: true,
  width: 20,
  align: 'left',
  lineBreak: false,
  // No lineGap: 0
});

doc.text(
  'This longer item with multiple lines should demonstrate how without proper line gap control, text wrapping can sometimes cause vertical stacking issues especially with certain fonts and sizes.',
  {
    continued: false,
    width: contentWidth - 20,
    align: 'left',
    lineBreak: true,
  }
);

doc.moveDown(1.5);

// WITH fix
drawTextBox(leftMargin, doc.y, contentWidth, lineHeight * 3, 'Fixed case');

doc.fontSize(12).font('Helvetica').lineGap(0); // CRITICAL FIX
doc.text('1. ', leftMargin, doc.y, {
  continued: true,
  width: 20,
  align: 'left',
  lineBreak: false,
  lineGap: 0, // CRITICAL FIX
});

doc.text(
  'This longer item with multiple lines should demonstrate how with proper line gap control, text wrapping works correctly in all cases regardless of font or sizing differences.',
  {
    continued: false,
    width: contentWidth - 20,
    align: 'left',
    lineBreak: true,
  }
);

// Restore line gap
doc.lineGap(2);
doc.moveDown(1.5);

// Test 4: Different fonts
doc.fontSize(12).font('Helvetica-Bold');
doc.text('Test 4: Different fonts with line gap control', leftMargin, doc.y);
doc.moveDown(0.5);

// Draw a box around where the text will be
drawTextBox(
  leftMargin,
  doc.y,
  contentWidth,
  lineHeight * 2.5,
  'Mixed fonts with lineGap(0)'
);

// Render with explicit line gap control but different fonts
doc.lineGap(0); // CRITICAL FIX

doc.font('Helvetica-Bold').text('• ', leftMargin, doc.y, {
  continued: true,
  width: bulletWidth,
  align: 'left',
  lineBreak: false,
  lineGap: 0, // CRITICAL FIX
});

doc
  .font('Helvetica')
  .text(
    'This demonstrates that even with different fonts for the bullet/prefix and content, proper line gap control ensures correct text flow.',
    {
      continued: false,
      width: contentWidth - bulletWidth,
      align: 'left',
      lineBreak: true,
    }
  );

// Restore line gap
doc.lineGap(2);

// Finalize the PDF
doc.end();

// Log completion
outputStream.on('finish', () => {
  console.log(`Line gap fix test PDF saved to ${outputPath}`);
  console.log(
    'Check this PDF to visualize how line gap control prevents vertical stacking.'
  );
});

outputStream.on('error', (err) => {
  console.error('Error generating line gap fix test PDF:', err);
});
