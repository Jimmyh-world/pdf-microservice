/**
 * Test script specifically for list rendering issues
 * This generates a simple PDF with various list types to verify rendering fixes
 */
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const { renderMarkdownToPdf } = require('./utils/pdf/markdownRenderer');

// Create a test markdown with variations of list types
const testMarkdown = `---
title: 'List Rendering Test'
author: 'Debug Tester'
---

# List Rendering Test

## Regular Bullet Lists

- Short bullet item
- Medium length bullet item that should wrap properly
- Very long bullet item that definitely needs to wrap to multiple lines and should display correctly without any vertical stacking of text characters

## Numbered Lists

1. First numbered item
2. Second numbered item with medium length
3. Third numbered item with a very long description that should wrap properly to multiple lines without any vertical stacking issues that we were experiencing before

## Mixed List With Links

- [Link item](https://example.com)
- Regular item
- Item with [embedded link](https://example.com)

## Indented Lists

- First level
  - Second level
    - Third level
      - Fourth level with longer text that should wrap properly and not stack vertically

1. Numbered first level
   1. Numbered second level
      1. Numbered third level with longer text that should wrap properly and stay horizontal

## Lists With Formatting

- **Bold item**
- *Italic item*
- Item with **bold** and *italic* mixed
- \`Code item\` with monospace font

## Paragraph After Lists

This is a normal paragraph after lists. It should render properly with appropriate spacing.
`;

// Create the PDF document
const doc = new PDFDocument({
  margins: {
    top: 72,
    bottom: 72,
    left: 72,
    right: 72,
  },
  info: {
    Title: 'List Rendering Test',
    Author: 'Debug Tester',
  },
});

// Create an output stream
const outputPath = path.join(__dirname, '..', 'list-rendering-test.pdf');
const outputStream = fs.createWriteStream(outputPath);

// Pipe the PDF to the output stream
doc.pipe(outputStream);

console.log('Generating list rendering test PDF...');

// Render markdown
console.log('Rendering markdown content...');
renderMarkdownToPdf(testMarkdown, doc);

// Finalize the PDF
console.log('Finalizing PDF...');
doc.end();

outputStream.on('finish', () => {
  console.log(`Test PDF saved to ${outputPath}`);
});

outputStream.on('error', (err) => {
  console.error('Error generating test PDF:', err);
});
