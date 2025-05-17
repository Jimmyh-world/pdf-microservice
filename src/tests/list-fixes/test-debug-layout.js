/**
 * Test script to debug PDF layout issues
 * This visualizes margins and page breaks to help diagnose rendering problems
 */
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const { renderMarkdownToPdf } = require('./utils/pdf/markdownRenderer');
const { createCoverPage } = require('./utils/pdf/pageElements');
const {
  monitorPageBreaks,
  visualizeMargins,
  safeAddPage,
  logPosition,
} = require('./utils/pdf/debug');

// Use minimal test content focusing on common rendering issues
const testMarkdown = `---
title: 'Debug Layout Test'
author: 'Layout Analyzer'
---

# Layout Debugging Document

This document helps diagnose issues with:

1. Margin visualization
2. Page break detection
3. Text flow problems
4. Content positioning

## Lists (Common Problem Area)

- List item 1 with standard text
- List item 2 with longer text that should wrap properly to the next line without creating a vertical stacking effect
- List item 3 with [link](https://example.com)

1. Numbered item 1
2. Numbered item 2 with longer text that should properly wrap to the next line without creating any vertical stacking issues

## Table of Contents Simulation

1. [First Section](#first)
2. [Second Section with longer text that needs to wrap properly](#second)
3. [Third Section](#third)

- [Appendix A](#appendix-a)
- [Appendix B with longer title](#appendix-b)

## Blockquotes

> This is a blockquote that tests the indentation and proper text wrapping within a blockquote element. It should display properly without any strange formatting issues.

## Code Blocks

\`\`\`
function testLayout() {
  console.log("This code block tests proper spacing and font rendering");
  return "Code blocks often reveal page break issues";
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
    Title: 'Debug Layout Test',
    Author: 'Layout Analyzer',
  },
});

// Create an output stream
const outputPath = path.join(__dirname, '..', 'debug-layout-test.pdf');
const outputStream = fs.createWriteStream(outputPath);

// Pipe the PDF to the output stream
doc.pipe(outputStream);

console.log('Generating debug layout test PDF...');

// Set up debugging helpers
monitorPageBreaks(doc);

// Create cover page
const metadata = {
  title: 'Debug Layout Test',
  author: 'Layout Analyzer',
};

// Start with margin visualization
visualizeMargins(doc, { fillBackground: true, borderColor: '#ff0000' });

// Create cover page
createCoverPage(metadata, doc);

// Visualize margins on the content page
visualizeMargins(doc, { fillBackground: true });

// Log position before rendering content
logPosition(doc, 'Before rendering markdown');

// Render markdown
console.log('Rendering markdown content...');
renderMarkdownToPdf(testMarkdown, doc);

// Log final position
logPosition(doc, 'After rendering markdown');

// Finalize the PDF
console.log('Finalizing PDF...');
doc.end();

outputStream.on('finish', () => {
  console.log(`Test PDF saved to ${outputPath}`);
});

outputStream.on('error', (err) => {
  console.error('Error generating test PDF:', err);
});
