/**
 * List Styles Test - Tests different list styles with the updated fix
 * This test specifically focuses on various list formats to verify the fix
 */
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const { renderMarkdownToPdf } = require('./utils/pdf/markdownRenderer');

// Create markdown with various list styles to test every case
const markdown = `
# List Styles Test

This document tests different list styles to verify our fixes.

## Standard Lists

### Bullet Lists

* Simple item
* Item with **bold** and *italic* text
* Item with \`inline code\`
* A longer bullet list item that will wrap to multiple lines to demonstrate that the text flows properly without vertical stacking issues
* Item with special characters: @#$%^&*()
* Item with a URL: https://example.com

### Numbered Lists

1. First item
2. Second item with **bold** text
3. Third item with *italic* text
4. Fourth item with \`inline code\`
5. A longer numbered list item that will wrap to multiple lines to demonstrate that the text flows properly without vertical stacking issues
6. Item with special characters: @#$%^&*()
7. Item with a URL: https://example.com
8. Item with a very long number: 8888888888888888888.

## Nested Lists

### Nested Bullet Lists

* Parent item 1
  * Child item A
  * Child item B
    * Grandchild item I
    * Grandchild item II with longer text that demonstrates wrapping
  * Child item C
* Parent item 2
  * Child item X
  * Child item Y

### Nested Numbered Lists

1. First level item 1
   1. Second level item 1.1
   2. Second level item 1.2
      1. Third level item 1.2.1
      2. Third level item 1.2.2
   3. Second level item 1.3
2. First level item 2
   1. Second level item 2.1
   2. Second level item 2.2

### Mixed Nested Lists

1. Numbered parent 1
   * Bullet child A
   * Bullet child B
     1. Numbered grandchild I
     2. Numbered grandchild II
   * Bullet child C
2. Numbered parent 2
   * Bullet child X
     * Bullet grandchild α
     * Bullet grandchild β
   * Bullet child Y

## Table of Contents Style

### Simple TOC

1. [Introduction](#intro)
2. [Methods](#methods)
3. [Results](#results)
4. [Discussion](#discussion)

### Complex TOC with Nesting

1. [Introduction](#intro)
   1.1 [Background](#background)
   1.2 [Research Questions](#questions)
2. [Methods](#methods)
   2.1 [Study Design](#design)
   2.2 [Data Collection](#data)
      2.2.1 [Instruments](#instruments)
      2.2.2 [Procedures](#procedures)
   2.3 [Analysis](#analysis)
3. [Results](#results)
   3.1 [Primary Outcomes](#primary)
   3.2 [Secondary Outcomes](#secondary)
4. [A very long table of contents entry that should wrap properly without vertical stacking issues](#verylong)

## Edge Cases

### List Items with Code Blocks

* Item with code block:

\`\`\`javascript
function test() {
  console.log("This is a test");
}
\`\`\`

* Another regular item after code block

### List Items with Blockquotes

* Item with blockquote:

> This is a blockquote inside a list item
> It should be properly indented and formatted

* Another regular item after blockquote

### Extremely Long Items

* An extremely long bullet point with no natural breaks that should still properly wrap and not cause vertical stacking issues. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.

1. An extremely long numbered item with no natural breaks that should still properly wrap and not cause vertical stacking issues. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.

`;

// Create the output path
const outputPath = path.join(__dirname, '..', 'list-styles-test.pdf');

// Create the PDF document
const doc = new PDFDocument({
  margins: {
    top: 72,
    bottom: 72,
    left: 72,
    right: 72,
  },
  info: {
    Title: 'List Styles Test',
    Author: 'PDF Microservice',
    Subject: 'Testing list rendering fixes',
  },
});

// Create an output stream
const outputStream = fs.createWriteStream(outputPath);

// Pipe the PDF to the output stream
doc.pipe(outputStream);

console.log('Running list styles test...');

// Render the markdown to PDF
renderMarkdownToPdf(markdown, doc);

// Finalize the PDF
doc.end();

// Log completion
outputStream.on('finish', () => {
  console.log(`List styles test PDF saved to ${outputPath}`);
  console.log(
    'Check this PDF to verify that all list styles render correctly.'
  );
});

outputStream.on('error', (err) => {
  console.error('Error generating list styles test PDF:', err);
});
