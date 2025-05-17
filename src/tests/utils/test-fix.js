/**
 * Test script to debug PDF rendering issues
 * This generates a simple PDF with the problematic TOC element to help diagnose issues
 */
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const { renderMarkdownToPdf, createCoverPage } = require('./utils/pdfRenderer');

// Use minimal test content focusing on TOC and list issues
const testMarkdown = `---
title: 'Test Document'
author: 'Debug Tester'
---

# Table of Contents

1. [Introduction](#intro)
2. [Section One](#section1)
3. [Section Two](#section2)

---

# Introduction
<a name="intro"></a>

This is a test document to debug PDF rendering issues.

# Section One
<a name="section1"></a>

This is section one content with lists:

- List item 1
- List item 2 
- List item 3
- List item with longer text that should wrap properly to the next line without creating a vertical column

1. Numbered item 1
2. Numbered item 2
3. Numbered item with longer text that should wrap properly to the next line without creating a vertical column

## Subsection

This is a paragraph with some text.

# Section Two
<a name="section2"></a>

This is section two content.

\`\`\`
Code Example
function test() {
  console.log("Hello world");
}
\`\`\`
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
    Title: 'Test Document',
    Author: 'Debug Tester',
  },
});

// Create an output stream
const outputPath = path.join(__dirname, '..', 'debug-output.pdf');
const outputStream = fs.createWriteStream(outputPath);

// Pipe the PDF to the output stream
doc.pipe(outputStream);

console.log('Generating test PDF...');

// Create cover page
const metadata = {
  title: 'Test Document',
  author: 'Debug Tester',
};
createCoverPage(metadata, doc);

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
