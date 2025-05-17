/**
 * Full Markdown to PDF rendering test
 * Tests the entire pipeline with lists and different content types
 */
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const { renderMarkdownToPdf } = require('./utils/pdf/markdownRenderer');

// Sample markdown with various list types
const markdown = `
# Full Rendering Test

This document tests various list types and formatting to ensure proper rendering.

## Bullet Lists

Simple bullet list:

* Item one
* Item two
* Item three with longer text that should wrap to the next line and demonstrate proper flow without vertical stacking issues

Nested bullet list:

* Parent item 1
  * Child item A
  * Child item B with some longer text that will demonstrate wrapping behavior
* Parent item 2
  * Child item X
  * Child item Y

## Numbered Lists

Simple numbered list:

1. First item
2. Second item
3. Third item with longer text that should wrap to the next line and demonstrate proper flow without vertical stacking issues

Mixed list:

1. First numbered item
   * Bullet subitem A
   * Bullet subitem B
2. Second numbered item
   * Another bullet point with longer text that should wrap properly

## Table of Contents Test

This document also tests proper ToC rendering:

1. [Introduction](#introduction)
2. [Implementation Details](#implementation-details)
3. [A very long table of contents entry that should wrap properly without vertical stacking issues](#very-long-entry)

## Various Text Formatting

This paragraph has **bold text** and *italic text* and \`code\` elements to ensure that the font handling is working properly throughout the document.

> This is a blockquote that should be properly formatted and demonstrate that other markdown elements are still rendering correctly.

## Code Block

\`\`\`javascript
// This is a code block
function testFunction() {
  console.log("Hello world!");
  return true;
}
\`\`\`

## Special Cases

* List item with special characters: @#$%^&*()
* List item with a URL: https://example.com
* List item with inline code: \`const x = 5;\`

---

End of test document.
`;

// Create the output path
const outputPath = path.join(__dirname, '..', 'full-rendering-test.pdf');

// Create the PDF document
const doc = new PDFDocument({
  margins: {
    top: 72,
    bottom: 72,
    left: 72,
    right: 72,
  },
  info: {
    Title: 'Full Rendering Test',
    Author: 'PDF Microservice',
    Subject: 'Testing list rendering fixes',
  },
});

// Create an output stream
const outputStream = fs.createWriteStream(outputPath);

// Pipe the PDF to the output stream
doc.pipe(outputStream);

console.log('Starting full rendering test...');

// Render the markdown to PDF
renderMarkdownToPdf(markdown, doc);

// Finalize the PDF
doc.end();

// Log completion
outputStream.on('finish', () => {
  console.log(`Full rendering test PDF saved to ${outputPath}`);
  console.log('Check this PDF to verify that all content renders correctly.');
});

outputStream.on('error', (err) => {
  console.error('Error in full rendering test:', err);
});
